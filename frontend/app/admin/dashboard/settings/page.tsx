'use client';

import { useState, useEffect } from 'react';
import { apiEndpoint } from '@/app/config/api';
import '../admin-dashboard.css';
import './settings.css';

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        currentPassword: '',
        newPassword: '',
    });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('adminUser');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            setFormData(prev => ({ ...prev, username: parsedUser.username, email: parsedUser.email }));
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        setIsLoading(true);

        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(apiEndpoint('admin/profile'), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    ...(formData.newPassword ? {
                        currentPassword: formData.currentPassword,
                        newPassword: formData.newPassword
                    } : {})
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ text: 'Profile updated successfully!', type: 'success' });
                setUser(data.user);
                localStorage.setItem('adminUser', JSON.stringify(data.user));
                setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
            } else {
                setMessage({ text: data.message || 'Update failed', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'An error occurred. Please try again.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-page-container settings-container" style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
            <div className="admin-page-header">
                <div>
                    <h2 className="admin-page-title">Account Settings</h2>
                    <p className="admin-page-subtitle">Manage your admin profile and security preferences</p>
                </div>
            </div>

            {message.text && (
                <div className="alert-message" style={{
                    marginBottom: '1.5rem',
                    padding: '1rem 1.25rem',
                    borderRadius: '0.75rem',
                    border: `1px solid ${message.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
                    background: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                    color: message.type === 'success' ? '#047857' : '#DC2626',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    fontSize: '0.9375rem',
                    fontWeight: '500'
                }}>
                    <span style={{ fontSize: '1.25rem' }}>
                        {message.type === 'success' ? '✅' : '⚠️'}
                    </span>
                    <span>{message.text}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Profile Information Card */}
                <div className="admin-table-container settings-card" style={{ padding: '2rem' }}>
                    <div className="section-header" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '1.5rem',
                        paddingBottom: '1rem',
                        borderBottom: '2px solid #D4AF37'
                    }}>
                        <div className="icon-container" style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            background: 'linear-gradient(135deg, #800020, #8B4513)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem'
                        }}>
                            👤
                        </div>
                        <div>
                            <h3 style={{
                                fontSize: '1.125rem',
                                fontWeight: '700',
                                color: '#800020',
                                margin: 0,
                                fontFamily: 'Playfair Display, serif'
                            }}>
                                Profile Information
                            </h3>
                            <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0 }}>
                                Update your account details
                            </p>
                        </div>
                    </div>

                    <div className="admin-grid-2" style={{ gap: '1.25rem' }}>
                        <div className="admin-form-group">
                            <label className="admin-label">
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span className="input-icon">👨‍💼</span>
                                    <span>Username</span>
                                </span>
                            </label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                className="admin-input"
                                required
                                placeholder="Enter your username"
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-label">
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span className="input-icon">📧</span>
                                    <span>Email Address</span>
                                </span>
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="admin-input"
                                required
                                placeholder="admin@church.com"
                            />
                        </div>
                    </div>
                </div>

                {/* Security Card */}
                <div className="admin-table-container settings-card" style={{ padding: '2rem' }}>
                    <div className="section-header" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '1.5rem',
                        paddingBottom: '1rem',
                        borderBottom: '2px solid #D4AF37'
                    }}>
                        <div className="icon-container" style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            background: 'linear-gradient(135deg, #800020, #8B4513)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem'
                        }}>
                            🔒
                        </div>
                        <div>
                            <h3 style={{
                                fontSize: '1.125rem',
                                fontWeight: '700',
                                color: '#800020',
                                margin: 0,
                                fontFamily: 'Playfair Display, serif'
                            }}>
                                Security Settings
                            </h3>
                            <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0 }}>
                                Change your password to keep your account secure
                            </p>
                        </div>
                    </div>

                    <div className="admin-grid-2" style={{ gap: '1.25rem' }}>
                        <div className="admin-form-group">
                            <label className="admin-label">
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span className="input-icon">🔑</span>
                                    <span>Current Password</span>
                                </span>
                            </label>
                            <input
                                type="password"
                                value={formData.currentPassword}
                                onChange={e => setFormData({ ...formData, currentPassword: e.target.value })}
                                placeholder="••••••••"
                                className="admin-input"
                            />
                            <p style={{
                                fontSize: '0.75rem',
                                color: '#6B7280',
                                marginTop: '0.5rem',
                                fontStyle: 'italic'
                            }}>
                                Required only if changing password
                            </p>
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-label">
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span className="input-icon">🔐</span>
                                    <span>New Password</span>
                                </span>
                            </label>
                            <input
                                type="password"
                                value={formData.newPassword}
                                onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                                placeholder="••••••••"
                                className="admin-input"
                            />
                            <p style={{
                                fontSize: '0.75rem',
                                color: '#6B7280',
                                marginTop: '0.5rem',
                                fontStyle: 'italic'
                            }}>
                                Leave blank to keep current password
                            </p>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    paddingTop: '1rem'
                }}>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="admin-btn admin-btn-primary save-button"
                        style={{
                            padding: '0.875rem 2.5rem',
                            fontSize: '1rem',
                            fontWeight: '600',
                            opacity: isLoading ? 0.6 : 1,
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            minWidth: '200px',
                            justifyContent: 'center'
                        }}
                    >
                        {isLoading ? '⏳ Saving...' : '💾 Save Profile Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
