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

    const goalData = {
      user_id: user.id,
      title: formData.title,
      description: formData.description,
      goal_type: formData.goal_type,
      target_progress: formData.target_progress,
      current_progress: 0,
      completion_xp: formData.completion_xp,
      completion_gold: formData.completion_gold,
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
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-neutral-800">
          <h2 className="text-2xl font-semibold text-white">Create New Goal</h2>
          <p className="text-neutral-400 text-sm mt-1">Set up a long-term goal or habit to track</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Goal Type Selection */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">Goal Type</label>
            <div className="grid grid-cols-3 gap-3">
              {(['campaign', 'habit_tracker', 'milestone'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, goal_type: type })}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
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
            <label className="block text-white text-sm font-medium mb-2">Title</label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Quit Smoking, Learn Spanish, Read 50 Books"
              required
              className="bg-neutral-950 border-neutral-800 text-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your goal..."
              rows={3}
              className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Target Progress */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Target Progress {formData.goal_type === 'habit_tracker' ? '(Days)' : '(Units)'}
            </label>
            <Input
              type="number"
              value={formData.target_progress}
              onChange={(e) => setFormData({ ...formData, target_progress: parseInt(e.target.value) || 0 })}
              min="1"
              required
              className="bg-neutral-950 border-neutral-800 text-white"
            />
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">Target Date (Optional)</label>
            <Input
              type="date"
              value={formData.target_date}
              onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
              className="bg-neutral-950 border-neutral-800 text-white"
            />
          </div>

          {/* Milestones (only for campaign/milestone types) */}
          {formData.goal_type !== 'habit_tracker' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-white text-sm font-medium">Milestones</label>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={addMilestone}
                >
                  + Add Milestone
                </Button>
              </div>
              <div className="space-y-3">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex gap-3">
                    <Input
                      type="text"
                      value={milestone.name}
                      onChange={(e) => updateMilestone(index, 'name', e.target.value)}
                      placeholder="Milestone name"
                      className="flex-1 bg-neutral-950 border-neutral-800 text-white"
                    />
                    <Input
                      type="number"
                      value={milestone.value}
                      onChange={(e) => updateMilestone(index, 'value', parseInt(e.target.value) || 0)}
                      placeholder="Day"
                      className="w-24 bg-neutral-950 border-neutral-800 text-white"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => removeMilestone(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rewards */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Completion XP</label>
              <Input
                type="number"
                value={formData.completion_xp}
                onChange={(e) => setFormData({ ...formData, completion_xp: parseInt(e.target.value) || 0 })}
                min="0"
                className="bg-neutral-950 border-neutral-800 text-white"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Completion Gold</label>
              <Input
                type="number"
                value={formData.completion_gold}
                onChange={(e) => setFormData({ ...formData, completion_gold: parseInt(e.target.value) || 0 })}
                min="0"
                className="bg-neutral-950 border-neutral-800 text-white"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-neutral-800">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
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
