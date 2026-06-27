"use client";

import React from 'react';
import { Users, FolderOpen, Clock, FileText, Bookmark, List as ListIconComponent, Columns, Home } from 'lucide-react';

export function SpaceOverviewView() {
  return (
    <div className="flex-1 flex flex-col h-full bg-surface text-text-body relative overflow-hidden">
      <div className="flex-shrink-0 px-6 py-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="flex flex-col">
            <div className="text-sm font-semibold text-white flex items-center">
              <Users size={16} className="mr-2 text-white" /> Team Space
              <span className="mx-2 text-text-muted">/</span>
              <FolderOpen size={16} className="text-text-muted mr-2" /> Prueba Archivos
            </div>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 px-6 py-2 flex items-center justify-between border-b border-border text-sm">
        <div className="flex items-center space-x-4">
          <button className="flex items-center font-semibold text-white border-b-2 border-white pb-1"><Home size={14} className="mr-1" /> Overview</button>
          <button className="flex items-center text-text-muted hover:text-white pb-1"><ListIconComponent size={14} className="mr-1" /> List</button>
          <button className="flex items-center text-text-muted hover:text-white pb-1"><Columns size={14} className="mr-1" /> Board</button>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span className="text-text-muted"><Clock size={12} className="inline mr-1" /> Refreshed: 2 mins ago</span>
          <div className="border border-border rounded px-2 py-1 flex items-center bg-surface-hover">
            <span className="text-black">Auto refresh: On</span>
          </div>
          <button className="bg-white text-black px-3 py-1 rounded font-medium">+ Card</button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-canvas border border-border rounded-xl p-4 flex flex-col h-64">
            <h3 className="text-xs font-semibold text-white mb-auto">Recent</h3>
            <div className="flex flex-col items-center justify-center text-center pb-8">
              <div className="bg-surface p-4 rounded-full mb-3"><Clock size={24} className="text-text-muted" /></div>
              <p className="text-sm text-text-muted mb-3">Your recently opened items will appear here.</p>
              <button className="bg-white text-black text-xs px-4 py-1.5 rounded-md font-medium">Learn more</button>
            </div>
          </div>
          <div className="bg-canvas border border-border rounded-xl p-4 flex flex-col h-64">
            <h3 className="text-xs font-semibold text-white mb-auto">Docs</h3>
            <div className="flex flex-col items-center justify-center text-center pb-8">
              <div className="bg-surface p-4 rounded-full mb-3"><FileText size={24} className="text-text-muted" /></div>
              <p className="text-sm text-text-muted mb-3">There are no Docs in this location yet.</p>
              <button className="bg-white text-black text-xs px-4 py-1.5 rounded-md font-medium">Add a Doc</button>
            </div>
          </div>
          <div className="bg-canvas border border-border rounded-xl p-4 flex flex-col h-64">
            <h3 className="text-xs font-semibold text-white mb-auto">Bookmarks</h3>
            <div className="flex flex-col items-center justify-center text-center pb-8">
              <div className="bg-surface p-4 rounded-full mb-3"><Bookmark size={24} className="text-text-muted" /></div>
              <p className="text-sm text-text-muted mb-3">Bookmarks make it easy to save ClickUp items or any URL.</p>
              <button className="bg-white text-black text-xs px-4 py-1.5 rounded-md font-medium">Add Bookmark</button>
            </div>
          </div>
        </div>

        <div className="bg-canvas border border-border rounded-xl p-4 flex flex-col h-64 mb-6">
          <h3 className="text-xs font-semibold text-white mb-auto">Lists</h3>
          <div className="flex flex-col items-center justify-center text-center pb-8 mt-auto">
            <div className="bg-surface p-4 rounded-full mb-3"><ListIconComponent size={24} className="text-text-muted" /></div>
            <p className="text-sm text-text-muted mb-3">Add a new List to your Space</p>
            <button className="bg-white text-black text-xs px-4 py-1.5 rounded-md font-medium">Add List</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
          <div className="bg-canvas border border-border rounded-xl p-4 flex flex-col h-40">
            <h3 className="text-xs font-semibold text-white mb-4">Resources</h3>
          </div>
          <div className="bg-canvas border border-border rounded-xl p-4 flex flex-col h-40">
            <h3 className="text-xs font-semibold text-white mb-4">Tasks by Assignee</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
