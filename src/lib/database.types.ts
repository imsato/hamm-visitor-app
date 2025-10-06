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
      visitors: {
        Row: {
          id: string
          name: string
          company: string
          department: string
          contact_person: string
          purpose: string
          phone: string
          email: string | null
          visitor_count: number
          has_parking: boolean
          vehicle_number: string | null
          check_in_time: string
          check_out_time: string | null
          status: 'checked-in' | 'checked-out'
          badge_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          company: string
          department: string
          contact_person: string
          purpose: string
          phone: string
          email?: string | null
          visitor_count?: number
          has_parking?: boolean
          vehicle_number?: string | null
          check_in_time?: string
          check_out_time?: string | null
          status?: 'checked-in' | 'checked-out'
          badge_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          company?: string
          department?: string
          contact_person?: string
          purpose?: string
          phone?: string
          email?: string | null
          visitor_count?: number
          has_parking?: boolean
          vehicle_number?: string | null
          check_in_time?: string
          check_out_time?: string | null
          status?: 'checked-in' | 'checked-out'
          badge_number?: string | null
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}