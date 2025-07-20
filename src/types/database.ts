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
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          school: string | null
          grade: number | null
          city: string | null
          birth_date: string | null
          personality_type: string | null
          interests: string[] | null
          music_taste: string[] | null
          hobbies: string[] | null
          total_points: number
          level: number
          badges: string[] | null
          profile_visibility: string
          show_school: boolean
          show_grade: boolean
          created_at: string
          updated_at: string
          last_active: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          school?: string | null
          grade?: number | null
          city?: string | null
          birth_date?: string | null
          personality_type?: string | null
          interests?: string[] | null
          music_taste?: string[] | null
          hobbies?: string[] | null
          total_points?: number
          level?: number
          badges?: string[] | null
          profile_visibility?: string
          show_school?: boolean
          show_grade?: boolean
          created_at?: string
          updated_at?: string
          last_active?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          school?: string | null
          grade?: number | null
          city?: string | null
          birth_date?: string | null
          personality_type?: string | null
          interests?: string[] | null
          music_taste?: string[] | null
          hobbies?: string[] | null
          total_points?: number
          level?: number
          badges?: string[] | null
          profile_visibility?: string
          show_school?: boolean
          show_grade?: boolean
          created_at?: string
          updated_at?: string
          last_active?: string
        }
      }
      forum_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          color: string | null
          parent_id: string | null
          sort_order: number
          is_active: boolean
          moderator_ids: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          color?: string | null
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
          moderator_ids?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          color?: string | null
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
          moderator_ids?: string[] | null
          created_at?: string
        }
      }
      forum_topics: {
        Row: {
          id: string
          title: string
          content: string
          user_id: string
          category_id: string
          view_count: number
          like_count: number
          reply_count: number
          is_pinned: boolean
          is_locked: boolean
          is_featured: boolean
          tags: string[] | null
          media_urls: string[] | null
          poll_data: Json | null
          created_at: string
          updated_at: string
          last_activity: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          user_id: string
          category_id: string
          view_count?: number
          like_count?: number
          reply_count?: number
          is_pinned?: boolean
          is_locked?: boolean
          is_featured?: boolean
          tags?: string[] | null
          media_urls?: string[] | null
          poll_data?: Json | null
          created_at?: string
          updated_at?: string
          last_activity?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          user_id?: string
          category_id?: string
          view_count?: number
          like_count?: number
          reply_count?: number
          is_pinned?: boolean
          is_locked?: boolean
          is_featured?: boolean
          tags?: string[] | null
          media_urls?: string[] | null
          poll_data?: Json | null
          created_at?: string
          updated_at?: string
          last_activity?: string
        }
      }
      forum_posts: {
        Row: {
          id: string
          content: string
          user_id: string
          topic_id: string
          parent_id: string | null
          like_count: number
          is_solution: boolean
          media_urls: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content: string
          user_id: string
          topic_id: string
          parent_id?: string | null
          like_count?: number
          is_solution?: boolean
          media_urls?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content?: string
          user_id?: string
          topic_id?: string
          parent_id?: string | null
          like_count?: number
          is_solution?: boolean
          media_urls?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}