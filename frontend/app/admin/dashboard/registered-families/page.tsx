'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiEndpoint } from '@/app/config/api';
import Modal from '@/app/components/Modal';
import '../admin-dashboard.css';

interface FamilyMember {
    name: string;
    churchName?: string;
    relationship: string;
    gender: string;
    age: number;
    dateOfBirth: string;
    phone?: string;
    email?: string;
}

interface FamilyUnit {
    _id: string;
    familyName: string;
    headOfFamily: string;
    phone: string;
    address: string;
    parishUnit?: string;
    members: FamilyMember[];
    createdAt: string;
}

export default function RegisteredFamiliesPage() {
    const router = useRouter();
    const [families, setFamilies] = useState<FamilyUnit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'confirm' | 'alert' | 'success' | 'error';
        onConfirm?: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'alert'
    });

    const showModal = (title: string, message: string, type: 'confirm' | 'alert' | 'success' | 'error' = 'alert', onConfirm?: () => void) => {
        setModalConfig({
            isOpen: true,
            title,
            message,
            type,
            onConfirm
        });
    };

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/admin');
            return;
        }
        fetchFamilies(token);
    }, [router]);

    const fetchFamilies = async (token: string) => {
        try {
            const response = await fetch(apiEndpoint('admin/families'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setFamilies(data);
            }
        } catch (error) {
            console.error('Failed to fetch families', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteFamily = async (e: React.MouseEvent, familyId: string) => {
        e.stopPropagation(); // Prevent card click
        showModal(
            'Delete Family',
            'Are you sure you want to permanently delete this family? This action cannot be undone.',
            'confirm',
            async () => {
                try {
                    const token = localStorage.getItem('adminToken');
                    const response = await fetch(apiEndpoint(`admin/families/${familyId}`), {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (response.ok) {
                        setFamilies(prev => prev.filter(f => f._id !== familyId));
                        showModal('Success', 'Family deleted successfully', 'success');
                    } else {
                        showModal('Error', 'Failed to delete family', 'error');
                    }
                } catch (error) {
                    console.error('Delete failed:', error);
                    showModal('Error', 'Error deleting family', 'error');
                }
            }
        );
    };

    const filteredFamilies = families.filter(family =>
        family.familyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        family.headOfFamily.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return <div className="loading-state">Loading families...</div>;
    }

    return (
        <div className="admin-page-container">
            {/* Header with centered title */}
            <div className="admin-page-header" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem 0 2rem 0' }}>
                <div style={{ textAlign: 'center' }}>
                    <h1 className="admin-page-title" style={{ marginBottom: '0.25rem' }}>Registered Families</h1>
                    <p className="admin-page-subtitle">View and manage all registered family units</p>
                </div>
                <button
                    onClick={() => router.push('/admin/dashboard/registered-families/new')}
                    className="admin-btn admin-btn-primary"
                    style={{ position: 'absolute', right: 0 }}
                >
                    + Add New Family
                </button>
            </div>

            {/* Search Bar */}
            <div style={{ marginBottom: '1.5rem' }}>
                <input
                    type="text"
                    placeholder="Search by family name or head of family..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        maxWidth: '500px',
                        padding: '0.65rem 1rem',
                        border: '2px solid #E5E7EB',
                        borderRadius: '0.75rem',
                        fontSize: '0.95rem',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#800020'}
                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                />
            </div>

            {/* Family Cards Grid - More Compact */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1rem'
            }}>
                {filteredFamilies.map((family) => (
                    <div
                        key={family._id}
                        onClick={() => router.push(`/admin/dashboard/registered-families/${family._id}`)}
                        style={{
                            background: 'white',
                            borderRadius: '0.75rem',
                            padding: '1rem',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            border: '1px solid #E5E7EB',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(128, 0, 32, 0.1)';
                            e.currentTarget.style.borderColor = '#C5A059';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                            e.currentTarget.style.borderColor = '#E5E7EB';
                        }}
                    >
                        {/* Actions (Absolute Positioned) */}
                        <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/admin/dashboard/registered-families/${family._id}/edit`);
                                }}
                                title="Edit Family"
                                style={{
                                    background: 'white',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                }}
                            >
                                ✏️
                            </button>
                            <button
                                onClick={(e) => handleDeleteFamily(e, family._id)}
                                title="Delete Family"
                                style={{
                                    background: '#FEF2F2',
                                    border: '1px solid #FECACA',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                }}
                            >
                                🗑️
                            </button>
                        </div>

                        {/* Card Header */}
                        <div style={{ marginBottom: '0.75rem' }}>
                            <h3 style={{
                                margin: '0 0 0.25rem 0',
                                fontSize: '1.1rem',
                                color: '#800020',
                                fontWeight: 700,
                                fontFamily: 'Cinzel, serif'
                            }}>
                                {family.familyName}
                            </h3>
                            <p style={{
                                margin: 0,
                                color: '#6B7280',
                                fontSize: '0.85rem'
                            }}>
                                Head: {family.headOfFamily}
                            </p>
                        </div>

                        {/* Card Details */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            paddingTop: '0.75rem',
                            borderTop: '1px solid #F3F4F6'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '1rem' }}>👥</span>
                                <span style={{ fontSize: '0.85rem', color: '#4B5563' }}>
                                    {(family.members || []).length} member{(family.members || []).length !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '1rem' }}>📞</span>
                                <span style={{ fontSize: '0.85rem', color: '#4B5563' }}>
                                    {family.phone}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                <span style={{ fontSize: '1rem' }}>📍</span>
                                <span style={{
                                    fontSize: '0.85rem',
                                    color: '#4B5563',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    lineHeight: '1.2'
                                }}>
                                    {family.address}
                                </span>
                            </div>
                        </div>

                        {/* View Details Arrow */}
                        <div style={{
                            position: 'absolute',
                            bottom: '0.75rem',
                            right: '0.75rem',
                            color: '#C5A059',
                            fontSize: '1.25rem',
                            fontWeight: 'bold'
                        }}>
                            →
                        </div>
                    </div>
                ))}
            </div>

            {
                filteredFamilies.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        color: '#9CA3AF'
                    }}>
                        <p style={{ fontSize: '1.1rem' }}>
                            {searchTerm ? 'No families found matching your search.' : 'No families registered yet.'}
                        </p>
                    </div>
                )
            }

            <Modal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                onConfirm={modalConfig.onConfirm}
                confirmText={modalConfig.type === 'confirm' ? 'Confirm' : 'OK'}
            />
        </div >
    );
}
