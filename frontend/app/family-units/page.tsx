'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../contexts/LanguageContext';
import { apiEndpoint } from '../config/api';
import './page.css';

interface FamilyMember {
    name: string;
    dateOfBirth: Date;
    age: number;
    gender: string;
    relationship: string;
    phone?: string;
    email?: string;
}

interface FamilyUnit {
    _id: string;
    familyName: string;
    headOfFamily: string;
    members: FamilyMember[];
    address: string;
    phone: string;
    createdAt: Date;
}

interface Stats {
    totalFamilies: number;
    memberStats: {
        totalMembers: number;
        maleCount: number;
        femaleCount: number;
        averageAge: number;
    };
    parishStats: Array<{
        _id: string;
        familyCount: number;
    }>;
}

export default function FamilyDirectoryPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [families, setFamilies] = useState<FamilyUnit[]>([]);
    const [filteredFamilies, setFilteredFamilies] = useState<FamilyUnit[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedFamily, setExpandedFamily] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFamilies();
        fetchStats();
    }, []);

    useEffect(() => {
        filterFamilies();
    }, [searchTerm, families]);

    const fetchFamilies = async () => {
        try {
            const response = await fetch(apiEndpoint('family-units'));
            const data = await response.json();
            setFamilies(data);
            setFilteredFamilies(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching families:', error);
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch(apiEndpoint('family-units/stats/overview'));
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const filterFamilies = () => {
        let filtered = families;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(
                (f) =>
                    f.familyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    f.headOfFamily.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    f.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    f.members.some((m) => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        setFilteredFamilies(filtered);
    };

    const toggleFamily = (familyId: string) => {
        setExpandedFamily(expandedFamily === familyId ? null : familyId);
    };

    const getRelationshipIcon = (relationship: string) => {
        switch (relationship) {
            case 'Father':
                return '👨';
            case 'Mother':
                return '👩';
            case 'Son':
                return '👦';
            case 'Daughter':
                return '👧';
            case 'Grandfather':
                return '👴';
            case 'Grandmother':
                return '👵';
            default:
                return '👤';
        }
    };

    const getGenderIcon = (gender: string) => {
        return gender === 'Male' ? '♂️' : gender === 'Female' ? '♀️' : '⚧';
    };

    if (loading) {
        return (
            <div className="family-directory-page">
                <div className="container">
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>{t('familyUnits.loadingDirectory')}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="family-directory-page">
            <div className="container">
                {/* Page Header */}
                <div className="page-header">
                    <div className="cross-symbol">✟</div>
                    <h1 className="page-title">{t('familyUnits.familyDirectory')}</h1>
                    <p className="page-subtitle">
                        {t('familyUnits.subtitle')}
                    </p>

                    {/* Auth Actions */}
                    <div className="auth-actions">
                        <button className="btn-register" onClick={() => router.push('/family-units/register')}>
                            Create Family Account
                        </button>
                        <button className="btn-login" onClick={() => router.push('/family-units/login')}>
                            Login
                        </button>
                    </div>
                </div>

                {/* Statistics Cards */}
                {stats && (
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">👨‍👩‍👧‍👦</div>
                            <div className="stat-value">{stats.totalFamilies}</div>
                            <div className="stat-label">{t('familyUnits.totalFamilies')}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">👥</div>
                            <div className="stat-value">{stats.memberStats.totalMembers || 0}</div>
                            <div className="stat-label">{t('familyUnits.totalMembers')}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">♂️</div>
                            <div className="stat-value">{stats.memberStats.maleCount || 0}</div>
                            <div className="stat-label">{t('familyUnits.maleMembers')}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">♀️</div>
                            <div className="stat-value">{stats.memberStats.femaleCount || 0}</div>
                            <div className="stat-label">{t('familyUnits.femaleMembers')}</div>
                        </div>
                    </div>
                )}

                {/* Search */}
                <div className="controls-section">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder={t('familyUnits.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <span className="search-icon">🔍</span>
                    </div>
                </div>

                {/* Results Info */}
                <div className="results-info">
                    <p>
                        {t('familyUnits.showing')} <strong>{filteredFamilies.length}</strong> {t('familyUnits.of')}{' '}
                        <strong>{families.length}</strong> {t('familyUnits.families')}
                    </p>
                </div>

                {/* Family List */}
                {filteredFamilies.length === 0 ? (
                    <div className="empty-state">
                        <p>{t('familyUnits.noFamiliesFound')}{searchTerm && ` ${t('familyUnits.for')} "${searchTerm}"`}.</p>
                    </div>
                ) : (
                    <div className="families-list">
                        {filteredFamilies.map((family, index) => (
                            <div
                                key={family._id}
                                className="family-card"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                {/* Family Header */}
                                <div className="family-header" onClick={() => toggleFamily(family._id)}>
                                    <div className="family-main-info">
                                        <h3 className="family-name">{family.familyName}</h3>
                                        <p className="head-of-family">
                                            {t('familyUnits.head')}: <strong>{family.headOfFamily}</strong>
                                        </p>
                                    </div>
                                    <div className="family-meta">
                                        <span className="member-count">
                                            {family.members.length} {family.members.length !== 1 ? t('familyUnits.members') : t('familyUnits.member')}
                                        </span>
                                        <button className="toggle-btn">
                                            {expandedFamily === family._id ? '▼' : '▶'}
                                        </button>
                                    </div>
                                </div>

                                {/* Quick Info */}
                                <div className="family-quick-info">
                                    <div className="info-item">
                                        <span className="info-icon">📍</span>
                                        <span>{family.address}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-icon">📞</span>
                                        <span>{family.phone}</span>
                                    </div>
                                </div>

                                {/* Expanded Members List */}
                                {expandedFamily === family._id && (
                                    <div className="members-section">
                                        <h4>{t('familyUnits.familyMembers')}:</h4>
                                        <div className="members-grid">
                                            {family.members.map((member, idx) => (
                                                <div key={idx} className="member-card">
                                                    <div className="member-avatar">
                                                        {getRelationshipIcon(member.relationship)}
                                                    </div>
                                                    <div className="member-info">
                                                        <h5 className="member-name">{member.name}</h5>
                                                        <p className="member-relationship">{member.relationship}</p>
                                                        <div className="member-details">
                                                            <span className="detail-item">
                                                                {getGenderIcon(member.gender)} {member.gender}
                                                            </span>
                                                            <span className="detail-item">🎂 {member.age} {t('familyUnits.years')}</span>
                                                        </div>
                                                        {/* Hide detailed contact info for public/masked view, or show if backend returns it */}
                                                        {member.phone && (
                                                            <p className="member-contact">📞 {member.phone}</p>
                                                        )}
                                                        {member.email && (
                                                            <p className="member-contact">✉️ {member.email}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
