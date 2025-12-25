'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { apiEndpoint } from '../config/api';
import ChurchCalendar from './ChurchCalendar';
import './page.css';
import '../malayalam-styles.css';

interface Church {
    _id: string;
    name: string;
}

interface MassTiming {
    _id: string;
    churchId: Church;
    day?: string;
    date?: string;
    time: string;
    language: string;
    type: string;
    description?: string;
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAYS_ORDER = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function MassTimingsPage() {
    const { t } = useLanguage();
    const [massTimings, setMassTimings] = useState<MassTiming[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
    const [selectedType, setSelectedType] = useState<string>('All');
    const [showCalendar, setShowCalendar] = useState(false);

    useEffect(() => {
        fetchMassTimings();
    }, []);

    const fetchMassTimings = async () => {
        try {
            const response = await fetch(apiEndpoint('mass-timings'));
            const data = await response.json();
            setMassTimings(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching mass timings:', error);
            setLoading(false);
        }
    };

    // Derived lists for filter dropdowns
    const languages = ['All', ...Array.from(new Set(massTimings.map(t => t.language)))];
    const types = ['All', 'Regular', 'Special', 'Festival'];

    const getFilteredTimings = () => {
        return massTimings.filter(timing => {
            // Filter by Date (if selected)
            if (selectedDate) {
                if (timing.date) {
                    // Match specific date
                    const timingDate = new Date(timing.date).toISOString().split('T')[0];
                    if (timingDate !== selectedDate) return false;
                } else if (timing.day) {
                    // Match day of week
                    const selectedDayName = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' });
                    if (timing.day !== selectedDayName) return false;
                }
            }

            // Filter by Language
            if (selectedLanguage !== 'All' && timing.language !== selectedLanguage) return false;

            // Filter by Type
            if (selectedType !== 'All' && timing.type !== selectedType) return false;

            return true;
        });
    };

    const groupedTimings = groupByChurch(getFilteredTimings());

    // ... helper groupByChurch remains same ...
    function groupByChurch(timings: MassTiming[]) {
        const grouped: { [key: string]: MassTiming[] } = {};
        timings.forEach((timing) => {
            const churchName = timing.churchId?.name || 'Unknown Church';
            if (!grouped[churchName]) grouped[churchName] = [];
            grouped[churchName].push(timing);
        });
        return grouped;
    }

    if (loading) {
        return (
            <div className="mass-timings-page">
                <div className="container">
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>{t('massTimings.loadingMassTimings')}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mass-timings-page" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Decorative Dignitary Watermark */}
            <div style={{
                position: 'fixed',
                bottom: '-50px',
                right: '-50px',
                width: '400px',
                height: '600px',
                backgroundImage: 'url("/images/dignitaries/H H PNG 40.png")',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'bottom right',
                opacity: 0.1,
                zIndex: 0,
                pointerEvents: 'none'
            }} className="desktop-only-decor" />
            <div className="container">
                <div className="page-header" style={{ position: 'relative', zIndex: 1 }}>
                    <div className="page-emblem" style={{ marginBottom: '1rem' }}>
                        <img
                            src="/images/Emblem/1766481150211.png"
                            alt="Church Emblem"
                            style={{ width: '60px', height: 'auto', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}
                        />
                    </div>
                    <h1 className="page-title">{t('massTimings.holyMassTimings')}</h1>
                    <p className="page-subtitle">{t('massTimings.subtitle')}</p>
                </div>

                {/* Filters Section */}
                <div className="filters-container-modern">
                    <div className="filter-input-wrapper">
                        <label className="filter-label">
                            <span className="filter-icon">📅</span>
                            Date
                        </label>
                        <button
                            className="calendar-button-modern"
                            onClick={() => setShowCalendar(true)}
                        >
                            {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            }) : 'Select Date'}
                        </button>
                    </div>

                    <div className="filter-input-wrapper">
                        <label className="filter-label">
                            <span className="filter-icon">🌐</span>
                            Language
                        </label>
                        <select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            className="filter-input-modern"
                        >
                            {languages.map(lang => (
                                <option key={lang} value={lang}>{lang}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-input-wrapper">
                        <label className="filter-label">
                            <span className="filter-icon">🏷️</span>
                            Type
                        </label>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="filter-input-modern"
                        >
                            {types.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-input-wrapper" style={{ justifyContent: 'flex-end' }}>
                        <button
                            onClick={() => { setSelectedDate(''); setSelectedLanguage('All'); setSelectedType('All'); }}
                            className="reset-button-modern"
                        >
                            <span style={{ marginRight: '0.5rem' }}>🔄</span>
                            Reset Filters
                        </button>
                    </div>
                </div>

                {/* Results Grid */}
                <div className="churches-container">
                    {Object.keys(groupedTimings).length === 0 ? (
                        <div className="empty-state">
                            <p>{t('massTimings.noTimingsFound')}</p>
                        </div>
                    ) : (
                        Object.entries(groupedTimings).map(([churchName, timings]) => (
                            <div key={churchName} className="church-section">
                                <h2 className="church-name">
                                    <span className="church-icon">⛪</span>
                                    {churchName === 'C1' ? "St Mary's Jacobite Syrian Church" : churchName}
                                </h2>

                                <div className="timings-grid">
                                    {timings.map((timing) => (
                                        <div
                                            key={timing._id}
                                            className={`timing-card-modern timing-card-${timing.type.toLowerCase()}`}
                                        >
                                            <div className="timing-card-gradient-overlay"></div>
                                            <div className="timing-card-content">
                                                <div className="timing-header-modern">
                                                    <div className="timing-day-modern">
                                                        <span className="day-icon">📆</span>
                                                        {timing.date ? new Date(timing.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }) : timing.day}
                                                    </div>
                                                    {timing.type !== 'Regular' && (
                                                        <span className={`timing-badge-modern badge-${timing.type.toLowerCase()}`}>
                                                            {timing.type === 'Festival' ? '🎉' : '⭐'} {timing.type}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="timing-time-modern">
                                                    <span className="time-icon">🕐</span>
                                                    <span className="time-text">{timing.time}</span>
                                                </div>

                                                {timing.description && (
                                                    <div className="timing-description-modern">
                                                        "{timing.description}"
                                                    </div>
                                                )}

                                                <div className="timing-details-modern">
                                                    <div className="timing-language-modern">
                                                        <span className="detail-icon">🗣️</span>
                                                        <span>{timing.language}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Note */}
                <div className="page-footer">
                    <div className="info-box">
                        <h3>{t('massTimings.importantNotes')}</h3>
                        <ul>
                            <li>{t('massTimings.arriveEarly')}</li>
                            <li>{t('massTimings.confessionAvailable')}</li>
                            <li>{t('massTimings.specialTimings')}</li>
                            <li>{t('massTimings.contactOffice')}</li>
                        </ul>
                    </div>
                </div>

                {/* Church Calendar Modal */}
                {showCalendar && (
                    <ChurchCalendar
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                        onClose={() => setShowCalendar(false)}
                    />
                )}
            </div>
        </div>
    );
}
