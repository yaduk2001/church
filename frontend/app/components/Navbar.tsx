'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { apiEndpoint } from '../config/api';
import './Navbar.css';

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [familyInitial, setFamilyInitial] = useState('F');
    const pathname = usePathname();
    const router = useRouter();
    const { language, setLanguage, t } = useLanguage();

    useEffect(() => {
        const checkLogin = async () => {
            const token = localStorage.getItem('familyToken');
            if (token) {
                setIsLoggedIn(true);
                try {
                    const response = await fetch(apiEndpoint('family-auth/me'), {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        if (data && data.headOfFamily) {
                            // Get first letter of first name of family head
                            const initial = data.headOfFamily.split(' ')[0].charAt(0).toUpperCase();
                            setFamilyInitial(initial);
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch family details', error);
                }
            } else {
                setIsLoggedIn(false);
            }
        };

        checkLogin();
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem('familyToken');
        localStorage.removeItem('familyId');
        setIsLoggedIn(false);
        router.push('/');
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'ml' : 'en');
    };

    const isActive = (path: string) => {
        if (path === '/') {
            return pathname === path;
        }
        return pathname.startsWith(path);
    };

    if (pathname.startsWith('/admin') || pathname.startsWith('/family-units/dashboard')) {
        return null;
    }


    return (
        <nav className="navbar">
            <div className="navbar-content">
                {/* Logo and Church Name */}
                {/* LEFT: Logo and Church Name */}
                <div className="navbar-brand">
                    <img
                        src="/images/Emblem/1766481150211.png"
                        alt="Logo"
                        className="navbar-emblem"
                        style={{ width: '40px', height: 'auto', marginRight: '12px' }}
                    />
                    <div className="brand-text-container">
                        <span className="brand-text-main">St Mary's Jacobite Syrian Church</span>
                        <span className="brand-text-sub">Malayidomthuruth</span>
                    </div>
                </div>

                {/* CENTER: Navigation Links */}
                <div className={`navbar-center ${mobileMenuOpen ? 'active' : ''}`}>
                    <Link href="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                        {t('nav.home')}
                    </Link>

                    <Link href="/mass-timings" className={`nav-link ${isActive('/mass-timings') ? 'active' : ''}`}>
                        {t('nav.massTimings')}
                    </Link>

                    <div className="nav-dropdown">
                        <button className="nav-link dropdown-toggle">
                            {t('nav.services')}
                            <span className="arrow">▼</span>
                        </button>
                        <div className="dropdown-menu">
                            <Link href="/prayer-request" className="dropdown-item">{t('nav.prayerRequest')}</Link>
                            <Link href="/thanksgiving" className="dropdown-item">{t('nav.thanksgiving')}</Link>
                            <Link href="/venda" className="dropdown-item">{t('nav.venda')}</Link>
                            <Link href="/blood-bank" className="dropdown-item">{t('nav.bloodBank')}</Link>
                        </div>
                    </div>

                    <div className="nav-dropdown">
                        <button className="nav-link dropdown-toggle">
                            {t('nav.community')}
                            <span className="arrow">▼</span>
                        </button>
                        <div className="dropdown-menu">
                            <Link href="/family-units" className="dropdown-item">{t('nav.familyUnits')}</Link>
                            <Link href="/gallery" className="dropdown-item">{t('nav.gallery')}</Link>
                            <Link href="/documents" className="dropdown-item">{t('nav.documents')}</Link>
                        </div>
                    </div>

                    <Link href="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>
                        {t('nav.about')}
                    </Link>

                    <Link href="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`}>
                        {t('nav.contact')}
                    </Link>
                </div>

                {/* RIGHT: Icons & Mobile Toggle */}
                <div className="navbar-right">
                    {/* Language Toggle */}
                    <button
                        className="language-toggle"
                        onClick={toggleLanguage}
                        title={language === 'en' ? 'മലയാളം' : 'English'}
                    >
                        {language === 'en' ? 'മ' : 'EN'}
                    </button>

                    {/* Family Profile / Login */}
                    {isLoggedIn ? (
                        <div className="profile-dropdown">
                            <div className="profile-icon">
                                {familyInitial}
                            </div>
                            <div className="dropdown-menu" style={{ right: 0, left: 'auto' }}>
                                <Link href="/family-units/dashboard" className="dropdown-item">My Dashboard</Link>
                                <button
                                    onClick={handleLogout}
                                    className="dropdown-item"
                                    style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem' }}
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    ) : (
                        <Link href="/family-units/login" className="login-btn">
                            <span>🔒</span> Login
                        </Link>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </div>
        </nav>
    );
}
