"use client";

import React from 'react';
import { Search, ChevronDown, Check, Briefcase, Zap, LogOut } from 'lucide-react';
import { useDashboard } from '@/components/providers/DashboardContext';
import { useAuthStore } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { getWorkspaceMemberCount, getAccessibleBusinessPortals } from '@/lib/services/workspaces';
import { getUserWorkspaces, joinWorkspaceByCode, Workspace } from '@/lib/services/workspaces';

interface TopNavProps {
  joinCodeInput: string;
  setJoinCodeInput: (v: string) => void;
  isJoining: boolean;
  joinError: string;
  handleJoinWorkspace: () => void;
  openBusinessPortalFlow: () => void;
}

export function TopNav({
  joinCodeInput,
  setJoinCodeInput,
  isJoining,
  joinError,
  handleJoinWorkspace,
  openBusinessPortalFlow,
}: TopNavProps) {
  const {
    workspace, setWorkspace,
    userWorkspaces,
    isWorkspaceMenuOpen, setIsWorkspaceMenuOpen,
    isProfileOpen, setIsProfileOpen,
    isSuperAdmin,
  } = useDashboard();
  const { user } = useAuthStore();
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
    <nav className="bg-canvas border-b border-border flex items-center justify-between px-4 py-2 h-12 flex-shrink-0 z-20">
      {/* Left: Workspace Switcher */}
      <div className="flex items-center w-1/3 relative">
        <button
          onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
          className="flex items-center hover:bg-surface p-1.5 rounded-md transition-all duration-300"
        >
          <div className="w-6 h-6 bg-white text-black rounded flex items-center justify-center mr-2 shadow-sm">
            <span className="text-white font-bold text-xs">{workspace?.name.charAt(0) || 'W'}</span>
          </div>
          <span className="font-semibold text-sm tracking-wide text-white">{workspace?.name || 'Your Workspace'}</span>
          <ChevronDown size={12} className="ml-2 text-text-muted" />
        </button>

        {isWorkspaceMenuOpen && (
          <div className="absolute top-full left-0 mt-1 w-64 ui-dropdown py-1 z-50">
            <div className="px-3 py-2 border-b border-border text-xs font-semibold text-text-muted uppercase tracking-wider">
              Your Workspaces
            </div>
            {userWorkspaces.map(ws => (
              <button
                key={ws.id}
                onClick={() => { setWorkspace(ws); setIsWorkspaceMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-surface-hover flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-white text-black rounded flex items-center justify-center mr-2">
                    <span className="text-white font-bold text-[10px]">{ws.name.charAt(0)}</span>
                  </div>
                  <span className={workspace?.id === ws.id ? 'text-white font-medium' : 'text-text-body'}>
                    {ws.name}
                  </span>
                </div>
                <span className="text-[10px] text-text-muted ml-2 shrink-0">
                  {getWorkspaceMemberCount(ws)} miembros
                </span>
                {workspace?.id === ws.id && <Check size={14} className="text-white ml-1" />}
              </button>
            ))}

            <div className="px-3 py-2 border-t border-border">
              <p className="text-xs text-text-muted mb-1">Join via Code</p>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. 7BX9QA"
                  className="w-full px-2 py-1.5 bg-canvas border border-border rounded focus:outline-none focus:border-text-heading text-white text-xs uppercase"
                />
                <button
                  onClick={handleJoinWorkspace}
                  disabled={!joinCodeInput || isJoining}
                  className="bg-white text-black hover:bg-btn-primary-hover disabled:opacity-50 px-3 py-1.5 rounded text-xs transition-all duration-300"
                >
                  {isJoining ? '...' : 'Join'}
                </button>
              </div>
              {joinError && <p className="text-red-500 text-[10px] mt-1">{joinError}</p>}
            </div>
            <div className="px-3 py-2 border-t border-border">
              <button
                onClick={() => { setIsWorkspaceMenuOpen(false); openBusinessPortalFlow(); }}
                className="w-full flex items-center text-left text-sm text-white hover:text-gray-300 hover:bg-surface-hover px-2 py-2 rounded transition-all duration-300"
              >
                <Briefcase size={14} className="mr-2" /> Entrar a Portal de Negocio
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Center: Search */}
      <div className="flex justify-center w-1/3">
        <div className="relative w-full max-w-lg hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={14} className="text-text-muted" />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-1.5 bg-canvas border border-border rounded-md text-xs text-white placeholder:text-text-muted focus:outline-none focus:border-text-heading transition-all duration-300"
            placeholder="Search (Ctrl K)"
          />
        </div>
      </div>

      {/* Right: Profile */}
      <div className="flex justify-end items-center w-1/3 space-x-3">
        <div className="relative ml-2">
          <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="focus:outline-none flex items-center">
            <img
              className="h-6 w-6 rounded-full object-cover border border-border"
              src={`https://ui-avatars.com/api/?name=${user?.displayName || 'User'}&background=333333&color=fff`}
              alt="Profile"
            />
            <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full ring-2 ring-canvas bg-text-heading"></span>
          </button>
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 ui-dropdown py-1 z-50">
              <div className="px-4 py-2 border-b border-border">
                <p className="text-sm text-white font-medium truncate">{user?.displayName || 'User'}</p>
                <p className="text-xs text-text-muted truncate">{user?.email}</p>
              </div>
              {isSuperAdmin && (
                <button
                  onClick={() => { setIsProfileOpen(false); router.push('/admin'); }}
                  className="w-full text-left px-4 py-2 text-sm text-text-heading hover:bg-surface-hover flex items-center font-bold"
                >
                  <Zap size={14} className="mr-2" /> Super Admin Panel
                </button>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-text-body hover:bg-surface-hover flex items-center"
              >
                <LogOut size={14} className="mr-2" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
