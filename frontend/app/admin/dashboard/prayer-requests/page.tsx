'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiEndpoint } from '@/app/config/api';
import './prayer-requests.css';

interface PrayerRequest {
    _id: string;
    name: string;
    email: string;
    phone: string;
    prayerRequest: string;
    isAnonymous: boolean;
    status: 'pending' | 'approved' | 'archived';
    createdAt: string;
    updatedAt: string;
}

export default function AdminPrayerRequestsPage() {
    const router = useRouter();
    const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<PrayerRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'archived'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    useEffect(() => {
        fetchPrayerRequests();
    }, []);

    useEffect(() => {
        filterRequests();
    }, [prayerRequests, filterStatus, searchTerm]);

    const fetchPrayerRequests = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                router.push('/admin');
                return;
            }

            const response = await fetch(apiEndpoint('prayer-requests/admin'), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch prayer requests');
            }

            const data = await response.json();
            setPrayerRequests(data);
        } catch (err) {
            setError('Failed to load prayer requests');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filterRequests = () => {
        let filtered = [...prayerRequests];

        // Filter by status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(req => req.status === filterStatus);
        }

        // Filter by search term
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(req =>
                req.name.toLowerCase().includes(search) ||
                req.email.toLowerCase().includes(search) ||
                req.prayerRequest.toLowerCase().includes(search)
            );
        }

        setFilteredRequests(filtered);
    };

    const handleDelete = async (id: string) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(apiEndpoint(`prayer-requests/${id}`), {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete prayer request');
            }

            setPrayerRequests(prev => prev.filter(req => req._id !== id));
            setDeleteConfirm(null);
        } catch (err) {
            alert('Failed to delete prayer request');
            console.error(err);
        }
    };

    const handleStatusChange = async (id: string, newStatus: 'pending' | 'approved' | 'archived') => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(apiEndpoint(`prayer-requests/${id}/status`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            const updatedRequest = await response.json();
            setPrayerRequests(prev =>
                prev.map(req => req._id === id ? updatedRequest : req)
            );
        } catch (err) {
            alert('Failed to update status');
            console.error(err);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="admin-prayer-requests">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading prayer requests...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-prayer-requests">
            <div className="page-header">
                <h1>🙏 Prayer Requests</h1>
                <p>Manage and review prayer requests from parishioners</p>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search by name, email, or request..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="status-filters">
                    <button
                        className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('all')}
                    >
                        All ({prayerRequests.length})
                    </button>
                    <button
                        className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('pending')}
                    >
                        Pending ({prayerRequests.filter(r => r.status === 'pending').length})
                    </button>
                    <button
                        className={`filter-btn ${filterStatus === 'approved' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('approved')}
                    >
                        Approved ({prayerRequests.filter(r => r.status === 'approved').length})
                    </button>
                    <button
                        className={`filter-btn ${filterStatus === 'archived' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('archived')}
                    >
                        Archived ({prayerRequests.filter(r => r.status === 'archived').length})
                    </button>
                </div>
            </div>

            {/* Prayer Requests Grid */}
            {error && <div className="error-message">{error}</div>}

            {filteredRequests.length === 0 ? (
                <div className="empty-state">
                    <p>📭 No prayer requests found</p>
                </div>
            ) : (
                <div className="requests-grid">
                    {filteredRequests.map((request) => (
                        <div key={request._id} className={`request-card status-${request.status}`}>
                            <div className="card-header">
                                <div className="user-info">
                                    <h3>{request.isAnonymous ? '🕊️ Anonymous' : request.name}</h3>
                                    <span className="date">{formatDate(request.createdAt)}</span>
                                </div>
                                <span className={`status-badge ${request.status}`}>
                                    {request.status}
                                </span>
                            </div>

                            <div className="card-body">
                                {!request.isAnonymous && (
                                    <div className="contact-info">
                                        <p><strong>Email:</strong> {request.email}</p>
                                        <p><strong>Phone:</strong> {request.phone}</p>
                                    </div>
                                )}

                                <div className="prayer-text">
                                    <strong>Prayer Request:</strong>
                                    <p>{request.prayerRequest}</p>
                                </div>
                            </div>

                            <div className="card-actions">
                                <select
                                    value={request.status}
                                    onChange={(e) => handleStatusChange(request._id, e.target.value as any)}
                                    className="status-select"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="archived">Archived</option>
                                </select>

                                {deleteConfirm === request._id ? (
                                    <div className="delete-confirm">
                                        <span>Delete?</span>
                                        <button
                                            onClick={() => handleDelete(request._id)}
                                            className="btn-confirm"
                                        >
                                            Yes
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(null)}
                                            className="btn-cancel"
                                        >
                                            No
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setDeleteConfirm(request._id)}
                                        className="btn-delete"
                                    >
                                        🗑️ Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
