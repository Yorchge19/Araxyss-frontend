import React from 'react';
import { ChevronLeft, Briefcase, ChevronRight, Plus, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OnboardingScreenProps {
  user: any;
  isSuperAdmin: boolean;
  onboardingMode: 'decide' | 'create' | 'join-team' | 'join-business' | 'select-business-portal';
  setOnboardingMode: (mode: 'decide' | 'create' | 'join-team' | 'join-business' | 'select-business-portal') => void;
  setNeedsOnboarding: (val: boolean) => void;
  setShowGateway: (val: boolean) => void;
  accessibleBusinessPortals: any[];
  onboardingInput: string;
  setOnboardingInput: (val: string) => void;
  onboardingError: string;
  setOnboardingError: (val: string) => void;
  isOnboardingAction: boolean;
  handleOnboardingAction: () => void;
}

export function OnboardingScreen({
  user,
  isSuperAdmin,
  onboardingMode,
  setOnboardingMode,
  setNeedsOnboarding,
  setShowGateway,
  accessibleBusinessPortals,
  onboardingInput,
  setOnboardingInput,
  onboardingError,
  setOnboardingError,
  isOnboardingAction,
  handleOnboardingAction
}: OnboardingScreenProps) {
  const router = useRouter();

  return (
    <div className="ui-screen-overlay font-sans text-text-heading">
      <div className="ui-screen-content max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3 text-center tracking-tight text-white">Configurar acceso</h1>
        <p className="text-text-muted text-center mb-12 text-lg">Elige cómo quieres ingresar.</p>
        
        {onboardingMode === 'select-business-portal' ? (
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => {
                setNeedsOnboarding(false);
                setShowGateway(true);
                setOnboardingMode('decide');
              }}
              className="mb-6 text-text-muted hover:text-text-heading flex items-center text-sm font-medium transition-colors"
            >
              <ChevronLeft size={18} className="mr-1" /> Volver
            </button>
            <h2 className="text-2xl font-bold mb-2 text-center text-text-heading">
              Elige un portal de negocio
            </h2>
            <p className="text-text-muted text-center mb-8 text-sm">
              Tienes acceso a {accessibleBusinessPortals.length} portales. Selecciona uno para entrar.
            </p>
            <div className="space-y-3 ui-stagger">
              {accessibleBusinessPortals.map((ws) => {
                const role = user ? ws.roles?.[user.uid] : undefined;
                const roleLabel =
                  role === 'Owner' ? 'Propietario' :
                  role === 'Admin' ? 'Administrador' :
                  role === 'Client' ? 'Cliente' :
                  isSuperAdmin ? 'Super Admin' : 'Miembro';
                return (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => router.push(`/negocio/${ws.id}`)}
                    className="ui-choice-card w-full p-5 flex items-center text-left group"
                  >
                    <div className="ui-choice-icon w-12 h-12 rounded-xl flex items-center justify-center mr-4 shrink-0">
                      <Briefcase size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-text-heading truncate">{ws.name}</p>
                      <p className="text-xs text-text-muted mt-0.5">Rol: {roleLabel}</p>
                    </div>
                    <ChevronRight size={20} className="text-text-muted group-hover:text-text-heading shrink-0 ml-2" />
                  </button>
                );
              })}
            </div>
            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="text-xs text-text-muted mb-3">¿Tienes un código de otro proyecto?</p>
              <button
                type="button"
                onClick={() => {
                  setOnboardingMode('join-business');
                  setOnboardingInput('');
                  setOnboardingError('');
                }}
                className="text-sm text-text-heading hover:underline font-medium"
              >
                Unirse con código de invitación
              </button>
            </div>
          </div>
        ) : onboardingMode === 'decide' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto ui-stagger">
            <button onClick={() => {setOnboardingMode('create'); setOnboardingInput('');}} className="ui-choice-card p-8 group">
              <div className="ui-choice-icon w-14 h-14 bg-white/10 text-text-heading rounded-xl flex items-center justify-center mb-6"><Plus size={28} /></div>
              <h3 className="text-xl font-bold mb-3 text-white">Crear Proyecto</h3>
              <p className="text-sm text-text-muted leading-relaxed">Inicia un nuevo espacio de trabajo desde cero.</p>
            </button>
            
            <button onClick={() => {setOnboardingMode('join-team'); setOnboardingInput('');}} className="ui-choice-card p-8 group">
              <div className="ui-choice-icon w-14 h-14 bg-white/10 text-text-heading rounded-xl flex items-center justify-center mb-6"><Users size={28} /></div>
              <h3 className="text-xl font-bold mb-3 text-white">Unirse a Equipo</h3>
              <p className="text-sm text-text-muted leading-relaxed">Ingresa con un código de invitación de equipo.</p>
            </button>
          </div>
        ) : (
          <div className="ui-modal-panel ui-modal-panel--md p-8 max-w-md mx-auto relative">
            <button
              onClick={() => {
                if (onboardingMode === 'join-business' && accessibleBusinessPortals.length > 0) {
                  setOnboardingMode('select-business-portal');
                } else if (onboardingMode === 'join-business' || onboardingMode === 'join-team' || onboardingMode === 'create') {
                  setNeedsOnboarding(false);
                  setShowGateway(true);
                  setOnboardingMode('decide');
                } else {
                  setOnboardingMode('decide');
                }
                setOnboardingError('');
              }}
              className="absolute top-6 left-6 text-text-muted hover:text-text-heading flex items-center text-sm font-medium transition-colors"
            >
               <ChevronLeft size={18} className="mr-1"/> Volver
            </button>
            <div className="mt-10">
              <h2 className="text-2xl font-bold mb-6 text-center">
                {onboardingMode === 'create' ? 'Nombra tu Espacio' : 
                 onboardingMode === 'join-team' ? 'Código de Equipo' : 'Código de Negocio'}
              </h2>
              <input 
                type="text" 
                value={onboardingInput}
                onChange={(e) => setOnboardingInput(e.target.value)}
                placeholder={onboardingMode === 'create' ? "Ej. Proyecto Alpha" : "Ej. X7Y8Z9"}
                className="w-full bg-canvas border border-border rounded-xl px-5 py-4 text-white focus:outline-none focus:border-text-heading focus:ring-1 focus:ring-text-heading mb-6 text-center text-lg transition-all"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleOnboardingAction()}
              />
              {onboardingError && <p className="text-red-500 text-sm text-center mb-6">{onboardingError}</p>}
              <button 
                onClick={handleOnboardingAction}
                disabled={isOnboardingAction || !onboardingInput.trim()}
                className="w-full bg-white text-black hover:bg-btn-primary-hover font-bold py-4 rounded-xl transition-all duration-300 disabled:opacity-50 text-lg shadow-lg"
              >
                {isOnboardingAction ? 'Procesando...' : 'Continuar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
