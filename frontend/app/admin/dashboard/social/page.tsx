'use client';

import { useState, useEffect } from 'react';
import { apiEndpoint } from '@/app/config/api';
import './social.css';

interface SocialMedia {
    _id?: string;
    platform: string;
    url: string;
    icon: string;
    isActive: boolean;
}

// Brand Logo Components
const FacebookIcon = () => (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);

const InstagramIcon = () => (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="url(#instagram-gradient)">
        <defs>
            <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#FD5949', stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: '#D6249F', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#285AEB', stopOpacity: 1 }} />
            </linearGradient>
        </defs>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
);

const YouTubeIcon = () => (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="#FF0000">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
);

const XIcon = () => (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="#000000">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

export default function SocialPage() {
    const [links, setLinks] = useState<SocialMedia[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editUrl, setEditUrl] = useState('');

    // Default platforms to ensure they exist in the UI
    const defaultPlatforms = [
        { platform: 'Facebook', icon: 'facebook' },
        { platform: 'Instagram', icon: 'instagram' },
        { platform: 'YouTube', icon: 'youtube' },
        { platform: 'X', icon: 'x' }
    ];

    useEffect(() => {
        fetchLinks();
    }, []);

    const fetchLinks = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(apiEndpoint('social-media/admin'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();

                // Merge defaults with fetched data
                const merged = defaultPlatforms.map(def => {
                    const found = data.find((d: SocialMedia) => d.platform === def.platform);
                    return found || { ...def, url: '', isActive: false };
                });

                setLinks(merged);
            }
        } catch (error) {
            console.error('Error fetching social links:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (link: SocialMedia) => {
        const token = localStorage.getItem('adminToken');

        try {
            const response = await fetch(apiEndpoint('social-media'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...link, url: editUrl })
            });

            if (response.ok) {
                setEditingIndex(null);
                fetchLinks();
            }
        } catch (error) {
            console.error('Error saving:', error);
        }
    };

    const handleToggleActive = async (link: SocialMedia, index: number) => {
        const token = localStorage.getItem('adminToken');
        const updatedLink = { ...link, isActive: !link.isActive };

        try {
            await fetch(apiEndpoint('social-media'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedLink)
            });
            fetchLinks();
        } catch (error) {
            console.error('Error toggling:', error);
        }
    };

    const startEdit = (index: number, currentUrl: string) => {
        setEditingIndex(index);
        setEditUrl(currentUrl);
    };

    const cancelEdit = () => {
        setEditingIndex(null);
        setEditUrl('');
    };

    const getPlatformIcon = (platform: string) => {
        switch (platform) {
            case 'Facebook': return <FacebookIcon />;
            case 'Instagram': return <InstagramIcon />;
            case 'YouTube': return <YouTubeIcon />;
            case 'X': return <XIcon />;
            default: return null;
        }
    };

    return (
        <div className="social-container">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Social Media Links</h2>
                    <p className="page-subtitle">Manage links appearing in the site footer</p>
                </div>
            </div>

            <div className="content-card">
                {isLoading ? (
                    <div className="empty-state">
                        Loading social media settings...
                    </div>
                ) : (
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th style={{ width: '25%' }}>Platform</th>
                                <th style={{ width: '45%' }}>Profile URL</th>
                                <th style={{ width: '15%' }}>Status</th>
                                <th style={{ width: '15%', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {links.map((link, index) => (
                                <tr key={link.platform}>
                                    <td>
                                        <div className="platform-info">
                                            <div className="platform-icon">
                                                {getPlatformIcon(link.platform)}
                                            </div>
                                            <span className="platform-name">{link.platform}</span>
                                        </div>
                                    </td>
                                    <td>
                                        {editingIndex === index ? (
                                            <input
                                                type="url"
                                                value={editUrl}
                                                onChange={e => setEditUrl(e.target.value)}
                                                placeholder={`https://www.${link.platform.toLowerCase()}.com/yourpage`}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.5rem 0.75rem',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '6px',
                                                    fontSize: '0.875rem',
                                                    fontFamily: 'Courier New, monospace'
                                                }}
                                                autoFocus
                                            />
                                        ) : (
                                            <div className={`url-display ${!link.url ? 'url-empty' : ''}`}>
                                                {link.url || 'No URL set'}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleToggleActive(link, index)}
                                            className={`status-toggle ${link.isActive ? 'status-active' : 'status-inactive'}`}
                                        >
                                            {link.isActive ? '● Active' : '○ Inactive'}
                                        </button>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        {editingIndex === index ? (
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => handleSave(link)}
                                                    className="action-btn action-btn-primary"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="action-btn"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => startEdit(index, link.url)}
                                                className="action-btn"
                                            >
                                                ✏️ Edit
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
