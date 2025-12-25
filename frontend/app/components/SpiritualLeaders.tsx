import React from 'react';
import Image from 'next/image';

const SpiritualLeaders = () => {
    const leaders = [
        {
            name: 'His Holiness',
            title: 'Moran Mar Baselios Marthoma Mathews III', // Example title, can be adjusted
            image: '/images/dignitaries/H H Moran PNG 04.png',
            width: 300
        },
        {
            name: 'His Holiness',
            title: 'Patriarch',
            image: '/images/dignitaries/H H PNG 06.png',
            width: 280
        },
        {
            name: 'His Holiness',
            title: 'Catholicos',
            image: '/images/dignitaries/H H PNG 40.png',
            width: 300
        },
        {
            name: 'His Grace',
            title: 'Metropolitan',
            image: '/images/dignitaries/K 01 PNG copy.png', // "copy" in filename, cleaning up display logic if needed
            width: 260
        },
        {
            name: 'His Grace',
            title: 'Metropolitan',
            image: '/images/dignitaries/K 02 PNG.png',
            width: 260
        }
    ];

    return (
        <section className="spiritual-leaders-section section" style={{
            background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%)',
            padding: '5rem 0',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Decorative Background */}
            <div style={{
                position: 'absolute',
                top: '-5%',
                left: '-5%',
                width: '30%',
                height: '30%',
                background: 'radial-gradient(circle, rgba(128, 0, 32, 0.03) 0%, transparent 70%)',
                borderRadius: '50%',
                zIndex: 0
            }} />

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 className="section-title" style={{
                        fontSize: '2.5rem',
                        color: '#800020',
                        marginBottom: '0.75rem',
                        fontWeight: '700',
                        fontFamily: 'Cinzel, serif'
                    }}>
                        Spiritual Leadership
                    </h2>
                    <div style={{
                        width: '120px',
                        height: '3px',
                        background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
                        margin: '1rem auto'
                    }} />
                    <p className="section-subtitle" style={{ color: '#666', maxWidth: '600px', margin: '0 auto' }}>
                        Guiding us in faith and tradition
                    </p>
                </div>

                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '3rem',
                    alignItems: 'flex-end'
                }}>
                    {leaders.map((leader, index) => (
                        <div key={index} className="leader-card" style={{
                            textAlign: 'center',
                            position: 'relative',
                            transition: 'transform 0.3s ease'
                        }}>
                            <div style={{
                                position: 'relative',
                                marginBottom: '1.5rem',
                                filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))',
                                height: '350px', // Fixed height for alignment
                                display: 'flex',
                                alignItems: 'flex-end',
                                justifyContent: 'center'
                            }}>
                                {/* Halo effect */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '0',
                                    width: '200px',
                                    height: '200px',
                                    background: 'radial-gradient(circle, rgba(212, 175, 55, 0.2) 0%, transparent 70%)',
                                    borderRadius: '50%',
                                    zIndex: -1,
                                    transform: 'translateY(20%)'
                                }} />

                                <img
                                    src={leader.image}
                                    alt={leader.name}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'contain',
                                        transition: 'transform 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                />
                            </div>
                            <div>
                                <h3 style={{
                                    color: '#800020',
                                    fontSize: '1.2rem',
                                    fontWeight: '700',
                                    marginBottom: '0.25rem'
                                }}>{leader.name}</h3>
                                <p style={{
                                    color: '#D4AF37',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}>{leader.title}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SpiritualLeaders;
