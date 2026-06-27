"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { parseFirebaseError, logFirebaseError } from '@/lib/firebase-errors';
import Link from 'next/link';
import { Layers } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err: any) {
      const parsed = parseFirebaseError(err, 'iniciar sesión');
      logFirebaseError(parsed, err);
      setError(parsed.userMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      const userCredential = await signInWithPopup(auth, provider);
      
      // Check if user document exists, create if not
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          email: userCredential.user.email,
          name: userCredential.user.displayName || 'User',
          createdAt: new Date().toISOString()
        });
      }
      
      router.push('/');
    } catch (err: any) {
      const parsed = parseFirebaseError(err, 'iniciar sesión con Google');
      logFirebaseError(parsed, err);
      if (err.code === 'auth/unauthorized-domain') {
        setError('DOMAIN_ERROR');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('La ventana de inicio de sesión fue cerrada. Intenta de nuevo.');
      } else {
        setError(parsed.userMessage);
      }
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center py-12 sm:px-6 lg:px-8 ui-auth-shell">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="icon-glow-box w-20 h-20 mb-4 shadow-xl">
          <Layers size={40} />
        </div>
        <h2 className="mt-6 text-center text-4xl font-extrabold text-white">Welcome back</h2>
        <p className="mt-2 text-center text-sm text-text-muted">
          Sign in to access your workspace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="ui-auth-card py-8 px-4 sm:px-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          {error && error === 'DOMAIN_ERROR' ? (
             <div className="bg-surface-hover border border-border text-text-body text-sm p-4 rounded-md mb-4 shadow">
               <h3 className="font-bold text-text-heading mb-2">Acción Requerida: Dominio no autorizado</h3>
               <p className="mb-2">Para poder iniciar sesión con Google en esta ventana, necesitas añadir la URL de esta aplicación a Firebase:</p>
               <ol className="list-decimal pl-5 space-y-1 text-text-body mb-4 text-xs">
                 <li>Ve a tu consola de <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-text-body underline font-semibold">Firebase</a>.</li>
                 <li>Selecciona tu proyecto.</li>
                 <li>Ve a <strong>Authentication</strong> -{'>'} <strong>Settings</strong> -{'>'} <strong>Authorized domains</strong>.</li>
                 <li>Haz clic en <strong>Add domain</strong> y pega el siguiente dominio: <br/> <code className="bg-canvas/80 px-1.5 py-0.5 rounded break-all select-all font-mono mt-1 block">{typeof window !== 'undefined' ? window.location.hostname : '...'}</code></li>
                 <li>Guarda y vuelve a intentar iniciar sesión (recarga la página).</li>
               </ol>
               <p className="text-xs text-text-muted mt-2 italic">* O intenta usar correo y contraseña si no quieres configurarlo ahora.</p>
             </div>
          ) : error ? (
             <div className="bg-red-500/10 border border-red-500 text-red-500 text-sm p-3 rounded-md mb-4 flex flex-col">
               <span>{error}</span>
               {error.includes('popup') && (
                 <span className="text-xs text-error mt-2 font-medium">Tip: Si estás viendo la app dentro del panel interactivo, las ventanas emergentes (popups) pueden estar bloqueadas. Intenta abrir la app en una Pestaña Nueva haciendo clic en el ícono de la esquina superior derecha.</span>
               )}
             </div>
          ) : null}
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-text-body">Email address</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-body">Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field sm:text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col space-y-4 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-text-heading focus:ring-offset-canvas hover:scale-[1.02]"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-surface text-text-muted">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleSignIn}
                className="w-full inline-flex justify-center py-2 px-4 border border-border rounded-md shadow-sm bg-canvas text-sm font-medium text-text-body ui-list-row transition-colors duration-200 hover:scale-[1.02]"
              >
                Google
              </button>
            </div>
            <p className="mt-6 text-center text-sm text-text-muted">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-medium text-text-heading hover:text-text-body transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
