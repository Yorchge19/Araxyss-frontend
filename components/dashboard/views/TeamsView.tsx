"use client";

import React from 'react';
import { Users, UserPlus } from 'lucide-react';
import { useDashboard } from '@/components/providers/DashboardContext';
import { useAuthStore } from '@/hooks/use-auth';
import { WorkspaceMembersList } from '@/components/WorkspaceMembersList';
import { WorkspaceMember } from '@/lib/services/workspaces';
import { removeWorkspaceMember } from '@/lib/services/workspaces';

interface TeamsViewProps {
  handleNavigation: (view: string) => void;
  isLoadingMembers: boolean;
  membersError: string;
}

export function TeamsView({ handleNavigation, isLoadingMembers, membersError }: TeamsViewProps) {
  const { workspace, userWorkspaces, teamMembers, setTeamMembers, isSuperAdmin } = useDashboard();
  const { user } = useAuthStore();

  const canRemoveMember = (member: WorkspaceMember, workspaceId: string) => {
    const ws = userWorkspaces.find(w => w.id === workspaceId) || workspace;
    if (!ws) return false;
    if (member.uid === ws.ownerId) return false;
    if (isSuperAdmin) return true;
    const myRole = ws.roles?.[user?.uid || ''] || (user?.uid === ws.ownerId ? 'Owner' : 'User');
    return ['Owner', 'Admin'].includes(myRole);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!workspace) return;
    const ws = workspace;
    if (memberId === ws.ownerId) {
      alert('No se puede eliminar al propietario del workspace.');
      return;
    }
    if (confirm('¿Estás seguro de que deseas eliminar este usuario del workspace?')) {
      try {
        await removeWorkspaceMember(workspace.id, memberId);
        setTeamMembers((prev: WorkspaceMember[]) => prev.filter((m: WorkspaceMember) => m.uid !== memberId));
      } catch (err: any) {
        console.error('Error al eliminar miembro:', err);
        alert(err.message || 'Error al eliminar miembro.');
      }
    }
  };

  return (
    <div className="p-6 ui-view-enter flex-1 overflow-y-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 border-b border-border pb-3">
        <div className="flex items-center">
          <Users className="text-text-heading mr-2" size={20} />
          <div>
            <h2 className="text-lg font-semibold text-text-heading">Miembros del workspace</h2>
            <p className="text-xs text-text-muted mt-0.5">
              {workspace?.name} · {teamMembers.length} {teamMembers.length === 1 ? 'miembro' : 'miembros'}
            </p>
          </div>
        </div>
        <button onClick={() => handleNavigation('invite')} className="bg-white text-black hover:bg-btn-primary-hover px-3 py-1.5 rounded text-sm transition-all duration-300 flex items-center">
          <UserPlus size={14} className="mr-2" /> Invitar miembros
        </button>
      </div>
      <div className="max-w-4xl w-full mx-auto">
        {membersError && (
          <div className="alert-error mb-4">{membersError}</div>
        )}
        {isLoadingMembers ? (
          <div className="flex justify-center py-16">
            <div className="ui-spinner ui-spinner--md" />
          </div>
        ) : (
          <WorkspaceMembersList
            members={teamMembers}
            showYouBadge={user?.uid}
            onRemoveMember={(id) => workspace && handleRemoveMember(id)}
            canRemoveMember={(member) => workspace ? canRemoveMember(member, workspace.id) : false}
          />
        )}
      </div>
    </div>
  );
}
