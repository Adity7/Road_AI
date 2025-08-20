import React from 'react';
import { Upload, Database, Cpu, Play, Save, AlertTriangle } from 'lucide-react';

function PipelineVisualizer({ stream }) {
    if (!stream) return null;

    const isBatch = stream.mode === 'batch';
    const hasPreprocessing = stream.preprocessing && Object.values(stream.preprocessing).some(v => v !== false);

    return (
        <div className="bg-gray-800/60 rounded-lg shadow-lg p-6 border border-gray-700 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Cpu className="h-5 w-5 text-cyan-400 mr-2" />
                Processing Pipeline
            </h3>
            
            <div className="relative">
                {/* Pipeline Flow */}
                <div className="flex items-center justify-between mb-6">
                    {/* Input Stage */}
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-2">
                            <Upload className="h-8 w-8 text-white" />
                        </div>
                        <span className="text-sm text-gray-300 text-center">
                            {isBatch ? 'Multiple Files' : 'Video Input'}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                            {Array.isArray(stream.source) ? stream.source.length : 1} source(s)
                        </span>
                    </div>

                    {/* Arrow */}
                    <div className="flex-1 h-0.5 bg-gray-600 mx-4 relative">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600 to-cyan-600 animate-pulse"></div>
                    </div>

                    {/* Queue/Buffer Stage */}
                    {isBatch && (
                        <>
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-2">
                                    <Database className="h-8 w-8 text-white" />
                                </div>
                                <span className="text-sm text-gray-300 text-center">Queue Buffer</span>
                                <span className="text-xs text-gray-500 mt-1">
                                    Max: {stream.queue_size || 10}
                                </span>
                            </div>
                            
                            <div className="flex-1 h-0.5 bg-gray-600 mx-4 relative">
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-600 to-cyan-600 animate-pulse"></div>
                            </div>
                        </>
                    )}

                    {/* Preprocessing Stage */}
                    {hasPreprocessing && (
                        <>
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mb-2">
                                    <Cpu className="h-8 w-8 text-white" />
                                </div>
                                <span className="text-sm text-gray-300 text-center">Preprocess</span>
                                <span className="text-xs text-gray-500 mt-1">
                                    {stream.preprocessing?.resize && 'Resize '}
                                    {stream.preprocessing?.crop && 'Crop '}
                                    {stream.preprocessing?.frameRate && `${stream.preprocessing.frameRate}fps`}
                                </span>
                            </div>
                            
                            <div className="flex-1 h-0.5 bg-gray-600 mx-4 relative">
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-yellow-600 to-cyan-600 animate-pulse"></div>
                            </div>
                        </>
                    )}

                    {/* AI Inference Stage */}
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-cyan-600 rounded-full flex items-center justify-center mb-2">
                            <Play className="h-8 w-8 text-white" />
                        </div>
                        <span className="text-sm text-gray-300 text-center">AI Inference</span>
                        <span className="text-xs text-gray-500 mt-1">
                            {stream.models?.length || 0} model(s)
                        </span>
                    </div>

                    {/* Arrow */}
                    <div className="flex-1 h-0.5 bg-gray-600 mx-4 relative">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-cyan-600 to-green-600 animate-pulse"></div>
                    </div>

                    {/* Output Stage */}
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-2">
                            <Save className="h-8 w-8 text-white" />
                        </div>
                        <span className="text-sm text-gray-300 text-center">
                            {isBatch ? 'Stored Results' : 'Live Output'}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                            {isBatch ? 'Files + Logs' : 'Real-time'}
                        </span>
                    </div>
                </div>

                {/* Pipeline Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="bg-gray-900/50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-cyan-400 mb-2">Processing Mode</h4>
                        <div className="flex items-center space-x-2">
                            {isBatch ? (
                                <>
                                    <Database className="h-4 w-4 text-purple-400" />
                                    <span className="text-sm text-gray-300">Batch Processing</span>
                                </>
                            ) : (
                                <>
                                    <Play className="h-4 w-4 text-blue-400" />
                                    <span className="text-sm text-gray-300">Real-time Processing</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-900/50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-cyan-400 mb-2">AI Models</h4>
                        <div className="space-y-1">
                            {stream.models?.map((model, index) => (
                                <div key={index} className="text-sm text-gray-300">
                                    • {model.model_name}
                                </div>
                            ))}
                        </div>
                    </div>

                    {hasPreprocessing && (
                        <div className="bg-gray-900/50 p-4 rounded-lg md:col-span-2">
                            <h4 className="text-sm font-medium text-cyan-400 mb-2">Preprocessing Options</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {stream.preprocessing?.resize && (
                                    <div className="text-sm text-gray-300">✓ Resize Frames</div>
                                )}
                                {stream.preprocessing?.crop && (
                                    <div className="text-sm text-gray-300">✓ Crop Frames</div>
                                )}
                                {stream.preprocessing?.frameRate && (
                                    <div className="text-sm text-gray-300">
                                        Frame Rate: {stream.preprocessing.frameRate} FPS
                                    </div>
                                )}
                                {stream.preprocessing?.quality && (
                                    <div className="text-sm text-gray-300">
                                        Quality: {stream.preprocessing.quality}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Status Indicator */}
                <div className="mt-6 pt-4 border-t border-gray-700">
                    <div className="flex items-center justify-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                            stream.status === 'running' ? 'bg-green-500' :
                            stream.status === 'error' ? 'bg-red-500' :
                            stream.status === 'starting' ? 'bg-yellow-500' :
                            'bg-gray-500'
                        } animate-pulse`}></div>
                        <span className="text-sm text-gray-400">
                            Pipeline Status: <span className="text-white capitalize">{stream.status}</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PipelineVisualizer;
