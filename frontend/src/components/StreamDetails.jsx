import React, { useState, useEffect, useCallback, useRef } from 'react';
import PipelineVisualizer from './PipelineVisualizer';

function StreamDetails({ stream }) {
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const prevStreamId = useRef();

    const fetchResults = useCallback(async () => {
        if (!stream?.id) return;
        
        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
            const response = await fetch(`${apiBaseUrl}/streams/${stream.id}/results`);
            if (!response.ok) throw new Error('Failed to fetch results');
            const data = await response.json();
            setResults(data);
            setError(null);
        } catch (err) {
            console.error("Fetch results error:", err);
            setError("Could not load results for this stream.");
        }
    }, [stream?.id]);

    useEffect(() => {
        if (prevStreamId.current !== stream.id) {
            setResults(null);
            setError(null);
            prevStreamId.current = stream.id;
        }
        fetchResults();
        const interval = setInterval(fetchResults, 2000);
        return () => clearInterval(interval);
    }, [stream?.id, fetchResults]);

    return (
        <div className="space-y-6">
            {/* Pipeline Visualization */}
            <PipelineVisualizer stream={stream} />
            
            {/* Stream Details */}
            <div className="bg-gray-800/60 rounded-lg shadow-lg p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">Stream Details & Output</h2>
                
                <div className="space-y-2 mb-4 text-sm">
                    <p>
                        <strong className="text-gray-400 w-24 inline-block">ID:</strong> 
                        <span className="font-mono">{stream.id}</span>
                    </p>
                    <p>
                        <strong className="text-gray-400 w-24 inline-block">Source:</strong> 
                        {Array.isArray(stream.source) ? `${stream.source.length} files` : stream.source}
                    </p>
                    <p>
                        <strong className="text-gray-400 w-24 inline-block">Mode:</strong> 
                        <span className="capitalize">{stream.mode}</span>
                    </p>
                    <p>
                        <strong className="text-gray-400 w-24 inline-block">PID:</strong> 
                        {stream.pid || 'N/A'}
                    </p>
                    <p>
                        <strong className="text-gray-400 w-24 inline-block">Models:</strong> 
                        {stream.models.map(m => m.model_name).join(', ')}
                    </p>
                    {stream.queue_size && (
                        <p>
                            <strong className="text-gray-400 w-24 inline-block">Queue Size:</strong> 
                            {stream.queue_size}
                        </p>
                    )}
                </div>
                
                <hr className="border-gray-700 my-4" />
                
                <h3 className="text-lg font-semibold text-white mb-2">Live Inference Results</h3>
                
                {error && <p className="text-red-400">{error}</p>}
                
                {!results || !results.results ? (
                    <p className="text-gray-400">Waiting for first results...</p>
                ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2 bg-gray-900/50 p-3 rounded-md">
                        <p className="text-xs text-gray-400">
                            Frame: {results.frame} @ {new Date(results.timestamp * 1000).toLocaleTimeString()}
                        </p>
                        
                        {Object.entries(results.results).map(([modelName, detections]) => (
                            <div key={modelName}>
                                <h4 className="font-semibold text-cyan-400">{modelName}</h4>
                                {detections.length > 0 ? (
                                    <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                                        {detections.map((det, i) => (
                                            <li key={i} className="font-mono">
                                                <span className="font-bold text-yellow-300">{det.label}</span> - 
                                                Conf: <span className="text-green-300">{det.confidence.toFixed(2)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 text-sm">No detections.</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default StreamDetails;
