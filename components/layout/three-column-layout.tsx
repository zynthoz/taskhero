"use client";

import React, { ReactNode, useState, useEffect } from "react";

interface ThreeColumnLayoutProps {
  leftSidebar: ReactNode;
  rightSidebar: ReactNode | null;
  children: ReactNode;
  expandedMain?: boolean;
}

export default function ThreeColumnLayout({
  leftSidebar,
  rightSidebar,
  children,
  expandedMain = false,
}: ThreeColumnLayoutProps) {
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  const hasRightSidebar = rightSidebar !== null && !expandedMain;

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (leftOpen || rightOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [leftOpen, rightOpen]);

  return (
    <div className="min-h-screen bg-[#FAFAF9] dark:bg-neutral-950">
      {/* Mobile Overlay */}
      {(leftOpen || (rightOpen && hasRightSidebar)) && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/80 z-40 lg:hidden"
          onClick={() => {
            setLeftOpen(false);
            setRightOpen(false);
          }}
        />
      )}

      {/* Left Sidebar - 280px */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-[280px] bg-neutral-50 dark:bg-neutral-950 
          border-r border-neutral-200 dark:border-neutral-800 z-50 transition-transform duration-200
          ${leftOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {leftSidebar}
      </aside>

      {/* Main Content */}
      <main
        className={`
          min-h-screen transition-all duration-200
          lg:ml-[280px] ${hasRightSidebar ? 'lg:mr-[220px]' : 'lg:mr-0'}
        `}
      >
        {/* Mobile Header with Hamburger Menus */}
        <div className="sticky top-0 z-30 flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 lg:hidden">
          <button
            onClick={() => setLeftOpen(!leftOpen)}
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
            aria-label="Toggle left menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
            TaskHero
          </h1>

          {hasRightSidebar ? (
            <button
              onClick={() => setRightOpen(!rightOpen)}
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              aria-label="Toggle right menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>
          ) : (
            <div className="w-10" /> // Spacer to keep title centered
          )}
        </div>

        {/* Page Content */}
        <div className={`p-6 ${expandedMain ? 'max-w-full' : 'max-w-[940px]'} mx-auto`}>{children}</div>
      </main>

      {/* Right Sidebar - 220px (only rendered if present and not expanded) */}
      {hasRightSidebar && (
        <aside
          className={`
            fixed top-0 right-0 h-screen w-[220px] bg-neutral-50 dark:bg-neutral-950
            border-l border-neutral-200 dark:border-neutral-800 z-50 transition-transform duration-200
            ${rightOpen ? "translate-x-0" : "translate-x-full"}
            lg:translate-x-0
          `}
        >
          {rightSidebar}
        </aside>
      )}
    </div>
  );
}
