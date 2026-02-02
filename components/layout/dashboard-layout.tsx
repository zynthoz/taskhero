import React from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
}

export function DashboardLayout({ children, leftSidebar, rightSidebar }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Left Sidebar - 280px */}
      {leftSidebar && (
        <aside className="w-[280px] border-r border-gray-800 bg-primary-dark/50 backdrop-blur">
          {leftSidebar}
        </aside>
      )}
      
      {/* Main Content - 940px */}
      <main className="flex-1 max-w-[940px] p-8">
        {children}
      </main>
      
      {/* Right Sidebar - 220px */}
      {rightSidebar && (
        <aside className="w-[220px] border-l border-gray-800 bg-primary-dark/50 backdrop-blur">
          {rightSidebar}
        </aside>
      )}
    </div>
  );
}
