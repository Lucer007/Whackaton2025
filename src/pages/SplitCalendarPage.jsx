import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Views, Navigate, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import PropTypes from 'prop-types';
import * as dates from 'date-arithmetic';
import TimeGrid from 'react-big-calendar/lib/TimeGrid';
import ICAL from 'ical.js';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

// Custom 3-day Week View Component
function MyWeek({
                    date,
                    localizer,
                    max = localizer.endOf(new Date(), 'day'),
                    min = localizer.startOf(new Date(), 'day'),
                    scrollToTime = localizer.startOf(new Date(), 'day'),
                    ...props
                }) {
    const currRange = useMemo(
        () => MyWeek.range(date, { localizer }),
        [date, localizer]
    );

    return (
        <TimeGrid
            date={date}
            eventOffset={15}
            localizer={localizer}
            max={max}
            min={min}
            range={currRange}
            scrollToTime={scrollToTime}
            {...props}
        />
    );
}

MyWeek.propTypes = {
    date: PropTypes.instanceOf(Date).isRequired,
    localizer: PropTypes.object,
    max: PropTypes.instanceOf(Date),
    min: PropTypes.instanceOf(Date),
    scrollToTime: PropTypes.instanceOf(Date),
};

MyWeek.range = (date, { localizer }) => {
    const start = date;
    const end = dates.add(start, 2, 'day');

    let current = start;
    const range = [];

    while (localizer.lte(current, end, 'day')) {
        range.push(current);
        current = localizer.add(current, 1, 'day');
    }

    return range;
};

MyWeek.navigate = (date, action, { localizer }) => {
    switch (action) {
        case Navigate.PREVIOUS:
            return localizer.add(date, -3, 'day');
        case Navigate.NEXT:
            return localizer.add(date, 3, 'day');
        default:
            return date;
    }
};

MyWeek.title = (date) => {
    return `My awesome week: ${date.toLocaleDateString()}`;
};

// Main Split Calendar Component
export default function SplitCalendarPage() {
    const [events, setEvents] = useState([]);
    const [icsUrl, setIcsUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Function to parse ICS data
    const parseICS = (icsData) => {
        try {
            const jcalData = ICAL.parse(icsData);
            const comp = new ICAL.Component(jcalData);
            const vevents = comp.getAllSubcomponents('vevent');

            const parsedEvents = vevents.map(vevent => {
                const event = new ICAL.Event(vevent);
                return {
                    title: event.summary,
                    start: event.startDate.toJSDate(),
                    end: event.endDate.toJSDate(),
                    description: event.description || '',
                };
            });

            return parsedEvents;
        } catch (err) {
            console.error('Error parsing ICS:', err);
            throw new Error('Failed to parse ICS file');
        }
    };

    // Function to handle file upload
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.ics')) {
            setError('Please upload a valid .ics file');
            setSuccessMessage('');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccessMessage('');

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const icsData = e.target.result;
                const parsedEvents = parseICS(icsData);

                // Replace all events with parsed events
                setEvents(parsedEvents);
                setSuccessMessage(`Successfully loaded ${parsedEvents.length} events from file`);
                setError('');
            } catch (err) {
                setError(err.message || 'Failed to load calendar');
                setSuccessMessage('');
            } finally {
                setIsLoading(false);
                // Reset file input
                event.target.value = '';
            }
        };

        reader.onerror = () => {
            setError('Failed to read file');
            setSuccessMessage('');
            setIsLoading(false);
        };

        reader.readAsText(file);
    };

    // Function to load ICS from URL
    const loadICSFromURL = async () => {
        if (!icsUrl.trim()) {
            setError('Please enter a valid ICS URL');
            setSuccessMessage('');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            // Use CORS proxy for Google Calendar URLs
            let fetchUrl = icsUrl;
            if (icsUrl.includes('google.com')) {
                fetchUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(icsUrl)}`;
            }

            const response = await fetch(fetchUrl);
            if (!response.ok) {
                throw new Error('Failed to fetch ICS file');
            }

            const icsData = await response.text();
            const parsedEvents = parseICS(icsData);

            // Replace all events with parsed events
            setEvents(parsedEvents);
            setSuccessMessage(`Successfully loaded ${parsedEvents.length} events from URL`);
            setIcsUrl('');
            setError('');
        } catch (err) {
            setError(err.message || 'Failed to load calendar. Try downloading the .ics file and uploading it instead.');
            setSuccessMessage('');
        } finally {
            setIsLoading(false);
        }
    };

    const { customViews } = useMemo(
        () => ({
            customViews: {
                month: true,
                week: MyWeek,
            },
        }),
        []
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%' }}>
            {/* ICS Import Section */}
            <div style={{ padding: '16px', borderBottom: '2px solid #d1d5db', backgroundColor: '#f9fafb' }}>
                {/* File Upload Option */}
                <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <label
                            htmlFor="ics-upload"
                            style={{
                                padding: '8px 16px',
                                backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                display: 'inline-block'
                            }}
                        >
                            {isLoading ? 'Loading...' : 'Upload ICS File'}
                        </label>
                        <input
                            id="ics-upload"
                            type="file"
                            accept=".ics"
                            onChange={handleFileUpload}
                            disabled={isLoading}
                            style={{ display: 'none' }}
                        />
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>
                            Or enter URL below
                        </span>
                    </div>
                </div>

                {/* URL Input Option */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', maxWidth: '800px' }}>
                    <input
                        type="text"
                        placeholder="Enter ICS Calendar URL (e.g., https://calendar.google.com/calendar/ical/...)"
                        value={icsUrl}
                        onChange={(e) => setIcsUrl(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && loadICSFromURL()}
                        style={{
                            flex: 1,
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}
                        disabled={isLoading}
                    />
                    <button
                        onClick={loadICSFromURL}
                        disabled={isLoading}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: isLoading ? '#9ca3af' : '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                    >
                        {isLoading ? 'Loading...' : 'Load from URL'}
                    </button>
                </div>

                {/* Status Messages */}
                <div style={{ marginTop: '8px' }}>
                    {error && (
                        <div style={{ color: '#dc2626', fontSize: '14px', marginBottom: '4px' }}>
                            ❌ {error}
                        </div>
                    )}
                    {successMessage && (
                        <div style={{ color: '#059669', fontSize: '14px', marginBottom: '4px' }}>
                            ✅ {successMessage}
                        </div>
                    )}
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                        {events.length > 0 ? `📅 ${events.length} events currently loaded` : '📅 No events loaded'}
                    </div>
                </div>
            </div>

            {/* Calendar Split View */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Left Half - Full Month Calendar */}
                <div style={{ flex: 1, border: '2px solid #d1d5db', padding: '16px', overflow: 'auto' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '8px' }}>Month View</h2>
                    <div style={{ height: 'calc(100% - 40px)' }}>
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            defaultView={Views.MONTH}
                            views={['month']}
                            style={{ height: '100%' }}
                        />
                    </div>
                </div>

                {/* Right Half - Custom 3-Day Week View */}
                <div style={{ flex: 1, border: '2px solid #d1d5db', padding: '16px', overflow: 'auto' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '8px' }}>3-Day Week View</h2>
                    <div style={{ height: 'calc(100% - 40px)' }}>
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            defaultView={Views.WEEK}
                            views={customViews}
                            style={{ height: '100%' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}