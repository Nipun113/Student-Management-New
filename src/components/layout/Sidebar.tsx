'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  Menu,
  X,
  GraduationCap,
  ChevronRight,
  Moon,
  Sun,
} from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeProvider';

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const navItems = [
    {
      label: 'Overview',
      href: '/',
      icon: LayoutDashboard,
      active: pathname === '/',
    },
    {
      label: 'Students',
      href: '/students',
      icon: Users,
      active: pathname.startsWith('/students'),
    },
    {
      label: 'Courses',
      href: '/courses',
      icon: BookOpen,
      active: pathname.startsWith('/courses'),
    },
    {
      label: 'Enrollments',
      href: '/enrollments',
      icon: ClipboardList,
      active: pathname.startsWith('/enrollments'),
    },
  ];

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-surface px-4 py-3.5 md:hidden">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-500 text-white shadow-sm shadow-indigo-950">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-sm font-bold leading-none tracking-tight text-slate-100">
              Student Hub
            </span>
            <span className="mt-1 block text-[11px] text-slate-500">Management system</span>
          </div>
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col justify-between border-r border-slate-800/80 bg-surface text-slate-100 shadow-xl shadow-black/30 transition-transform duration-200 ease-in-out md:h-screen md:shadow-none ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 sm:p-6">
          <div className="mb-10 flex items-center gap-3 px-1">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-500 text-white shadow-md shadow-indigo-950">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-[15px] font-bold tracking-tight text-slate-100">
                Student Hub
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">Management system</p>
            </div>
          </div>

          <nav aria-label="Main navigation" className="space-y-1.5">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
              Workspace
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={item.active ? 'page' : undefined}
                  className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${
                    item.active
                      ? 'bg-indigo-500/15 text-indigo-300 ring-1 ring-inset ring-indigo-400/20'
                      : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100'
                  }`}
                >
                  <Icon className={`h-[18px] w-[18px] ${item.active ? 'text-indigo-300' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  {item.label}
                  {item.active && <ChevronRight className="ml-auto h-4 w-4 text-indigo-300" />}
                </Link>
              );
            })}

          </nav>
        </div>

        <div className="m-4 space-y-3 sm:m-5">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800/70 hover:text-slate-100"
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            Switch to {isDark ? 'light' : 'dark'} mode
          </button>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-indigo-500/15 text-xs font-bold text-indigo-300 ring-1 ring-inset ring-indigo-400/20">
                AD
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-200">Administrator</p>
                <p className="mt-0.5 text-xs text-slate-500">Student Hub</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}