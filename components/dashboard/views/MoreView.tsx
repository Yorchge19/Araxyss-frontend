"use client";

import React from 'react';
import { MoreHorizontal, ChevronRight, LogOut } from 'lucide-react';
import { useAuthStore } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useDashboard } from '@/components/providers/DashboardContext';

interface MoreViewProps {
  handleUpdateWorkspaceName: () => void;
}

export function MoreView({ handleUpdateWorkspaceName }: MoreViewProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <div className="p-6 ui-view-enter flex-1 overflow-y-auto h-full flex flex-col">
      <div className="flex items-center mb-6 border-b border-border pb-3">
        <MoreHorizontal className="text-gray-400 mr-2" size={20} />
        <h2 className="text-lg font-semibold text-white">More Options</h2>
      </div>
      <div className="max-w-2xl">
        <div className="space-y-2">
          <button
            onClick={handleUpdateWorkspaceName}
            className="w-full text-left bg-surface hover:bg-surface-hover border border-border rounded-lg p-4 transition-all duration-300 flex items-center justify-between"
          >
            <div>
              <div className="font-medium text-white text-sm">Workspace Settings</div>
              <div className="text-xs text-text-muted mt-0.5">Change workspace name</div>
            </div>
            <ChevronRight size={16} className="text-text-muted" />
          </button>
          <button className="w-full text-left bg-surface hover:bg-surface-hover border border-border rounded-lg p-4 transition-all duration-300 flex items-center justify-between">
            <div>
              <div className="font-medium text-white text-sm">Integrations</div>
              <div className="text-xs text-text-muted mt-0.5">Connect GitHub, Slack, etc.</div>
            </div>
            <ChevronRight size={16} className="text-text-muted" />
          </button>
          <button onClick={handleLogout} className="w-full text-left bg-surface/50 hover:bg-red-500/10 border border-border hover:border-text-heading/20 rounded-lg p-4 transition-all duration-300 flex items-center justify-between">
            <div>
              <div className="font-medium text-red-500 text-sm">Sign Out</div>
              <div className="text-xs text-white/70 mt-0.5">Log out of your account</div>
            </div>
            <LogOut size={16} className="text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
