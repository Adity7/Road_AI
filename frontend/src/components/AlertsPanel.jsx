import React from 'react';
import { AlertTriangle } from 'lucide-react';

function AlertsPanel({ alerts }) {
    return (
        <div className="bg-gray-800/60 rounded-lg shadow-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <AlertTriangle className="h-6 w-6 mr-3 text-yellow-400" /> 
                System Alerts ({alerts.length})
            </h2>
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {alerts.length > 0 ? (
                    alerts.map((alert, i) => (
                        <div 
                            key={i} 
                            className={`p-3 rounded-lg border ${
                                alert.type === 'Stream Error' 
                                    ? 'bg-red-900/40 border-red-700' 
                                    : 'bg-yellow-900/40 border-yellow-700'
                            }`}
                        >
                            <p className={`font-bold ${
                                alert.type === 'Stream Error' 
                                    ? 'text-red-300' 
                                    : 'text-yellow-300'
                            }`}>
                                {alert.type}
                            </p>
                            <p className="text-sm text-gray-200">{alert.message}</p>
                            <p className="text-xs text-gray-400 font-mono mt-1">
                                Stream: {alert.stream_id.split('-')[0]}
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400 text-center py-4">No active alerts.</p>
                )}
            </div>
        </div>
    );
}

export default AlertsPanel;
