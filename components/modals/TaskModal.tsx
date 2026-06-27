import React from 'react';
import { ChevronDown, CheckCircle2, CheckSquare, ArrowRightLeft, X, Check, UserPlus, Calendar, ChevronRight, Flag, Ban, Tag, MoreHorizontal, Plus, List as ListIconComponent, FileText, Bot, Columns, List as ListIcon, Bell, Paperclip, Zap } from 'lucide-react';

interface TaskModalProps {
  isTaskModalOpen: boolean;
  setIsTaskModalOpen: (val: boolean) => void;
  newTaskTab: 'task' | 'doc' | 'reminder' | 'whiteboard' | 'dashboard';
  setNewTaskTab: (val: 'task' | 'doc' | 'reminder' | 'whiteboard' | 'dashboard') => void;
  lastError: string | null;
  newTaskTitle: string;
  setNewTaskTitle: (val: string) => void;
  newTaskDescription: string;
  setNewTaskDescription: (val: string) => void;
  modalDropdown: string | null;
  setModalDropdown: (val: string | null) => void;
  newTaskStatus: string;
  setNewTaskStatus: (val: string) => void;
  activeStatuses: string[];
  newTaskPriority: string;
  setNewTaskPriority: (val: string) => void;
  handleCreateTask: () => void;
}

export function TaskModal({
  isTaskModalOpen,
  setIsTaskModalOpen,
  newTaskTab,
  setNewTaskTab,
  lastError,
  newTaskTitle,
  setNewTaskTitle,
  newTaskDescription,
  setNewTaskDescription,
  modalDropdown,
  setModalDropdown,
  newTaskStatus,
  setNewTaskStatus,
  activeStatuses,
  newTaskPriority,
  setNewTaskPriority,
  handleCreateTask
}: TaskModalProps) {
  if (!isTaskModalOpen) return null;

  return (
    <div className="ui-modal-overlay ui-modal-overlay--nested">
      <div className="ui-modal-panel ui-modal-panel--xl flex flex-col relative overflow-visible">
        
        {/* Tabs */}
        <div className="flex items-center justify-between px-4 pt-3 border-b border-border">
          <div className="flex space-x-6 text-sm">
            {['task', 'doc', 'reminder', 'whiteboard', 'dashboard'].map(tab => (
              <button 
                key={tab}
                onClick={() => setNewTaskTab(tab as any)}
                className={`ui-tab ${newTaskTab === tab ? 'ui-tab--active' : 'ui-tab--inactive'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex space-x-2 pb-3 text-text-muted">
            <button className="hover:text-white"><ArrowRightLeft size={16} /></button>
            <button onClick={() => setIsTaskModalOpen(false)} className="hover:text-white"><X size={16} /></button>
          </div>
        </div>

        {/* Body */}
        {newTaskTab === 'task' && (
        <div className="flex flex-col p-6 w-full relative">
          {lastError && <div className="mb-4 p-3 bg-red-500/20 border border-white rounded text-red-500 text-sm">{lastError}</div>}
          
          <div className="flex items-center space-x-2 mb-6">
            <div className="flex items-center space-x-2 bg-surface-hover rounded px-2 py-1 text-xs text-text-body cursor-pointer hover:bg-surface-hover border border-border">
              <CheckSquare size={12} className="text-text-muted" />
              <span>sprint 1</span>
              <ChevronDown size={10} className="text-text-muted"/>
            </div>
            <div className="flex items-center space-x-2 bg-surface-hover rounded px-2 py-1 text-xs text-text-body cursor-pointer hover:bg-surface-hover border border-border">
              <CheckCircle2 size={12} className="text-text-muted" />
              <span>Task</span>
              <ChevronDown size={10} className="text-text-muted"/>
            </div>
          </div>

          <input 
            type="text" 
            autoFocus
            value={newTaskTitle} 
            onChange={e => setNewTaskTitle(e.target.value)} 
            className="w-full bg-transparent text-2xl font-semibold text-white placeholder:text-text-muted focus:outline-none mb-4" 
            placeholder="Task Name"
          />

          <textarea
            value={newTaskDescription}
            onChange={e => setNewTaskDescription(e.target.value)}
            className="w-full bg-transparent text-sm text-text-body placeholder:text-text-muted focus:outline-none resize-none min-h-[100px] mb-6"
            placeholder="Add description, or write with AI"
          />

          {/* Buttons Row with Popovers */}
          <div className="flex flex-wrap gap-2 items-center mb-8 relative">
            
            {/* STATUS DROPDOWN */}
            <div className="relative">
              <button onClick={() => setModalDropdown(modalDropdown === 'status' ? null : 'status')} className="flex items-center space-x-1.5 px-3 py-1.5 bg-surface-hover hover:bg-surface-hover text-xs font-medium text-text-body rounded-md transition-all duration-300 border border-border">
                <span className={`w-2 h-2 rounded-sm ${newTaskStatus === 'Done' ? 'bg-text-heading' : newTaskStatus === 'In Progress' ? 'bg-text-muted' : newTaskStatus === 'QA' ? 'bg-text-muted' : newTaskStatus === 'Code Review' ? 'bg-text-muted' : newTaskStatus === 'To Do' ? 'bg-gray-400' : 'bg-text-muted'} mr-1`}></span>
                <span className="uppercase">{newTaskStatus}</span>
              </button>
              {modalDropdown === 'status' && (
                <div className="absolute top-full left-0 mt-2 w-56 ui-dropdown z-50 p-2">
                   <div className="p-2">
                     <input type="text" placeholder="Search..." className="w-full bg-transparent border border-border rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-text-heading" />
                   </div>
                   <div className="text-[10px] text-text-muted px-2 pt-2 pb-1 uppercase font-semibold">ESTADOS ACTIVOS</div>
                   {activeStatuses.map(status => (
                     <button key={status} onClick={() => {setNewTaskStatus(status); setModalDropdown(null);}} className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-white hover:bg-surface-hover rounded mt-1">
                       <div className="flex items-center">
                         <span className={`w-2 h-2 rounded-sm mr-2 block ${status === 'Done' ? 'bg-text-heading' : status === 'In Progress' ? 'bg-text-muted' : status === 'QA' ? 'bg-text-muted' : status === 'Code Review' ? 'bg-text-muted' : status === 'To Do' ? 'bg-gray-400' : 'bg-text-muted'}`}></span> 
                         {status.toUpperCase()}
                       </div>
                       {newTaskStatus === status && <Check size={12}/>}
                     </button>
                   ))}
                </div>
              )}
            </div>

            {/* ASSIGNEE */}
            <div className="relative">
              <button onClick={() => setModalDropdown(modalDropdown === 'assignee' ? null : 'assignee')} className="flex items-center space-x-1.5 px-3 py-1.5 bg-transparent border border-border hover:bg-surface-hover text-xs font-medium text-text-body rounded-md transition-all duration-300">
                <UserPlus size={12} className="text-text-muted" />
                <span>Assignee</span>
              </button>
              {modalDropdown === 'assignee' && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-surface border border-border rounded-lg shadow-xl z-50 p-2">
                   <div className="p-2 border-b border-border">
                     <input type="text" placeholder="Search or enter email..." className="w-full bg-transparent text-xs text-white focus:outline-none" />
                   </div>
                   <div className="text-[10px] text-text-muted px-2 pt-3 pb-1 uppercase font-semibold">People</div>
                   <button onClick={() => setModalDropdown(null)} className="w-full flex items-center space-x-2 px-2 py-1.5 text-xs text-white hover:bg-surface-hover rounded">
                     <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-[10px]">Me</div>
                     <span>Me</span>
                   </button>
                   <div className="text-[10px] text-text-muted px-2 pt-3 pb-1 uppercase font-semibold">Agents</div>
                   <button onClick={() => setModalDropdown(null)} className="w-full flex items-center space-x-2 px-2 py-1.5 text-xs text-text-body hover:bg-surface-hover rounded bg-surface">
                     <Plus size={12} className="text-white"/>
                     <span>Create Agent</span>
                   </button>
                </div>
              )}
            </div>

            {/* DUE DATE */}
            <div className="relative">
              <button onClick={() => setModalDropdown(modalDropdown === 'dueDate' ? null : 'dueDate')} className="flex items-center space-x-1.5 px-3 py-1.5 bg-transparent border border-border hover:bg-surface-hover text-xs font-medium text-text-body rounded-md transition-all duration-300">
                <Calendar size={12} className="text-text-muted"/>
                <span>Due date</span>
              </button>
              {modalDropdown === 'dueDate' && (
                <div className="absolute top-full left-0 mt-2 w-[400px] bg-surface border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                   <div className="flex border-b border-border p-2 space-x-2 bg-surface">
                     <div className="flex-1 bg-surface border border-border rounded flex items-center px-2 py-1">
                       <Calendar size={12} className="text-text-muted mr-2"/>
                       <input type="text" placeholder="Start date" className="bg-transparent text-xs text-text-body focus:outline-none w-full" />
                     </div>
                     <div className="flex-1 bg-canvas border border-border rounded flex items-center px-2 py-1">
                       <Calendar size={12} className="text-text-muted mr-2"/>
                       <input type="text" placeholder="Due date" className="bg-transparent text-xs text-text-body focus:outline-none w-full" />
                     </div>
                   </div>
                   <div className="bg-surface-hover flex items-start p-3">
                     <div className="text-xl mr-3">🏖️</div>
                     <div className="flex-1">
                       <div className="text-xs font-bold text-white mb-0.5">Set up your work schedule</div>
                       <div className="text-[10px] text-text-muted">Set working days/hours and holidays for your workspace.</div>
                     </div>
                     <X size={12} className="text-text-muted cursor-pointer" />
                   </div>
                </div>
              )}
            </div>

            {/* PRIORITY */}
            <div className="relative">
               <button onClick={() => setModalDropdown(modalDropdown === 'priority' ? null : 'priority')} className="flex items-center space-x-1.5 px-3 py-1.5 bg-transparent border border-border hover:bg-surface-hover text-xs font-medium text-text-body rounded-md transition-all duration-300">
                <Flag size={12} className="text-text-muted" />
                <span>{newTaskPriority === 'Normal' ? 'Priority' : newTaskPriority}</span>
              </button>
              {modalDropdown === 'priority' && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-surface border border-border rounded-lg shadow-xl z-50 py-2">
                   <div className="text-[10px] text-text-muted px-3 pb-2 mb-1">Priority</div>
                   <button onClick={() => {setNewTaskPriority('Urgent'); setModalDropdown(null);}} className="w-full flex items-center px-3 py-1.5 text-xs text-white hover:bg-surface-hover"><Flag size={12} className="mr-2 text-red-500 fill-error"/> Urgent</button>
                   <button onClick={() => {setNewTaskPriority('High'); setModalDropdown(null);}} className="w-full flex items-center px-3 py-1.5 text-xs text-white hover:bg-surface-hover"><Flag size={12} className="mr-2 text-text-heading fill-text-muted"/> High</button>
                   <button onClick={() => {setNewTaskPriority('Normal'); setModalDropdown(null);}} className="w-full flex items-center px-3 py-1.5 text-xs text-white hover:bg-surface-hover"><Flag size={12} className="mr-2 text-white fill-text-muted"/> Normal</button>
                   <button onClick={() => {setNewTaskPriority('Low'); setModalDropdown(null);}} className="w-full flex items-center px-3 py-1.5 text-xs text-white hover:bg-surface-hover"><Flag size={12} className="mr-2 text-text-muted fill-text-muted"/> Low</button>
                   <div className="border-t border-border my-1"></div>
                   <button onClick={() => {setNewTaskPriority('Normal'); setModalDropdown(null);}} className="w-full flex items-center px-3 py-1.5 text-xs text-text-muted hover:bg-surface-hover"><Ban size={12} className="mr-2"/> Clear</button>
                </div>
              )}
            </div>

            <button className="flex items-center space-x-1.5 px-3 py-1.5 bg-transparent border border-border hover:bg-surface-hover text-xs font-medium text-text-body rounded-md transition-all duration-300">
              <Tag size={12} className="text-text-muted"/>
              <span>Tags</span>
            </button>

            <button className="flex items-center justify-center p-1.5 bg-transparent border border-border hover:bg-surface-hover text-text-muted rounded-md transition-all duration-300">
              <MoreHorizontal size={14} />
            </button>
          </div>

          <div className="mb-8">
            <div className="text-[10px] font-medium text-text-muted mb-2 uppercase">Fields</div>
            <button className="flex items-center space-x-1.5 px-3 py-1.5 bg-surface-hover hover:bg-surface-hover text-[11px] font-medium text-text-body rounded-md transition-all duration-300 w-fit">
              <Plus size={12} />
              <span>Create new field</span>
            </button>
          </div>
        </div>
        )}

        {/* Doc Tab Placeholder */}
        {newTaskTab === 'doc' && (
          <div className="flex flex-col p-6 min-h-[300px]">
            <div className="flex items-center space-x-2 bg-transparent rounded px-2 py-1 text-xs text-text-body w-fit mb-6 border border-border hover:bg-surface-hover cursor-pointer">
              <ListIconComponent size={12} className="text-text-muted" />
              <span>My Docs</span>
              <ChevronDown size={10} className="text-text-muted"/>
            </div>
            <input type="text" className="bg-transparent text-2xl font-semibold text-white placeholder:text-text-muted focus:outline-none mb-6" placeholder="Name this Doc..." />
            
            <div className="space-y-4 px-1">
              <div className="flex items-center text-sm text-text-body hover:text-white cursor-pointer"><FileText size={16} className="mr-3 text-text-muted"/> Start writing</div>
              <div className="flex items-center text-sm text-text-body hover:text-white cursor-pointer"><Bot size={16} className="mr-3 text-white"/> Write with AI</div>
              
              <div className="text-xs font-medium text-text-muted pt-4 pb-2">Add new</div>
              <div className="flex items-center text-sm text-text-body hover:text-white cursor-pointer"><ListIconComponent size={16} className="mr-3 text-text-muted"/> Table</div>
              <div className="flex items-center text-sm text-text-body hover:text-white cursor-pointer"><Columns size={16} className="mr-3 text-text-muted"/> Column</div>
              <div className="flex items-center text-sm text-text-body hover:text-white cursor-pointer"><ListIcon size={16} className="mr-3 text-text-muted"/> ClickUp List</div>
            </div>
          </div>
        )}

        {/* Reminder Tab Placeholder */}
        {newTaskTab === 'reminder' && (
          <div className="flex flex-col p-6 min-h-[250px]">
            <input type="text" className="w-full bg-transparent text-2xl font-semibold text-white placeholder:text-text-muted focus:outline-none mb-4" placeholder="Reminder name or type '/' for commands" />
            <div className="flex items-center text-sm text-text-muted mb-8 hover:text-white cursor-pointer w-fit"><FileText size={14} className="mr-2"/> Add description</div>
            <div className="flex items-center space-x-3 text-xs text-white">
              <button className="flex items-center px-3 py-1.5 rounded-md border border-border ui-list-row transition-colors duration-200"><Calendar size={12} className="mr-2 text-text-muted"/> Today</button>
              <button className="flex items-center px-3 py-1.5 rounded-md border border-border ui-list-row transition-colors duration-200"><div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center mr-2 text-[10px]">J</div> For me</button>
              <button className="flex items-center px-3 py-1.5 rounded-md border border-border ui-list-row transition-colors duration-200"><Bell size={12} className="mr-2 text-text-muted"/> Notify me</button>
            </div>
          </div>
        )}

        {/* Whiteboard Tab Placeholder */}
        {newTaskTab === 'whiteboard' && (
          <div className="flex flex-col p-6 min-h-[250px]">
            <div className="flex items-center space-x-2 bg-transparent rounded px-2 py-1 text-xs text-text-body w-fit mb-6 border border-border hover:bg-surface-hover cursor-pointer">
              <ListIconComponent size={12} className="text-text-muted" />
              <span>My Whiteboards</span>
              <ChevronDown size={10} className="text-text-muted"/>
            </div>
            <input type="text" className="bg-transparent text-2xl font-semibold text-white placeholder:text-text-muted focus:outline-none mb-6" placeholder="Name this Whiteboard..." />
          </div>
        )}

        {/* Dashboard Tab Placeholder */}
        {newTaskTab === 'dashboard' && (
          <div className="flex flex-col p-6 min-h-[250px]">
            <div className="flex items-center space-x-2 bg-transparent rounded px-2 py-1 text-xs text-text-body w-fit mb-6 border border-border hover:bg-surface-hover cursor-pointer">
              <ListIconComponent size={12} className="text-text-muted" />
              <span>My Dashboards</span>
              <ChevronDown size={10} className="text-text-muted"/>
            </div>
            <input type="text" className="bg-transparent text-2xl font-semibold text-white placeholder:text-text-muted focus:outline-none mb-6" placeholder="Name this Dashboard..." />
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-border p-4 flex items-center justify-between bg-surface rounded-b-xl mt-auto">
          {newTaskTab === 'task' ? (
            <button className="flex items-center space-x-2 px-3 py-1.5 border border-border hover:bg-surface-hover rounded-md text-xs font-medium text-text-body transition-all duration-300">
              <Zap size={14} className="text-text-muted" />
              <span>Templates</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2 text-text-muted">
              <div className="w-8 h-4 bg-surface-hover rounded-full flex items-center px-0.5"><div className="w-3 h-3 bg-white rounded-full"></div></div>
              <span className="text-xs">Private</span>
            </div>
          )}
          
          <div className="flex items-center space-x-4">
            {newTaskTab === 'task' && (
              <>
                <button className="text-text-muted hover:text-white"><Paperclip size={16} /></button>
                <button className="text-text-muted hover:text-white"><Bell size={16} /></button>
                <div className="w-[1px] h-4 bg-surface-hover"></div>
              </>
            )}
            
            {newTaskTab !== 'task' && (
              <button className="text-text-muted hover:text-white mr-2"><Paperclip size={16} /></button>
            )}

            <div className="flex rounded-md overflow-hidden">
              <button onClick={handleCreateTask} className="px-5 py-2 bg-white text-black hover:bg-btn-primary-hover text-sm font-medium transition-all duration-300">
                {newTaskTab === 'task' ? 'Create Task' : `Create ${newTaskTab.charAt(0).toUpperCase() + newTaskTab.slice(1)}`}
              </button>
              {newTaskTab === 'task' && (
                <button className="px-2 py-2 bg-white text-black hover:bg-btn-primary-hover border-l border-white/20 text-white transition-all duration-300">
                  <ChevronDown size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
