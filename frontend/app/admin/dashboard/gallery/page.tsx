'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiEndpoint } from '@/app/config/api';
import '../admin-dashboard.css';

interface GalleryImage {
    _id: string;
    description?: string;
    imageUrl: string;
    category: string;
    label?: string;
    uploadedBy: string;
    dateTaken?: string;
    location?: string;
}

interface CategoryGroup {
    category: string;
    label?: string;
    photoCount: number;
    coverImage: string;
    photos: GalleryImage[];
}

export default function GalleryPage() {
    const router = useRouter();
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [categories, setCategories] = useState<CategoryGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        description: '',
        category: '',
        label: 'Events',
    });

    useEffect(() => {
        fetchImages();
    }, []);

    useEffect(() => {
        if (images.length > 0) {
            const grouped = images.reduce((acc, image) => {
                const existing = acc.find(g => g.category === image.category);
                if (existing) {
                    existing.photos.push(image);
                    existing.photoCount++;
                } else {
                    acc.push({
                        category: image.category,
                        label: image.label,
                        photoCount: 1,
                        coverImage: image.imageUrl,
                        photos: [image]
                    });
                }
                return acc;
            }, [] as CategoryGroup[]);
            setCategories(grouped);
        } else {
            setCategories([]);
        }
    }, [images]);

    const fetchImages = async () => {
        try {
            const response = await fetch(apiEndpoint('gallery'));
            if (response.ok) {
                const data = await response.json();
                setImages(data);
            }
        } catch (error) {
            console.error('Error fetching images:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setSelectedFiles(files);
        setUploading(true);

        try {
            const token = localStorage.getItem('adminToken');
            const urls: string[] = [];

            for (const file of files) {
                const uploadFormData = new FormData();
                uploadFormData.append('image', file);

                const response = await fetch(apiEndpoint('upload'), {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: uploadFormData
                });

                if (response.ok) {
                    const data = await response.json();
                    urls.push(data.url);
                }
            }

            setUploadedUrls(urls);
        } catch (error) {
            console.error('Error uploading:', error);
            alert('Error uploading images');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (uploadedUrls.length === 0) {
            alert('Please upload at least one image');
            return;
        }

        const token = localStorage.getItem('adminToken');

        try {
            for (const imageUrl of uploadedUrls) {
                await fetch(apiEndpoint('gallery'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        ...formData,
                        imageUrl
                    })
                });
            }

            setIsModalOpen(false);
            fetchImages();
            resetForm();
            alert(`Successfully uploaded ${uploadedUrls.length} image(s)!`);
        } catch (error) {
            console.error('Error saving images:', error);
            alert('Error saving images');
        }
    };

    const handleDeleteCategory = async (category: string) => {
        if (!confirm(`Are you sure you want to delete all photos in "${category}"?`)) return;

        const token = localStorage.getItem('adminToken');
        const categoryPhotos = images.filter(img => img.category === category);

        try {
            for (const photo of categoryPhotos) {
                await fetch(apiEndpoint(`gallery/${photo._id}`), {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }
            fetchImages();
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            description: '',
            category: '',
            label: 'Events',
        });
        setSelectedFiles([]);
        setUploadedUrls([]);
    };

    const getLabelColor = (label?: string) => {
        const colors: { [key: string]: string } = {
            'Events': '#2563EB',
            'Church': '#800020',
            'Community': '#059669',
            'Festivals': '#D97706',
            'Sacraments': '#7C3AED',
            'Other': '#6B7280'
        };
        return colors[label || 'Other'] || '#6B7280';
    };

    const openCategoryDetail = (category: string) => {
        router.push(`/admin/dashboard/gallery/${encodeURIComponent(category)}`);
    };

    return (
        <div className="admin-page-container" style={{ padding: '2rem' }}>
            <div className="admin-page-header">
                <div>
                    <h2 className="admin-page-title">Gallery Management</h2>
                    <p className="admin-page-subtitle">Organize photos by event categories</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="admin-btn admin-btn-primary"
                    style={{ fontSize: '0.9375rem', padding: '0.75rem 1.5rem' }}
                >
                    <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>📸</span>
                    Upload Photos
                </button>
            </div>

            {isLoading ? (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem',
                    color: '#6B7280',
                    fontSize: '1rem'
                }}>
                    Loading gallery...
                </div>
            ) : categories.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem',
                    background: '#F9FAFB',
                    borderRadius: '0.75rem',
                    border: '2px dashed #D1D5DB',
                    color: '#6B7280'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
                    <p style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>No categories found</p>
                    <p style={{ fontSize: '0.875rem' }}>Upload some photos to get started!</p>
                </div>
            ) : (
                <div className="admin-gallery-grid">
                    {categories.map(cat => (
                        <div
                            key={cat.category}
                            className="admin-gallery-card"
                            style={{ cursor: 'pointer' }}
                            onClick={() => openCategoryDetail(cat.category)}
                        >
                            <div className="admin-gallery-image">
                                <img
                                    src={cat.coverImage}
                                    alt={cat.category}
                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image' }}
                                />
                                <div
                                    className="admin-gallery-overlay"
                                    style={{
                                        background: getLabelColor(cat.label),
                                        fontWeight: '600',
                                        fontSize: '0.75rem',
                                        letterSpacing: '0.05em'
                                    }}
                                >
                                    {cat.label || 'Other'}
                                </div>
                            </div>

                            <div className="admin-gallery-content">
                                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                                    {cat.category}
                                </h3>
                                <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '1rem' }}>
                                    {cat.photoCount} {cat.photoCount === 1 ? 'photo' : 'photos'}
                                </p>

                                <div style={{
                                    display: 'flex',
                                    gap: '0.5rem',
                                    paddingTop: '1rem',
                                    borderTop: '1px solid #F3F4F6'
                                }}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); openCategoryDetail(cat.category); }}
                                        className="admin-btn admin-btn-icon"
                                        style={{
                                            flex: 1,
                                            justifyContent: 'center',
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        👁️ View
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.category); }}
                                        className="admin-btn admin-btn-danger"
                                        style={{
                                            flex: 1,
                                            justifyContent: 'center',
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            {isModalOpen && (
                <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="admin-modal-container" style={{ maxWidth: '32rem' }} onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3 className="admin-modal-title">
                                📸 Upload Photos
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="admin-modal-close">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="admin-modal-body">
                            <div className="admin-form-group">
                                <label className="admin-label">Select Images (Multiple)</label>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1rem',
                                    padding: '1.5rem',
                                    background: '#F9FAFB',
                                    borderRadius: '0.75rem',
                                    border: '2px dashed #D1D5DB'
                                }}>
                                    {uploadedUrls.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                                                {uploadedUrls.map((url, idx) => (
                                                    <img
                                                        key={idx}
                                                        src={url}
                                                        alt={`Preview ${idx + 1}`}
                                                        style={{
                                                            width: '100%',
                                                            height: '80px',
                                                            objectFit: 'cover',
                                                            borderRadius: '0.5rem',
                                                            border: '2px solid #D4AF37'
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '500' }}>
                                                ✓ {uploadedUrls.length} image(s) uploaded successfully
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '1rem' }}>
                                            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📷</div>
                                            <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>
                                                Choose multiple images from your computer
                                            </p>
                                        </div>
                                    )}
                                    <div>
                                        <label htmlFor="image-upload" className="admin-btn admin-btn-secondary" style={{ cursor: 'pointer', width: '100%', justifyContent: 'center' }}>
                                            {uploading ? '⏳ Uploading...' : uploadedUrls.length > 0 ? '🔄 Change Images' : '📤 Choose Images'}
                                        </label>
                                        <input
                                            id="image-upload"
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleFileSelect}
                                            style={{ display: 'none' }}
                                            disabled={uploading}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-label">Event/Category Name</label>
                                <input
                                    type="text"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="admin-input"
                                    placeholder="e.g., Holy Mass, Easter Sunday, Christmas Celebration"
                                    required
                                />
                                <p style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.5rem' }}>
                                    All selected images will be added to this category
                                </p>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-label">Label (Optional)</label>
                                <select
                                    value={formData.label}
                                    onChange={e => setFormData({ ...formData, label: e.target.value })}
                                    className="admin-select"
                                >
                                    {['Events', 'Church', 'Community', 'Festivals', 'Sacraments', 'Other'].map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-label">Description (Optional)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="admin-textarea"
                                    rows={3}
                                    placeholder="Add a brief description for these photos..."
                                />
                            </div>

                            <div className="admin-actions">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="admin-btn admin-btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="admin-btn admin-btn-primary"
                                    disabled={uploadedUrls.length === 0}
                                >
                                    📤 Upload {uploadedUrls.length > 0 ? `${uploadedUrls.length} Photo(s)` : 'Photos'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
