'use client';

import { useState, useEffect } from 'react';
import { apiEndpoint } from '@/app/config/api';
import './hero-slider.css';

interface HeroSlide {
    _id: string;
    imageUrl: string;
    displayOrder: number;
    isActive: boolean;
}

export default function HeroSliderPage() {
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchSlides();
    }, []);

    const fetchSlides = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(apiEndpoint('hero-slider/admin'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setSlides(data);
            }
        } catch (error) {
            console.error('Error fetching slides:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMultipleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const fileArray = Array.from(files);
        const currentCount = slides.length;
        const newCount = currentCount + fileArray.length;

        // Validation: Check minimum
        if (currentCount === 0 && fileArray.length < 2) {
            alert('⚠️ Please select at least 2 images for the first upload');
            e.target.value = '';
            return;
        }

        // Validation: Check maximum
        if (newCount > 5) {
            alert(`⚠️ Maximum 5 images allowed. You have ${currentCount} images and selected ${fileArray.length}. Please select ${5 - currentCount} or fewer images.`);
            e.target.value = '';
            return;
        }

        setUploading(true);
        const token = localStorage.getItem('adminToken');
        let successCount = 0;
        let failCount = 0;

        try {
            for (let i = 0; i < fileArray.length; i++) {
                const file = fileArray[i];
                const uploadFormData = new FormData();
                uploadFormData.append('image', file);

                try {
                    // Upload image
                    const uploadResponse = await fetch(apiEndpoint('upload'), {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        body: uploadFormData
                    });

                    if (uploadResponse.ok) {
                        const uploadData = await uploadResponse.json();

                        // Create slider entry
                        const sliderResponse = await fetch(apiEndpoint('hero-slider'), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                imageUrl: uploadData.url,
                                displayOrder: currentCount + i,
                                isActive: true
                            })
                        });

                        if (sliderResponse.ok) {
                            successCount++;
                        } else {
                            failCount++;
                        }
                    } else {
                        failCount++;
                    }
                } catch (error) {
                    console.error(`Error uploading file ${i + 1}:`, error);
                    failCount++;
                }
            }

            // Show result
            if (successCount > 0) {
                fetchSlides();
            }

            if (failCount === 0) {
                alert(`✅ Successfully uploaded ${successCount} banner image${successCount > 1 ? 's' : ''}!`);
            } else if (successCount > 0) {
                alert(`⚠️ Uploaded ${successCount} image${successCount > 1 ? 's' : ''}, but ${failCount} failed.`);
            } else {
                alert('❌ All uploads failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during batch upload:', error);
            alert('❌ Error uploading images');
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset file input
        }
    };

    const handleDelete = async (id: string) => {
        if (slides.length <= 2) {
            alert('⚠️ Minimum 2 banner images required');
            return;
        }

        if (!confirm('Are you sure you want to delete this banner image?')) return;

        const token = localStorage.getItem('adminToken');
        try {
            const response = await fetch(apiEndpoint(`hero-slider/${id}`), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                fetchSlides();
            } else {
                const errorData = await response.json();
                alert(`❌ ${errorData.message || 'Failed to delete'}`);
            }
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    const handleToggleActive = async (slide: HeroSlide) => {
        const token = localStorage.getItem('adminToken');
        try {
            const response = await fetch(apiEndpoint(`hero-slider/${slide._id}`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...slide,
                    isActive: !slide.isActive
                })
            });

            if (response.ok) {
                fetchSlides();
            }
        } catch (error) {
            console.error('Error updating:', error);
        }
    };

    const handleDeleteAll = async () => {
        if (!confirm('⚠️ Are you sure you want to delete ALL banner images? You will need to upload at least 2 new images.')) return;

        const token = localStorage.getItem('adminToken');
        setUploading(true);

        try {
            let successCount = 0;
            let failCount = 0;

            for (const slide of slides) {
                try {
                    const response = await fetch(apiEndpoint(`hero-slider/${slide._id}`), {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (response.ok) {
                        successCount++;
                    } else {
                        failCount++;
                    }
                } catch (error) {
                    failCount++;
                }
            }

            fetchSlides();

            if (failCount === 0) {
                alert(`✅ All ${successCount} banner images deleted successfully!`);
            } else {
                alert(`⚠️ Deleted ${successCount} images, but ${failCount} failed.`);
            }
        } catch (error) {
            console.error('Error deleting all:', error);
            alert('❌ Error deleting images');
        } finally {
            setUploading(false);
        }
    };

    const canAddMore = slides.length < 5;
    const hasMinimum = slides.length >= 2;
    const remainingSlots = 5 - slides.length;

    return (
        <div className="hero-slider-container">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Banner Images</h2>
                    <p className="page-subtitle">Upload 2-5 background images for the welcome section</p>
                </div>
                <div className="header-actions">
                    {slides.length > 0 && (
                        <button
                            onClick={handleDeleteAll}
                            className="btn btn-danger-outline"
                            disabled={uploading}
                        >
                            🗑️ Delete All
                        </button>
                    )}
                    {canAddMore && (
                        <div>
                            <label htmlFor="slider-upload" className="btn btn-primary file-input-label">
                                <span>📸</span>
                                {uploading ? 'Uploading...' : slides.length === 0 ? 'Upload Images (2-5)' : `Add Images (${remainingSlots} left)`}
                            </label>
                            <input
                                id="slider-upload"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleMultipleFileUpload}
                                style={{ display: 'none' }}
                                disabled={uploading}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Status Alert */}
            {!hasMinimum && (
                <div className="alert-box alert-warning">
                    <span>⚠️</span>
                    <strong>You need at least 2 banner images. Currently: {slides.length}/2</strong>
                </div>
            )}

            {slides.length >= 5 && (
                <div className="alert-box alert-info">
                    <span>ℹ️</span>
                    <strong>Maximum limit reached (5/5). Delete an image to add a new one.</strong>
                </div>
            )}

            {isLoading ? (
                <div className="empty-state">
                    Loading banner images...
                </div>
            ) : slides.length === 0 ? (
                <div className="empty-state">
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🖼️</div>
                    <p style={{ fontWeight: 600, fontSize: '1.2rem', color: '#111827' }}>No banner images yet</p>
                    <p>Upload 2-5 images for the welcome section background</p>
                </div>
            ) : (
                <div className="slides-grid">
                    {slides.map((slide, index) => (
                        <div key={slide._id} className="slide-card">
                            <div className="slide-image-container">
                                <img
                                    src={slide.imageUrl}
                                    alt={`Slide ${index + 1}`}
                                    className="slide-image"
                                />
                                <div className="slide-badge">
                                    #{slide.displayOrder + 1}
                                </div>
                            </div>

                            <div className="slide-content">
                                <div className="slide-controls">
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={slide.isActive}
                                            onChange={() => handleToggleActive(slide)}
                                            className="toggle-input"
                                        />
                                        <span>{slide.isActive ? 'Active' : 'Inactive'}</span>
                                    </label>
                                </div>

                                <button
                                    onClick={() => handleDelete(slide._id)}
                                    className="btn btn-delete"
                                    disabled={slides.length <= 2}
                                    title={slides.length <= 2 ? "Minimum 2 images required" : "Delete Image"}
                                >
                                    🗑️ Delete Image
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
