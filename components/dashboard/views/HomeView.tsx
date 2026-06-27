"use client";

import React from 'react';
import { Clock, FileText, Bookmark, Plus, CheckCircle2, Layers, FolderOpen, ChevronRight, List as ListIconComponent } from 'lucide-react';

export function HomeView() {
  return (
    <div className="p-6 ui-view-enter flex-1 overflow-y-auto h-full">
      <div className="flex items-center mb-6 border-b border-border pb-3">
        <Layers className="text-white mr-2" size={20} />
        <h2 className="text-lg font-semibold text-white">Team Space</h2>
        <ChevronRight size={14} className="mx-2 text-text-muted" />
        <h2 className="text-lg font-bold text-white flex items-center">
          <FolderOpen size={18} className="text-text-muted mr-2" /> Prueba Archivos - Q4 Overview
        </h2>
      </div>

      <div className="flex space-x-4 mb-6 border-b border-border pb-2 text-sm font-medium">
        <button className="text-black border-b-2 border-text-heading pb-2 -mb-[10px]">Overview</button>
        <button className="text-text-muted hover:text-white transition-all duration-300 pb-2">List</button>
        <button className="text-text-muted hover:text-white transition-all duration-300 pb-2">Board</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {[
          { icon: <Clock size={24} />, title: 'Recent', desc: 'Your recently opened items will appear here.', btn: 'Learn more', badge: <div className="w-3 h-3 bg-white text-black rounded-full"></div> },
          { icon: <FileText size={24} />, title: 'Docs', desc: 'There are no Docs in this location yet.', btn: 'Add a Doc', badge: <div className="w-3 h-3 bg-gray-400 rounded-full flex items-center justify-center text-white"><CheckCircle2 size={8} /></div> },
          { icon: <Bookmark size={24} />, title: 'Bookmarks', desc: 'Bookmarks make it easy to save items or URLs.', btn: 'Add Bookmark', badge: <div className="w-3 h-3 bg-gray-400 rounded-full flex items-center justify-center text-white"><Plus size={8} /></div> }
        ].map((card, i) => (
          <div key={i} className="bg-surface rounded-xl border border-border p-6 flex flex-col items-center justify-center min-h-[220px]">
            <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center mb-4 border border-border text-text-muted relative">
              {card.icon}
              <div className="absolute -bottom-1 -right-1 bg-surface rounded-full p-0.5">
                {card.badge}
              </div>
            </div>
            <h3 className="text-white font-medium mb-1">{card.title}</h3>
            <p className="text-xs text-text-muted mb-4 text-center">{card.desc}</p>
            <button className="bg-white text-black hover:bg-btn-primary-hover text-xs font-medium px-4 py-1.5 rounded-md transition-all duration-300">
              {card.btn}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-surface rounded-xl border border-border p-8 flex flex-col items-center justify-center min-h-[250px]">
        <div className="w-12 h-12 flex items-center justify-center mb-2 text-text-muted">
          <ListIconComponent size={32} />
        </div>
        <p className="text-sm text-white mb-4">Add a new List to your Space</p>
        <button className="bg-white text-black hover:bg-btn-primary-hover text-sm font-medium px-5 py-2 rounded-md transition-all duration-300">
          Add List
        </button>
      </div>
    </div>
  );
}
