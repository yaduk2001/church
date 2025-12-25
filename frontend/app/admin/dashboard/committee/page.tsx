'use client';

import { useState, useEffect } from 'react';
import { apiEndpoint } from '@/app/config/api';
import './committee.css';

interface CommitteeMember {
    _id: string;
    name: string;
    position: string;
    role: string;
    photoUrl?: string;
    email?: string;
    phone?: string;
    bio?: string;
    isActive: boolean;
    displayOrder: number;
}

export default function CommitteePage() {
    const [members, setMembers] = useState<CommitteeMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<CommitteeMember | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        position: 'Member',
        role: '',
        photoUrl: '',
        email: '',
        phone: '',
        bio: '',
        isActive: true,
        displayOrder: 0
    });

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(apiEndpoint('committee-members/admin'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setMembers(data);
            }
        } catch (error) {
            console.error('Error fetching committee members:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        if (file.size > 10 * 1024 * 1024) {
            alert('File size too large. Please upload an image smaller than 10MB.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
            }
        };
        reader.onerror = () => {
            alert('Failed to read file');
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('adminToken');

        try {
            const url = editingMember
                ? apiEndpoint(`committee-members/${editingMember._id}`)
                : apiEndpoint('committee-members');

            const method = editingMember ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setIsModalOpen(false);
                fetchMembers();
                resetForm();
            }
        } catch (error) {
            console.error('Error saving member:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this member?')) return;

        const token = localStorage.getItem('adminToken');
        try {
            await fetch(apiEndpoint(`committee-members/${id}`), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchMembers();
        } catch (error) {
            console.error('Error deleting member:', error);
        }
    };

    const openEditModal = (member: CommitteeMember) => {
        setEditingMember(member);
        setFormData({
            name: member.name,
            position: member.position,
            role: member.role,
            photoUrl: member.photoUrl || '',
            email: member.email || '',
            phone: member.phone || '',
            bio: member.bio || '',
            isActive: member.isActive,
            displayOrder: member.displayOrder || 0
        });
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setEditingMember(null);
        setFormData({
            name: '',
            position: 'Member',
            role: '',
            photoUrl: '',
            email: '',
            phone: '',
            bio: '',
            isActive: true,
            displayOrder: 0
        });
    };

    const getPositionBadgeClass = (position: string) => {
        const map: { [key: string]: string } = {
            'President': 'badge-president',
            'Secretary': 'badge-secretary',
            'Treasurer': 'badge-treasurer',
            'Spiritual Director': 'badge-spiritual',
            'Member': 'badge-member'
        };
        return map[position] || 'badge-member';
    };

    return (
        <div className="committee-container">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Managing Committee</h2>
                    <p className="page-subtitle">Update committee members for the landing page</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="btn-primary"
                >
                    <span style={{ fontSize: '1.2rem' }}>+</span>
                    Add Member
                </button>
            </div>

            <div className="content-card">
                {isLoading ? (
                    <div className="empty-state">
                        Loading committee members...
                    </div>
                ) : members.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">👥</div>
                        <p className="empty-state-title">No committee members</p>
                        <p className="empty-state-text">Add your first committee member to get started!</p>
                    </div>
                ) : (
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th style={{ width: '8%' }}>Order</th>
                                <th style={{ width: '30%' }}>Member</th>
                                <th style={{ width: '18%' }}>Position</th>
                                <th style={{ width: '25%' }}>Role</th>
                                <th style={{ width: '10%' }}>Status</th>
                                <th style={{ width: '9%', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map(member => (
                                <tr key={member._id}>
                                    <td>
                                        <span className="order-badge">
                                            #{member.displayOrder}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="member-info">
                                            {member.photoUrl ? (
                                                <img
                                                    src={member.photoUrl}
                                                    alt={member.name}
                                                    className="member-avatar"
                                                />
                                            ) : (
                                                <div className="member-avatar-placeholder">
                                                    {member.name.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <div className="member-name">
                                                    {member.name}
                                                </div>
                                                {member.email && (
                                                    <div className="member-email">
                                                        {member.email}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${getPositionBadgeClass(member.position)}`}>
                                            {member.position}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '0.875rem', color: '#4B5563' }}>
                                        {member.role || 'No role specified'}
                                    </td>
                                    <td>
                                        <div className={`status-pill ${member.isActive ? 'status-active' : 'status-hidden'}`}>
                                            {member.isActive ? '● Active' : '○ Hidden'}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button
                                            onClick={() => openEditModal(member)}
                                            className="action-btn"
                                            title="Edit"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDelete(member._id)}
                                            className="action-btn delete"
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="admin-modal-container" style={{ maxWidth: '50rem' }} onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <div>
                                <h3 className="admin-modal-title">
                                    {editingMember ? '✏️ Edit Member' : '\"Use whatever gift you have received to serve others\"'}
                                </h3>
                                {!editingMember && (
                                    <p style={{
                                        color: 'rgba(255,255,255,0.85)',
                                        fontSize: '0.8125rem',
                                        marginTop: '0.25rem',
                                        fontStyle: 'italic'
                                    }}>
                                        — 1 Peter 4:10
                                    </p>
                                )}
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="admin-modal-close">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="admin-modal-body">
                            {/* Photo Upload Section */}
                            <div className="admin-form-group">
                                <label className="admin-label">Member Photo</label>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1.5rem',
                                    padding: '1.5rem',
                                    background: '#F9FAFB',
                                    borderRadius: '0.75rem',
                                    border: '2px dashed #D1D5DB'
                                }}>
                                    {formData.photoUrl ? (
                                        <img
                                            src={formData.photoUrl}
                                            alt="Preview"
                                            style={{
                                                width: '5rem',
                                                height: '5rem',
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                                border: '3px solid #D4AF37'
                                            }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '5rem',
                                            height: '5rem',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #800020, #8B4513)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '2rem'
                                        }}>
                                            👤
                                        </div>
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ marginBottom: '0.5rem' }}>
                                            <label htmlFor="photo-upload" className="admin-btn admin-btn-secondary" style={{ cursor: 'pointer' }}>
                                                📤 Choose Photo
                                            </label>
                                            <input
                                                id="photo-upload"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                                style={{ display: 'none' }}
                                            />
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>
                                            Upload a profile photo (max 10MB)
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="admin-grid-2">
                                <div className="admin-form-group">
                                    <label className="admin-label">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="admin-input"
                                        placeholder="e.g., Rev. Fr. John Mathew"
                                        required
                                    />
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">Position</label>
                                    <select
                                        value={formData.position}
                                        onChange={e => setFormData({ ...formData, position: e.target.value })}
                                        className="admin-select"
                                    >
                                        {['President', 'Secretary', 'Treasurer', 'Spiritual Director', 'Member'].map(pos => (
                                            <option key={pos} value={pos}>{pos}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-label">Role/Responsibility</label>
                                <input
                                    type="text"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    className="admin-input"
                                    placeholder="e.g., Parish Priest, Parish Council"
                                    required
                                />
                            </div>

                            <div className="admin-grid-2">
                                <div className="admin-form-group">
                                    <label className="admin-label">Email (Optional)</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="admin-input"
                                        placeholder="member@church.com"
                                    />
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">Phone (Optional)</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="admin-input"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-label">Bio (Optional)</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                    className="admin-textarea"
                                    rows={3}
                                    placeholder="Brief description about the member..."
                                />
                            </div>

                            <div className="admin-grid-2">
                                <div className="admin-form-group">
                                    <label className="admin-label">Display Order</label>
                                    <input
                                        type="number"
                                        value={formData.displayOrder}
                                        onChange={e => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                                        className="admin-input"
                                        min="0"
                                    />
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '1rem',
                                    background: '#F9FAFB',
                                    borderRadius: '0.5rem',
                                    border: '1px solid #E5E7EB',
                                    marginTop: '1.75rem'
                                }}>
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                        style={{ width: '1.125rem', height: '1.125rem', cursor: 'pointer', accentColor: '#800020' }}
                                    />
                                    <label htmlFor="isActive" style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', cursor: 'pointer', margin: 0 }}>
                                        Show on Landing Page
                                    </label>
                                </div>
                            </div>

                            <div className="admin-actions">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="admin-btn admin-btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="admin-btn admin-btn-primary"
                                >
                                    {editingMember ? '💾 Save Changes' : '👥 Add Member'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
