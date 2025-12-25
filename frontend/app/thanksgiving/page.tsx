'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../contexts/LanguageContext';
import { apiEndpoint } from '../config/api';
import './page.css';

interface FormData {
    name: string;
    email: string;
    message: string;
    isAnonymous: boolean;
}

interface FormErrors {
    name?: string;
    email?: string;
    message?: string;
}

export default function ThanksgivingPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        message: '',
        isAnonymous: false,
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [submitMessage, setSubmitMessage] = useState('');

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Message validation
        if (!formData.message.trim()) {
            newErrors.message = 'Thanksgiving message is required';
        } else if (formData.message.trim().length < 10) {
            newErrors.message = 'Please share more details (at least 10 characters)';
        } else if (formData.message.trim().length > 1000) {
            newErrors.message = 'Message is too long (maximum 1000 characters)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));

        // Clear error for this field
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            const response = await fetch(apiEndpoint('thanksgivings'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setSubmitStatus('success');
                setSubmitMessage('Your thanksgiving has been submitted successfully! God bless you.');

                // Reset form
                setFormData({
                    name: '',
                    email: '',
                    message: '',
                    isAnonymous: false,
                });

                // Redirect after 3 seconds
                setTimeout(() => {
                    router.push('/');
                }, 3000);
            } else {
                setSubmitStatus('error');
                setSubmitMessage(data.message || 'Failed to submit thanksgiving. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting thanksgiving:', error);
            setSubmitStatus('error');
            setSubmitMessage('Network error. Please check your connection and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="thanksgiving-page">
            <div className="container">
                {/* Page Header */}
                <div className="page-header">
                    <div className="cross-symbol">✟</div>
                    <h1 className="page-title">{t('thanksgiving.title')}</h1>
                    <p className="page-subtitle">
                        {t('thanksgiving.subtitle')}
                    </p>
                </div>

                <div className="thanksgiving-content">
                    {/* Left Column - Inspirational */}
                    <div className="left-column">
                        <div className="bible-card">
                            <div className="verse-text">"Give thanks to the Lord, for he is good; his love endures forever."</div>
                            <div className="verse-ref">- Psalm 107:1</div>
                        </div>

                        <div className="info-box">
                            <h3>{t('thanksgiving.thankYouGod')}</h3>
                            <ul>
                                <li>{t('thanksgiving.shareTestimony')}</li>
                                <li>Your thanksgiving will inspire others</li>
                                <li>All submissions are reviewed before sharing</li>
                                <li>Choose "Anonymous" if you prefer privacy</li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Column - Form */}
                    <div className="right-column">
                        <form onSubmit={handleSubmit} className="thanksgiving-form">
                            {/* Name Field */}
                            <div className="form-group">
                                <label htmlFor="name" className="form-label">
                                    {t('thanksgiving.fullName')} <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`form-input ${errors.name ? 'error' : ''}`}
                                    placeholder={t('thanksgiving.enterName')}
                                    disabled={isSubmitting}
                                />
                                {errors.name && <span className="error-message">{errors.name}</span>}
                            </div>

                            {/* Email Field */}
                            <div className="form-group">
                                <label htmlFor="email" className="form-label">
                                    {t('thanksgiving.emailAddress')} <span className="required">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`form-input ${errors.email ? 'error' : ''}`}
                                    placeholder={t('thanksgiving.enterEmail')}
                                    disabled={isSubmitting}
                                />
                                {errors.email && <span className="error-message">{errors.email}</span>}
                            </div>

                            {/* Thanksgiving Message Field */}
                            <div className="form-group">
                                <label htmlFor="message" className="form-label">
                                    {t('thanksgiving.thanksgivingMessage')} <span className="required">*</span>
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    className={`form-textarea ${errors.message ? 'error' : ''}`}
                                    placeholder={t('thanksgiving.shareTestimonyText')}
                                    rows={8}
                                    disabled={isSubmitting}
                                />
                                <div className="character-count">
                                    {formData.message.length} / 1000 characters
                                </div>
                                {errors.message && (
                                    <span className="error-message">{errors.message}</span>
                                )}
                            </div>

                            {/* Anonymous Checkbox */}
                            <div className="form-group checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="isAnonymous"
                                        checked={formData.isAnonymous}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                    />
                                    <span className="checkbox-text">
                                        {t('thanksgiving.submitAnonymously')}
                                    </span>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <div className="form-actions">
                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="spinner-small"></span>
                                            {t('thanksgiving.submitting')}
                                        </>
                                    ) : (
                                        <>
                                            {t('thanksgiving.submitThanksgiving')}
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Status Messages */}
                            {submitStatus === 'success' && (
                                <div className="alert alert-success">
                                    <strong>✓ Success!</strong> {submitMessage}
                                </div>
                            )}

                            {submitStatus === 'error' && (
                                <div className="alert alert-error">
                                    <strong>✗ Error!</strong> {submitMessage}
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
