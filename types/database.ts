// Database types generated from Supabase schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string | null
          created_at: string
          updated_at: string
          level: number
          current_xp: number
          total_xp: number
          gold: number
          gems: number
          current_streak: number
          longest_streak: number
          last_activity_date: string | null
          avatar_id: string | null
          title: string
          total_tasks_completed: number
          total_quests_completed: number
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          created_at?: string
          updated_at?: string
          level?: number
          current_xp?: number
          total_xp?: number
          gold?: number
          gems?: number
          current_streak?: number
          longest_streak?: number
          last_activity_date?: string | null
          avatar_id?: string | null
          title?: string
          total_tasks_completed?: number
          total_quests_completed?: number
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          created_at?: string
          updated_at?: string
          level?: number
          current_xp?: number
          total_xp?: number
          gold?: number
          gems?: number
          current_streak?: number
          longest_streak?: number
          last_activity_date?: string | null
          avatar_id?: string | null
          title?: string
          total_tasks_completed?: number
          total_quests_completed?: number
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: 'main' | 'side' | 'daily'
          priority: number
          difficulty: number
          tags: string[]
          status: 'pending' | 'in-progress' | 'completed' | 'overdue' | 'cancelled'
          due_date: string | null
          created_at: string
          updated_at: string
          completed_at: string | null
          is_recurring: boolean
          recurrence_pattern: Json | null
          xp_reward: number
          gold_reward: number
          parent_task_id: string | null
          sort_order: number
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          category?: 'main' | 'side' | 'daily'
          priority?: number
          difficulty?: number
          tags?: string[]
          status?: 'pending' | 'in-progress' | 'completed' | 'overdue' | 'cancelled'
          due_date?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
          is_recurring?: boolean
          recurrence_pattern?: Json | null
          xp_reward?: number
          gold_reward?: number
          parent_task_id?: string | null
          sort_order?: number
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          category?: 'main' | 'side' | 'daily'
          priority?: number
          difficulty?: number
          tags?: string[]
          status?: 'pending' | 'in-progress' | 'completed' | 'overdue' | 'cancelled'
          due_date?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
          is_recurring?: boolean
          recurrence_pattern?: Json | null
          xp_reward?: number
          gold_reward?: number
          parent_task_id?: string | null
          sort_order?: number
        }
      }
      items: {
        Row: {
          id: string
          name: string
          description: string | null
          type: 'weapon' | 'armor' | 'accessory' | 'consumable' | 'cosmetic'
          rarity: 'common' | 'rare' | 'epic' | 'legendary'
          cost_gold: number
          cost_gems: number
          effect_type: string | null
          effect_value: number | null
          effect_duration: number | null
          image_url: string | null
          emoji: string | null
          is_purchasable: boolean
          is_daily_shop: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          type: 'weapon' | 'armor' | 'accessory' | 'consumable' | 'cosmetic'
          rarity?: 'common' | 'rare' | 'epic' | 'legendary'
          cost_gold?: number
          cost_gems?: number
          effect_type?: string | null
          effect_value?: number | null
          effect_duration?: number | null
          image_url?: string | null
          emoji?: string | null
          is_purchasable?: boolean
          is_daily_shop?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          type?: 'weapon' | 'armor' | 'accessory' | 'consumable' | 'cosmetic'
          rarity?: 'common' | 'rare' | 'epic' | 'legendary'
          cost_gold?: number
          cost_gems?: number
          effect_type?: string | null
          effect_value?: number | null
          effect_duration?: number | null
          image_url?: string | null
          emoji?: string | null
          is_purchasable?: boolean
          is_daily_shop?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_inventory: {
        Row: {
          id: string
          user_id: string
          item_id: string
          quantity: number
          is_equipped: boolean
          is_active: boolean
          activated_at: string | null
          expires_at: string | null
          acquired_at: string
        }
        Insert: {
          id?: string
          user_id: string
          item_id: string
          quantity?: number
          is_equipped?: boolean
          is_active?: boolean
          activated_at?: string | null
          expires_at?: string | null
          acquired_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          item_id?: string
          quantity?: number
          is_equipped?: boolean
          is_active?: boolean
          activated_at?: string | null
          expires_at?: string | null
          acquired_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          name: string
          description: string
          category: 'tasks' | 'streaks' | 'social' | 'special'
          requirement_type: string
          requirement_value: number
          reward_xp: number
          reward_gold: number
          icon_url: string | null
          emoji: string | null
          rarity: 'common' | 'rare' | 'epic' | 'legendary'
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: 'tasks' | 'streaks' | 'social' | 'special'
          requirement_type: string
          requirement_value: number
          reward_xp?: number
          reward_gold?: number
          icon_url?: string | null
          emoji?: string | null
          rarity?: 'common' | 'rare' | 'epic' | 'legendary'
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: 'tasks' | 'streaks' | 'social' | 'special'
          requirement_type?: string
          requirement_value?: number
          reward_xp?: number
          reward_gold?: number
          icon_url?: string | null
          emoji?: string | null
          rarity?: 'common' | 'rare' | 'epic' | 'legendary'
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          progress: number
          is_unlocked: boolean
          unlocked_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          progress?: number
          is_unlocked?: boolean
          unlocked_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          progress?: number
          is_unlocked?: boolean
          unlocked_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          goal_type: 'campaign' | 'habit_tracker' | 'milestone'
          target_date: string | null
          start_date: string
          milestone_checkpoints: Json | null
          current_progress: number
          target_progress: number | null
          status: 'active' | 'completed' | 'abandoned' | 'paused'
          is_habit_tracker: boolean
          habit_start_date: string | null
          completion_xp: number
          completion_gold: number
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          goal_type?: 'campaign' | 'habit_tracker' | 'milestone'
          target_date?: string | null
          start_date?: string
          milestone_checkpoints?: Json | null
          current_progress?: number
          target_progress?: number | null
          status?: 'active' | 'completed' | 'abandoned' | 'paused'
          is_habit_tracker?: boolean
          habit_start_date?: string | null
          completion_xp?: number
          completion_gold?: number
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          goal_type?: 'campaign' | 'habit_tracker' | 'milestone'
          target_date?: string | null
          start_date?: string
          milestone_checkpoints?: Json | null
          current_progress?: number
          target_progress?: number | null
          status?: 'active' | 'completed' | 'abandoned' | 'paused'
          is_habit_tracker?: boolean
          habit_start_date?: string | null
          completion_xp?: number
          completion_gold?: number
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }
      level_history: {
        Row: {
          id: string
          user_id: string
          previous_level: number
          new_level: number
          total_xp_at_levelup: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          previous_level: number
          new_level: number
          total_xp_at_levelup: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          previous_level?: number
          new_level?: number
          total_xp_at_levelup?: number
          created_at?: string
        }
      }
    }
    Functions: {
      xp_for_level: {
        Args: { level: number }
        Returns: number
      }
      level_from_xp: {
        Args: { total_xp: number }
        Returns: number
      }
      current_level_xp: {
        Args: { total_xp: number }
        Returns: number
      }
      complete_task: {
        Args: { task_id: string }
        Returns: Json
      }
      get_active_xp_multiplier: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_active_gold_multiplier: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_streak_multiplier: {
        Args: { p_user_id: string }
        Returns: number
      }
      update_streak: {
        Args: { p_user_id: string }
        Returns: void
      }
      get_daily_stats: {
        Args: { p_user_id: string; p_date?: string }
        Returns: Json
      }
      update_achievement_progress: {
        Args: { p_user_id: string; p_requirement_type: string; p_current_value: number }
        Returns: void
      }
      initialize_user_achievements: {
        Args: { p_user_id: string }
        Returns: void
      }
    }
  }
}
