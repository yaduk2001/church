'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiEndpoint } from '@/app/config/api';
import '../../admin-dashboard.css';

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

export default function CategoryDetailPage() {
    const router = useRouter();
    const params = useParams();
    const category = decodeURIComponent(params.category as string);

    const [images, setImages] = useState<GalleryImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    useEffect(() => {
        fetchCategoryImages();
    }, [category]);

    const fetchCategoryImages = async () => {
        try {
            const response = await fetch(apiEndpoint('gallery'));
            if (response.ok) {
                const data = await response.json();
                const filtered = data.filter((img: GalleryImage) => img.category === category);
                setImages(filtered);
            }
        } catch (error) {
            console.error('Error fetching images:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this photo?')) return;

        const token = localStorage.getItem('adminToken');
        try {
            await fetch(apiEndpoint(`gallery/${id}`), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchCategoryImages();
        } catch (error) {
            console.error('Error deleting image:', error);
        }
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

    return (
        <div className="admin-page-container" style={{ padding: '2rem' }}>
            <div className="admin-page-header" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => router.push('/admin/dashboard/gallery')}
                        className="admin-btn admin-btn-secondary"
                        style={{ padding: '0.5rem 1rem' }}
                    >
                        ← Back
                    </button>
                    <div>
                        <h2 className="admin-page-title" style={{ margin: 0 }}>{category}</h2>
                        <p className="admin-page-subtitle" style={{ margin: '0.25rem 0 0 0' }}>
                            {images.length} {images.length === 1 ? 'photo' : 'photos'}
                        </p>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem',
                    color: '#6B7280',
                    fontSize: '1rem'
                }}>
                    Loading photos...
                </div>
            ) : images.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem',
                    background: '#F9FAFB',
                    borderRadius: '0.75rem',
                    border: '2px dashed #D1D5DB',
                    color: '#6B7280'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
                    <p style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>No photos in this category</p>
                </div>
            ) : (
                <div className="admin-gallery-grid">
                    {images.map(image => (
                        <div key={image._id} className="admin-gallery-card">
                            <div
                                className="admin-gallery-image"
                                style={{ cursor: 'pointer' }}
                                onClick={() => { setSelectedImage(image); setIsLightboxOpen(true); }}
                            >
                                <img
                                    src={image.imageUrl}
                                    alt={image.category}
                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Error' }}
                                />
                                {image.label && (
                                    <div
                                        className="admin-gallery-overlay"
                                        style={{
                                            background: getLabelColor(image.label),
                                            fontWeight: '600',
                                            fontSize: '0.75rem',
                                            letterSpacing: '0.05em'
                                        }}
                                    >
                                        {image.label}
                                    </div>
                                )}
                            </div>

                            <div className="admin-gallery-content">
                                {(image.dateTaken || image.location) && (
                                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.5rem' }}>
                                        {image.dateTaken && <div>📅 {new Date(image.dateTaken).toLocaleDateString()}</div>}
                                        {image.location && <div>📍 {image.location}</div>}
                                    </div>
                                )}
                                <p style={{
                                    fontSize: '0.875rem',
                                    lineHeight: '1.4',
                                    color: image.description ? '#374151' : '#9CA3AF',
                                    marginBottom: '1rem'
                                }}>
                                    {image.description || 'No description provided'}
                                </p>

                                <div style={{
                                    display: 'flex',
                                    gap: '0.5rem',
                                    paddingTop: '1rem',
                                    borderTop: '1px solid #F3F4F6'
                                }}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(image._id); }}
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

            {/* Lightbox Modal */}
            {isLightboxOpen && selectedImage && (
                <div
                    className="admin-modal-overlay"
                    onClick={() => setIsLightboxOpen(false)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem',
                        zIndex: 9999
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: 'relative',
                            maxWidth: '90vw',
                            maxHeight: '90vh',
                            background: '#fff',
                            borderRadius: '1rem',
                            overflow: 'hidden',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        <button
                            onClick={() => setIsLightboxOpen(false)}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                width: '2.5rem',
                                height: '2.5rem',
                                borderRadius: '50%',
                                background: 'rgba(0, 0, 0, 0.7)',
                                color: '#fff',
                                border: 'none',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 10,
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.9)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)'}
                        >
                            ✕
                        </button>
                        <img
                            src={selectedImage.imageUrl}
                            alt={selectedImage.category}
                            style={{
                                width: '100%',
                                height: 'auto',
                                maxHeight: '90vh',
                                objectFit: 'contain',
                                display: 'block'
                            }}
                        />
                        {(selectedImage.description || selectedImage.dateTaken || selectedImage.location) && (
                            <div style={{
                                padding: '1.5rem',
                                background: '#fff',
                                borderTop: '1px solid #e5e7eb'
                            }}>
                                {selectedImage.description && (
                                    <p style={{ fontSize: '0.9375rem', color: '#374151', marginBottom: '0.75rem' }}>
                                        {selectedImage.description}
                                    </p>
                                )}
                                {(selectedImage.dateTaken || selectedImage.location) && (
                                    <div style={{ fontSize: '0.8125rem', color: '#6B7280', display: 'flex', gap: '1rem' }}>
                                        {selectedImage.dateTaken && <span>📅 {new Date(selectedImage.dateTaken).toLocaleDateString()}</span>}
                                        {selectedImage.location && <span>📍 {selectedImage.location}</span>}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
