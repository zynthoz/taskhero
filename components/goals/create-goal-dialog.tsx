'use client'

import { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/supabase/auth-provider'

interface CreateGoalDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface MilestoneInput {
  name: string
  value: number
}

export function CreateGoalDialog({ isOpen, onClose, onSuccess }: CreateGoalDialogProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal_type: 'campaign' as 'campaign' | 'habit_tracker' | 'milestone',
    target_progress: 100,
    completion_xp: 500,
    completion_gold: 100,
    target_date: '',
  })
  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    { name: 'Day 30', value: 30 },
    { name: 'Day 60', value: 60 },
    { name: 'Day 90', value: 90 },
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    const supabase = createClient()

    const milestoneCheckpoints = milestones.map(m => ({
      name: m.name,
      value: m.value,
      completed: false,
    }))

    // Calculate XP based on goal duration and difficulty
    let calculatedXP = 0
    let calculatedGold = 0
    if (formData.target_date) {
      // Calculate days from now to target date
      const now = new Date()
      const targetDate = new Date(formData.target_date)
      const daysUntilDeadline = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      calculatedXP = Math.max(daysUntilDeadline * 10, 100) // Minimum 100 XP
      calculatedGold = Math.max(daysUntilDeadline * 5, 50) // Minimum 50 Gold
    } else {
      // Use target progress as basis (e.g., 100 days = 1000 XP, 50 books = 500 XP)
      calculatedXP = Math.max(formData.target_progress * 10, 100) // Minimum 100 XP
      calculatedGold = Math.max(formData.target_progress * 5, 50) // Minimum 50 Gold
    }

    const goalData = {
      user_id: user.id,
      title: formData.title,
      description: formData.description,
      goal_type: formData.goal_type,
      target_progress: formData.target_progress,
      current_progress: 0,
      completion_xp: calculatedXP,
      completion_gold: calculatedGold,
      target_date: formData.target_date || null,
      milestone_checkpoints: formData.goal_type !== 'habit_tracker' ? milestoneCheckpoints : null,
      is_habit_tracker: formData.goal_type === 'habit_tracker',
      habit_start_date: formData.goal_type === 'habit_tracker' ? new Date().toISOString() : null,
      status: 'active',
    }

    const { error } = await supabase
      .from('goals')
      .insert([goalData])

    setIsSubmitting(false)

    if (!error) {
      // Reset form
      setFormData({
        title: '',
        description: '',
        goal_type: 'campaign',
        target_progress: 100,
        completion_xp: 500,
        completion_gold: 100,
        target_date: '',
      })
      setMilestones([
        { name: 'Day 30', value: 30 },
        { name: 'Day 60', value: 60 },
        { name: 'Day 90', value: 90 },
      ])
      onSuccess()
      onClose()
    }
  }

  const addMilestone = () => {
    setMilestones([...milestones, { name: '', value: 0 }])
  }

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index))
  }

  const updateMilestone = (index: number, field: 'name' | 'value', value: string | number) => {
    const updated = [...milestones]
    updated[index] = { ...updated[index], [field]: value }
    setMilestones(updated)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-neutral-800">
          <h2 className="text-lg font-semibold text-white">Create New Goal</h2>
          <p className="text-neutral-500 text-xs mt-0.5">Set up a long-term goal or habit to track</p>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Goal Type Selection */}
          <div>
            <label className="block text-white text-xs font-medium mb-2">Goal Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(['campaign', 'habit_tracker', 'milestone'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, goal_type: type })}
                  className={`p-2 rounded border text-xs font-medium transition-colors ${
                    formData.goal_type === type
                      ? 'bg-blue-900/20 border-blue-600 text-blue-400'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  {type === 'campaign' && 'Campaign'}
                  {type === 'habit_tracker' && 'Habit Tracker'}
                  {type === 'milestone' && 'Milestone'}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-white text-xs font-medium mb-1.5">Title</label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Quit Smoking, Learn Spanish, Read 50 Books"
              required
              className="bg-neutral-950 border-neutral-800 text-white text-sm h-9"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-white text-xs font-medium mb-1.5">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your goal..."
              rows={2}
              className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded text-white text-sm placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Target Progress & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white text-xs font-medium mb-1.5">
                {formData.goal_type === 'habit_tracker' ? 'Goal (Days)' : formData.goal_type === 'milestone' ? 'Goal (Units)' : 'Total Progress'}
              </label>
              <Input
                type="number"
                value={formData.target_progress}
                onChange={(e) => setFormData({ ...formData, target_progress: parseInt(e.target.value) || 0 })}
                min="1"
                required
                className="bg-neutral-950 border-neutral-800 text-white text-sm h-9"
              />
            </div>
            <div>
              <label className="block text-white text-xs font-medium mb-1.5">Deadline (Optional)</label>
              <Input
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                className="bg-neutral-950 border-neutral-800 text-white text-sm h-9 [&::-webkit-calendar-picker-indicator]:invert"
              />
            </div>
          </div>

          {/* Milestones (only for campaign/milestone types) */}
          {formData.goal_type !== 'habit_tracker' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-white text-xs font-medium">Milestones</label>
                <button
                  type="button"
                  onClick={addMilestone}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  + Add Milestone
                </button>
              </div>
              <div className="space-y-2">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="text"
                      value={milestone.name}
                      onChange={(e) => updateMilestone(index, 'name', e.target.value)}
                      placeholder="Milestone name"
                      className="flex-1 bg-neutral-950 border-neutral-800 text-white text-sm h-8"
                    />
                    <Input
                      type="number"
                      value={milestone.value}
                      onChange={(e) => updateMilestone(index, 'value', parseInt(e.target.value) || 0)}
                      placeholder="Value"
                      className="w-20 bg-neutral-950 border-neutral-800 text-white text-sm h-8"
                    />
                    <button
                      type="button"
                      onClick={() => removeMilestone(index)}
                      className="px-2 text-xs text-neutral-500 hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info about rewards */}
          <div className="p-2 bg-neutral-800/30 rounded border border-neutral-700">
            <p className="text-[10px] text-neutral-400">
              💡 <strong className="text-neutral-300">Rewards:</strong> XP and Gold are automatically calculated based on goal difficulty and duration. You'll receive rewards only when the goal is completed.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-3 border-t border-neutral-800">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1 h-9 text-sm"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1 h-9 text-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
