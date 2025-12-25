import React from 'react';
import '../admin/dashboard/admin-dashboard.css'; // Ensure styles are available

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message?: string;
    children?: React.ReactNode;
    type?: 'confirm' | 'alert' | 'success' | 'error';
    confirmText?: string;
    onConfirm?: () => void;
}

export default function Modal({
    isOpen,
    onClose,
    title,
    message,
    children,
    type = 'alert',
    confirmText = 'OK',
    onConfirm
}: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="admin-modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
            <div className="admin-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', width: '90%' }}>
                <div className="admin-modal-header" style={{
                    background: type === 'error' || type === 'confirm' ? 'linear-gradient(135deg, #800020, #8B4513)' : 'linear-gradient(135deg, #800020, #8B4513)',
                    padding: '1rem 1.5rem'
                }}>
                    <h3 className="admin-modal-title" style={{ fontSize: '1.1rem', margin: 0 }}>
                        {type === 'error' ? '⚠️ ' : type === 'success' ? '✅ ' : ''}
                        {title}
                    </h3>
                    <button onClick={onClose} className="admin-modal-close">✕</button>
                </div>

                <div className="admin-modal-body">
                    {message && <p style={{ color: '#4B5563', lineHeight: '1.5', marginBottom: children ? '1rem' : 0 }}>{message}</p>}
                    {children}
                </div>

                <div className="admin-actions" style={{ padding: '1rem 1.5rem', background: '#F9FAFB', borderRadius: '0 0 1rem 1rem', marginTop: 0 }}>
                    {type === 'confirm' ? (
                        <>
                            <button
                                onClick={onClose}
                                className="admin-btn admin-btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (onConfirm) onConfirm();
                                    onClose(); // Optional: close on confirm? usually yes for simple confirmations
                                }}
                                className="admin-btn admin-btn-primary"
                                style={{ background: '#800020', border: 'none' }}
                            >
                                {confirmText}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            className="admin-btn admin-btn-primary"
                            style={{ width: '100%', justifyContent: 'center' }}
                        >
                            {confirmText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
