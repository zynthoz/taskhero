"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Progress } from "../ui/progress";
import { GoldBalance } from "../ui/gold-balance";
import { getStreakMultiplier, getStreakMultiplierText } from "@/lib/streak-utils";
import { getAvatarEmoji } from "@/lib/avatar-utils";

interface LeftSidebarProps {
  user: {
    username: string;
    title: string;
    level: number;
    currentXp: number;
    xpForNextLevel?: number | undefined;
    currentStreak: number;
    totalPoints: number;
    rank: string;
    avatarId?: string | null | undefined;
  };
  loading?: boolean;
}

export default function LeftSidebar({ user, loading = false }: LeftSidebarProps) {
  const pathname = usePathname();

  const navigationItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/tasks", label: "Tasks" },
    { href: "/calendar", label: "Calendar" },
    { href: "/goals", label: "Goals" },
    { href: "/shop", label: "Shop" },
    { href: "/inventory", label: "Inventory" },
    { href: "/achievements", label: "Achievements" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/friends", label: "Friends" },
    { href: "/profile", label: "Profile" },
    { href: "/settings", label: "Settings" },
  ];

  const xpForNext = user.xpForNextLevel && user.xpForNextLevel > 0 ? user.xpForNextLevel : undefined;
  const xpProgress = xpForNext ? (user.currentXp / xpForNext) * 100 : 0;
  const streakMultiplier = getStreakMultiplier(user.currentStreak);
  const hasStreakBonus = streakMultiplier > 1.0;

  return (
    <div className="h-full flex flex-col bg-neutral-50 dark:bg-[#0a0a0a]">
      {/* App Name */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">TaskHero</h1>
      </div>

      {/* Character & Stats Section */}
      <div className="p-4 space-y-3 border-b border-neutral-200 dark:border-neutral-800">
        {/* Character Avatar with Level */}
        <div className="flex flex-col items-center gap-2">
          {loading ? (
            <div className="w-24 h-24 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse relative" />
          ) : (
            <div className="w-24 h-24 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center relative">
              <span className="text-5xl">{getAvatarEmoji(user.avatarId)}</span>
              {/* Level Badge */}
              <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-full">
                <span className="text-xs font-semibold text-neutral-900 dark:text-white">Lv {user.level}</span>
              </div>
            </div>
          )}
        </div>

        {/* Username + Title */}
        <div className="text-center">
          {loading ? (
            <>
              <div className="w-24 h-4 mx-auto rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse mb-1" />
              <div className="w-20 h-3 mx-auto rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            </>
          ) : (
            <>
              <h2 className="text-sm font-medium text-neutral-900 dark:text-white">{user.username}</h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">{user.title}</p>
            </>
          )}
        </div>

        {/* XP Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400">
            <span>Level {user.level}</span>
            <span>Level {user.level + 1}</span>
          </div>
          {loading ? (
            <>
              <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
              <div className="text-center text-xs text-neutral-600 dark:text-neutral-400">
                <div className="w-20 h-3 mx-auto rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              </div>
            </>
          ) : (
            <>
              <Progress value={xpProgress} className="h-2" />
              <div className="text-center text-xs text-neutral-600 dark:text-neutral-400">
                {user.currentXp} / {user.xpForNextLevel ?? (user.level * 100)} XP
              </div>
            </>
          )}

          {hasStreakBonus && !loading && (
            <div className="flex items-center justify-center gap-1 text-xs text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/30 border border-orange-300 dark:border-orange-900/50 rounded px-2 py-1">
              <span>🔥</span>
              <span className="font-semibold">{streakMultiplier}x XP Bonus</span>
            </div>
          )}
        </div>

        {/* Stats Grid - Slightly Bigger */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="py-2 px-2 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 text-center">
            <div className="text-base font-semibold text-neutral-900 dark:text-white">{user.currentStreak}</div>
            <div className="text-[10px] text-neutral-500 mt-0.5">Streak</div>
          </div>
          <div className="py-2 px-2 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 text-center">
            <div className="text-base font-semibold text-neutral-900 dark:text-white">{user.totalPoints}</div>
            <div className="text-[10px] text-neutral-500 mt-0.5">Points</div>
          </div>
          <div className="py-2 px-2 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 text-center">
            <div className="text-xs font-semibold text-neutral-900 dark:text-white truncate">{user.rank}</div>
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
                    transition-all duration-200
                    ${
                      isActive
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                        : "text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:shadow-md"
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
      <div className="p-3 border-t border-neutral-200 dark:border-neutral-800">
        <button
          onClick={() => window.location.href = "/login"}
          className="w-full px-3 py-2 rounded-lg text-sm font-medium bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-red-600 hover:text-white transition-all duration-200 border border-neutral-300 dark:border-neutral-700 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/20"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
