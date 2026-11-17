import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { ThemeProvider } from '@/components/layout/ThemeProvider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-transparent md:flex">
        <Sidebar />
        <div className="min-w-0 flex-1 md:ml-[270px]">
          <main className="mx-auto w-full max-w-[1480px] px-4 py-6 sm:px-7 sm:py-8 lg:px-10 lg:py-10">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}