"use client";

import React, { useState } from 'react';
import { Plus, Tag, Briefcase, ChevronLeft, LayoutDashboard, Flag, Ban } from 'lucide-react';
import { useDashboard } from '@/components/providers/DashboardContext';
import { useAuthStore } from '@/hooks/use-auth';
import { createTicket, updateTicket } from '@/lib/services/tickets';

export function BusinessPortalView() {
  const { workspace, tasks, tickets, businessView, setBusinessView, setShowGateway, isSuperAdmin } = useDashboard();
  const { user } = useAuthStore();

  const [newTicketTitle, setNewTicketTitle] = useState('');
  const [newTicketDesc, setNewTicketDesc] = useState('');
  const [newTicketType, setNewTicketType] = useState<'bug' | 'incident' | 'feature' | 'question'>('bug');
  const [newTicketPriority, setNewTicketPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  const activeStatuses = workspace?.taskStatuses && workspace.taskStatuses.length > 0 ? workspace.taskStatuses : ['To Do'];

  return (
    <div className="flex flex-1 overflow-hidden relative bg-canvas">
      {/* Business Sidebar */}
      <aside className="w-56 bg-canvas border-r border-border flex-shrink-0 flex flex-col p-4">
        <div className="flex items-center mb-8">
          <div className="w-8 h-8 bg-text-muted rounded-lg flex items-center justify-center mr-3">
            <Briefcase size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white truncate">{workspace?.name}</h2>
            <p className="text-[10px] text-white uppercase font-semibold">Portal de Negocio</p>
          </div>
        </div>
        <nav className="space-y-1">
          <button onClick={() => setBusinessView('overview')} className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${businessView === 'overview' ? 'bg-white/10 text-white' : 'text-text-muted hover:bg-surface hover:text-white'}`}>
            <LayoutDashboard size={16} className="mr-3" /> Resumen
          </button>
          <button onClick={() => setBusinessView('tickets')} className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${businessView === 'tickets' ? 'bg-white/10 text-white' : 'text-text-muted hover:bg-surface hover:text-white'}`}>
            <Tag size={16} className="mr-3" /> Tickets
            {tickets.filter(t => t.status === 'pendiente').length > 0 && (
              <span className="ml-auto bg-white text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">{tickets.filter(t => t.status === 'pendiente').length}</span>
            )}
          </button>
          <button onClick={() => setBusinessView('new-ticket')} className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${businessView === 'new-ticket' ? 'bg-white/10 text-white' : 'text-text-muted hover:bg-surface hover:text-white'}`}>
            <Plus size={16} className="mr-3" /> Nuevo Ticket
          </button>
        </nav>
        <div className="mt-auto pt-4 border-t border-border">
          <button onClick={() => { setShowGateway(true); }} className="w-full flex items-center px-3 py-2 rounded-lg text-sm text-text-muted hover:text-white hover:bg-surface transition-all duration-300">
            <ChevronLeft size={16} className="mr-2" /> Volver al Inicio
          </button>
        </div>
      </aside>

      {/* Business Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* OVERVIEW */}
        {businessView === 'overview' && (
          <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-white mb-2">Resumen del Proyecto</h1>
            <p className="text-text-muted mb-8">Vista general del avance y estado de las tareas.</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-canvas border border-border rounded-xl p-5">
                <p className="text-xs text-text-muted mb-1 uppercase font-semibold">Total Tareas</p>
                <p className="text-3xl font-bold text-white">{tasks.length}</p>
              </div>
              <div className="bg-canvas border border-border rounded-xl p-5">
                <p className="text-xs text-text-muted mb-1 uppercase font-semibold">Completadas</p>
                <p className="text-3xl font-bold text-text-heading">{tasks.filter(t => t.status === 'Done' || t.completed).length}</p>
              </div>
              <div className="bg-canvas border border-border rounded-xl p-5">
                <p className="text-xs text-text-muted mb-1 uppercase font-semibold">En Progreso</p>
                <p className="text-3xl font-bold text-white">{tasks.filter(t => t.status === 'In Progress').length}</p>
              </div>
              <div className="bg-canvas border border-border rounded-xl p-5">
                <p className="text-xs text-text-muted mb-1 uppercase font-semibold">Tickets Abiertos</p>
                <p className="text-3xl font-bold text-white">{tickets.filter(t => t.status === 'pendiente' || t.status === 'revisado').length}</p>
              </div>
            </div>

            <div className="bg-canvas border border-border rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Progreso General</h2>
                <span className="text-2xl font-bold text-text-heading">{tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'Done' || t.completed).length / tasks.length) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-surface-hover rounded-full h-4 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-text-muted via-text-body to-text-heading transition-all duration-700" style={{ width: `${tasks.length > 0 ? (tasks.filter(t => t.status === 'Done' || t.completed).length / tasks.length) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div className="bg-canvas border border-border rounded-xl p-6 mb-8">
              <h2 className="text-lg font-bold text-white mb-4">Desglose por Estado</h2>
              <div className="space-y-3">
                {activeStatuses.map(status => {
                  const count = tasks.filter(t => t.status === status).length;
                  const pct = tasks.length > 0 ? (count / tasks.length) * 100 : 0;
                  const colors: Record<string, string> = { 'Done': 'bg-text-heading', 'In Progress': 'bg-text-muted', 'To Do': 'bg-gray-500', 'Backlog': 'bg-gray-700', 'Code Review': 'bg-text-muted', 'QA': 'bg-text-muted' };
                  return (
                    <div key={status} className="flex items-center">
                      <span className="text-sm text-text-body w-32 flex-shrink-0">{status}</span>
                      <div className="flex-1 bg-surface-hover rounded-full h-2.5 mx-4 overflow-hidden">
                        <div className={`h-full rounded-full ${colors[status] || 'bg-gray-500'} transition-all duration-500`} style={{ width: `${pct}%` }}></div>
                      </div>
                      <span className="text-sm font-bold text-white w-10 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-canvas border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Ultimos Tickets</h2>
                <button onClick={() => setBusinessView('tickets')} className="text-white hover:text-gray-300 text-sm font-medium">Ver todos →</button>
              </div>
              {tickets.length === 0 ? (
                <p className="text-text-muted text-sm">No hay tickets reportados aún.</p>
              ) : (
                <div className="space-y-2">
                  {tickets.slice(0, 5).map(ticket => (
                    <div key={ticket.id} className="flex items-center justify-between py-3 px-4 bg-surface rounded-lg">
                      <div className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-3 flex-shrink-0 ${ticket.priority === 'critical' ? 'bg-error' : ticket.priority === 'high' ? 'bg-text-muted' : ticket.priority === 'medium' ? 'bg-text-muted' : 'bg-gray-500'}`}></span>
                        <div>
                          <p className="text-sm text-white font-medium">{ticket.title}</p>
                          <p className="text-[10px] text-text-muted uppercase">{ticket.type} · {ticket.priority}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${ticket.status === 'pendiente' ? 'bg-surface-hover text-text-body' : ticket.status === 'revisado' ? 'bg-surface-hover text-text-heading' : ticket.status === 'corregido' ? 'bg-surface-hover text-text-heading' : 'bg-surface-hover text-text-muted'}`}>{ticket.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TICKETS LIST */}
        {businessView === 'tickets' && (
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white">Tickets</h1>
                <p className="text-text-muted text-sm">Historial de bugs, incidencias y solicitudes.</p>
              </div>
              <button onClick={() => setBusinessView('new-ticket')} className="bg-white hover:bg-btn-primary-hover text-black px-4 py-2 rounded-xl text-sm font-bold flex items-center transition-all duration-300 hover:scale-[1.02]">
                <Plus size={16} className="mr-2" /> Nuevo Ticket
              </button>
            </div>
            {tickets.length === 0 ? (
              <div className="text-center py-20">
                <Tag size={48} className="mx-auto text-border mb-4" />
                <p className="text-text-muted">No hay tickets aún. Crea el primero.</p>
              </div>
            ) : (
              <div className="bg-canvas border border-border rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-[10px] text-text-muted uppercase">
                      <th className="text-left p-4 font-semibold">Ticket</th>
                      <th className="text-left p-4 font-semibold">Tipo</th>
                      <th className="text-left p-4 font-semibold">Prioridad</th>
                      <th className="text-left p-4 font-semibold">Estado</th>
                      <th className="text-left p-4 font-semibold">Reportado por</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {tickets.map(ticket => (
                      <tr key={ticket.id} className="hover:bg-surface transition-all duration-300">
                        <td className="p-4">
                          <p className="text-sm font-medium text-white">{ticket.title}</p>
                          <p className="text-xs text-text-muted line-clamp-1 mt-0.5">{ticket.description}</p>
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${ticket.type === 'bug' ? 'bg-error-muted text-error' : ticket.type === 'incident' ? 'bg-surface-hover text-text-body' : ticket.type === 'feature' ? 'bg-white/10 text-white' : 'bg-surface-hover text-text-heading'}`}>{ticket.type}</span>
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${ticket.priority === 'critical' ? 'bg-error-muted text-error' : ticket.priority === 'high' ? 'bg-surface-hover text-text-body' : ticket.priority === 'medium' ? 'bg-surface-hover text-text-body' : 'bg-surface-hover text-text-muted'}`}>{ticket.priority}</span>
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${ticket.status === 'pendiente' ? 'bg-surface-hover text-text-body' : ticket.status === 'revisado' ? 'bg-surface-hover text-text-heading' : ticket.status === 'corregido' ? 'bg-surface-hover text-text-heading' : 'bg-surface-hover text-text-muted'}`}>{ticket.status}</span>
                        </td>
                        <td className="p-4 text-sm text-text-muted">{ticket.reportedByName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* NEW TICKET FORM */}
        {businessView === 'new-ticket' && (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-white mb-2">Reportar Incidencia</h1>
            <p className="text-text-muted mb-8">Describe el problema o solicitud. Nuestro equipo lo revisará.</p>
            <div className="bg-canvas border border-border rounded-xl p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-text-body mb-2">Título</label>
                <input
                  type="text"
                  value={newTicketTitle}
                  onChange={(e) => setNewTicketTitle(e.target.value)}
                  placeholder="Ej. Error al cargar la página de inicio"
                  className="w-full bg-canvas border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-text-heading transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-body mb-2">Descripción</label>
                <textarea
                  value={newTicketDesc}
                  onChange={(e) => setNewTicketDesc(e.target.value)}
                  placeholder="Describe el problema con el mayor detalle posible..."
                  rows={5}
                  className="w-full bg-canvas border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-text-heading resize-none transition-all duration-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text-body mb-2">Tipo</label>
                  <select value={newTicketType} onChange={(e) => setNewTicketType(e.target.value as any)} className="w-full bg-canvas border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-text-heading transition-all duration-300">
                    <option value="bug">Bug</option>
                    <option value="incident">Incidencia</option>
                    <option value="feature">Solicitud de Función</option>
                    <option value="question">Pregunta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-body mb-2">Prioridad</label>
                  <select value={newTicketPriority} onChange={(e) => setNewTicketPriority(e.target.value as any)} className="w-full bg-canvas border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-text-heading transition-all duration-300">
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="critical">Crítica</option>
                  </select>
                </div>
              </div>
              <button
                onClick={async () => {
                  if (!newTicketTitle.trim() || !newTicketDesc.trim() || !workspace || !user) return;
                  setIsSubmittingTicket(true);
                  try {
                    await createTicket(workspace.id, {
                      workspaceId: workspace.id,
                      title: newTicketTitle.trim(),
                      description: newTicketDesc.trim(),
                      type: newTicketType,
                      priority: newTicketPriority,
                      status: 'pendiente',
                      reportedBy: user.uid,
                      reportedByName: user.displayName || 'Cliente',
                    });
                    setNewTicketTitle('');
                    setNewTicketDesc('');
                    setNewTicketType('bug');
                    setNewTicketPriority('medium');
                    setBusinessView('tickets');
                  } catch (e) {
                    console.error('Error creating ticket', e);
                  } finally {
                    setIsSubmittingTicket(false);
                  }
                }}
                disabled={isSubmittingTicket || !newTicketTitle.trim() || !newTicketDesc.trim()}
                className="w-full bg-white hover:bg-btn-primary-hover text-black font-bold py-4 rounded-xl transition-all duration-300 disabled:opacity-50 text-lg"
              >
                {isSubmittingTicket ? 'Enviando...' : 'Enviar Ticket'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
