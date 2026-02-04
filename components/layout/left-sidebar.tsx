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
    <div className="h-[100dvh] flex flex-col bg-neutral-50 dark:bg-[#0a0a0a] overflow-hidden lg:overflow-y-auto">
      {/* App Name */}
      <div className="p-3 md:p-4 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
        <h1 className="text-base md:text-lg font-semibold text-neutral-900 dark:text-white">TaskHero</h1>
      </div>

      {/* Character & Stats Section */}
      <div className="p-3 md:p-4 space-y-2 md:space-y-3 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
        {/* Character Avatar with Level */}
        <div className="flex flex-col items-center gap-1 md:gap-1.5">
          {loading ? (
            <>
              <div className="w-16 h-16 md:w-24 md:h-24 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              <div className="h-5 w-12 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            </>
          ) : (
            <>
              <div className="w-16 h-16 md:w-24 md:h-24 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
                <span className="text-3xl md:text-5xl">{getAvatarEmoji(user.avatarId)}</span>
              </div>
              {/* Level Badge - separate element below avatar */}
              <div className="px-2 md:px-2.5 py-0.5 bg-purple-600 rounded-full shadow-sm">
                <span className="text-[10px] md:text-xs font-semibold text-white">Lv {user.level}</span>
              </div>
            </>
          )}
        </div>

        {/* Username + Title */}
        <div className="text-center">
          {loading ? (
            <>
              <div className="w-20 md:w-24 h-3 md:h-4 mx-auto rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse mb-1" />
              <div className="w-16 md:w-20 h-2.5 md:h-3 mx-auto rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            </>
          ) : (
            <>
              <h2 className="text-xs md:text-sm font-medium text-neutral-900 dark:text-white">{user.username}</h2>
              <p className="text-[10px] md:text-xs text-neutral-600 dark:text-neutral-400">{user.title}</p>
            </>
          )}
        </div>

        {/* XP Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] md:text-xs text-neutral-600 dark:text-neutral-400">
            <span>Level {user.level}</span>
            <span>Level {user.level + 1}</span>
          </div>
          {loading ? (
            <>
              <div className="h-1.5 md:h-2 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
              <div className="text-center text-[10px] md:text-xs text-neutral-600 dark:text-neutral-400">
                <div className="w-16 md:w-20 h-2.5 md:h-3 mx-auto rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              </div>
            </>
          ) : (
            <>
              <Progress value={xpProgress} className="h-1.5 md:h-2" />
              <div className="text-center text-[10px] md:text-xs text-neutral-600 dark:text-neutral-400">
                {user.currentXp} / {user.xpForNextLevel ?? (user.level * 100)} XP
              </div>
            </>
          )}

          {hasStreakBonus && !loading && (
            <div className="flex items-center justify-center gap-1 text-[10px] md:text-xs text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/30 border border-orange-300 dark:border-orange-900/50 rounded px-1.5 md:px-2 py-0.5 md:py-1">
              <span>🔥</span>
              <span className="font-semibold">{streakMultiplier}x XP</span>
            </div>
          )}
        </div>

        {/* Stats Grid - Compact for mobile */}
        <div className="grid grid-cols-3 gap-1.5 md:gap-2 pt-1">
          <div className="py-1.5 md:py-2 px-1.5 md:px-2 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 text-center">
            <div className="text-sm md:text-base font-semibold text-neutral-900 dark:text-white">{user.currentStreak}</div>
            <div className="text-[8px] md:text-[10px] text-neutral-500">Streak</div>
          </div>
          <div className="py-1.5 md:py-2 px-1.5 md:px-2 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 text-center">
            <div className="text-sm md:text-base font-semibold text-neutral-900 dark:text-white">{user.totalPoints}</div>
            <div className="text-[8px] md:text-[10px] text-neutral-500">Points</div>
          </div>
          <div className="py-1.5 md:py-2 px-1.5 md:px-2 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 text-center">
            <div className="text-[10px] md:text-xs font-semibold text-neutral-900 dark:text-white truncate">{user.rank}</div>
            <div className="text-[8px] md:text-[10px] text-neutral-500">Rank</div>
          </div>
        </div>
      </div>

      {/* Navigation - Scrollable on mobile */}
      <nav className="flex-1 p-2 md:p-3 pb-12 md:pb-3 overflow-hidden lg:overflow-y-auto min-h-0">
        <ul className="space-y-0.5 md:space-y-0.5">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    block px-2.5 md:px-3 py-1 md:py-2 rounded-lg text-xs md:text-sm font-medium
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
      <div className="p-2 md:p-3 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-[calc(4rem+env(safe-area-inset-bottom))] border-t border-neutral-200 dark:border-neutral-800 shrink-0">
        <button
          onClick={() => window.location.href = "/login"}
          className="w-full px-2.5 md:px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-red-600 hover:text-white transition-all duration-200 border border-neutral-300 dark:border-neutral-700 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/20"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
