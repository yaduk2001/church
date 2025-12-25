'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiEndpoint } from '@/app/config/api';
import './admin-dashboard.css';

interface DashboardStats {
    prayerRequests: { total: number; pending: number; approved: number };
    thanksgivings: { total: number; pending: number; approved: number };
    bloodBank: { total: number; available: number };
    families: { total: number };
    news: { total: number; active: number };
    gallery: { total: number };
}

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/admin');
            return;
        }
        fetchStats(token);
    }, [router]);

    const fetchStats = async (token: string) => {
        try {
            const response = await fetch(apiEndpoint('admin/dashboard'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch stats', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
                color: '#6B7280',
                fontSize: '1rem'
            }}>
                Loading dashboard...
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="admin-page-container" style={{ padding: '2rem' }}>
            <div className="admin-page-header" style={{ marginBottom: '2rem' }}>
                <div>
                    <h2 className="admin-page-title">Dashboard Overview</h2>
                    <p className="admin-page-subtitle">Real-time statistics and metrics for your church management system</p>
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem'
            }}>
                <StatCard
                    title="Prayer Requests"
                    value={stats.prayerRequests.total}
                    subtitle={`${stats.prayerRequests.pending} Pending`}
                    icon="🙏"
                    gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                />
                <StatCard
                    title="Thanksgivings"
                    value={stats.thanksgivings.total}
                    subtitle={`${stats.thanksgivings.pending} Pending`}
                    icon="🙌"
                    gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                />
                <StatCard
                    title="Blood Bank"
                    value={stats.bloodBank.total}
                    subtitle={`${stats.bloodBank.available} Available`}
                    icon="🩸"
                    gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
                />
                <StatCard
                    title="Family Units"
                    value={stats.families.total}
                    subtitle="Registered Families"
                    icon="👨‍👩‍👧‍👦"
                    gradient="linear-gradient(135deg, #30cfd0 0%, #330867 100%)"
                    onClick={() => router.push('/admin/dashboard/registered-families')}
                />
                <StatCard
                    title="News Items"
                    value={stats.news.total}
                    subtitle={`${stats.news.active} Active`}
                    icon="📰"
                    gradient="linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
                />
                <StatCard
                    title="Gallery Images"
                    value={stats.gallery.total}
                    subtitle="Total Uploads"
                    icon="🖼️"
                    gradient="linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"
                />
            </div>

            {/* Quick Actions Section */}
            <div style={{ marginTop: '3rem' }}>
                <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#800020',
                    marginBottom: '1.5rem',
                    fontFamily: 'Playfair Display, serif'
                }}>
                    Quick Actions
                </h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                }}>
                    <QuickActionButton
                        label="Manage Blood Bank"
                        icon="🩸"
                        onClick={() => router.push('/admin/dashboard/blood-bank')}
                    />
                    <QuickActionButton
                        label="View Gallery"
                        icon="🖼️"
                        onClick={() => router.push('/admin/dashboard/gallery')}
                    />
                    <QuickActionButton
                        label="Post News"
                        icon="📰"
                        onClick={() => router.push('/admin/dashboard/news')}
                    />
                    <QuickActionButton
                        label="Committee Members"
                        icon="👥"
                        onClick={() => router.push('/admin/dashboard/committee')}
                    />
                    <QuickActionButton
                        label="Mass Timings"
                        icon="⏰"
                        onClick={() => router.push('/admin/dashboard/mass-timings')}
                    />
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, subtitle, icon, gradient, onClick }: {
    title: string;
    value: number;
    subtitle: string;
    icon: string;
    gradient: string;
    onClick?: () => void;
}) {
    return (
        <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s',
            cursor: onClick ? 'pointer' : 'default',
            position: 'relative',
            overflow: 'hidden'
        }}
            onClick={onClick}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            }}>
            {/* Gradient Background */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: gradient
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#6B7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    {title}
                </h3>
                <span style={{
                    fontSize: '2rem',
                    lineHeight: 1,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }}>
                    {icon}
                </span>
            </div>

            <div style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '0.5rem',
                fontFamily: 'Playfair Display, serif'
            }}>
                {value}
            </div>

            <p style={{
                fontSize: '0.875rem',
                color: '#6B7280',
                margin: 0
            }}>
                {subtitle}
            </p>
        </div>
    );
}

function QuickActionButton({ label, icon, onClick }: {
    label: string;
    icon: string;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 1.25rem',
                background: 'white',
                border: '2px solid #E5E7EB',
                borderRadius: '0.75rem',
                fontSize: '0.9375rem',
                fontWeight: '600',
                color: '#374151',
                cursor: 'pointer',
                transition: 'all 0.2s',
                width: '100%'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#800020';
                e.currentTarget.style.background = '#FFF5F5';
                e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            <span style={{ fontSize: '1.5rem' }}>{icon}</span>
            <span>{label}</span>
        </button>
    );
}
