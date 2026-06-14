'use client';

import React, { useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import AdminSidebar from '@/components/admin/Sidebar';
import AdminTopbar from '@/components/admin/Topbar';
import { cn } from '@/lib/utils';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <AuthProvider>
      <div className="admin-light flex h-screen overflow-hidden bg-[#f3efe7] text-zinc-950">
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />
          <main
            className={cn(
              'flex-1 overflow-y-auto',
              'scrollbar-thin scrollbar-track-transparent'
            )}
          >
            <div className="mx-auto max-w-[1600px] px-3 py-3 lg:px-4 lg:py-3">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
