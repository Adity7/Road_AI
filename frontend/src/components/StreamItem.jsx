import React from 'react';
import { Trash2 } from 'lucide-react';
import StatusIndicator from './ui/StatusIndicator';

function StreamItem({ stream, onSelect, isSelected, onDelete }) {
    return (
        <div 
            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                isSelected ? 'bg-cyan-900/50 ring-2 ring-cyan-500' : 'bg-gray-700/70 hover:bg-gray-700'
            }`} 
            onClick={() => onSelect(stream)}
        >
            <div className="flex flex-col">
                <span className="font-mono text-xs text-cyan-300">
                    {stream.id.split('-')[0]}
                </span>
                <span className="font-medium text-white truncate max-w-xs">
                    {stream.source}
                </span>
            </div>
            
            <div className="flex items-center space-x-4">
                <StatusIndicator status={stream.status} />
                <button 
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        onDelete(stream.id); 
                    }} 
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full"
                >
                    <Trash2 className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}

export default StreamItem;
