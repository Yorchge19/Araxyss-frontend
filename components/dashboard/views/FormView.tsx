"use client";

import React from 'react';
import { FormInput } from 'lucide-react';
import { useDashboard } from '@/components/providers/DashboardContext';

export function FormView() {
  const { spaceItems, activeListId } = useDashboard();
  const activeItem = spaceItems.find(i => i.id === activeListId);

  return (
    <div className="flex-1 flex flex-col h-full bg-surface text-text-body relative overflow-hidden">
      <div className="flex-shrink-0 px-6 py-4 flex items-center justify-between border-b border-border">
        <div className="text-sm text-text-muted flex items-center">
          <FormInput size={14} className="mr-2 text-white" />
          {activeItem?.name || 'Form'}
        </div>
      </div>
      <div className="flex-1 p-6 overflow-y-auto w-full max-w-2xl mx-auto flex flex-col pt-10">
        <h2 className="text-2xl font-bold text-white mb-6 tracking-tight text-center">{activeItem?.name || 'Form'}</h2>
        <div className="bg-surface border border-border rounded-xl p-6 shadow-xl mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-body mb-1">Your Name</label>
              <input type="text" className="w-full bg-surface border border-border rounded-md px-3 py-2 text-white focus:border-text-heading focus:outline-none transition-all duration-300" placeholder="Enter your name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-body mb-1">Feedback</label>
              <textarea className="w-full bg-surface border border-border rounded-md px-3 py-2 text-white focus:border-text-heading focus:outline-none transition-all duration-300" rows={4} placeholder="Type your feedback..."></textarea>
            </div>
            <button className="w-full py-2 bg-white text-black rounded-md font-medium hover:bg-btn-primary-hover transition-all duration-300 mt-6">Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
}
