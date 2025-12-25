'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiEndpoint } from '@/app/config/api';
import './messages.css';

interface ContactMessage {
    _id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    createdAt: string;
    updatedAt: string;
    status: 'new' | 'read' | 'responded';
}

export default function AdminMessagesPage() {
    const router = useRouter();
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'read' | 'responded'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMessages();
    }, []);

    useEffect(() => {
        filterMessages();
    }, [messages, filterStatus, searchTerm]);

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                router.push('/admin');
                return;
            }

            const response = await fetch(apiEndpoint('contact'), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch messages');
            }

            const data = await response.json();
            setMessages(data);
        } catch (err) {
            setError('Failed to load messages');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filterMessages = () => {
        let filtered = [...messages];

        // Filter by status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(msg => msg.status === filterStatus);
        }

        // Filter by search term
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(msg =>
                msg.name.toLowerCase().includes(search) ||
                msg.email.toLowerCase().includes(search) ||
                msg.subject.toLowerCase().includes(search) ||
                msg.message.toLowerCase().includes(search)
            );
        }

        setFilteredMessages(filtered);
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
            <div className="admin-messages">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading messages...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-messages">
            <div className="page-header">
                <h1>✉️ Contact Messages</h1>
                <p>View and manage messages from visitors</p>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search by name, email, subject, or message..."
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
                        All ({messages.length})
                    </button>
                    <button
                        className={`filter-btn ${filterStatus === 'new' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('new')}
                    >
                        New ({messages.filter(m => m.status === 'new').length})
                    </button>
                    <button
                        className={`filter-btn ${filterStatus === 'read' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('read')}
                    >
                        Read ({messages.filter(m => m.status === 'read').length})
                    </button>
                    <button
                        className={`filter-btn ${filterStatus === 'responded' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('responded')}
                    >
                        Responded ({messages.filter(m => m.status === 'responded').length})
                    </button>
                </div>
            </div>

            {/* Messages Grid */}
            {error && <div className="error-message">{error}</div>}

            {filteredMessages.length === 0 ? (
                <div className="empty-state">
                    <p>📭 No messages found</p>
                </div>
            ) : (
                <div className="messages-grid">
                    {filteredMessages.map((message) => (
                        <div key={message._id} className={`message-card status-${message.status}`}>
                            <div className="card-header">
                                <div className="user-info">
                                    <h3>{message.name}</h3>
                                    <span className="date">{formatDate(message.createdAt)}</span>
                                </div>
                                <span className={`status-badge ${message.status}`}>
                                    {message.status}
                                </span>
                            </div>

                            <div className="card-body">
                                <div className="contact-info">
                                    <p><strong>Email:</strong> <a href={`mailto:${message.email}`}>{message.email}</a></p>
                                    <p><strong>Subject:</strong> {message.subject}</p>
                                </div>

                                <div className="message-text">
                                    <strong>Message:</strong>
                                    <p>{message.message}</p>
                                </div>
                            </div>

                            <div className="card-actions">
                                <a
                                    href={`mailto:${message.email}?subject=Re: ${message.subject}`}
                                    className="btn-reply"
                                >
                                    ✉️ Reply via Email
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
