"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { parseFirebaseError, logFirebaseError } from '@/lib/firebase-errors';
import Link from 'next/link';
import { Layers } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      // Store user doc in Firestore
      try {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email,
          name,
          createdAt: new Date().toISOString()
        });
      } catch (firestoreErr) {
        const parsed = parseFirebaseError(firestoreErr, 'guardar perfil de usuario en Firestore');
        logFirebaseError(parsed, firestoreErr);
        // Don't block registration if user doc creation fails — they can still log in
        console.warn('⚠️ Usuario creado en Auth pero falló la escritura en Firestore:', parsed.userMessage);
      }

      router.push('/');
    } catch (err: any) {
      const parsed = parseFirebaseError(err, 'registrar usuario');
      logFirebaseError(parsed, err);
      setError(parsed.userMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center py-12 sm:px-6 lg:px-8 ui-auth-shell">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="icon-glow-box w-20 h-20 mb-4 shadow-xl">
          <Layers size={40} />
        </div>
        <h2 className="mt-6 text-center text-4xl font-extrabold text-white">Create your account</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="ui-auth-card py-8 px-4 sm:px-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          {error && (
             <div className="bg-red-500/10 border border-red-500 text-red-500 text-sm p-3 rounded-md mb-4">
               {error}
             </div>
          )}
          <form className="space-y-6" onSubmit={handleRegister}>
            <div>
              <label className="block text-sm font-medium text-text-body">Full name</label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field sm:text-sm"
                />
              </div>
            </div>

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

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm transition-all duration-300 hover:scale-[1.02]"
              >
                {loading ? 'Creating...' : 'Create account'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <p className="mt-6 text-center text-sm text-text-muted">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-text-heading hover:text-text-body transition-colors">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
