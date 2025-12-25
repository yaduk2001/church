'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiEndpoint } from '@/app/config/api';
import Modal from '@/app/components/Modal';
import '../../admin-dashboard.css';

interface FamilyMember {
    _id?: string;
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

// Utility function to calculate age from date of birth
const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
};

export default function FamilyDetailPage() {
    const router = useRouter();
    const params = useParams();
    const familyId = params.id as string;

    const [family, setFamily] = useState<FamilyUnit | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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
        fetchFamily(token);
    }, [familyId]);

    const fetchFamily = async (token: string) => {
        try {
            const response = await fetch(apiEndpoint('admin/families'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                const foundFamily = data.find((f: FamilyUnit) => f._id === familyId);
                setFamily(foundFamily || null);
            }
        } catch (error) {
            console.error('Failed to fetch family', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteFamily = async () => {
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
                        showModal('Success', 'Family deleted successfully', 'success', () => {
                            router.push('/admin/dashboard/registered-families');
                        });
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

    const handleDeleteMember = async (memberId: string | undefined) => {
        if (!memberId) return;

        showModal(
            'Delete Member',
            'Are you sure you want to remove this family member?',
            'confirm',
            async () => {
                try {
                    const token = localStorage.getItem('adminToken');
                    const response = await fetch(apiEndpoint(`admin/families/${familyId}/members/${memberId}`), {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (response.ok) {
                        // Refresh data
                        const token = localStorage.getItem('adminToken');
                        if (token) fetchFamily(token);
                        showModal('Success', 'Member removed successfully', 'success');
                    } else {
                        showModal('Error', 'Failed to delete member', 'error');
                    }
                } catch (error) {
                    console.error('Delete member failed:', error);
                    showModal('Error', 'Error deleting member', 'error');
                }
            }
        );
    };

    if (isLoading) {
        return <div className="loading-state">Loading family details...</div>;
    }

    if (!family) {
        return (
            <div className="admin-page-container" style={{ padding: '2rem' }}>
                <div className="admin-page-header">
                    <button onClick={() => router.back()} className="back-btn">← Back</button>
                    <h1 className="admin-page-title">Family Not Found</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page-container" style={{ padding: '15px', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="admin-page-header" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '2rem' }}>
                <button
                    onClick={() => router.back()}
                    className="admin-btn admin-btn-secondary"
                    style={{ position: 'absolute', left: 0 }}
                >
                    ← Back
                </button>
                <div style={{ textAlign: 'center' }}>
                    <h1 className="admin-page-title" style={{ color: '#800020', marginBottom: '0.25rem', fontFamily: 'Cinzel, serif', fontSize: '1.5rem' }}>{family.familyName}</h1>
                    <p className="admin-page-subtitle" style={{ fontSize: '0.9rem' }}>Complete family information</p>
                </div>
                <div style={{ position: 'absolute', right: 0, display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => router.push(`/admin/dashboard/registered-families/${familyId}/edit`)}
                        className="admin-btn admin-btn-primary"
                        style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                    >
                        ✏️ Edit Family
                    </button>
                    <button
                        onClick={handleDeleteFamily}
                        className="admin-btn admin-btn-danger"
                        style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', border: '1px solid #FECACA', background: '#FEF2F2' }}
                    >
                        🗑️ Delete
                    </button>
                </div>
            </div>

            {/* Family Information Card */}
            <div style={{
                background: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderTop: '4px solid #800020'
            }}>
                <h2 style={{
                    margin: '0 0 1rem 0',
                    fontSize: '1.25rem',
                    color: '#800020',
                    fontFamily: 'Cinzel, serif',
                    borderBottom: '1px solid #eee',
                    paddingBottom: '0.5rem'
                }}>
                    Family Details
                </h2>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem'
                }}>
                    <div>
                        <label style={{ fontSize: '0.875rem', color: '#6B7280', fontWeight: 600 }}>
                            Head of Family
                        </label>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '1rem', color: '#1F2937' }}>
                            {family.headOfFamily}
                        </p>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.875rem', color: '#6B7280', fontWeight: 600 }}>
                            Phone Number
                        </label>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '1rem', color: '#1F2937' }}>
                            {family.phone}
                        </p>
                    </div>
                    {family.parishUnit && (
                        <div>
                            <label style={{ fontSize: '0.875rem', color: '#6B7280', fontWeight: 600 }}>
                                Parish Unit
                            </label>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '1rem', color: '#1F2937' }}>
                                {family.parishUnit}
                            </p>
                        </div>
                    )}
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ fontSize: '0.875rem', color: '#6B7280', fontWeight: 600 }}>
                            Address
                        </label>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '1rem', color: '#1F2937' }}>
                            {family.address}
                        </p>
                    </div>
                </div>
            </div>

            {/* Family Members Section */}
            <div style={{
                background: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem'
                }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: '1.25rem',
                        color: '#800020',
                        fontFamily: 'Cinzel, serif'
                    }}>
                        Family Members
                    </h2>
                    <span style={{
                        background: '#E0E7FF',
                        color: '#3730A3',
                        padding: '0.5rem 1rem',
                        borderRadius: '9999px',
                        fontSize: '0.875rem',
                        fontWeight: 600
                    }}>
                        {(family.members || []).length} member{(family.members || []).length !== 1 ? 's' : ''}
                    </span>
                </div>

                {(family.members || []).length === 0 ? (
                    <p style={{ color: '#9CA3AF', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>
                        No members added yet.
                    </p>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {(family.members || []).map((member, idx) => (
                            <div key={member._id || idx} style={{
                                padding: '1.5rem',
                                background: '#F9FAFB',
                                borderRadius: '0.75rem',
                                border: '2px solid #E5E7EB',
                                transition: 'all 0.2s ease',
                                position: 'relative' // For absolute positioning of action buttons
                            }}>
                                {/* Member Actions */}
                                <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.25rem' }}>
                                    <button
                                        onClick={() => handleDeleteMember(member._id)}
                                        title="Delete Member"
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', opacity: 0.6 }}
                                    >
                                        🗑️
                                    </button>
                                </div>

                                {/* Member Header */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '1rem',
                                    paddingRight: '2rem' // Space for actions
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{
                                            margin: '0 0 0.25rem 0',
                                            fontSize: '1.125rem',
                                            color: '#1F2937',
                                            fontWeight: 700
                                        }}>
                                            {member.name}
                                        </h3>
                                        {member.churchName && (
                                            <p style={{
                                                margin: 0,
                                                fontSize: '0.875rem',
                                                color: '#6B7280',
                                                fontStyle: 'italic'
                                            }}>
                                                Church: {member.churchName}
                                            </p>
                                        )}
                                    </div>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        background: '#FEF3C7',
                                        color: '#92400E',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '999px',
                                        fontWeight: 600,
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {member.relationship}
                                    </span>
                                </div>

                                {/* Member Details */}
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.5rem',
                                    fontSize: '0.9rem',
                                    color: '#4B5563'
                                }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <span style={{ fontWeight: 600, minWidth: '80px' }}>Gender:</span>
                                        <span>{member.gender}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <span style={{ fontWeight: 600, minWidth: '80px' }}>Age:</span>
                                        <span>{calculateAge(member.dateOfBirth)} years</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <span style={{ fontWeight: 600, minWidth: '80px' }}>DOB:</span>
                                        <span>{new Date(member.dateOfBirth).toLocaleDateString()}</span>
                                    </div>
                                    {member.phone && (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <span style={{ fontWeight: 600, minWidth: '80px' }}>Phone:</span>
                                            <span>{member.phone}</span>
                                        </div>
                                    )}
                                    {member.email && (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <span style={{ fontWeight: 600, minWidth: '80px' }}>Email:</span>
                                            <span style={{ wordBreak: 'break-word' }}>{member.email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Modal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                onConfirm={modalConfig.onConfirm}
                confirmText={modalConfig.type === 'confirm' ? 'Confirm' : 'OK'}
            />
        </div>
    );
}
