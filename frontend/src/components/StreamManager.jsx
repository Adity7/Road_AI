import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import AddStreamForm from './AddStreamForm';
import StreamItem from './StreamItem';

function StreamManager({ streams, onSelectStream, selectedStreamId, onDeleteStream, onAddStream, setError }) {
    const [showAddForm, setShowAddForm] = useState(false);
    
    return (
        <div className="bg-gray-800/60 rounded-lg shadow-lg p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Active Streams ({streams.length})</h2>
                <button 
                    onClick={() => setShowAddForm(!showAddForm)} 
                    className="flex items-center bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    <Plus className="h-5 w-5 mr-2" /> Add Stream
                </button>
            </div>
            
            {showAddForm && (
                <AddStreamForm 
                    onAddStream={onAddStream} 
                    onCancel={() => setShowAddForm(false)} 
                    setError={setError} 
                />
            )}
            
            <div className="space-y-3 mt-4 max-h-96 overflow-y-auto pr-2">
                {streams.length > 0 ? (
                    streams.map(stream => (
                        <StreamItem 
                            key={stream.id} 
                            stream={stream} 
                            onSelect={onSelectStream} 
                            isSelected={selectedStreamId === stream.id} 
                            onDelete={onDeleteStream} 
                        />
                    ))
                ) : (
                    <p className="text-gray-400 text-center py-4">No active streams.</p>
                )}
            </div>
        </div>
    );
}

export default StreamManager;
