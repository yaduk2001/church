'use client';

import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { apiEndpoint } from '../config/api';
import './contact.css';

interface ContactFormData {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export default function ContactPage() {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState<ContactFormData>({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const submitForm = async (e: React.FormEvent) => {
        e.preventDefault();

        setError(null);
        setSuccess(false);

        // Validation
        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            setError(t('contact.fillAllFields'));
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError(t('contact.validEmail'));
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(apiEndpoint('contact'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to submit form');
            }

            setSuccess(true);
            setLoading(false);
            resetForm();

            setTimeout(() => {
                setSuccess(false);
            }, 5000);
        } catch (err) {
            setError(t('contact.submitFailed'));
            setLoading(false);
            console.error('Error submitting contact form:', err);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            subject: '',
            message: ''
        });
    };

    return (
        <div className="contact-page">
            {/* Hero Section */}
            <section className="contact-hero">
                <div className="container">
                    <div className="cross-symbol">✟</div>
                    <h1 className="fade-in">{t('contact.title')}</h1>
                    <p className="fade-in">{t('contact.heroSubtitle')}</p>
                </div>
            </section>

            {/* Main Contact Section */}
            <section className="section">
                <div className="container">
                    <div className="contact-grid">
                        {/* Contact Information */}
                        <div className="contact-info">
                            <h2>{t('contact.getInTouch')}</h2>
                            <p className="intro-text">{t('contact.introText')}</p>

                            <div className="contact-item">
                                <div className="contact-icon">📍</div>
                                <div>
                                    <h4>{t('contact.mainChurchAddress')}</h4>
                                    <p>St Mary's Jacobite Syrian Church<br />
                                        Malayidomthuruth, Kochi<br />
                                        Kerala, India</p>
                                </div>
                            </div>

                            <div className="contact-item">
                                <div className="contact-icon">📞</div>
                                <div>
                                    <h4>{t('contact.phone')}</h4>
                                    <p>{t('contact.office')}: +91 484 2354321<br />
                                        {t('contact.father')}: +91 9876543210<br />
                                        {t('contact.emergency')}: +91 9876543211</p>
                                </div>
                            </div>

                            <div className="contact-item">
                                <div className="contact-icon">✉️</div>
                                <div>
                                    <h4>{t('contact.email')}</h4>
                                    <p>info@stmarysmalayidomthuruth.org<br />
                                        vicar@stmarysmalayidomthuruth.org</p>
                                </div>
                            </div>

                            <div className="contact-item">
                                <div className="contact-icon">🕐</div>
                                <div>
                                    <h4>{t('contact.officeHours')}</h4>
                                    <p>
                                        <strong>{t('contact.mondayFriday')}:</strong> 9:00 AM - 5:00 PM<br />
                                        <strong>{t('contact.saturday')}:</strong> 9:00 AM - 1:00 PM<br />
                                        <strong>{t('contact.sunday')}:</strong> {t('contact.closedMassTimes')}<br />
                                        <strong>{t('contact.lunchBreak')}:</strong> 1:00 PM - 2:00 PM
                                    </p>
                                </div>
                            </div>

                            <div className="contact-item">
                                <div className="contact-icon">⛪</div>
                                <div>
                                    <h4>{t('contact.massTimings')}</h4>
                                    <p>
                                        <strong>{t('contact.weekdays')}:</strong> 6:00 AM, 6:30 PM<br />
                                        <strong>{t('contact.sundays')}:</strong> 6:00 AM, 8:00 AM, 10:00 AM, 6:30 PM<br />
                                        <a href="/mass-timings" className="view-all-link">{t('contact.viewAllTimings')} →</a>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="contact-form-container">
                            <h2>{t('contact.sendUsMessage')}</h2>

                            {error && (
                                <div className="alert alert-error">
                                    ✗ {error}
                                </div>
                            )}

                            {success && (
                                <div className="alert alert-success">
                                    ✓ {t('contact.thankYouMessage')}
                                </div>
                            )}

                            <form onSubmit={submitForm} className="contact-form">
                                <div className="form-group">
                                    <label htmlFor="name" className="form-label">{t('contact.name')} *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        className="form-control"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder={t('contact.yourFullName')}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email" className="form-label">{t('contact.email')} *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        className="form-control"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder={t('contact.yourEmail')}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="subject" className="form-label">{t('contact.subject')} *</label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        className="form-control"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder={t('contact.whatRegarding')}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="message" className="form-label">{t('contact.message')} *</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        className="form-control"
                                        rows={6}
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder={t('contact.typeMessage')}
                                        required
                                    ></textarea>
                                </div>

                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <span className="spinner-small"></span>
                                            {t('contact.sending')}
                                        </>
                                    ) : (
                                        t('contact.sendMessageBtn')
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Google Maps Section */}
            <section className="map-section">
                <div className="container">
                    <h2 className="section-title">{t('contact.findUsMap')}</h2>
                    <p className="section-subtitle">{t('contact.visitUs')}</p>

                    <div className="maps-container">
                        {/* Main Church Map */}
                        <div className="map-card">
                            <h3>St Mary's Jacobite Syrian Church (Main)</h3>
                            <div className="map-wrapper">
                                <iframe
                                    src="https://www.google.com/maps?q=MG+Road,+Kochi,+Kerala&output=embed"
                                    width="100%"
                                    height="400"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Main Church Location - Kochi"
                                ></iframe>
                                <div className="map-fallback">
                                    <p>
                                        🗺️ {t('contact.mapNotLoading')} <br />
                                        <a
                                            href="https://www.google.com/maps/search/?api=1&query=MG+Road+Kochi+Kerala"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="open-maps-link"
                                        >
                                            {t('contact.openGoogleMaps')} →
                                        </a>
                                    </p>
                                </div>
                            </div>
                            <p className="map-address">
                                📍 Malayidomthuruth, Kochi, Kerala<br />
                                📞 +91 484 2354321
                            </p>
                        </div>
                    </div>


                </div>
            </section>
        </div>
    );
}
