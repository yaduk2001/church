'use client';

import { useState } from 'react';
import './ChurchCalendar.css';

interface ChurchCalendarProps {
    selectedDate: string;
    onDateSelect: (date: string) => void;
    onClose: () => void;
}

export default function ChurchCalendar({ selectedDate, onDateSelect, onClose }: ChurchCalendarProps) {
    const [currentDate, setCurrentDate] = useState(selectedDate ? new Date(selectedDate) : new Date());
    const [viewYear, setViewYear] = useState(currentDate.getFullYear());
    const [viewMonth, setViewMonth] = useState(currentDate.getMonth());

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const generateCalendarDays = () => {
        const daysInMonth = getDaysInMonth(viewYear, viewMonth);
        const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
        const days: (number | null)[] = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }

        // Add all days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(day);
        }

        return days;
    };

    const handleDateClick = (day: number) => {
        const selected = new Date(viewYear, viewMonth, day);
        const dateString = selected.toISOString().split('T')[0];
        onDateSelect(dateString);
        onClose();
    };

    const handlePrevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(viewYear - 1);
        } else {
            setViewMonth(viewMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(viewYear + 1);
        } else {
            setViewMonth(viewMonth + 1);
        }
    };

    const handlePrevYear = () => {
        setViewYear(viewYear - 1);
    };

    const handleNextYear = () => {
        setViewYear(viewYear + 1);
    };

    const isSelectedDate = (day: number) => {
        if (!selectedDate) return false;
        const selected = new Date(selectedDate);
        return (
            selected.getDate() === day &&
            selected.getMonth() === viewMonth &&
            selected.getFullYear() === viewYear
        );
    };

    const isToday = (day: number) => {
        const today = new Date();
        return (
            today.getDate() === day &&
            today.getMonth() === viewMonth &&
            today.getFullYear() === viewYear
        );
    };

    const calendarDays = generateCalendarDays();

    return (
        <div className="church-calendar-overlay" onClick={onClose}>
            <div className="church-calendar-container" onClick={(e) => e.stopPropagation()}>
                {/* Header with Cross */}
                <div className="calendar-header">
                    <div className="calendar-cross">✟</div>
                    <h3 className="calendar-title">Select Holy Mass Date</h3>
                    <button className="calendar-close" onClick={onClose}>✕</button>
                </div>

                {/* Year Navigation */}
                <div className="calendar-year-nav">
                    <button className="nav-button" onClick={handlePrevYear}>
                        <span>«</span>
                    </button>
                    <div className="year-display">{viewYear}</div>
                    <button className="nav-button" onClick={handleNextYear}>
                        <span>»</span>
                    </button>
                </div>

                {/* Month Navigation */}
                <div className="calendar-month-nav">
                    <button className="nav-button" onClick={handlePrevMonth}>
                        <span>‹</span>
                    </button>
                    <div className="month-display">{monthNames[viewMonth]}</div>
                    <button className="nav-button" onClick={handleNextMonth}>
                        <span>›</span>
                    </button>
                </div>

                {/* Day Names */}
                <div className="calendar-day-names">
                    {dayNames.map((day) => (
                        <div key={day} className="day-name">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="calendar-grid">
                    {calendarDays.map((day, index) => (
                        <div
                            key={index}
                            className={`calendar-day ${day === null ? 'empty' : ''} ${day && isSelectedDate(day) ? 'selected' : ''
                                } ${day && isToday(day) ? 'today' : ''}`}
                            onClick={() => day && handleDateClick(day)}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="calendar-footer">
                    <button className="clear-button" onClick={() => { onDateSelect(''); onClose(); }}>
                        Clear Selection
                    </button>
                </div>
            </div>
        </div>
    );
}
