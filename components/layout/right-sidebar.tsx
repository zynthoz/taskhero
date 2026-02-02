"use client";

import React from "react";
import { Card } from "../ui/card";
import { ItemPlaceholder } from "../placeholders/item-placeholder";

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
  return (
    <div className="h-full flex flex-col bg-[#0a0a0a]">
      {/* Header */}
      <div className="p-6 border-b border-neutral-800">
        <h2 className="text-base font-semibold text-white">Daily Shop</h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Shop Preview Section */}
        <section>
          <Card className="bg-neutral-900 border-neutral-800 p-4">
            <div className="flex flex-col items-center space-y-3">
              {shopItem ? (
                <>
                  <ItemPlaceholder 
                    size="180px" 
                    rarity={shopItem.rarity}
                    label={shopItem.name}
                  />
                  <button className="w-full px-3 py-2 text-sm font-medium bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors border border-neutral-700">
                    Visit Shop →
                  </button>
                </>
              ) : (
                <>
                  <ItemPlaceholder 
                    size="180px" 
                    rarity="common"
                  />
                  <p className="text-sm text-neutral-400 text-center">
                    New items available
                  </p>
                  <button className="w-full px-3 py-2 text-sm font-medium bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors border border-neutral-700">
                    Visit Shop →
                  </button>
                </>
              )}
            </div>
          </Card>
        </section>

        {/* Active Power-Ups Section */}
        <section>
          <h3 className="text-sm font-medium text-neutral-400 mb-3">
            Active Buffs
          </h3>

          {activePowerUps.length === 0 ? (
            <Card className="bg-neutral-900 border-neutral-800 p-4">
              <p className="text-sm text-neutral-500 text-center">
                No active power-ups
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {activePowerUps.map((powerUp) => (
                <Card
                  key={powerUp.id}
                  className="bg-neutral-900 border-neutral-800 p-3"
                >
                  <div className="flex items-start gap-2">
                    <ItemPlaceholder size="48px" rarity="common" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {powerUp.name}
                      </p>
                      <p className="text-xs text-neutral-400 mt-1">
                        {powerUp.effect}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
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
          <h3 className="text-sm font-medium text-neutral-400 mb-3">
            Leaderboard
          </h3>

          <Card className="bg-neutral-900 border-neutral-800 p-4">
            <div className="space-y-3">
              {/* Friend placeholders - using simple circles with initials */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-neutral-700 border border-neutral-600 flex items-center justify-center text-xs text-white">
                  JD
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">John Doe</p>
                  <p className="text-xs text-neutral-500">1,234 pts</p>
                </div>
                <span className="text-xs text-neutral-500">#1</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-neutral-700 border border-neutral-600 flex items-center justify-center text-xs text-white">
                  You
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">You</p>
                  <p className="text-xs text-neutral-500">987 pts</p>
                </div>
                <span className="text-xs text-emerald-500">#2</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-neutral-700 border border-neutral-600 flex items-center justify-center text-xs text-white">
                  AS
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">Alice Smith</p>
                  <p className="text-xs text-neutral-500">765 pts</p>
                </div>
                <span className="text-xs text-neutral-500">#3</span>
              </div>

              <div className="pt-2 mt-2 border-t border-neutral-800">
                <p className="text-xs text-neutral-400 text-center">
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
