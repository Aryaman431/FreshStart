"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  FileUser,
  Menu,
  ChevronRight,
  LogOut,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin',         label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users',   label: 'Users',    icon: Users },
  { href: '/admin/resumes', label: 'Resumes',  icon: FileText },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await fetch('/admin/logout'); } catch { /* ignore */ }
    router.push('/admin-login');
  };

  const activeLabel =
    NAV.find(n => n.href === '/admin' ? pathname === '/admin' : pathname.startsWith(n.href))?.label
    ?? 'Admin';

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <aside className={cn(
      'flex flex-col h-full bg-slate-900/95 backdrop-blur-2xl border-r border-white/5',
      mobile ? 'w-64' : 'w-56 hidden lg:flex',
    )}>
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-white/5 shrink-0">
        <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
          <FileUser className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-black text-white tracking-tight">FreshStart</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Shield className="h-2.5 w-2.5 text-violet-400" />
            <p className="text-[9px] font-bold text-violet-400 uppercase tracking-widest">Admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group',
                active
                  ? 'bg-violet-600/90 text-white shadow-lg shadow-violet-500/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white',
              )}
            >
              <Icon className={cn(
                'h-4 w-4 shrink-0 transition-colors',
                active ? 'text-white' : 'text-slate-500 group-hover:text-violet-400',
              )} />
              {label}
              {active && <ChevronRight className="h-3 w-3 ml-auto text-white/50" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/5 shrink-0 space-y-0.5">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all font-medium"
        >
          ← Back to site
        </Link>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all font-medium disabled:opacity-50"
        >
          <LogOut className="h-3.5 w-3.5" />
          {loggingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950/30">
      <SidebarContent />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 h-full"><SidebarContent mobile /></div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-sm font-black text-white uppercase tracking-wide">{activeLabel}</h1>
              <p className="text-[10px] text-slate-500 font-medium">FreshStart Admin Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-xs font-bold text-violet-400">Admin</span>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all border border-transparent hover:border-red-500/10 disabled:opacity-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
