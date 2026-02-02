"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Progress } from "../ui/progress";

interface LeftSidebarProps {
  user: {
    username: string;
    title: string;
    level: number;
    currentXp: number;
    xpForNextLevel: number;
    currentStreak: number;
    totalPoints: number;
    rank: string;
  };
}

export default function LeftSidebar({ user }: LeftSidebarProps) {
  const pathname = usePathname();

  const navigationItems = [
    { href: "/dashboard", label: "Tasks" },
    { href: "/goals", label: "Goals" },
    { href: "/shop", label: "Shop" },
    { href: "/inventory", label: "Inventory" },
    { href: "/achievements", label: "Achievements" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/settings", label: "Settings" },
  ];

  const xpProgress = (user.currentXp / user.xpForNextLevel) * 100;

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a]">
      {/* App Name */}
      <div className="p-4 border-b border-neutral-800">
        <h1 className="text-lg font-semibold text-white">TaskHero</h1>
      </div>

      {/* Character & Stats Section */}
      <div className="p-4 space-y-3 border-b border-neutral-800">
        {/* Character Avatar with Level */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-24 h-24 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center relative">
            <span className="text-sm text-neutral-500">Character</span>
            {/* Level Badge */}
            <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-neutral-800 border border-neutral-700 rounded-full">
              <span className="text-xs font-semibold text-white">Lv {user.level}</span>
            </div>
          </div>
        </div>

        {/* Username + Title */}
        <div className="text-center">
          <h2 className="text-sm font-medium text-white">{user.username}</h2>
          <p className="text-xs text-neutral-400">{user.title}</p>
        </div>

        {/* XP Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-neutral-400">
            <span>Level {user.level}</span>
            <span>Level {user.level + 1}</span>
          </div>
          <Progress value={xpProgress} className="h-2" />
          <div className="text-center text-xs text-neutral-400">
            {user.currentXp} / {user.xpForNextLevel} XP
          </div>
        </div>

        {/* Stats Grid - Slightly Bigger */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="py-2 px-2 bg-neutral-900 rounded-lg border border-neutral-800 text-center">
            <div className="text-base font-semibold text-white">{user.currentStreak}</div>
            <div className="text-[10px] text-neutral-500 mt-0.5">Streak</div>
          </div>
          <div className="py-2 px-2 bg-neutral-900 rounded-lg border border-neutral-800 text-center">
            <div className="text-base font-semibold text-white">{user.totalPoints}</div>
            <div className="text-[10px] text-neutral-500 mt-0.5">Points</div>
          </div>
          <div className="py-2 px-2 bg-neutral-900 rounded-lg border border-neutral-800 text-center">
            <div className="text-xs font-semibold text-white truncate">{user.rank}</div>
            <div className="text-[10px] text-neutral-500 mt-0.5">Rank</div>
          </div>
        </div>
      </div>

      {/* Navigation - Compact, No Scroll */}
      <nav className="flex-1 p-3">
        <ul className="space-y-0.5">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    block px-3 py-2 rounded-lg text-sm font-medium
                    transition-colors duration-200
                    ${
                      isActive
                        ? "bg-neutral-800 text-white"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                    }
                  `}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-neutral-800">
        <button
          onClick={() => window.location.href = "/login"}
          className="w-full px-3 py-2 rounded-lg text-sm font-medium bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors duration-200 border border-neutral-800"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
