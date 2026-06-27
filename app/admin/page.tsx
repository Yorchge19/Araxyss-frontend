"use client";

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Zap, Layers, Briefcase, LayoutDashboard, Edit2, Trash2, SearchX, ShieldAlert, LogOut, Settings, Plus, UserX, ShieldCheck, Users } from 'lucide-react';
import { checkIsSuperAdmin, getAllWorkspaces, deleteWorkspace, updateWorkspaceName, getWorkspaceMembers, getWorkspaceMemberCount, Workspace, WorkspaceMember } from '@/lib/services/workspaces';
import { WorkspaceMembersList } from '@/components/WorkspaceMembersList';
import { Modal } from '@/components/ui/Modal';
import { LoadingScreen } from '@/components/ui/LoadingSpinner';
import { getAllSuperAdmins, addSuperAdminByEmail, removeSuperAdmin, syncMissingBusinessPortals, SuperAdminUser } from '@/lib/services/admin';

export default function AdminPage() {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [currentTab, setCurrentTab] = useState<'workspaces' | 'config'>('workspaces');
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Workspaces State
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(false);

  // Config State
  const [superAdmins, setSuperAdmins] = useState<SuperAdminUser[]>([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);

  const [membersModalWorkspace, setMembersModalWorkspace] = useState<Workspace | null>(null);
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  const openMembersModal = async (ws: Workspace) => {
    setMembersModalWorkspace(ws);
    setWorkspaceMembers([]);
    setIsLoadingMembers(true);
    try {
      const members = await getWorkspaceMembers(ws);
      setWorkspaceMembers(members);
    } catch (err: any) {
      setGlobalError(err.message);
      setMembersModalWorkspace(null);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    const checkAccess = async () => {
      if (user) {
        const isAdmin = await checkIsSuperAdmin(user.uid);
        setIsSuperAdmin(isAdmin);
        setIsChecking(false);
        if (!isAdmin) {
          router.push('/');
        } else {
          loadWorkspacesData();
        }
      }
    };

    checkAccess();
  }, [user, loading, router]);

  const loadWorkspacesData = async () => {
    setIsLoadingWorkspaces(true);
    try {
      const wks = await getAllWorkspaces();
      setWorkspaces(wks);
    } catch (err: any) {
      setGlobalError(err.message);
    } finally {
      setIsLoadingWorkspaces(false);
    }
  };

  const loadAdminsData = async () => {
    setIsLoadingAdmins(true);
    try {
      const admins = await getAllSuperAdmins();
      setSuperAdmins(admins);
    } catch (err: any) {
      setGlobalError(err.message);
    } finally {
      setIsLoadingAdmins(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      if (currentTab === 'workspaces') loadWorkspacesData();
      if (currentTab === 'config') loadAdminsData();
    }
  }, [currentTab, isSuperAdmin]);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) return;
    setIsAddingAdmin(true);
    setGlobalError(null);
    try {
      const newAdmin = await addSuperAdminByEmail(newAdminEmail);
      setSuperAdmins([...superAdmins, newAdmin]);
      setNewAdminEmail('');
      alert('Super Admin agregado exitosamente.');
    } catch (err: any) {
      setGlobalError(err.message);
    } finally {
      setIsAddingAdmin(false);
    }
  };

  const handleRemoveAdmin = async (uid: string, email: string) => {
    if (user && user.uid === uid) {
      alert("No puedes eliminar tus propios permisos desde aquí por seguridad.");
      return;
    }
    if (confirm(`¿Estás seguro de que deseas revocar los permisos de Super Admin a ${email}?`)) {
      try {
        await removeSuperAdmin(uid);
        setSuperAdmins(superAdmins.filter(a => a.uid !== uid));
      } catch (err: any) {
        setGlobalError(err.message);
      }
    }
  };

  if (loading || isChecking) {
    return <LoadingScreen />;
  }

  if (!isSuperAdmin) {
    return null; // Redirecting...
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col md:flex-row font-sans text-white">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-canvas border-r border-border flex flex-col shrink-0">
        <div className="p-6 border-b border-border">
          <div className="flex items-center text-white font-black text-xl tracking-tight mb-1">
            <Zap size={24} className="mr-2 fill-white" /> SUPER ADMIN
          </div>
          <p className="text-text-muted text-xs">Centro de Control Global</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setCurrentTab('workspaces')}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${currentTab === 'workspaces' ? 'bg-white/10 text-white font-semibold' : 'text-text-muted hover:bg-surface hover:text-white'}`}
          >
            <Layers size={18} className="mr-3" />
            Entornos Globales
          </button>
          <button 
            onClick={() => setCurrentTab('config')}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${currentTab === 'config' ? 'bg-white/10 text-white font-semibold' : 'text-text-muted hover:bg-surface hover:text-white'}`}
          >
            <Settings size={18} className="mr-3" />
            Configuración
          </button>
        </nav>

        <div className="p-4 border-t border-border">
          <button 
            onClick={() => router.push('/')}
            className="w-full flex items-center justify-center px-4 py-3 bg-surface hover:bg-surface text-text-muted hover:text-white rounded-xl transition-all duration-300 text-sm font-medium"
          >
            <LogOut size={16} className="mr-2" />
            Volver a la App
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10 relative">
        {globalError && (
          <div className="mb-6 bg-red-900/30 border border-white/20 rounded-xl p-4 flex items-start shadow-lg">
            <ShieldAlert className="text-white mt-0.5 mr-3 shrink-0" size={20} />
            <div className="flex-1">
              <h3 className="text-white font-semibold text-sm">Error en la operación</h3>
              <p className="text-text-muted text-sm mt-1">{globalError}</p>
            </div>
            <button onClick={() => setGlobalError(null)} className="text-white hover:text-white ml-4">
              <SearchX size={16} />
            </button>
          </div>
        )}

        {/* WORKSPACES TAB */}
        {currentTab === 'workspaces' && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <h2 className="text-4xl font-black tracking-tight text-white">Entornos Globales</h2>
                <p className="text-text-muted mt-2 text-sm max-w-xl leading-relaxed">
                  Administra todos los espacios de trabajo. Tienes acceso completo para visualizar, editar y eliminar.
                </p>
                <button
                  onClick={async () => {
                    if (confirm('Esto revisará todos los espacios y creará un Portal de Negocio para aquellos que no lo tengan. ¿Continuar?')) {
                      try {
                        const count = await syncMissingBusinessPortals();
                        alert(`Sincronización completa. Se crearon ${count} portales nuevos.`);
                      } catch (e: any) {
                        alert(e.message);
                      }
                    }
                  }}
                  className="mt-4 px-4 py-2 bg-surface hover:bg-surface border border-border text-xs font-semibold rounded-lg text-text-muted transition-all duration-300 flex items-center"
                >
                  <Briefcase size={14} className="mr-2 text-white" />
                  Generar Portales Faltantes
                </button>
              </div>
              <div className="flex space-x-4 bg-canvas border border-border rounded-2xl p-4 shadow-xl">
                <div className="flex flex-col">
                  <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider mb-1">Total Entornos</span>
                  <div className="flex items-end">
                    <span className="text-2xl font-bold text-white leading-none">{workspaces.length}</span>
                    <Layers size={14} className="text-white ml-2 mb-1" />
                  </div>
                </div>
              </div>
            </div>

            {isLoadingWorkspaces ? (
              <div className="flex justify-center items-center py-20">
                <div className="ui-spinner ui-spinner--md"></div>
              </div>
            ) : (
              <div className="bg-canvas border border-border rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="bg-canvas border-b border-border">
                        <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Workspace</th>
                        <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Miembros</th>
                        <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">ID de Entorno</th>
                        <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Acciones Globales</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {workspaces.map(ws => (
                        <tr key={ws.id} className="hover:bg-canvas transition-all duration-300 group">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-surface-hover to-canvas border border-border flex items-center justify-center text-white font-bold shadow-inner shrink-0">
                                {ws.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm text-white font-semibold">{ws.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              type="button"
                              onClick={() => openMembersModal(ws)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-text-body hover:bg-surface-hover hover:text-text-heading transition-all duration-200"
                              title="Ver miembros"
                            >
                              <Users size={14} />
                              {getWorkspaceMemberCount(ws)}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-canvas border border-border text-xs text-text-muted font-mono">
                              {ws.id}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end items-center space-x-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => {
                                  localStorage.setItem('superAdmin_overrideWorkspaceId', ws.id);
                                  localStorage.setItem('superAdmin_overrideView', 'dashboard');
                                  router.push('/');
                                }}
                                className="p-2 rounded-lg bg-surface hover:bg-white text-text-muted hover:text-black transition-all duration-200"
                                title="Entrar al Dashboard"
                              >
                                <LayoutDashboard size={16} />
                              </button>
                              <button 
                                onClick={() => {
                                  router.push(`/negocio/${ws.id}`);
                                }}
                                className="p-2 rounded-lg bg-surface hover:bg-white text-text-muted hover:text-black transition-all duration-200"
                                title="Entrar al Portal de Negocio"
                              >
                                <Briefcase size={16} />
                              </button>
                              <div className="w-px h-6 bg-surface-hover mx-1"></div>
                              <button 
                                onClick={async () => {
                                  const newName = prompt('Nuevo nombre para el workspace:', ws.name);
                                  if (newName && newName.trim() !== '' && newName !== ws.name) {
                                    try {
                                      await updateWorkspaceName(ws.id, newName.trim());
                                      setWorkspaces(prev => prev.map(w => w.id === ws.id ? { ...w, name: newName.trim() } : w));
                                    } catch (err: any) {
                                      setGlobalError(err.message);
                                    }
                                  }
                                }}
                                className="p-2 rounded-lg bg-surface hover:bg-surface-hover text-text-muted hover:text-white transition-all duration-200"
                                title="Editar Nombre"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={async () => {
                                  if (confirm(`⚠️ ATENCIÓN SUPER ADMIN\n\n¿Estás completamente seguro de que deseas eliminar permanentemente el workspace "${ws.name}"?\nEsta acción no se puede deshacer.`)) {
                                    try {
                                      await deleteWorkspace(ws.id);
                                      setWorkspaces(prev => prev.filter(w => w.id !== ws.id));
                                    } catch (err: any) {
                                      setGlobalError(err.message);
                                    }
                                  }
                                }}
                                className="p-2 rounded-lg bg-surface hover:bg-red-500/20 hover:text-white text-text-muted transition-all duration-200"
                                title="Eliminar Workspace"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {workspaces.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-16">
                            <div className="flex flex-col items-center justify-center text-center">
                              <SearchX size={24} className="text-border mb-4" />
                              <p className="text-text-muted text-sm">No hay workspaces registrados en la plataforma.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CONFIG TAB */}
        {currentTab === 'config' && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-4xl font-black tracking-tight mb-2 text-white">Administradores Globales</h2>
            <p className="text-text-muted text-sm max-w-xl leading-relaxed mb-8">
              Otorga o revoca permisos de Super Admin a otros usuarios registrados. Estos usuarios tendrán acceso total al sistema.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Formulario de Adición */}
              <div className="lg:col-span-1">
                <div className="bg-canvas border border-border rounded-3xl p-6 shadow-xl sticky top-6">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                    <ShieldCheck size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Nuevo Administrador</h3>
                  <p className="text-text-muted text-xs mb-6">
                    Ingresa el correo electrónico del usuario registrado para darle acceso total.
                  </p>
                  
                  <form onSubmit={handleAddAdmin}>
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                        Correo Electrónico
                      </label>
                      <input 
                        type="email" 
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        placeholder="usuario@ejemplo.com"
                        className="w-full bg-canvas border border-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-text-heading transition-all duration-300 placeholder:text-text-muted"
                        required
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={isAddingAdmin || !newAdminEmail}
                      className="w-full flex items-center justify-center px-4 py-3 bg-white hover:bg-btn-primary-hover disabled:bg-surface-hover disabled:text-text-muted text-black rounded-xl text-sm font-bold transition-all duration-300"
                    >
                      {isAddingAdmin ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Plus size={18} className="mr-2" /> Agregar Super Admin
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Lista de Admins */}
              <div className="lg:col-span-2">
                <div className="bg-canvas border border-border rounded-3xl overflow-hidden shadow-xl">
                  <div className="px-6 py-5 border-b border-border">
                    <h3 className="text-sm font-bold text-white">Administradores Activos ({superAdmins.length})</h3>
                  </div>
                  
                  {isLoadingAdmins ? (
                    <div className="flex justify-center items-center py-20">
                      <div className="ui-spinner ui-spinner--md"></div>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {superAdmins.map(admin => (
                        <div key={admin.uid} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-canvas transition-all duration-300 group">
                          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                            <div className="w-12 h-12 bg-gradient-to-tr from-surface-hover to-surface rounded-full border border-border flex items-center justify-center shrink-0">
                              <Zap size={20} className="text-white fill-white/20" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{admin.email}</p>
                              <p className="text-xs text-text-muted font-mono mt-1">ID: {admin.uid}</p>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => handleRemoveAdmin(admin.uid, admin.email)}
                            disabled={user?.uid === admin.uid}
                            className="flex items-center justify-center px-4 py-2 bg-surface hover:bg-red-500/20 text-text-muted hover:text-white disabled:opacity-50 disabled:hover:bg-surface disabled:hover:text-text-muted rounded-xl text-xs font-semibold transition-all duration-300"
                          >
                            <UserX size={14} className="mr-2" />
                            {user?.uid === admin.uid ? 'Tú (Activo)' : 'Revocar Permisos'}
                          </button>
                        </div>
                      ))}
                      {superAdmins.length === 0 && (
                        <div className="p-12 text-center text-text-muted text-sm">
                          No se pudieron cargar los administradores.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Modal
        open={!!membersModalWorkspace}
        onClose={() => setMembersModalWorkspace(null)}
        title="Miembros"
        subtitle={membersModalWorkspace?.name}
        size="md"
        panelClassName="max-h-[85vh]"
      >
        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          {isLoadingMembers ? (
            <div className="flex justify-center py-12">
              <div className="ui-spinner ui-spinner--md" />
            </div>
          ) : (
            <WorkspaceMembersList members={workspaceMembers} compact />
          )}
        </div>
      </Modal>
    </div>
  );
}
