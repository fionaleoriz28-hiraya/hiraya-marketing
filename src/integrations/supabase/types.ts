export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ad_campaigns: {
        Row: {
          ad_copy: string | null
          budget: number | null
          created_at: string
          id: string
          name: string
          notes: string | null
          objective: string | null
          platform: string
          status: string
          targeting: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ad_copy?: string | null
          budget?: number | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          objective?: string | null
          platform: string
          status?: string
          targeting?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ad_copy?: string | null
          budget?: number | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          objective?: string | null
          platform?: string
          status?: string
          targeting?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      agent_requests: {
        Row: {
          contact: string
          created_at: string
          details: string | null
          id: string
          preferred_time: string | null
          status: string
          topic: string
          user_id: string
        }
        Insert: {
          contact: string
          created_at?: string
          details?: string | null
          id?: string
          preferred_time?: string | null
          status?: string
          topic: string
          user_id: string
        }
        Update: {
          contact?: string
          created_at?: string
          details?: string | null
          id?: string
          preferred_time?: string | null
          status?: string
          topic?: string
          user_id?: string
        }
        Relationships: []
      }
      assistant_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      audits: {
        Row: {
          answers: Json
          created_at: string
          gaps: Json
          id: string
          recommendations: Json
          score: number
          strengths: Json
          summary: string | null
          user_id: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          gaps?: Json
          id?: string
          recommendations?: Json
          score?: number
          strengths?: Json
          summary?: string | null
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          gaps?: Json
          id?: string
          recommendations?: Json
          score?: number
          strengths?: Json
          summary?: string | null
          user_id?: string
        }
        Relationships: []
      }
      businesses: {
        Row: {
          audience: string | null
          created_at: string
          goals: string | null
          id: string
          industry: string | null
          location: string | null
          monthly_budget: number | null
          name: string
          platforms: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          audience?: string | null
          created_at?: string
          goals?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          monthly_budget?: number | null
          name: string
          platforms?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          audience?: string | null
          created_at?: string
          goals?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          monthly_budget?: number | null
          name?: string
          platforms?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          sender: string
          sender_id: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          sender: string
          sender_id?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender?: string
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      content_items: {
        Row: {
          caption: string
          created_at: string
          hashtags: string | null
          id: string
          platform: string
          scheduled_date: string
          status: string
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          caption?: string
          created_at?: string
          hashtags?: string | null
          id?: string
          platform: string
          scheduled_date?: string
          status?: string
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          caption?: string
          created_at?: string
          hashtags?: string | null
          id?: string
          platform?: string
          scheduled_date?: string
          status?: string
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          agent_id: string | null
          created_at: string
          id: string
          last_message_at: string
          mode: string
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          id?: string
          last_message_at?: string
          mode?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          id?: string
          last_message_at?: string
          mode?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      growth_snapshots: {
        Row: {
          created_at: string
          followers: number
          id: string
          leads: number
          period: string
          platform: string
          reach: number
          user_id: string
        }
        Insert: {
          created_at?: string
          followers?: number
          id?: string
          leads?: number
          period: string
          platform: string
          reach?: number
          user_id: string
        }
        Update: {
          created_at?: string
          followers?: number
          id?: string
          leads?: number
          period?: string
          platform?: string
          reach?: number
          user_id?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          comments: number
          created_at: string
          format: string
          id: string
          likes: number
          platform: string
          posted_at: string
          reach: number
          shares: number
          title: string
          user_id: string
        }
        Insert: {
          comments?: number
          created_at?: string
          format?: string
          id?: string
          likes?: number
          platform: string
          posted_at?: string
          reach?: number
          shares?: number
          title: string
          user_id: string
        }
        Update: {
          comments?: number
          created_at?: string
          format?: string
          id?: string
          likes?: number
          platform?: string
          posted_at?: string
          reach?: number
          shares?: number
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      strategies: {
        Row: {
          created_at: string
          details: Json
          id: string
          summary: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          details?: Json
          id?: string
          summary?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          details?: Json
          id?: string
          summary?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          id: string
          plan: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "agent" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["agent", "admin"],
    },
  },
} as const
