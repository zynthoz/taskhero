"use client";

import React, { ReactNode, useState } from "react";

interface ThreeColumnLayoutProps {
  leftSidebar: ReactNode;
  rightSidebar: ReactNode;
  children: ReactNode;
}

export default function ThreeColumnLayout({
  leftSidebar,
  rightSidebar,
  children,
}: ThreeColumnLayoutProps) {
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Mobile Overlay */}
      {(leftOpen || rightOpen) && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden"
          onClick={() => {
            setLeftOpen(false);
            setRightOpen(false);
          }}
        />
      )}

      {/* Left Sidebar - 280px */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-[280px] bg-[#0a0a0a] 
          border-r border-neutral-800 z-50 transition-transform duration-200
          ${leftOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {leftSidebar}
      </aside>

      {/* Main Content - 940px */}
      <main
        className={`
          min-h-screen transition-all duration-200
          lg:ml-[280px] lg:mr-[220px]
        `}
      >
        {/* Mobile Header with Hamburger Menus */}
        <div className="sticky top-0 z-30 flex items-center justify-between p-4 bg-[#0a0a0a] border-b border-neutral-800 lg:hidden">
          <button
            onClick={() => setLeftOpen(!leftOpen)}
            className="p-2 text-neutral-400 hover:text-white transition-colors"
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

          <h1 className="text-lg font-semibold text-white">
            TaskHero
          </h1>

          <button
            onClick={() => setRightOpen(!rightOpen)}
            className="p-2 text-neutral-400 hover:text-white transition-colors"
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
        </div>

        {/* Page Content */}
        <div className="p-6 max-w-[940px] mx-auto">{children}</div>
      </main>

      {/* Right Sidebar - 220px */}
      <aside
        className={`
          fixed top-0 right-0 h-screen w-[220px] bg-[#0a0a0a]
          border-l border-neutral-800 z-50 transition-transform duration-200
          ${rightOpen ? "translate-x-0" : "translate-x-full"}
          lg:translate-x-0
        `}
      >
        {rightSidebar}
      </aside>
    </div>
  );
}
