'use client';

import Link from 'next/link';
import { useLanguage } from '../contexts/LanguageContext';
import './about.css';

export default function AboutPage() {
    const { t } = useLanguage();
    const teamMembers = [
        {
            name: 'Pastor John Smith',
            role: 'Senior Pastor',
            image: '👨‍💼',
            bio: 'Leading our congregation with wisdom and compassion for over 15 years.'
        },
        {
            name: 'Sarah Johnson',
            role: 'Worship Leader',
            image: '🎵',
            bio: 'Inspiring worship and praise through music and song.'
        },
        {
            name: 'Michael Brown',
            role: 'Youth Pastor',
            image: '👨‍🏫',
            bio: 'Mentoring and guiding our youth in their faith journey.'
        },
        {
            name: 'Emily Davis',
            role: 'Children\'s Ministry',
            image: '👩‍🏫',
            bio: 'Creating engaging and fun learning experiences for children.'
        }
    ];

    const values = [
        {
            icon: '📖',
            title: 'Biblical Teaching',
            description: 'We believe in the authority of Scripture and teach directly from God\'s Word.'
        },
        {
            icon: '❤️',
            title: 'Loving Community',
            description: 'We strive to create a welcoming environment where everyone belongs.'
        },
        {
            icon: '🙏',
            title: 'Prayer & Worship',
            description: 'We prioritize prayer and worship as central to our faith and community.'
        },
        {
            icon: '🌍',
            title: 'Global Mission',
            description: 'We are committed to sharing the Gospel locally and around the world.'
        }
    ];

    return (
        <>
            {/* Hero Section */}
            <section className="about-hero">
                <div className="container">
                    <h1 className="fade-in">{t('about.title')}</h1>
                    <p className="fade-in">{t('about.heroSubtitle')}</p>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="section">
                <div className="container">
                    <h2 className="section-title">{t('about.ourHistory')}</h2>
                    <div className="story-content">
                        <p>
                            {t('about.storyPara1')}
                        </p>
                        <p>
                            {t('about.storyPara2')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Our Values Section */}
            <section className="section" style={{ background: 'var(--bg-cream)' }}>
                <div className="container">
                    <h2 className="section-title">{t('about.ourVision')}</h2>
                    <div className="values-grid">
                        {values.map((value, index) => (
                            <div key={index} className="value-card card">
                                <div className="value-icon">{value.icon}</div>
                                <h3>{value.title}</h3>
                                <p>{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Team Section */}
            <section className="section">
                <div className="container">
                    <h2 className="section-title">{t('about.ourTeam')}</h2>
                    <div className="team-grid">
                        {teamMembers.map((member, index) => (
                            <div key={index} className="team-card card">
                                <div className="team-image">{member.image}</div>
                                <h3>{member.name}</h3>
                                <h4>{member.role}</h4>
                                <p>{member.bio}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="cta-section section" style={{ background: 'linear-gradient(135deg, var(--primary-burgundy), var(--secondary-brown))' }}>
                <div className="container text-center">
                    <h2 style={{ color: 'var(--text-white)' }}>{t('about.joinUsSunday')}</h2>
                    <p style={{ color: 'var(--primary-cream)', fontSize: '1.2rem', marginBottom: '2rem' }}>
                        {t('about.experienceWorship')}
                    </p>
                    <div className="cta-buttons">
                        <Link href="/contact" className="btn btn-secondary">{t('buttons.contactUs')}</Link>
                        <Link href="/" className="btn btn-outline" style={{ color: 'white', borderColor: 'white' }}>{t('about.backToHome')}</Link>
                    </div>
                </div>
            </section>
        </>
    );
}
