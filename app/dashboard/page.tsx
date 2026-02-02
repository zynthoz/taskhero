'use client'

import { useAuth } from '@/lib/supabase/auth-provider'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import ThreeColumnLayout from '@/components/layout/three-column-layout'
import LeftSidebar from '@/components/layout/left-sidebar'
import RightSidebar from '@/components/layout/right-sidebar'

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  // Mock user data matching the new design
  const mockUserData = {
    username: user?.email?.split('@')[0] || 'Hero',
    title: 'Novice Adventurer',
    level: 1,
    currentXp: 0,
    xpForNextLevel: 100,
    currentStreak: 0,
    totalPoints: 0,
    rank: 'Unranked',
  }

  return (
    <ThreeColumnLayout
      leftSidebar={<LeftSidebar user={mockUserData} />}
      rightSidebar={<RightSidebar />}
    >
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-1">Tasks</h1>
            <p className="text-sm text-neutral-400">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <button className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors">
            + New Task
          </button>
        </div>
      </div>

      {/* Hero Stats Panel */}
      <Card className="mb-8 p-6 bg-neutral-900 border-neutral-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="text-4xl font-semibold text-white mb-2">0/0</div>
            <div className="text-sm text-neutral-400">Tasks Completed</div>
          </div>

          <div className="flex flex-col items-center justify-center py-8 border-l border-r border-neutral-800">
            <div className="text-4xl font-semibold text-white mb-2">0</div>
            <div className="text-sm text-neutral-400">Day Streak</div>
          </div>

          <div className="flex flex-col items-center justify-center py-8">
            <div className="text-4xl font-semibold text-white mb-2">0</div>
            <div className="text-sm text-neutral-400">Total Points</div>
          </div>
        </div>
      </Card>

      {/* Empty State */}
      <Card className="p-12 bg-neutral-900 border-neutral-800 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-white mb-2">No tasks yet</h3>
          <p className="text-neutral-400 mb-6">
            Start your productivity journey by adding your first task
          </p>
          <button className="px-6 py-3 bg-white text-black text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors">
            + Add your first task
          </button>
        </div>
      </Card>

      {/* Phase 4 Complete Notice */}
      <Card className="mt-8 p-6 bg-emerald-950/20 border-emerald-900/50">
        <h3 className="text-lg font-semibold text-emerald-400 mb-2">
          ✅ Phase 4 Complete
        </h3>
        <p className="text-emerald-200 mb-3">
          Layout and navigation system implemented with clean, minimal design:
        </p>
        <ul className="space-y-1 text-emerald-300 text-sm">
          <li>✓ Left Sidebar (280px) with character, equipment, and navigation</li>
          <li>✓ Main Content Area (940px max-width)</li>
          <li>✓ Right Sidebar (220px) with shop and leaderboard</li>
          <li>✓ Mobile responsive with hamburger menus</li>
          <li>✓ Clean, minimal design following Linear/GitHub aesthetic</li>
          <li>✓ Solid colors, no gradients or AI clichés</li>
        </ul>
      </Card>
    </ThreeColumnLayout>
  )
}
