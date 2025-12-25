'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiEndpoint } from '@/app/config/api';
import '../admin-dashboard.css';

interface StreamData {
    _id?: string;
    title: string;
    tag: 'event' | 'regular' | 'special';
    isLive: boolean;
    viewerCount: number;
    startTime?: Date;
    duration?: number;
}

export default function LiveStreamPage() {
    const router = useRouter();
    const [streamData, setStreamData] = useState<StreamData>({
        title: '',
        tag: 'regular',
        isLive: false,
        viewerCount: 0
    });
    const [activeStream, setActiveStream] = useState<StreamData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/admin');
            return;
        }
        fetchStreamStatus(token);
    }, [router]);

    const fetchStreamStatus = async (token: string) => {
        try {
            const response = await fetch(apiEndpoint('live-stream/admin/status'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setActiveStream(data.activeStream);
            }
        } catch (error) {
            console.error('Failed to fetch stream status', error);
        }
    };

    const handleStartStream = async () => {
        if (!streamData.title.trim()) {
            alert('Please enter a stream title');
            return;
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(apiEndpoint('live-stream/admin/start'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: streamData.title,
                    tag: streamData.tag,
                    publishDelayHours: 12
                })
            });

            if (response.ok) {
                const newStream = await response.json();
                setActiveStream(newStream);
                alert('✅ Live stream started! Users can now watch at /watch-live');
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Error starting stream:', error);
            alert('Failed to start stream');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStopStream = async () => {
        if (!activeStream?._id) return;

        setIsLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(apiEndpoint(`live-stream/admin/stop/${activeStream._id}`), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setActiveStream(null);
                setStreamData({ title: '', tag: 'regular', isLive: false, viewerCount: 0 });
                alert('✅ Stream stopped! Recording will be uploaded to YouTube automatically.');
            }
        } catch (error) {
            console.error('Error stopping stream:', error);
            alert('Failed to stop stream');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-page-container">
            <div className="admin-page-header" style={{ justifyContent: 'center', textAlign: 'center' }}>
                <div>
                    <h1 className="admin-page-title">Live Stream Control</h1>
                    <p className="admin-page-subtitle">Broadcast live to your congregation</p>
                </div>
            </div>

            {activeStream ? (
                // Active Stream Dashboard
                <div style={{
                    background: 'white',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    borderTop: '4px solid #DC2626'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: '#DC2626',
                            animation: 'pulse 2s infinite'
                        }} />
                        <h2 style={{ margin: 0, color: '#DC2626', fontSize: '1.25rem' }}>🔴 LIVE NOW</h2>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{activeStream.title}</h3>
                        <p style={{ color: '#6B7280', margin: 0, fontSize: '0.9rem' }}>
                            Tag: {activeStream.tag} • Started: {new Date(activeStream.startTime!).toLocaleTimeString()}
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '0.75rem',
                        marginBottom: '1.5rem'
                    }}>
                        <div style={{
                            padding: '0.75rem',
                            background: '#F9FAFB',
                            borderRadius: '0.5rem',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#800020' }}>
                                {activeStream.viewerCount}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Current Viewers</div>
                        </div>
                        <div style={{
                            padding: '0.75rem',
                            background: '#F9FAFB',
                            borderRadius: '0.5rem',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#800020' }}>
                                {activeStream.duration || 0}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Minutes</div>
                        </div>
                    </div>

                    <button
                        onClick={handleStopStream}
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: '#DC2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            opacity: isLoading ? 0.6 : 1
                        }}
                    >
                        {isLoading ? 'Stopping...' : '⏹️ Stop Stream'}
                    </button>
                </div>
            ) : (
                // Stream Setup Form
                <div style={{
                    background: 'white',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{ marginTop: 0, marginBottom: '1rem', color: '#800020', fontSize: '1.25rem' }}>
                        Start New Live Stream
                    </h2>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600', fontSize: '0.9rem' }}>
                            Stream Title *
                        </label>
                        <input
                            type="text"
                            value={streamData.title}
                            onChange={(e) => setStreamData({ ...streamData, title: e.target.value })}
                            placeholder="e.g., Sunday Mass - December 13, 2024"
                            style={{
                                width: '100%',
                                padding: '0.65rem',
                                border: '2px solid #E5E7EB',
                                borderRadius: '0.5rem',
                                fontSize: '0.95rem'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600', fontSize: '0.9rem' }}>
                            Tag/Category
                        </label>
                        <select
                            value={streamData.tag}
                            onChange={(e) => setStreamData({ ...streamData, tag: e.target.value as any })}
                            style={{
                                width: '100%',
                                padding: '0.65rem',
                                border: '2px solid #E5E7EB',
                                borderRadius: '0.5rem',
                                fontSize: '0.95rem'
                            }}
                        >
                            <option value="regular">Regular Program</option>
                            <option value="event">Special Event</option>
                            <option value="special">Special Program</option>
                        </select>
                    </div>

                    <div style={{
                        padding: '0.75rem',
                        background: '#F9FAFB',
                        borderRadius: '0.5rem',
                        marginBottom: '1rem'
                    }}>
                        <div style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '0.25rem' }}>
                            <strong>Date & Time:</strong> {new Date().toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                            <strong>Auto-publish delay:</strong> 12 hours after stream ends
                        </div>
                    </div>

                    <div style={{
                        padding: '0.75rem',
                        background: '#FEF3C7',
                        borderRadius: '0.5rem',
                        marginBottom: '1rem',
                        fontSize: '0.85rem'
                    }}>
                        ℹ️ <strong>Note:</strong> After clicking "Start Stream", your camera will be accessed.
                        The stream will be recorded and automatically uploaded to YouTube when you stop it.
                    </div>

                    <button
                        onClick={handleStartStream}
                        disabled={isLoading || !streamData.title.trim()}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: streamData.title.trim() ? '#800020' : '#9CA3AF',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            cursor: streamData.title.trim() && !isLoading ? 'pointer' : 'not-allowed'
                        }}
                    >
                        {isLoading ? 'Starting...' : '📡 Start Live Stream'}
                    </button>
                </div>
            )}

            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
}
