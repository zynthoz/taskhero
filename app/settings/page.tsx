'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/supabase/auth-provider'
import { useTheme } from '@/lib/supabase/theme-provider'
import { useRouter } from 'next/navigation'
import ThreeColumnLayout from '@/components/layout/three-column-layout'
import LeftSidebar from '@/components/layout/left-sidebar'
import RightSidebar from '@/components/layout/right-sidebar'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { AvatarSelector } from '@/components/settings/avatar-selector'
import { ToggleSwitch } from '@/components/ui/toggle-switch'

export default function SettingsPage() {
  const { user } = useAuth()
  const { 
    theme, 
    accentColor, 
    fontSize: contextFontSize,
    reduceMotion: contextReduceMotion,
    highContrast: contextHighContrast,
    setTheme: setThemeContext, 
    setAccentColor: setAccentColorContext,
    setFontSize: setFontSizeContext,
    setReduceMotion: setReduceMotionContext,
    setHighContrast: setHighContrastContext,
    reloadPreferences
  } = useTheme()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  // Profile data
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [avatarId, setAvatarId] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // Notification preferences
  const [notificationEmail, setNotificationEmail] = useState(true)
  const [notificationPush, setNotificationPush] = useState(true)
  const [notificationTaskReminders, setNotificationTaskReminders] = useState(true)
  const [notificationAchievements, setNotificationAchievements] = useState(true)
  const [notificationStreak, setNotificationStreak] = useState(true)
  const [notificationLeaderboard, setNotificationLeaderboard] = useState(false)
  const [notificationFriends, setNotificationFriends] = useState(true)
  
  // Theme preferences - synced with context
  const [localTheme, setLocalTheme] = useState<'dark' | 'light' | 'auto'>(theme)
  const [localAccentColor, setLocalAccentColor] = useState<'purple' | 'blue' | 'green' | 'orange' | 'red' | 'pink'>(accentColor as 'purple' | 'blue' | 'green' | 'orange' | 'red' | 'pink')
  
  // Timezone preference
  const [timezone, setTimezone] = useState('America/New_York')
  
  // Privacy settings
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'friends' | 'private'>('public')
  const [showStats, setShowStats] = useState(true)
  const [showAchievements, setShowAchievements] = useState(true)
  const [showActivity, setShowActivity] = useState(true)
  
  // Accessibility settings - synced with context
  const [localReduceMotion, setLocalReduceMotion] = useState(contextReduceMotion)
  const [localHighContrast, setLocalHighContrast] = useState(contextHighContrast)
  const [localFontSize, setLocalFontSize] = useState<'small' | 'medium' | 'large'>(contextFontSize)

  // Sync context values when they change
  useEffect(() => {
    setLocalTheme(theme)
    setLocalAccentColor(accentColor as 'purple' | 'blue' | 'green' | 'orange' | 'red' | 'pink')
    setLocalFontSize(contextFontSize)
    setLocalReduceMotion(contextReduceMotion)
    setLocalHighContrast(contextHighContrast)
  }, [theme, accentColor, contextFontSize, contextReduceMotion, contextHighContrast])

  // User data for sidebar
  const [userData, setUserData] = useState({
    username: user?.email?.split('@')[0] || 'Hero',
    title: 'Adventurer',
    level: 1,
    currentXp: 0,
    xpForNextLevel: undefined as number | undefined,
    currentStreak: 0,
    totalPoints: 0,
    rank: 'Unranked',
    avatarId: 'hero_1',
  })
  const [profileLoaded, setProfileLoaded] = useState(false)

  useEffect(() => {
    loadUserData()
  }, [user])

  const loadUserData = async () => {
    if (!user) return

    const supabase = createClient()
    const { data } = await supabase
      .from('users')
      .select(`
        username, level, current_xp, total_xp, current_streak, avatar_id,
        notification_email, notification_push, notification_task_reminders,
        notification_achievements, notification_streak, notification_leaderboard,
        notification_friends, theme, accent_color, timezone, profile_visibility,
        show_stats, show_achievements, show_activity, reduce_motion, high_contrast,
        font_size
      `)
      .eq('id', user.id)
      .single()

    if (data) {
      setUsername(data.username || '')
      setEmail(user.email || '')
      setAvatarId(data.avatar_id || 'hero_1')
      
      // Load notification preferences
      setNotificationEmail(data.notification_email ?? true)
      setNotificationPush(data.notification_push ?? true)
      setNotificationTaskReminders(data.notification_task_reminders ?? true)
      setNotificationAchievements(data.notification_achievements ?? true)
      setNotificationStreak(data.notification_streak ?? true)
      setNotificationLeaderboard(data.notification_leaderboard ?? false)
      setNotificationFriends(data.notification_friends ?? true)
      
      // Load theme preferences
      setLocalTheme(data.theme || 'dark')
      setLocalAccentColor(data.accent_color || 'purple')
      
      // Load timezone
      setTimezone(data.timezone || 'America/New_York')
      
      // Load privacy settings
      setProfileVisibility(data.profile_visibility || 'public')
      setShowStats(data.show_stats ?? true)
      setShowAchievements(data.show_achievements ?? true)
      setShowActivity(data.show_activity ?? true)
      
      // Load accessibility settings
      setLocalReduceMotion(data.reduce_motion ?? false)
      setLocalHighContrast(data.high_contrast ?? false)
      setLocalFontSize(data.font_size || 'medium')
      
      setUserData({
        username: data.username || user.email?.split('@')[0] || 'Hero',
        title: 'Adventurer',
        level: data.level || 1,
        currentXp: data.current_xp || 0,
        xpForNextLevel: (data.level || 1) * 100,
        currentStreak: data.current_streak || 0,
        totalPoints: data.total_xp || 0,
        rank: 'Unranked',
        avatarId: data.avatar_id || 'hero_1',
      })
      setProfileLoaded(true)
    }
  }

  const handleUpdateProfile = async () => {
    setLoading(true)
    setMessage({ type: '', text: '' })

    const supabase = createClient()
    const { error } = await supabase
      .from('users')
      .update({ username, avatar_id: avatarId })
      .eq('id', user?.id)

    setLoading(false)

    if (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' })
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully' })
      loadUserData()
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }

    setLoading(true)
    setMessage({ type: '', text: '' })

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    setLoading(false)

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Password changed successfully' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  const handleUpdatePreferences = async () => {
    setLoading(true)
    setMessage({ type: '', text: '' })

    const supabase = createClient()
    const { error } = await supabase
      .from('users')
      .update({
        notification_email: notificationEmail,
        notification_push: notificationPush,
        notification_task_reminders: notificationTaskReminders,
        notification_achievements: notificationAchievements,
        notification_streak: notificationStreak,
        notification_leaderboard: notificationLeaderboard,
        notification_friends: notificationFriends,
        theme: localTheme,
        accent_color: localAccentColor,
        timezone: timezone,
        profile_visibility: profileVisibility,
        show_stats: showStats,
        show_achievements: showAchievements,
        show_activity: showActivity,
        reduce_motion: localReduceMotion,
        high_contrast: localHighContrast,
        font_size: localFontSize,
      })
      .eq('id', user?.id)

    setLoading(false)

    if (error) {
      setMessage({ type: 'error', text: 'Failed to update preferences' })
      console.error('Error updating preferences:', error)
    } else {
      // Apply all settings immediately via context
      setThemeContext(localTheme)
      setAccentColorContext(localAccentColor)
      setFontSizeContext(localFontSize)
      setReduceMotionContext(localReduceMotion)
      setHighContrastContext(localHighContrast)
      setHasUnsavedChanges(false)
      setMessage({ type: 'success', text: 'Preferences saved successfully!' })
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  // Handlers for marking unsaved changes (no immediate preview)
  const handleThemeChange = (newTheme: 'dark' | 'light' | 'auto') => {
    setLocalTheme(newTheme)
    setHasUnsavedChanges(true)
  }

  const handleAccentColorChange = (newColor: 'purple' | 'blue' | 'green' | 'orange' | 'red' | 'pink') => {
    setLocalAccentColor(newColor)
    setHasUnsavedChanges(true)
  }

  const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
    setLocalFontSize(size)
    setHasUnsavedChanges(true)
  }

  const handleReduceMotionChange = (reduce: boolean) => {
    setLocalReduceMotion(reduce)
    setHasUnsavedChanges(true)
  }

  const handleHighContrastChange = (contrast: boolean) => {
    setLocalHighContrast(contrast)
    setHasUnsavedChanges(true)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    )
    
    if (!confirmed) return

    setLoading(true)
    const supabase = createClient()
    
    // Delete user data (cascade will handle related records)
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', user?.id)

    if (!error) {
      await supabase.auth.signOut()
      router.push('/signup')
    } else {
      setLoading(false)
      setMessage({ type: 'error', text: 'Failed to delete account' })
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9] dark:bg-[#0a0a0a]">
        <div className="text-neutral-900 dark:text-white text-lg">Please log in to access settings</div>
      </div>
    )
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'account', label: 'Account', icon: '🔐' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'danger', label: 'Danger Zone', icon: '⚠️' },
  ]

  return (
    <ThreeColumnLayout
      leftSidebar={<LeftSidebar user={userData} loading={!profileLoaded} />}
      rightSidebar={<RightSidebar />}
    >
      <div>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-1">Settings</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Manage your account and preferences</p>
        </div>

        {/* Message */}
        {message.text && (
          <Card className={`p-4 mb-6 ${
            message.type === 'success' 
              ? 'bg-green-950/20 border-green-900/50' 
              : 'bg-red-950/20 border-red-900/50'
          }`}>
            <p className={`text-sm ${
              message.type === 'success' ? 'text-green-400' : 'text-red-400'
            }`}>
              {message.text}
            </p>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-1.5 md:gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2.5 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <span className="mr-1 md:mr-2">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Avatar Selection */}
            <Card className="p-6 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Character Avatar</h2>
              <AvatarSelector 
                selectedAvatarId={avatarId}
                onSelect={setAvatarId}
              />
              <Button
                onClick={handleUpdateProfile}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 mt-6"
              >
                {loading ? 'Saving...' : 'Save Avatar'}
              </Button>
            </Card>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            {/* Account Information */}
            <Card className="p-6 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Account Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">Username</label>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-neutral-50 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white"
                    placeholder="Your username"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    This is how other players will see you
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">Email</label>
                  <Input
                    type="email"
                    value={email}
                    disabled
                    className="bg-neutral-50 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-800 text-neutral-500"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Email cannot be changed
                  </p>
                </div>

                <Button
                  onClick={handleUpdateProfile}
                  disabled={loading || !username}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? 'Saving...' : 'Update Username'}
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Change Password</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">New Password</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-neutral-50 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">Confirm Password</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-neutral-50 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white"
                    placeholder="Confirm new password"
                  />
                </div>

                <Button
                  onClick={handleChangePassword}
                  disabled={loading || !newPassword || !confirmPassword}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? 'Updating...' : 'Change Password'}
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Sign Out</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Sign out of your account on this device
              </p>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="border-neutral-700 hover:bg-neutral-800"
              >
                Sign Out
              </Button>
            </Card>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="space-y-6 pb-24">
            {/* Sticky Save Button */}
            <div className="sticky top-0 z-10 bg-[#FAFAF9]/95 dark:bg-neutral-950/95 backdrop-blur-sm p-4 -mx-4 -mt-4 mb-4 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Preferences</h2>
                  {hasUnsavedChanges && (
                    <p className="text-xs text-orange-400">You have unsaved changes</p>
                  )}
                </div>
                <Button
                  onClick={handleUpdatePreferences}
                  disabled={loading || !hasUnsavedChanges}
                  className={`${hasUnsavedChanges ? 'bg-purple-600 hover:bg-purple-700' : 'bg-neutral-700'} min-w-32`}
                >
                  {loading ? 'Saving...' : hasUnsavedChanges ? 'Save All Changes' : 'All Saved ✓'}
                </Button>
              </div>
              {message.text && (
                <div className={`mt-2 text-sm ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {message.text}
                </div>
              )}
            </div>

            <Card className="p-6 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Notification Preferences</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                Choose what notifications you want to receive
              </p>
              
              <div className="space-y-4">
                {/* Email Notifications */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-white">Email Notifications</h3>
                    <p className="text-xs text-neutral-500">Receive notifications via email</p>
                  </div>
                  <ToggleSwitch
                    checked={notificationEmail}
                    onChange={(checked) => { setNotificationEmail(checked); setHasUnsavedChanges(true); }}
                  />
                </div>

                {/* Push Notifications */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-white">Push Notifications</h3>
                    <p className="text-xs text-neutral-500">Receive browser notifications</p>
                  </div>
                  <ToggleSwitch
                    checked={notificationPush}
                    onChange={(checked) => { setNotificationPush(checked); setHasUnsavedChanges(true); }}
                  />
                </div>

                {/* Task Reminders */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-white">Task Reminders</h3>
                    <p className="text-xs text-neutral-500">Get reminded about upcoming tasks</p>
                  </div>
                  <ToggleSwitch
                    checked={notificationTaskReminders}
                    onChange={(checked) => { setNotificationTaskReminders(checked); setHasUnsavedChanges(true); }}
                  />
                </div>

                {/* Achievement Unlocked */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-white">Achievement Unlocked</h3>
                    <p className="text-xs text-neutral-500">Notify when you unlock achievements</p>
                  </div>
                  <ToggleSwitch
                    checked={notificationAchievements}
                    onChange={(checked) => { setNotificationAchievements(checked); setHasUnsavedChanges(true); }}
                  />
                </div>

                {/* Streak Alerts */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-white">Streak Alerts</h3>
                    <p className="text-xs text-neutral-500">Get notified about your streak status</p>
                  </div>
                  <ToggleSwitch
                    checked={notificationStreak}
                    onChange={(checked) => { setNotificationStreak(checked); setHasUnsavedChanges(true); }}
                  />
                </div>

                {/* Leaderboard Updates */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-white">Leaderboard Updates</h3>
                    <p className="text-xs text-neutral-500">Updates about your leaderboard rank</p>
                  </div>
                  <ToggleSwitch
                    checked={notificationLeaderboard}
                    onChange={(checked) => { setNotificationLeaderboard(checked); setHasUnsavedChanges(true); }}
                  />
                </div>

                {/* Friend Activity */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-white">Friend Activity</h3>
                    <p className="text-xs text-neutral-500">Friend requests and activity updates</p>
                  </div>
                  <ToggleSwitch
                    checked={notificationFriends}
                    onChange={(checked) => { setNotificationFriends(checked); setHasUnsavedChanges(true); }}
                  />
                </div>
              </div>
            </Card>

            {/* Theme Customization */}
            <Card className="p-6 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Theme & Appearance</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                Customize your theme - click Save to apply
              </p>
              
              <div className="space-y-6">
                {/* Theme Mode */}
                <div>
                  <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-3">Theme Mode</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handleThemeChange('dark')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        localTheme === 'dark'
                          ? 'border-purple-500 bg-purple-950/30'
                          : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 hover:border-neutral-300 dark:hover:border-neutral-700'
                      }`}
                    >
                      <div className="text-2xl mb-2">🌙</div>
                      <div className="text-sm font-medium text-neutral-900 dark:text-white">Dark</div>
                    </button>
                    <button
                      onClick={() => handleThemeChange('light')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        localTheme === 'light'
                          ? 'border-purple-500 bg-purple-950/30'
                          : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 hover:border-neutral-300 dark:hover:border-neutral-700'
                      }`}
                    >
                      <div className="text-2xl mb-2">☀️</div>
                      <div className="text-sm font-medium text-neutral-900 dark:text-white">Light</div>
                    </button>
                    <button
                      onClick={() => handleThemeChange('auto')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        localTheme === 'auto'
                          ? 'border-purple-500 bg-purple-950/30'
                          : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 hover:border-neutral-300 dark:hover:border-neutral-700'
                      }`}
                    >
                      <div className="text-2xl mb-2">⚙️</div>
                      <div className="text-sm font-medium text-neutral-900 dark:text-white">Auto</div>
                    </button>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">
                    {localTheme === 'auto' 
                      ? 'Automatically match your system preferences' 
                      : `Always use ${localTheme} mode`
                    }
                  </p>
                </div>

                {/* Accent Color */}
                <div>
                  <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-3">Accent Color</label>
                  <div className="grid grid-cols-6 gap-2">
                    {(['purple', 'blue', 'green', 'orange', 'red', 'pink'] as const).map((color) => (
                      <button
                        key={color}
                        onClick={() => handleAccentColorChange(color)}
                        className={`h-12 rounded-lg border-2 transition-all ${
                          localAccentColor === color
                            ? 'border-white scale-105'
                            : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                        }`}
                        style={{
                          backgroundColor: 
                            color === 'purple' ? '#9333ea' :
                            color === 'blue' ? '#3b82f6' :
                            color === 'green' ? '#22c55e' :
                            color === 'orange' ? '#f97316' :
                            color === 'red' ? '#ef4444' :
                            '#ec4899'
                        }}
                      >
                        {localAccentColor === color && (
                          <div className="text-white text-lg">✓</div>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-neutral-500 mt-2 capitalize">
                    Selected: {localAccentColor}
                  </p>
                </div>
              </div>
            </Card>

            {/* Timezone Settings */}
            <Card className="p-6 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Timezone</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Set your timezone for accurate time displays
              </p>
              
              <div>
                <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">Select Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => { setTimezone(e.target.value); setHasUnsavedChanges(true); }}
                  className="w-full p-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white"
                >
                  <optgroup label="North America">
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Phoenix">Mountain Time - Arizona (MST)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="America/Anchorage">Alaska Time (AKT)</option>
                    <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
                  </optgroup>
                  <optgroup label="Europe">
                    <option value="Europe/London">London (GMT/BST)</option>
                    <option value="Europe/Paris">Paris (CET/CEST)</option>
                    <option value="Europe/Berlin">Berlin (CET/CEST)</option>
                    <option value="Europe/Rome">Rome (CET/CEST)</option>
                    <option value="Europe/Athens">Athens (EET/EEST)</option>
                    <option value="Europe/Moscow">Moscow (MSK)</option>
                  </optgroup>
                  <optgroup label="Asia">
                    <option value="Asia/Dubai">Dubai (GST)</option>
                    <option value="Asia/Kolkata">India (IST)</option>
                    <option value="Asia/Shanghai">China (CST)</option>
                    <option value="Asia/Tokyo">Japan (JST)</option>
                    <option value="Asia/Seoul">South Korea (KST)</option>
                    <option value="Asia/Singapore">Singapore (SGT)</option>
                  </optgroup>
                  <optgroup label="Australia & Pacific">
                    <option value="Australia/Sydney">Sydney (AEDT/AEST)</option>
                    <option value="Australia/Melbourne">Melbourne (AEDT/AEST)</option>
                    <option value="Australia/Perth">Perth (AWST)</option>
                    <option value="Pacific/Auckland">Auckland (NZDT/NZST)</option>
                  </optgroup>
                </select>
              </div>
            </Card>

            {/* Privacy Settings */}
            <Card className="p-6 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Privacy Settings</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                Control who can see your profile and activity
              </p>
              
              <div className="space-y-4">
                {/* Profile Visibility */}
                <div>
                  <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">Profile Visibility</label>
                  <select
                    value={profileVisibility}
                    onChange={(e) => { setProfileVisibility(e.target.value as 'public' | 'friends' | 'private'); setHasUnsavedChanges(true); }}
                    className="w-full p-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white"
                  >
                    <option value="public">🌍 Public - Anyone can view</option>
                    <option value="friends">👥 Friends Only</option>
                    <option value="private">🔒 Private - Only you</option>
                  </select>
                  <p className="text-xs text-neutral-500 mt-1">
                    Who can see your profile information
                  </p>
                </div>

                {/* Show Stats */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-white">Show Statistics</h3>
                    <p className="text-xs text-neutral-500">Display your stats on your profile</p>
                  </div>
                  <ToggleSwitch
                    checked={showStats}
                    onChange={(checked) => { setShowStats(checked); setHasUnsavedChanges(true); }}
                  />
                </div>

                {/* Show Achievements */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-white">Show Achievements</h3>
                    <p className="text-xs text-neutral-500">Display earned achievements</p>
                  </div>
                  <ToggleSwitch
                    checked={showAchievements}
                    onChange={(checked) => { setShowAchievements(checked); setHasUnsavedChanges(true); }}
                  />
                </div>

                {/* Show Activity */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-white">Show Activity</h3>
                    <p className="text-xs text-neutral-500">Let others see your recent activity</p>
                  </div>
                  <ToggleSwitch
                    checked={showActivity}
                    onChange={(checked) => { setShowActivity(checked); setHasUnsavedChanges(true); }}
                  />
                </div>
              </div>
            </Card>

            {/* Accessibility Settings */}
            <Card className="p-6 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Accessibility</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                Customize the app for better accessibility
              </p>
              
              <div className="space-y-4">
                {/* Reduce Motion */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-white">Reduce Motion</h3>
                    <p className="text-xs text-neutral-500">Minimize animations and transitions</p>
                  </div>
                  <ToggleSwitch
                    checked={localReduceMotion}
                    onChange={handleReduceMotionChange}
                  />
                </div>

                {/* High Contrast */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-white">High Contrast</h3>
                    <p className="text-xs text-neutral-500">Increase contrast for better visibility</p>
                  </div>
                  <ToggleSwitch
                    checked={localHighContrast}
                    onChange={handleHighContrastChange}
                  />
                </div>

                {/* Font Size */}
                <div>
                  <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">Font Size</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handleFontSizeChange('small')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        localFontSize === 'small'
                          ? 'border-purple-500 bg-purple-950/30'
                          : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 hover:border-neutral-300 dark:hover:border-neutral-700'
                      }`}
                    >
                      <div className="text-xs font-medium text-neutral-900 dark:text-white">Aa</div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Small</div>
                    </button>
                    <button
                      onClick={() => handleFontSizeChange('medium')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        localFontSize === 'medium'
                          ? 'border-purple-500 bg-purple-950/30'
                          : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 hover:border-neutral-300 dark:hover:border-neutral-700'
                      }`}
                    >
                      <div className="text-sm font-medium text-neutral-900 dark:text-white">Aa</div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Medium</div>
                    </button>
                    <button
                      onClick={() => handleFontSizeChange('large')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        localFontSize === 'large'
                          ? 'border-purple-500 bg-purple-950/30'
                          : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 hover:border-neutral-300 dark:hover:border-neutral-700'
                      }`}
                    >
                      <div className="text-base font-medium text-neutral-900 dark:text-white">Aa</div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Large</div>
                    </button>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2 capitalize">
                    Selected: {localFontSize}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Danger Zone Tab */}
        {activeTab === 'danger' && (
          <div className="space-y-6">
            <Card className="p-6 bg-red-950/20 border-red-900/50">
              <h2 className="text-lg font-semibold text-red-400 mb-4">Delete Account</h2>
              <p className="text-sm text-neutral-400 mb-4">
                Once you delete your account, there is no going back. All your data, including tasks, achievements, and progress will be permanently deleted.
              </p>
              <Button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading ? 'Deleting...' : 'Delete Account'}
              </Button>
            </Card>
          </div>
        )}
      </div>
    </ThreeColumnLayout>
  )
}
