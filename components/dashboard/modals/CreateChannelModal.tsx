"use client";

import React from 'react';
import { useDashboard } from '@/components/providers/DashboardContext';
import { createChannel } from '@/lib/services/chat';

interface CreateChannelModalProps {
  newChannelName: string;
  setNewChannelName: (v: string) => void;
  newChannelType: 'public' | 'dm';
  setIsCreatingChannel: (v: boolean) => void;
  openChat: (chatId: string) => void;
}

export function CreateChannelModal({
  newChannelName,
  setNewChannelName,
  newChannelType,
  setIsCreatingChannel,
  openChat,
}: CreateChannelModalProps) {
  const { workspace } = useDashboard();

  return (
    <div className="ui-modal-overlay ui-modal-overlay--nested">
      <div className="ui-modal-panel ui-modal-panel--md p-6">
        <h2 className="text-lg font-bold text-white mb-4">
          {newChannelType === 'public' ? 'Create Space' : 'New Direct Message'}
        </h2>
        <form onSubmit={async (e) => {
          e.preventDefault();
          if (newChannelName.trim() && workspace) {
            const chan = await createChannel(workspace.id, newChannelName.trim(), newChannelType);
            setNewChannelName('');
            setIsCreatingChannel(false);
            openChat(chan.id);
          }
        }}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-body mb-1">Name</label>
            <input
              type="text"
              autoFocus
              value={newChannelName}
              onChange={e => setNewChannelName(e.target.value)}
              className="w-full px-3 py-2 bg-canvas border border-border rounded-md text-white focus:outline-none focus:border-text-heading"
              placeholder={newChannelType === 'public' ? "e.g. Design Team" : "e.g. Jane Doe"}
              required
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={() => setIsCreatingChannel(false)} className="px-4 py-2 text-sm text-text-muted hover:text-white transition-all duration-300">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-white text-black hover:bg-btn-primary-hover rounded-md text-sm font-medium transition-all duration-300 hover:scale-[1.02]">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}
