'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../contexts/LanguageContext';
import { apiEndpoint } from '@/app/config/api';
import '../auth.css';

export default function RegisterFamilyPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [formData, setFormData] = useState({
        familyName: '',
        headOfFamily: '',
        phone: '',
        password: '',
        address: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Basic validation
        if (!formData.familyName || !formData.headOfFamily || !formData.phone || !formData.password || !formData.address) {
            setError('All fields are required');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(apiEndpoint('family-auth/register'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
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
                    <h1 className="auth-title">Join the Household of God</h1>
                    <p className="auth-subtitle">"From whom the whole family in heaven and earth is named"</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="familyName">Family Name</label>
                        <input
                            type="text"
                            id="familyName"
                            name="familyName"
                            className="form-input"
                            value={formData.familyName}
                            onChange={handleChange}
                            placeholder="e.g. The Thomas Family"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="headOfFamily">Head of Family</label>
                        <input
                            type="text"
                            id="headOfFamily"
                            name="headOfFamily"
                            className="form-input"
                            value={formData.headOfFamily}
                            onChange={handleChange}
                            placeholder="Full Name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="phone">Phone Number (Login ID)</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            className="form-input"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="10-digit mobile number"
                            pattern="[0-9]{10}"
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
                            placeholder="Create a strong password"
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="form-group full-width">
                        <label className="form-label" htmlFor="address">Address</label>
                        <textarea
                            id="address"
                            name="address"
                            className="form-input"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Residential address"
                            required
                            rows={2}
                            style={{ resize: 'vertical' }}
                        />
                    </div>

                    <button type="submit" className="btn-submit" disabled={isLoading}>
                        {isLoading ? 'Registering...' : 'Register Family'}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account?
                    <a href="/family-units/login" className="auth-link">Login here</a>
                </div>
            </div>
        </div>
    );
}
