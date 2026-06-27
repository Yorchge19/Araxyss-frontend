"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/use-auth';
import { checkIsSuperAdmin, getWorkspaceById, Workspace } from '@/lib/services/workspaces';
import { getBusinessPortal, BusinessPortal } from '@/lib/services/business_portal';
import { subscribeToTasks, Task } from '@/lib/services/tasks';
import { subscribeToTickets, createTicket, Ticket } from '@/lib/services/tickets';
import { Briefcase, Activity, CheckCircle, Clock, LayoutDashboard, LogOut, ArrowLeft, Flag, Send } from 'lucide-react';
import { LoadingScreen } from '@/components/ui/LoadingSpinner';

export default function BusinessPortalPage() {
  const { user, loading: authLoading } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  
  const [portalConfig, setPortalConfig] = useState<BusinessPortal | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [newBugTitle, setNewBugTitle] = useState('');
  const [newBugDesc, setNewBugDesc] = useState('');
  const [isSubmittingBug, setIsSubmittingBug] = useState(false);
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const checkAccess = async () => {
      if (!user) return;
      
      try {
        const isSuper = await checkIsSuperAdmin(user.uid);
        setIsSuperAdminUser(isSuper);

        const ws = await getWorkspaceById(workspaceId);
        if (!ws) {
          setAccessDenied(true);
          setIsLoading(false);
          return;
        }

        const role = ws.roles?.[user.uid] || null;
        setUserRole(role);

        // Access Rule: Super Admins OR Owners/Admins OR Clients
        if (!isSuper && !['Owner', 'Admin', 'Client'].includes(role || '')) {
          setAccessDenied(true);
          setIsLoading(false);
          return;
        }

        setWorkspace(ws);

        // Fetch portal config
        const portal = await getBusinessPortal(workspaceId);
        setPortalConfig(portal);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error verificando acceso al portal:', err);
        setAccessDenied(true);
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [user, authLoading, workspaceId, router]);

  useEffect(() => {
    if (workspace && !accessDenied) {
      const unsubscribeTasks = subscribeToTasks(workspace.id, (fetchedTasks) => {
        setTasks(fetchedTasks);
      }, (err) => {
        console.error('Error fetching tasks for portal:', err);
      });
      const unsubscribeTickets = subscribeToTickets(workspace.id, (fetchedTickets) => {
        setTickets(fetchedTickets);
      }, (err) => {
        console.error('Error fetching tickets for portal:', err);
      });
      return () => {
        unsubscribeTasks();
        unsubscribeTickets();
      };
    }
  }, [workspace, accessDenied]);

  const handleReportBug = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBugTitle.trim() || !workspace || !user) return;
    setIsSubmittingBug(true);
    try {
      await createTicket(workspace.id, {
        workspaceId: workspace.id,
        title: newBugTitle,
        description: newBugDesc,
        type: 'bug',
        priority: 'medium',
        status: 'pendiente',
        reportedBy: user.uid,
        reportedByName: user.displayName || user.email || 'Cliente'
      });
      setNewBugTitle('');
      setNewBugDesc('');
      alert('Bug reportado exitosamente');
    } catch (err) {
      console.error('Error reportando bug:', err);
      alert('Error al reportar el bug');
    } finally {
      setIsSubmittingBug(false);
    }
  };

  if (authLoading || isLoading) {
    return <LoadingScreen label="Cargando portal..." />;
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col justify-center items-center text-text-heading px-4 ui-auth-shell">
        <div className="icon-glow-box w-20 h-20 mb-6 shadow-xl">
          <Activity size={40} />
        </div>
        <h1 className="text-3xl font-bold mb-2 text-center">Acceso Denegado</h1>
        <p className="text-text-muted text-center max-w-md mb-8">
          No tienes los permisos necesarios para ver este Portal de Negocio. Si eres un cliente, asegúrate de haber ingresado con el código correcto.
        </p>
        <button 
          onClick={() => router.push('/')}
          className="px-6 py-3 bg-surface hover:bg-surface border border-border rounded-xl font-semibold transition-all duration-300"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  const completedTasks = tasks.filter(t => t.status === 'Done');
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress');
  const pendingTasks = tasks.filter(t => !['Done', 'In Progress'].includes(t.status));
  
  const totalTasks = tasks.length || 1; // avoid division by zero
  const progressPercent = Math.round((completedTasks.length / totalTasks) * 100);

  return (
    <div className="min-h-screen bg-canvas text-text-heading font-sans flex flex-col ui-view-enter">
      {/* Header */}
      <header className="border-b border-border bg-canvas px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          <div className="icon-glow-box w-12 h-12 shadow-lg">
            <Briefcase size={24} />
          </div>
          <div>
            <h1 className="font-extrabold text-xl text-white">{portalConfig?.name || `${workspace?.name} - Portal`}</h1>
            <p className="text-xs text-text-muted">Estado del Proyecto en Tiempo Real</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {(isSuperAdminUser || ['Owner', 'Admin'].includes(userRole || '')) ? (
            <button 
              onClick={() => router.push(isSuperAdminUser ? '/admin' : '/')}
              className="flex items-center px-4 py-2 bg-surface hover:bg-surface border border-border text-xs font-semibold rounded-lg text-text-muted hover:text-white transition-all duration-300"
            >
              <ArrowLeft size={14} className="mr-2" />
              Volver al Panel
            </button>
          ) : (
            <button 
              onClick={() => router.push('/')}
              className="flex items-center px-4 py-2 bg-surface hover:bg-surface border border-border text-xs font-semibold rounded-lg text-text-muted hover:text-white transition-all duration-300"
            >
              <LogOut size={14} className="mr-2" />
              Salir
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12 max-w-7xl mx-auto w-full">
        {/* Progreso General */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <Activity size={20} className="mr-2 text-white" />
            Progreso General
          </h2>
          <div className="card card-interactive rounded-3xl p-8 shadow-xl ui-view-enter">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Avance del Proyecto</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-black text-white">{progressPercent}%</span>
                  <span className="text-sm text-text-muted">completado</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-text-muted">{completedTasks.length} de {tasks.length} tareas terminadas</p>
              </div>
            </div>
            
            <div className="w-full bg-surface rounded-full h-4 overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-white to-gray-300 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${tasks.length === 0 ? 0 : progressPercent}%` }}
              ></div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-border">
              <div className="text-center">
                <p className="text-2xl font-bold text-white mb-1">{pendingTasks.length}</p>
                <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">Pendientes</p>
              </div>
              <div className="text-center border-l border-r border-border">
                <p className="text-2xl font-bold text-white mb-1">{inProgressTasks.length}</p>
                <p className="text-xs text-white/70 uppercase tracking-wider font-semibold">En Proceso</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-text-heading mb-1">{completedTasks.length}</p>
                <p className="text-xs text-success/70 uppercase tracking-wider font-semibold">Terminadas</p>
              </div>
            </div>
          </div>
        </section>

        {/* Listado de Tareas (Solo Lectura) */}
        <section>
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <LayoutDashboard size={20} className="mr-2 text-white" />
            Entregables y Tareas Activas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* En Proceso */}
            <div className="bg-canvas border border-border rounded-3xl p-6 shadow-lg">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center">
                <Clock size={16} className="mr-2" /> En Proceso
              </h3>
              <div className="space-y-3">
                {inProgressTasks.length > 0 ? inProgressTasks.map(task => (
                  <div key={task.id} className="card card-interactive rounded-xl p-4">
                    <h4 className="font-semibold text-white text-sm mb-1">{task.title}</h4>
                    {task.description && <p className="text-xs text-text-muted line-clamp-2 mb-3">{task.description}</p>}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] bg-white/10 text-white px-2 py-1 rounded-md font-medium">Trabajando ahora</span>
                      <span className="text-xs text-text-muted">{task.date}</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-text-muted text-center py-8 border border-dashed border-border rounded-xl">No hay tareas en proceso.</p>
                )}
              </div>
            </div>

            {/* Completadas Recientemente */}
            <div className="bg-canvas border border-border rounded-3xl p-6 shadow-lg opacity-80">
              <h3 className="text-sm font-bold text-text-heading uppercase tracking-wider mb-4 flex items-center">
                <CheckCircle size={16} className="mr-2" /> Completadas
              </h3>
              <div className="space-y-3">
                {completedTasks.length > 0 ? completedTasks.slice(0, 5).map(task => (
                  <div key={task.id} className="bg-surface border border-border rounded-xl p-4">
                    <h4 className="font-semibold text-text-muted text-sm mb-1 line-through decoration-text-muted">{task.title}</h4>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] bg-surface-hover text-text-heading px-2 py-1 rounded-md font-medium">Entregado</span>
                      <span className="text-xs text-text-muted">{task.date}</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-text-muted text-center py-8 border border-dashed border-border rounded-xl">Aún no hay tareas terminadas.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Reportar Bug y Lista de Bugs */}
        <section className="mt-12 mb-12">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <Flag size={20} className="mr-2 text-red-500" />
            Reporte de Bugs e Incidencias
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulario */}
            <div className="bg-canvas border border-border rounded-3xl p-6 shadow-lg">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Reportar Nuevo Bug</h3>
              <form onSubmit={handleReportBug} className="space-y-4">
                <div>
                  <label className="block text-xs text-text-muted mb-1">Título del Problema</label>
                  <input 
                    type="text" 
                    value={newBugTitle}
                    onChange={(e) => setNewBugTitle(e.target.value)}
                    required
                    className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:border-text-heading transition-all duration-300"
                    placeholder="Ej. El botón de pago no funciona"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1">Descripción Detallada</label>
                  <textarea 
                    value={newBugDesc}
                    onChange={(e) => setNewBugDesc(e.target.value)}
                    required
                    rows={4}
                    className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:border-text-heading transition-all duration-300 resize-none"
                    placeholder="Explica qué estabas haciendo y qué sucedió..."
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmittingBug || !newBugTitle.trim()}
                  className="flex items-center justify-center w-full bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 rounded-xl px-4 py-3 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} className="mr-2" />
                  {isSubmittingBug ? 'Enviando...' : 'Enviar Reporte'}
                </button>
              </form>
            </div>

            {/* Lista de bugs */}
            <div className="bg-canvas border border-border rounded-3xl p-6 shadow-lg">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Bugs Reportados</h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {tickets.filter(t => t.type === 'bug').length > 0 ? (
                  tickets.filter(t => t.type === 'bug').map(ticket => (
                    <div key={ticket.id} className="bg-surface border border-border rounded-xl p-4">
                      <h4 className="font-semibold text-white text-sm mb-1">{ticket.title}</h4>
                      <p className="text-xs text-text-muted line-clamp-2 mb-3">{ticket.description}</p>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] px-2 py-1 rounded-md font-medium ${
                          ticket.status === 'pendiente' ? 'bg-error-muted text-error' :
                          ticket.status === 'revisado' ? 'bg-surface-hover text-text-body' :
                          'bg-surface-hover text-text-heading'
                        }`}>
                          {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                        </span>
                        <span className="text-xs text-text-muted">
                          {ticket.createdAt ? new Date(ticket.createdAt.seconds * 1000).toLocaleDateString() : 'Nuevo'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-text-muted text-center py-8 border border-dashed border-border rounded-xl">No hay bugs reportados.</p>
                )}
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
