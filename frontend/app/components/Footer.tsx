'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '../config/api';
import './Footer.css';

interface SocialMedia {
    _id: string;
    platform: string;
    url: string;
    icon: string;
    isActive: boolean;
}

export default function Footer() {
    const pathname = usePathname();
    const [socialLinks, setSocialLinks] = useState<SocialMedia[]>([]);



    useEffect(() => {
        fetch(`${API_URL}/social-media`)
            .then(res => res.json())
            .then(data => setSocialLinks(data))
            .catch(err => console.error('Error fetching social links:', err));
    }, []);

    const getIcon = (iconName: string) => {
        switch (iconName.toLowerCase()) {
            case 'facebook': return 'f';
            case 'instagram': return 'i';
            case 'youtube': return 'y';
            case 'twitter':
            case 'x': return 'x';
            default: return '🔗';
        }
    };

    // Hide footer on admin dashboard and family dashboard
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/family-units/dashboard')) {
        return null;
    }

    return (
        <footer className="footer-section">
            {/* Main Content */}
            <div className="footer-content">
                <div className="footer-grid">
                    {/* Column 1: About */}
                    <div className="footer-column footer-about">
                        <img
                            src="/images/Emblem/1766481150211.png"
                            alt="Emblem"
                            style={{ width: '50px', height: 'auto', marginBottom: '1.5rem', filter: 'brightness(0) invert(1) opacity(0.8)' }}
                        />
                        <h4>St Mary's Church</h4>
                        <p>
                            A community of faith, hope, and love. We are dedicated to spreading the Gospel
                            and serving our neighbors in the spirit of Christ. Join us for Mass and
                            fellowship.
                        </p>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div className="footer-column footer-links">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><Link href="/">Home</Link></li>
                            <li><Link href="/mass-timings">Mass Timings</Link></li>
                            <li><Link href="/services">Services</Link></li>
                            <li><Link href="/prayer-request">Prayer Requests</Link></li>
                            <li><Link href="/contact">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Connect */}
                    <div className="footer-column footer-contact">
                        <h4>Connect With Us</h4>
                        <div className="contact-item">
                            <span className="contact-icon">📍</span>
                            <span>Church Road, Kochi, Kerala, India</span>
                        </div>
                        <div className="contact-item">
                            <span className="contact-icon">📞</span>
                            <span>+91 98765 43210</span>
                        </div>
                        <div className="contact-item">
                            <span className="contact-icon">✉️</span>
                            <span>contact@ourparish.com</span>
                        </div>

                        <div className="social-links">
                            {socialLinks.map(link => (
                                <a
                                    key={link._id}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="social-icon"
                                    title={link.platform}
                                >
                                    {getIcon(link.icon)}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} St Mary's Jacobite Syrian Church, Malayidomthuruth. All rights reserved.</p>
            </div>
        </footer>
    );
}
