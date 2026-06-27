"use client";

import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import { Layers } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center py-12 sm:px-6 lg:px-8 ui-auth-shell">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Layers className="text-text-heading" size={48} />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-text-heading">Reset password</h2>
        <p className="mt-2 text-center text-sm text-text-muted">
          Enter your email to receive a reset link
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="ui-auth-card py-8 px-4 sm:px-10">
          {error && (
             <div className="bg-red-500/10 border border-red-500 text-red-500 text-sm p-3 rounded-md mb-4">
               {error}
             </div>
          )}
          {message && (
             <div className="bg-text-heading/10 border border-success text-success text-sm p-3 rounded-md mb-4">
               {message}
             </div>
          )}
          <form className="space-y-6" onSubmit={handleReset}>
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
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-btn-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-text-heading focus:ring-offset-canvas disabled:opacity-50 transition-all duration-300 hover:scale-[1.02]"
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <p className="mt-6 text-center text-sm text-text-muted">
              Remember your password?{' '}
              <Link href="/login" className="font-medium text-white hover:text-gray-300 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
