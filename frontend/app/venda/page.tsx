'use client';

import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { apiEndpoint } from '../config/api';
import './page.css';

interface VendaFormData {
    donorName: string;
    amount: string;
    purpose: string;
    paymentMethod: string;
    isAnonymous: boolean;
}

export default function VendaPage() {
    const { t } = useLanguage();
    const [formData, setFormData] = useState<VendaFormData>({
        donorName: '',
        amount: '',
        purpose: 'General',
        paymentMethod: 'Cash',
        isAnonymous: false,
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [receiptNumber, setReceiptNumber] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        // Validation
        if (!formData.isAnonymous && !formData.donorName.trim()) {
            setError('Please enter your name or mark as anonymous');
            return;
        }

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(apiEndpoint('venda'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    donorName: formData.isAnonymous ? 'Anonymous' : formData.donorName,
                    amount: parseFloat(formData.amount),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit offering');
            }

            const data = await response.json();
            setReceiptNumber(data.venda.receiptNumber);
            setSuccess(true);
            setLoading(false);

            // Reset form
            setFormData({
                donorName: '',
                amount: '',
                purpose: 'General',
                paymentMethod: 'Cash',
                isAnonymous: false,
            });

            // Auto-hide after 10 seconds
            setTimeout(() => {
                setSuccess(false);
                setReceiptNumber(null);
            }, 10000);
        } catch (err) {
            setError('Failed to submit offering. Please try again.');
            setLoading(false);
            console.error('Error submitting offering:', err);
        }
    };

    return (
        <div className="venda-page">
            <div className="container">
                {/* Page Header */}
                <div className="page-header">
                    <div className="offering-icon">🙏</div>
                    <h1 className="page-title">{t('venda.title')}</h1>
                    <p className="page-subtitle">
                        {t('venda.subtitle')}
                    </p>
                </div>

                <div className="venda-content">
                    {/* Information Section */}
                    <div className="info-section">
                        <h2>Ways to Contribute</h2>

                        <div className="offering-types">
                            <div className="offering-card">
                                <div className="card-icon">⛪</div>
                                <h3>General Fund</h3>
                                <p>Supports day-to-day operations, utilities, and maintenance of our church</p>
                            </div>

                            <div className="offering-card">
                                <div className="card-icon">🏗️</div>
                                <h3>Building Fund</h3>
                                <p>Contributions towards church infrastructure development and renovations</p>
                            </div>

                            <div className="offering-card">
                                <div className="card-icon">❤️</div>
                                <h3>Poor Fund</h3>
                                <p>Direct assistance to families in need within our parish community</p>
                            </div>

                            <div className="offering-card">
                                <div className="card-icon">🌍</div>
                                <h3>Mission Fund</h3>
                                <p>Supporting missionary activities and evangelization efforts</p>
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="payment-methods-info">
                            <h3>Payment Methods</h3>
                            <div className="methods-grid">
                                <div className="method-item">
                                    <span className="method-icon">💵</span>
                                    <div>
                                        <strong>Cash</strong>
                                        <p>Drop in offering box or give to parish office</p>
                                    </div>
                                </div>
                                <div className="method-item">
                                    <span className="method-icon">💳</span>
                                    <div>
                                        <strong>UPI Payment</strong>
                                        <p>stmarysparish@upi</p>
                                    </div>
                                </div>
                                <div className="method-item">
                                    <span className="method-icon">🏦</span>
                                    <div>
                                        <strong>Bank Transfer</strong>
                                        <p>A/C: 1234567890 | IFSC: SBIN0001234</p>
                                    </div>
                                </div>
                                <div className="method-item">
                                    <span className="method-icon">📝</span>
                                    <div>
                                        <strong>Check</strong>
                                        <p>Payable to "St. Mary's Parish"</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tax Information */}
                        <div className="tax-info">
                            <h3>📋 Tax Exemption</h3>
                            <p>
                                All donations are eligible for tax exemption under Section 80G of the Income Tax Act.
                                Receipt numbers will be provided for your records.
                            </p>
                        </div>
                    </div>

                    {/* Offering Form */}
                    <div className="form-section">
                        <h2>Submit Your Offering</h2>

                        {error && (
                            <div className="alert alert-error">
                                ✗ {error}
                            </div>
                        )}

                        {success && (
                            <div className="alert alert-success">
                                <p>✓ Thank you for your generous contribution!</p>
                                {receiptNumber && (
                                    <p className="receipt-info">
                                        <strong>Receipt Number:</strong> {receiptNumber}
                                    </p>
                                )}
                                <p className="small-text">Please save this receipt number for your records</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="offering-form">
                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="isAnonymous"
                                        checked={formData.isAnonymous}
                                        onChange={handleChange}
                                    />
                                    <span>Make this donation anonymous</span>
                                </label>
                            </div>

                            {!formData.isAnonymous && (
                                <div className="form-group">
                                    <label htmlFor="donorName">{t('venda.donorName')} *</label>
                                    <input
                                        type="text"
                                        id="donorName"
                                        name="donorName"
                                        value={formData.donorName}
                                        onChange={handleChange}
                                        placeholder={t('venda.enterDonorName')}
                                        required={!formData.isAnonymous}
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="amount">{t('venda.amount')} (₹) *</label>
                                <input
                                    type="number"
                                    id="amount"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    placeholder={t('venda.enterAmount')}
                                    min="1"
                                    step="0.01"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="purpose">Purpose *</label>
                                <select
                                    id="purpose"
                                    name="purpose"
                                    value={formData.purpose}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="General">General Fund</option>
                                    <option value="Building Fund">Building Fund</option>
                                    <option value="Poor Fund">Poor Fund</option>
                                    <option value="Mission">Mission Fund</option>
                                    <option value="Special Offering">Special Offering</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="paymentMethod">Payment Method *</label>
                                <select
                                    id="paymentMethod"
                                    name="paymentMethod"
                                    value={formData.paymentMethod}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="UPI">UPI</option>
                                    <option value="Online Transfer">Online Transfer</option>
                                    <option value="Check">Check</option>
                                    <option value="Card">Card</option>
                                </select>
                            </div>

                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="spinner-small"></span>
                                        Processing...
                                    </>
                                ) : (
                                    <>{t('venda.proceedToPayment')}</>
                                )}
                            </button>

                            <p className="form-note">
                                * All fields are required. Your contribution will be acknowledged with a receipt.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
