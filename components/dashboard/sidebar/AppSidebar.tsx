"use client";

import React from 'react';
import { 
  Home, CalendarCheck, Sparkles, Users, MoreHorizontal, UserPlus, 
  Plus, Compass, ListTodo, Settings, Edit2, CheckSquare, Folder, FolderOpen, FileText, Flag, SlidersHorizontal
} from 'lucide-react';
import { useDashboard } from '@/components/providers/DashboardContext';
import { Workspace, refreshExpiredCodes, getWorkspaceById } from '@/lib/services/workspaces';

interface AppSidebarProps {
  handleNavigation: (view: string) => void;
  openChat: (chatId: string) => void;
  handleCreateNewWorkspace: () => void;
  handleUpdateWorkspaceName: (ws: Workspace) => void;
  handleCreateSpaceItem: (type: 'folder' | 'list' | 'doc' | 'dashboard' | 'whiteboard' | 'form') => void;
  setIsCreatingChannel: (v: boolean) => void;
  setNewChannelType: (v: 'public' | 'dm') => void;
  setActiveSpaceId: (id: string | null) => void;
  setWorkspaceSettingsModal?: (ws: Workspace | null) => void;
}

export function AppSidebar({
  handleNavigation,
  openChat,
  handleCreateNewWorkspace,
  handleUpdateWorkspaceName,
  handleCreateSpaceItem,
  setIsCreatingChannel,
  setNewChannelType,
  setActiveSpaceId,
  setWorkspaceSettingsModal
}: AppSidebarProps) {
  const {
    currentView, setCurrentView,
    isMobileMenuOpen,
    workspace, setWorkspace,
    userWorkspaces, setUserWorkspaces,
    currentChatId,
    channels, readStates,
    spaceItems,
    expandedSpaces,
    expandedFolders, setExpandedFolders,
    activeListId, setActiveListId,
    isSpaceCreateMenuOpen, setIsSpaceCreateMenuOpen
  } = useDashboard();

  return (
    <>
      {/* Primary Sidebar */}
      <aside className="w-14 bg-canvas border-r border-border flex-shrink-0 flex flex-col items-center py-4 z-10 hidden md:flex">
        <div className="space-y-4 w-full flex flex-col items-center">
          <button 
            onClick={() => handleNavigation('dashboard')}
            className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center relative transition-all duration-300 ${['dashboard', 'projects'].includes(currentView) || (currentView === 'chat' && currentChatId !== 'bot') ? 'bg-surface-hover text-black' : 'text-text-muted hover:bg-surface-hover hover:text-white'}`}>
            <Home size={18} />
            <span className="text-[9px] mt-1 font-medium">Home</span>
          </button>
          <button 
            onClick={() => handleNavigation('planner')}
            className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${currentView === 'planner' ? 'bg-surface-hover text-black' : 'text-text-muted hover:bg-surface-hover hover:text-white'}`}>
            <CalendarCheck size={18} />
            <span className="text-[9px] mt-1">Planner</span>
          </button>
          <button 
            onClick={() => openChat('bot')}
            className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${currentView === 'chat' && currentChatId === 'bot' ? 'bg-surface-hover text-black' : 'text-text-muted hover:bg-surface-hover hover:text-white'}`}>
            <Sparkles size={18} />
            <span className="text-[9px] mt-1">AI</span>
          </button>
          <button 
            onClick={() => handleNavigation('teams')}
            className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${currentView === 'teams' ? 'bg-surface-hover text-black' : 'text-text-muted hover:bg-surface-hover hover:text-white'}`}>
            <Users size={18} />
            <span className="text-[9px] mt-1">Miembros</span>
          </button>
          <button 
            onClick={() => handleNavigation('more')}
            className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${currentView === 'more' ? 'bg-surface-hover text-black' : 'text-text-muted hover:bg-surface-hover hover:text-white'}`}>
            <MoreHorizontal size={18} />
            <span className="text-[9px] mt-1">More</span>
          </button>
        </div>
        <div className="mt-auto space-y-4 w-full flex flex-col items-center">
          <button onClick={() => handleNavigation('invite')} className={`w-10 h-10 rounded-full flex flex-col items-center justify-center transition-all duration-300 ${currentView === 'invite' ? 'bg-surface-hover text-black' : 'text-text-muted hover:bg-surface-hover hover:text-white'}`}>
            <UserPlus size={18} />
            <span className="text-[9px] mt-1">Invite</span>
          </button>
        </div>
      </aside>

      {/* Secondary Sidebar */}
      <aside className={`w-64 bg-surface border-r border-border flex-shrink-0 flex flex-col h-full z-10 transition-transform duration-300 absolute md:relative ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-3 border-b border-border flex justify-between items-center">
          <h2 className="font-semibold text-white text-sm">Home</h2>
          <button className="bg-white text-black hover:bg-btn-primary-hover text-xs font-medium px-2 py-1 rounded flex items-center transition-all duration-300">
            <Plus size={12} className="mr-1" /> Create
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-3">
          {/* Views Navigation */}
          <div className="px-2 mb-4 space-y-0.5">
            <button onClick={() => handleNavigation('dashboard')} className={`w-full text-left px-2 py-1.5 rounded-md flex items-center text-sm font-medium transition-all duration-300 ${currentView === 'dashboard' ? 'bg-surface-hover text-white' : 'text-text-body hover:bg-surface-hover'}`}>
              <Compass size={18} className={`mr-2 ${currentView === 'dashboard' ? 'text-black' : 'text-text-muted'}`} /> Overview
            </button>
            <button onClick={() => handleNavigation('projects')} className={`w-full text-left px-2 py-1.5 rounded-md flex items-center text-sm font-medium transition-all duration-300 ${currentView === 'projects' ? 'bg-surface-hover text-white' : 'text-text-body hover:bg-surface-hover'}`}>
              <ListTodo size={18} className={`mr-2 ${currentView === 'projects' ? 'text-black' : 'text-text-muted'}`} /> My Tasks
            </button>
          </div>

          {/* Spaces (Folders/Lists) */}
          <div className="mt-4">
            <div className="px-4 flex items-center justify-between group cursor-pointer mb-1 relative">
              <h2 className="text-xs font-semibold text-text-muted tracking-wide">Spaces</h2>
              <button title="Create Team Space" onClick={handleCreateNewWorkspace}>
                <Plus 
                  size={14} 
                  className="text-text-muted opacity-0 group-hover:opacity-100 hover:text-white transition-opacity" 
                />
              </button>
            </div>
            
            {/* Dynamic Team Spaces */}
            {userWorkspaces.map(ws => (
              <div key={ws.id} className="px-2 mt-2">
                <div className="relative">
                  <div className={`flex items-center justify-between group px-2 py-1 rounded-md cursor-pointer transition-all duration-300 ${workspace?.id === ws.id ? 'bg-surface-hover text-white' : 'text-text-body hover:bg-surface-hover'}`}
                       onClick={() => {
                         setCurrentView('space_overview');
                         setActiveSpaceId?.(ws.id);
                         setActiveListId(null);
                         setWorkspace(ws);
                       }}>
                    <div className="flex items-center truncate">
                      <div className={`rounded p-1 mr-2 flex-shrink-0 ${workspace?.id === ws.id ? 'bg-white text-black' : 'bg-surface-hover text-white'}`}>
                        <Users size={12} className="text-white" />
                      </div>
                      <span className="text-sm font-medium truncate">{ws.name}</span>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button title="Configuración del Space" onClick={async (e) => {
                          e.stopPropagation();
                          const latestWs = await getWorkspaceById(ws.id);
                          const refreshed = await refreshExpiredCodes(latestWs || ws);
                          setUserWorkspaces((prev: Workspace[]) => prev.map((w: Workspace) => w.id === refreshed.id ? refreshed : w));
                          if (workspace?.id === refreshed.id) setWorkspace(refreshed);
                          if (setWorkspaceSettingsModal) setWorkspaceSettingsModal(refreshed);
                        }}>
                        <Settings 
                          size={12} 
                          className="text-text-muted hover:text-white cursor-pointer mr-1" 
                        />
                      </button>
                      <button title="Renombrar Space" onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateWorkspaceName(ws);
                        }}>
                        <Edit2 
                          size={12} 
                          className="text-text-muted hover:text-white cursor-pointer mr-1" 
                        />
                      </button>
                      <Plus 
                        size={14} 
                        className="text-text-muted hover:text-white cursor-pointer" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsSpaceCreateMenuOpen(isSpaceCreateMenuOpen === ws.id ? null : ws.id);
                        }}
                      />
                    </div>
                  </div>
                  {isSpaceCreateMenuOpen === ws.id && (
                    <div className="absolute top-full left-0 mt-1 w-56 ui-dropdown z-50 py-2" onClick={e => e.stopPropagation()}>
                      <div className="px-3 py-1 mb-1 text-xs font-semibold text-text-muted tracking-wider uppercase">Create inside {ws.name}</div>
                      <button onClick={() => handleCreateSpaceItem('list')} className="w-full text-left px-3 py-2 hover:bg-surface-hover flex flex-col group transition-all duration-300">
                        <div className="flex items-center text-sm font-medium text-text-body group-hover:text-white"><CheckSquare size={16} className="mr-2 text-white" /> List</div>
                        <span className="text-[11px] text-text-muted ml-6 leading-tight mt-0.5">Track tasks, projects & more</span>
                      </button>
                      <button onClick={() => handleCreateSpaceItem('folder')} className="w-full text-left px-3 py-2 hover:bg-surface-hover flex flex-col group transition-all duration-300">
                        <div className="flex items-center text-sm font-medium text-text-body group-hover:text-white"><Folder size={16} className="mr-2 text-white" /> Folder</div>
                        <span className="text-[11px] text-text-muted ml-6 leading-tight mt-0.5">Group Lists, Docs & more</span>
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Space Items Rendered for Active Workspace */}
                {workspace?.id === ws.id && expandedSpaces['team-space'] && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l border-border pl-2">
                    {/* Render Folders First */}
                    {spaceItems.filter(item => item.type === 'folder').map(folder => (
                      <div key={folder.id}>
                        <div 
                          className="flex items-center group px-2 py-1 hover:bg-surface-hover rounded-md cursor-pointer"
                          onClick={() => setExpandedFolders((prev: Record<string, boolean>) => ({...prev, [folder.id]: !prev[folder.id]}))}
                        >
                          <FolderOpen size={14} className="mr-2 text-text-muted group-hover:text-white flex-shrink-0" />
                          <span className="text-sm font-medium text-text-body group-hover:text-white truncate">{folder.name}</span>
                        </div>
                        
                        {/* Render Children of this folder */}
                        {expandedFolders[folder.id] && (
                          <div className="ml-3 mt-1 space-y-0.5">
                            {spaceItems.filter(item => item.parentId === folder.id).map(child => (
                              <div 
                                key={child.id}
                                className={`flex items-center px-2 py-1.5 rounded-md cursor-pointer mt-1 ${(currentView === `${child.type}_view` && activeListId === child.id) ? 'bg-surface-hover text-white' : 'text-text-body hover:bg-surface-hover'}`}
                                onClick={() => {
                                  setCurrentView(`${child.type}_view`);
                                  setActiveListId(child.id);
                                  setActiveSpaceId?.(ws.id);
                                }}
                              >
                                {child.type === 'list' && <CheckSquare size={14} className={`mr-2 flex-shrink-0 ${(currentView === 'list_view' && activeListId === child.id) ? 'text-white' : 'text-text-muted'}`} />}
                                <span className="text-sm truncate">{child.name}</span>
                                {child.count !== undefined && (
                                  <span className="ml-auto text-xs text-text-muted flex-shrink-0">{child.count}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Render Top-Level Items (not folders, no parentId) */}
                    {spaceItems.filter(item => item.type !== 'folder' && !item.parentId).map(item => (
                      <div 
                        key={item.id}
                        className={`flex items-center px-2 py-1.5 rounded-md cursor-pointer mt-1 ${(currentView === `${item.type}_view` && activeListId === item.id) ? 'bg-surface-hover text-white' : 'text-text-body hover:bg-surface-hover'}`}
                        onClick={() => {
                          setCurrentView(`${item.type}_view`);
                          setActiveListId(item.id);
                          setActiveSpaceId?.(ws.id);
                        }}
                      >
                        {item.type === 'doc' && <FileText size={14} className={`mr-2 flex-shrink-0 ${(currentView === 'doc_view' && activeListId === item.id) ? 'text-white' : 'text-white'}`} />}
                        <span className="text-sm truncate">{item.name}</span>
                      </div>
                    ))}
                    
                    {/* Bugs view */}
                    <div 
                      className={`flex items-center px-2 py-1.5 rounded-md cursor-pointer mt-2 ${(currentView === 'bugs_view') ? 'bg-surface-hover text-white' : 'text-text-muted hover:bg-surface-hover hover:text-white'}`}
                      onClick={() => {
                        setCurrentView('bugs_view');
                        setActiveSpaceId?.(ws.id);
                      }}
                    >
                      <Flag size={14} className="mr-2 flex-shrink-0" />
                      <span className="text-sm truncate">Reportes de Bugs</span>
                    </div>
                  </div>
                )}
              </div>
          ))}
          </div>

          {/* Channels (Text chat) */}
          <div className="mt-6">
            <div className="px-4 flex items-center justify-between group cursor-pointer mb-1">
              <h2 className="text-xs font-semibold text-text-muted tracking-wide">Channels</h2>
              <Plus onClick={() => { setNewChannelType('public'); setIsCreatingChannel(true); }} size={14} className="text-text-muted opacity-0 group-hover:opacity-100 hover:text-white transition-opacity" />
            </div>
            <ul className="space-y-0.5 px-2">
              {channels.filter(c => c.type === 'public').map((channel) => {
                const unreadCount = Math.max(0, (channel.messageCount || 0) - (readStates[channel.id] || 0));
                const isUnread = unreadCount > 0 && currentChatId !== channel.id;
                return (
                <li key={channel.id}>
                  <button onClick={() => openChat(channel.id)} className={`w-full flex items-center px-2 py-1.5 rounded-md text-sm transition-all duration-300 truncate ${currentView === 'chat' && currentChatId === channel.id ? 'bg-surface-hover text-white' : 'text-text-body hover:bg-surface-hover hover:text-white'}`}>
                    <span className={`text-sm font-bold mr-2 ${currentView === 'chat' && currentChatId === channel.id ? 'text-white' : 'text-text-muted'}`}>#</span>
                    <span className={`truncate flex-1 text-left ${isUnread ? 'font-bold text-white' : ''}`}>{channel.name}</span>
                    {isUnread && (
                      <span className="bg-white text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ml-2">{unreadCount}</span>
                    )}
                  </button>
                </li>
              )})}
            </ul>
          </div>

          {/* Direct Messages */}
          <div className="mt-6">
            <div className="px-4 flex items-center justify-between group cursor-pointer mb-1">
              <h2 className="text-xs font-semibold text-text-muted tracking-wide">Direct Messages</h2>
              <Plus onClick={() => { setNewChannelType('dm'); setIsCreatingChannel(true); }} size={14} className="text-text-muted opacity-0 group-hover:opacity-100 hover:text-white transition-opacity" />
            </div>
            <ul className="space-y-0.5 px-2">
              {channels.filter(c => c.type === 'dm').map((channel) => {
                const unreadCount = Math.max(0, (channel.messageCount || 0) - (readStates[channel.id] || 0));
                const isUnread = unreadCount > 0 && currentChatId !== channel.id;
                return (
                <li key={channel.id}>
                  <button onClick={() => openChat(channel.id)} className={`w-full flex items-center px-2 py-1 rounded-md text-sm transition-all duration-300 ${currentView === 'chat' && currentChatId === channel.id ? 'bg-surface-hover text-white' : 'text-text-muted hover:bg-surface-hover hover:text-white'}`}>
                    <div className="relative mr-2 flex-shrink-0">
                      <div className="h-5 w-5 rounded bg-white/20 text-white flex items-center justify-center text-[10px] font-bold">
                        {channel.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 block h-2 w-2 rounded-full ring-1 ring-surface bg-text-heading"></span>
                    </div>
                    <span className={`truncate flex-1 text-left ${isUnread ? 'font-bold text-white' : ''}`}>{channel.name}</span>
                    {isUnread && (
                      <span className="bg-white text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ml-2">{unreadCount}</span>
                    )}
                  </button>
                </li>
              )})}
              <li>
                <button onClick={() => openChat('bot')} className={`w-full flex items-center px-2 py-1 rounded-md text-sm transition-all duration-300 ${currentView === 'chat' && currentChatId === 'bot' ? 'bg-surface-hover text-white' : 'text-text-muted hover:bg-surface-hover hover:text-white'}`}>
                  <div className="mr-2 flex items-center justify-center h-5 w-5 rounded bg-white text-black text-[10px]">
                    <Sparkles size={12} />
                  </div>
                  <span className="truncate">AI Assistant</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="p-3 border-t border-border text-xs text-text-muted text-center hover:text-white cursor-pointer transition-all duration-300 flex items-center justify-center">
          <SlidersHorizontal size={12} className="mr-1" /> Customize Sidebar
        </div>
      </aside>
    </>
  );
}
