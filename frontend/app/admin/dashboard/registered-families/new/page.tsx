'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiEndpoint } from '@/app/config/api';
import Modal from '@/app/components/Modal';
import '../../admin-dashboard.css';

interface Member {
    name: string;
    gender: 'Male' | 'Female' | 'Other';
    dob: string;
    relationship: string;
    education: string;
    occupation: string;
    bloodGroup: string;
    mobile: string;
}

export default function NewFamilyRegistrationPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'confirm' | 'alert' | 'success' | 'error';
        onConfirm?: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'alert'
    });

    const showModal = (title: string, message: string, type: 'confirm' | 'alert' | 'success' | 'error' = 'alert', onConfirm?: () => void) => {
        setModalConfig({
            isOpen: true,
            title,
            message,
            type,
            onConfirm
        });
    };

    // Form State
    const [formData, setFormData] = useState({
        // General Family Details
        registerNo: '',
        familyName: '',
        parishUnit: 'General',
        kara: '',
        village: '',
        postOffice: '',
        pincode: '',
        panchayat: '',
        district: '',
        phone: '',
        whatsapp: '',
        email: '',
        address: '',

        // Head of Family Details
        headName: '',
        headDob: '',
        headAge: '',
        headBloodGroup: '',
        headAadhaar: '',
        headOccupation: '',
        headEducation: '',
    });

    const [members, setMembers] = useState<Member[]>([]);

    // Handler for Family/Head fields
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Member Handlers
    const addMember = () => {
        setMembers([...members, {
            name: '',
            gender: 'Male',
            dob: '',
            relationship: '',
            education: '',
            occupation: '',
            bloodGroup: '',
            mobile: ''
        }]);
    };

    const updateMember = (index: number, field: keyof Member, value: string) => {
        const newMembers = [...members];
        newMembers[index] = { ...newMembers[index], [field]: value };
        setMembers(newMembers);
    };

    const removeMember = (index: number) => {
        setMembers(members.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Validate required fields
            if (!formData.registerNo || !formData.familyName || !formData.phone || !formData.headName) {
                showModal('Validation Error', 'Please fill in all required fields (marked with *)', 'error');
                return;
            }

            const payload = {
                ...formData,
                members,
                headOfFamily: formData.headName, // Fallback compatibility
                password: 'password123', // Default Password
            };

            const token = localStorage.getItem('adminToken');
            const response = await fetch(apiEndpoint('admin/families'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                showModal('Success', '✅ Family Registered Successfully!', 'success', () => {
                    router.push('/admin/dashboard/registered-families');
                });
            } else {
                const error = await response.json();
                showModal('Error', `Error: ${error.message}`, 'error');
            }
        } catch (error) {
            console.error('Registration failed:', error);
            showModal('Error', 'Failed to register family. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-page-container">
            {/* Header */}
            <div className="admin-page-header" style={{ justifyContent: 'center', textAlign: 'center', paddingBottom: '1rem', borderBottom: '1px solid #E5E7EB' }}>
                <div>
                    <h1 className="admin-page-title" style={{ fontSize: '1.5rem', marginBottom: '0.25rem', color: '#800020' }}>ഇടവക രജിസ്റ്റർ (Parish Register)</h1>
                    <p className="admin-page-subtitle" style={{ fontSize: '0.9rem', color: '#6B7280' }}>Add a new family unit to the parish register</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* Section 1: General Family Details */}
                <div className="admin-stat-card" style={{ marginBottom: '1.5rem', background: '#fff', padding: '1.5rem' }}>
                    <h2 style={{ color: '#800020', marginBottom: '1rem', borderBottom: '1px solid #EEE', paddingBottom: '0.5rem', fontSize: '1.1rem' }}>
                        Family Information (കുടുംബ വിവരങ്ങൾ)
                    </h2>

                    <div className="admin-grid-2" style={{ gap: '0.75rem' }}>
                        <div className="admin-form-group">
                            <label className="admin-label">Register No (രജിസ്റ്റർ നമ്പർ) *</label>
                            <input
                                type="text" name="registerNo" required
                                className="admin-input"
                                value={formData.registerNo} onChange={handleChange}
                            />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-label">House Name (വീട്ടുപേര്) *</label>
                            <input
                                type="text" name="familyName" required
                                className="admin-input"
                                value={formData.familyName} onChange={handleChange}
                            />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-label">Family Unit (കുടുംബയൂണിറ്റ്)</label>
                            <input
                                type="text" name="parishUnit"
                                className="admin-input"
                                value={formData.parishUnit} onChange={handleChange}
                            />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-label">Kara (കര)</label>
                            <input
                                type="text" name="kara"
                                className="admin-input"
                                value={formData.kara} onChange={handleChange}
                            />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-label">Village (വില്ലേജ്)</label>
                            <input
                                type="text" name="village"
                                className="admin-input"
                                value={formData.village} onChange={handleChange}
                            />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-label">Post Office (പോസ്റ്റ് ഓഫീസ്)</label>
                            <input
                                type="text" name="postOffice"
                                className="admin-input"
                                value={formData.postOffice} onChange={handleChange}
                            />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-label">Pincode (പിൻ കോഡ്)</label>
                            <input
                                type="text" name="pincode"
                                className="admin-input"
                                value={formData.pincode} onChange={handleChange}
                            />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-label">Panchayat (പഞ്ചായത്ത്)</label>
                            <input
                                type="text" name="panchayat"
                                className="admin-input"
                                value={formData.panchayat} onChange={handleChange}
                            />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-label">District (ജില്ല)</label>
                            <input
                                type="text" name="district"
                                className="admin-input"
                                value={formData.district} onChange={handleChange}
                            />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-label">Phone No (ഫോൺ നമ്പർ) *</label>
                            <input
                                type="text" name="phone" required
                                className="admin-input"
                                value={formData.phone} onChange={handleChange}
                                placeholder="Unique ID for Login"
                            />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-label">WhatsApp (വാട്സ്ആപ്പ് നമ്പർ)</label>
                            <input
                                type="text" name="whatsapp"
                                className="admin-input"
                                value={formData.whatsapp} onChange={handleChange}
                            />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-label">Email (ഇ-മെയിൽ)</label>
                            <input
                                type="email" name="email"
                                className="admin-input"
                                value={formData.email} onChange={handleChange}
                            />
                        </div>
                        <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
                            <label className="admin-label">Full Address (മേൽവിലാസം)</label>
                            <textarea
                                name="address"
                                className="admin-textarea" rows={3}
                                value={formData.address} onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Head of Family */}
                <div className="admin-stat-card" style={{ marginBottom: '1.5rem', background: '#fff', padding: '1.5rem' }}>
                    <h2 style={{ color: '#800020', marginBottom: '1rem', borderBottom: '1px solid #EEE', paddingBottom: '0.5rem', fontSize: '1.1rem' }}>
                        Head of Family Details (ഗൃഹനാഥൻ/നാഥയുടെ വിവരങ്ങൾ)
                    </h2>

                    <div className="admin-grid-2" style={{ gap: '0.75rem' }}>
                        <div className="admin-form-group">
                            <label className="admin-label">Name (പേര്) *</label>
                            <input
                                type="text" name="headName" required
                                className="admin-input"
                                value={formData.headName} onChange={handleChange}
                            />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-label">Date of Birth (ജനനത്തീയതി)</label>
                            <input
                                type="date" name="headDob"
                                className="admin-input"
                                value={formData.headDob} onChange={handleChange}
                            />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-label">Age (വയസ്സ്)</label>
                            <input
                                type="number" name="headAge"
                                className="admin-input"
                                value={formData.headAge} onChange={handleChange}
                            />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-label">Blood Group (ബ്ലഡ് ഗ്രൂപ്പ്)</label>
                            <select
                                name="headBloodGroup"
                                className="admin-select"
                                value={formData.headBloodGroup} onChange={handleChange}
                            >
                                <option value="">Select Group</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-label">Aadhaar No (ആധാർ നമ്പർ)</label>
                            <input
                                type="text" name="headAadhaar"
                                className="admin-input"
                                value={formData.headAadhaar} onChange={handleChange}
                            />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-label">Occupation (തൊഴിൽ)</label>
                            <input
                                type="text" name="headOccupation"
                                className="admin-input"
                                value={formData.headOccupation} onChange={handleChange}
                            />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-label">Education (വിദ്യാഭ്യസ യോഗ്യത)</label>
                            <input
                                type="text" name="headEducation"
                                className="admin-input"
                                value={formData.headEducation} onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Section 3: Members */}
                <div className="admin-stat-card" style={{ marginBottom: '1.5rem', background: '#fff', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #EEE', paddingBottom: '0.5rem' }}>
                        <h2 style={{ color: '#800020', margin: 0, fontSize: '1.1rem' }}>
                            Members Details (കുടുംബാംഗങ്ങളെ സംബന്ധിച്ച വിവരങ്ങൾ)
                        </h2>
                        <button type="button" onClick={addMember} className="admin-btn admin-btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                            + Add Member
                        </button>
                    </div>

                    {members.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#6B7280', padding: '2rem' }}>
                            No members added yet. Click "+ Add Member" to add family members.
                        </p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Name (പേര്)</th>
                                        <th>Gender (ലിംഗം)</th>
                                        <th>DOB (ജനന തീയതി)</th>
                                        <th>Relation (ബന്ധം)</th>
                                        <th>Education</th>
                                        <th>Job</th>
                                        <th>Mobile</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.map((member, index) => (
                                        <tr key={index}>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="admin-input" style={{ minWidth: '120px' }}
                                                    value={member.name}
                                                    onChange={(e) => updateMember(index, 'name', e.target.value)}
                                                    placeholder="Name"
                                                />
                                            </td>
                                            <td>
                                                <select
                                                    className="admin-select"
                                                    value={member.gender}
                                                    onChange={(e) => updateMember(index, 'gender', e.target.value as any)}
                                                >
                                                    <option value="Male">M</option>
                                                    <option value="Female">F</option>
                                                </select>
                                            </td>
                                            <td>
                                                <input
                                                    type="date"
                                                    className="admin-input" style={{ minWidth: '130px' }}
                                                    value={member.dob}
                                                    onChange={(e) => updateMember(index, 'dob', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="admin-input" style={{ minWidth: '100px' }}
                                                    value={member.relationship}
                                                    onChange={(e) => updateMember(index, 'relationship', e.target.value)}
                                                    placeholder="Relation"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="admin-input" style={{ minWidth: '100px' }}
                                                    value={member.education}
                                                    onChange={(e) => updateMember(index, 'education', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="admin-input" style={{ minWidth: '100px' }}
                                                    value={member.occupation}
                                                    onChange={(e) => updateMember(index, 'occupation', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="admin-input" style={{ minWidth: '110px' }}
                                                    value={member.mobile}
                                                    onChange={(e) => updateMember(index, 'mobile', e.target.value)}
                                                    placeholder="Phone"
                                                />
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    onClick={() => removeMember(index)}
                                                    className="admin-btn admin-btn-danger"
                                                    style={{ padding: '0.25rem 0.5rem' }}
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

                <div className="admin-actions" style={{ marginBottom: '4rem', marginTop: '1rem' }}>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="admin-btn admin-btn-secondary"
                        disabled={isLoading}
                        style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="admin-btn admin-btn-primary"
                        disabled={isLoading}
                        style={{ padding: '0.5rem 1.5rem', fontSize: '1rem' }}
                    >
                        {isLoading ? 'Saving...' : '💾 Save Registration'}
                    </button>
                </div>

            </form>

            <Modal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                onConfirm={modalConfig.onConfirm}
                confirmText={modalConfig.type === 'confirm' ? 'Confirm' : 'OK'}
            />
        </div >
    );
}
