'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiEndpoint } from '@/app/config/api';
import ChurchCalendar from './ChurchCalendar';
import './mass-timings.css';

interface Church {
    _id: string;
    name: string;
}

interface MassTiming {
    _id: string;
    churchId: Church | string;
    day?: string;
    date?: string;
    time: string;
    language: string;
    type: 'Regular' | 'Special' | 'Festival';
    description?: string;
}

export default function AdminMassTimings() {
    const router = useRouter();
    const [timings, setTimings] = useState<MassTiming[]>([]);
    const [churches, setChurches] = useState<Church[]>([]);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState<string>('');

    // Form State
    const [formData, setFormData] = useState({
        churchId: '',
        day: 'Sunday',
        date: '',
        time: '',
        language: 'English',
        type: 'Regular',
        description: ''
    });
    const [showCalendar, setShowCalendar] = useState(false);

    useEffect(() => {
        const storedToken = localStorage.getItem('adminToken');
        if (!storedToken) {
            router.push('/admin');
            return;
        }
        setToken(storedToken);
        fetchData(storedToken);
    }, [router]);

    const fetchData = async (authToken: string) => {
        try {
            // Fetch Churches
            const churchesRes = await fetch(apiEndpoint('churches'));
            const churchesData = await churchesRes.json();
            setChurches(churchesData);

            // Fetch Mass Timings
            const timingsRes = await fetch(apiEndpoint('mass-timings'));
            const timingsData = await timingsRes.json();
            setTimings(timingsData);

            // Set default church if available
            if (churchesData.length > 0) {
                setFormData(prev => ({ ...prev, churchId: churchesData[0]._id }));
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this mass timing?')) return;

        try {
            const res = await fetch(apiEndpoint(`mass-timings/${id}`), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setTimings(timings.filter(t => t._id !== id));
            } else {
                alert('Failed to delete timing');
            }
        } catch (error) {
            console.error('Error deleting timing:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Clean up payload
            const payload: any = { ...formData };
            if (!payload.date) delete payload.date;
            if (!payload.description) delete payload.description;

            const res = await fetch(apiEndpoint('mass-timings'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const newTiming = await res.json();
                // Refresh list to include populated fields
                fetchData(token);
                // Reset form partially
                setFormData(prev => ({
                    ...prev,
                    time: '',
                    description: '',
                    type: 'Regular',
                    date: ''
                }));
                alert('Mass timing added successfully');
            } else {
                alert('Failed to add mass timing');
            }
        } catch (error) {
            console.error('Error adding timing:', error);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading schedule...</div>;

    return (
        <div className="mass-timings-container">
            <div className="page-header">
                <h1 className="page-title">Manage Mass Timings</h1>
                <button
                    onClick={() => router.push('/admin/dashboard')}
                    className="back-btn"
                >
                    <span>←</span> Back to Dashboard
                </button>
            </div>

            <div className="content-grid">
                {/* Add New Form */}
                <div className="card">
                    <h2 className="card-title">✨ Add New Timing</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Church</label>
                            <select
                                value={formData.churchId}
                                onChange={e => setFormData({ ...formData, churchId: e.target.value })}
                                className="form-control"
                                required
                            >
                                {churches.map(church => (
                                    <option key={church._id} value={church._id}>{church.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Type</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                className="form-control"
                            >
                                <option value="Regular">Regular (Weekly)</option>
                                <option value="Special">Special Event</option>
                                <option value="Festival">Festival Mass</option>
                            </select>
                        </div>

                        {/* Calendar Date Selector for All Types */}
                        <div className="form-group">
                            <label className="form-label">
                                {formData.type === 'Regular' ? 'Day & Date' : 'Event Date'}
                            </label>
                            <button
                                type="button"
                                className="calendar-button-admin"
                                onClick={() => setShowCalendar(true)}
                            >
                                {formData.date ? (
                                    <>
                                        <span>📅 {new Date(formData.date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}</span>
                                    </>
                                ) : (
                                    <span>Select Date from Calendar</span>
                                )}
                            </button>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Time</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 06:30 AM"
                                    value={formData.time}
                                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                                    className="form-control"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Language</label>
                                <input
                                    type="text"
                                    value={formData.language}
                                    onChange={e => setFormData({ ...formData, language: e.target.value })}
                                    className="form-control"
                                    required
                                />
                            </div>
                        </div>

                        {formData.type !== 'Regular' && (
                            <div className="form-group">
                                <label className="form-label">Description (Optional)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="form-control textarea-control"
                                    placeholder="e.g. Christmas Midnight Mass with Choir"
                                />
                            </div>
                        )}

                        <button type="submit" className="submit-btn" style={{ color: 'white' }}>
                            + Add Mass Timing
                        </button>
                    </form>
                </div>

                {/* List Timings */}
                <div className="card">
                    <h2 className="card-title">📅 Current Schedule</h2>

                    {timings.length === 0 ? (
                        <div className="empty-state">
                            <p>No mass timings found. Add one on the left.</p>
                        </div>
                    ) : (
                        <div className="timings-list">
                            {timings.map(timing => (
                                <div key={timing._id} className={`timing-item ${timing.type.toLowerCase()}`}>
                                    <div>
                                        <div className="time-display">
                                            <span className="time-text">{timing.time}</span>
                                            <span className={`type-badge ${timing.type.toLowerCase()}`}>{timing.type}</span>
                                            {timing.date && (
                                                <span className="date-badge">
                                                    📅 {new Date(timing.date).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                        <div className="context-text">
                                            {timing.type === 'Regular' ? timing.day : timing.description || 'Special Event'} • <span style={{ fontWeight: 500 }}>{timing.language}</span>
                                        </div>
                                        <div className="location-text">
                                            📍 {(timing.churchId as any)?.name || 'Unknown Church'}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(timing._id)}
                                        className="delete-btn"
                                        title="Delete Timing"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Church Calendar Modal */}
            {showCalendar && (
                <ChurchCalendar
                    selectedDate={formData.date}
                    onDateSelect={(date) => {
                        // Get day of week from selected date
                        const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
                        setFormData({ ...formData, date, day: dayOfWeek });
                    }}
                    onClose={() => setShowCalendar(false)}
                />
            )}
        </div>
    );
}
