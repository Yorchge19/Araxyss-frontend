"use client";

import React from 'react';
import { Presentation } from 'lucide-react';
import { useDashboard } from '@/components/providers/DashboardContext';
import Whiteboard from '@/app/components/Whiteboard';

export function WhiteboardView() {
  const { spaceItems, activeListId } = useDashboard();
  const activeItem = spaceItems.find(i => i.id === activeListId);

  return (
    <div className="flex-1 flex flex-col h-full bg-surface text-text-body relative overflow-hidden">
      <div className="flex-shrink-0 px-6 py-4 flex items-center justify-between border-b border-border">
        <div className="text-sm text-text-muted flex items-center">
          <Presentation size={14} className="mr-2 text-text-body" />
          {activeItem?.name || 'Whiteboard'}
        </div>
      </div>
      <div className="flex-1 overflow-hidden relative bg-surface">
        <Whiteboard id={activeListId || 'whiteboard-default'} />
      </div>
    </div>
  );
}
