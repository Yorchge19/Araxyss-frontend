"use client";

import React, { useState } from 'react';
import { UserPlus, Link as LinkIcon } from 'lucide-react';
import { useDashboard } from '@/components/providers/DashboardContext';
import { useAuthStore } from '@/hooks/use-auth';
import { generateNewInviteCode } from '@/lib/services/workspaces';

interface InviteViewProps {
  handleNavigation: (view: string) => void;
}

export function InviteView({ handleNavigation }: InviteViewProps) {
  const { workspace, setWorkspace, setUserWorkspaces } = useDashboard();
  const { user } = useAuthStore();

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'User'>('User');
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  const handleSendInvite = () => {
    if (!inviteEmail.trim()) return;
    setInviteStatus('sending');
    setTimeout(() => {
      setInviteStatus('sent');
      setInviteEmail('');
      setInviteRole('User');
      setTimeout(() => {
        setInviteStatus('idle');
        handleNavigation('teams');
      }, 1500);
    }, 1000);
  };

  const handleGenerateNewCode = async () => {
    if (!workspace) return;
    setIsGeneratingCode(true);
    try {
      const newCode = await generateNewInviteCode(workspace.id, workspace.name, workspace.inviteCode);
      setWorkspace({ ...workspace, inviteCode: newCode });
      setUserWorkspaces((prev: any[]) => prev.map((w: any) => w.id === workspace.id ? { ...w, inviteCode: newCode } : w));
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  return (
    <div className="p-6 ui-view-enter flex-1 overflow-y-auto h-full flex flex-col items-center justify-center">
      <div className="bg-surface border border-border rounded-xl p-8 max-w-md w-full text-center shadow-lg">
        <UserPlus size={40} className="mx-auto text-white mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Invite to Workspace</h2>
        <p className="text-sm text-text-muted mb-6">Invite your teammates to collaborate in {workspace?.name || 'this workspace'}.</p>

        <div className="text-left mb-4">
          <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wide">Email Address</label>
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@company.com"
            className="w-full px-3 py-2 bg-canvas border border-border rounded focus:outline-none focus:border-text-heading text-white text-sm mb-4"
          />

          <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wide">Role</label>
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as 'Admin' | 'User')}
            className="w-full px-3 py-2 bg-canvas border border-border rounded focus:outline-none focus:border-text-heading text-white text-sm mb-2"
          >
            <option value="User">User</option>
            <option value="Admin">Admin</option>
          </select>

          <div className="text-xs text-text-muted p-3 bg-surface rounded border border-border">
            {inviteRole === 'Admin' ? (
              <p><strong className="text-white">Admin (Operational Level)</strong>: Líderes de equipo o Scrum Masters. Pueden invitar a otros miembros, estructurar proyectos y asignar roles. Limitados a este Workspace.</p>
            ) : (
              <p><strong className="text-white">User (Execution Level)</strong>: Colaboradores regulares. Pueden ejecutar tareas, reportar progreso y colaborar en los proyectos a los que son invitados.</p>
            )}
          </div>
        </div>

        <button
          onClick={handleSendInvite}
          disabled={inviteStatus !== 'idle'}
          className={`w-full font-bold py-2 px-4 rounded text-sm transition-all duration-300 mb-4 ${inviteStatus === 'idle' ? 'bg-white text-black hover:bg-btn-primary-hover' : inviteStatus === 'sending' ? 'bg-text-muted cursor-not-allowed text-white' : 'bg-text-heading text-white'}`}
        >
          {inviteStatus === 'idle' && 'Send Invitation'}
          {inviteStatus === 'sending' && 'Sending...'}
          {inviteStatus === 'sent' && 'Sent!'}
        </button>

        <div className="flex items-center text-text-muted text-xs before:flex-1 before:border-t before:border-border before:mr-3 after:flex-1 after:border-t after:border-border after:ml-3">or</div>

        <div className="mt-4 bg-surface border border-border rounded p-4 text-center">
          <p className="text-xs text-text-muted mb-2 uppercase tracking-wide">Workspace Invite Code</p>
          {workspace?.inviteCode ? (
            <div className="flex items-center justify-between bg-canvas border border-border rounded p-2">
              <span className="text-lg font-mono font-bold text-white tracking-widest">{workspace.inviteCode}</span>
              <button
                onClick={() => navigator.clipboard.writeText(workspace.inviteCode || '')}
                className="p-1.5 bg-surface-hover hover:bg-surface-hover rounded text-white transition-all duration-300"
                title="Copy Code"
              >
                <LinkIcon size={14} />
              </button>
            </div>
          ) : (
            <p className="text-sm text-text-muted italic">No active invite code.</p>
          )}
          {workspace?.roles?.[user?.uid || ''] !== 'User' && (
            <button
              onClick={handleGenerateNewCode}
              disabled={isGeneratingCode}
              className="mt-3 text-[11px] text-text-muted hover:text-white transition-all duration-300 underline decoration-dotted underline-offset-2"
            >
              {isGeneratingCode ? 'Generating...' : 'Generate New Code'}
            </button>
          )}
        </div>

        {workspace?.roles?.[user?.uid || ''] === 'Owner' && (
          <div className="mt-4 bg-surface border border-border rounded p-4 text-center">
            <p className="text-xs text-white mb-2 uppercase tracking-wide font-semibold">Código de Negocio (Clientes)</p>
            {workspace?.businessInviteCode ? (
              <div className="flex items-center justify-between bg-canvas border border-border rounded p-2">
                <span className="text-lg font-mono font-bold text-white tracking-widest">{workspace.businessInviteCode}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(workspace.businessInviteCode || '')}
                  className="p-1.5 bg-surface-hover hover:bg-surface-hover rounded text-white transition-all duration-300"
                  title="Copiar Código"
                >
                  <LinkIcon size={14} />
                </button>
              </div>
            ) : (
              <p className="text-sm text-text-muted italic">Sin código de negocio activo.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
