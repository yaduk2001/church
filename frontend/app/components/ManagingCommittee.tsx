'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { apiEndpoint } from '../config/api';
import './ManagingCommittee.css';

interface CommitteeMember {
    _id: string;
    name: string;
    position: string;
    role: string;
    photoUrl?: string;
    email?: string;
    phone?: string;
    displayOrder: number;
}

export default function ManagingCommittee() {
    const [members, setMembers] = useState<CommitteeMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set());
    const { t } = useLanguage();

    useEffect(() => {
        fetchCommitteeMembers();
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const cardId = entry.target.getAttribute('data-card-id');
                        if (cardId) {
                            setVisibleCards((prev) => new Set(prev).add(cardId));
                        }
                    }
                });
            },
            { threshold: 0.1 }
        );

        const cards = document.querySelectorAll('.committee-card-animated');
        cards.forEach((card) => observer.observe(card));

        return () => observer.disconnect();
    }, [members]);

    const fetchCommitteeMembers = async () => {
        try {
            const response = await fetch(apiEndpoint('committee-members'));
            if (!response.ok) {
                throw new Error('Failed to fetch committee members');
            }
            const data = await response.json();

            // Ensure data is an array
            if (Array.isArray(data)) {
                setMembers(data);
            } else {
                console.error('Committee data is not an array:', data);
                setMembers([]);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching committee members:', error);
            setMembers([]); // Set to empty array on error
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <section className="committee-section section">
                <div className="container">
                    <h2 className="section-title">{t('home.managingCommitteeTitle')}</h2>
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>{t('common.loading')}</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="committee-section section" style={{
            background: 'linear-gradient(180deg, #fafafa 0%, #ffffff 100%)',
            padding: '4rem 0',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Decorative Dignitary (Patriarch) */}
            <div style={{
                position: 'absolute',
                top: '5%',
                right: '-5%',
                width: '350px',
                height: '500px',
                backgroundImage: 'url("/images/dignitaries/H H Moran PNG 04.png")',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'top right',
                opacity: 0.08,
                zIndex: 0,
                pointerEvents: 'none'
            }} className="desktop-only-decor" />
            {/* Keyframes for running border animation around perimeter */}
            <style>{`
                @keyframes borderTop {
                    0%, 100% { left: -100%; }
                    25% { left: 100%; }
                    26%, 100% { left: 100%; }
                }
                @keyframes borderRight {
                    0%, 25% { top: -100%; }
                    50% { top: 100%; }
                    51%, 100% { top: 100%; }
                }
                @keyframes borderBottom {
                    0%, 50% { right: -100%; }
                    75% { right: 100%; }
                    76%, 100% { right: 100%; }
                }
                @keyframes borderLeft {
                    0%, 75% { bottom: -100%; }
                    100% { bottom: 100%; }
                }
            `}</style>

            <div className="container">
                {/* Section Header */}
                <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                    <h2 className="section-title" style={{
                        fontSize: '2.25rem',
                        color: '#800020',
                        marginBottom: '0.75rem',
                        fontWeight: '700'
                    }}>
                        {t('home.managingCommitteeTitle')}
                    </h2>
                    <p className="section-subtitle" style={{
                        fontSize: '1rem',
                        color: '#6B7280',
                        maxWidth: '600px',
                        margin: '0 auto'
                    }}>
                        {t('committee.subtitle')}
                    </p>
                </div>

                {members.length === 0 ? (
                    <div className="empty-state" style={{
                        textAlign: 'center',
                        padding: '3rem 2rem',
                        color: '#9CA3AF'
                    }}>
                        <p>{t('committee.noMembers')}</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                        gap: '2rem',
                        maxWidth: '1400px',
                        margin: '0 auto'
                    }}>
                        {members.map((member, index) => (
                            <div
                                key={member._id}
                                data-card-id={member._id}
                                className="committee-card-animated"
                                style={{
                                    position: 'relative',
                                    background: 'white',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                    border: '2px solid rgba(128, 0, 32, 0.08)',
                                    opacity: visibleCards.has(member._id) ? 1 : 0,
                                    transform: visibleCards.has(member._id)
                                        ? 'translateY(0) scale(1) rotateX(0deg)'
                                        : 'translateY(40px) scale(0.95) rotateX(10deg)',
                                    transitionDelay: `${index * 0.1}s`,
                                    perspective: '1000px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
                                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(128, 0, 32, 0.18)';
                                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';

                                    // Trigger running border animation
                                    const borderLine = e.currentTarget.querySelector('.running-border-line') as HTMLElement;
                                    if (borderLine) {
                                        borderLine.style.opacity = '1';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08)';
                                    e.currentTarget.style.borderColor = 'rgba(128, 0, 32, 0.08)';

                                    // Hide running border
                                    const borderLine = e.currentTarget.querySelector('.running-border-line') as HTMLElement;
                                    if (borderLine) {
                                        borderLine.style.opacity = '0';
                                    }
                                }}
                            >
                                {/* Running Border Lines - Travels around entire border */}
                                {/* Top border line */}
                                <div
                                    className="running-border-line running-border-top"
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: '-100%',
                                        width: '80px',
                                        height: '3px',
                                        background: 'linear-gradient(90deg, transparent, #800020, transparent)',
                                        opacity: 0,
                                        transition: 'opacity 0.3s ease',
                                        animation: 'borderTop 2.4s linear infinite',
                                        zIndex: 10
                                    }}
                                />
                                {/* Right border line */}
                                <div
                                    className="running-border-line running-border-right"
                                    style={{
                                        position: 'absolute',
                                        top: '-100%',
                                        right: 0,
                                        width: '3px',
                                        height: '80px',
                                        background: 'linear-gradient(180deg, transparent, #800020, transparent)',
                                        opacity: 0,
                                        transition: 'opacity 0.3s ease',
                                        animation: 'borderRight 2.4s linear infinite',
                                        zIndex: 10
                                    }}
                                />
                                {/* Bottom border line */}
                                <div
                                    className="running-border-line running-border-bottom"
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: '-100%',
                                        width: '80px',
                                        height: '3px',
                                        background: 'linear-gradient(90deg, transparent, #800020, transparent)',
                                        opacity: 0,
                                        transition: 'opacity 0.3s ease',
                                        animation: 'borderBottom 2.4s linear infinite',
                                        zIndex: 10
                                    }}
                                />
                                {/* Left border line */}
                                <div
                                    className="running-border-line running-border-left"
                                    style={{
                                        position: 'absolute',
                                        bottom: '-100%',
                                        left: 0,
                                        width: '3px',
                                        height: '80px',
                                        background: 'linear-gradient(180deg, transparent, #800020, transparent)',
                                        opacity: 0,
                                        transition: 'opacity 0.3s ease',
                                        animation: 'borderLeft 2.4s linear infinite',
                                        zIndex: 10
                                    }}
                                />
                                {/* Photo */}
                                <div style={{
                                    position: 'relative',
                                    width: '100%',
                                    height: '220px',
                                    overflow: 'hidden',
                                    background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)'
                                }}>
                                    <img
                                        src={member.photoUrl || '/placeholder-person.png'}
                                        alt={member.name}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            transition: 'transform 0.5s ease'
                                        }}
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = '/placeholder-person.png';
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'scale(1.08)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }}
                                    />

                                    {/* Gradient Overlay on Hover */}
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: 'linear-gradient(180deg, transparent 0%, rgba(128, 0, 32, 0.3) 100%)',
                                        opacity: 0,
                                        transition: 'opacity 0.3s ease',
                                        pointerEvents: 'none'
                                    }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.opacity = '1';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.opacity = '0';
                                        }} />

                                    {/* Position Badge with Glassmorphism */}
                                    <div className="committee-pos-badge">
                                        {member.position}
                                    </div>
                                </div>

                                {/* Info Section with Gradient Background */}
                                <div style={{
                                    padding: '1.5rem 1.25rem',
                                    textAlign: 'center',
                                    background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)'
                                }}>
                                    <h3 style={{
                                        fontSize: '1.15rem',
                                        color: '#800020',
                                        marginBottom: '0.4rem',
                                        fontWeight: '700',
                                        lineHeight: '1.3',
                                        letterSpacing: '-0.2px'
                                    }}>
                                        {member.name}
                                    </h3>

                                    {member.role && (
                                        <p style={{
                                            color: '#6B7280',
                                            fontSize: '0.85rem',
                                            marginBottom: '1rem',
                                            fontWeight: '500',
                                            fontStyle: 'italic'
                                        }}>
                                            {member.role}
                                        </p>
                                    )}

                                    {member.email && (
                                        <a
                                            href={`mailto:${member.email}`}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.4rem',
                                                color: '#D4AF37',
                                                textDecoration: 'none',
                                                fontSize: '0.85rem',
                                                fontWeight: '700',
                                                padding: '0.6rem 1.2rem',
                                                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.12), rgba(212, 175, 55, 0.06))',
                                                borderRadius: '25px',
                                                border: '2px solid rgba(212, 175, 55, 0.3)',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                boxShadow: '0 2px 8px rgba(212, 175, 55, 0.15)'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.color = 'white';
                                                e.currentTarget.style.background = 'linear-gradient(135deg, #800020, #600018)';
                                                e.currentTarget.style.borderColor = '#800020';
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(128, 0, 32, 0.3)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.color = '#D4AF37';
                                                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212, 175, 55, 0.12), rgba(212, 175, 55, 0.06))';
                                                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(212, 175, 55, 0.15)';
                                            }}
                                        >
                                            ✉️ Contact
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
