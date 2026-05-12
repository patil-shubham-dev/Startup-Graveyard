'use client';

import { useState } from 'react';
import { supabase } from '@/lib/db/config';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Check your email for the confirmation link.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = '/';
      }
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1F1F2E_0%,transparent_50%)] opacity-20" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md bg-surface border border-border p-8 md:p-12"
      >
        <div className="text-center mb-10">
          <span className="text-4xl mb-4 block">💀</span>
          <h1 className="font-display text-3xl font-bold mb-2">
            {isSignUp ? 'Join the Archives' : 'Dossier Access'}
          </h1>
          <p className="text-text-muted text-sm uppercase tracking-widest font-mono">
            {isSignUp ? 'Create your investigator profile' : 'Secure authentication required'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="font-mono text-[10px] text-text-dim uppercase tracking-widest block mb-2">EMAIL ADDRESS</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-2 border border-border px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm"
              placeholder="investigator@graveyard.ai"
            />
          </div>
          <div>
            <label className="font-mono text-[10px] text-text-dim uppercase tracking-widest block mb-2">PASSWORD</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-2 border border-border px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-primary hover:bg-primary-dim text-white font-bold transition-all disabled:opacity-50"
          >
            {loading ? 'PROCESSING...' : isSignUp ? 'CREATE ACCOUNT →' : 'ACCESS ARCHIVES →'}
          </button>
        </form>

        {message && (
          <p className={`mt-6 text-center text-xs font-mono uppercase tracking-wider ${message.includes('Check') ? 'text-emerald-500' : 'text-red-500'}`}>
            {message}
          </p>
        )}

        <div className="mt-8 pt-8 border-t border-border/50 text-center">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-text-muted hover:text-primary transition-colors uppercase font-mono tracking-widest"
          >
            {isSignUp ? 'Already have access? Sign In' : 'No access? Request an account'}
          </button>
        </div>
      </motion.div>
    </main>
  );
}
