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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      body_measurements: {
        Row: {
          abdomen_cm: number | null
          arm_cm: number | null
          chest_cm: number | null
          coach_id: string
          created_at: string
          hip_cm: number | null
          id: string
          measured_on: string
          notes: string | null
          thigh_cm: number | null
          updated_at: string
          waist_cm: number | null
          weight_kg: number | null
        }
        Insert: {
          abdomen_cm?: number | null
          arm_cm?: number | null
          chest_cm?: number | null
          coach_id?: string
          created_at?: string
          hip_cm?: number | null
          id?: string
          measured_on: string
          notes?: string | null
          thigh_cm?: number | null
          updated_at?: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Update: {
          abdomen_cm?: number | null
          arm_cm?: number | null
          chest_cm?: number | null
          coach_id?: string
          created_at?: string
          hip_cm?: number | null
          id?: string
          measured_on?: string
          notes?: string | null
          thigh_cm?: number | null
          updated_at?: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          amount_cents: number
          category: string | null
          coach_id: string
          created_at: string
          description: string
          id: string
          notes: string | null
          transaction_date: string
          type: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          category?: string | null
          coach_id?: string
          created_at?: string
          description: string
          id?: string
          notes?: string | null
          transaction_date: string
          type: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          category?: string | null
          coach_id?: string
          created_at?: string
          description?: string
          id?: string
          notes?: string | null
          transaction_date?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          goal: string
          height_cm: number | null
          id: string
          initial_weight_kg: number | null
          name: string
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string
          goal?: string
          height_cm?: number | null
          id: string
          initial_weight_kg?: number | null
          name?: string
          start_date?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          goal?: string
          height_cm?: number | null
          id?: string
          initial_weight_kg?: number | null
          name?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          coach_id: string
          created_at: string
          email: string | null
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          coach_id?: string
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      workout_exercises: {
        Row: {
          created_at: string
          exercise_ref: string | null
          id: string
          load_kg: number | null
          name: string
          notes: string | null
          position: number
          reps: number
          rest_seconds: number | null
          sets: number
          workout_id: string
        }
        Insert: {
          created_at?: string
          exercise_ref?: string | null
          id?: string
          load_kg?: number | null
          name: string
          notes?: string | null
          position?: number
          reps?: number
          rest_seconds?: number | null
          sets?: number
          workout_id: string
        }
        Update: {
          created_at?: string
          exercise_ref?: string | null
          id?: string
          load_kg?: number | null
          name?: string
          notes?: string | null
          position?: number
          reps?: number
          rest_seconds?: number | null
          sets?: number
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_logs: {
        Row: {
          coach_id: string
          created_at: string
          id: string
          log_date: string
          notes: string | null
          status: string
          student_id: string | null
          workout_id: string | null
        }
        Insert: {
          coach_id?: string
          created_at?: string
          id?: string
          log_date: string
          notes?: string | null
          status: string
          student_id?: string | null
          workout_id?: string | null
        }
        Update: {
          coach_id?: string
          created_at?: string
          id?: string
          log_date?: string
          notes?: string | null
          status?: string
          student_id?: string | null
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_logs_student_id_coach_id_fkey"
            columns: ["student_id", "coach_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id", "coach_id"]
          },
          {
            foreignKeyName: "workout_logs_workout_id_coach_id_fkey"
            columns: ["workout_id", "coach_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id", "coach_id"]
          },
        ]
      }
      workouts: {
        Row: {
          coach_id: string
          created_at: string
          duration_minutes: number
          estimated_calories: number | null
          id: string
          muscle_groups: string[]
          name: string
          notes: string | null
          start_time: string | null
          status: string
          student_id: string | null
          updated_at: string
          workout_date: string
        }
        Insert: {
          coach_id?: string
          created_at?: string
          duration_minutes?: number
          estimated_calories?: number | null
          id?: string
          muscle_groups?: string[]
          name: string
          notes?: string | null
          start_time?: string | null
          status?: string
          student_id?: string | null
          updated_at?: string
          workout_date: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          duration_minutes?: number
          estimated_calories?: number | null
          id?: string
          muscle_groups?: string[]
          name?: string
          notes?: string | null
          start_time?: string | null
          status?: string
          student_id?: string | null
          updated_at?: string
          workout_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "workouts_student_id_coach_id_fkey"
            columns: ["student_id", "coach_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id", "coach_id"]
          },
        ]
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
    Enums: {},
  },
} as const
