'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiEndpoint } from '@/app/config/api';
import Modal from '@/app/components/Modal';
import '../../../admin-dashboard.css';

interface Member {
    name: string;
    gender: 'Male' | 'Female' | 'Other';
    dob: string;
    relationship: string;
    education: string;
    occupation: string;
    bloodGroup: string;
    mobile: string;
    _id?: string;
}

export default function EditFamilyPage() {
    const router = useRouter();
    const params = useParams();
    const familyId = params.id as string;
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

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

    useEffect(() => {
        const fetchFamily = async () => {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                router.push('/admin');
                return;
            }

            try {
                const response = await fetch(apiEndpoint(`admin/families/${familyId}`), {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    // Populate form
                    setFormData({
                        registerNo: data.registerNo || '',
                        familyName: data.familyName || '',
                        parishUnit: data.parishUnit || '',
                        kara: data.kara || '',
                        village: data.village || '',
                        postOffice: data.postOffice || '',
                        pincode: data.pincode || '',
                        panchayat: data.panchayat || '',
                        district: data.district || '',
                        phone: data.phone || '',
                        whatsapp: data.whatsapp || '',
                        email: data.email || '',
                        address: data.address || '',
                        headName: data.headName || '',
                        headDob: data.headDob ? new Date(data.headDob).toISOString().split('T')[0] : '',
                        headAge: data.headAge || '',
                        headBloodGroup: data.headBloodGroup || '',
                        headAadhaar: data.headAadhaar || '',
                        headOccupation: data.headOccupation || '',
                        headEducation: data.headEducation || '',
                    });

                    // Map members
                    if (data.members) {
                        setMembers(data.members.map((m: any) => ({
                            ...m,
                            dob: m.dateOfBirth ? new Date(m.dateOfBirth).toISOString().split('T')[0] : '',
                            occupation: m.occupation || '',
                            education: m.education || '',
                            bloodGroup: m.bloodGroup || '',
                            mobile: m.mobile || ''
                        })));
                    }
                } else {
                    showModal('Error', 'Family not found', 'error', () => {
                        router.push('/admin/dashboard/registered-families');
                    });
                }
            } catch (error) {
                console.error('Fetch error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFamily();
    }, [familyId]);

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
        setIsSaving(true);

        try {
            // Validate required fields
            if (!formData.registerNo || !formData.familyName || !formData.phone || !formData.headName) {
                showModal('Validation Error', 'Please fill in all required fields (marked with *)', 'error');
                return;
            }

            const payload = {
                ...formData,
                members: members.map(m => ({
                    ...m,
                    dob: m.dob // Map correctly to schema field 'dob'
                })),
                headOfFamily: formData.headName, // Fallback compatibility
            };

            const token = localStorage.getItem('adminToken');
            const response = await fetch(apiEndpoint(`admin/families/${familyId}`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                showModal('Success', '✅ Family Updated Successfully!', 'success', () => {
                    router.push(`/admin/dashboard/registered-families/${familyId}`);
                });
            } else {
                const error = await response.json();
                showModal('Error', `Error: ${error.message}`, 'error');
            }
        } catch (error) {
            console.error('Update failed:', error);
            showModal('Error', 'Failed to update family. Please try again.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="admin-page-container" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

    return (
        <div className="admin-page-container" style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div className="admin-page-header" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '2rem' }}>
                <button
                    onClick={() => router.back()}
                    className="admin-btn admin-btn-secondary"
                    style={{ position: 'absolute', left: 0 }}
                >
                    ← Back
                </button>
                <div style={{ textAlign: 'center' }}>
                    <h1 className="admin-page-title" style={{ color: '#800020', marginBottom: '0.25rem', fontFamily: 'Cinzel, serif', fontSize: '1.5rem' }}>Edit Family: {formData.familyName}</h1>
                    <p className="admin-page-subtitle" style={{ fontSize: '0.9rem' }}>Update family details and members</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>

                {/* Section 1: General Family Details */}
                <div className="admin-stat-card" style={{ marginBottom: '1.5rem', background: '#fff', padding: '1.5rem' }}>
                    <h2 style={{ color: '#800020', marginBottom: '1rem', borderBottom: '1px solid #EEE', paddingBottom: '0.5rem', fontSize: '1.1rem' }}>
                        Family Information (കുടുംബ വിവരങ്ങൾ)
                    </h2>

                    <div className="admin-grid-2" style={{ gap: '0.75rem' }}>
                        <div className="admin-form-group" style={{ marginBottom: '0.5rem' }}>
                            <label className="admin-label" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Register No (രജിസ്റ്റർ നമ്പർ) *</label>
                            <input
                                type="text" name="registerNo" required
                                className="admin-input" style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                                value={formData.registerNo} onChange={handleChange}
                            />
                        </div>
                        <div className="admin-form-group" style={{ marginBottom: '0.5rem' }}>
                            <label className="admin-label" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>House Name (വീട്ടുപേര്) *</label>
                            <input
                                type="text" name="familyName" required
                                className="admin-input" style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                                value={formData.familyName} onChange={handleChange}
                            />
                        </div>
                        <div className="admin-form-group" style={{ marginBottom: '0.5rem' }}>
                            <label className="admin-label" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Family Unit (കുടുംബയൂണിറ്റ്)</label>
                            <input
                                type="text" name="parishUnit"
                                className="admin-input" style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                                value={formData.parishUnit} onChange={handleChange}
                            />
                        </div>
                        <div className="admin-form-group" style={{ marginBottom: '0.5rem' }}>
                            <label className="admin-label" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Kara (കര)</label>
                            <input
                                type="text" name="kara"
                                className="admin-input" style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                                value={formData.kara} onChange={handleChange}
                            />
                        </div>
                        <div className="admin-form-group" style={{ marginBottom: '0.5rem' }}>
                            <label className="admin-label" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Village (വില്ലേജ്)</label>
                            <input
                                type="text" name="village"
                                className="admin-input" style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                                value={formData.village} onChange={handleChange}
                            />
                        </div>
                        <div className="admin-form-group" style={{ marginBottom: '0.5rem' }}>
                            <label className="admin-label" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Post Office (പോസ്റ്റ് ഓഫീസ്)</label>
                            <input
                                type="text" name="postOffice"
                                className="admin-input" style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                                value={formData.postOffice} onChange={handleChange}
                            />
                        </div>
                        <div className="admin-form-group" style={{ marginBottom: '0.5rem' }}>
                            <label className="admin-label" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Pincode (പിൻ കോഡ്)</label>
                            <input
                                type="text" name="pincode"
                                className="admin-input" style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                                value={formData.pincode} onChange={handleChange}
                            />
                        </div>
                        <div className="admin-form-group" style={{ marginBottom: '0.5rem' }}>
                            <label className="admin-label" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Panchayat (പഞ്ചായത്ത്)</label>
                            <input
                                type="text" name="panchayat"
                                className="admin-input" style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                                value={formData.panchayat} onChange={handleChange}
                            />
                        </div>
                        <div className="admin-form-group" style={{ marginBottom: '0.5rem' }}>
                            <label className="admin-label" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>District (ജില്ല)</label>
                            <input
                                type="text" name="district"
                                className="admin-input" style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                                value={formData.district} onChange={handleChange}
                            />
                        </div>
                        <div className="admin-form-group" style={{ marginBottom: '0.5rem' }}>
                            <label className="admin-label" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Phone No (ഫോൺ നമ്പർ) *</label>
                            <input
                                type="text" name="phone" required
                                className="admin-input" style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                                value={formData.phone} onChange={handleChange}
                            />
                        </div>
                        <div className="admin-form-group" style={{ marginBottom: '0.5rem' }}>
                            <label className="admin-label" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>WhatsApp (വാട്സ്ആപ്പ് നമ്പർ)</label>
                            <input
                                type="text" name="whatsapp"
                                className="admin-input" style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                                value={formData.whatsapp} onChange={handleChange}
                            />
                        </div>
                        <div className="admin-form-group" style={{ marginBottom: '0.5rem' }}>
                            <label className="admin-label" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Email (ഇ-മെയിൽ)</label>
                            <input
                                type="email" name="email"
                                className="admin-input" style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                                value={formData.email} onChange={handleChange}
                            />
                        </div>
                        <div className="admin-form-group" style={{ gridColumn: '1 / -1', marginBottom: '0.5rem' }}>
                            <label className="admin-label" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Full Address (മേൽവിലാസം)</label>
                            <textarea
                                name="address"
                                className="admin-textarea" rows={2}
                                style={{ padding: '0.5rem', fontSize: '0.9rem' }}
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
                        <div className="admin-form-group" style={{ marginBottom: '0.5rem' }}>
                            <label className="admin-label" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Name (പേര്) *</label>
                            <input
                                type="text" name="headName" required
                                className="admin-input" style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                                value={formData.headName} onChange={handleChange}
                            />
                        </div>
                        <div className="admin-form-group" style={{ marginBottom: '0.5rem' }}>
                            <label className="admin-label" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Date of Birth (ജനനത്തീയതി)</label>
                            <input
                                type="date" name="headDob"
                                className="admin-input" style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                                value={formData.headDob} onChange={handleChange}
                            />
                        </div>
                        <div className="admin-form-group" style={{ marginBottom: '0.5rem' }}>
                            <label className="admin-label" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Age (വയസ്സ്)</label>
                            <input
                                type="number" name="headAge"
                                className="admin-input" style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                                value={formData.headAge} onChange={handleChange}
                            />
                        </div>
                        <div className="admin-form-group" style={{ marginBottom: '0.5rem' }}>
                            <label className="admin-label" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Blood Group</label>
                            <select
                                name="headBloodGroup"
                                className="admin-select" style={{ padding: '0.5rem', fontSize: '0.9rem' }}
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
                        <div className="admin-form-group" style={{ marginBottom: '0.5rem' }}>
                            <label className="admin-label" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Aadhaar No (ആധാർ നമ്പർ)</label>
                            <input
                                type="text" name="headAadhaar"
                                className="admin-input" style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                                value={formData.headAadhaar} onChange={handleChange}
                            />
                        </div>
                        <div className="admin-form-group" style={{ marginBottom: '0.5rem' }}>
                            <label className="admin-label" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Occupation (തൊഴിൽ)</label>
                            <input
                                type="text" name="headOccupation"
                                className="admin-input" style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                                value={formData.headOccupation} onChange={handleChange}
                            />
                        </div>
                        <div className="admin-form-group" style={{ marginBottom: '0.5rem' }}>
                            <label className="admin-label" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Education (വിദ്യാഭ്യസ യോഗ്യത)</label>
                            <input
                                type="text" name="headEducation"
                                className="admin-input" style={{ padding: '0.5rem', fontSize: '0.9rem' }}
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
                            No members added. Click "+ Add Member" to add family members.
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
                                                    className="admin-input" style={{ minWidth: '120px', padding: '0.25rem' }}
                                                    value={member.name}
                                                    onChange={(e) => updateMember(index, 'name', e.target.value)}
                                                    placeholder="Name"
                                                />
                                            </td>
                                            <td>
                                                <select
                                                    className="admin-select" style={{ minWidth: '60px', padding: '0.25rem' }}
                                                    value={member.gender}
                                                    onChange={(e) => updateMember(index, 'gender', e.target.value as any)}
                                                >
                                                    <option value="Male">M</option>
                                                    <option value="Female">F</option>
                                                    <option value="Other">O</option>
                                                </select>
                                            </td>
                                            <td>
                                                <input
                                                    type="date"
                                                    className="admin-input" style={{ minWidth: '130px', padding: '0.25rem' }}
                                                    value={member.dob}
                                                    onChange={(e) => updateMember(index, 'dob', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="admin-input" style={{ minWidth: '100px', padding: '0.25rem' }}
                                                    value={member.relationship}
                                                    onChange={(e) => updateMember(index, 'relationship', e.target.value)}
                                                    placeholder="Relation"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="admin-input" style={{ minWidth: '100px', padding: '0.25rem' }}
                                                    value={member.education}
                                                    onChange={(e) => updateMember(index, 'education', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="admin-input" style={{ minWidth: '100px', padding: '0.25rem' }}
                                                    value={member.occupation}
                                                    onChange={(e) => updateMember(index, 'occupation', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="admin-input" style={{ minWidth: '110px', padding: '0.25rem' }}
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
                        disabled={isSaving}
                        style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="admin-btn admin-btn-primary"
                        disabled={isSaving}
                        style={{ padding: '0.5rem 1.5rem', fontSize: '1rem' }}
                    >
                        {isSaving ? 'Updating...' : '💾 Update Family'}
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
        </div>
    );
}
