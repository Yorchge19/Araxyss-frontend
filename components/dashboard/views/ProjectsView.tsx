"use client";

import React from 'react';
import { ListTodo, Clock, Zap, Plus, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useDashboard } from '@/components/providers/DashboardContext';
import { updateTask } from '@/lib/services/tasks';

interface ProjectsViewProps {
  openTaskModalWithStatus: (status?: string) => void;
}

export function ProjectsView({ openTaskModalWithStatus }: ProjectsViewProps) {
  const { workspace, tasks } = useDashboard();

  const ALL_STATUSES = ['Backlog', 'To Do', 'In Progress', 'Code Review', 'QA', 'Done'];
  const activeStatuses = workspace?.taskStatuses && workspace.taskStatuses.length > 0 ? workspace.taskStatuses : ['To Do'];

  const toggleTask = (taskId: string, currentCompleted?: boolean) => {
    if (!workspace) return;
    updateTask(workspace.id, taskId, {
      completed: !currentCompleted,
      status: !currentCompleted ? 'Done' : 'To Do'
    });
  };

  return (
    <div className="flex-1 flex flex-col ui-view-enter h-full overflow-hidden">
      <div className="border-b border-border px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0 bg-canvas">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded bg-text-heading flex items-center justify-center text-white mr-3 shadow-sm">
            <ListTodo size={16} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">My Tasks</h2>
            <p className="text-xs text-text-muted">Workspace: {workspace?.name || 'Personal'}</p>
          </div>
        </div>
        <div className="flex space-x-2 items-center">
          <span className="text-xs text-text-muted flex items-center"><Clock size={12} className="mr-1" /> Refreshed: just now</span>
          <button className="px-3 py-1 bg-surface-hover border border-border rounded text-xs font-medium text-white flex items-center">
            <Zap size={12} className="mr-1 text-black" /> Auto refresh: On
          </button>
          <button onClick={() => openTaskModalWithStatus()} className="px-3 py-1 bg-white text-black hover:bg-btn-primary-hover rounded text-xs font-medium transition-all duration-300 flex items-center">
            <Plus size={12} className="mr-1" /> Task
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-canvas">
        {activeStatuses.slice(0, 2).map((statusGroup, idx) => {
          const groupTasks = tasks.filter(t => t.status === statusGroup);
          if (groupTasks.length === 0) return null;
          return (
            <div key={statusGroup} className="mb-8 bg-surface rounded-lg border border-border overflow-hidden">
              <div className="flex items-center p-3 border-b border-border bg-surface-hover">
                <div className="w-4 h-4 rounded bg-surface-hover text-white flex items-center justify-center mr-2"><ChevronDown size={10} /></div>
                <div className={`w-3 h-3 rounded mr-2 ${idx === 0 ? 'bg-gray-400' : 'bg-white text-black'}`}></div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">{statusGroup}</h3>
                <span className="ml-2 text-xs text-text-muted">{groupTasks.length} task{groupTasks.length > 1 ? 's' : ''}</span>
              </div>
              <div>
                {groupTasks.map((task) => (
                  <div key={task.id} className="flex items-center py-2.5 px-4 border-b border-border ui-list-row transition-colors duration-200 group">
                    <div className="w-1/2 flex items-center">
                      <button
                        onClick={() => toggleTask(task.id, task.completed)}
                        className={`w-4 h-4 rounded border mr-3 flex-shrink-0 flex items-center justify-center transition-all duration-300 ${task.completed ? 'bg-white text-black border-white text-white' : 'border-border hover:border-text-heading hover:bg-white text-black/20'}`}
                      >
                        {task.completed && <CheckCircle2 size={12} />}
                      </button>
                      <span className={`text-sm font-medium cursor-pointer transition-all duration-300 group-hover:text-black ${task.completed ? 'line-through text-text-muted' : 'text-text-body'}`}>
                        {task.title}
                      </span>
                    </div>
                    <div className="w-1/6 flex justify-center">
                      <img className="w-6 h-6 rounded-full border border-border" src={`https://ui-avatars.com/api/?name=${(task.assigneeName || 'Unknown').replace(' ', '+')}&background=${task.color || '10B981'}&color=fff`} alt={task.assigneeName || 'Unknown'} />
                    </div>
                    <div className={`w-1/6 text-center text-xs ${task.date === 'Today' ? 'text-white font-medium' : 'text-text-muted'}`}>
                      {task.date}
                    </div>
                    <div className="w-1/6 flex justify-center">
                      <span className={`w-3 h-3 rounded-sm ${task.priority}`}></span>
                    </div>
                  </div>
                ))}
              </div>
              {idx === 0 && (
                <div className="p-2 border-t border-border bg-surface-hover">
                  <button onClick={() => openTaskModalWithStatus(statusGroup)} className="text-sm text-text-muted hover:text-white flex items-center transition-all duration-300 px-2 py-1">
                    <Plus size={14} className="mr-2" /> New Task
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
