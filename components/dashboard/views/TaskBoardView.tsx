"use client";

import React, { useState } from 'react';
import { 
  Users, Star, Sparkles, Share2, List as ListIconComponent, Columns, Plus, 
  ChevronDown, CheckCircle2, Check, MoreHorizontal, Search, ArrowRightLeft, FileText, CalendarCheck, CheckSquare 
} from 'lucide-react';
import { useDashboard } from '@/components/providers/DashboardContext';
import { Workspace } from '@/lib/services/workspaces';
import { updateTask } from '@/lib/services/tasks';
// Assuming addWorkspaceTaskStatus is available from workspaces service
import { addWorkspaceTaskStatus } from '@/lib/services/workspaces';

interface TaskBoardViewProps {
  openTaskModalWithStatus: (status?: string) => void;
}

export function TaskBoardView({ openTaskModalWithStatus }: TaskBoardViewProps) {
  const {
    workspace, setWorkspace,
    userWorkspaces, setUserWorkspaces,
    tasks,
    activeListId,
    spaceItems,
    listMode, setListMode
  } = useDashboard();

  const [isAddingStatus, setIsAddingStatus] = useState(false);

  const activeStatuses = workspace?.taskStatuses || ['To Do', 'In Progress', 'Done'];
  const availableStatuses = ['Backlog', 'Code Review', 'QA'].filter(s => !activeStatuses.includes(s));

  const toggleTask = (taskId: string, currentCompleted?: boolean) => {
    if (!workspace) return;
    updateTask(workspace.id, taskId, { 
      completed: !currentCompleted,
      status: !currentCompleted ? 'Done' : 'To Do'
    });
  };

  const handleAddStatus = async (status: string) => {
    if (!workspace) return;
    try {
      await addWorkspaceTaskStatus(workspace.id, status);
      const newStatuses = [...(workspace.taskStatuses || ['To Do']), status];
      setWorkspace({ ...workspace, taskStatuses: newStatuses });
      setUserWorkspaces((prev: Workspace[]) => prev.map((w: Workspace) => w.id === workspace.id ? { ...w, taskStatuses: newStatuses } : w));
      setIsAddingStatus(false);
    } catch (e) {
      console.error('Failed to add status', e);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-surface text-text-body relative overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="flex flex-col">
            <div className="text-sm text-text-muted flex items-center">
              <Users size={14} className="mr-1" /> Team Space 
              <span className="mx-1">/</span>
              {spaceItems.find(i => i.id === activeListId)?.name || 'List View'}
              <Star size={14} className="ml-2 text-text-muted hover:text-text-body cursor-pointer" />
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center px-2 py-1 text-sm bg-white text-black rounded">Agents</button>
          <button className="flex items-center px-2 py-1 text-sm"><Sparkles size={14} className="mr-1 text-white" /> Ask AI</button>
          <button className="flex items-center px-2 py-1 text-sm"><Share2 size={14} className="mr-1" /> Share</button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex-shrink-0 px-6 py-2 flex items-center justify-between border-b border-border text-sm">
        <div className="flex items-center space-x-4">
          <button onClick={() => setListMode('list')} className={`flex items-center pb-1 ${listMode === 'list' ? 'font-semibold text-white border-b-2 border-white' : 'text-text-muted hover:text-white'}`}><ListIconComponent size={14} className="mr-1" /> List</button>
          <button onClick={() => setListMode('board')} className={`flex items-center pb-1 ${listMode === 'board' ? 'font-semibold text-white border-b-2 border-white' : 'text-text-muted hover:text-white'}`}><Columns size={14} className="mr-1" /> Board</button>
          <button className="flex items-center text-text-muted hover:text-white pb-1"><Plus size={14} className="mr-1" /> View</button>
        </div>
      </div>
      
      {/* List Content and Sidebar */}
      <div className="flex-1 flex overflow-hidden w-full">
        {/* Task List */}
        {listMode === 'list' && (
          <div className="flex-1 p-6 overflow-y-auto w-full">
            <div className="grid grid-cols-[30px_minmax(200px,1fr)_120px_100px_120px] gap-2 items-center text-xs font-semibold text-text-muted py-2 border-b border-border mb-4">
              <div></div>
              <div>Name</div>
              <div>Status</div>
              <div>Assignee</div>
              <div>Due date</div>
            </div>

            {activeStatuses.map(statusGroup => {
              const listTasks = tasks.filter(t => t.listId === activeListId || (!t.listId && activeListId === 'project-1'));
              const groupTasks = listTasks.filter(t => t.status === statusGroup);
              
              const statusColors: Record<string, string> = {
                'Backlog': 'bg-surface text-text-muted',
                'To Do': 'bg-surface text-text-muted',
                'In Progress': 'bg-surface-hover text-text-heading',
                'Code Review': 'bg-white/20 text-white',
                'QA': 'bg-text-muted/20 text-white',
                'Done': 'bg-text-heading/20 text-text-heading'
              };

              return (
                <div key={statusGroup} className="mb-6">
                  <div className="flex items-center text-sm font-medium text-white mb-2 group cursor-pointer w-fit">
                    <ChevronDown size={14} className="mr-1 text-text-muted group-hover:text-white" />
                    <div className={`flex items-center border border-border px-2 py-0.5 rounded text-[10px] items-center mr-2 ${statusColors[statusGroup]}`}>
                      <CheckCircle2 size={10} className="mr-1" /> {statusGroup.toUpperCase()}
                    </div>
                    <span className="text-xs text-text-muted">{groupTasks.length}</span>
                  </div>
                  
                  <div className="w-full">
                    {groupTasks.map(task => (
                      <div key={task.id} className="grid grid-cols-[30px_minmax(200px,1fr)_120px_100px_120px] gap-2 items-center py-2 border-b border-border group/row hover:bg-surface transition-all duration-300 text-sm">
                        <div className="flex justify-center">
                          <button onClick={() => toggleTask(task.id, task.completed)} className={`w-4 h-4 rounded border flex items-center justify-center transition-all duration-300 ${task.completed ? 'bg-text-heading border-success text-white' : 'border-border text-transparent hover:border-text-heading'}`}>
                            <Check size={10} />
                          </button>
                        </div>
                        <div className="flex items-center text-text-body">
                          <span className="truncate">{task.title}</span>
                          {task.priority === 'Urgent' && <span className="ml-2 text-[9px] px-1 bg-red-500/20 text-red-500 rounded uppercase font-bold">Urgent</span>}
                          {task.priority === 'High' && <span className="ml-2 text-[9px] px-1 bg-text-muted/20 text-text-body rounded uppercase font-bold">High</span>}
                          {task.points && <span className="ml-2 text-[10px] text-text-muted bg-surface-hover px-1.5 py-0.5 rounded-sm">{task.points}</span>}
                        </div>
                        <div>
                          <select 
                            className="bg-transparent border-none text-xs text-text-muted focus:outline-none focus:ring-0 cursor-pointer hover:text-white"
                            value={task.status}
                            onChange={(e) => workspace && updateTask(workspace.id, task.id, { status: e.target.value })}
                          >
                            {['Backlog', 'To Do', 'In Progress', 'Code Review', 'QA', 'Done'].map(s => <option key={s} value={s} className="bg-surface">{s}</option>)}
                          </select>
                        </div>
                        <div className="text-xs text-text-muted flex items-center space-x-2">
                          <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center text-[10px]">
                            {task.assigneeName ? task.assigneeName.charAt(0).toUpperCase() : '?'}
                          </div>
                          <span className="truncate max-w-[60px]">{task.assigneeName || 'Unassigned'}</span>
                        </div>
                        <div className="text-xs text-text-muted">{task.date || 'No date'}</div>
                      </div>
                    ))}
                    
                    <div 
                      className="grid grid-cols-[30px_minmax(200px,1fr)_120px_100px_120px] gap-2 items-center py-2 border-b border-border group hover:bg-surface transition-all duration-300 cursor-pointer text-sm"
                      onClick={() => openTaskModalWithStatus(statusGroup)}
                    >
                      <div className="flex justify-center">
                        <div className="w-4 h-4 rounded border border-border group-hover:border-text-heading border-dashed text-transparent group-hover:text-text-muted flex items-center justify-center">
                        </div>
                      </div>
                      <div className="text-text-muted group-hover:text-white">+ Add Task</div>
                      <div></div>
                      <div></div>
                    </div>
                  </div>
                </div>
              );
            })}
            {availableStatuses.length > 0 && (
              <div className="mb-6 relative">
                <div 
                  className="flex items-center text-sm font-medium text-text-muted mb-2 cursor-pointer hover:text-white transition-all duration-300 w-fit" 
                  onClick={() => setIsAddingStatus(!isAddingStatus)}
                >
                  <Plus size={14} className="mr-1" /> Añadir Estado
                </div>
                {isAddingStatus && (
                  <div className="absolute top-full left-0 mt-1 bg-surface border border-border rounded-lg p-2 flex flex-col space-y-1 w-48 shadow-xl z-50">
                    <div className="text-[10px] text-text-muted px-2 pt-1 pb-2 uppercase font-semibold border-b border-border mb-1">Elegir Estado</div>
                    {availableStatuses.map(s => (
                      <button key={s} onClick={() => handleAddStatus(s)} className="text-left px-2 py-1.5 hover:bg-surface-hover rounded text-sm text-text-body w-full">{s}</button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {listMode === 'board' && (
          <div className="flex-1 p-6 overflow-x-auto overflow-y-auto w-full flex space-x-6 items-start">
            {activeStatuses.map(statusGroup => {
              const listTasks = tasks.filter(t => t.listId === activeListId || (!t.listId && activeListId === 'project-1'));
              const groupTasks = listTasks.filter(t => t.status === statusGroup);
              
              const statusColors: Record<string, string> = {
                'Backlog': 'bg-surface text-text-muted',
                'To Do': 'bg-surface text-text-muted',
                'In Progress': 'bg-surface-hover text-text-heading',
                'Code Review': 'bg-white/20 text-white',
                'QA': 'bg-text-muted/20 text-white',
                'Done': 'bg-text-heading/20 text-text-heading'
              };

              return (
                <div key={statusGroup} className="w-72 flex-shrink-0 bg-surface/50 border border-border rounded-xl flex flex-col max-h-full">
                  <div className="p-3 border-b border-border flex items-center justify-between">
                    <div className="flex items-center">
                      <span className={`w-3 h-3 rounded-sm mr-2 ${statusGroup === 'Done' ? 'bg-text-heading' : statusGroup === 'QA' ? 'bg-text-muted' : statusGroup === 'Code Review' ? 'bg-text-muted' : statusGroup === 'In Progress' ? 'bg-text-muted' : statusGroup === 'To Do' ? 'bg-text-muted' : 'bg-text-muted'}`}></span>
                      <h3 className="font-semibold text-sm text-text-body">{statusGroup}</h3>
                      <span className="ml-2 text-xs text-text-muted bg-surface-hover px-1.5 py-0.5 rounded-full">{groupTasks.length}</span>
                    </div>
                    <div className="flex space-x-1">
                      <Plus size={14} className="text-text-muted hover:text-white cursor-pointer" onClick={() => openTaskModalWithStatus(statusGroup)} />
                      <MoreHorizontal size={14} className="text-text-muted hover:text-white cursor-pointer" />
                    </div>
                  </div>
                  <div className="p-3 space-y-3 overflow-y-auto flex-1 h-full min-h-[300px]">
                    {groupTasks.map(task => (
                      <div key={task.id} className="bg-surface border border-border rounded-lg p-3 hover:border-border-subtle transition-all duration-300 group cursor-grab">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex flex-col">
                            <p className="text-sm text-text-body leading-tight mb-1">{task.title}</p>
                            <div className="flex items-center space-x-2">
                              {task.priority === 'Urgent' && <span className="text-[9px] px-1 bg-red-500/20 text-red-500 rounded uppercase font-bold">Urgent</span>}
                              {task.priority === 'High' && <span className="text-[9px] px-1 bg-text-muted/20 text-text-body rounded uppercase font-bold">High</span>}
                              {task.points && <span className="text-[10px] text-text-muted bg-surface-hover px-1.5 py-0.5 rounded-sm">{task.points} pts</span>}
                            </div>
                          </div>
                          <button 
                            onClick={() => toggleTask(task.id, task.completed)} 
                            className={`w-4 h-4 ml-2 flex-shrink-0 rounded border flex items-center justify-center transition-all duration-300 ${task.completed ? 'bg-text-heading border-success text-white' : 'border-border text-transparent hover:border-text-heading'}`}
                          >
                            <Check size={10} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-2">
                            <div className="bg-surface-hover px-2 py-0.5 rounded text-[10px] text-text-muted">{task.date || 'Today'}</div>
                          </div>
                          <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center text-[10px]" title={task.assigneeName}>
                            {task.assigneeName ? task.assigneeName.charAt(0).toUpperCase() : '?'}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <button 
                      onClick={() => openTaskModalWithStatus(statusGroup)}
                      className="w-full py-2 flex items-center justify-center text-sm text-text-muted hover:bg-surface-hover hover:text-white border border-dashed border-border-subtle rounded-lg transition-all duration-300"
                    >
                      <Plus size={14} className="mr-1" /> Add Task
                    </button>
                  </div>
                </div>
              );
            })}
            {availableStatuses.length > 0 && (
              <div className="w-72 flex-shrink-0 flex flex-col h-fit relative">
                <button 
                  onClick={() => setIsAddingStatus(!isAddingStatus)} 
                  className="w-full py-2 flex items-center justify-center text-sm font-medium text-text-muted hover:text-white bg-surface/50 hover:bg-surface-hover border border-dashed border-border-subtle rounded-xl transition-all duration-300"
                >
                  <Plus size={14} className="mr-2" /> Añadir Columna
                </button>
                {isAddingStatus && (
                  <div className="absolute top-full left-0 mt-2 bg-surface border border-border rounded-lg p-2 flex flex-col space-y-1 w-full shadow-xl z-50">
                     <div className="text-[10px] text-text-muted px-2 pt-1 pb-2 uppercase font-semibold border-b border-border mb-1">Elegir Columna</div>
                     {availableStatuses.map(s => (
                       <button key={s} onClick={() => handleAddStatus(s)} className="text-left px-3 py-2 hover:bg-surface-hover rounded text-sm text-text-body w-full">{s}</button>
                     ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Fields Right Sidebar */}
        <div className="w-64 border-l border-border bg-canvas p-4 flex-shrink-0 flex flex-col h-full right-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-white">Fields</h3>
            <button className="text-text-muted hover:text-white"><Plus size={14} /></button>
          </div>
          
          <div className="bg-surface border border-border rounded px-3 py-1.5 flex items-center mb-4">
            <Search size={14} className="text-text-muted mr-2" />
            <input type="text" placeholder="Search for new or existing fields" className="bg-transparent border-none text-sm text-white focus:outline-none w-full" />
          </div>
          
          <div className="flex border-b border-border mb-4">
            <button className="text-sm font-semibold text-white px-2 py-1 border-b-2 border-white flex-1 text-left">Create new</button>
            <button className="text-sm font-medium text-text-muted hover:text-white px-2 py-1 flex-1 text-center">Add existing</button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4">
            <div>
              <h4 className="text-xs text-text-muted font-semibold mb-2">Suggested</h4>
              <ul className="space-y-1">
                <li className="flex items-center text-sm px-2 py-1 hover:bg-surface-hover rounded cursor-pointer"><ArrowRightLeft size={14} className="text-white mr-2" /> Client Feedback</li>
                <li className="flex items-center text-sm px-2 py-1 hover:bg-surface-hover rounded cursor-pointer"><FileText size={14} className="text-white mr-2" /> Next Steps</li>
                <li className="flex items-center text-sm px-2 py-1 hover:bg-surface-hover rounded cursor-pointer"><CalendarCheck size={14} className="text-white mr-2" /> Follow-Up Date</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-xs text-text-muted font-semibold mb-2">AI fields</h4>
              <ul className="space-y-1">
                 <li className="flex items-center text-sm px-2 py-1 hover:bg-surface-hover rounded cursor-pointer"><Sparkles size={14} className="text-white mr-2" /> Summary</li>
                 <li className="flex items-center text-sm px-2 py-1 hover:bg-surface-hover rounded cursor-pointer"><Sparkles size={14} className="text-white mr-2" /> Custom Text</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-xs text-text-muted font-semibold mb-2">All</h4>
              <ul className="space-y-1">
                 <li className="flex items-center text-sm px-2 py-1 hover:bg-surface-hover rounded cursor-pointer"><CheckSquare size={14} className="text-text-heading mr-2" /> Dropdown</li>
                 <li className="flex items-center text-sm px-2 py-1 hover:bg-surface-hover rounded cursor-pointer"><FileText size={14} className="text-white mr-2" /> Text</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
