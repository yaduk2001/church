'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../contexts/LanguageContext';
import { apiEndpoint } from '../config/api';
import './page.css';

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: 'announcement' | 'event' | 'urgent' | 'general';
    priority: 'high' | 'medium' | 'low';
    isActive: boolean;
    expiryDate?: Date;
    createdAt: Date;
}

export default function NotificationsPage() {
    const { t } = useLanguage();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await fetch(apiEndpoint('notifications'));
            const data = await response.json();
            setNotifications(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setLoading(false);
        }
    };

    const getFilteredNotifications = () => {
        if (filter === 'all') return notifications;
        return notifications.filter((n) => n.type === filter);
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'urgent': return '🚨';
            case 'announcement': return '📢';
            case 'event': return '📅';
            default: return 'ℹ️';
        }
    };

    const getRelativeTime = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - new Date(date).getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    const filteredNotifications = getFilteredNotifications();

    if (loading) {
        return (
            <div className="notifications-page">
                <div className="container">
                    <div className="page-header">
                        <h1 className="page-title">{t('notifications.allAnnouncements')}</h1>
                    </div>
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>{t('notifications.loadingAnnouncements')}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="notifications-page">
            <div className="container">
                {/* Page Header */}
                <div className="page-header">
                    <div className="cross-symbol">✟</div>
                    <h1 className="page-title">{t('notifications.parishAnnouncements')}</h1>
                    <p className="page-subtitle">
                        {t('notifications.subtitle')}
                    </p>
                    <Link href="/" className="back-btn">
                        {t('notifications.backToHome')}
                    </Link>
                </div>

                {/* Filter Tabs */}
                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        {t('notifications.all')} ({notifications.length})
                    </button>
                    <button
                        className={`filter-tab ${filter === 'urgent' ? 'active' : ''}`}
                        onClick={() => setFilter('urgent')}
                    >
                        🚨 {t('notifications.urgent')}
                    </button>
                    <button
                        className={`filter-tab ${filter === 'announcement' ? 'active' : ''}`}
                        onClick={() => setFilter('announcement')}
                    >
                        📢 {t('notifications.announcements')}
                    </button>
                    <button
                        className={`filter-tab ${filter === 'event' ? 'active' : ''}`}
                        onClick={() => setFilter('event')}
                    >
                        📅 {t('notifications.events')}
                    </button>
                    <button
                        className={`filter-tab ${filter === 'general' ? 'active' : ''}`}
                        onClick={() => setFilter('general')}
                    >
                        ℹ️ {t('notifications.general')}
                    </button>
                </div>

                {/* Notifications List */}
                {filteredNotifications.length === 0 ? (
                    <div className="empty-state">
                        <p>{t('notifications.noAnnouncements')}</p>
                    </div>
                ) : (
                    <div className="notifications-list">
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification._id}
                                className={`notification-card ${notification.type} ${notification.priority}`}
                            >
                                <div className="notification-icon">
                                    {getNotificationIcon(notification.type)}
                                </div>
                                <div className="notification-content">
                                    <div className="notification-header">
                                        <h3 className="notification-title">{notification.title}</h3>
                                        <span className="notification-time">
                                            {getRelativeTime(notification.createdAt)}
                                        </span>
                                    </div>
                                    <p className="notification-message">{notification.message}</p>
                                    <div className="notification-meta">
                                        <span className={`badge badge-${notification.type}`}>
                                            {notification.type}
                                        </span>
                                        <span className={`badge badge-${notification.priority}`}>
                                            {notification.priority} {t('notifications.priorityLabel')}
                                        </span>
                                        {notification.expiryDate && (
                                            <span className="expiry-date">
                                                {t('notifications.expires')}: {new Date(notification.expiryDate).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
