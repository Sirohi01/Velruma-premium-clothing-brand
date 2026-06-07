'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      if (searchParams.get('redirect')) {
        router.push(searchParams.get('redirect') as string);
      } else if (result.roleSlug === 'customer') {
        router.push('/my-account');
      } else {
        router.push('/admin/dashboard');
      }
    } else {
      setError(result.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@velruma.com"
            required
            className="h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none transition-colors focus:border-zinc-400 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-amber-500/30"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 pr-12 text-sm outline-none transition-colors focus:border-zinc-400 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-amber-500/30"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
            >
              {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 text-sm font-semibold text-white transition-all hover:bg-zinc-800 disabled:opacity-50 dark:bg-amber-500 dark:text-black dark:hover:bg-amber-400"
        >
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <>
              Sign in
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-zinc-500">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-semibold text-zinc-900 hover:text-amber-600 dark:text-white dark:hover:text-amber-400">
          Create Account
        </Link>
      </p>

      {/* Demo credentials */}
      {/* <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/[0.06] dark:bg-white/[0.02]">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Demo Credentials</p>
        <div className="space-y-1 text-xs text-zinc-500">
          <p>Admin: <code className="rounded bg-zinc-200 px-1.5 py-0.5 font-mono text-zinc-700 dark:bg-white/10 dark:text-zinc-300">admin@velruma.com</code></p>
          <p>Password: <code className="rounded bg-zinc-200 px-1.5 py-0.5 font-mono text-zinc-700 dark:bg-white/10 dark:text-zinc-300">admin123</code></p>
        </div>
      </div> */}
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left — Brand side */}
      <div className="hidden w-1/2 flex-col justify-between bg-[#0F172A] p-12 lg:flex">
        <Link href="/" className="text-xl font-bold tracking-[0.2em] text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
          VELRUMA
        </Link>
        <div>
          <h2 className="text-3xl font-semibold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Welcome back to
            <br />
            <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              VELRUMA
            </span>
          </h2>
          <p className="mt-4 max-w-md text-zinc-400">
            Access your dashboard, manage orders, track shipments, and elevate your business operations.
          </p>
        </div>
        <p className="text-xs text-zinc-600">
          © {new Date().getFullYear()} VELRUMA. All rights reserved.
        </p>
      </div>

      {/* Right — Form side */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <Link href="/" className="mb-8 block text-center text-xl font-bold tracking-[0.2em] text-zinc-900 dark:text-white lg:hidden" style={{ fontFamily: "'Playfair Display', serif" }}>
            VELRUMA
          </Link>

          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Sign in</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Enter your credentials to access your account
          </p>

          <Suspense fallback={<div className="mt-8 flex justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent dark:border-white"></div></div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
