"use client";

import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { useAuthStore } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import {
  getUserWorkspaces,
  createWorkspace,
  joinWorkspaceByCode,
  updateWorkspaceName,
  getAccessibleBusinessPortals,
  Workspace,
} from '@/lib/services/workspaces';
import { createTask, Task } from '@/lib/services/tasks';
import { markChannelAsRead } from '@/lib/services/chat';

import { DashboardProvider, useDashboard } from '@/components/providers/DashboardContext';
import { GatewayScreen } from '@/components/dashboard/GatewayScreen';
import { OnboardingScreen } from '@/components/dashboard/OnboardingScreen';
import { AppSidebar } from '@/components/dashboard/sidebar/AppSidebar';
import { TaskModal } from '@/components/modals/TaskModal';
import { ChatView } from '@/components/dashboard/views/ChatView';
import { TaskBoardView } from '@/components/dashboard/views/TaskBoardView';

// Extracted components
import { GlobalErrorBanner } from '@/components/ui/GlobalErrorBanner';
import { TopNav } from '@/components/dashboard/nav/TopNav';
import { BusinessPortalView } from '@/components/dashboard/views/BusinessPortalView';
import { SpaceOverviewView } from '@/components/dashboard/views/SpaceOverviewView';
import { DocView } from '@/components/dashboard/views/DocView';
import { DashboardWidgetView } from '@/components/dashboard/views/DashboardWidgetView';
import { WhiteboardView } from '@/components/dashboard/views/WhiteboardView';
import { FormView } from '@/components/dashboard/views/FormView';
import { HomeView } from '@/components/dashboard/views/HomeView';
import { ProjectsView } from '@/components/dashboard/views/ProjectsView';
import { PlannerView } from '@/components/dashboard/views/PlannerView';
import { TeamsView } from '@/components/dashboard/views/TeamsView';
import { AgentsView } from '@/components/dashboard/views/AgentsView';
import { BugsView } from '@/components/dashboard/views/BugsView';
import { MoreView } from '@/components/dashboard/views/MoreView';
import { InviteView } from '@/components/dashboard/views/InviteView';
import { WorkspaceSettingsModal } from '@/components/dashboard/modals/WorkspaceSettingsModal';
import { CreateChannelModal } from '@/components/dashboard/modals/CreateChannelModal';

function DashboardContent() {
  const {
    currentView, setCurrentView,
    isMobileMenuOpen, setIsMobileMenuOpen,
    showGateway, setShowGateway,
    isCheckingWorkspace,
    workspace, setWorkspace,
    userWorkspaces, setUserWorkspaces,
    isSuperAdmin,
    currentChatId, setCurrentChatId,
    channels, readStates,
    activeListId,
    tasks, tickets
  } = useDashboard();

  const { user, loading } = useAuthStore();
  const router = useRouter();

  // Local state that doesn't need to be global
  const [docContents, setDocContents] = useState<Record<string, string>>({});
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [onboardingMode, setOnboardingMode] = useState<'decide' | 'create' | 'join-team' | 'join-business' | 'select-business-portal'>('decide');
  const [onboardingInput, setOnboardingInput] = useState('');
  const [isOnboardingAction, setIsOnboardingAction] = useState(false);
  const [onboardingError, setOnboardingError] = useState('');
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelType, setNewChannelType] = useState<'public' | 'dm'>('public');
  const [workspaceSettingsModal, setWorkspaceSettingsModal] = useState<Workspace | null>(null);

  // Task modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState('To Do');
  const [newTaskPriority, setNewTaskPriority] = useState('Normal');
  const [newTaskPoints, setNewTaskPoints] = useState('');
  const [newTaskTab, setNewTaskTab] = useState<'task' | 'doc' | 'reminder' | 'whiteboard' | 'dashboard'>('task');
  const [modalDropdown, setModalDropdown] = useState<'status' | 'assignee' | 'dueDate' | 'priority' | null>(null);
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [lastError, setLastError] = useState<string | null>(null);

  const ALL_STATUSES = ['Backlog', 'To Do', 'In Progress', 'Code Review', 'QA', 'Done'];
  const activeStatuses = workspace?.taskStatuses && workspace.taskStatuses.length > 0 ? workspace.taskStatuses : ['To Do'];

  // Auto-mark as read when messageCount updates
  useEffect(() => {
    if (user && currentChatId !== 'bot') {
      const activeChannel = channels.find(c => c.id === currentChatId);
      if (activeChannel && activeChannel.messageCount !== undefined) {
        const currentRead = readStates[activeChannel.id] || 0;
        if (activeChannel.messageCount > currentRead) {
          markChannelAsRead(user.uid, activeChannel.id, activeChannel.messageCount);
        }
      }
    }
  }, [currentChatId, channels, user, readStates]);

  const handleNavigation = (view: string) => {
    setCurrentView(view);
    if (window.innerWidth < 768) setIsMobileMenuOpen(false);
  };

  const openChat = (chatId: string) => {
    setCurrentChatId(chatId);
    handleNavigation('chat');
  };

  const openTaskModalWithStatus = (status?: string) => {
    if (status) setNewTaskStatus(status);
    setIsTaskModalOpen(true);
  };

  const openBusinessPortalFlow = () => {
    if (!user) return;
    const portals = getAccessibleBusinessPortals(userWorkspaces, user.uid, isSuperAdmin);
    if (portals.length === 1) {
      setShowGateway(false);
      setNeedsOnboarding(false);
      router.push(`/negocio/${portals[0].id}`);
      return;
    }
    if (portals.length > 1) {
      setShowGateway(false);
      setNeedsOnboarding(true);
      setOnboardingMode('select-business-portal');
      setOnboardingError('');
      return;
    }
    setShowGateway(false);
    setNeedsOnboarding(true);
    setOnboardingMode('join-business');
    setOnboardingInput('');
    setOnboardingError('');
  };

  const handleGatewayChoice = async (choice: 'workspace' | 'business' | 'super_admin') => {
    if (choice === 'super_admin') { setShowGateway(false); router.push('/admin'); return; }
    if (choice === 'workspace') {
      if (userWorkspaces.length === 0) { setNeedsOnboarding(true); setOnboardingMode('decide'); }
      setShowGateway(false);
    } else { openBusinessPortalFlow(); }
  };

  const handleJoinWorkspace = async () => {
    if (!joinCodeInput.trim() || !user) return;
    setIsJoining(true);
    setJoinError('');
    try {
      const newWorkspaceId = await joinWorkspaceByCode(joinCodeInput, user.uid);
      const workspaces = await getUserWorkspaces(user.uid);
      setUserWorkspaces(workspaces);
      const newWorkspace = workspaces.find(w => w.id === newWorkspaceId);
      if (newWorkspace) setWorkspace(newWorkspace);
      setJoinCodeInput('');
    } catch (error: any) {
      setJoinError(error.message || 'Error joining workspace');
    } finally {
      setIsJoining(false);
    }
  };

  const handleOnboardingAction = async () => {
    if (!user) return;
    setOnboardingError('');
    setIsOnboardingAction(true);
    try {
      if (onboardingMode === 'create') {
        if (!onboardingInput.trim()) throw new Error('Ingresa un nombre para el proyecto');
        const newW = await createWorkspace(onboardingInput.trim(), user.uid);
        setWorkspace(newW as Workspace);
        setUserWorkspaces([newW as Workspace]);
        setNeedsOnboarding(false);
      } else if (onboardingMode === 'join-team' || onboardingMode === 'join-business') {
        if (!onboardingInput.trim()) throw new Error('Ingresa un código de invitación');
        const joinedId = await joinWorkspaceByCode(onboardingInput.trim(), user.uid);
        if (onboardingMode === 'join-business') { router.push(`/negocio/${joinedId}`); return; }
        const wrks = await getUserWorkspaces(user.uid);
        const joinedW = wrks.find(w => w.id === joinedId);
        if (joinedW) { setWorkspace(joinedW); setUserWorkspaces(wrks); setNeedsOnboarding(false); }
      }
    } catch (error: any) {
      setOnboardingError(error.message || 'Código inválido o error');
    } finally {
      setIsOnboardingAction(false);
    }
  };

  const handleUpdateWorkspaceName = async (targetWs?: Workspace) => {
    const wsToUpdate = targetWs || workspace;
    if (!wsToUpdate || !user) return;
    if (wsToUpdate.roles?.[user.uid] !== 'Owner') { alert('Only the workspace owner can change its name.'); return; }
    const newName = prompt('Enter new workspace name:', wsToUpdate.name);
    if (newName && newName.trim() !== '' && newName !== wsToUpdate.name) {
      try {
        await updateWorkspaceName(wsToUpdate.id, newName.trim());
        if (workspace?.id === wsToUpdate.id) setWorkspace({ ...workspace, name: newName.trim() });
        setUserWorkspaces((prev: Workspace[]) => prev.map((w: Workspace) => w.id === wsToUpdate.id ? { ...w, name: newName.trim() } : w));
      } catch (err: any) { alert('Failed to update name: ' + err.message); }
    }
  };

  const handleCreateNewWorkspace = async () => {
    if (!user) return;
    const name = prompt('Nombre del nuevo Team Space (se creará un Portal asociado):');
    if (!name || !name.trim()) return;
    try {
      const newW = await createWorkspace(name.trim(), user.uid);
      const wrks = await getUserWorkspaces(user.uid);
      setUserWorkspaces(wrks);
      const created = wrks.find(w => w.id === newW.id);
      if (created) setWorkspace(created);
    } catch (err: any) { alert('Error creando espacio: ' + err.message); }
  };

  const handleCreateSpaceItem = (type: 'folder' | 'list' | 'doc' | 'dashboard' | 'whiteboard' | 'form') => {
    // This is handled by AppSidebar internally / DashboardContext
  };

  const handleCreateTask = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLastError(null);
    if (!workspace) { setLastError('Error: Workspace not found. Please log in again.'); return; }
    if (!newTaskTitle.trim()) { setLastError('Error: Task title required.'); return; }
    try {
      const taskData: any = {
        title: newTaskTitle, description: newTaskDescription, status: newTaskStatus,
        assigneeName: user?.displayName || 'Unknown', date: 'Today', priority: newTaskPriority,
        color: '7B61FF', completed: false, listId: activeListId || 'project-1'
      };
      if (user?.uid) taskData.assigneeId = user.uid;
      if (newTaskPoints) { const parsed = parseInt(newTaskPoints, 10); if (!isNaN(parsed)) taskData.points = parsed; }
      const cleanTaskData = Object.fromEntries(Object.entries(taskData).filter(([_, v]) => v !== undefined));
      await createTask(workspace.id, cleanTaskData as Omit<Task, 'id'>);
      setNewTaskTitle(''); setNewTaskDescription(''); setNewTaskStatus('To Do');
      setNewTaskPriority('Normal'); setNewTaskPoints(''); setNewTaskTab('task');
      setIsTaskModalOpen(false);
    } catch (err: any) {
      setLastError('Failed to create task: ' + (err.message || 'Unknown error'));
    }
  };

  const accessibleBusinessPortals = user ? getAccessibleBusinessPortals(userWorkspaces, user.uid, isSuperAdmin) : [];

  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-canvas text-white">Verificando sesión...</div>;
  if (!user) return null;
  if (isCheckingWorkspace) return <div className="h-screen w-screen flex items-center justify-center bg-canvas text-white">Preparando tu espacio...</div>;

  const isClientRole = workspace?.roles?.[user?.uid || ''] === 'Client';

  return (
    <>
      <GlobalErrorBanner />

      {showGateway && user && !loading && (
        <GatewayScreen user={user} isSuperAdmin={isSuperAdmin} handleGatewayChoice={handleGatewayChoice} />
      )}

      {needsOnboarding && !showGateway && (
        <OnboardingScreen
          user={user}
          isSuperAdmin={isSuperAdmin}
          onboardingMode={onboardingMode}
          setOnboardingMode={setOnboardingMode}
          setNeedsOnboarding={setNeedsOnboarding}
          setShowGateway={setShowGateway}
          accessibleBusinessPortals={accessibleBusinessPortals}
          onboardingInput={onboardingInput}
          setOnboardingInput={setOnboardingInput}
          onboardingError={onboardingError}
          setOnboardingError={setOnboardingError}
          isOnboardingAction={isOnboardingAction}
          handleOnboardingAction={handleOnboardingAction}
        />
      )}

      <div className="h-screen w-full overflow-hidden flex flex-col font-sans text-text-body bg-canvas antialiased">
        <TopNav
          joinCodeInput={joinCodeInput}
          setJoinCodeInput={setJoinCodeInput}
          isJoining={isJoining}
          joinError={joinError}
          handleJoinWorkspace={handleJoinWorkspace}
          openBusinessPortalFlow={openBusinessPortalFlow}
        />

        {isClientRole ? (
          <BusinessPortalView />
        ) : (
          <div className="flex flex-1 overflow-hidden relative">
            <AppSidebar
              handleNavigation={handleNavigation}
              openChat={openChat}
              handleCreateNewWorkspace={handleCreateNewWorkspace}
              handleUpdateWorkspaceName={handleUpdateWorkspaceName}
              handleCreateSpaceItem={handleCreateSpaceItem}
              setIsCreatingChannel={setIsCreatingChannel}
              setNewChannelType={setNewChannelType}
              setActiveSpaceId={() => {}}
              setWorkspaceSettingsModal={setWorkspaceSettingsModal}
            />

            <main className="flex-1 flex flex-col min-w-0 bg-canvas relative overflow-hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden absolute top-2 left-2 z-50 p-2 bg-surface rounded-md border border-border text-white">
                <Menu size={16} />
              </button>

              {currentView === 'list_view' && <TaskBoardView openTaskModalWithStatus={openTaskModalWithStatus} />}
              {currentView === 'space_overview' && <SpaceOverviewView />}
              {currentView === 'doc_view' && <DocView docContents={docContents} setDocContents={setDocContents} />}
              {currentView === 'dashboard_view' && <DashboardWidgetView />}
              {currentView === 'whiteboard_view' && <WhiteboardView />}
              {currentView === 'form_view' && <FormView />}
              {currentView === 'dashboard' && <HomeView />}
              {currentView === 'projects' && <ProjectsView openTaskModalWithStatus={openTaskModalWithStatus} />}
              {currentView === 'chat' && <ChatView />}
              {currentView === 'planner' && <PlannerView />}
              {currentView === 'teams' && <TeamsView handleNavigation={handleNavigation} isLoadingMembers={false} membersError="" />}
              {currentView === 'agents' && <AgentsView />}
              {currentView === 'bugs_view' && <BugsView />}
              {currentView === 'more' && <MoreView handleUpdateWorkspaceName={handleUpdateWorkspaceName} />}
              {currentView === 'invite' && <InviteView handleNavigation={handleNavigation} />}

              <TaskModal
                isTaskModalOpen={isTaskModalOpen}
                setIsTaskModalOpen={setIsTaskModalOpen}
                newTaskTab={newTaskTab}
                setNewTaskTab={setNewTaskTab}
                lastError={lastError}
                newTaskTitle={newTaskTitle}
                setNewTaskTitle={setNewTaskTitle}
                newTaskDescription={newTaskDescription}
                setNewTaskDescription={setNewTaskDescription}
                modalDropdown={modalDropdown}
                setModalDropdown={setModalDropdown as (val: string | null) => void}
                newTaskStatus={newTaskStatus}
                setNewTaskStatus={setNewTaskStatus}
                activeStatuses={activeStatuses}
                newTaskPriority={newTaskPriority}
                setNewTaskPriority={setNewTaskPriority}
                handleCreateTask={handleCreateTask}
              />
            </main>
          </div>
        )}
      </div>

      {workspaceSettingsModal && (
        <WorkspaceSettingsModal
          workspaceSettingsModal={workspaceSettingsModal}
          onClose={() => setWorkspaceSettingsModal(null)}
        />
      )}

      {isCreatingChannel && (
        <CreateChannelModal
          newChannelName={newChannelName}
          setNewChannelName={setNewChannelName}
          newChannelType={newChannelType}
          setIsCreatingChannel={setIsCreatingChannel}
          openChat={openChat}
        />
      )}
    </>
  );
}

export default function DashboardPage() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
