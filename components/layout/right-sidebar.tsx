"use client";

import React from "react";
import { Card } from "../ui/card";
import { ItemPlaceholder } from "../placeholders/item-placeholder";
import { DailyBonusButton } from "../gamification/daily-bonus-button";
import { GoldBalance } from "../ui/gold-balance";
import { MiniLeaderboard } from "../social/mini-leaderboard";
import { useAuth } from "@/lib/supabase/auth-provider";

interface RightSidebarProps {
  shopItem?: {
    name: string;
    rarity: "common" | "rare" | "epic" | "legendary";
  };
  activePowerUps?: Array<{
    id: string;
    name: string;
    effect: string;
    timeRemaining: string;
  }>;
}

export default function RightSidebar({
  shopItem,
  activePowerUps = [],
}: RightSidebarProps) {
  const { user } = useAuth();
  return (
    <div className="h-full flex flex-col bg-neutral-50 dark:bg-[#0a0a0a]">
      {/* Header with Gold Balance */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-white">Daily Shop</h2>
          <GoldBalance size="sm" showLabel={false} className="opacity-80 hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Daily Bonus Button */}
        <DailyBonusButton />

        {/* Shop Preview Section */}
        <section>
          <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 p-4">
            <div className="flex flex-col items-center space-y-3">
              {shopItem ? (
                <>
                  <ItemPlaceholder 
                    size="180px" 
                    rarity={shopItem.rarity}
                    label={shopItem.name}
                  />
                  <button className="w-full px-3 py-2 text-sm font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors border border-neutral-200 dark:border-neutral-700">
                    Visit Shop →
                  </button>
                </>
              ) : (
                <>
                  <ItemPlaceholder 
                    size="180px" 
                    rarity="common"
                  />
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
                    New items available
                  </p>
                  <button className="w-full px-3 py-2 text-sm font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors border border-neutral-200 dark:border-neutral-700">
                    Visit Shop →
                  </button>
                </>
              )}
            </div>
          </Card>
        </section>

        {/* Active Power-Ups Section */}
        <section>
          <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-3">
            Active Buffs
          </h3>

          {activePowerUps.length === 0 ? (
            <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 p-4">
              <p className="text-sm text-neutral-500 text-center">
                No active power-ups
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {activePowerUps.map((powerUp) => (
                <Card
                  key={powerUp.id}
                  className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 p-3"
                >
                  <div className="flex items-start gap-2">
                    <ItemPlaceholder size="48px" rarity="common" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                        {powerUp.name}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        {powerUp.effect}
                      </p>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                        {powerUp.timeRemaining}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Quick Stats Widget */}
        <section>
          <MiniLeaderboard currentUserId={user?.id} />
        </section>

        {/* Old placeholder - can be removed */}
        <section className="hidden">
          <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-3">
            Leaderboard
          </h3>

          <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 p-4">
            <div className="space-y-3">
              {/* Friend placeholders - using simple circles with initials */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 flex items-center justify-center text-xs text-neutral-900 dark:text-white">
                  JD
                </div>
                <div className="flex-1">
                  <p className="text-sm text-neutral-900 dark:text-white">John Doe</p>
                  <p className="text-xs text-neutral-500">1,234 pts</p>
                </div>
                <span className="text-xs text-neutral-500">#1</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 flex items-center justify-center text-xs text-neutral-900 dark:text-white">
                  You
                </div>
                <div className="flex-1">
                  <p className="text-sm text-neutral-900 dark:text-white">You</p>
                  <p className="text-xs text-neutral-500">987 pts</p>
                </div>
                <span className="text-xs text-emerald-600 dark:text-emerald-500">#2</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 flex items-center justify-center text-xs text-neutral-900 dark:text-white">
                  AS
                </div>
                <div className="flex-1">
                  <p className="text-sm text-neutral-900 dark:text-white">Alice Smith</p>
                  <p className="text-xs text-neutral-500">765 pts</p>
                </div>
                <span className="text-xs text-neutral-500">#3</span>
              </div>

              <div className="pt-2 mt-2 border-t border-neutral-200 dark:border-neutral-800">
                <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center">
                  You're rank #2 this week
                </p>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
