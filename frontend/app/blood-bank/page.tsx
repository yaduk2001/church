'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { apiEndpoint } from '../config/api';
import './page.css';

interface BloodDonor {
    _id: string;
    donorName: string;
    bloodGroup: string;
    phone: string;
    email: string;
    age: number;
    gender: string;
    lastDonation?: Date;
    address: string;
    isAvailable: boolean;
}

interface BloodGroupStats {
    _id: string;
    count: number;
    available: number;
}

interface FormData {
    donorName: string;
    bloodGroup: string;
    phone: string;
    email: string;
    dateOfBirth: string;
    gender: string;
    address: string;
    lastDonation?: string;
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function BloodBankPage() {
    const { t } = useLanguage();
    const [donors, setDonors] = useState<BloodDonor[]>([]);
    const [filteredDonors, setFilteredDonors] = useState<BloodDonor[]>([]);
    const [stats, setStats] = useState<BloodGroupStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('all');
    const [showRegisterForm, setShowRegisterForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState<FormData>({
        donorName: '',
        bloodGroup: '',
        phone: '',
        email: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        lastDonation: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [submitMessage, setSubmitMessage] = useState('');

    useEffect(() => {
        fetchDonors();
        fetchStats();
    }, []);

    useEffect(() => {
        filterDonors();
    }, [selectedBloodGroup, searchTerm, donors]);

    const fetchDonors = async () => {
        try {
            const response = await fetch(apiEndpoint('blood-bank'));
            const data = await response.json();
            setDonors(data);
            setFilteredDonors(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching donors:', error);
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch(apiEndpoint('blood-bank/stats'));
            const data = await response.json();
            setStats(data.byBloodGroup);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const filterDonors = () => {
        let filtered = donors;

        // Filter by blood group
        if (selectedBloodGroup !== 'all') {
            filtered = filtered.filter((d) => d.bloodGroup === selectedBloodGroup);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(
                (d) =>
                    d.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    d.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredDonors(filtered);
    };

    const getCountForBloodGroup = (group: string) => {
        const stat = stats.find((s) => s._id === group);
        return stat ? stat.available : 0;
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            const response = await fetch(apiEndpoint('blood-bank'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setSubmitStatus('success');
                setSubmitMessage('Thank you for registering as a blood donor! You may save lives.');
                setFormData({
                    donorName: '',
                    bloodGroup: '',
                    phone: '',
                    email: '',
                    dateOfBirth: '',
                    gender: '',
                    address: '',
                    lastDonation: '',
                });
                fetchDonors();
                fetchStats();
                setTimeout(() => {
                    setShowRegisterForm(false);
                    setSubmitStatus('idle');
                }, 3000);
            } else {
                setSubmitStatus('error');
                setSubmitMessage(data.message || 'Failed to register. Please try again.');
            }
        } catch (error) {
            console.error('Error registering donor:', error);
            setSubmitStatus('error');
            setSubmitMessage('Network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="blood-bank-page">
                <div className="container">
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>{t('bloodBank.loadingBloodBank')}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="blood-bank-page">
            <div className="container">
                {/* Page Header */}
                <div className="page-header">
                    <div className="blood-icon">🩸</div>
                    <h1 className="page-title">{t('bloodBank.title')}</h1>
                    <p className="page-subtitle">
                        {t('bloodBank.subtitle')}
                    </p>
                </div>

                {/* Stats Section */}
                <div className="stats-grid">
                    {BLOOD_GROUPS.map((group) => (
                        <div key={group} className="stat-card">
                            <div className="blood-group-badge">{group}</div>
                            <div className="donor-count">{getCountForBloodGroup(group)}</div>
                            <div className="stat-label">{t('bloodBank.availableDonors')}</div>
                        </div>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="action-bar">
                    <button
                        className="register-btn"
                        onClick={() => setShowRegisterForm(!showRegisterForm)}
                    >
                        {showRegisterForm ? t('bloodBank.closeForm') : t('bloodBank.registerAsDonorBtn')}
                    </button>
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder={t('bloodBank.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>

                {/* Registration Form */}
                {showRegisterForm && (
                    <div className="register-form-section">
                        <h2>{t('bloodBank.registerAsDonor')}</h2>
                        <form onSubmit={handleRegisterSubmit} className="register-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>{t('bloodBank.fullName')} *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.donorName}
                                        onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                                        placeholder={t('bloodBank.yourFullName')}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{t('bloodBank.bloodGroup')} *</label>
                                    <select
                                        required
                                        value={formData.bloodGroup}
                                        onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                                    >
                                        <option value="">{t('bloodBank.selectBloodGroup')}</option>
                                        {BLOOD_GROUPS.map((group) => (
                                            <option key={group} value={group}>
                                                {group}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>{t('bloodBank.phoneNumber')} *</label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="9876543210"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{t('bloodBank.email')} *</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder={t('bloodBank.yourEmail')}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>{t('bloodBank.dateOfBirth')} *</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.dateOfBirth}
                                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{t('bloodBank.gender')} *</label>
                                    <select
                                        required
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                    >
                                        <option value="">{t('bloodBank.selectGender')}</option>
                                        <option value="Male">{t('bloodBank.male')}</option>
                                        <option value="Female">{t('bloodBank.female')}</option>
                                        <option value="Other">{t('bloodBank.other')}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>{t('bloodBank.address')} *</label>
                                <textarea
                                    required
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder={t('bloodBank.yourFullAddress')}
                                    rows={3}
                                />
                            </div>

                            <div className="form-group">
                                <label>{t('bloodBank.lastDonationDate')}</label>
                                <input
                                    type="date"
                                    value={formData.lastDonation}
                                    onChange={(e) => setFormData({ ...formData, lastDonation: e.target.value })}
                                />
                            </div>

                            <button type="submit" className="submit-btn" disabled={isSubmitting}>
                                {isSubmitting ? t('bloodBank.registering') : t('bloodBank.registerAsDonor')}
                            </button>

                            {submitStatus === 'success' && (
                                <div className="alert alert-success">{submitMessage}</div>
                            )}
                            {submitStatus === 'error' && (
                                <div className="alert alert-error">{submitMessage}</div>
                            )}
                        </form>
                    </div>
                )}

                {/* Blood Group Filter */}
                <div className="filter-section">
                    <h3>{t('bloodBank.filterByBloodGroup')}:</h3>
                    <div className="blood-group-filters">
                        <button
                            className={`filter-btn ${selectedBloodGroup === 'all' ? 'active' : ''}`}
                            onClick={() => setSelectedBloodGroup('all')}
                        >
                            {t('bloodBank.all')} ({donors.length})
                        </button>
                        {BLOOD_GROUPS.map((group) => (
                            <button
                                key={group}
                                className={`filter-btn ${selectedBloodGroup === group ? 'active' : ''}`}
                                onClick={() => setSelectedBloodGroup(group)}
                            >
                                {group} ({getCountForBloodGroup(group)})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Donors List */}
                <div className="donors-section">
                    <h2>{t('bloodBank.availableDonors')} ({filteredDonors.length})</h2>
                    {filteredDonors.length === 0 ? (
                        <div className="empty-state">
                            <p>{t('bloodBank.noDonorsFound')}</p>
                        </div>
                    ) : (
                        <div className="donors-grid">
                            {filteredDonors.map((donor) => (
                                <div key={donor._id} className="donor-card">
                                    <div className="donor-header">
                                        <div className="blood-badge">{donor.bloodGroup}</div>
                                        <div className="donor-name">{donor.donorName}</div>
                                    </div>
                                    <div className="donor-details">
                                        <p>
                                            <strong>👤 {t('bloodBank.age')}:</strong> {donor.age} {t('bloodBank.years')}
                                        </p>
                                        <p>
                                            <strong>⚧ {t('bloodBank.gender')}:</strong> {donor.gender}
                                        </p>
                                        <p>
                                            <strong>📞 {t('bloodBank.phone')}:</strong> {donor.phone}
                                        </p>
                                        <p>
                                            <strong>✉️ {t('bloodBank.email')}:</strong> {donor.email}
                                        </p>
                                        <p>
                                            <strong>📍 {t('bloodBank.addressLabel')}:</strong> {donor.address}
                                        </p>
                                        {donor.lastDonation && (
                                            <p className="last-donation">
                                                <strong>{t('bloodBank.lastDonation')}:</strong>{' '}
                                                {new Date(donor.lastDonation).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
