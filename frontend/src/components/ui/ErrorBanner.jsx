import React from 'react';
import { AlertTriangle, XCircle } from 'lucide-react';

function ErrorBanner({ message, onClose }) {
    return (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg flex justify-between items-center max-w-full mx-auto">
            <div className="flex items-center">
                <AlertTriangle className="h-6 w-6 text-red-400 mr-3" />
                <p>{message}</p>
            </div>
            <button onClick={onClose} className="text-red-300 hover:text-white">
                <XCircle className="h-6 w-6" />
            </button>
        </div>
    );
}

export default ErrorBanner;
