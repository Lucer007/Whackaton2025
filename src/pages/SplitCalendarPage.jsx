import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

export default function SplitCalendarPage() {
    const [events] = useState([
        {
            title: 'Sample Event',
            start: new Date(2025, 10, 22, 10, 0),
            end: new Date(2025, 10, 22, 12, 0),
        },
        {
            title: 'Meeting',
            start: new Date(2025, 10, 25, 14, 0),
            end: new Date(2025, 10, 25, 15, 30),
        },
    ]);

    return (
        <div className="flex h-screen w-full">
            {/* Left Half - Calendar */}
            <div className="flex-1 border-2 border-gray-300 p-4">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                />
            </div>

            {/* Right Half - Blank Box */}
            <div className="flex-1 border-2 border-gray-300 m-0">
                {/* Empty bordered box */}
            </div>
        </div>
    );
}