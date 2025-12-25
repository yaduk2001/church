'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiEndpoint } from '@/app/config/api';
import { checkNetworkQuality, getConnectionRecommendation } from '../utils/networkDetection';

interface ActiveStream {
    _id: string;
    title: string;
    tag: string;
    startTime: Date;
    viewerCount: number;
}

export default function WatchLivePage() {
    const router = useRouter();
    const [activeStream, setActiveStream] = useState<ActiveStream | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [networkCheck, setNetworkCheck] = useState<any>(null);
    const [showWarning, setShowWarning] = useState(true);

    useEffect(() => {
        // Check network quality
        const quality = checkNetworkQuality();
        setNetworkCheck(quality);

        // Fetch active stream
        fetchActiveStream();
    }, []);

    const fetchActiveStream = async () => {
        try {
            const response = await fetch(apiEndpoint('live-stream/active'));
            if (response.ok) {
                const data = await response.json();
                setActiveStream(data);
            }
        } catch (error) {
            console.error('Error fetching active stream:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#F9FAFB'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📡</div>
                    <div style={{ color: '#6B7280' }}>Loading...</div>
                </div>
            </div>
        );
    }

    // Network Warning Modal
    if (showWarning && networkCheck) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.5)',
                padding: '2rem'
            }}>
                <div style={{
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '2rem',
                    maxWidth: '500px',
                    width: '100%'
                }}>
                    <h2 style={{ marginTop: 0, color: '#800020' }}>
                        {networkCheck.isAllowed ? '✅ Network Check' : '⚠️ Connection Warning'}
                    </h2>

                    <div style={{
                        padding: '1rem',
                        background: networkCheck.isAllowed ? '#F0FDF4' : '#FEF2F2',
                        borderRadius: '0.5rem',
                        marginBottom: '1.5rem'
                    }}>
                        <p style={{ margin: 0, color: networkCheck.isAllowed ? '#166534' : '#991B1B' }}>
                            {networkCheck.message}
                        </p>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Connection Requirements:</h3>
                        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#4B5563' }}>
                            <li>✅ <strong>Recommended:</strong> 5G or Wi-Fi</li>
                            <li>✅ <strong>Minimum:</strong> 4G with good signal</li>
                            <li>❌ <strong>Not supported:</strong> 2G or 3G</li>
                        </ul>
                    </div>

                    <div style={{
                        padding: '1rem',
                        background: '#FEF3C7',
                        borderRadius: '0.5rem',
                        marginBottom: '1.5rem',
                        fontSize: '0.875rem'
                    }}>
                        <strong>Current Connection:</strong> {networkCheck.type.toUpperCase()}
                        {networkCheck.speed && ` (${networkCheck.speed})`}
                    </div>

                    {networkCheck.isAllowed ? (
                        <button
                            onClick={() => setShowWarning(false)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: '#800020',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Continue to Live Stream
                        </button>
                    ) : (
                        <div>
                            <button
                                onClick={() => router.push('/')}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: '#6B7280',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Return to Home
                            </button>
                            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', color: '#6B7280' }}>
                                Please switch to a faster connection and try again.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // No Active Stream
    if (!activeStream) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#F9FAFB',
                padding: '2rem'
            }}>
                <div style={{
                    textAlign: 'center',
                    maxWidth: '500px'
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📡</div>
                    <h1 style={{ fontSize: '2rem', color: '#1F2937', marginBottom: '1rem' }}>
                        No Live Stream Active
                    </h1>
                    <p style={{ color: '#6B7280', marginBottom: '2rem' }}>
                        There is currently no live stream. Check back later or view our recorded videos.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button
                            onClick={() => router.push('/videos')}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: '#800020',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            View Videos
                        </button>
                        <button
                            onClick={() => router.push('/')}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: 'white',
                                color: '#800020',
                                border: '2px solid #800020',
                                borderRadius: '0.5rem',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Go Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Live Stream Player
    return (
        <div style={{
            minHeight: '100vh',
            background: '#000',
            padding: '2rem'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Live Indicator */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1rem'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: '#DC2626',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem'
                    }}>
                        <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: 'white',
                            animation: 'pulse 2s infinite'
                        }} />
                        <span style={{ color: 'white', fontWeight: '600' }}>LIVE</span>
                    </div>
                    <span style={{ color: '#9CA3AF' }}>
                        {activeStream.viewerCount} watching
                    </span>
                </div>

                {/* Video Player Placeholder */}
                <div style={{
                    background: '#1F2937',
                    borderRadius: '0.5rem',
                    aspectRatio: '16/9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem'
                }}>
                    <div style={{ textAlign: 'center', color: 'white' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📹</div>
                        <div>Live Stream Player</div>
                        <div style={{ fontSize: '0.875rem', color: '#9CA3AF', marginTop: '0.5rem' }}>
                            (HLS player will be integrated here)
                        </div>
                    </div>
                </div>

                {/* Stream Info */}
                <div style={{
                    background: '#1F2937',
                    borderRadius: '0.5rem',
                    padding: '1.5rem'
                }}>
                    <h1 style={{ color: 'white', margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>
                        {activeStream.title}
                    </h1>
                    <div style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
                        {activeStream.tag} • Started {new Date(activeStream.startTime).toLocaleTimeString()}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
}
