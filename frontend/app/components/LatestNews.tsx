'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../contexts/LanguageContext';
import { apiEndpoint } from '../config/api';
import './LatestNews.css';

interface NewsItem {
    _id: string;
    title: string;
    content: string;
    excerpt?: string;
    category: string;
    imageUrl?: string;
    publishDate: Date;
    isPinned: boolean;
    views: number;
}

export default function LatestNews() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        fetchLatestNews();
    }, []);

    const fetchLatestNews = async () => {
        try {
            const response = await fetch(apiEndpoint('news?limit=3'));
            if (response.ok) {
                const data = await response.json();
                setNews(data);
            } else {
                setNews([]);
            }
        } catch (error) {
            console.error('Error fetching news:', error);
            setNews([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <section className="news-section section">
                <div className="container">
                    <h2 className="section-title">{t('home.latestNewsTitle')}</h2>
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>{t('common.loading')}</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="news-section section" style={{ background: 'linear-gradient(180deg, #fafafa 0%, #ffffff 100%)', padding: '4rem 0', position: 'relative', overflow: 'hidden' }}>
            {/* Decorative Dignitary (Bishop) - Watermark Style */}
            <div style={{
                position: 'absolute',
                top: '50px',
                left: '-80px',
                width: '350px',
                height: '500px',
                backgroundImage: 'url("/images/dignitaries/K 02 PNG.png")',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                opacity: 0.05,
                zIndex: 0,
                pointerEvents: 'none'
            }} className="desktop-only-decor" />
            <div className="container">
                <h2 className="section-title" style={{
                    fontSize: '2.25rem',
                    color: '#800020',
                    textAlign: 'center',
                    marginBottom: '0.5rem',
                    fontWeight: '700'
                }}>{t('news.latestNewsEvents')}</h2>
                <p className="section-subtitle" style={{
                    textAlign: 'center',
                    color: '#6B7280',
                    fontSize: '0.95rem',
                    marginBottom: '2.5rem'
                }}>
                    {t('news.stayUpdated')}
                </p>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '2rem',
                    marginTop: '2rem',
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}>
                    {news.map((item) => (
                        <div
                            key={item._id}
                            style={{
                                position: 'relative',
                                background: 'white',
                                borderRadius: '14px',
                                overflow: 'hidden',
                                boxShadow: '0 6px 20px rgba(128, 0, 32, 0.1)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                border: '1px solid rgba(128, 0, 32, 0.08)',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-8px)';
                                e.currentTarget.style.boxShadow = '0 12px 32px rgba(128, 0, 32, 0.18)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(128, 0, 32, 0.1)';
                            }}
                        >
                            {/* Decorative top border */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '3px',
                                background: 'linear-gradient(90deg, #800020, #D4AF37)',
                                zIndex: 10
                            }} />

                            {item.isPinned && (
                                <div style={{
                                    position: 'absolute',
                                    top: '12px',
                                    left: '12px',
                                    background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                                    color: 'white',
                                    padding: '0.4rem 0.9rem',
                                    borderRadius: '20px',
                                    fontSize: '0.7rem',
                                    fontWeight: '700',
                                    zIndex: 10,
                                    boxShadow: '0 3px 10px rgba(220, 38, 38, 0.4)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.3px'
                                }}>
                                    📌 {t('news.pinned')}
                                </div>
                            )}

                            <div style={{ position: 'relative', width: '100%', height: '180px', overflow: 'hidden' }}>
                                <img
                                    src={item.imageUrl || '/placeholder-news.png'}
                                    alt={item.title}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/placeholder-news.png';
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.08)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                />

                                <div className="news-category-badge">
                                    {item.category}
                                </div>
                            </div>

                            <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    marginBottom: '0.75rem',
                                    fontSize: '0.8rem',
                                    color: '#9CA3AF'
                                }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        📅 {new Date(item.publishDate).toLocaleDateString()}
                                    </span>
                                    <span>•</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        👁️ {item.views || 0} {t('news.views')}
                                    </span>
                                </div>

                                <h3 style={{
                                    fontSize: '1.15rem',
                                    color: '#800020',
                                    marginBottom: '0.6rem',
                                    fontWeight: '700',
                                    lineHeight: '1.4',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>
                                    {item.title}
                                </h3>

                                <p style={{
                                    color: '#6B7280',
                                    fontSize: '0.9rem',
                                    lineHeight: '1.6',
                                    marginBottom: '1rem',
                                    flex: 1,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>
                                    {item.content}
                                </p>

                                <Link
                                    href={`/news/${item._id}`}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        color: '#D4AF37',
                                        textDecoration: 'none',
                                        fontWeight: '700',
                                        fontSize: '0.85rem',
                                        padding: '0.6rem 1.2rem',
                                        background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05))',
                                        borderRadius: '25px',
                                        border: '2px solid rgba(212, 175, 55, 0.25)',
                                        transition: 'all 0.3s ease',
                                        alignSelf: 'flex-start'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = 'white';
                                        e.currentTarget.style.background = 'linear-gradient(135deg, #800020, #600018)';
                                        e.currentTarget.style.borderColor = '#800020';
                                        e.currentTarget.style.transform = 'translateX(4px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = '#D4AF37';
                                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05))';
                                        e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.25)';
                                        e.currentTarget.style.transform = 'translateX(0)';
                                    }}
                                >
                                    {t('buttons.readMore')} →
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                    <Link
                        href="/news"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: 'white',
                            textDecoration: 'none',
                            fontWeight: '700',
                            fontSize: '0.95rem',
                            padding: '0.9rem 2.2rem',
                            background: 'linear-gradient(135deg, #800020, #600018)',
                            borderRadius: '30px',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 16px rgba(128, 0, 32, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(128, 0, 32, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(128, 0, 32, 0.3)';
                        }}
                    >
                        {t('buttons.viewAllNews')}
                    </Link>
                </div>
            </div>
        </section>
    );
}
