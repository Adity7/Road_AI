import React from 'react';
import { CheckCircle, StopCircle, XCircle, Loader } from 'lucide-react';

const StatusIndicator = ({ status }) => {
    const statusConfig = {
        running: {
            icon: <CheckCircle className="h-5 w-5 text-green-400" />,
            text: 'Running',
            color: 'text-green-400'
        },
        stopped: {
            icon: <StopCircle className="h-5 w-5 text-gray-400" />,
            text: 'Stopped',
            color: 'text-gray-400'
        },
        error: {
            icon: <XCircle className="h-5 w-5 text-red-400" />,
            text: 'Error',
            color: 'text-red-400'
        },
        starting: {
            icon: <Loader className="h-5 w-5 text-yellow-400 animate-spin" />,
            text: 'Starting',
            color: 'text-yellow-400'
        },
        initializing: {
            icon: <Loader className="h-5 w-5 text-yellow-400 animate-spin" />,
            text: 'Initializing',
            color: 'text-yellow-400'
        }
    };

    const config = statusConfig[status] || statusConfig.stopped;

    return (
        <div className={`flex items-center space-x-2 ${config.color}`}>
            {config.icon}
            <span>{config.text}</span>
        </div>
    );
};

export default StatusIndicator;
