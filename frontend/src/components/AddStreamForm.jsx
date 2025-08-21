import React, { useState, useRef } from 'react';
import { Loader, Upload, File as FileIcon, X, Settings, Play, Database } from 'lucide-react';

function AddStreamForm({ onAddStream, onCancel, setError }) {
    const [source, setSource] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [models, setModels] = useState('yolov8n.pt');
    const [processingMode, setProcessingMode] = useState('realtime');
    const [preprocessing, setPreprocessing] = useState({
        resize: true,
        crop: false,
        frameRate: 30,
        quality: 'high'
    });
    const [isUploading, setIsUploading] = useState(false);
    const [formError, setFormError] = useState('');
    const [queueSize, setQueueSize] = useState(10);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setSelectedFiles(files);
            setSource(''); // Clear text input when files are selected
        }
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setIsUploading(true);

        let streamSource = source;
        let uploadedFiles = [];

        // Step 1: Upload files if selected
        if (selectedFiles.length > 0) {
            try {
                for (const file of selectedFiles) {
                    const formData = new FormData();
                    formData.append('file', file);
                    
                    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
                    const response = await fetch(`${apiBaseUrl}/upload`, {
                        method: 'POST',
                        body: formData,
                    });
                    
                    if (!response.ok) throw new Error(`File upload failed for ${file.name}`);
                    const result = await response.json();
                    uploadedFiles.push(result.file_path);
                }
                
                if (processingMode === 'batch') {
                    streamSource = uploadedFiles; // Multiple files for batch processing
                } else {
                    streamSource = uploadedFiles[0]; // Single file for real-time
                }
            } catch (err) {
                console.error(err);
                setFormError(`Upload Error: ${err.message}`);
                setIsUploading(false);
                return;
            }
        }

        // Step 2: Validate and create stream
        const modelConfigs = models.split(',').map(name => name.trim()).filter(name => name).map(name => ({ model_name: name }));
        
        if (!streamSource || modelConfigs.length === 0) {
            setFormError("A stream source and at least one model are required.");
            setIsUploading(false);
            return;
        }

        try {
            const streamConfig = {
                source: streamSource,
                models: modelConfigs,
                mode: processingMode,
                preprocessing: preprocessing,
                queue_size: queueSize
            };
            
            await onAddStream(streamConfig);
            onCancel(); // Close form on success
        } catch (err) {
            setError(err.message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="bg-gray-700/50 p-4 rounded-lg mt-4 border border-gray-600">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Processing Mode Selection */}
                <div className="flex space-x-4 mb-4">
                    <button
                        type="button"
                        onClick={() => setProcessingMode('realtime')}
                        className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                            processingMode === 'realtime' 
                                ? 'bg-cyan-600 text-white' 
                                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        }`}
                    >
                        <Play className="h-4 w-4 mr-2" />
                        Real-time
                    </button>
                    <button
                        type="button"
                        onClick={() => setProcessingMode('batch')}
                        className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                            processingMode === 'batch' 
                                ? 'bg-cyan-600 text-white' 
                                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        }`}
                    >
                        <Database className="h-4 w-4 mr-2" />
                        Batch Processing
                    </button>
                </div>

                {/* Input Source */}
                <div>
                    <label htmlFor="source" className="block text-sm font-medium text-gray-300 mb-1">
                        {processingMode === 'batch' ? 'Batch Source (Path or URL)' : 'Stream Source (Path or URL)'}
                    </label>
                    <input 
                        type="text" 
                        id="source" 
                        value={source} 
                        onChange={e => { setSource(e.target.value); setSelectedFiles([]); }} 
                        disabled={selectedFiles.length > 0} 
                        className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-gray-700 disabled:text-gray-500" 
                        placeholder={processingMode === 'batch' ? "e.g., batch_folder/*.mp4" : "e.g., sample_data/test.mp4"} 
                    />
                </div>

                <div className="text-center text-xs text-gray-400">OR</div>

                {/* File Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        {processingMode === 'batch' ? 'Upload Multiple Files' : 'Upload a File'}
                    </label>
                    {selectedFiles.length > 0 ? (
                        <div className="space-y-2">
                            {selectedFiles.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-800 border border-gray-600 rounded-md px-3 py-2">
                                    <div className="flex items-center space-x-2 overflow-hidden">
                                        <FileIcon className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                                        <span className="text-white truncate">{file.name}</span>
                                        <span className="text-xs text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => removeFile(index)} 
                                        className="p-1 text-gray-400 hover:text-white"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div 
                            onClick={() => fileInputRef.current.click()} 
                            className="flex justify-center w-full px-6 py-4 border-2 border-gray-600 border-dashed rounded-md cursor-pointer hover:border-cyan-500"
                        >
                            <div className="space-y-1 text-center">
                                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                <p className="text-sm text-gray-400">
                                    {processingMode === 'batch' ? 'Click to browse multiple files' : 'Click to browse'}
                                </p>
                            </div>
                            <input 
                                ref={fileInputRef} 
                                type="file" 
                                multiple={processingMode === 'batch'}
                                onChange={handleFileChange} 
                                className="hidden" 
                            />
                        </div>
                    )}
                </div>

                {/* Preprocessing Options */}
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
                    <div className="flex items-center mb-3">
                        <Settings className="h-5 w-5 text-cyan-400 mr-2" />
                        <h4 className="text-sm font-medium text-gray-300">Preprocessing Options</h4>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                            <input 
                                type="checkbox" 
                                id="resize" 
                                checked={preprocessing.resize}
                                onChange={e => setPreprocessing(prev => ({ ...prev, resize: e.target.checked }))}
                                className="rounded border-gray-600 text-cyan-500 focus:ring-cyan-500"
                            />
                            <label htmlFor="resize" className="text-sm text-gray-300">Resize Frames</label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <input 
                                type="checkbox" 
                                id="crop" 
                                checked={preprocessing.crop}
                                onChange={e => setPreprocessing(prev => ({ ...prev, crop: e.target.checked }))}
                                className="rounded border-gray-600 text-cyan-500 focus:ring-cyan-500"
                            />
                            <label htmlFor="crop" className="text-sm text-gray-300">Crop Frames</label>
                        </div>
                        
                        <div>
                            <label htmlFor="frameRate" className="block text-xs text-gray-400 mb-1">Frame Rate</label>
                            <select 
                                id="frameRate" 
                                value={preprocessing.frameRate}
                                onChange={e => setPreprocessing(prev => ({ ...prev, frameRate: parseInt(e.target.value) }))}
                                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                            >
                                <option value={15}>15 FPS</option>
                                <option value={24}>24 FPS</option>
                                <option value={30}>30 FPS</option>
                                <option value={60}>60 FPS</option>
                            </select>
                        </div>
                        
                        <div>
                            <label htmlFor="quality" className="block text-xs text-gray-400 mb-1">Quality</label>
                            <select 
                                id="quality" 
                                value={preprocessing.quality}
                                onChange={e => setPreprocessing(prev => ({ ...prev, quality: e.target.value }))}
                                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Queue Configuration */}
                {processingMode === 'batch' && (
                    <div>
                        <label htmlFor="queueSize" className="block text-sm font-medium text-gray-300 mb-1">
                            Queue Size (Max concurrent processing)
                        </label>
                        <input 
                            type="number" 
                            id="queueSize" 
                            value={queueSize} 
                            onChange={e => setQueueSize(parseInt(e.target.value))} 
                            min="1" 
                            max="50"
                            className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500" 
                        />
                    </div>
                )}

                {/* AI Models */}
                <div>
                    <label htmlFor="models" className="block text-sm font-medium text-gray-300 mb-1">AI Models (comma-separated)</label>
                    <input 
                        type="text" 
                        id="models" 
                        value={models} 
                        onChange={e => setModels(e.target.value)} 
                        className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500" 
                        placeholder="e.g., yolov8n.pt, yolov8s.pt" 
                    />
                </div>
                
                {formError && <p className="text-sm text-red-400">{formError}</p>}
                
                <div className="flex justify-end space-x-3">
                    <button 
                        type="button" 
                        onClick={onCancel} 
                        className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={isUploading} 
                        className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center disabled:bg-green-800"
                    >
                        {isUploading && <Loader className="animate-spin h-5 w-5 mr-2" />}
                        {isUploading ? 'Processing...' : `Start ${processingMode === 'batch' ? 'Batch' : 'Stream'}`}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddStreamForm;

