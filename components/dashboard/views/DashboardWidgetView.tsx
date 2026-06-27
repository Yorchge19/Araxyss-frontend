"use client";

import React from 'react';
import { LayoutDashboard } from 'lucide-react';
import { useDashboard } from '@/components/providers/DashboardContext';

export function DashboardWidgetView() {
  const { spaceItems, activeListId, tasks } = useDashboard();
  const activeItem = spaceItems.find(i => i.id === activeListId);

  return (
    <div className="flex-1 flex flex-col h-full bg-surface text-text-body relative overflow-hidden">
      <div className="flex-shrink-0 px-6 py-4 flex items-center justify-between border-b border-border">
        <div className="text-sm text-text-muted flex items-center">
          <LayoutDashboard size={14} className="mr-2 text-white" />
          {activeItem?.name || 'Dashboard'}
        </div>
      </div>
      <div className="flex-1 p-6 overflow-y-auto w-full">
        <h2 className="text-3xl font-extrabold text-white mb-6">{activeItem?.name || 'Dashboard'}</h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-surface border border-border rounded-xl p-4 h-48 flex flex-col">
            <h3 className="text-sm font-semibold text-text-body mb-2">Total Tasks</h3>
            <div className="flex-1 flex items-center justify-center">
              <span className="text-4xl font-bold text-white">{tasks.length}</span>
            </div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 h-48 flex flex-col">
            <h3 className="text-sm font-semibold text-text-body mb-2">Completion Rate</h3>
            <div className="flex-1 flex items-center justify-center">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--border-subtle)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--success)" strokeWidth="8" strokeDasharray={`${(tasks.filter(t => t.completed || t.status === 'Done').length / Math.max(tasks.length, 1)) * 251.2} 251.2`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-xl font-bold text-white">{Math.round((tasks.filter(t => t.completed || t.status === 'Done').length / Math.max(tasks.length, 1)) * 100)}%</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 h-48 flex flex-col">
            <h3 className="text-sm font-semibold text-text-body mb-4">Sprint Velocity (Points)</h3>
            <div className="flex-1 flex items-end justify-between space-x-2 pt-2">
              {[40, 52, 48, 60, tasks.reduce((acc, t) => acc + (t.points || 0), 0)].map((pts, i) => (
                <div key={i} className="flex flex-col items-center flex-1">
                  <div className="w-full bg-white text-black rounded-t-sm" style={{ height: `${Math.max(10, (pts / 80) * 100)}%` }}></div>
                  <span className="text-[10px] text-text-muted mt-1">S{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-4 h-48 flex flex-col col-span-2">
            <h3 className="text-sm font-semibold text-text-body mb-4">Team Workload</h3>
            <div className="flex-1 flex flex-col justify-center space-y-4">
              {Array.from(new Set(tasks.filter(t => t.assigneeName).map(t => t.assigneeName))).map((name, idx) => {
                const userTasks = tasks.filter(t => t.assigneeName === name);
                const openTasks = userTasks.filter(t => t.status !== 'Done');
                const color = ['bg-text-muted', 'bg-text-body', 'bg-text-muted', 'bg-text-heading'][idx % 4];
                return (
                  <div key={name} className="flex flex-col space-y-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-body">{name}</span>
                      <span className="text-text-muted">{openTasks.length} pending ({userTasks.reduce((acc, t) => acc + (t.points || 0), 0)} pts)</span>
                    </div>
                    <div className="w-full h-2 bg-surface-hover rounded-full overflow-hidden">
                      <div className={`h-full ${color}`} style={{ width: `${Math.min(100, (openTasks.length / 10) * 100)}%` }}></div>
                    </div>
                  </div>
                );
              })}
              {tasks.filter(t => t.assigneeName).length === 0 && (
                <div className="text-sm text-text-muted text-center italic">No tasks assigned to show workload.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
