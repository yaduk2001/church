'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { apiEndpoint } from '../config/api';
import './page.css';

interface Document {
    _id: string;
    title: string;
    description: string;
    fileName: string;
    fileUrl: string;
    category: string;
    uploadDate: Date;
    createdAt: Date;
}

export default function DocumentsPage() {
    const { t } = useLanguage();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDocuments();
        fetchCategories();
    }, []);

    useEffect(() => {
        filterDocuments();
    }, [selectedCategory, searchTerm, documents]);

    const fetchDocuments = async () => {
        try {
            const response = await fetch(apiEndpoint('documents'));
            const data = await response.json();
            setDocuments(data);
            setFilteredDocuments(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching documents:', error);
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch(apiEndpoint('documents/categories'));
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const filterDocuments = () => {
        let filtered = documents;

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter((doc) => doc.category === selectedCategory);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(
                (doc) =>
                    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    doc.fileName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredDocuments(filtered);
    };

    const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'pdf':
                return '📄';
            case 'doc':
            case 'docx':
                return '📝';
            case 'xls':
            case 'xlsx':
                return '📊';
            case 'jpg':
            case 'jpeg':
            case 'png':
                return '🖼️';
            default:
                return '📎';
        }
    };

    const getFileExtension = (fileName: string) => {
        return fileName.split('.').pop()?.toUpperCase() || '';
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
            case 'Bulletin':
                return '#5cb85c';
            case 'Newsletter':
                return '#5bc0de';
            case 'Forms':
                return '#f0ad4e';
            case 'Reports':
                return '#d9534f';
            default:
                return '#777';
        }
    };

    const getCountForCategory = (category: string) => {
        return documents.filter((doc) => doc.category === category).length;
    };

    if (loading) {
        return (
            <div className="documents-page">
                <div className="container">
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>{t('documents.loadingDocuments')}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="documents-page">
            <div className="container">
                {/* Page Header */}
                <div className="page-header">
                    <div className="cross-symbol">✟</div>
                    <h1 className="page-title">{t('documents.churchDocuments')}</h1>
                    <p className="page-subtitle">
                        {t('documents.subtitle')}
                    </p>
                </div>

                {/* Search and Filter Section */}
                <div className="controls-section">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder={t('documents.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <span className="search-icon">🔍</span>
                    </div>

                    <div className="category-filters">
                        <button
                            className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('all')}
                        >
                            {t('documents.allDocuments')} ({documents.length})
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category}
                                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(category)}
                                style={{
                                    borderColor: getCategoryColor(category),
                                    color: selectedCategory === category ? 'white' : getCategoryColor(category),
                                    background: selectedCategory === category ? getCategoryColor(category) : 'white',
                                }}
                            >
                                {category} ({getCountForCategory(category)})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Documents Grid */}
                {filteredDocuments.length === 0 ? (
                    <div className="empty-state">
                        <p>{t('documents.noDocumentsFound')}{searchTerm && ` ${t('documents.for')} "${searchTerm}"`}.</p>
                    </div>
                ) : (
                    <>
                        <div className="results-info">
                            <p>
                                {t('documents.showing')} <strong>{filteredDocuments.length}</strong> {t('documents.of')}{' '}
                                <strong>{documents.length}</strong> {documents.length !== 1 ? t('documents.documents') : t('documents.document')}
                            </p>
                        </div>

                        <div className="documents-grid">
                            {filteredDocuments.map((doc, index) => (
                                <div
                                    key={doc._id}
                                    className="document-card"
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    <div className="document-header">
                                        <div className="file-icon">{getFileIcon(doc.fileName)}</div>
                                        <span
                                            className="category-badge"
                                            style={{ background: getCategoryColor(doc.category) }}
                                        >
                                            {doc.category}
                                        </span>
                                    </div>

                                    <div className="document-body">
                                        <h3 className="document-title">{doc.title}</h3>
                                        {doc.description && (
                                            <p className="document-description">{doc.description}</p>
                                        )}

                                        <div className="document-meta">
                                            <span className="meta-item">
                                                📅 {formatDate(doc.uploadDate)}
                                            </span>
                                            <span className="meta-item file-type">
                                                {getFileExtension(doc.fileName)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="document-footer">
                                        <a
                                            href={doc.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="download-btn"
                                        >
                                            ⬇️ {t('documents.download')}
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
