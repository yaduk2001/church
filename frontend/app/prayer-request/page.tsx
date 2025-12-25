'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../contexts/LanguageContext';
import { apiEndpoint } from '../config/api';
import './page.css';

interface FormData {
    name: string;
    email: string;
    phone: string;
    prayerRequest: string;
    isAnonymous: boolean;
}

interface FormErrors {
    name?: string;
    email?: string;
    phone?: string;
    prayerRequest?: string;
}

export default function PrayerRequestPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        phone: '',
        prayerRequest: '',
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
            newErrors.name = t('prayerRequest.nameRequired');
        } else if (formData.name.trim().length < 2) {
            newErrors.name = t('prayerRequest.nameMinLength');
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = t('prayerRequest.emailRequired');
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = t('prayerRequest.validEmail');
        }

        // Phone validation (Indian format)
        const phoneRegex = /^[6-9]\d{9}$/;
        const cleanPhone = formData.phone.replace(/\D/g, '');
        if (!formData.phone.trim()) {
            newErrors.phone = t('prayerRequest.phoneRequired');
        } else if (!phoneRegex.test(cleanPhone)) {
            newErrors.phone = t('prayerRequest.validPhone');
        }

        // Prayer request validation
        if (!formData.prayerRequest.trim()) {
            newErrors.prayerRequest = t('prayerRequest.requestRequired');
        } else if (formData.prayerRequest.trim().length < 10) {
            newErrors.prayerRequest = t('prayerRequest.requestMinLength');
        } else if (formData.prayerRequest.trim().length > 1000) {
            newErrors.prayerRequest = t('prayerRequest.requestMaxLength');
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
            const response = await fetch(apiEndpoint('prayer-requests'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    phone: formData.phone.replace(/\D/g, ''), // Clean phone number
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSubmitStatus('success');
                setSubmitMessage(t('prayerRequest.successMessage'));

                // Reset form
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    prayerRequest: '',
                    isAnonymous: false,
                });

                // Redirect after 3 seconds
                setTimeout(() => {
                    router.push('/');
                }, 3000);
            } else {
                setSubmitStatus('error');
                setSubmitMessage(data.message || t('prayerRequest.errorMessage'));
            }
        } catch (error) {
            console.error('Error submitting prayer request:', error);
            setSubmitStatus('error');
            setSubmitMessage(t('prayerRequest.networkError'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="prayer-request-page">
            <div className="container">
                {/* Page Header */}
                <div className="page-header">
                    <div className="cross-symbol">✟</div>
                    <h1 className="page-title">{t('prayerRequest.title')}</h1>
                    <p className="page-subtitle">
                        {t('prayerRequest.subtitle')}
                    </p>
                </div>

                <div className="form-container">
                    {/* Info Box */}
                    <div className="info-box">
                        <h3>{t('prayerRequest.howItWorks')}</h3>
                        <ul>
                            <li>{t('prayerRequest.shareIntention')}</li>
                            <li>{t('prayerRequest.reviewedFirst')}</li>
                            <li>{t('prayerRequest.anonymousOption')}</li>
                            <li>{t('prayerRequest.communityPrays')}</li>
                        </ul>
                    </div>

                    {/* Prayer Request Form */}
                    <form onSubmit={handleSubmit} className="prayer-form">
                        <div className="form-row">
                            {/* Name Field */}
                            <div className="form-group">
                                <label htmlFor="name" className="form-label">
                                    {t('prayerRequest.fullName')} <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`form-input ${errors.name ? 'error' : ''}`}
                                    placeholder={t('prayerRequest.enterFullName')}
                                    disabled={isSubmitting}
                                />
                                {errors.name && <span className="error-message">{errors.name}</span>}
                            </div>

                            {/* Email Field */}
                            <div className="form-group">
                                <label htmlFor="email" className="form-label">
                                    {t('prayerRequest.emailAddress')} <span className="required">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`form-input ${errors.email ? 'error' : ''}`}
                                    placeholder={t('prayerRequest.enterEmail')}
                                    disabled={isSubmitting}
                                />
                                {errors.email && <span className="error-message">{errors.email}</span>}
                            </div>
                        </div>

                        {/* Phone Field */}
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label htmlFor="phone" className="form-label">
                                {t('prayerRequest.phoneNumber')} <span className="required">*</span>
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className={`form-input ${errors.phone ? 'error' : ''}`}
                                placeholder={t('prayerRequest.enterPhone')}
                                disabled={isSubmitting}
                                style={{ maxWidth: '50%' }}
                            />
                            {errors.phone && <span className="error-message">{errors.phone}</span>}
                        </div>

                        {/* Prayer Request Field */}
                        <div className="form-group">
                            <label htmlFor="prayerRequest" className="form-label">
                                {t('prayerRequest.prayerRequestLabel')} <span className="required">{t('common.required')}</span>
                            </label>
                            <textarea
                                id="prayerRequest"
                                name="prayerRequest"
                                value={formData.prayerRequest}
                                onChange={handleChange}
                                className={`form-textarea ${errors.prayerRequest ? 'error' : ''}`}
                                placeholder={t('prayerRequest.sharePrayerIntention')}
                                rows={6}
                                disabled={isSubmitting}
                            />
                            <div className="character-count">
                                {formData.prayerRequest.length} / 1000 {t('prayerRequest.characters')}
                            </div>
                            {errors.prayerRequest && (
                                <span className="error-message">{errors.prayerRequest}</span>
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
                                    {t('prayerRequest.submitAnonymously')}
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
                                        {t('prayerRequest.submitting')}
                                    </>
                                ) : (
                                    <>
                                        {t('prayerRequest.submitPrayerRequest')}
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Status Messages */}
                        {submitStatus === 'success' && (
                            <div className="alert alert-success">
                                <strong>✓ {t('common.success')}!</strong> {submitMessage}
                            </div>
                        )}

                        {submitStatus === 'error' && (
                            <div className="alert alert-error">
                                <strong>✗ {t('common.error')}!</strong> {submitMessage}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
