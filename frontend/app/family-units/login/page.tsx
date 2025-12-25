'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiEndpoint } from '@/app/config/api';
import '../auth.css';

export default function LoginFamilyPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        phone: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(apiEndpoint('family-auth/login'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Save token and redirect
            localStorage.setItem('familyToken', data.token);
            localStorage.setItem('familyId', data.family._id);
            router.push('/family-units/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <h1 className="auth-title">Family Login</h1>
                    <p className="auth-subtitle">Welcome back! Manage your family details</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form className="auth-form single-column" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="phone">Phone Number</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            className="form-input"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Your registered mobile number"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="form-input"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button type="submit" className="btn-submit" disabled={isLoading}>
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account?
                    <a href="/family-units/register" className="auth-link">Register here</a>
                </div>
            </div>
        </div>
    );
}
