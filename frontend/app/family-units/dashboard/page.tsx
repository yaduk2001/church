'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiEndpoint } from '@/app/config/api';
import './dashboard.css';

interface FamilyMember {
    _id?: string;
    name: string;
    churchName?: string;
    dateOfBirth: string;
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
}

// Utility function to calculate age from date of birth
const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Adjust if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
};

export default function FamilyDashboard() {
    const router = useRouter();
    const [family, setFamily] = useState<FamilyUnit | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [formData, setFormData] = useState({
        name: '',
        churchName: '',
        relationship: 'Son',
        gender: 'Male',
        dateOfBirth: '',
        phone: '',
        email: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('familyToken');
        if (!token) {
            router.push('/family-units/login');
            return;
        }
        fetchFamilyData(token);
    }, []);

    const fetchFamilyData = async (token: string) => {
        try {
            const response = await fetch(apiEndpoint('family-auth/me'), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('familyToken');
                    router.push('/family-units/login');
                    return;
                }
                throw new Error('Failed to fetch data');
            }

            const data = await response.json();
            setFamily(data);
        } catch (error) {
            console.error('Error fetching family data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('familyToken');
        localStorage.removeItem('familyId');
        router.push('/family-units/login');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Auto-set gender based on relationship
        if (name === 'relationship') {
            let autoGender = formData.gender; // Keep current gender as default

            switch (value) {
                case 'Husband':
                case 'Father':
                case 'Son':
                case 'Brother':
                case 'Grandfather':
                    autoGender = 'Male';
                    break;
                case 'Wife':
                case 'Mother':
                case 'Daughter':
                case 'Sister':
                case 'Grandmother':
                    autoGender = 'Female';
                    break;
                // 'Other' relationship keeps the current gender selection
            }

            setFormData({
                ...formData,
                [name]: value,
                gender: autoGender
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleSubmitMember = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const token = localStorage.getItem('familyToken');

        try {
            const response = await fetch(apiEndpoint('family-units/members'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const updatedFamily = await response.json();
                setFamily(updatedFamily);
                setIsModalOpen(false);
                setFormData({
                    name: '',
                    churchName: '',
                    relationship: 'Son',
                    gender: 'Male',
                    dateOfBirth: '',
                    phone: '',
                    email: ''
                });
            }
        } catch (error) {
            console.error('Error adding member:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteMember = async (memberId: string) => {
        if (!confirm('Are you sure you want to remove this family member?')) return;

        const token = localStorage.getItem('familyToken');
        try {
            const response = await fetch(apiEndpoint(`family-units/members/${memberId}`), {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const updatedFamily = await response.json();
                setFamily(updatedFamily);
            }
        } catch (error) {
            console.error('Error deleting member:', error);
        }
    };

    const getRelationshipIcon = (relationship: string) => {
        switch (relationship) {
            case 'Father': return '👨';
            case 'Mother': return '👩';
            case 'Son': return '👦';
            case 'Daughter': return '👧';
            case 'Grandfather': return '👴';
            case 'Grandmother': return '👵';
            case 'Husband': return '🤵';
            case 'Wife': return '👰';
            case 'Brother': return '🧑';
            case 'Sister': return '👧';
            default: return '👤';
        }
    };

    const getBibleVerse = () => {
        return {
            text: "As for me and my house, we will serve the Lord.",
            ref: "Joshua 24:15"
        };
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (!family) return null;

    const totalMembers = family.members.length;
    const maleMembers = family.members.filter(m => m.gender === 'Male').length;
    const femaleMembers = family.members.filter(m => m.gender === 'Female').length;

    return (
        <div className="dashboard-layout">
            {/* Sidebar Navigation */}
            <aside className="dashboard-sidebar">
                <div className="sidebar-brand">
                    <span className="brand-icon">✝</span>
                    <span>Our Parish</span>
                </div>

                <div className="sidebar-nav">
                    <div className="nav-section-label">Family Portal</div>
                    <div
                        className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        <span>🏠</span>
                        <span>Dashboard</span>
                    </div>
                    <div
                        className={`nav-item ${activeTab === 'members' ? 'active' : ''}`}
                        onClick={() => setActiveTab('members')}
                    >
                        <span>👥</span>
                        <span>Member List</span>
                    </div>

                    <div className="nav-section-label">Main Website</div>
                    <a href="/" className="nav-item">
                        <span>⛪</span>
                        <span>Home</span>
                    </a>
                    <a href="/mass-timings" className="nav-item">
                        <span>🕒</span>
                        <span>Mass Timings</span>
                    </a>

                    <div className="nav-item" style={{ cursor: 'default', opacity: 1 }}>
                        <span>🙏</span>
                        <span>Services</span>
                    </div>
                    <a href="/prayer-request" className="nav-sub-item">Prayer Request</a>
                    <a href="/thanksgiving" className="nav-sub-item">Thanksgiving</a>
                    <a href="/venda" className="nav-sub-item">Venda</a>
                    <a href="/blood-bank" className="nav-sub-item">Blood Bank</a>

                    <div className="nav-item" style={{ cursor: 'default', opacity: 1 }}>
                        <span>🤝</span>
                        <span>Community</span>
                    </div>
                    <a href="/gallery" className="nav-sub-item">Gallery</a>
                    <a href="/documents" className="nav-sub-item">Documents</a>

                    <a href="/about" className="nav-item">
                        <span>ℹ️</span>
                        <span>About</span>
                    </a>
                    <a href="/contact" className="nav-item">
                        <span>📞</span>
                        <span>Contact</span>
                    </a>
                </div>

                <div className="sidebar-footer">
                    <div className="user-snippet">
                        <div className="user-avatar">{family.familyName.charAt(0)}</div>
                        <div className="user-info">
                            <span className="user-name">{family.familyName}</span>
                            <span className="user-role">Family Head</span>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="btn-signout">
                        <span>↩</span> <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="dashboard-main">
                {/* Top Header */}
                <header className="top-bar">
                    <div className="welcome-text">
                        <h1>The {family.familyName} Household</h1>
                        <p>{getBibleVerse().text}</p>
                    </div>
                </header>

                {activeTab === 'dashboard' ? (
                    <>
                        <div className="overview-grid">
                            {/* Family Info Widget */}
                            <div className="widget-card">
                                <div className="widget-header">
                                    <span className="widget-title"><span>📝</span> Family Details</span>
                                </div>
                                <div className="info-list">
                                    <div className="info-item">
                                        <span className="info-label">Head of Family</span>
                                        <span className="info-value">{family.headOfFamily}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Phone</span>
                                        <span className="info-value">{family.phone}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Address</span>
                                        <span className="info-value">{family.address}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Widget */}
                            <div className="widget-card">
                                <div className="widget-header">
                                    <span className="widget-title"><span>📊</span> Household Stats</span>
                                </div>
                                <div className="stats-row">
                                    <div className="mini-stat">
                                        <span className="value">{totalMembers}</span>
                                        <span className="label">Total</span>
                                    </div>
                                    <div className="mini-stat">
                                        <span className="value">{maleMembers}</span>
                                        <span className="label">Male</span>
                                    </div>
                                    <div className="mini-stat">
                                        <span className="value">{femaleMembers}</span>
                                        <span className="label">Female</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Members Section */}
                        <div className="members-section-full">
                            <div className="members-header-flex">
                                <h2 className="section-title" style={{ margin: 0 }}>Family Members</h2>
                                <button onClick={() => setIsModalOpen(true)} className="btn-add">
                                    <span className="icon">+</span> Add Member
                                </button>
                            </div>

                            {family.members.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-state-icon">👨‍👩‍👧‍👦</div>
                                    <p className="empty-state-text">
                                        No family members added yet. Start by adding your loved ones.
                                    </p>
                                </div>
                            ) : (
                                <div className="members-grid-enhanced">
                                    {family.members.map((member) => (
                                        <div key={member._id} className="member-card">
                                            <div className="member-header">
                                                <span className="member-badge">{member.relationship}</span>
                                                <button
                                                    className="member-delete"
                                                    onClick={() => member._id && handleDeleteMember(member._id)}
                                                    title="Remove Member"
                                                >
                                                    ×
                                                </button>
                                            </div>

                                            <div className="member-avatar">
                                                {getRelationshipIcon(member.relationship)}
                                            </div>

                                            <h3 className="member-name">{member.name}</h3>

                                            <div className="member-info">
                                                {member.dateOfBirth && (
                                                    <div>{new Date(member.dateOfBirth).toLocaleDateString()}</div>
                                                )}
                                            </div>

                                            <div className="member-meta">
                                                <span className="meta-item">{member.gender}</span>
                                                <span className="meta-item">{calculateAge(member.dateOfBirth)} years</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    /* Member List View */
                    <div className="member-list-view">
                        <div className="members-header-flex">
                            <h2 className="section-title" style={{ margin: 0 }}>All Family Members</h2>
                            <button onClick={() => setIsModalOpen(true)} className="btn-add">
                                <span className="icon">+</span> Add Member
                            </button>
                        </div>

                        {family.members.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">👨‍👩‍👧‍👦</div>
                                <p className="empty-state-text">
                                    No family members added yet. Start by adding your loved ones.
                                </p>
                            </div>
                        ) : (
                            <div className="member-table-container">
                                <table className="member-table">
                                    <thead>
                                        <tr>
                                            <th>Member</th>
                                            <th>Church Name</th>
                                            <th>Relationship</th>
                                            <th>Gender</th>
                                            <th>Date of Birth</th>
                                            <th>Age</th>
                                            <th>Contact</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {family.members.map((member) => (
                                            <tr key={member._id}>
                                                <td>
                                                    <div className="member-cell">
                                                        <span className="member-icon">{getRelationshipIcon(member.relationship)}</span>
                                                        <span className="member-name-text">{member.name}</span>
                                                    </div>
                                                </td>
                                                <td>{member.churchName || '-'}</td>
                                                <td>
                                                    <span className="relationship-badge">{member.relationship}</span>
                                                </td>
                                                <td>{member.gender}</td>
                                                <td>{new Date(member.dateOfBirth).toLocaleDateString()}</td>
                                                <td>{calculateAge(member.dateOfBirth)} years</td>
                                                <td>
                                                    <div className="contact-cell">
                                                        {member.phone && <div>📞 {member.phone}</div>}
                                                        {member.email && <div>📧 {member.email}</div>}
                                                        {!member.phone && !member.email && '-'}
                                                    </div>
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn-delete-small"
                                                        onClick={() => member._id && handleDeleteMember(member._id)}
                                                        title="Remove Member"
                                                    >
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Add to Your Household</h2>
                            <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>

                        <form onSubmit={handleSubmitMember}>
                            <div className="modal-body">
                                <div className="form-grid">
                                    <div className="form-group full">
                                        <label className="form-label">Full Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="Enter full name"
                                            required
                                        />
                                    </div>

                                    <div className="form-group full">
                                        <label className="form-label">Church Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            name="churchName"
                                            value={formData.churchName}
                                            onChange={handleInputChange}
                                            placeholder="Enter church name (baptismal name)"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Relationship</label>
                                        <select
                                            className="form-select"
                                            name="relationship"
                                            value={formData.relationship}
                                            onChange={handleInputChange}
                                        >
                                            <option value="Wife">Wife</option>
                                            <option value="Husband">Husband</option>
                                            <option value="Son">Son</option>
                                            <option value="Daughter">Daughter</option>
                                            <option value="Brother">Brother</option>
                                            <option value="Sister">Sister</option>
                                            <option value="Father">Father</option>
                                            <option value="Mother">Mother</option>
                                            <option value="Grandfather">Grandfather</option>
                                            <option value="Grandmother">Grandmother</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Gender</label>
                                        <select
                                            className="form-select"
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleInputChange}
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div className="form-group full">
                                        <label className="form-label">Phone Number</label>
                                        <input
                                            type="tel"
                                            className="form-input"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="Enter phone number"
                                        />
                                    </div>

                                    <div className="form-group full">
                                        <label className="form-label">Date of Birth</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            name="dateOfBirth"
                                            value={formData.dateOfBirth}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-submit" disabled={submitting}>
                                    {submitting ? 'Adding...' : 'Add Member'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
