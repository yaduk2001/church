'use client';

import { useState, useEffect } from 'react';
import { apiEndpoint } from '@/app/config/api';
import './admin-news.css';

interface NewsItem {
    _id: string;
    title: string;
    content: string;
    excerpt: string;
    category: string;
    imageUrl?: string;
    bibleVerse?: string;
    isActive: boolean;
    isPinned: boolean;
    publishDate: string;
    views: number;
}

export default function NewsPage() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNews, setEditingNews] = useState<NewsItem | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        excerpt: '',
        category: 'General',
        imageUrl: '',
        bibleVerse: '',
        isActive: true,
        isPinned: false
    });

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(apiEndpoint('news/admin'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setNews(data);
            }
        } catch (error) {
            console.error('Error fetching news:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('adminToken');

        try {
            const url = editingNews
                ? apiEndpoint(`news/${editingNews._id}`)
                : apiEndpoint('news');

            const method = editingNews ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setIsModalOpen(false);
                fetchNews();
                resetForm();
            }
        } catch (error) {
            console.error('Error save news:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this news item?')) return;

        const token = localStorage.getItem('adminToken');
        try {
            await fetch(apiEndpoint(`news/${id}`), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchNews();
        } catch (error) {
            console.error('Error deleting news:', error);
        }
    };

    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uploadFormData = new FormData();
        uploadFormData.append('image', file);

        setUploading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(apiEndpoint('upload'), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: uploadFormData
            });

            if (response.ok) {
                const data = await response.json();
                setFormData(prev => ({ ...prev, imageUrl: data.url }));
            } else {
                alert('Image upload failed');
            }
        } catch (error) {
            console.error('Error uploading:', error);
        } finally {
            setUploading(false);
        }
    };

    const openEditModal = (item: NewsItem) => {
        setEditingNews(item);
        setFormData({
            title: item.title,
            content: item.content,
            excerpt: item.excerpt,
            category: item.category,
            imageUrl: item.imageUrl || '',
            bibleVerse: item.bibleVerse || '',
            isActive: item.isActive,
            isPinned: item.isPinned
        });
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setEditingNews(null);
        setFormData({
            title: '',
            content: '',
            excerpt: '',
            category: 'General',
            imageUrl: '',
            bibleVerse: '',
            isActive: true,
            isPinned: false
        });
    };

    const getCategoryBadgeClass = (category: string) => {
        const map: { [key: string]: string } = {
            'Announcement': 'badge-announcement',
            'Event': 'badge-event',
            'Urgent': 'badge-urgent',
            'Celebration': 'badge-celebration'
        };
        return map[category] || 'badge-neutral';
    };

    return (
        <div className="news-container">
            <div className="page-header">
                <div>
                    <h2 className="page-title">News & Events</h2>
                    <p className="page-subtitle">Manage announcements and articles for the community</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="btn-primary"
                >
                    <span style={{ fontSize: '1.2rem' }}>+</span>
                    Create Post
                </button>
            </div>

            <div className="content-card">
                {isLoading ? (
                    <div className="empty-state">
                        Loading news items...
                    </div>
                ) : news.length === 0 ? (
                    <div className="empty-state">
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📰</div>
                        <p style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>No news items found</p>
                        <p>Create your first announcement to keep the parish informed.</p>
                    </div>
                ) : (
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th style={{ width: '45%' }}>Article Details</th>
                                <th style={{ width: '15%' }}>Category</th>
                                <th style={{ width: '15%' }}>Status</th>
                                <th style={{ width: '10%', textAlign: 'center' }}>Views</th>
                                <th style={{ width: '15%', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {news.map(item => (
                                <tr key={item._id}>
                                    <td>
                                        <span className="article-title">{item.title}</span>
                                        <span className="article-excerpt">{item.excerpt}</span>
                                    </td>
                                    <td>
                                        <span className={`badge ${getCategoryBadgeClass(item.category)}`}>
                                            {item.category}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={`status-pill ${item.isActive ? 'status-active' : 'status-draft'}`}>
                                            {item.isActive ? '● Active' : '○ Draft'}
                                        </div>
                                        {item.isPinned && (
                                            <span className="status-pinned">📌 Pinned to top</span>
                                        )}
                                    </td>
                                    <td style={{ textAlign: 'center', fontWeight: 500, color: '#6b7280' }}>
                                        {item.views || 0}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button
                                            onClick={() => openEditModal(item)}
                                            className="action-btn"
                                            title="Edit"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            className="action-btn delete"
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3 className="modal-title" style={{ color: 'white' }}>
                                    {editingNews ? 'Edit Announcement' : (formData.bibleVerse || '"Go into all the world and proclaim the gospel"')}
                                </h3>
                                {!editingNews && formData.bibleVerse && (
                                    <p style={{
                                        color: 'white',
                                        fontSize: '0.8125rem',
                                        marginTop: '0.25rem',
                                        fontStyle: 'italic',
                                        opacity: 0.9
                                    }}>
                                        — Bible Verse
                                    </p>
                                )}
                                {!editingNews && !formData.bibleVerse && (
                                    <p style={{
                                        color: 'white',
                                        fontSize: '0.8125rem',
                                        marginTop: '0.25rem',
                                        fontStyle: 'italic',
                                        opacity: 0.9
                                    }}>
                                        — Mark 16:15
                                    </p>
                                )}
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="modal-close">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Post Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="form-input"
                                    placeholder="e.g., Easter Sunday Celebration"
                                    required
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="form-select"
                                    >
                                        {['Announcement', 'Event', 'General', 'Urgent', 'Celebration'].map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Featured Image (Optional)</label>
                                    <div style={{
                                        position: 'relative',
                                        border: '2px dashed #d1d5db',
                                        borderRadius: '8px',
                                        padding: '1rem',
                                        textAlign: 'center',
                                        background: formData.imageUrl ? '#f0fdf4' : '#fafafa',
                                        transition: 'all 0.2s',
                                        cursor: 'pointer'
                                    }}>
                                        <input
                                            type="file"
                                            onChange={handleFileUpload}
                                            style={{
                                                position: 'absolute',
                                                opacity: 0,
                                                inset: 0,
                                                cursor: 'pointer',
                                                zIndex: 10
                                            }}
                                            accept="image/*"
                                            disabled={uploading}
                                        />
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontSize: '2rem' }}>{uploading ? '⏳' : formData.imageUrl ? '✅' : '📤'}</span>
                                            <span style={{ fontSize: '0.9rem', color: '#4b5563', fontWeight: 500 }}>
                                                {uploading ? 'Uploading...' : formData.imageUrl ? 'Image Uploaded Successfully' : 'Click to Select Image'}
                                            </span>
                                            {formData.imageUrl && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setFormData({ ...formData, imageUrl: '' });
                                                    }}
                                                    style={{
                                                        marginTop: '0.5rem',
                                                        padding: '0.25rem 0.75rem',
                                                        background: '#fee2e2',
                                                        border: '1px solid #fecaca',
                                                        borderRadius: '4px',
                                                        color: '#dc2626',
                                                        cursor: 'pointer',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 500
                                                    }}
                                                >
                                                    Remove Image
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Related Bible Verse (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.bibleVerse}
                                    onChange={e => setFormData({ ...formData, bibleVerse: e.target.value })}
                                    className="form-input"
                                    placeholder='e.g., "For God so loved the world..." - John 3:16'
                                />
                                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                    This will appear in the red header bar above
                                </p>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Short Excerpt</label>
                                <textarea
                                    value={formData.excerpt}
                                    onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                                    className="form-textarea"
                                    rows={2}
                                    maxLength={200}
                                    placeholder="Brief summary used for the preview card..."
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Full Content</label>
                                <textarea
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    className="form-textarea"
                                    style={{ minHeight: '200px' }}
                                    placeholder="Write your article here..."
                                    required
                                />
                            </div>

                            <div className="checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="checkbox-input"
                                    />
                                    Publish Immediately
                                </label>

                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.isPinned}
                                        onChange={e => setFormData({ ...formData, isPinned: e.target.checked })}
                                        className="checkbox-input"
                                    />
                                    Pin to Top
                                </label>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    style={{ background: 'transparent', border: '1px solid #d1d5db', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                >
                                    {editingNews ? 'Update Post' : 'Publish Post'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
