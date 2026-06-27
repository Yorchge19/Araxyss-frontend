"use client";

import React from 'react';
import { X } from 'lucide-react';
import { useDashboard } from '@/components/providers/DashboardContext';

export function GlobalErrorBanner() {
  const { globalError, setGlobalError } = useDashboard();

  if (!globalError) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-red-700 to-red-600 text-white px-4 py-3 flex items-start shadow-lg ui-banner-enter">
      <div className="flex-shrink-0 mr-3 mt-0.5">
        <svg className="w-5 h-5 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">Error de Firebase</p>
        <p className="text-xs text-red-100 mt-0.5">{globalError}</p>
        {globalError.includes('permisos') && (
          <p className="text-[10px] text-red-200 mt-1 italic">
            Tip: Abre la consola del navegador (F12) para ver detalles técnicos del error.
          </p>
        )}
      </div>
      <button onClick={() => setGlobalError(null)} className="flex-shrink-0 ml-3 text-gray-400 hover:text-white transition-all duration-300">
        <X size={16} />
      </button>
    </div>
  );
}
