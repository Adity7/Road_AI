import React, { useState, useEffect, useCallback } from 'react';
import { Loader } from 'lucide-react';
import StreamManager from './StreamManager';
import StreamDetails from './StreamDetails';
import AlertsPanel from './AlertsPanel';
import ErrorBanner from './ui/ErrorBanner';
import ConfirmationModal from './ui/ConfirmationModal';

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

function Dashboard() {
    const [streams, setStreams] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [selectedStream, setSelectedStream] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirmation, setConfirmation] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const [streamsRes, alertsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/streams`),
                fetch(`${API_BASE_URL}/alerts`)
            ]);
            
            if (!streamsRes.ok || !alertsRes.ok) {
                throw new Error('Failed to fetch data from the API.');
            }
            
            const streamsData = await streamsRes.json();
            const alertsData = await alertsRes.json();
            
            setStreams(streamsData);
            setAlerts(alertsData);
            setError(null);
        } catch (err) {
            console.error("Fetch error:", err);
            if (!error) setError("Could not connect to the backend API.");
        } finally {
            setIsLoading(false);
        }
    }, [error]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleAddStream = async (streamConfig) => {
        try {
            const response = await fetch(`${API_BASE_URL}/streams`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(streamConfig),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to add stream');
            }
            
            fetchData();
        } catch (err) {
            console.error("Add stream error:", err);
            setError(`Error adding stream: ${err.message}`);
        }
    };

    const handleDeleteStreamRequest = (streamId) => {
        setConfirmation({
            message: 'Are you sure you want to delete this stream?',
            onConfirm: () => handleDeleteStream(streamId),
        });
    };

    const handleDeleteStream = async (streamId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/streams/${streamId}`, { 
                method: 'DELETE' 
            });
            
            if (!response.ok) throw new Error('Failed to delete stream');
            
            if (selectedStream?.id === streamId) {
                setSelectedStream(null);
            }
            
            fetchData();
        } catch (err) {
            console.error("Delete stream error:", err);
            setError(`Error deleting stream: ${err.message}`);
        } finally {
            setConfirmation(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader className="animate-spin h-12 w-12 text-cyan-400" />
            </div>
        );
    }

    return (
        <>
            {error && <ErrorBanner message={error} onClose={() => setError(null)} />}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <StreamManager 
                        streams={streams} 
                        onSelectStream={setSelectedStream} 
                        selectedStreamId={selectedStream?.id} 
                        onDeleteStream={handleDeleteStreamRequest} 
                        onAddStream={handleAddStream} 
                        setError={setError} 
                    />
                    {selectedStream && <StreamDetails stream={selectedStream} />}
                </div>
                
                <div className="lg:col-span-1">
                    <AlertsPanel alerts={alerts} />
                </div>
            </div>
            
            {confirmation && (
                <ConfirmationModal 
                    message={confirmation.message} 
                    onConfirm={confirmation.onConfirm} 
                    onCancel={() => setConfirmation(null)} 
                />
            )}
        </>
    );
}

export default Dashboard;
