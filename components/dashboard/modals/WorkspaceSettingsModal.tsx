"use client";

import React, { useEffect, useState } from 'react';
import { X, Settings } from 'lucide-react';
import { useDashboard } from '@/components/providers/DashboardContext';
import { useAuthStore } from '@/hooks/use-auth';
import { WorkspaceMembersList } from '@/components/WorkspaceMembersList';
import { Workspace, WorkspaceMember, getWorkspaceMembers, removeWorkspaceMember } from '@/lib/services/workspaces';

interface WorkspaceSettingsModalProps {
  workspaceSettingsModal: Workspace;
  onClose: () => void;
}

export function WorkspaceSettingsModal({ workspaceSettingsModal, onClose }: WorkspaceSettingsModalProps) {
  const { workspace, userWorkspaces, teamMembers, setTeamMembers, isSuperAdmin } = useDashboard();
  const { user } = useAuthStore();

  const [modalMembers, setModalMembers] = useState<WorkspaceMember[]>([]);
  const [isLoadingModalMembers, setIsLoadingModalMembers] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingModalMembers(true);
    getWorkspaceMembers(workspaceSettingsModal)
      .then((members) => { if (!cancelled) setModalMembers(members); })
      .catch(() => { if (!cancelled) setModalMembers([]); })
      .finally(() => { if (!cancelled) setIsLoadingModalMembers(false); });
    return () => { cancelled = true; };
  }, [workspaceSettingsModal?.id, workspaceSettingsModal?.members, workspaceSettingsModal?.roles]);

  const canRemoveMember = (member: WorkspaceMember, workspaceId: string) => {
    const ws = userWorkspaces.find(w => w.id === workspaceId) || workspace;
    if (!ws) return false;
    if (member.uid === ws.ownerId) return false;
    if (isSuperAdmin) return true;
    const myRole = ws.roles?.[user?.uid || ''] || (user?.uid === ws.ownerId ? 'Owner' : 'User');
    return ['Owner', 'Admin'].includes(myRole);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (memberId === workspaceSettingsModal.ownerId) {
      alert('No se puede eliminar al propietario del workspace.');
      return;
    }
    if (confirm('¿Estás seguro de que deseas eliminar este usuario del workspace?')) {
      try {
        await removeWorkspaceMember(workspaceSettingsModal.id, memberId);
        if (workspace?.id === workspaceSettingsModal.id) {
          setTeamMembers((prev: WorkspaceMember[]) => prev.filter((m: WorkspaceMember) => m.uid !== memberId));
        }
        setModalMembers(prev => prev.filter(m => m.uid !== memberId));
      } catch (err: any) {
        console.error('Error al eliminar miembro:', err);
        alert(err.message || 'Error al eliminar miembro.');
      }
    }
  };

  return (
    <div className="ui-modal-overlay" onClick={onClose}>
      <div className="ui-modal-panel ui-modal-panel--md overflow-hidden flex flex-col relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-text-muted hover:text-white transition-all duration-300">
          <X size={20} />
        </button>

        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Settings size={20} className="mr-2 text-white" />
            Configuración del Espacio
          </h2>
          <p className="text-sm text-text-muted mt-1">{workspaceSettingsModal.name}</p>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-text-heading mb-2 flex items-center justify-between">
              <span>Miembros</span>
              <span className="text-xs font-normal text-text-muted">
                {modalMembers.length} {modalMembers.length === 1 ? 'persona' : 'personas'}
              </span>
            </h3>
            {isLoadingModalMembers ? (
              <div className="flex justify-center py-8">
                <div className="ui-spinner ui-spinner--sm" />
              </div>
            ) : (
              <WorkspaceMembersList
                members={modalMembers}
                compact
                showYouBadge={user?.uid}
                onRemoveMember={(id) => handleRemoveMember(id)}
                canRemoveMember={(member) => canRemoveMember(member, workspaceSettingsModal.id)}
              />
            )}
          </div>
          <div className="mb-6 pt-6 border-t border-border">
            <h3 className="text-sm font-bold text-text-heading mb-2">Portal de Negocio</h3>
            <p className="text-xs text-text-muted mb-4">
              Este espacio de trabajo tiene un Portal de Negocio vinculado. Puedes compartir este código temporal con tus clientes para que puedan ingresar y ver el avance del proyecto. El código expira automáticamente cada 24 horas por seguridad.
            </p>
            <div className="bg-canvas border border-border p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Código de Invitación al Portal</p>
                <p className="text-lg font-mono font-bold text-white">
                  {workspaceSettingsModal.businessInviteCode || 'No generado'}
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(workspaceSettingsModal.businessInviteCode || '');
                  alert('Código copiado al portapapeles');
                }}
                className="px-3 py-1.5 bg-surface hover:bg-surface-hover border border-border rounded text-xs text-white transition-all duration-300"
              >
                Copiar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
