'use client';

import { useState, useEffect } from 'react';
import { apiEndpoint } from '@/app/config/api';
import './blood-bank.css';

interface BloodDonor {
    _id: string;
    donorName: string;
    bloodGroup: string;
    phone: string;
    isAvailable: boolean;
    age: number;
    gender: string;
    email: string;
    address: string;
    lastDonation?: string;
}

export default function BloodBankPage() {
    const [donors, setDonors] = useState<BloodDonor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDonor, setEditingDonor] = useState<BloodDonor | null>(null);

    const [formData, setFormData] = useState({
        donorName: '',
        bloodGroup: 'A+',
        phone: '',
        email: '',
        dateOfBirth: '',
        gender: 'Male',
        address: '',
        isAvailable: true
    });

    useEffect(() => {
        fetchDonors();
    }, []);

    const fetchDonors = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(apiEndpoint('blood-bank/admin'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setDonors(data);
            }
        } catch (error) {
            console.error('Error fetching donors:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('adminToken');

        try {
            const url = editingDonor
                ? apiEndpoint(`blood-bank/${editingDonor._id}`)
                : apiEndpoint('blood-bank');

            const method = editingDonor ? 'PUT' : 'POST';

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
                fetchDonors();
                resetForm();
            }
        } catch (error) {
            console.error('Error saving donor:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this donor?')) return;

        const token = localStorage.getItem('adminToken');
        try {
            await fetch(apiEndpoint(`blood-bank/${id}`), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchDonors();
        } catch (error) {
            console.error('Error deleting donor:', error);
        }
    };

    const openEditModal = (donor: BloodDonor) => {
        setEditingDonor(donor);
        setFormData({
            donorName: donor.donorName,
            bloodGroup: donor.bloodGroup,
            phone: donor.phone,
            email: donor.email,
            dateOfBirth: '',
            gender: donor.gender,
            address: donor.address,
            isAvailable: donor.isAvailable
        });
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setEditingDonor(null);
        setFormData({
            donorName: '',
            bloodGroup: 'A+',
            phone: '',
            email: '',
            dateOfBirth: '',
            gender: 'Male',
            address: '',
            isAvailable: true
        });
    };

    const getBloodGroupColor = (bloodGroup: string) => {
        if (bloodGroup.includes('Rare')) return '#7C3AED';
        if (bloodGroup.includes('-')) return '#DC2626';
        return '#D97706';
    };

    return (
        <div className="blood-bank-container">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Blood Bank Management</h2>
                    <p className="page-subtitle">Manage donors and blood availability</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="btn-primary"
                >
                    <span style={{ fontSize: '1.2rem' }}>+</span>
                    Add Donor
                </button>
            </div>

            <div className="content-card">
                {isLoading ? (
                    <div className="empty-state">
                        Loading donors...
                    </div>
                ) : donors.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🩸</div>
                        <p className="empty-state-title">No donors registered</p>
                        <p className="empty-state-text">Add your first blood donor to get started!</p>
                    </div>
                ) : (
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th style={{ width: '25%' }}>Donor Name</th>
                                <th style={{ width: '12%' }}>Blood Group</th>
                                <th style={{ width: '30%' }}>Contact</th>
                                <th style={{ width: '15%' }}>Status</th>
                                <th style={{ width: '18%', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {donors.map(donor => (
                                <tr key={donor._id}>
                                    <td>
                                        <div className="donor-name">
                                            {donor.donorName}
                                        </div>
                                        <div className="donor-meta">
                                            {donor.gender} • {donor.age} years
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`blood-badge ${donor.bloodGroup.includes('Rare') ? 'blood-rare' : donor.bloodGroup.includes('-') ? 'blood-negative' : 'blood-positive'}`}>
                                            {donor.bloodGroup}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="contact-info">
                                            <div className="contact-row">
                                                <span>📞</span>
                                                <span className="contact-phone">{donor.phone}</span>
                                            </div>
                                            <div className="contact-row">
                                                <span>📧</span>
                                                <span className="contact-email">{donor.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={`status-pill ${donor.isAvailable ? 'status-available' : 'status-unavailable'}`}>
                                            {donor.isAvailable ? '● Available' : '○ Unavailable'}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button
                                            onClick={() => openEditModal(donor)}
                                            className="action-btn"
                                            title="Edit"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDelete(donor._id)}
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
                    <div className="admin-modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <div>
                                <h3 className="admin-modal-title">
                                    {editingDonor ? '✏️ Edit Donor' : '\"Greater love has no one than this: to lay down one\'s life for one\'s friends\"'}
                                </h3>
                                {!editingDonor && (
                                    <p style={{
                                        color: 'rgba(255,255,255,0.85)',
                                        fontSize: '0.8125rem',
                                        marginTop: '0.25rem',
                                        fontStyle: 'italic'
                                    }}>
                                        — John 15:13
                                    </p>
                                )}
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="admin-modal-close">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="admin-modal-body">
                            <div className="admin-grid-2">
                                <div className="admin-form-group">
                                    <label className="admin-label">Donor Name</label>
                                    <input
                                        type="text"
                                        value={formData.donorName}
                                        onChange={e => setFormData({ ...formData, donorName: e.target.value })}
                                        className="admin-input"
                                        placeholder="e.g., John Mathew"
                                        required
                                    />
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">Blood Group</label>
                                    <select
                                        value={formData.bloodGroup}
                                        onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                                        className="admin-select"
                                    >
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Bombay Blood (Oh) - Rare', 'Golden Blood (Rh-null) - Rare'].map(bg => (
                                            <option key={bg} value={bg}>{bg}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="admin-grid-2">
                                <div className="admin-form-group">
                                    <label className="admin-label">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="admin-input"
                                        placeholder="+91 98765 43210"
                                        required
                                    />
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">Email Address</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="admin-input"
                                        placeholder="donor@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="admin-grid-2">
                                <div className="admin-form-group">
                                    <label className="admin-label">Date of Birth</label>
                                    <input
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                        className="admin-input"
                                        required={!editingDonor}
                                    />
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">Gender</label>
                                    <select
                                        value={formData.gender}
                                        onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                        className="admin-select"
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-label">Address</label>
                                <textarea
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    className="admin-textarea"
                                    rows={2}
                                    placeholder="Full address..."
                                    required
                                />
                            </div>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '1rem',
                                background: '#F9FAFB',
                                borderRadius: '0.5rem',
                                border: '1px solid #E5E7EB'
                            }}>
                                <input
                                    type="checkbox"
                                    id="isAvailable"
                                    checked={formData.isAvailable}
                                    onChange={e => setFormData({ ...formData, isAvailable: e.target.checked })}
                                    style={{ width: '1.125rem', height: '1.125rem', cursor: 'pointer', accentColor: '#800020' }}
                                />
                                <label htmlFor="isAvailable" style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', cursor: 'pointer', margin: 0 }}>
                                    Available to Donate
                                </label>
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
                                    {editingDonor ? '💾 Save Changes' : '🩸 Register Donor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
