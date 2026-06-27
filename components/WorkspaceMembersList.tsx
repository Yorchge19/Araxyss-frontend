'use client';

import { WorkspaceMember, WorkspaceRole } from '@/lib/services/workspaces';

import { Trash2 } from 'lucide-react';

const ROLE_LABELS: Record<WorkspaceRole, string> = {
  Owner: 'Propietario',
  Admin: 'Administrador',
  User: 'Usuario',
  Client: 'Cliente',
};

const ROLE_HINTS: Partial<Record<WorkspaceRole, string>> = {
  Owner: 'Nivel workspace',
  Admin: 'Nivel operativo',
  User: 'Nivel ejecución',
  Client: 'Portal de negocio',
};

interface WorkspaceMembersListProps {
  members: WorkspaceMember[];
  compact?: boolean;
  showYouBadge?: string;
  onRemoveMember?: (memberId: string) => void;
  canRemoveMember?: (member: WorkspaceMember) => boolean;
}

export function WorkspaceMembersList({
  members,
  compact = false,
  showYouBadge,
  onRemoveMember,
  canRemoveMember,
}: WorkspaceMembersListProps) {
  if (members.length === 0) {
    return (
      <p className="text-sm text-text-muted py-4 text-center">
        No hay miembros registrados en este workspace.
      </p>
    );
  }

  if (compact) {
    return (
      <ul className="divide-y divide-border">
        {members.map((member) => (
          <li key={member.uid} className="ui-list-row flex items-center justify-between py-3 px-2 rounded-lg">
            <div className="flex items-center min-w-0 gap-3">
              <img
                className="h-8 w-8 rounded-full border border-border shrink-0"
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=333333&color=fff`}
                alt=""
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-heading truncate flex items-center gap-2">
                  {member.name}
                  {showYouBadge === member.uid && (
                    <span className="text-[10px] bg-surface-hover text-text-muted px-1.5 py-0.5 rounded">
                      Tú
                    </span>
                  )}
                </p>
                <p className="text-xs text-text-muted truncate">{member.email}</p>
              </div>
            </div>
            <div className="flex items-center shrink-0 ml-2 gap-2">
              <span className="text-xs text-text-body">{ROLE_LABELS[member.role]}</span>
              {onRemoveMember && canRemoveMember && canRemoveMember(member) && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onRemoveMember(member.uid); }} 
                  className="text-error hover:bg-error-muted p-1.5 rounded transition-colors" 
                  title="Eliminar miembro"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface border-b border-border">
            <th className="p-4 text-xs font-medium text-text-muted uppercase">Miembro</th>
            <th className="p-4 text-xs font-medium text-text-muted uppercase">Rol</th>
            {onRemoveMember && <th className="p-4 w-16"></th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {members.map((member) => (
            <tr key={member.uid} className="ui-list-row">
              <td className="p-4">
                <div className="flex items-center space-x-3">
                  <img
                    className="h-8 w-8 rounded-full border border-border"
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=333333&color=fff`}
                    alt=""
                  />
                  <div>
                    <p className="text-sm font-medium text-text-heading flex items-center gap-2">
                      {member.name}
                      {showYouBadge === member.uid && (
                        <span className="text-[10px] bg-surface-hover text-text-muted px-1.5 py-0.5 rounded">
                          Tú
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-text-muted">{member.email}</p>
                  </div>
                </div>
              </td>
              <td className="p-4">
                <div className="flex flex-col">
                  <span className="text-sm text-text-body">{ROLE_LABELS[member.role]}</span>
                  {ROLE_HINTS[member.role] && (
                    <span className="text-[10px] text-text-muted">{ROLE_HINTS[member.role]}</span>
                  )}
                </div>
              </td>
              {onRemoveMember && (
                <td className="p-4 text-right">
                  {canRemoveMember && canRemoveMember(member) && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onRemoveMember(member.uid); }} 
                      className="text-error hover:bg-error-muted p-2 rounded transition-colors" 
                      title="Eliminar miembro"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { ROLE_LABELS };
