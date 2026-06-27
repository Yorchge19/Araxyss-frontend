"use client";

import React from 'react';
import { FileText } from 'lucide-react';
import { useDashboard } from '@/components/providers/DashboardContext';

interface DocViewProps {
  docContents: Record<string, string>;
  setDocContents: (val: Record<string, string>) => void;
}

export function DocView({ docContents, setDocContents }: DocViewProps) {
  const { spaceItems, activeListId } = useDashboard();
  const activeItem = spaceItems.find(i => i.id === activeListId);

  return (
    <div className="flex-1 flex flex-col h-full bg-surface text-text-body relative overflow-hidden">
      <div className="flex-shrink-0 px-6 py-4 flex items-center justify-between border-b border-border">
        <div className="text-sm text-text-muted flex items-center">
          <FileText size={14} className="mr-2 text-white" />
          {activeItem?.name || 'Doc'}
        </div>
      </div>
      <div className="flex-1 p-6 overflow-y-auto max-w-4xl mx-auto w-full mt-10">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-white">
          {activeItem?.name || 'Doc Test'}
        </h1>
        <textarea
          className="w-full h-full min-h-[500px] bg-transparent text-text-body text-lg resize-none focus:outline-none placeholder:text-text-muted"
          placeholder="Write, press 'space' for AI, '/' for commands..."
          value={activeListId ? (docContents[activeListId] || '') : ''}
          onChange={(e) => activeListId && setDocContents({ ...docContents, [activeListId]: e.target.value })}
        />
      </div>
    </div>
  );
}
