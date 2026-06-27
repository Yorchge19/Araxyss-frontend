import React from 'react';
import { Layers, Briefcase, Zap } from 'lucide-react';

interface GatewayScreenProps {
  user: any;
  isSuperAdmin: boolean;
  handleGatewayChoice: (choice: 'workspace' | 'business' | 'super_admin') => void;
}

export function GatewayScreen({ user, isSuperAdmin, handleGatewayChoice }: GatewayScreenProps) {
  return (
    <div className="ui-screen-overlay font-sans text-text-heading">
      <div className="ui-screen-content max-w-5xl">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3 text-center tracking-tight text-white">
          ¡Hola, {user?.displayName || 'Usuario'}!
        </h1>
        <p className="text-text-muted text-center mb-12 text-lg">¿A dónde quieres ir?</p>
        <div className={`grid grid-cols-1 ${isSuperAdmin ? 'md:grid-cols-3 max-w-5xl' : 'md:grid-cols-2 max-w-2xl'} gap-8 mx-auto ui-stagger`}>
          <button onClick={() => handleGatewayChoice('workspace')} className="ui-choice-card p-10 group flex flex-col h-full">
            <div className="icon-glow-box w-16 h-16 mb-6"><Layers size={32} /></div>
            <h3 className="text-2xl font-bold mb-3 text-white">Espacio de Trabajo</h3>
            <p className="text-sm text-text-muted leading-relaxed flex-1">Accede a tus proyectos, tareas, chat y herramientas del equipo.</p>
          </button>
          
          <button onClick={() => handleGatewayChoice('business')} className="ui-choice-card p-10 group flex flex-col h-full">
            <div className="icon-glow-box w-16 h-16 mb-6"><Briefcase size={32} /></div>
            <h3 className="text-2xl font-bold mb-3 text-white">Portal de Negocio</h3>
            <p className="text-sm text-text-muted leading-relaxed flex-1">Revisa avances de proyectos, reporta incidencias y abre tickets como cliente.</p>
          </button>
          
          {isSuperAdmin && (
            <button onClick={() => handleGatewayChoice('super_admin')} className="ui-choice-card p-10 group flex flex-col h-full">
              <div className="icon-glow-box w-16 h-16 mb-6"><Zap size={32} /></div>
              <h3 className="text-2xl font-bold mb-3 text-white">Panel Super Admin</h3>
              <p className="text-sm text-text-muted leading-relaxed flex-1">Administra todos los espacios de trabajo, entra como negocio o cliente, edita y elimina datos globales.</p>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
