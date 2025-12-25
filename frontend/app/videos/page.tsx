'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiEndpoint } from '@/app/config/api';

interface Video {
    _id: string;
    title: string;
    tag: string;
    youtubeVideoId: string;
    startTime: Date;
    duration: number;
    thumbnail?: string;
}

export default function VideosPage() {
    const router = useRouter();
    const [videos, setVideos] = useState<Video[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const response = await fetch(apiEndpoint('live-stream/videos'));
            if (response.ok) {
                const data = await response.json();
                setVideos(data);
            }
        } catch (error) {
            console.error('Error fetching videos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredVideos = filter === 'all'
        ? videos
        : videos.filter(v => v.tag === filter);

    if (isLoading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div>Loading videos...</div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#F9FAFB', padding: '2rem' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2.5rem', color: '#800020', marginBottom: '0.5rem', fontFamily: 'Cinzel, serif' }}>
                        Video Archive
                    </h1>
                    <p style={{ color: '#6B7280' }}>
                        Watch past live streams and special events
                    </p>
                </div>

                {/* Filter */}
                <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {['all', 'regular', 'event', 'special'].map(tag => (
                        <button
                            key={tag}
                            onClick={() => setFilter(tag)}
                            style={{
                                padding: '0.5rem 1rem',
                                background: filter === tag ? '#800020' : 'white',
                                color: filter === tag ? 'white' : '#4B5563',
                                border: '2px solid #800020',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                textTransform: 'capitalize'
                            }}
                        >
                            {tag === 'all' ? 'All Videos' : tag}
                        </button>
                    ))}
                </div>

                {/* Videos Grid */}
                {filteredVideos.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#9CA3AF' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📹</div>
                        <p>No videos available yet.</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: '2rem'
                    }}>
                        {filteredVideos.map(video => (
                            <div
                                key={video._id}
                                style={{
                                    background: 'white',
                                    borderRadius: '0.75rem',
                                    overflow: 'hidden',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                    transition: 'transform 0.2s',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                {/* YouTube Embed */}
                                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                                    <iframe
                                        src={`https://www.youtube-nocookie.com/embed/${video.youtubeVideoId}?modestbranding=1&rel=0&showinfo=0`}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            border: 'none'
                                        }}
                                        allowFullScreen
                                    />
                                </div>

                                {/* Video Info */}
                                <div style={{ padding: '1rem' }}>
                                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', color: '#1F2937' }}>
                                        {video.title}
                                    </h3>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.875rem', color: '#6B7280' }}>
                                        <span style={{
                                            background: '#FEF3C7',
                                            color: '#92400E',
                                            padding: '0.125rem 0.5rem',
                                            borderRadius: '999px',
                                            textTransform: 'capitalize'
                                        }}>
                                            {video.tag}
                                        </span>
                                        <span>•</span>
                                        <span>{new Date(video.startTime).toLocaleDateString()}</span>
                                        <span>•</span>
                                        <span>{video.duration} min</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
