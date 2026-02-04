'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/supabase/auth-provider'
import { CreateTaskForm } from '@/components/tasks/create-task-form'
import { TaskCard } from '@/components/tasks/task-card'
import { LevelUpModal } from '@/components/gamification/level-up-modal'
import { RewardToast } from '@/components/gamification/reward-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import ThreeColumnLayout from '@/components/layout/three-column-layout'
import LeftSidebar from '@/components/layout/left-sidebar'
import RightSidebar from '@/components/layout/right-sidebar'
import { createTask, getTasks, completeTask, deleteTask, updateOverdueTasks } from './actions'
import { Task, CreateTaskInput } from '@/types/task'
import { useLevelUp } from '@/hooks/use-level-up'
import { createClient } from '@/lib/supabase/client'
import { getStreakMultiplier } from '@/lib/streak-utils'
import { useNotifications } from '@/lib/notifications'
import { Confetti, XPGainAnimation, GoldGainAnimation, LevelUpCelebration } from '@/components/animations'
// Folder imports
import { FolderList } from '@/components/folders/folder-list'
import { CreateFolderDialog } from '@/components/folders/create-folder-dialog'
import { EditFolderDialog } from '@/components/folders/edit-folder-dialog'
import { getFolders, createFolder, updateFolder, deleteFolder, moveTaskToFolder } from '@/app/folders/actions'
import { Folder, CreateFolderInput, UpdateFolderInput } from '@/types/folder'
// Attachment imports
import { uploadFileAttachment, createChecklistAttachment, createLinkAttachment } from '@/app/attachments/actions'
import type { PendingAttachment } from '@/components/tasks/create-task-form'

export default function TasksPage() {
  const { user } = useAuth()
  const { showReward, showLevelUp: notifyLevelUp, success: notifySuccess, error: notifyError } = useNotifications()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all')
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false)
  const [userLevel, setUserLevel] = useState<number>(1)
  const { isLevelUpModalOpen, levelUpData, checkForLevelUp, closeLevelUpModal } = useLevelUp()
  const [showRewardToast, setShowRewardToast] = useState(false)
  const [rewardData, setRewardData] = useState({ xp: 0, gold: 0, streakMultiplier: 1.0 })
  const [currentStreak, setCurrentStreak] = useState(0)
  const [currentXp, setCurrentXp] = useState(0)
  const [totalXp, setTotalXp] = useState(0)
  const [userUsername, setUserUsername] = useState('')
  const [userAvatarId, setUserAvatarId] = useState<string | undefined>(undefined)
  
  // Animation states
  const [showConfetti, setShowConfetti] = useState(false)
  const [showXPAnimation, setShowXPAnimation] = useState(false)
  const [showGoldAnimation, setShowGoldAnimation] = useState(false)
  const [showLevelUpCelebration, setShowLevelUpCelebration] = useState(false)
  const [celebrationLevel, setCelebrationLevel] = useState(1)
  const [animationXP, setAnimationXP] = useState(0)
  const [animationGold, setAnimationGold] = useState(0)
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)

  // Folder states
  const [folders, setFolders] = useState<Folder[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false)
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null)
  const [loadingFolders, setLoadingFolders] = useState(true)
  const [showCompletedTasks, setShowCompletedTasks] = useState(false)

  // User data for sidebar
  const sidebarUserData = {
    username: userUsername || user?.email?.split('@')[0] || 'Hero',
    title: 'Novice Adventurer',
    level: userLevel,
    currentXp: currentXp,
    xpForNextLevel: userLevel * 100,
    currentStreak: currentStreak,
    totalPoints: totalXp,
    rank: 'Unranked',
    avatarId: userAvatarId,
  }
  const [profileLoaded, setProfileLoaded] = useState(false)

  useEffect(() => {
    loadTasks()
    loadUserData()
    loadFolders()
    // Update overdue tasks on mount
    updateOverdueTasks()
  }, [])

  const loadFolders = async () => {
    setLoadingFolders(true)
    const result = await getFolders()
    if (result.success && result.data) {
      setFolders(result.data)
    }
    setLoadingFolders(false)
  }

  const handleCreateFolder = async (data: CreateFolderInput) => {
    const result = await createFolder(data)
    if (result.success) {
      await loadFolders()
      notifySuccess(`Folder "${data.name}" created!`)
    } else {
      notifyError(result.error || 'Failed to create folder')
    }
  }

  const handleUpdateFolder = async (folderId: string, data: UpdateFolderInput) => {
    const result = await updateFolder(folderId, data)
    if (result.success) {
      await loadFolders()
      setEditingFolder(null)
      notifySuccess('Folder updated!')
    } else {
      notifyError(result.error || 'Failed to update folder')
    }
  }

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('Are you sure you want to delete this folder? Tasks will be moved to Uncategorized.')) {
      return
    }
    const result = await deleteFolder(folderId)
    if (result.success) {
      await loadFolders()
      if (selectedFolderId === folderId) {
        setSelectedFolderId(null)
      }
      notifySuccess('Folder deleted!')
    } else {
      notifyError(result.error || 'Failed to delete folder')
    }
  }

  const handleMoveTaskToFolder = async (taskId: string, folderId: string | null) => {
    const result = await moveTaskToFolder(taskId, folderId)
    if (result.success) {
      await loadTasks()
      await loadFolders()
      const folderName = folderId 
        ? folders.find(f => f.id === folderId)?.name || 'folder'
        : 'Uncategorized'
      notifySuccess(`Task moved to ${folderName}`)
    } else {
      notifyError(result.error || 'Failed to move task')
    }
  }

  const loadUserData = async () => {
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (authUser) {
      const { data: userData } = await supabase
        .from('users')
        .select('level, current_xp, total_xp, current_streak, username, avatar_id')
        .eq('id', authUser.id)
        .single()
      
      if (userData) {
        setUserLevel(userData.level || 1)
        setCurrentXp(userData.current_xp || 0)
        setTotalXp(userData.total_xp || 0)
        setCurrentStreak(userData.current_streak || 0)
        setUserUsername(userData.username || '')
        setUserAvatarId(userData.avatar_id || undefined)
        setProfileLoaded(true)
      } else {
        setProfileLoaded(true)
      }
    } else {
      setProfileLoaded(true)
    }
  }

  const loadTasks = async () => {
    setIsLoading(true)
    const result = await getTasks()
    
    if (result.success && result.data) {
      setTasks(result.data)
    } else {
      console.error('Failed to load tasks:', result.error)
    }
    
    setIsLoading(false)
  }

  const handleCreateTask = async (input: CreateTaskInput, pendingAttachments?: PendingAttachment[]) => {
    console.log('handleCreateTask called with:', input, 'attachments:', pendingAttachments?.length || 0)
    const result = await createTask(input)
    console.log('createTask result:', result)
    
    if (result.success && result.data) {
      const createdTask = result.data
      
      // Create attachments if any
      if (pendingAttachments && pendingAttachments.length > 0) {
        for (const attachment of pendingAttachments) {
          try {
            if (attachment.type === 'file') {
              await uploadFileAttachment(createdTask.id, attachment.file)
            } else if (attachment.type === 'checklist') {
              await createChecklistAttachment({
                task_id: createdTask.id,
                checklist_items: attachment.items.map((text, index) => ({
                  id: crypto.randomUUID(),
                  text,
                  checked: false,
                  sort_order: index,
                })),
              })
            } else if (attachment.type === 'link') {
              await createLinkAttachment({
                task_id: createdTask.id,
                link_url: attachment.url,
                link_title: attachment.title,
                link_description: attachment.description,
              })
            }
          } catch (err) {
            console.error('Error creating attachment:', err)
          }
        }
      }
      
      setTasks([createdTask, ...tasks])
      try {
        const bc = new BroadcastChannel('tasks')
        bc.postMessage({ type: 'update' })
        bc.close()
      } catch (err) {
        /* ignore */
      }
      notifySuccess(`Quest "${result.data.title}" accepted!`)
      console.log('Quest accepted:', result.data.title)
    } else {
      notifyError(result.error || 'Failed to create quest')
      console.error('Task creation failed:', result.error)
      throw new Error(result.error || 'Failed to create task')
    }
  }

  const handleCompleteTask = async (taskId: string) => {
    const oldLevel = userLevel
    const result = await completeTask(taskId)
    
    if (result.success && result.data) {
      setTasks(tasks.map(t => 
        t.id === taskId ? result.data!.task : t
      ))
      
      // Calculate streak multiplier
      const streakMultiplier = getStreakMultiplier(currentStreak)
      
      // Set animation data
      setAnimationXP(result.data.xpGained)
      setAnimationGold(result.data.goldGained)
      
      // Show confetti for task completion
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
      
      // Show XP animation
      setShowXPAnimation(true)
      setTimeout(() => setShowXPAnimation(false), 2000)
      
      // Show gold animation with slight delay
      setTimeout(() => {
        setShowGoldAnimation(true)
        setTimeout(() => setShowGoldAnimation(false), 2000)
      }, 300)
      
      // Show notification reward toast
      showReward(result.data.xpGained, result.data.goldGained, streakMultiplier)
      
      // Keep the legacy toast for backward compatibility
      setRewardData({ 
        xp: result.data.xpGained, 
        gold: result.data.goldGained,
        streakMultiplier
      })
      setShowRewardToast(true)
      
      // Fetch updated user data to check for level up
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (authUser) {
        const { data: userData } = await supabase
          .from('users')
          .select('level, current_streak')
          .eq('id', authUser.id)
          .single()
        
        if (userData) {
          if (userData.level > oldLevel) {
            setUserLevel(userData.level)
            checkForLevelUp(oldLevel, userData.level)
            
            // Show level up celebration animation
            setCelebrationLevel(userData.level)
            setShowLevelUpCelebration(true)
            setTimeout(() => setShowLevelUpCelebration(false), 4000)
            
            // Show level up notification
            notifyLevelUp(userData.level)
          }
          setCurrentStreak(userData.current_streak || 0)
        }
      }
      
      try {
        const bc = new BroadcastChannel('tasks')
        bc.postMessage({ type: 'update' })
        bc.close()
      } catch (err) {
        /* ignore */
      }

      console.log('Quest completed! XP:', result.data.xpGained, 'Gold:', result.data.goldGained)
    } else {
      notifyError('Failed to complete quest. Please try again.')
      console.error('Failed to complete task:', result.error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    const result = await deleteTask(taskId)
    
    if (result.success) {
      setTasks(tasks.filter(t => t.id !== taskId))
      try {
        const bc = new BroadcastChannel('tasks')
        bc.postMessage({ type: 'update' })
        bc.close()
      } catch (err) {
        /* ignore */
      }
      notifySuccess('Quest abandoned')
      console.log('Quest deleted')
    } else {
      notifyError('Failed to abandon quest')
      console.error('Failed to delete task:', result.error)
    }
  }

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData('taskId', task.id)
    setDraggedTaskId(task.id)
  }

  const handleDragEnd = () => {
    setDraggedTaskId(null)
  }

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    // Search filter - search in title and description
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesTitle = task.title.toLowerCase().includes(query)
      const matchesDescription = task.description?.toLowerCase().includes(query) || false
      
      if (!matchesTitle && !matchesDescription) {
        return false
      }
    }
    
    // Folder filter
    if (selectedFolderId !== null) {
      if ((task as any).folder_id !== selectedFolderId) {
        return false
      }
    }
    
    // Status filter
    if (filterStatus !== 'all' && task.status !== filterStatus) {
      return false
    }
    
    return true
  })

  // Separate tasks (excluding subtasks from main view)
  const parentTasks = filteredTasks.filter(t => !t.parent_task_id)
  const activeTasks = parentTasks.filter(t => t.status !== 'completed')
  const completedTasks = parentTasks.filter(t => t.status === 'completed')

  return (
    <ThreeColumnLayout
      leftSidebar={<LeftSidebar user={sidebarUserData} loading={!profileLoaded} />}
      rightSidebar={<RightSidebar />}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-1">Tasks</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <button 
            onClick={() => setIsCreateFormOpen(true)}
            className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
          >
            + New Task
          </button>
        </div>
      </div>

      {/* Main Layout with Folders Sidebar */}
      <div className="flex gap-6">
        {/* Folders Sidebar */}
        <div className="w-64 flex-shrink-0">
          <Card className="p-4 sticky top-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                📁 Folders
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateFolderDialog(true)}
                className="h-7 w-7 p-0"
              >
                +
              </Button>
            </div>
            {selectedFolderId && (
              <button
                onClick={() => setSelectedFolderId(null)}
                className="text-xs px-2 py-1 mb-3 bg-neutral-200 dark:bg-neutral-700 rounded-full hover:bg-neutral-300 dark:hover:bg-neutral-600 w-full text-center"
              >
                Clear filter ×
              </button>
            )}
            {loadingFolders ? (
              <div className="text-center py-4 text-neutral-500 text-sm">Loading...</div>
            ) : (
              <FolderList
                folders={folders}
                selectedFolderId={selectedFolderId}
                onSelectFolder={setSelectedFolderId}
                onCreateFolder={() => setShowCreateFolderDialog(true)}
                onEditFolder={setEditingFolder}
                onDeleteFolder={handleDeleteFolder}
                onDrop={handleMoveTaskToFolder}
                showCounts
                compact
              />
            )}
            <p className="text-xs text-neutral-500 mt-3">
              💡 Drag tasks onto folders
            </p>
          </Card>
        </div>

        {/* Tasks Content */}
        <div className="flex-1 min-w-0">
          {/* Search Filter */}
          <Card className="mb-4 p-3">
            <Input
              placeholder="🔍 Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Card>

          {/* Loading State */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⚙️</div>
              <div className="text-neutral-600 dark:text-neutral-400">Loading tasks...</div>
            </div>
          ) : (
            <>
              {/* Quests Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between px-3 py-2 mb-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-base">⚔️</span>
                    <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">Quests</h2>
                  </div>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">{activeTasks.length}</span>
                </div>
                
                {activeTasks.length === 0 ? (
                  <Card className="p-8 text-center">
                    <div className="text-4xl mb-3">🗺️</div>
                    <p className="text-neutral-500 text-sm">No active quests. Create one to begin your adventure!</p>
                  </Card>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {activeTasks.map(task => (
                      <div key={task.id} className="w-full sm:w-[calc(50%-6px)] lg:w-[calc(33.333%-8px)]">
                        <TaskCard
                          task={task}
                          onComplete={handleCompleteTask}
                          onDelete={handleDeleteTask}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                          isDragging={draggedTaskId === task.id}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Completed Tasks Section - Collapsible */}
              {completedTasks.length > 0 && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowCompletedTasks(!showCompletedTasks)}
                    className="flex items-center justify-between w-full px-3 py-2 mb-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{showCompletedTasks ? '▼' : '▶'}</span>
                      <span className="text-base">✓</span>
                      <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">Completed</h2>
                    </div>
                    <span className="text-sm font-bold text-neutral-900 dark:text-white">{completedTasks.length}</span>
                  </button>
                  
                  {showCompletedTasks && (
                    <div className="flex flex-wrap gap-3">
                      {completedTasks.map(task => (
                        <div key={task.id} className="w-full sm:w-[calc(50%-6px)] lg:w-[calc(33.333%-8px)]">
                          <TaskCard
                            task={task}
                            onComplete={handleCompleteTask}
                            onDelete={handleDeleteTask}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            isDragging={draggedTaskId === task.id}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Empty State */}
              {filteredTasks.length === 0 && !isLoading && (
                <Card className="p-12 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="text-6xl mb-4">🗺️</div>
                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">No Tasks Found</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                      {searchQuery 
                        ? 'Try adjusting your search' 
                        : 'Start your adventure by creating your first task!'}
                    </p>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Task Form Dialog */}
      <CreateTaskForm 
        onSubmit={handleCreateTask}
        isOpen={isCreateFormOpen}
        onOpenChange={setIsCreateFormOpen}
      />

      {/* Level Up Modal */}
      <LevelUpModal 
        isOpen={isLevelUpModalOpen}
        onClose={closeLevelUpModal}
        newLevel={levelUpData?.newLevel || 1}
        rewards={levelUpData?.rewards}
      />

      {/* Reward Toast */}
      <RewardToast 
        xp={rewardData.xp}
        gold={rewardData.gold}
        streakMultiplier={rewardData.streakMultiplier}
        show={showRewardToast}
        onClose={() => setShowRewardToast(false)}
      />

      {/* Celebration Animations */}
      <Confetti active={showConfetti} duration={3000} />
      
      <XPGainAnimation 
        amount={animationXP} 
        show={showXPAnimation} 
        onComplete={() => setShowXPAnimation(false)} 
      />
      
      <GoldGainAnimation 
        amount={animationGold} 
        show={showGoldAnimation} 
        onComplete={() => setShowGoldAnimation(false)} 
      />
      
      <LevelUpCelebration 
        level={celebrationLevel} 
        show={showLevelUpCelebration} 
        onComplete={() => setShowLevelUpCelebration(false)} 
      />

      {/* Folder Dialogs */}
      <CreateFolderDialog
        isOpen={showCreateFolderDialog}
        onClose={() => setShowCreateFolderDialog(false)}
        onSubmit={handleCreateFolder}
        parentFolders={folders}
      />

      {editingFolder && (
        <EditFolderDialog
          isOpen={!!editingFolder}
          onClose={() => setEditingFolder(null)}
          onSubmit={handleUpdateFolder}
          onDelete={handleDeleteFolder}
          folder={editingFolder}
          parentFolders={folders}
        />
      )}
    </ThreeColumnLayout>
  )
}
