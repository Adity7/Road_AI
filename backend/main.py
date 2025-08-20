
import asyncio
import multiprocessing
import time
import uuid
import json
import shutil
from typing import Dict, List, Any, Literal
from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import logging
import cv2
import os
import torch
from ultralytics import YOLO

# --- Logging and Directory Configuration ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def ensure_directory(path: str) -> str:
    """Ensure a directory exists. If a file with the same name exists, use a suffixed directory.

    Returns the path of the ensured directory (original or suffixed).
    """
    if os.path.exists(path):
        if os.path.isdir(path):
            return path
        # A file exists with this name; fall back to a suffixed directory
        fallback = f"{path}_data"
        os.makedirs(fallback, exist_ok=True)
        logger.warning(f"Path '{path}' exists as a file; using '{fallback}' instead.")
        return fallback
    os.makedirs(path, exist_ok=True)
    return path

SAMPLE_DATA_DIR = ensure_directory("sample_data")
RESULTS_DIR = ensure_directory("results")

# --- Pydantic Models for API Data Structure (No changes) ---
class AIModelConfig(BaseModel):
    model_name: str = Field(..., description="Name of the AI model to run (e.g., 'yolov8n.pt').")
    model_path: str | None = Field(None, description="Optional path for custom models.")

class StreamInput(BaseModel):
    source: str = Field(..., description="Video source (e.g., file path, RTSP URL, camera index).")
    models: List[AIModelConfig] = Field(..., description="List of AI models to run on this stream.")
    mode: Literal['realtime', 'batch'] = Field('realtime', description="Processing mode.")
    output_path: str | None = Field(None, description="File path to save results in batch mode (e.g., 'results/output.json').")

class StreamInfo(BaseModel):
    id: str
    source: str
    status: str
    mode: str
    output_path: str | None = None
    pid: int | None = None
    models: List[AIModelConfig]

# --- Real AI Model: YOLOv8 Object Detection (No changes) ---
class YOLOModel:
    def __init__(self, config: AIModelConfig):
        self.model_name = config.model_name
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        logger.info(f"Initializing YOLO model: {self.model_name} on device: {self.device}")
        self.model = YOLO(self.model_name)
        self.model.to(self.device)

    def infer(self, frame):
        results = self.model(frame, verbose=False)
        detections = []
        result = results[0]
        boxes = result.boxes
        for box in boxes:
            xyxy = box.xyxy[0].tolist()
            conf = box.conf[0].item()
            class_id = int(box.cls[0].item())
            label = self.model.names[class_id]
            detections.append({
                "label": label,
                "confidence": round(conf, 2),
                "bbox": [int(coord) for coord in xyxy]
            })
        return detections

# --- Video Stream Processor (Fixed multiprocessing issue) ---
def stream_processor(stream_id: str, source: str, model_configs: List[Dict], 
                     results_dict, 
                     status_dict,
                     mode: str, output_path: str | None):
    pid = os.getpid()
    logger.info(f"[Stream {stream_id} | PID {pid}] Starting processor for source: {source} in '{mode}' mode.")
    status_dict[stream_id] = {"status": "initializing", "pid": pid, "progress": 0}
    try:
        models = [YOLOModel(AIModelConfig(**config)) for config in model_configs]
        capture_source = int(source) if source.isdigit() else source
        cap = cv2.VideoCapture(capture_source)
        if not cap.isOpened(): raise IOError(f"Cannot open video source: {source}")
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) if mode == 'batch' else 0
        logger.info(f"[Stream {stream_id} | PID {pid}] Successfully opened source.")
        status_dict[stream_id] = {"status": f"running_{mode}", "pid": pid, "progress": 0}
        frame_count = 0
        batch_results = []
        while True:
            ret, frame = cap.read()
            if not ret: break
            all_results = {}
            for model in models:
                model_results = model.infer(frame)
                all_results[model.model_name] = model_results
            frame_result = {"timestamp": time.time(), "frame": frame_count, "results": all_results}
            if mode == 'realtime':
                results_dict[stream_id] = frame_result
            elif mode == 'batch':
                batch_results.append(frame_result)
                progress = round((frame_count + 1) / total_frames * 100) if total_frames > 0 else 0
                status_dict[stream_id] = {"status": f"running_{mode}", "pid": pid, "progress": progress}
            frame_count += 1
        if mode == 'batch':
            logger.info(f"[Stream {stream_id} | PID {pid}] Batch processing complete.")
            status_dict[stream_id] = {"status": "saving", "pid": pid, "progress": 100}
            if output_path:
                os.makedirs(os.path.dirname(output_path), exist_ok=True)
                with open(output_path, 'w') as f: json.dump(batch_results, f, indent=2)
                logger.info(f"[Stream {stream_id} | PID {pid}] Results saved to {output_path}")
    except Exception as e:
        logger.error(f"[Stream {stream_id} | PID {pid}] An error occurred: {e}", exc_info=True)
        status_dict[stream_id] = {"status": "error", "pid": pid, "error": str(e), "progress": status_dict.get(stream_id, {}).get('progress', 0)}
    finally:
        if 'cap' in locals() and cap.isOpened(): cap.release()
        final_status = "completed" if mode == 'batch' and status_dict.get(stream_id, {}).get('status') != 'error' else "stopped"
        current_status = status_dict.get(stream_id, {})
        if current_status.get("status") != "error":
             status_dict[stream_id] = {"status": final_status, "pid": pid, "progress": 100}

# --- Stream Manager (Fixed multiprocessing issue) ---
class StreamManager:
    def __init__(self):
        self.manager = None
        self.streams: Dict[str, Any] = {}
        self.processes: Dict[str, multiprocessing.Process] = {}
        self.results: Dict[str, Any] = {}
        self.status: Dict[str, Any] = {}
    
    def _ensure_manager(self):
        if self.manager is None:
            self.manager = multiprocessing.Manager()
            self.streams = self.manager.dict()
            self.results = self.manager.dict()
            self.status = self.manager.dict()
    
    def add_stream(self, source: str, models: List[AIModelConfig], mode: str, output_path: str | None) -> str:
        self._ensure_manager()
        stream_id = str(uuid.uuid4())
        model_configs_dict = [model.dict() for model in models]
        process = multiprocessing.Process(target=stream_processor, args=(stream_id, source, model_configs_dict, self.results, self.status, mode, output_path))
        stream_info = {"id": stream_id, "source": source, "status": "starting", "mode": mode, "output_path": output_path, "pid": None, "models": model_configs_dict}
        self.streams[stream_id] = stream_info
        self.processes[stream_id] = process
        process.start()
        stream_info["pid"] = process.pid
        self.streams[stream_id] = stream_info
        return stream_id
    
    def remove_stream(self, stream_id: str) -> bool:
        if stream_id in self.processes:
            process = self.processes[stream_id]
            if process.is_alive(): process.terminate(); process.join(timeout=5)
            del self.processes[stream_id]
            if stream_id in self.streams: del self.streams[stream_id]
            if stream_id in self.results: del self.results[stream_id]
            if stream_id in self.status: del self.status[stream_id]
            return True
        return False
    
    def get_all_streams(self) -> List[Dict]:
        all_streams = []
        for stream_id, stream_info in self.streams.items():
            current_status = self.status.get(stream_id, {})
            stream_info_copy = dict(stream_info)
            stream_info_copy['status'] = current_status.get('status', stream_info_copy['status'])
            stream_info_copy['pid'] = current_status.get('pid', stream_info_copy['pid'])
            stream_info_copy['progress'] = current_status.get('progress', 0)
            all_streams.append(stream_info_copy)
        return all_streams
    
    def get_stream_results(self, stream_id: str) -> Dict | None: 
        return self.results.get(stream_id)
    
    def cleanup(self):
        for stream_id in list(self.processes.keys()): 
            self.remove_stream(stream_id)

# --- FastAPI App Initialization and Endpoints ---
app = FastAPI(title="Video Management System API", version="1.2.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# Initialize stream manager only when needed
stream_manager = None

def get_stream_manager():
    global stream_manager
    if stream_manager is None:
        stream_manager = StreamManager()
    return stream_manager

@app.on_event("shutdown")
def shutdown_event(): 
    if stream_manager:
        stream_manager.cleanup()

@app.get("/", tags=["Root"])
def read_root(): 
    return {"message": "Welcome to the VMS API with File Upload"}

# --- NEW: File Upload Endpoint ---
@app.post("/upload", tags=["Input"])
async def upload_file(file: UploadFile = File(...)):
    """
    Accepts a video/image file from the user and saves it to the server.
    Returns the path to the file for use in the /streams endpoint.
    """
    # Sanitize filename to prevent directory traversal attacks
    safe_filename = os.path.basename(file.filename)
    file_path = os.path.join(SAMPLE_DATA_DIR, safe_filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        logger.info(f"Successfully uploaded file: {safe_filename}")
    except Exception as e:
        logger.error(f"Failed to upload file {safe_filename}: {e}")
        raise HTTPException(status_code=500, detail=f"Could not save file: {e}")
    
    return {"file_path": file_path}

# --- Updated Stream Creation Endpoint ---
@app.post("/streams", status_code=201, response_model=StreamInfo, tags=["Streams"])
def create_stream(stream_input: StreamInput):
    if stream_input.mode == 'batch' and not stream_input.output_path:
        raise HTTPException(status_code=400, detail="output_path is required for batch mode")
    manager = get_stream_manager()
    stream_id = manager.add_stream(stream_input.source, stream_input.models, stream_input.mode, stream_input.output_path)
    time.sleep(1)
    stream_info = manager.streams.get(stream_id, {})
    if not stream_info: raise HTTPException(status_code=500, detail="Failed to create stream.")
    latest_status = manager.status.get(stream_id, {})
    stream_info['status'] = latest_status.get('status', 'starting')
    stream_info['pid'] = latest_status.get('pid')
    return StreamInfo(**stream_info)

# --- Other Endpoints (No changes) ---
@app.get("/streams", response_model=List[StreamInfo], tags=["Streams"])
def list_streams():
    manager = get_stream_manager()
    streams_data = manager.get_all_streams()
    response = [StreamInfo(**s_data) for s_data in streams_data]
    return response

@app.get("/streams/{stream_id}/results", tags=["Streams"])
def get_results(stream_id: str):
    manager = get_stream_manager()
    if stream_id not in manager.streams: raise HTTPException(status_code=404, detail="Stream not found")
    stream_info = manager.streams[stream_id]
    if stream_info.get('mode') == 'batch': return {"message": "Results for batch mode are saved to a file."}
    results = manager.get_stream_results(stream_id)
    if results is None: return {"message": "No results available yet."}
    return dict(results)

@app.delete("/streams/{stream_id}", status_code=200, tags=["Streams"])
def delete_stream(stream_id: str):
    manager = get_stream_manager()
    if not manager.remove_stream(stream_id): raise HTTPException(status_code=404, detail="Stream not found")
    return {"message": f"Stream {stream_id} removed successfully."}

@app.get("/alerts", tags=["Alerts"])
def get_alerts(): 
    return []

# Only run this if the script is run directly (not imported by uvicorn)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)