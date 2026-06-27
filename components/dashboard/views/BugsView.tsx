"use client";

import React from 'react';
import { Flag } from 'lucide-react';
import { useDashboard } from '@/components/providers/DashboardContext';
import { useAuthStore } from '@/hooks/use-auth';
import { updateTicket } from '@/lib/services/tickets';

export function BugsView() {
  const { workspace, tickets, isSuperAdmin } = useDashboard();
  const { user } = useAuthStore();

  return (
    <div className="p-6 ui-view-enter flex-1 overflow-y-auto h-full flex flex-col bg-surface">
      <div className="flex items-center mb-6 border-b border-border pb-3">
        <Flag className="text-white mr-2" size={20} />
        <h2 className="text-lg font-semibold text-white">Reportes de Bugs</h2>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {tickets.filter(t => t.type === 'bug').length > 0 ? (
          tickets.filter(t => t.type === 'bug').map(ticket => {
            const canModify = workspace?.roles?.[user?.uid || ''] === 'Admin' || workspace?.roles?.[user?.uid || ''] === 'Owner' || isSuperAdmin;
            return (
              <div key={ticket.id} className="bg-surface border border-border rounded-xl p-5 flex flex-col md:flex-row md:items-start justify-between shadow-sm">
                <div className="flex-1 pr-4">
                  <h3 className="text-md font-bold text-white mb-2">{ticket.title}</h3>
                  <p className="text-sm text-text-muted mb-4 whitespace-pre-wrap">{ticket.description}</p>
                  <div className="text-xs text-text-muted flex items-center space-x-4">
                    <span>Reportado por: <strong>{ticket.reportedByName}</strong></span>
                    <span>Fecha: {ticket.createdAt ? new Date(ticket.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end w-48 shrink-0">
                  <span className="text-xs text-text-muted mb-1 font-semibold uppercase tracking-wider">Estado</span>
                  {canModify ? (
                    <select
                      value={ticket.status}
                      onChange={(e) => updateTicket(ticket.id, { status: e.target.value as any })}
                      className="w-full bg-surface border border-border text-sm text-white rounded-lg px-3 py-2 focus:outline-none focus:border-text-heading transition-all duration-300"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="revisado">Revisado</option>
                      <option value="corregido">Corregido</option>
                    </select>
                  ) : (
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                      ticket.status === 'pendiente' ? 'bg-white/10 text-white border-white/20' :
                      ticket.status === 'revisado' ? 'bg-surface-hover text-text-body border-border' :
                      'bg-text-heading/10 text-text-heading border-border'
                    }`}>
                      {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 text-text-muted">
            <Flag className="mx-auto text-text-muted mb-4" size={48} />
            <p className="text-lg">No hay bugs reportados en este espacio.</p>
            <p className="text-sm mt-2 text-text-muted">Los clientes pueden reportar problemas desde el Portal de Negocio.</p>
          </div>
        )}
      </div>
    </div>
  );
}
