"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, Dispatch, SetStateAction } from 'react';
import { useAuthStore } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import {
  getUserWorkspaces,
  getWorkspaceById,
  checkIsSuperAdmin,
  refreshExpiredCodes,
  getWorkspaceMembers,
  Workspace,
  WorkspaceMember
} from '@/lib/services/workspaces';
import { getTasks, subscribeToTasks, Task } from '@/lib/services/tasks';
import { subscribeToChannels, subscribeToMessages, subscribeToReadStates, Channel, Message as ChatMessage } from '@/lib/services/chat';
import { subscribeToTickets, Ticket } from '@/lib/services/tickets';

interface SpaceItem {
  id: string;
  type: 'folder' | 'list' | 'doc' | 'dashboard' | 'whiteboard' | 'form';
  name: string;
  count?: number;
  parentId?: string | null;
}

interface DashboardContextValue {
  // Navigation & Views
  currentView: string;
  setCurrentView: Dispatch<SetStateAction<string>>;
  listMode: 'list' | 'board';
  setListMode: Dispatch<SetStateAction<'list' | 'board'>>;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: Dispatch<SetStateAction<boolean>>;
  isProfileOpen: boolean;
  setIsProfileOpen: Dispatch<SetStateAction<boolean>>;
  businessView: 'overview' | 'tickets' | 'new-ticket';
  setBusinessView: Dispatch<SetStateAction<'overview' | 'tickets' | 'new-ticket'>>;
  showGateway: boolean;
  setShowGateway: Dispatch<SetStateAction<boolean>>;
  isCheckingWorkspace: boolean;
  globalError: string | null;
  setGlobalError: Dispatch<SetStateAction<string | null>>;

  // Workspace
  workspace: Workspace | null;
  setWorkspace: Dispatch<SetStateAction<Workspace | null>>;
  userWorkspaces: Workspace[];
  setUserWorkspaces: Dispatch<SetStateAction<Workspace[]>>;
  isWorkspaceMenuOpen: boolean;
  setIsWorkspaceMenuOpen: Dispatch<SetStateAction<boolean>>;
  teamMembers: WorkspaceMember[];
  setTeamMembers: Dispatch<SetStateAction<WorkspaceMember[]>>;
  isSuperAdmin: boolean;

  // Chat
  currentChatId: string;
  setCurrentChatId: Dispatch<SetStateAction<string>>;
  channels: Channel[];
  chats: Record<string, any[]>;
  setChats: Dispatch<SetStateAction<Record<string, any[]>>>;
  messages: Record<string, ChatMessage[]>;
  readStates: Record<string, number>;
  chatInput: string;
  setChatInput: Dispatch<SetStateAction<string>>;
  isTyping: boolean;
  setIsTyping: Dispatch<SetStateAction<boolean>>;
  editingMessageId: string | null;
  setEditingMessageId: Dispatch<SetStateAction<string | null>>;
  editingMessageText: string;
  setEditingMessageText: Dispatch<SetStateAction<string>>;

  // Spaces & Items
  spaceItems: SpaceItem[];
  setSpaceItems: Dispatch<SetStateAction<SpaceItem[]>>;
  expandedSpaces: Record<string, boolean>;
  setExpandedSpaces: Dispatch<SetStateAction<Record<string, boolean>>>;
  expandedFolders: Record<string, boolean>;
  setExpandedFolders: Dispatch<SetStateAction<Record<string, boolean>>>;
  activeListId: string | null;
  setActiveListId: Dispatch<SetStateAction<string | null>>;
  isSpaceCreateMenuOpen: string | null;
  setIsSpaceCreateMenuOpen: Dispatch<SetStateAction<string | null>>;

  // Tasks & Tickets
  tasks: Task[];
  tickets: Ticket[];
}

const DashboardContext = createContext<DashboardContextValue | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  const [currentView, setCurrentView] = useState('dashboard');
  const [listMode, setListMode] = useState<'list' | 'board'>('list');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [businessView, setBusinessView] = useState<'overview' | 'tickets' | 'new-ticket'>('overview');
  const [showGateway, setShowGateway] = useState(false);
  const [isCheckingWorkspace, setIsCheckingWorkspace] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [userWorkspaces, setUserWorkspaces] = useState<Workspace[]>([]);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<WorkspaceMember[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const [currentChatId, setCurrentChatId] = useState('bot');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [chats, setChats] = useState<Record<string, any[]>>({});
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [readStates, setReadStates] = useState<Record<string, number>>({});
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingMessageText, setEditingMessageText] = useState('');

  const [spaceItems, setSpaceItems] = useState<SpaceItem[]>([
    { id: 'folder-1', type: 'folder', name: 'Product SaaS' },
    { id: 'project-1', type: 'list', name: 'Backlog', count: 3, parentId: 'folder-1' },
    { id: 'sprint-1', type: 'list', name: 'Sprint 24', count: 1, parentId: 'folder-1' },
    { id: 'doc-1', type: 'doc', name: 'Architecture Notes' }
  ]);
  const [expandedSpaces, setExpandedSpaces] = useState<Record<string, boolean>>({ 'team-space': true });
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({ 'folder-1': true });
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [isSpaceCreateMenuOpen, setIsSpaceCreateMenuOpen] = useState<string | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const workspaceLoadSeq = useRef(0);

  // Authentication check
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Load Workspaces on Mount
  useEffect(() => {
    if (loading) return;
    if (!user) {
      setIsCheckingWorkspace(false);
      return;
    }
    const seq = ++workspaceLoadSeq.current;
    setIsCheckingWorkspace(true);

    const load = async () => {
      try {
        const superAdminStatus = await checkIsSuperAdmin(user.uid);
        if (seq !== workspaceLoadSeq.current) return;
        setIsSuperAdmin(superAdminStatus);

        let wrks = await getUserWorkspaces(user.uid);
        if (seq !== workspaceLoadSeq.current) return;

        const overrideWorkspaceId = localStorage.getItem('superAdmin_overrideWorkspaceId');
        const overrideView = localStorage.getItem('superAdmin_overrideView');

        if (superAdminStatus && overrideWorkspaceId) {
          const overrideWs = await getWorkspaceById(overrideWorkspaceId);
          localStorage.removeItem('superAdmin_overrideWorkspaceId');
          localStorage.removeItem('superAdmin_overrideView');

          if (seq !== workspaceLoadSeq.current) return;

          if (overrideWs) {
            if (!wrks.find((w) => w.id === overrideWs.id)) {
              wrks = [overrideWs, ...wrks];
            }
            setUserWorkspaces(wrks);
            setWorkspace(overrideWs);
            if (overrideView) {
              setCurrentView(overrideView);
              setShowGateway(false);
            } else {
              setShowGateway(true);
            }
          } else {
            setUserWorkspaces(wrks);
            if (wrks.length > 0) setWorkspace(wrks[0]);
            setShowGateway(true);
          }
        } else {
          setUserWorkspaces(wrks);
          if (wrks.length > 0) setWorkspace(wrks[0]);
          setShowGateway(true);

          Promise.all(wrks.map((w) => refreshExpiredCodes(w)))
            .then((refreshed) => {
              if (seq === workspaceLoadSeq.current) setUserWorkspaces(refreshed);
            })
            .catch((err) => console.warn('No se pudieron refrescar códigos:', err));
        }
      } catch (error: any) {
        if (seq !== workspaceLoadSeq.current) return;
        setGlobalError(error?.message || 'Error loading workspaces.');
        setShowGateway(true);
      } finally {
        if (seq === workspaceLoadSeq.current) {
          setIsCheckingWorkspace(false);
        }
      }
    };
    load();
  }, [user, loading, router]);

  // Load Workspace Members
  useEffect(() => {
    if (!workspace) {
      setTeamMembers([]);
      return;
    }
    let cancelled = false;
    getWorkspaceMembers(workspace)
      .then((members) => {
        if (!cancelled) setTeamMembers(members);
      })
      .catch((err) => console.error(err));
    return () => { cancelled = true; };
  }, [workspace?.id, workspace?.members, workspace?.roles]);

  // Load Tasks
  useEffect(() => {
    if (!workspace) return;
    const unsub = subscribeToTasks(workspace.id, (loadedTasks) => setTasks(loadedTasks));
    return () => unsub();
  }, [workspace?.id]);

  // Load Tickets (Business View)
  useEffect(() => {
    if (!workspace) return;
    const unsub = subscribeToTickets(workspace.id, (loaded) => setTickets(loaded));
    return () => unsub();
  }, [workspace?.id]);

  // Load Channels
  useEffect(() => {
    if (!workspace) return;
    const unsub = subscribeToChannels(workspace.id, (loaded) => setChannels(loaded));
    return () => unsub();
  }, [workspace?.id]);

  // Load Messages
  useEffect(() => {
    if (!workspace) return;
    const unsubs: (() => void)[] = [];
    channels.forEach(channel => {
      const unsub = subscribeToMessages(channel.id, (msgs) => {
        setMessages(prev => ({ ...prev, [channel.id]: msgs }));
      });
      unsubs.push(unsub);
    });
    return () => { unsubs.forEach(u => u()); };
  }, [workspace?.id, channels]);

  // Load Read States
  useEffect(() => {
    if (!workspace || !user) return;
    const unsub = subscribeToReadStates(user.uid, (states) => {
      setReadStates(states);
    });
    return () => unsub();
  }, [workspace?.id, user?.uid]);

  const value = {
    currentView, setCurrentView,
    listMode, setListMode,
    isMobileMenuOpen, setIsMobileMenuOpen,
    isProfileOpen, setIsProfileOpen,
    businessView, setBusinessView,
    showGateway, setShowGateway,
    isCheckingWorkspace,
    globalError, setGlobalError,

    workspace, setWorkspace,
    userWorkspaces, setUserWorkspaces,
    isWorkspaceMenuOpen, setIsWorkspaceMenuOpen,
    teamMembers, setTeamMembers,
    isSuperAdmin,

    currentChatId, setCurrentChatId,
    channels, chats, setChats, messages, readStates,
    chatInput, setChatInput,
    isTyping, setIsTyping,
    editingMessageId, setEditingMessageId,
    editingMessageText, setEditingMessageText,

    spaceItems, setSpaceItems,
    expandedSpaces, setExpandedSpaces,
    expandedFolders, setExpandedFolders,
    activeListId, setActiveListId,
    isSpaceCreateMenuOpen, setIsSpaceCreateMenuOpen,

    tasks, tickets
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
