'use client';

import { useState, useEffect } from 'react';
import { apiEndpoint } from '@/app/config/api';
import './documents.css';

interface Document {
    _id: string;
    title: string;
    description: string;
    fileName: string;
    fileUrl: string;
    category: string;
    tags: string[];
    uploadDate: string;
    createdAt: string;
}

export default function DocumentsAdmin() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Other',
        tags: '',
        uploadDate: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const response = await fetch(apiEndpoint('documents'));
            const data = await response.json();
            setDocuments(data);
        } catch (error) {
            console.error('Error fetching documents:', error);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedFile) {
            alert('Please select a file to upload');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('adminToken');
            const formDataToSend = new FormData();

            formDataToSend.append('file', selectedFile);
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('tags', formData.tags);
            formDataToSend.append('uploadDate', formData.uploadDate);

            const response = await fetch(apiEndpoint('documents'), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formDataToSend,
            });

            if (response.ok) {
                alert('Document uploaded successfully!');
                setShowForm(false);
                setFormData({
                    title: '',
                    description: '',
                    category: 'Other',
                    tags: '',
                    uploadDate: new Date().toISOString().split('T')[0],
                });
                setSelectedFile(null);
                fetchDocuments();
            } else {
                const error = await response.json();
                alert(`Failed to upload document: ${error.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error uploading document:', error);
            alert('Error uploading document');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this document?')) return;

        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(apiEndpoint(`documents/${id}`), {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                alert('Document deleted successfully!');
                fetchDocuments();
            } else {
                alert('Failed to delete document');
            }
        } catch (error) {
            console.error('Error deleting document:', error);
            alert('Error deleting document');
        }
    };

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !filterCategory || doc.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="documents-admin">
            <div className="admin-header">
                <h1>📄 Church Documents</h1>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                    {showForm ? '✕ Cancel' : '+ Upload Document'}
                </button>
            </div>

            {showForm && (
                <div className="admin-modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="admin-modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <div>
                                <h3 className="admin-modal-title">
                                    "Your word is a lamp to my feet and a light to my path."
                                </h3>
                                <p style={{
                                    color: 'rgba(255,255,255,0.85)',
                                    fontSize: '0.8125rem',
                                    marginTop: '0.25rem',
                                    fontStyle: 'italic'
                                }}>
                                    — Psalm 119:105
                                </p>
                            </div>
                            <button onClick={() => setShowForm(false)} className="admin-modal-close">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="admin-modal-body">
                            <div className="admin-grid-2">
                                <div className="admin-form-group">
                                    <label className="admin-label">Title *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        placeholder="Document title"
                                        className="admin-input"
                                    />
                                </div>

                                <div className="admin-form-group">
                                    <label className="admin-label">Upload Date *</label>
                                    <input
                                        type="date"
                                        value={formData.uploadDate}
                                        onChange={(e) => setFormData({ ...formData, uploadDate: e.target.value })}
                                        required
                                        className="admin-input"
                                    />
                                </div>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-label">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of the document"
                                    rows={3}
                                    className="admin-textarea"
                                />
                            </div>

                            <div className="admin-grid-2">
                                <div className="admin-form-group">
                                    <label className="admin-label">Category *</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        required
                                        className="admin-select"
                                    >
                                        <option value="Bulletin">Bulletin</option>
                                        <option value="Newsletter">Newsletter</option>
                                        <option value="Forms">Forms</option>
                                        <option value="Reports">Reports</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="admin-form-group">
                                    <label className="admin-label">Tags</label>
                                    <input
                                        type="text"
                                        value={formData.tags}
                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                        placeholder="Comma-separated tags"
                                        className="admin-input"
                                    />
                                </div>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-label">Upload File *</label>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    required
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                                    className="admin-input"
                                    style={{ padding: '0.5rem' }}
                                />
                                {selectedFile && (
                                    <p className="file-selected">Selected: {selectedFile.name}</p>
                                )}
                            </div>

                            <div className="admin-actions">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="admin-btn admin-btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="admin-btn admin-btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Uploading...' : '📤 Upload Document'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="filters-section">
                <input
                    type="text"
                    placeholder="🔍 Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />

                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="filter-select"
                >
                    <option value="">All Categories</option>
                    <option value="Bulletin">Bulletin</option>
                    <option value="Newsletter">Newsletter</option>
                    <option value="Forms">Forms</option>
                    <option value="Reports">Reports</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <div className="documents-grid">
                {filteredDocuments.length === 0 ? (
                    <div className="empty-state">
                        <p>📭 No documents found</p>
                    </div>
                ) : (
                    filteredDocuments.map((doc) => (
                        <div key={doc._id} className="document-card">
                            <div className="doc-header">
                                <h3>{doc.title}</h3>
                                <span className={`category-badge ${doc.category.toLowerCase()}`}>
                                    {doc.category}
                                </span>
                            </div>

                            {doc.description && (
                                <p className="doc-description">{doc.description}</p>
                            )}

                            <div className="doc-meta">
                                <span>📅 {new Date(doc.uploadDate).toLocaleDateString()}</span>
                                <span>📎 {doc.fileName}</span>
                            </div>

                            {doc.tags && doc.tags.length > 0 && (
                                <div className="doc-tags">
                                    {doc.tags.map((tag, index) => (
                                        <span key={index} className="tag">{tag}</span>
                                    ))}
                                </div>
                            )}

                            <div className="doc-actions">
                                <a
                                    href={apiEndpoint(doc.fileUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-view"
                                >
                                    👁️ View
                                </a>
                                <button
                                    onClick={() => handleDelete(doc._id)}
                                    className="btn-delete"
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
