'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { apiEndpoint } from '../config/api';
import './page.css';

interface GalleryImage {
    _id: string;
    title: string;
    description: string;
    imageUrl: string;
    category: string;
    eventDate?: Date;
    uploadedBy: string;
    createdAt: Date;
}

export default function GalleryPage() {
    const { t } = useLanguage();
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [filteredImages, setFilteredImages] = useState<GalleryImage[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGalleryData();
    }, []);

    useEffect(() => {
        filterImages();
    }, [activeCategory, images]);

    const fetchGalleryData = async () => {
        try {
            // Fetch images
            const imagesResponse = await fetch(apiEndpoint('gallery'));
            const imagesData = await imagesResponse.json();
            setImages(imagesData);
            setFilteredImages(imagesData);

            // Fetch categories
            const categoriesResponse = await fetch(apiEndpoint('gallery/categories'));
            const categoriesData = await categoriesResponse.json();
            setCategories(categoriesData);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching gallery data:', error);
            setLoading(false);
        }
    };

    const filterImages = () => {
        if (activeCategory === 'all') {
            setFilteredImages(images);
        } else {
            setFilteredImages(images.filter((img) => img.category === activeCategory));
        }
    };

    const openLightbox = (image: GalleryImage) => {
        setSelectedImage(image);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setSelectedImage(null);
        document.body.style.overflow = 'auto';
    };

    const navigateLightbox = (direction: 'next' | 'prev') => {
        if (!selectedImage) return;

        const currentIndex = filteredImages.findIndex((img) => img._id === selectedImage._id);
        let newIndex;

        if (direction === 'next') {
            newIndex = (currentIndex + 1) % filteredImages.length;
        } else {
            newIndex = currentIndex === 0 ? filteredImages.length - 1 : currentIndex - 1;
        }

        setSelectedImage(filteredImages[newIndex]);
    };

    const formatDate = (date?: Date) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Keyboard navigation for lightbox
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!selectedImage) return;

            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') navigateLightbox('next');
            if (e.key === 'ArrowLeft') navigateLightbox('prev');
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedImage, filteredImages]);

    if (loading) {
        return (
            <div className="gallery-page">
                <div className="container">
                    <div className="page-header">
                        <h1 className="page-title">{t('gallery.photoGallery')}</h1>
                    </div>
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>{t('gallery.loadingGallery')}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="gallery-page">
            <div className="container">
                {/* Page Header */}
                <div className="page-header">
                    <div className="cross-symbol">✟</div>
                    <h1 className="page-title">{t('gallery.photoGallery')}</h1>
                    <p className="page-subtitle">
                        {t('gallery.subtitle')}
                    </p>
                </div>

                {/* Category Filters */}
                <div className="category-filters">
                    <button
                        className={`category-btn ${activeCategory === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('all')}
                    >
                        {t('gallery.all')} ({images.length})
                    </button>
                    {categories.map((category) => {
                        const count = images.filter((img) => img.category === category).length;
                        return (
                            <button
                                key={category}
                                className={`category-btn ${activeCategory === category ? 'active' : ''}`}
                                onClick={() => setActiveCategory(category)}
                            >
                                {category} ({count})
                            </button>
                        );
                    })}
                </div>

                {/* Gallery Grid */}
                {filteredImages.length === 0 ? (
                    <div className="empty-state">
                        <p>{t('gallery.noImagesFound')}</p>
                    </div>
                ) : (
                    <div className="gallery-grid">
                        {filteredImages.map((image, index) => (
                            <div
                                key={image._id}
                                className="gallery-item"
                                onClick={() => openLightbox(image)}
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className="image-wrapper">
                                    <img
                                        src={image.imageUrl}
                                        alt={image.title}
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = '/placeholder-news.png';
                                        }}
                                    />
                                    <div className="image-overlay">
                                        <div className="overlay-content">
                                            <h3 className="image-title">{image.title}</h3>
                                            <p className="image-category">📂 {image.category}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Stats Footer */}
                <div className="gallery-stats">
                    <p>
                        {t('gallery.showing')} <strong>{filteredImages.length}</strong> {t('gallery.of')}{' '}
                        <strong>{images.length}</strong> {t('gallery.images')}
                        {activeCategory !== 'all' && ` ${t('gallery.in')} ${activeCategory}`}
                    </p>
                </div>
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div className="lightbox-overlay" onClick={closeLightbox}>
                    <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
                        {/* Close Button */}
                        <button className="lightbox-close" onClick={closeLightbox}>
                            ✕
                        </button>

                        {/* Navigation Arrows */}
                        <button
                            className="lightbox-nav lightbox-prev"
                            onClick={() => navigateLightbox('prev')}
                        >
                            ‹
                        </button>
                        <button
                            className="lightbox-nav lightbox-next"
                            onClick={() => navigateLightbox('next')}
                        >
                            ›
                        </button>

                        {/* Image */}
                        <div className="lightbox-image-wrapper">
                            <img
                                src={selectedImage.imageUrl}
                                alt={selectedImage.title}
                                className="lightbox-image"
                            />
                        </div>

                        {/* Image Info */}
                        <div className="lightbox-info">
                            <h2 className="lightbox-title">{selectedImage.title}</h2>
                            {selectedImage.description && (
                                <p className="lightbox-description">{selectedImage.description}</p>
                            )}
                            <div className="lightbox-meta">
                                <span className="meta-item">
                                    📂 {selectedImage.category}
                                </span>
                                {selectedImage.eventDate && (
                                    <span className="meta-item">
                                        📅 {formatDate(selectedImage.eventDate)}
                                    </span>
                                )}
                                <span className="meta-item">
                                    👤 {selectedImage.uploadedBy}
                                </span>
                            </div>
                            <p className="lightbox-hint">
                                {t('gallery.navigationHint')}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
