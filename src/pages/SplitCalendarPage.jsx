import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Views, Navigate, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import PropTypes from 'prop-types';
import * as dates from 'date-arithmetic';
import TimeGrid from 'react-big-calendar/lib/TimeGrid';
import ICAL from 'ical.js';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {Link} from "react-router-dom";

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

    // Chatbot state
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [syllabusFile, setSyllabusFile] = useState(null);
    const [geminiApiKey, setGeminiApiKey] = useState('');
    const [icsUrlForChat, setIcsUrlForChat] = useState('');

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

    // Handle syllabus file upload
    const handleSyllabusUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSyllabusFile(file);

            // Check if it's an ICS file
            if (file.name.endsWith('.ics')) {
                setChatMessages(prev => [...prev, {
                    role: 'system',
                    content: `ICS calendar file uploaded: ${file.name}. I'll import it automatically.`,
                }]);
            } else {
                setChatMessages(prev => [...prev, {
                    role: 'system',
                    content: `Syllabus uploaded: ${file.name}`,
                }]);
            }
        }
    };

    // Call Gemini API
    const callGeminiAPI = async (message, fileContent = null) => {
        if (!geminiApiKey) {
            return 'Please enter your Gemini API key in the chat settings.';
        }

        try {
            // Prepare calendar data for context
            const calendarContext = events.length > 0
                ? `\n\nCurrent Calendar Events:\n${events.map(e =>
                    `- ${e.title}: ${e.start.toLocaleString()} to ${e.end.toLocaleString()}${e.description ? ` (${e.description})` : ''}`
                ).join('\n')}`
                : '\n\nNo events currently in calendar.';

            const prompt = fileContent
                ? `You are a study planning assistant. Analyze this syllabus, the user's current calendar, and the user's request: "${message}"

Syllabus content:
${fileContent}
${calendarContext}

Based on the syllabus and existing calendar events, suggest a study plan. Look for upcoming classes, exams, or assignments in the calendar and recommend study sessions to prepare for them. Format your response as JSON with this structure:
{
  "explanation": "brief explanation of your recommendations based on their calendar and syllabus",
  "studySessions": [
    {
      "title": "Study session title",
      "date": "YYYY-MM-DD",
      "startTime": "HH:MM",
      "duration": 60,
      "description": "what to study and why (reference specific calendar events if relevant)"
    }
  ]
}

Only respond with valid JSON, no markdown or extra text.`
                : `You are a study planning assistant. The user's request: "${message}"
${calendarContext}

Analyze the user's calendar and suggest study sessions for upcoming classes or events. Consider:
1. Classes that are coming up soon
2. Time gaps between events where studying could fit
3. Preparation needed before exams or assignments
4. Consistent study patterns

Format your response as JSON with this structure:
{
  "explanation": "brief explanation of your recommendations based on their calendar",
  "studySessions": [
    {
      "title": "Study session title",
      "date": "YYYY-MM-DD",
      "startTime": "HH:MM",
      "duration": 60,
      "description": "what to study and why (reference specific calendar events)"
    }
  ]
}

If the user is just asking a question and not requesting study sessions, you can respond with just:
{
  "explanation": "your answer to their question"
}

Only respond with valid JSON, no markdown or extra text.`;

            console.log('Calling Gemini API...');
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);

                if (response.status === 400) {
                    throw new Error('Invalid API key or request format. Please check your API key.');
                } else if (response.status === 403) {
                    throw new Error('API key does not have permission. Make sure your API key is valid and has Gemini API access enabled.');
                } else if (response.status === 429) {
                    throw new Error('Rate limit exceeded. Please wait a moment and try again.');
                } else {
                    throw new Error(`API error (${response.status}): ${errorData.error?.message || 'Unknown error'}`);
                }
            }

            const data = await response.json();
            console.log('API Response:', data);

            if (!data.candidates || data.candidates.length === 0) {
                throw new Error('No response from Gemini. Try rephrasing your question.');
            }

            const text = data.candidates[0].content.parts[0].text;
            return text;
        } catch (err) {
            console.error('Gemini API error:', err);
            return `Error: ${err.message}`;
        }
    };

    // Add study sessions to calendar
    const addStudySessionsToCalendar = (studySessions) => {
        const newEvents = studySessions.map(session => {
            const [year, month, day] = session.date.split('-').map(Number);
            const [hours, minutes] = session.startTime.split(':').map(Number);
            const start = new Date(year, month - 1, day, hours, minutes);
            const end = new Date(start.getTime() + session.duration * 60000);

            return {
                title: session.title,
                start,
                end,
                description: session.description || '',
            };
        });

        setEvents(prev => [...prev, ...newEvents]);
        return newEvents.length;
    };

    // Send message to chatbot
    const handleSendMessage = async () => {
        if (!chatInput.trim() && !syllabusFile && !icsUrlForChat.trim()) return;

        const userMessage = chatInput.trim();
        setChatInput('');
        setIsChatLoading(true);

        // Add user message
        if (userMessage) {
            setChatMessages(prev => [...prev, {
                role: 'user',
                content: userMessage,
            }]);
        }

        try {
            // Handle ICS URL import
            if (icsUrlForChat.trim()) {
                setChatMessages(prev => [...prev, {
                    role: 'system',
                    content: `Loading calendar from URL...`,
                }]);

                try {
                    let fetchUrl = icsUrlForChat;
                    if (icsUrlForChat.includes('google.com')) {
                        fetchUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(icsUrlForChat)}`;
                    }

                    const response = await fetch(fetchUrl);
                    if (!response.ok) throw new Error('Failed to fetch ICS file');

                    const icsData = await response.text();
                    const parsedEvents = parseICS(icsData);
                    setEvents(parsedEvents);

                    setChatMessages(prev => [...prev, {
                        role: 'assistant',
                        content: `✅ Successfully imported ${parsedEvents.length} events from the URL to your calendar!\n\nNow I can help you plan study sessions around these events. What would you like me to help with?`,
                    }]);

                    setIcsUrlForChat('');
                    setIsChatLoading(false);
                    return;
                } catch (err) {
                    setChatMessages(prev => [...prev, {
                        role: 'assistant',
                        content: `❌ Failed to import calendar: ${err.message}. Try downloading the .ics file and uploading it instead.`,
                    }]);
                    setIcsUrlForChat('');
                    setIsChatLoading(false);
                    return;
                }
            }

            let fileContent = null;
            let isICSFile = false;

            // Read file if uploaded
            if (syllabusFile) {
                isICSFile = syllabusFile.name.endsWith('.ics');

                fileContent = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.onerror = reject;
                    reader.readAsText(syllabusFile);
                });

                // If it's an ICS file, automatically import it
                if (isICSFile) {
                    try {
                        const parsedEvents = parseICS(fileContent);
                        setEvents(parsedEvents);

                        setChatMessages(prev => [...prev, {
                            role: 'assistant',
                            content: `✅ Successfully imported ${parsedEvents.length} events from ${syllabusFile.name} to your calendar!\n\nNow I can help you plan study sessions around these events. What would you like me to help with?`,
                        }]);

                        setSyllabusFile(null);
                        setIsChatLoading(false);
                        return;
                    } catch (err) {
                        setChatMessages(prev => [...prev, {
                            role: 'assistant',
                            content: `❌ Failed to import ICS file: ${err.message}. Please make sure it's a valid calendar file.`,
                        }]);
                        setSyllabusFile(null);
                        setIsChatLoading(false);
                        return;
                    }
                }
            }

            // For syllabus files or text queries, use Gemini
            const response = await callGeminiAPI(
                userMessage || 'Analyze this and suggest study sessions',
                isICSFile ? null : fileContent
            );

            // Try to parse as JSON for study sessions
            try {
                const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
                const parsed = JSON.parse(cleaned);

                if (parsed.studySessions && Array.isArray(parsed.studySessions)) {
                    const count = addStudySessionsToCalendar(parsed.studySessions);
                    setChatMessages(prev => [...prev, {
                        role: 'assistant',
                        content: `${parsed.explanation}\n\n✅ Added ${count} study sessions to your calendar!`,
                    }]);
                } else {
                    setChatMessages(prev => [...prev, {
                        role: 'assistant',
                        content: parsed.explanation || response,
                    }]);
                }
            } catch {
                // Not JSON, just display the response
                setChatMessages(prev => [...prev, {
                    role: 'assistant',
                    content: response,
                }]);
            }

            // Clear syllabus after processing
            setSyllabusFile(null);
        } catch (err) {
            setChatMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
            }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    return (

        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Navbar */}
            <header className="navbar-gradient">
                <div className="container">
                    <Link to="/" className="Navbar-title">Nudge</Link>
                    <nav>
                        <ul className="navbar-link">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/projects">Projects</Link></li>
                            <li><Link to="/profile">Profile</Link></li>
                        </ul>
                    </nav>
                </div>
            </header>

            {/*<div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', position: 'relative' }}>
             ICS Import Section
            <div style={{ padding: '16px', borderBottom: '2px solid #d1d5db', backgroundColor: '#f9fafb' }}>
                 File Upload Option
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

                 URL Input Option
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

                 Status Messages
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
            </div>*/}

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

            {/* Chat Button */}
            {!isChatOpen && (
                <button
                    onClick={() => setIsChatOpen(true)}
                    style={{
                        position: 'fixed',
                        bottom: '24px',
                        right: '24px',
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        backgroundColor: '#8b5cf6',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '24px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}
                >
                    💬
                </button>
            )}

            {/* Chat Window */}
            {isChatOpen && (
                <div style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    width: '400px',
                    maxWidth: 'calc(100vw - 48px)',
                    height: '600px',
                    maxHeight: 'calc(100vh - 48px)',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 1000,
                    overflow: 'hidden'
                }}>
                    {/* Chat Header */}
                    <div style={{
                        padding: '16px',
                        backgroundColor: '#8b5cf6',
                        color: 'white',
                        borderRadius: '12px 12px 0 0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexShrink: 0
                    }}>
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Study Planner AI</div>
                            <div style={{ fontSize: '12px', opacity: 0.9 }}>Powered by Gemini</div>
                        </div>
                        <button
                            onClick={() => setIsChatOpen(false)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                fontSize: '24px',
                                cursor: 'pointer',
                                padding: '0',
                                width: '30px',
                                height: '30px'
                            }}
                        >
                            ×
                        </button>
                    </div>

                    {/* API Key Input (if not set) */}
                    {!geminiApiKey && (
                        <div style={{ padding: '12px', backgroundColor: '#fef3c7', borderBottom: '1px solid #fde68a', flexShrink: 0 }}>
                            <input
                                type="password"
                                placeholder="Enter Gemini API Key"
                                value={geminiApiKey}
                                onChange={(e) => setGeminiApiKey(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    boxSizing: 'border-box'
                                }}
                            />
                            <div style={{ fontSize: '11px', color: '#92400e', marginTop: '4px' }}>
                                Get your API key at: ai.google.dev
                            </div>
                        </div>
                    )}

                    {/* Chat Messages */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        minHeight: 0
                    }}>
                        {chatMessages.length === 0 && (
                            <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px', marginTop: '20px' }}>
                                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📚</div>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>I can help you with:</div>
                                <div style={{ textAlign: 'left', display: 'inline-block' }}>
                                    • Import ICS calendar files or URLs<br/>
                                    • Analyze your syllabus<br/>
                                    • Review your calendar events<br/>
                                    • Suggest study sessions for upcoming classes<br/>
                                    • Find study time between events<br/>
                                    • Plan exam preparation<br/>
                                </div>
                                <div style={{ marginTop: '12px', fontSize: '13px', backgroundColor: '#fef3c7', padding: '8px', borderRadius: '6px' }}>
                                    💡 Just upload an .ics file or paste a calendar URL and I'll import it automatically!
                                </div>
                            </div>
                        )}
                        {chatMessages.map((msg, idx) => (
                            <div
                                key={idx}
                                style={{
                                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '80%',
                                    padding: '10px 14px',
                                    borderRadius: '12px',
                                    backgroundColor: msg.role === 'user' ? '#8b5cf6' : msg.role === 'system' ? '#f3f4f6' : '#e0e7ff',
                                    color: msg.role === 'user' ? 'white' : '#1f2937',
                                    fontSize: '14px',
                                    lineHeight: '1.5',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word'
                                }}
                            >
                                {msg.content}
                            </div>
                        ))}
                        {isChatLoading && (
                            <div style={{ alignSelf: 'flex-start', padding: '10px 14px' }}>
                                <div style={{ fontSize: '14px', color: '#6b7280' }}>Thinking...</div>
                            </div>
                        )}
                    </div>

                    {/* Chat Input */}
                    <div style={{ padding: '12px', borderTop: '1px solid #e5e7eb', flexShrink: 0 }}>
                        {syllabusFile && (
                            <div style={{
                                marginBottom: '8px',
                                padding: '6px 10px',
                                backgroundColor: '#e0e7ff',
                                borderRadius: '6px',
                                fontSize: '12px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📄 {syllabusFile.name}</span>
                                <button
                                    onClick={() => setSyllabusFile(null)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        marginLeft: '8px',
                                        flexShrink: 0
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        )}

                        {/* ICS URL Input */}
                        <div style={{ marginBottom: '8px' }}>
                            <input
                                type="text"
                                placeholder="Or paste ICS calendar URL here..."
                                value={icsUrlForChat}
                                onChange={(e) => setIcsUrlForChat(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !isChatLoading && handleSendMessage()}
                                style={{
                                    width: '100%',
                                    padding: '6px 10px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    boxSizing: 'border-box'
                                }}
                                disabled={isChatLoading}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <label
                                htmlFor="syllabus-upload"
                                style={{
                                    padding: '8px',
                                    backgroundColor: '#f3f4f6',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '20px',
                                    flexShrink: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                📎
                            </label>
                            <input
                                id="syllabus-upload"
                                type="file"
                                accept=".pdf,.txt,.doc,.docx,.ics"
                                onChange={handleSyllabusUpload}
                                style={{ display: 'none' }}
                            />
                            <input
                                type="text"
                                placeholder="Ask me anything..."
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !isChatLoading && handleSendMessage()}
                                disabled={isChatLoading}
                                style={{
                                    flex: 1,
                                    minWidth: 0,
                                    padding: '8px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={isChatLoading || (!chatInput.trim() && !syllabusFile && !icsUrlForChat.trim())}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: isChatLoading || (!chatInput.trim() && !syllabusFile && !icsUrlForChat.trim()) ? '#d1d5db' : '#8b5cf6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: isChatLoading || (!chatInput.trim() && !syllabusFile && !icsUrlForChat.trim()) ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    flexShrink: 0,
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}