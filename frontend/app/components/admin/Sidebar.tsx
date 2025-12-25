'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userData = localStorage.getItem('adminUser');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        router.push('/admin');
    };

    // ... imports ...

    const isActive = (path: string) => {
        return pathname === path ? 'active' : '';
    };

    const menuItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
        { name: 'Registered Families', path: '/admin/dashboard/registered-families', icon: '👨‍👩‍👧‍👦' },
        { name: 'Live Stream', path: '/admin/dashboard/live-stream', icon: '📡' },
        { name: 'Prayer Requests', path: '/admin/dashboard/prayer-requests', icon: '🙏' },
        { name: 'Messages', path: '/admin/dashboard/messages', icon: '✉️' },
        { name: 'Church Documents', path: '/admin/dashboard/documents', icon: '📄' },
        { name: 'Holy Mass', path: '/admin/dashboard/mass-timings', icon: '⏰' },
        { name: 'Banner Images', path: '/admin/dashboard/hero-slider', icon: '🖼️' },
        { name: 'Blood Bank', path: '/admin/dashboard/blood-bank', icon: '🩸' },
        { name: 'Gallery', path: '/admin/dashboard/gallery', icon: '📷' },
        { name: 'News & Events', path: '/admin/dashboard/news', icon: '📰' },
        { name: 'Committee', path: '/admin/dashboard/committee', icon: '👥' },
        { name: 'Social Media', path: '/admin/dashboard/social', icon: '🔗' },
        { name: 'Settings', path: '/admin/dashboard/settings', icon: '⚙️' },
    ];

    return (
        <div className="admin-sidebar">
            <div className="admin-sidebar-header">
                <span className="admin-sidebar-icon">✟</span>
                <span className="admin-sidebar-title">Admin Portal</span>
            </div>

            <div className="admin-sidebar-nav">
                {menuItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.path}
                        className={`admin-nav-item ${isActive(item.path)}`}
                    >
                        <span className="admin-nav-item-icon">{item.icon}</span>
                        {item.name}
                    </Link>
                ))}
            </div>

            <div className="admin-sidebar-footer">
                <div className="admin-user-profile">
                    <div className="admin-user-avatar">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="admin-user-details">
                        <p className="admin-user-name">{user?.username || 'Admin'}</p>
                        <p className="admin-user-role">Administrator</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="admin-logout-button"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}
