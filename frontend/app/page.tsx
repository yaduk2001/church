'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from './contexts/LanguageContext';
import SpiritualLeaders from './components/SpiritualLeaders';
import ManagingCommittee from './components/ManagingCommittee';
import LatestNews from './components/LatestNews';
import FloatingNotificationPanel from './components/FloatingNotificationPanel';
import { apiEndpoint } from './config/api';
import './home.css';
import './malayalam-styles.css';

interface Church {
  _id: string;
  name: string;
  description: string;
  history: string;
  images: string[];
  address: string;
  phone: string;
  email: string;
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  createdAt: Date;
}

export default function HomePage() {
  const [churches, setChurches] = useState<Church[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [heroSlides, setHeroSlides] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    loadChurches();
    loadNotifications();
    loadHeroSlides();
  }, []);

  const loadChurches = async () => {
    try {
      const response = await fetch(apiEndpoint('churches'));
      const data = await response.json();
      setChurches(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading churches:', error);
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await fetch(apiEndpoint('notifications'));
      const data = await response.json();
      setNotifications(data.slice(0, 5));
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadHeroSlides = async () => {
    try {
      const response = await fetch(apiEndpoint('hero-slider'));
      const data = await response.json();
      const activeSlides = data.filter((slide: any) => slide.isActive).map((slide: any) => slide.imageUrl);
      setHeroSlides(activeSlides);
    } catch (error) {
      console.error('Error loading hero slides:', error);
    }
  };

  // Auto-rotate slides every 5 seconds
  useEffect(() => {
    if (heroSlides.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [heroSlides]);



  return (
    <>
      {/* Hero Section */}
      <section className="hero-section" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Background Slider */}
        {heroSlides.length > 0 ? (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0
          }}>
            {heroSlides.map((slide, index) => (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${slide})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: currentSlide === index ? 1 : 0,
                  transition: 'opacity 1s ease-in-out'
                }}
              />
            ))}
          </div>
        ) : (
          // Fallback red background when no images
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #800020 0%, #8B4513 100%)',
            zIndex: 0
          }} />
        )}

        {/* Hero Content Overlay */}
        <div className="hero-content" style={{ position: 'relative', zIndex: 1 }}>
          <div className="container">
            <div className="hero-text">
              <div className="hero-emblem" style={{ marginBottom: '1.5rem', animation: 'float 3s ease-in-out infinite' }}>
                <img
                  src="/images/Emblem/1766481150211.png"
                  alt="Church Emblem"
                  style={{ width: '80px', height: 'auto', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
                />
              </div>
              <h1 className="hero-title fade-in">{t('home.heroTitle')}</h1>
              <p className="hero-subtitle fade-in">{t('home.heroSubtitle')}</p>
              <div className="church-names fade-in">
                <span className="church-name">
                  {t('home.bibleVerse1')}
                </span>
                <span className="church-name">
                  {t('home.bibleVerse2')}
                </span>
                <span className="church-name">
                  {t('home.bibleVerse3')}
                </span>
              </div>
              <div className="hero-buttons fade-in">
                <Link href="/mass-timings" className="btn btn-primary">
                  {t('nav.massTimings')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Latest News Section */}
      <LatestNews />

      {/* Spiritual Leaders (Integrated Decoratively below) */}

      {/* Managing Committee Section */}
      <ManagingCommittee />


      {/* Services Section */}
      <section className="services-section section" style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)',
        padding: '5rem 0',
        position: 'relative',
        overflow: 'hidden' // Ensure images don't overflow
      }}>
        {/* Decorative Dignitary (Metropolitan) */}
        <div style={{
          position: 'absolute',
          top: '10%',
          right: '-5%',
          width: '350px',
          height: '500px',
          backgroundImage: 'url("/images/dignitaries/K 01 PNG copy.png")',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          opacity: 0.1, // Subtle watermark style
          zIndex: 0,
          pointerEvents: 'none'
        }} />
        <div className="container">
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 className="section-title" style={{
              fontSize: '2.5rem',
              color: '#800020',
              marginBottom: '0.75rem',
              fontWeight: '700'
            }}>
              {t('home.ourServicesTitle')}
            </h2>
            <div style={{
              width: '80px',
              height: '3px',
              background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
              margin: '1rem auto'
            }} />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '2.5rem',
            maxWidth: '1300px',
            margin: '0 auto'
          }}>
            {/* Holy Mass Card */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '2.5rem 2rem',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              border: '2px solid rgba(128, 0, 32, 0.08)',
              position: 'relative',
              overflow: 'hidden'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-12px)';
                e.currentTarget.style.boxShadow = '0 16px 40px rgba(128, 0, 32, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(128, 0, 32, 0.08)';
              }}>
              {/* Icon */}
              <div style={{
                fontSize: '4rem',
                marginBottom: '1.5rem',
                transition: 'transform 0.3s ease'
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                }}>⛪</div>

              <h4 style={{
                fontSize: '1.4rem',
                color: '#800020',
                marginBottom: '1rem',
                fontWeight: '700'
              }}>{t('home.holyMassTitle')}</h4>

              <p style={{
                color: '#6B7280',
                fontSize: '0.95rem',
                lineHeight: '1.6',
                marginBottom: '1.5rem'
              }}>{t('home.holyMassDesc')}</p>

              <Link href="/mass-timings" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#D4AF37',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '0.95rem',
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05))',
                borderRadius: '30px',
                border: '2px solid rgba(212, 175, 55, 0.3)',
                transition: 'all 0.3s ease'
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #800020, #600018)';
                  e.currentTarget.style.borderColor = '#800020';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#D4AF37';
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05))';
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                {t('buttons.viewSchedule')} →
              </Link>
            </div>

            {/* Blood Bank Card */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '2.5rem 2rem',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              border: '2px solid rgba(128, 0, 32, 0.08)',
              position: 'relative',
              overflow: 'hidden'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-12px)';
                e.currentTarget.style.boxShadow = '0 16px 40px rgba(128, 0, 32, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(128, 0, 32, 0.08)';
              }}>
              <div style={{
                fontSize: '4rem',
                marginBottom: '1.5rem',
                transition: 'transform 0.3s ease'
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                }}>🩸</div>

              <h4 style={{
                fontSize: '1.4rem',
                color: '#800020',
                marginBottom: '1rem',
                fontWeight: '700'
              }}>{t('home.bloodBankTitle')}</h4>

              <p style={{
                color: '#6B7280',
                fontSize: '0.95rem',
                lineHeight: '1.6',
                marginBottom: '1.5rem'
              }}>{t('home.bloodBankDesc')}</p>

              <Link href="/blood-bank" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#D4AF37',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '0.95rem',
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05))',
                borderRadius: '30px',
                border: '2px solid rgba(212, 175, 55, 0.3)',
                transition: 'all 0.3s ease'
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #800020, #600018)';
                  e.currentTarget.style.borderColor = '#800020';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#D4AF37';
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05))';
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                {t('buttons.registerNow')} →
              </Link>
            </div>

            {/* Gallery Card */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '2.5rem 2rem',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              border: '2px solid rgba(128, 0, 32, 0.08)',
              position: 'relative',
              overflow: 'hidden'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-12px)';
                e.currentTarget.style.boxShadow = '0 16px 40px rgba(128, 0, 32, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(128, 0, 32, 0.08)';
              }}>
              <div style={{
                fontSize: '4rem',
                marginBottom: '1.5rem',
                transition: 'transform 0.3s ease'
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                }}>📸</div>

              <h4 style={{
                fontSize: '1.4rem',
                color: '#800020',
                marginBottom: '1rem',
                fontWeight: '700'
              }}>{t('home.galleryTitle')}</h4>

              <p style={{
                color: '#6B7280',
                fontSize: '0.95rem',
                lineHeight: '1.6',
                marginBottom: '1.5rem'
              }}>{t('home.galleryDesc')}</p>

              <Link href="/gallery" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#D4AF37',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '0.95rem',
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05))',
                borderRadius: '30px',
                border: '2px solid rgba(212, 175, 55, 0.3)',
                transition: 'all 0.3s ease'
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #800020, #600018)';
                  e.currentTarget.style.borderColor = '#800020';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#D4AF37';
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05))';
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                {t('buttons.viewGallery')} →
              </Link>
            </div>

            {/* Family Units Card */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '2.5rem 2rem',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              border: '2px solid rgba(128, 0, 32, 0.08)',
              position: 'relative',
              overflow: 'hidden'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-12px)';
                e.currentTarget.style.boxShadow = '0 16px 40px rgba(128, 0, 32, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(128, 0, 32, 0.08)';
              }}>
              <div style={{
                fontSize: '4rem',
                marginBottom: '1.5rem',
                transition: 'transform 0.3s ease'
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                }}>👨‍👩‍👧‍👦</div>

              <h4 style={{
                fontSize: '1.4rem',
                color: '#800020',
                marginBottom: '1rem',
                fontWeight: '700'
              }}>{t('home.familyUnitsTitle')}</h4>

              <p style={{
                color: '#6B7280',
                fontSize: '0.95rem',
                lineHeight: '1.6',
                marginBottom: '1.5rem'
              }}>{t('home.familyUnitsDesc')}</p>

              <Link href="/family-units" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#D4AF37',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '0.95rem',
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05))',
                borderRadius: '30px',
                border: '2px solid rgba(212, 175, 55, 0.3)',
                transition: 'all 0.3s ease'
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #800020, #600018)';
                  e.currentTarget.style.borderColor = '#800020';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#D4AF37';
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05))';
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                {t('buttons.viewDirectory')} →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="notifications-section section" style={{
        background: 'linear-gradient(180deg, #fafafa 0%, #ffffff 100%)',
        padding: '5rem 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Dignitary (Bishop) */}
        <div style={{
          position: 'absolute',
          bottom: '5%',
          left: '-5%',
          width: '350px',
          height: '500px',
          backgroundImage: 'url("/images/dignitaries/H H PNG 06.png")',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          opacity: 0.08,
          zIndex: 0,
          pointerEvents: 'none'
        }} className="desktop-only-decor" />
        <div className="container">
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 className="section-title" style={{
              fontSize: '2.5rem',
              color: '#800020',
              marginBottom: '0.75rem',
              fontWeight: '700'
            }}>
              {t('home.latestAnnouncementsTitle')}
            </h2>
            <div style={{
              width: '80px',
              height: '3px',
              background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
              margin: '1rem auto'
            }} />
          </div>

          <div className="announcements-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '2rem',
            maxWidth: '1400px',
            margin: '0 auto 3rem',
            justifyContent: 'center'
          }}>
            {notifications.map((notification) => (
              <div
                key={notification._id}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '2rem',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: `2px solid ${notification.priority === 'high' ? 'rgba(220, 38, 38, 0.2)' : 'rgba(128, 0, 32, 0.08)'}`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(128, 0, 32, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08)';
                }}
              >
                {/* Left colored border */}
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '4px',
                  background: notification.type === 'event' ? '#10B981' :
                    notification.type === 'announcement' ? '#EF4444' :
                      notification.type === 'general' ? '#F59E0B' : '#6B7280'
                }} />

                {/* Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem',
                  gap: '1rem'
                }}>
                  <span className={`notification-type-badge ${notification.type}`}>
                    {notification.type}
                  </span>

                  <span style={{
                    fontSize: '0.8rem',
                    color: '#9CA3AF',
                    fontWeight: '500',
                    whiteSpace: 'nowrap'
                  }}>
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Title */}
                <h4 style={{
                  fontSize: '1.25rem',
                  color: '#800020',
                  marginBottom: '0.75rem',
                  fontWeight: '700',
                  lineHeight: '1.4'
                }}>
                  {notification.title}
                </h4>

                {/* Message */}
                <p style={{
                  color: '#6B7280',
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  marginBottom: 0
                }}>
                  {notification.message}
                </p>

                {/* High Priority Indicator */}
                {notification.priority === 'high' && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.5rem 0.75rem',
                    background: 'rgba(220, 38, 38, 0.1)',
                    borderRadius: '8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.85rem',
                    color: '#DC2626',
                    fontWeight: '600'
                  }}>
                    ⚠️ High Priority
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link href="/notifications" prefetch={false} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'white',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '1rem',
              padding: '1rem 2.5rem',
              background: 'linear-gradient(135deg, #800020, #600018)',
              borderRadius: '30px',
              border: 'none',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 16px rgba(128, 0, 32, 0.3)'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(128, 0, 32, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(128, 0, 32, 0.3)';
              }}>
              {t('buttons.viewAllAnnouncements')}
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}


      {/* Floating Notification Panel */}
      <FloatingNotificationPanel />
    </>
  );
}
