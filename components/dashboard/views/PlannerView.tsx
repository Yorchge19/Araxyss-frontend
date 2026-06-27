"use client";

import React, { useState } from 'react';
import { CalendarCheck, Clock } from 'lucide-react';

const defaultEvents = [
  { id: 1, title: 'Weekly Sync', time: '10:00 AM - 11:00 AM', type: 'Meeting' },
  { id: 2, title: 'Design Review', time: '1:00 PM - 2:00 PM', type: 'Review' },
  { id: 3, title: 'Deep Work', time: '3:00 PM - 5:00 PM', type: 'Focus' }
];

export function PlannerView() {
  const [plannerEvents] = useState(defaultEvents);

  return (
    <div className="p-6 ui-view-enter flex-1 overflow-y-auto h-full flex flex-col">
      <div className="flex items-center mb-6 border-b border-border pb-3">
        <CalendarCheck className="text-white mr-2" size={20} />
        <h2 className="text-lg font-semibold text-white">Planner</h2>
      </div>
      <div className="max-w-4xl w-full mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface border border-border rounded-xl p-5">
            <h3 className="text-white font-medium mb-4 flex items-center">
              <Clock className="mr-2 text-text-muted" size={16} /> Today's Schedule
            </h3>
            <div className="space-y-3">
              {plannerEvents.map(ev => (
                <div key={ev.id} className="flex border-l-2 border-white pl-3 py-1">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{ev.title}</p>
                    <p className="text-xs text-text-muted">{ev.time}</p>
                  </div>
                  <span className="text-[10px] bg-surface-hover text-text-body px-2 py-1 rounded self-start">{ev.type}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-surface border border-border rounded-xl flex flex-col items-center justify-center text-center p-6 text-text-muted">
            <CalendarCheck size={48} className="mb-4 text-border" />
            <h3 className="text-white text-lg font-medium mb-2">Sync Calendar</h3>
            <p className="max-w-xs mx-auto text-sm">Connect Google or Outlook to see your events here.</p>
            <button className="mt-4 bg-white text-black hover:bg-btn-primary-hover px-4 py-2 rounded text-sm font-bold transition-all duration-300">
              Connect Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
