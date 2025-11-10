/**
 * TypeScript types for Supabase database schema
 * Generated based on database schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      studio_sessions: {
        Row: {
          id: string;
          user_email: string;
          user_wallet: string | null;
          user_name: string | null;
          user_phone: string | null;
          room_type: RoomType;
          session_date: string;
          session_time: string;
          duration_hours: number;
          status: SessionStatus;
          total_cost: number | null;
          dao_funded: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_email: string;
          user_wallet?: string | null;
          user_name?: string | null;
          user_phone?: string | null;
          room_type: RoomType;
          session_date: string;
          session_time: string;
          duration_hours: number;
          status?: SessionStatus;
          total_cost?: number | null;
          dao_funded?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_email?: string;
          user_wallet?: string | null;
          user_name?: string | null;
          user_phone?: string | null;
          room_type?: RoomType;
          session_date?: string;
          session_time?: string;
          duration_hours?: number;
          status?: SessionStatus;
          total_cost?: number | null;
          dao_funded?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      room_pricing: {
        Row: {
          id: string;
          room_type: RoomType;
          hourly_rate: number;
          description: string | null;
          features: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_type: RoomType;
          hourly_rate: number;
          description?: string | null;
          features?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          room_type?: RoomType;
          hourly_rate?: number;
          description?: string | null;
          features?: string[] | null;
          created_at?: string;
        };
      };
      dao_proposals: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          proposal_type: string;
          funding_goal: number | null;
          current_funding: number;
          status: ProposalStatus;
          created_by: string | null;
          created_at: string;
          voting_ends_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          proposal_type: string;
          funding_goal?: number | null;
          current_funding?: number;
          status?: ProposalStatus;
          created_by?: string | null;
          created_at?: string;
          voting_ends_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          proposal_type?: string;
          funding_goal?: number | null;
          current_funding?: number;
          status?: ProposalStatus;
          created_by?: string | null;
          created_at?: string;
          voting_ends_at?: string | null;
        };
      };
      dao_treasury: {
        Row: {
          id: string;
          transaction_type: TransactionType;
          amount: number;
          proposal_id: string | null;
          contributor_wallet: string | null;
          description: string | null;
          metadata: Json;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          transaction_type: TransactionType;
          amount: number;
          proposal_id?: string | null;
          contributor_wallet?: string | null;
          description?: string | null;
          metadata?: Json;
          created_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          transaction_type?: TransactionType;
          amount?: number;
          proposal_id?: string | null;
          contributor_wallet?: string | null;
          description?: string | null;
          metadata?: Json;
          created_at?: string;
          created_by?: string | null;
        };
      };
    };
    Views: {
      dao_analytics: {
        Row: {
          total_proposals: number;
          funded_count: number;
          active_count: number;
          rejected_count: number;
          total_raised: number;
          total_goals: number;
          total_transactions: number;
          total_contributions: number;
          total_disbursements: number;
          total_grants: number;
          total_revenue: number;
          total_expenses: number;
          current_balance: number;
          unique_contributors: number;
          last_updated: string;
        };
      };
      recent_treasury_transactions: {
        Row: {
          id: string;
          transaction_type: string;
          amount: number;
          contributor_wallet: string | null;
          description: string | null;
          created_at: string;
          proposal_title: string | null;
          proposal_id: string | null;
        };
      };
      monthly_treasury_summary: {
        Row: {
          month: string;
          transaction_type: string;
          transaction_count: number;
          total_amount: number;
        };
      };
      top_contributors: {
        Row: {
          contributor_wallet: string;
          contribution_count: number;
          total_contributed: number;
          last_contribution: string;
        };
      };
      proposal_funding_progress: {
        Row: {
          id: string;
          title: string;
          proposal_type: string;
          funding_goal: number;
          current_funding: number;
          funding_percentage: number;
          status: string;
          created_at: string;
          voting_ends_at: string | null;
          transaction_count: number;
          contributors: string[] | null;
        };
      };
    };
    Functions: {
      get_treasury_balance: {
        Args: Record<string, never>;
        Returns: number;
      };
      get_transaction_stats: {
        Args: {
          start_date?: string;
          end_date?: string;
        };
        Returns: {
          transaction_type: string;
          count: number;
          total: number;
          average: number;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Enum types
export type RoomType = 'recording' | 'mixing' | 'mastering' | 'podcast' | 'rehearsal';
export type SessionStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type ProposalStatus = 'active' | 'funded' | 'rejected' | 'completed';
export type TransactionType = 'contribution' | 'disbursement' | 'grant' | 'revenue' | 'expense';

// Helper types - Studio
export type StudioSession = Database['public']['Tables']['studio_sessions']['Row'];
export type StudioSessionInsert = Database['public']['Tables']['studio_sessions']['Insert'];
export type StudioSessionUpdate = Database['public']['Tables']['studio_sessions']['Update'];

export type RoomPricing = Database['public']['Tables']['room_pricing']['Row'];
export type RoomPricingInsert = Database['public']['Tables']['room_pricing']['Insert'];
export type RoomPricingUpdate = Database['public']['Tables']['room_pricing']['Update'];

// Helper types - DAO & Treasury
export type DAOProposal = Database['public']['Tables']['dao_proposals']['Row'];
export type DAOProposalInsert = Database['public']['Tables']['dao_proposals']['Insert'];
export type DAOProposalUpdate = Database['public']['Tables']['dao_proposals']['Update'];

export type TreasuryTransaction = Database['public']['Tables']['dao_treasury']['Row'];
export type TreasuryTransactionInsert = Database['public']['Tables']['dao_treasury']['Insert'];
export type TreasuryTransactionUpdate = Database['public']['Tables']['dao_treasury']['Update'];

// Helper types - Views
export type DAOAnalytics = Database['public']['Views']['dao_analytics']['Row'];
export type RecentTransaction = Database['public']['Views']['recent_treasury_transactions']['Row'];
export type MonthlySummary = Database['public']['Views']['monthly_treasury_summary']['Row'];
export type TopContributor = Database['public']['Views']['top_contributors']['Row'];
export type ProposalProgress = Database['public']['Views']['proposal_funding_progress']['Row'];

// Booking form data type
export interface BookingFormData {
  user_email: string;
  user_name: string;
  user_phone: string;
  user_wallet?: string;
  room_type: RoomType;
  session_date: string;
  session_time: string;
  duration_hours: number;
  notes?: string;
}

// Availability check response
export interface AvailabilitySlot {
  time: string;
  available: boolean;
  session_id?: string;
}

// Room info with pricing
export interface RoomInfo extends RoomPricing {
  totalCost?: number;
}

// Treasury transaction form data
export interface TreasuryTransactionFormData {
  transaction_type: TransactionType;
  amount: number;
  proposal_id?: string;
  contributor_wallet?: string;
  description?: string;
  metadata?: Record<string, any>;
}

// Transaction statistics
export interface TransactionStats {
  transaction_type: string;
  count: number;
  total: number;
  average: number;
}

// Chart data types
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TreasuryChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}
