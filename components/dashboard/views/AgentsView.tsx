"use client";

import React, { useState } from 'react';
import { Zap, Plus, FileText, Code, Bot } from 'lucide-react';

interface Agent {
  id: number;
  name: string;
  desc: string;
  icon: string;
  color: string;
  bg: string;
}

const defaultAgents: Agent[] = [
  { id: 1, name: 'Doc Reviewer', desc: 'Analyzes PRDs', icon: 'FileText', color: 'text-white', bg: 'bg-white/10' },
  { id: 2, name: 'Code Assistant', desc: 'Helps debugging', icon: 'Code', color: 'text-text-heading', bg: 'bg-white/10' }
];

export function AgentsView() {
  const [agents, setAgents] = useState<Agent[]>(defaultAgents);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentDesc, setNewAgentDesc] = useState('');

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName.trim()) return;
    setAgents([...agents, {
      id: Date.now(),
      name: newAgentName,
      desc: newAgentDesc || 'Custom Agent',
      icon: 'Bot',
      color: 'text-black',
      bg: 'bg-surface-hover'
    }]);
    setNewAgentName('');
    setNewAgentDesc('');
    setIsAgentModalOpen(false);
  };

  return (
    <div className="relative p-6 ui-view-enter flex-1 overflow-y-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 border-b border-border pb-3">
        <div className="flex items-center">
          <Zap className="text-black mr-2" size={20} />
          <h2 className="text-lg font-semibold text-white">Custom AI Agents</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map(agent => (
          <div key={agent.id} className="bg-surface border border-border rounded-lg p-4 flex flex-col">
            <div className="flex items-center space-x-3 mb-3">
              <div className={`w-10 h-10 rounded ${agent.bg} flex items-center justify-center ${agent.color}`}>
                {agent.icon === 'FileText' && <FileText size={20} />}
                {agent.icon === 'Code' && <Code size={20} />}
                {agent.icon === 'Bot' && <Bot size={20} />}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{agent.name}</h4>
                <p className="text-xs text-text-muted">{agent.desc}</p>
              </div>
            </div>
            <button className="mt-auto w-full border border-border hover:bg-surface-hover text-xs text-white py-1.5 rounded transition-all duration-300">Configure</button>
          </div>
        ))}
        <div onClick={() => setIsAgentModalOpen(true)} className="bg-surface border border-border border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-surface-hover cursor-pointer transition-all duration-300 min-h-[120px]">
          <Plus size={24} className="text-text-muted mb-2" />
          <span className="text-sm font-medium text-white">Create Agent</span>
        </div>
      </div>

      {isAgentModalOpen && (
        <div className="ui-modal-overlay ui-modal-overlay--nested">
          <div className="ui-modal-panel ui-modal-panel--md p-6">
            <h2 className="text-lg font-bold text-white mb-4">Create New Agent</h2>
            <form onSubmit={handleCreateAgent}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-text-body mb-1">Agent Name</label>
                <input
                  type="text"
                  autoFocus
                  value={newAgentName}
                  onChange={e => setNewAgentName(e.target.value)}
                  className="w-full px-3 py-2 bg-canvas border border-border rounded-md text-white focus:outline-none focus:border-text-heading"
                  placeholder="e.g. Sales Optimizer"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-text-body mb-1">Description</label>
                <input
                  type="text"
                  value={newAgentDesc}
                  onChange={e => setNewAgentDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-canvas border border-border rounded-md text-white focus:outline-none focus:border-text-heading"
                  placeholder="What does this agent do?"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setIsAgentModalOpen(false)} className="px-4 py-2 text-sm text-text-muted hover:text-white transition-all duration-300">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-white text-black hover:bg-btn-primary-hover rounded-md text-sm font-medium transition-all duration-300 hover:scale-[1.02]">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
