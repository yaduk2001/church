'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiEndpoint } from '@/app/config/api';
import './page.css';

interface NewsArticle {
    _id: string;
    title: string;
    content: string;
    excerpt: string;
    author: string;
    category: string;
    imageUrl?: string;
    publishDate: Date;
    views: number;
    createdAt: Date;
}

export default function NewsDetailPage() {
    const params = useParams();
    const router = useRouter();
    const newsId = params.id as string;

    const [article, setArticle] = useState<NewsArticle | null>(null);
    const [relatedNews, setRelatedNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (newsId) {
            fetchArticle();
            fetchRelatedNews();
        }
    }, [newsId]);

    const fetchArticle = async () => {
        try {
            const response = await fetch(apiEndpoint(`news/${newsId}`));
            if (!response.ok) {
                throw new Error('Article not found');
            }
            const data = await response.json();
            setArticle(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching article:', error);
            setError(true);
            setLoading(false);
        }
    };

    const fetchRelatedNews = async () => {
        try {
            const response = await fetch(apiEndpoint('news?limit=3'));
            const data = await response.json();
            // Filter out current article
            const filtered = data.filter((news: NewsArticle) => news._id !== newsId);
            setRelatedNews(filtered.slice(0, 3));
        } catch (error) {
            console.error('Error fetching related news:', error);
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Parish News':
                return 'var(--primary-burgundy)';
            case 'Events':
                return '#5cb85c';
            case 'Announcements':
                return '#5bc0de';
            case 'Community':
                return '#f0ad4e';
            default:
                return '#777';
        }
    };

    if (loading) {
        return (
            <div className="news-detail-page">
                <div className="container">
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading article...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="news-detail-page">
                <div className="container">
                    <div className="error-state">
                        <h1>📰 Article Not Found</h1>
                        <p>Sorry, we couldn't find the article you're looking for.</p>
                        <Link href="/" className="back-btn">
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="news-detail-page">
            <div className="container">
                {/* Breadcrumb */}
                <nav className="breadcrumb">
                    <Link href="/">Home</Link>
                    <span className="separator">›</span>
                    <Link href="/#news">News</Link>
                    <span className="separator">›</span>
                    <span className="current">{article.title}</span>
                </nav>

                {/* Article Header */}
                <article className="article-container">
                    <header className="article-header">
                        <div className="article-meta-top">
                            <span
                                className="category-badge"
                                style={{ background: getCategoryColor(article.category) }}
                            >
                                {article.category}
                            </span>
                            <span className="publish-date">
                                📅 {formatDate(article.publishDate)}
                            </span>
                            <span className="views">
                                👁️ {article.views} views
                            </span>
                        </div>

                        <h1 className="article-title">{article.title}</h1>

                        <div className="article-meta-bottom">
                            <span className="author">
                                ✍️ By {article.author}
                            </span>
                        </div>
                    </header>

                    {/* Featured Image */}
                    {article.imageUrl && (
                        <div className="featured-image">
                            <img
                                src={article.imageUrl}
                                alt={article.title}
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/placeholder-news.png';
                                }}
                            />
                        </div>
                    )}

                    {/* Article Content */}
                    <div className="article-content">
                        <div className="article-excerpt">
                            {article.excerpt}
                        </div>
                        <div className="article-body">
                            {article.content.split('\n').map((paragraph, index) => (
                                paragraph.trim() && <p key={index}>{paragraph}</p>
                            ))}
                        </div>
                    </div>

                    {/* Article Footer */}
                    <footer className="article-footer">
                        <div className="share-section">
                            <h3>Share this article:</h3>
                            <div className="share-buttons">
                                <button className="share-btn facebook" onClick={() => alert('Share functionality coming soon!')}>
                                    📘 Facebook
                                </button>
                                <button className="share-btn twitter" onClick={() => alert('Share functionality coming soon!')}>
                                    🐦 Twitter
                                </button>
                                <button className="share-btn email" onClick={() => alert('Share functionality coming soon!')}>
                                    ✉️ Email
                                </button>
                            </div>
                        </div>

                        <Link href="/" className="back-to-home">
                            ← Back to Home
                        </Link>
                    </footer>
                </article>

                {/* Related News */}
                {relatedNews.length > 0 && (
                    <section className="related-news">
                        <h2>Related Articles</h2>
                        <div className="related-grid">
                            {relatedNews.map((news) => (
                                <Link
                                    key={news._id}
                                    href={`/news/${news._id}`}
                                    className="related-card"
                                >
                                    {news.imageUrl && (
                                        <div className="related-image">
                                            <img
                                                src={news.imageUrl}
                                                alt={news.title}
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = '/placeholder-news.png';
                                                }}
                                            />
                                        </div>
                                    )}
                                    <div className="related-content">
                                        <span
                                            className="category-badge-small"
                                            style={{ background: getCategoryColor(news.category) }}
                                        >
                                            {news.category}
                                        </span>
                                        <h3>{news.title}</h3>
                                        <p className="related-date">
                                            {formatDate(news.publishDate)}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
