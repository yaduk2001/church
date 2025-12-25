'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiEndpoint } from '../config/api';
import './admin-login.css';

export default function AdminLogin() {
    const [username, setUsername] = useState('admin123');
    const [password, setPassword] = useState('admin123');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(apiEndpoint('admin/login'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('adminToken', data.token);
                localStorage.setItem('adminUser', JSON.stringify(data.user));
                router.push('/admin/dashboard');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-bg"></div>
            <div className="admin-login-overlay"></div>
            <div className="admin-login-top-border"></div>

            <div className="admin-login-content">
                <div className="admin-login-card">

                    <div className="admin-login-header">
                        <div className="admin-login-icon-wrapper">
                            <span className="admin-login-icon">✟</span>
                        </div>
                        <h2 className="admin-login-title">Admin Portal</h2>
                        <p className="admin-login-subtitle">Church Management System</p>
                    </div>

                    <div className="admin-login-form-wrapper">
                        {error && (
                            <div className="admin-error-box">
                                <div className="admin-error-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="admin-error-title">Authentication Failed</h4>
                                    <p className="admin-error-message">{error}</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="admin-login-form">
                            <div className="admin-form-group">
                                <label className="admin-form-label">Username</label>
                                <div className="admin-input-wrapper">
                                    <div className="admin-input-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="admin-input"
                                        placeholder="Enter your admin ID"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">Password</label>
                                <div className="admin-input-wrapper">
                                    <div className="admin-input-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="admin-input"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="admin-submit-btn"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="admin-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Verifying Credentials...
                                    </>
                                ) : (
                                    'Sign In to Dashboard'
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="admin-login-footer">
                        <span>© 2024 Church Admin</span>
                        <a href="/" className="admin-footer-link">
                            Back to Website
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </a>
                    </div>
                </div>

                <p className="admin-security-text">
                    Protected by 256-bit SSL Encryption
                </p>
            </div>
        </div>
    );
}
