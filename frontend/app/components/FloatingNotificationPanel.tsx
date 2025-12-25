'use client';

import { useEffect, useState } from 'react';
import { apiEndpoint } from '@/app/config/api';
import './FloatingNotificationPanel.css';

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'urgent';
    priority: number;
    expiryDate?: Date;
    isActive: boolean;
    createdAt: Date;
}

export default function FloatingNotificationPanel() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications();

        // Refresh notifications every 5 minutes
        const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Calculate unread notifications (ones created in the last 24 hours)
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        const unread = notifications.filter(
            (n) => new Date(n.createdAt) > oneDayAgo
        ).length;

        setUnreadCount(unread);
    }, [notifications]);

    const fetchNotifications = async () => {
        try {
            const response = await fetch(apiEndpoint('notifications'));
            const data = await response.json();
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const togglePanel = () => {
        setIsExpanded(!isExpanded);
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'urgent':
                return '🚨';
            case 'warning':
                return '⚠️';
            case 'success':
                return '✅';
            default:
                return 'ℹ️';
        }
    };

    const formatDate = (date: Date) => {
        const now = new Date();
        const notifDate = new Date(date);
        const diffMs = now.getTime() - notifDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return notifDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                className={`notification-toggle ${isExpanded ? 'expanded' : ''}`}
                onClick={togglePanel}
                aria-label="Toggle notifications"
            >
                <span className="bell-icon">🔔</span>
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                )}
            </button>

            {/* Panel */}
            <div className={`notification-panel ${isExpanded ? 'expanded' : ''}`}>
                <div className="notification-header">
                    <h3>Notifications</h3>
                    <button className="close-btn" onClick={togglePanel}>
                        ✕
                    </button>
                </div>

                <div className="notification-list">
                    {notifications.length === 0 ? (
                        <div className="empty-state">
                            <p>No notifications at this time</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification._id}
                                className={`notification-item ${notification.type}`}
                            >
                                <div className="notification-icon">
                                    {getNotificationIcon(notification.type)}
                                </div>
                                <div className="notification-content">
                                    <h4 className="notification-title">{notification.title}</h4>
                                    <p className="notification-message">{notification.message}</p>
                                    <span className="notification-time">
                                        {formatDate(notification.createdAt)}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {notifications.length > 0 && (
                    <div className="notification-footer">
                        <a href="/notifications" className="view-all-link">
                            View All Notifications
                        </a>
                    </div>
                )}
            </div>

            {/* Overlay */}
            {isExpanded && (
                <div className="notification-overlay" onClick={togglePanel}></div>
            )}
        </>
    );
}
