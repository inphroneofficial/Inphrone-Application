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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      account_deletion_attempts: {
        Row: {
          attempted_at: string
          id: string
          success: boolean | null
          user_id: string
        }
        Insert: {
          attempted_at?: string
          id?: string
          success?: boolean | null
          user_id: string
        }
        Update: {
          attempted_at?: string
          id?: string
          success?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      audience_profiles: {
        Row: {
          content_frequency: string
          created_at: string | null
          entertainment_preferences: string[]
          favorite_platforms: string[]
          genre_interests: string[]
          id: string
          language_preferences: string[]
          motivation: string | null
          notification_preferences: string[] | null
          preferred_devices: string[]
          updated_at: string | null
          user_id: string
          willingness_to_participate: string
        }
        Insert: {
          content_frequency: string
          created_at?: string | null
          entertainment_preferences: string[]
          favorite_platforms: string[]
          genre_interests: string[]
          id?: string
          language_preferences: string[]
          motivation?: string | null
          notification_preferences?: string[] | null
          preferred_devices?: string[]
          updated_at?: string | null
          user_id: string
          willingness_to_participate?: string
        }
        Update: {
          content_frequency?: string
          created_at?: string | null
          entertainment_preferences?: string[]
          favorite_platforms?: string[]
          genre_interests?: string[]
          id?: string
          language_preferences?: string[]
          motivation?: string | null
          notification_preferences?: string[] | null
          preferred_devices?: string[]
          updated_at?: string | null
          user_id?: string
          willingness_to_participate?: string
        }
        Relationships: [
          {
            foreignKeyName: "audience_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campus_ambassadors: {
        Row: {
          ambassador_code: string
          approved_at: string | null
          college_city: string
          college_name: string
          college_state: string
          created_at: string
          id: string
          status: string | null
          student_id: string | null
          total_points: number | null
          total_referrals: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ambassador_code: string
          approved_at?: string | null
          college_city: string
          college_name: string
          college_state: string
          created_at?: string
          id?: string
          status?: string | null
          student_id?: string | null
          total_points?: number | null
          total_referrals?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ambassador_code?: string
          approved_at?: string | null
          college_city?: string
          college_name?: string
          college_state?: string
          created_at?: string
          id?: string
          status?: string | null
          student_id?: string | null
          total_points?: number | null
          total_referrals?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campus_ambassadors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string
          created_at: string | null
          description: string | null
          icon: string
          id: string
          name: string
        }
        Insert: {
          color: string
          created_at?: string | null
          description?: string | null
          icon: string
          id?: string
          name: string
        }
        Update: {
          color?: string
          created_at?: string | null
          description?: string | null
          icon?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      category_cuelinks_mapping: {
        Row: {
          category_id: string
          created_at: string | null
          cuelinks_category_id: string
          cuelinks_category_name: string | null
          id: string
        }
        Insert: {
          category_id: string
          created_at?: string | null
          cuelinks_category_id: string
          cuelinks_category_name?: string | null
          id?: string
        }
        Update: {
          category_id?: string
          created_at?: string | null
          cuelinks_category_id?: string
          cuelinks_category_name?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "category_cuelinks_mapping_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      content_flags: {
        Row: {
          ai_confidence_score: number | null
          content_id: string
          content_type: string
          created_at: string
          flag_details: string | null
          flag_reason: string
          flagged_by: string | null
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          ai_confidence_score?: number | null
          content_id: string
          content_type: string
          created_at?: string
          flag_details?: string | null
          flag_reason: string
          flagged_by?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          ai_confidence_score?: number | null
          content_id?: string
          content_type?: string
          created_at?: string
          flag_details?: string | null
          flag_reason?: string
          flagged_by?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_flags_flagged_by_fkey"
            columns: ["flagged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_flags_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_analytics: {
        Row: {
          coupon_id: string | null
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          user_id: string
        }
        Insert: {
          coupon_id?: string | null
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          user_id: string
        }
        Update: {
          coupon_id?: string | null
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_analytics_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_feedback: {
        Row: {
          claimed_coupon_id: string | null
          created_at: string
          feedback_reason: string | null
          id: string
          is_helpful: boolean
          pool_coupon_id: string | null
          user_id: string
        }
        Insert: {
          claimed_coupon_id?: string | null
          created_at?: string
          feedback_reason?: string | null
          id?: string
          is_helpful: boolean
          pool_coupon_id?: string | null
          user_id: string
        }
        Update: {
          claimed_coupon_id?: string | null
          created_at?: string
          feedback_reason?: string | null
          id?: string
          is_helpful?: boolean
          pool_coupon_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_feedback_claimed_coupon_id_fkey"
            columns: ["claimed_coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_feedback_pool_coupon_id_fkey"
            columns: ["pool_coupon_id"]
            isOneToOne: false
            referencedRelation: "coupon_pool"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_pool: {
        Row: {
          category: string
          country_code: string | null
          coupon_code: string | null
          created_at: string | null
          currency_code: string | null
          currency_symbol: string | null
          discount: string
          discount_type: string | null
          expires_at: string
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          last_validated_at: string | null
          logo_url: string | null
          merchant_name: string
          offer_text: string
          terms_and_conditions: string | null
          thumbs_down: number | null
          thumbs_up: number | null
          times_shown: number | null
          tracking_link: string
          updated_at: string | null
        }
        Insert: {
          category: string
          country_code?: string | null
          coupon_code?: string | null
          created_at?: string | null
          currency_code?: string | null
          currency_symbol?: string | null
          discount: string
          discount_type?: string | null
          expires_at: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          last_validated_at?: string | null
          logo_url?: string | null
          merchant_name: string
          offer_text: string
          terms_and_conditions?: string | null
          thumbs_down?: number | null
          thumbs_up?: number | null
          times_shown?: number | null
          tracking_link: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          country_code?: string | null
          coupon_code?: string | null
          created_at?: string | null
          currency_code?: string | null
          currency_symbol?: string | null
          discount?: string
          discount_type?: string | null
          expires_at?: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          last_validated_at?: string | null
          logo_url?: string | null
          merchant_name?: string
          offer_text?: string
          terms_and_conditions?: string | null
          thumbs_down?: number | null
          thumbs_up?: number | null
          times_shown?: number | null
          tracking_link?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      coupon_recommendations: {
        Row: {
          coupon_type: string
          created_at: string
          discount: number | null
          expires_at: string | null
          id: string
          match_score: number | null
          merchant: string
          recommendation_reason: string | null
          user_id: string
        }
        Insert: {
          coupon_type: string
          created_at?: string
          discount?: number | null
          expires_at?: string | null
          id?: string
          match_score?: number | null
          merchant: string
          recommendation_reason?: string | null
          user_id: string
        }
        Update: {
          coupon_type?: string
          created_at?: string
          discount?: number | null
          expires_at?: string | null
          id?: string
          match_score?: number | null
          merchant?: string
          recommendation_reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      coupon_shares: {
        Row: {
          claimed: boolean | null
          claimed_at: string | null
          claimed_by: string | null
          coupon_id: string | null
          id: string
          shared_at: string
          shared_by: string
          shared_with_email: string
        }
        Insert: {
          claimed?: boolean | null
          claimed_at?: string | null
          claimed_by?: string | null
          coupon_id?: string | null
          id?: string
          shared_at?: string
          shared_by: string
          shared_with_email: string
        }
        Update: {
          claimed?: boolean | null
          claimed_at?: string | null
          claimed_by?: string | null
          coupon_id?: string | null
          id?: string
          shared_at?: string
          shared_by?: string
          shared_with_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_shares_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_wishlist: {
        Row: {
          category: string | null
          created_at: string
          id: string
          merchant_name: string
          min_discount: number | null
          notify_on_match: boolean | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          merchant_name: string
          min_discount?: number | null
          notify_on_match?: boolean | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          merchant_name?: string
          min_discount?: number | null
          notify_on_match?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          actual_savings: number | null
          coupon_code: string | null
          coupon_type: string
          coupon_value: number
          created_at: string
          currency_code: string | null
          description: string | null
          discount_type: string | null
          expires_at: string
          feedback_given_at: string | null
          id: string
          logo_url: string | null
          merchant_link: string | null
          merchant_name: string | null
          pool_coupon_id: string | null
          shared_at: string | null
          status: string
          terms_and_conditions: string | null
          times_copied: number | null
          times_shared: number | null
          updated_at: string
          usage_instructions: string | null
          used_at: string | null
          user_feedback: boolean | null
          user_id: string
        }
        Insert: {
          actual_savings?: number | null
          coupon_code?: string | null
          coupon_type: string
          coupon_value?: number
          created_at?: string
          currency_code?: string | null
          description?: string | null
          discount_type?: string | null
          expires_at: string
          feedback_given_at?: string | null
          id?: string
          logo_url?: string | null
          merchant_link?: string | null
          merchant_name?: string | null
          pool_coupon_id?: string | null
          shared_at?: string | null
          status?: string
          terms_and_conditions?: string | null
          times_copied?: number | null
          times_shared?: number | null
          updated_at?: string
          usage_instructions?: string | null
          used_at?: string | null
          user_feedback?: boolean | null
          user_id: string
        }
        Update: {
          actual_savings?: number | null
          coupon_code?: string | null
          coupon_type?: string
          coupon_value?: number
          created_at?: string
          currency_code?: string | null
          description?: string | null
          discount_type?: string | null
          expires_at?: string
          feedback_given_at?: string | null
          id?: string
          logo_url?: string | null
          merchant_link?: string | null
          merchant_name?: string | null
          pool_coupon_id?: string | null
          shared_at?: string | null
          status?: string
          terms_and_conditions?: string | null
          times_copied?: number | null
          times_shared?: number | null
          updated_at?: string
          usage_instructions?: string | null
          used_at?: string | null
          user_feedback?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupons_pool_coupon_id_fkey"
            columns: ["pool_coupon_id"]
            isOneToOne: false
            referencedRelation: "coupon_pool"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_profiles: {
        Row: {
          active_platforms: string[]
          audience_target_group: string | null
          content_languages: string[]
          created_at: string | null
          creator_name: string
          creator_type: string
          experience_level: string
          id: string
          industry_segment: string
          insight_interests: string[]
          portfolio_link: string
          primary_category: string
          region_of_operation: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active_platforms: string[]
          audience_target_group?: string | null
          content_languages: string[]
          created_at?: string | null
          creator_name: string
          creator_type: string
          experience_level: string
          id?: string
          industry_segment: string
          insight_interests: string[]
          portfolio_link: string
          primary_category: string
          region_of_operation: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active_platforms?: string[]
          audience_target_group?: string | null
          content_languages?: string[]
          created_at?: string | null
          creator_name?: string
          creator_type?: string
          experience_level?: string
          id?: string
          industry_segment?: string
          insight_interests?: string[]
          portfolio_link?: string
          primary_category?: string
          region_of_operation?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cultural_energy_map: {
        Row: {
          category_id: string | null
          city: string
          country: string
          created_at: string | null
          energy_level: number | null
          id: string
          last_activity_at: string | null
          total_opinions: number | null
          trending_topics: Json | null
        }
        Insert: {
          category_id?: string | null
          city: string
          country: string
          created_at?: string | null
          energy_level?: number | null
          id?: string
          last_activity_at?: string | null
          total_opinions?: number | null
          trending_topics?: Json | null
        }
        Update: {
          category_id?: string | null
          city?: string
          country?: string
          created_at?: string | null
          energy_level?: number | null
          id?: string
          last_activity_at?: string | null
          total_opinions?: number | null
          trending_topics?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "cultural_energy_map_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      deleted_accounts_backup: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          deleted_at: string
          email: string
          full_name: string | null
          id: string
          state_region: string | null
          user_id: string
          user_type: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          deleted_at?: string
          email: string
          full_name?: string | null
          id?: string
          state_region?: string | null
          user_id: string
          user_type?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          deleted_at?: string
          email?: string
          full_name?: string | null
          id?: string
          state_region?: string | null
          user_id?: string
          user_type?: string | null
        }
        Relationships: []
      }
      deleted_accounts_log: {
        Row: {
          deleted_at: string
          email: string | null
          id: string
          user_id: string
          user_type: string | null
        }
        Insert: {
          deleted_at?: string
          email?: string | null
          id?: string
          user_id: string
          user_type?: string | null
        }
        Update: {
          deleted_at?: string
          email?: string | null
          id?: string
          user_id?: string
          user_type?: string | null
        }
        Relationships: []
      }
      developer_profiles: {
        Row: {
          content_focus: string[]
          created_at: string | null
          data_access_role: string
          headquarters_location: string
          id: string
          official_contact_email: string
          operation_regions: string[]
          organization_name: string
          organization_type: string
          preferred_insights: string[]
          team_size: string
          updated_at: string | null
          user_id: string
          website_link: string
        }
        Insert: {
          content_focus: string[]
          created_at?: string | null
          data_access_role: string
          headquarters_location: string
          id?: string
          official_contact_email: string
          operation_regions: string[]
          organization_name: string
          organization_type: string
          preferred_insights: string[]
          team_size: string
          updated_at?: string | null
          user_id: string
          website_link: string
        }
        Update: {
          content_focus?: string[]
          created_at?: string | null
          data_access_role?: string
          headquarters_location?: string
          id?: string
          official_contact_email?: string
          operation_regions?: string[]
          organization_name?: string
          organization_type?: string
          preferred_insights?: string[]
          team_size?: string
          updated_at?: string | null
          user_id?: string
          website_link?: string
        }
        Relationships: [
          {
            foreignKeyName: "developer_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_digest_preferences: {
        Row: {
          created_at: string
          enabled: boolean
          frequency: string
          id: string
          last_sent_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          frequency?: string
          id?: string
          last_sent_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          frequency?: string
          id?: string
          last_sent_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      gaming_profiles: {
        Row: {
          content_focus: string[]
          created_at: string | null
          data_access_role: string
          headquarters_location: string
          id: string
          official_contact_email: string
          operation_regions: string[]
          organization_name: string
          organization_type: string
          preferred_insights: string[]
          team_size: string
          updated_at: string | null
          user_id: string
          website_link: string
        }
        Insert: {
          content_focus: string[]
          created_at?: string | null
          data_access_role: string
          headquarters_location: string
          id?: string
          official_contact_email: string
          operation_regions: string[]
          organization_name: string
          organization_type: string
          preferred_insights: string[]
          team_size: string
          updated_at?: string | null
          user_id: string
          website_link: string
        }
        Update: {
          content_focus?: string[]
          created_at?: string | null
          data_access_role?: string
          headquarters_location?: string
          id?: string
          official_contact_email?: string
          operation_regions?: string[]
          organization_name?: string
          organization_type?: string
          preferred_insights?: string[]
          team_size?: string
          updated_at?: string | null
          user_id?: string
          website_link?: string
        }
        Relationships: []
      }
      global_insight_waves: {
        Row: {
          category_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          originator_user_ids: string[] | null
          total_participants: number | null
          trend_topic: string
          wave_name: string
          wave_peak_count: number | null
          wave_started_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          originator_user_ids?: string[] | null
          total_participants?: number | null
          trend_topic: string
          wave_name: string
          wave_peak_count?: number | null
          wave_started_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          originator_user_ids?: string[] | null
          total_participants?: number | null
          trend_topic?: string
          wave_name?: string
          wave_peak_count?: number | null
          wave_started_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "global_insight_waves_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      hype_signals: {
        Row: {
          category_id: string
          created_at: string | null
          created_by: string
          expires_at: string | null
          hype_count: number | null
          id: string
          is_archived: boolean | null
          pass_count: number | null
          phrase: string
          signal_score: number | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          created_by: string
          expires_at?: string | null
          hype_count?: number | null
          id?: string
          is_archived?: boolean | null
          pass_count?: number | null
          phrase: string
          signal_score?: number | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          created_by?: string
          expires_at?: string | null
          hype_count?: number | null
          id?: string
          is_archived?: boolean | null
          pass_count?: number | null
          phrase?: string
          signal_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hype_signals_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      hype_votes: {
        Row: {
          created_at: string | null
          id: string
          signal_id: string
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          signal_id: string
          user_id: string
          vote_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          signal_id?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "hype_votes_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "hype_signals"
            referencedColumns: ["id"]
          },
        ]
      }
      inphrosync_questions: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          options: Json
          question_text: string
          question_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          options: Json
          question_text: string
          question_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          options?: Json
          question_text?: string
          question_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      inphrosync_responses: {
        Row: {
          created_at: string | null
          id: string
          question_type: string
          response_date: string
          selected_option: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          question_type: string
          response_date?: string
          selected_option: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          question_type?: string
          response_date?: string
          selected_option?: string
          user_id?: string
        }
        Relationships: []
      }
      insight_ripples: {
        Row: {
          created_at: string | null
          earned_resonance_echo: boolean | null
          id: string
          opinion_id: string
          resonance_score: number | null
          ripple_reach: number | null
          updated_at: string | null
          user_id: string
          validation_count: number | null
        }
        Insert: {
          created_at?: string | null
          earned_resonance_echo?: boolean | null
          id?: string
          opinion_id: string
          resonance_score?: number | null
          ripple_reach?: number | null
          updated_at?: string | null
          user_id: string
          validation_count?: number | null
        }
        Update: {
          created_at?: string | null
          earned_resonance_echo?: boolean | null
          id?: string
          opinion_id?: string
          resonance_score?: number | null
          ripple_reach?: number | null
          updated_at?: string | null
          user_id?: string
          validation_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "insight_ripples_opinion_id_fkey"
            columns: ["opinion_id"]
            isOneToOne: false
            referencedRelation: "opinions"
            referencedColumns: ["id"]
          },
        ]
      }
      insights: {
        Row: {
          category_id: string
          created_at: string | null
          data: Json | null
          description: string
          id: string
          insight_type: string
          title: string
        }
        Insert: {
          category_id: string
          created_at?: string | null
          data?: Json | null
          description: string
          id?: string
          insight_type: string
          title: string
        }
        Update: {
          category_id?: string
          created_at?: string | null
          data?: Json | null
          description?: string
          id?: string
          insight_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "insights_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_favorites: {
        Row: {
          category: string | null
          created_at: string
          id: string
          merchant_name: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          merchant_name: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          merchant_name?: string
          user_id?: string
        }
        Relationships: []
      }
      music_profiles: {
        Row: {
          content_focus: string[]
          created_at: string | null
          data_access_role: string
          headquarters_location: string
          id: string
          official_contact_email: string
          operation_regions: string[]
          organization_name: string
          organization_type: string
          preferred_insights: string[]
          team_size: string
          updated_at: string | null
          user_id: string
          website_link: string
        }
        Insert: {
          content_focus: string[]
          created_at?: string | null
          data_access_role: string
          headquarters_location: string
          id?: string
          official_contact_email: string
          operation_regions: string[]
          organization_name: string
          organization_type: string
          preferred_insights: string[]
          team_size: string
          updated_at?: string | null
          user_id: string
          website_link: string
        }
        Update: {
          content_focus?: string[]
          created_at?: string | null
          data_access_role?: string
          headquarters_location?: string
          id?: string
          official_contact_email?: string
          operation_regions?: string[]
          organization_name?: string
          organization_type?: string
          preferred_insights?: string[]
          team_size?: string
          updated_at?: string | null
          user_id?: string
          website_link?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      opinion_upvotes: {
        Row: {
          created_at: string
          id: string
          is_upvote: boolean
          opinion_id: string
          user_id: string
          user_type: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_upvote?: boolean
          opinion_id: string
          user_id: string
          user_type?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_upvote?: boolean
          opinion_id?: string
          user_id?: string
          user_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opinion_upvotes_opinion_id_fkey"
            columns: ["opinion_id"]
            isOneToOne: false
            referencedRelation: "opinions"
            referencedColumns: ["id"]
          },
        ]
      }
      opinion_views: {
        Row: {
          id: string
          opinion_id: string
          viewed_at: string
          viewer_id: string
        }
        Insert: {
          id?: string
          opinion_id: string
          viewed_at?: string
          viewer_id: string
        }
        Update: {
          id?: string
          opinion_id?: string
          viewed_at?: string
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "opinion_views_opinion_id_fkey"
            columns: ["opinion_id"]
            isOneToOne: false
            referencedRelation: "opinions"
            referencedColumns: ["id"]
          },
        ]
      }
      opinions: {
        Row: {
          additional_notes: string | null
          category_id: string
          city: string | null
          comments: string | null
          content_type: string
          country: string | null
          created_at: string | null
          description: string
          estimated_budget: string | null
          genre: string | null
          id: string
          preferences: Json | null
          similar_content: string | null
          target_audience: string | null
          title: string
          updated_at: string | null
          upvotes: number | null
          user_id: string
          why_excited: string
          would_pay: boolean | null
        }
        Insert: {
          additional_notes?: string | null
          category_id: string
          city?: string | null
          comments?: string | null
          content_type: string
          country?: string | null
          created_at?: string | null
          description: string
          estimated_budget?: string | null
          genre?: string | null
          id?: string
          preferences?: Json | null
          similar_content?: string | null
          target_audience?: string | null
          title: string
          updated_at?: string | null
          upvotes?: number | null
          user_id: string
          why_excited: string
          would_pay?: boolean | null
        }
        Update: {
          additional_notes?: string | null
          category_id?: string
          city?: string | null
          comments?: string | null
          content_type?: string
          country?: string | null
          created_at?: string | null
          description?: string
          estimated_budget?: string | null
          genre?: string | null
          id?: string
          preferences?: Json | null
          similar_content?: string | null
          target_audience?: string | null
          title?: string
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string
          why_excited?: string
          would_pay?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "opinions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      ott_profiles: {
        Row: {
          content_focus: string[]
          created_at: string | null
          data_access_role: string
          headquarters_location: string
          id: string
          official_contact_email: string
          operation_regions: string[]
          organization_name: string
          organization_type: string
          preferred_insights: string[]
          team_size: string
          updated_at: string | null
          user_id: string
          website_link: string
        }
        Insert: {
          content_focus: string[]
          created_at?: string | null
          data_access_role: string
          headquarters_location: string
          id?: string
          official_contact_email: string
          operation_regions: string[]
          organization_name: string
          organization_type: string
          preferred_insights: string[]
          team_size: string
          updated_at?: string | null
          user_id: string
          website_link: string
        }
        Update: {
          content_focus?: string[]
          created_at?: string | null
          data_access_role?: string
          headquarters_location?: string
          id?: string
          official_contact_email?: string
          operation_regions?: string[]
          organization_name?: string
          organization_type?: string
          preferred_insights?: string[]
          team_size?: string
          updated_at?: string | null
          user_id?: string
          website_link?: string
        }
        Relationships: []
      }
      pending_account_deletions: {
        Row: {
          created_at: string
          deletion_requested_at: string
          email: string
          full_name: string | null
          id: string
          permanent_deletion_date: string
          restored_at: string | null
          user_id: string
          user_type: string | null
        }
        Insert: {
          created_at?: string
          deletion_requested_at?: string
          email: string
          full_name?: string | null
          id?: string
          permanent_deletion_date: string
          restored_at?: string | null
          user_id: string
          user_type?: string | null
        }
        Update: {
          created_at?: string
          deletion_requested_at?: string
          email?: string
          full_name?: string | null
          id?: string
          permanent_deletion_date?: string
          restored_at?: string | null
          user_id?: string
          user_type?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age_group: string | null
          city: string | null
          country: string
          created_at: string | null
          date_of_birth: string | null
          detected_country: string | null
          detected_timezone: string | null
          email: string
          full_name: string
          gender: string | null
          id: string
          onboarding_completed: boolean | null
          profile_picture: string | null
          settings: Json | null
          state_region: string
          updated_at: string | null
          user_type: string
        }
        Insert: {
          age_group?: string | null
          city?: string | null
          country: string
          created_at?: string | null
          date_of_birth?: string | null
          detected_country?: string | null
          detected_timezone?: string | null
          email: string
          full_name: string
          gender?: string | null
          id: string
          onboarding_completed?: boolean | null
          profile_picture?: string | null
          settings?: Json | null
          state_region?: string
          updated_at?: string | null
          user_type: string
        }
        Update: {
          age_group?: string | null
          city?: string | null
          country?: string
          created_at?: string | null
          date_of_birth?: string | null
          detected_country?: string | null
          detected_timezone?: string | null
          email?: string
          full_name?: string
          gender?: string | null
          id?: string
          onboarding_completed?: boolean | null
          profile_picture?: string | null
          settings?: Json | null
          state_region?: string
          updated_at?: string | null
          user_type?: string
        }
        Relationships: []
      }
      referral_claims: {
        Row: {
          bonus_awarded: boolean | null
          claimed_at: string
          id: string
          referral_code_id: string
          referred_user_id: string
          referrer_user_id: string
        }
        Insert: {
          bonus_awarded?: boolean | null
          claimed_at?: string
          id?: string
          referral_code_id: string
          referred_user_id: string
          referrer_user_id: string
        }
        Update: {
          bonus_awarded?: boolean | null
          claimed_at?: string
          id?: string
          referral_code_id?: string
          referred_user_id?: string
          referrer_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_claims_referral_code_id_fkey"
            columns: ["referral_code_id"]
            isOneToOne: false
            referencedRelation: "referral_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_claims_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_claims_referrer_user_id_fkey"
            columns: ["referrer_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          bonus_points: number | null
          completed_at: string | null
          created_at: string
          id: string
          referral_code: string
          referred_email: string
          referred_user_id: string | null
          referrer_id: string
          status: string
        }
        Insert: {
          bonus_points?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code: string
          referred_email: string
          referred_user_id?: string | null
          referrer_id: string
          status?: string
        }
        Update: {
          bonus_points?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code?: string
          referred_email?: string
          referred_user_id?: string | null
          referrer_id?: string
          status?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string
          id: string
          insights_helpful: string | null
          location: string | null
          name: string
          rating: number
          recommendation: string | null
          review: string
          user_id: string
          user_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          insights_helpful?: string | null
          location?: string | null
          name: string
          rating: number
          recommendation?: string | null
          review: string
          user_id: string
          user_type: string
        }
        Update: {
          created_at?: string
          id?: string
          insights_helpful?: string | null
          location?: string | null
          name?: string
          rating?: number
          recommendation?: string | null
          review?: string
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
      rewards: {
        Row: {
          created_at: string | null
          id: string
          level: number | null
          points: number | null
          total_opinions: number | null
          total_upvotes: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          level?: number | null
          points?: number | null
          total_opinions?: number | null
          total_upvotes?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: number | null
          points?: number | null
          total_opinions?: number | null
          total_upvotes?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      shared_insights: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          insight_data: Json
          insight_type: string
          share_token: string
          user_id: string
          view_count: number | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          insight_data: Json
          insight_type: string
          share_token: string
          user_id: string
          view_count?: number | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          insight_data?: Json
          insight_type?: string
          share_token?: string
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_insights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_profiles: {
        Row: {
          content_focus: string[]
          created_at: string | null
          data_access_role: string
          headquarters_location: string
          id: string
          official_contact_email: string
          operation_regions: string[]
          organization_name: string
          organization_type: string
          preferred_insights: string[]
          team_size: string
          updated_at: string | null
          user_id: string
          website_link: string
        }
        Insert: {
          content_focus: string[]
          created_at?: string | null
          data_access_role: string
          headquarters_location: string
          id?: string
          official_contact_email: string
          operation_regions: string[]
          organization_name: string
          organization_type: string
          preferred_insights: string[]
          team_size: string
          updated_at?: string | null
          user_id: string
          website_link: string
        }
        Update: {
          content_focus?: string[]
          created_at?: string | null
          data_access_role?: string
          headquarters_location?: string
          id?: string
          official_contact_email?: string
          operation_regions?: string[]
          organization_name?: string
          organization_type?: string
          preferred_insights?: string[]
          team_size?: string
          updated_at?: string | null
          user_id?: string
          website_link?: string
        }
        Relationships: [
          {
            foreignKeyName: "studio_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      time_capsules: {
        Row: {
          created_at: string | null
          evaluation_notes: string | null
          id: string
          locked_at: string | null
          opinion_id: string
          prediction_text: string
          trend_prophet_earned: boolean | null
          unlock_date: string
          user_id: string
          was_correct: boolean | null
        }
        Insert: {
          created_at?: string | null
          evaluation_notes?: string | null
          id?: string
          locked_at?: string | null
          opinion_id: string
          prediction_text: string
          trend_prophet_earned?: boolean | null
          unlock_date: string
          user_id: string
          was_correct?: boolean | null
        }
        Update: {
          created_at?: string | null
          evaluation_notes?: string | null
          id?: string
          locked_at?: string | null
          opinion_id?: string
          prediction_text?: string
          trend_prophet_earned?: boolean | null
          unlock_date?: string
          user_id?: string
          was_correct?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "time_capsules_opinion_id_fkey"
            columns: ["opinion_id"]
            isOneToOne: false
            referencedRelation: "opinions"
            referencedColumns: ["id"]
          },
        ]
      }
      tv_profiles: {
        Row: {
          content_focus: string[]
          created_at: string | null
          data_access_role: string
          headquarters_location: string
          id: string
          official_contact_email: string
          operation_regions: string[]
          organization_name: string
          organization_type: string
          preferred_insights: string[]
          team_size: string
          updated_at: string | null
          user_id: string
          website_link: string
        }
        Insert: {
          content_focus: string[]
          created_at?: string | null
          data_access_role: string
          headquarters_location: string
          id?: string
          official_contact_email: string
          operation_regions: string[]
          organization_name: string
          organization_type: string
          preferred_insights: string[]
          team_size: string
          updated_at?: string | null
          user_id: string
          website_link: string
        }
        Update: {
          content_focus?: string[]
          created_at?: string | null
          data_access_role?: string
          headquarters_location?: string
          id?: string
          official_contact_email?: string
          operation_regions?: string[]
          organization_name?: string
          organization_type?: string
          preferred_insights?: string[]
          team_size?: string
          updated_at?: string | null
          user_id?: string
          website_link?: string
        }
        Relationships: []
      }
      user_activity_logs: {
        Row: {
          created_at: string | null
          duration_seconds: number | null
          id: string
          page_name: string
          session_end: string | null
          session_start: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          page_name: string
          session_end?: string | null
          session_start?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          page_name?: string
          session_end?: string | null
          session_start?: string
          user_id?: string
        }
        Relationships: []
      }
      user_avatars: {
        Row: {
          avatar_color: string | null
          avatar_glow_intensity: number | null
          avatar_name: string
          created_at: string | null
          curiosity_sparks: number | null
          evolution_stage: number | null
          harmony_flow: number | null
          id: string
          total_opinions_contributed: number | null
          updated_at: string | null
          user_id: string
          wisdom_energy: number | null
        }
        Insert: {
          avatar_color?: string | null
          avatar_glow_intensity?: number | null
          avatar_name?: string
          created_at?: string | null
          curiosity_sparks?: number | null
          evolution_stage?: number | null
          harmony_flow?: number | null
          id?: string
          total_opinions_contributed?: number | null
          updated_at?: string | null
          user_id: string
          wisdom_energy?: number | null
        }
        Update: {
          avatar_color?: string | null
          avatar_glow_intensity?: number | null
          avatar_name?: string
          created_at?: string | null
          curiosity_sparks?: number | null
          evolution_stage?: number | null
          harmony_flow?: number | null
          id?: string
          total_opinions_contributed?: number | null
          updated_at?: string | null
          user_id?: string
          wisdom_energy?: number | null
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_description: string | null
          badge_name: string
          badge_type: string
          created_at: string | null
          earned_at: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          badge_description?: string | null
          badge_name: string
          badge_type: string
          created_at?: string | null
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          badge_description?: string | null
          badge_name?: string
          badge_type?: string
          created_at?: string | null
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          granted_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          created_at: string | null
          current_streak_weeks: number | null
          id: string
          inphrosync_last_participation: string | null
          inphrosync_longest_streak: number | null
          inphrosync_streak_days: number | null
          last_activity_date: string | null
          longest_streak_weeks: number | null
          streak_tier: string | null
          total_weekly_contributions: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_streak_weeks?: number | null
          id?: string
          inphrosync_last_participation?: string | null
          inphrosync_longest_streak?: number | null
          inphrosync_streak_days?: number | null
          last_activity_date?: string | null
          longest_streak_weeks?: number | null
          streak_tier?: string | null
          total_weekly_contributions?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_streak_weeks?: number | null
          id?: string
          inphrosync_last_participation?: string | null
          inphrosync_longest_streak?: number | null
          inphrosync_streak_days?: number | null
          last_activity_date?: string | null
          longest_streak_weeks?: number | null
          streak_tier?: string | null
          total_weekly_contributions?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wave_participants: {
        Row: {
          contribution_count: number | null
          id: string
          is_originator: boolean | null
          joined_at: string | null
          user_id: string
          wave_id: string
        }
        Insert: {
          contribution_count?: number | null
          id?: string
          is_originator?: boolean | null
          joined_at?: string | null
          user_id: string
          wave_id: string
        }
        Update: {
          contribution_count?: number | null
          id?: string
          is_originator?: boolean | null
          joined_at?: string | null
          user_id?: string
          wave_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wave_participants_wave_id_fkey"
            columns: ["wave_id"]
            isOneToOne: false
            referencedRelation: "global_insight_waves"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_stats: {
        Row: {
          category_id: string | null
          created_at: string | null
          id: string
          total_contributors: number | null
          total_opinions: number | null
          total_upvotes: number | null
          user_id: string | null
          user_type: string | null
          week_end_date: string
          week_start_date: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          total_contributors?: number | null
          total_opinions?: number | null
          total_upvotes?: number | null
          user_id?: string | null
          user_type?: string | null
          week_end_date: string
          week_start_date: string
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          total_contributors?: number | null
          total_opinions?: number | null
          total_upvotes?: number | null
          user_id?: string | null
          user_type?: string | null
          week_end_date?: string
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_stats_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_wisdom_reports: {
        Row: {
          categories_explored: Json | null
          created_at: string | null
          id: string
          insights_summary: string | null
          participation_pattern: string | null
          total_likes_given: number | null
          total_likes_received: number | null
          total_opinions: number | null
          user_id: string
          week_end_date: string
          week_start_date: string
          wisdom_score: number | null
          wisdom_title: string | null
        }
        Insert: {
          categories_explored?: Json | null
          created_at?: string | null
          id?: string
          insights_summary?: string | null
          participation_pattern?: string | null
          total_likes_given?: number | null
          total_likes_received?: number | null
          total_opinions?: number | null
          user_id: string
          week_end_date: string
          week_start_date: string
          wisdom_score?: number | null
          wisdom_title?: string | null
        }
        Update: {
          categories_explored?: Json | null
          created_at?: string | null
          id?: string
          insights_summary?: string | null
          participation_pattern?: string | null
          total_likes_given?: number | null
          total_likes_received?: number | null
          total_opinions?: number | null
          user_id?: string
          week_end_date?: string
          week_start_date?: string
          wisdom_score?: number | null
          wisdom_title?: string | null
        }
        Relationships: []
      }
      your_turn_attempts: {
        Row: {
          attempted_at: string | null
          id: string
          is_winner: boolean | null
          slot_id: string
          user_id: string
        }
        Insert: {
          attempted_at?: string | null
          id?: string
          is_winner?: boolean | null
          slot_id: string
          user_id: string
        }
        Update: {
          attempted_at?: string | null
          id?: string
          is_winner?: boolean | null
          slot_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "your_turn_attempts_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "your_turn_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "your_turn_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      your_turn_history: {
        Row: {
          archived_at: string | null
          attempt_count: number | null
          id: string
          options: Json | null
          question_text: string | null
          slot_date: string
          slot_time: string
          total_votes: number | null
          vote_counts: Json | null
          winner_id: string | null
          winner_name: string | null
        }
        Insert: {
          archived_at?: string | null
          attempt_count?: number | null
          id?: string
          options?: Json | null
          question_text?: string | null
          slot_date: string
          slot_time: string
          total_votes?: number | null
          vote_counts?: Json | null
          winner_id?: string | null
          winner_name?: string | null
        }
        Update: {
          archived_at?: string | null
          attempt_count?: number | null
          id?: string
          options?: Json | null
          question_text?: string | null
          slot_date?: string
          slot_time?: string
          total_votes?: number | null
          vote_counts?: Json | null
          winner_id?: string | null
          winner_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "your_turn_history_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      your_turn_questions: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          id: string
          is_approved: boolean | null
          is_deleted: boolean | null
          options: Json
          question_text: string
          slot_id: string
          total_votes: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          id?: string
          is_approved?: boolean | null
          is_deleted?: boolean | null
          options?: Json
          question_text: string
          slot_id: string
          total_votes?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          id?: string
          is_approved?: boolean | null
          is_deleted?: boolean | null
          options?: Json
          question_text?: string
          slot_id?: string
          total_votes?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "your_turn_questions_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "your_turn_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "your_turn_questions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      your_turn_slots: {
        Row: {
          attempt_count: number | null
          created_at: string | null
          id: string
          slot_date: string
          slot_ended_at: string | null
          slot_started_at: string | null
          slot_time: string
          status: string
          updated_at: string | null
          winner_id: string | null
        }
        Insert: {
          attempt_count?: number | null
          created_at?: string | null
          id?: string
          slot_date?: string
          slot_ended_at?: string | null
          slot_started_at?: string | null
          slot_time: string
          status?: string
          updated_at?: string | null
          winner_id?: string | null
        }
        Update: {
          attempt_count?: number | null
          created_at?: string | null
          id?: string
          slot_date?: string
          slot_ended_at?: string | null
          slot_started_at?: string | null
          slot_time?: string
          status?: string
          updated_at?: string | null
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "your_turn_slots_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      your_turn_votes: {
        Row: {
          created_at: string | null
          id: string
          question_id: string
          selected_option: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          question_id: string
          selected_option: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          question_id?: string
          selected_option?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "your_turn_votes_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "your_turn_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "your_turn_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      archive_weekly_stats: { Args: never; Returns: undefined }
      check_coupon_expiry: { Args: never; Returns: undefined }
      delete_user_account: { Args: never; Returns: undefined }
      generate_ambassador_code: {
        Args: { college_name: string }
        Returns: string
      }
      generate_referral_code: { Args: never; Returns: string }
      generate_unique_referral_code: { Args: never; Returns: string }
      get_category_demographics: {
        Args: { _category_id: string }
        Returns: Json
      }
      get_days_left_in_week: { Args: never; Returns: number }
      get_opinion_upvote_breakdown: {
        Args: { opinion_uuid: string }
        Returns: Json
      }
      get_opinion_viewers: { Args: { _opinion_id: string }; Returns: Json }
      get_rising_signals: {
        Args: { category_filter?: string; limit_count?: number }
        Returns: {
          category_id: string
          created_at: string
          expires_at: string
          hype_count: number
          id: string
          pass_count: number
          phrase: string
          signal_score: number
          velocity: number
        }[]
      }
      get_user_counts: {
        Args: never
        Returns: {
          audience: number
          creator: number
          developer: number
          gaming: number
          music: number
          ott: number
          production: number
          studio: number
          total_users: number
          tv: number
        }[]
      }
      get_week_start: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_slot_attempts: {
        Args: { slot_uuid: string }
        Returns: undefined
      }
      increment_your_turn_votes: {
        Args: { question_uuid: string }
        Returns: undefined
      }
      is_account_pending_deletion: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      is_non_audience_user: { Args: { _user_id: string }; Returns: boolean }
      is_referral_code_valid: { Args: { input_code: string }; Returns: boolean }
      restore_account: { Args: never; Returns: Json }
      validate_and_get_referral_code: {
        Args: { input_code: string }
        Returns: {
          code: string
          code_id: string
          is_valid: boolean
          owner_user_id: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
