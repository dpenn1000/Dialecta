// Generated from the LIVE Dialecta Supabase project mguulnibvzusfvyuowwh
// (Pennington Media Group org), 2026-09-19. Not generated from
// supabase/migrations/ in this repo: those two files describe a schema that
// does not match this database. See docs/handoffs/ for the gap.
// Regenerate: supabase gen types typescript --project-id mguulnibvzusfvyuowwh

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
      admin_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json
          id: string
          target_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          target_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          target_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_audit_log_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_capabilities: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          domain: string
          id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          domain: string
          id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          domain?: string
          id?: string
        }
        Relationships: []
      }
      admin_role_capabilities: {
        Row: {
          capability_id: string
          role_id: string
        }
        Insert: {
          capability_id: string
          role_id: string
        }
        Update: {
          capability_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_role_capabilities_capability_id_fkey"
            columns: ["capability_id"]
            isOneToOne: false
            referencedRelation: "admin_capabilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_role_capabilities_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "admin_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_roles: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          id: string
          is_system: boolean
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          id: string
          is_system?: boolean
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          is_system?: boolean
        }
        Relationships: []
      }
      archetypes: {
        Row: {
          archetype_id: Database["public"]["Enums"]["archetype_id"]
          archetype_label: string
          assigned_at: string
          axis_pattern: Json | null
          confidence: Database["public"]["Enums"]["archetype_confidence"]
          history: Json
          id: string
          last_updated: string
          member_id: string
        }
        Insert: {
          archetype_id: Database["public"]["Enums"]["archetype_id"]
          archetype_label?: string
          assigned_at?: string
          axis_pattern?: Json | null
          confidence?: Database["public"]["Enums"]["archetype_confidence"]
          history?: Json
          id?: string
          last_updated?: string
          member_id: string
        }
        Update: {
          archetype_id?: Database["public"]["Enums"]["archetype_id"]
          archetype_label?: string
          assigned_at?: string
          axis_pattern?: Json | null
          confidence?: Database["public"]["Enums"]["archetype_confidence"]
          history?: Json
          id?: string
          last_updated?: string
          member_id?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          ai_analysis: Json
          ai_suggested_tier: Database["public"]["Enums"]["tier"] | null
          author_member_id: string
          author_note: string | null
          created_at: string
          declaration: Json
          declared_tier: Database["public"]["Enums"]["tier"] | null
          final_tier: Database["public"]["Enums"]["tier"] | null
          ghost_post_id: string
          id: string
          original_html: string | null
          polish_change_log: Json | null
          polish_level: Database["public"]["Enums"]["polish_level_enum"]
          polish_options: Json | null
          stage_2_5_choice: string | null
          status: string
          updated_at: string
          wait_until: string | null
        }
        Insert: {
          ai_analysis?: Json
          ai_suggested_tier?: Database["public"]["Enums"]["tier"] | null
          author_member_id: string
          author_note?: string | null
          created_at?: string
          declaration?: Json
          declared_tier?: Database["public"]["Enums"]["tier"] | null
          final_tier?: Database["public"]["Enums"]["tier"] | null
          ghost_post_id: string
          id?: string
          original_html?: string | null
          polish_change_log?: Json | null
          polish_level?: Database["public"]["Enums"]["polish_level_enum"]
          polish_options?: Json | null
          stage_2_5_choice?: string | null
          status?: string
          updated_at?: string
          wait_until?: string | null
        }
        Update: {
          ai_analysis?: Json
          ai_suggested_tier?: Database["public"]["Enums"]["tier"] | null
          author_member_id?: string
          author_note?: string | null
          created_at?: string
          declaration?: Json
          declared_tier?: Database["public"]["Enums"]["tier"] | null
          final_tier?: Database["public"]["Enums"]["tier"] | null
          ghost_post_id?: string
          id?: string
          original_html?: string | null
          polish_change_log?: Json | null
          polish_level?: Database["public"]["Enums"]["polish_level_enum"]
          polish_options?: Json | null
          stage_2_5_choice?: string | null
          status?: string
          updated_at?: string
          wait_until?: string | null
        }
        Relationships: []
      }
      aspirations: {
        Row: {
          axis_commitments: Json
          coaching_consent: boolean
          created_at: string
          declaration_fingerprint_id: string | null
          declared_at: string
          expires_at: string
          id: string
          member_id: string
          reason: string
          research_consent: boolean
          statement: string
          status: string
          target_archetype: string | null
          updated_at: string
        }
        Insert: {
          axis_commitments?: Json
          coaching_consent?: boolean
          created_at?: string
          declaration_fingerprint_id?: string | null
          declared_at?: string
          expires_at?: string
          id?: string
          member_id: string
          reason: string
          research_consent?: boolean
          statement: string
          status?: string
          target_archetype?: string | null
          updated_at?: string
        }
        Update: {
          axis_commitments?: Json
          coaching_consent?: boolean
          created_at?: string
          declaration_fingerprint_id?: string | null
          declared_at?: string
          expires_at?: string
          id?: string
          member_id?: string
          reason?: string
          research_consent?: boolean
          statement?: string
          status?: string
          target_archetype?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aspirations_declaration_fingerprint_id_fkey"
            columns: ["declaration_fingerprint_id"]
            isOneToOne: false
            referencedRelation: "fp_snapshots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aspirations_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["ghost_member_id"]
          },
        ]
      }
      axis_events: {
        Row: {
          article_id: string | null
          axis: Database["public"]["Enums"]["axis"]
          classification_id: string | null
          comment_id: string | null
          created_at: string
          id: string
          member_id: string
          source: string
          tier: Database["public"]["Enums"]["tier"]
          topic: string | null
        }
        Insert: {
          article_id?: string | null
          axis: Database["public"]["Enums"]["axis"]
          classification_id?: string | null
          comment_id?: string | null
          created_at?: string
          id?: string
          member_id: string
          source?: string
          tier: Database["public"]["Enums"]["tier"]
          topic?: string | null
        }
        Update: {
          article_id?: string | null
          axis?: Database["public"]["Enums"]["axis"]
          classification_id?: string | null
          comment_id?: string | null
          created_at?: string
          id?: string
          member_id?: string
          source?: string
          tier?: Database["public"]["Enums"]["tier"]
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "axis_events_classification_id_fkey"
            columns: ["classification_id"]
            isOneToOne: false
            referencedRelation: "classifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "axis_events_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      axis_scores: {
        Row: {
          axis: Database["public"]["Enums"]["axis"]
          comment_count: number
          graduation_count: number
          id: string
          last_updated: string
          member_id: string
          tier_mix: Json
          topic_history: Json
        }
        Insert: {
          axis: Database["public"]["Enums"]["axis"]
          comment_count?: number
          graduation_count?: number
          id?: string
          last_updated?: string
          member_id: string
          tier_mix?: Json
          topic_history?: Json
        }
        Update: {
          axis?: Database["public"]["Enums"]["axis"]
          comment_count?: number
          graduation_count?: number
          id?: string
          last_updated?: string
          member_id?: string
          tier_mix?: Json
          topic_history?: Json
        }
        Relationships: []
      }
      celebration_events: {
        Row: {
          context: Json
          created_at: string
          event_type: string
          id: string
          member_id: string
          modal_dismissed_at: string | null
          occurred_at: string
          shared_at: string | null
        }
        Insert: {
          context?: Json
          created_at?: string
          event_type: string
          id?: string
          member_id: string
          modal_dismissed_at?: string | null
          occurred_at?: string
          shared_at?: string | null
        }
        Update: {
          context?: Json
          created_at?: string
          event_type?: string
          id?: string
          member_id?: string
          modal_dismissed_at?: string | null
          occurred_at?: string
          shared_at?: string | null
        }
        Relationships: []
      }
      classifications: {
        Row: {
          ai_suggested_tier: Database["public"]["Enums"]["tier"]
          article_engagement:
            | Database["public"]["Enums"]["article_engagement_level"]
            | null
          borderline_flag: boolean
          borderline_other_tier: Database["public"]["Enums"]["tier"] | null
          claim_text: string | null
          classified_at: string
          comment_id: string
          commenter_message: string
          emotion: Database["public"]["Enums"]["emotion_level"] | null
          final_tier: Database["public"]["Enums"]["tier"] | null
          id: string
          opposing_view_engaged:
            | Database["public"]["Enums"]["opposing_view_level"]
            | null
          resolved_at: string | null
          self_declared_tier: Database["public"]["Enums"]["tier"] | null
          specificity_score: number | null
          strength: string | null
          tribal_example: string | null
          tribal_markers: boolean
        }
        Insert: {
          ai_suggested_tier: Database["public"]["Enums"]["tier"]
          article_engagement?:
            | Database["public"]["Enums"]["article_engagement_level"]
            | null
          borderline_flag?: boolean
          borderline_other_tier?: Database["public"]["Enums"]["tier"] | null
          claim_text?: string | null
          classified_at?: string
          comment_id: string
          commenter_message: string
          emotion?: Database["public"]["Enums"]["emotion_level"] | null
          final_tier?: Database["public"]["Enums"]["tier"] | null
          id?: string
          opposing_view_engaged?:
            | Database["public"]["Enums"]["opposing_view_level"]
            | null
          resolved_at?: string | null
          self_declared_tier?: Database["public"]["Enums"]["tier"] | null
          specificity_score?: number | null
          strength?: string | null
          tribal_example?: string | null
          tribal_markers?: boolean
        }
        Update: {
          ai_suggested_tier?: Database["public"]["Enums"]["tier"]
          article_engagement?:
            | Database["public"]["Enums"]["article_engagement_level"]
            | null
          borderline_flag?: boolean
          borderline_other_tier?: Database["public"]["Enums"]["tier"] | null
          claim_text?: string | null
          classified_at?: string
          comment_id?: string
          commenter_message?: string
          emotion?: Database["public"]["Enums"]["emotion_level"] | null
          final_tier?: Database["public"]["Enums"]["tier"] | null
          id?: string
          opposing_view_engaged?:
            | Database["public"]["Enums"]["opposing_view_level"]
            | null
          resolved_at?: string | null
          self_declared_tier?: Database["public"]["Enums"]["tier"] | null
          specificity_score?: number | null
          strength?: string | null
          tribal_example?: string | null
          tribal_markers?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "classifications_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          article_id: string
          article_slug: string
          article_title: string
          body: string
          created_at: string
          delta_acknowledged: boolean
          hardened_at: string
          id: string
          member_email: string
          member_id: string
          member_name: string
          mentions: Json
          parent_id: string | null
          published_at: string | null
          status: Database["public"]["Enums"]["comment_status"]
        }
        Insert: {
          article_id: string
          article_slug: string
          article_title: string
          body: string
          created_at?: string
          delta_acknowledged?: boolean
          hardened_at?: string
          id?: string
          member_email: string
          member_id: string
          member_name: string
          mentions?: Json
          parent_id?: string | null
          published_at?: string | null
          status?: Database["public"]["Enums"]["comment_status"]
        }
        Update: {
          article_id?: string
          article_slug?: string
          article_title?: string
          body?: string
          created_at?: string
          delta_acknowledged?: boolean
          hardened_at?: string
          id?: string
          member_email?: string
          member_id?: string
          member_name?: string
          mentions?: Json
          parent_id?: string | null
          published_at?: string | null
          status?: Database["public"]["Enums"]["comment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_events: {
        Row: {
          created_at: string
          display_payload: Json
          event_type: string
          id: string
          primary_member_id: string
          reference_id: string | null
          secondary_member_id: string | null
          visibility: string
        }
        Insert: {
          created_at?: string
          display_payload?: Json
          event_type: string
          id?: string
          primary_member_id: string
          reference_id?: string | null
          secondary_member_id?: string | null
          visibility?: string
        }
        Update: {
          created_at?: string
          display_payload?: Json
          event_type?: string
          id?: string
          primary_member_id?: string
          reference_id?: string | null
          secondary_member_id?: string | null
          visibility?: string
        }
        Relationships: []
      }
      feedback_items: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          body: string
          captured_metadata: Json
          id: string
          owner_profile_id: string | null
          priority: string
          reporter_display_name: string | null
          reporter_email: string | null
          reporter_member_id: string | null
          status: string
          status_changed_at: string
          status_changed_by: string | null
          submitted_at: string
          title: string | null
          triage_note: string | null
          type: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          body: string
          captured_metadata?: Json
          id?: string
          owner_profile_id?: string | null
          priority?: string
          reporter_display_name?: string | null
          reporter_email?: string | null
          reporter_member_id?: string | null
          status?: string
          status_changed_at?: string
          status_changed_by?: string | null
          submitted_at?: string
          title?: string | null
          triage_note?: string | null
          type?: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          body?: string
          captured_metadata?: Json
          id?: string
          owner_profile_id?: string | null
          priority?: string
          reporter_display_name?: string | null
          reporter_email?: string | null
          reporter_member_id?: string | null
          status?: string
          status_changed_at?: string
          status_changed_by?: string | null
          submitted_at?: string
          title?: string | null
          triage_note?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_items_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_items_owner_profile_id_fkey"
            columns: ["owner_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_items_status_changed_by_fkey"
            columns: ["status_changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          followee_id: string
          follower_id: string
          id: string
        }
        Insert: {
          created_at?: string
          followee_id: string
          follower_id: string
          id?: string
        }
        Update: {
          created_at?: string
          followee_id?: string
          follower_id?: string
          id?: string
        }
        Relationships: []
      }
      fp_snapshots: {
        Row: {
          annotation: string | null
          annotation_generated_at: string | null
          archetype_at_capture: string | null
          aspiration_at_capture: Json | null
          captured_at: string
          created_at: string
          fingerprint_data: Json
          id: string
          member_id: string
          png_url: string | null
          reason: Database["public"]["Enums"]["fp_snapshot_reason"]
        }
        Insert: {
          annotation?: string | null
          annotation_generated_at?: string | null
          archetype_at_capture?: string | null
          aspiration_at_capture?: Json | null
          captured_at?: string
          created_at?: string
          fingerprint_data: Json
          id?: string
          member_id: string
          png_url?: string | null
          reason: Database["public"]["Enums"]["fp_snapshot_reason"]
        }
        Update: {
          annotation?: string | null
          annotation_generated_at?: string | null
          archetype_at_capture?: string | null
          aspiration_at_capture?: Json | null
          captured_at?: string
          created_at?: string
          fingerprint_data?: Json
          id?: string
          member_id?: string
          png_url?: string | null
          reason?: Database["public"]["Enums"]["fp_snapshot_reason"]
        }
        Relationships: [
          {
            foreignKeyName: "fp_snapshots_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["ghost_member_id"]
          },
        ]
      }
      handle_history: {
        Row: {
          changed_at: string
          id: string
          new_handle: string
          old_handle: string
          profile_id: string
          released_at: string | null
        }
        Insert: {
          changed_at?: string
          id?: string
          new_handle: string
          old_handle: string
          profile_id: string
          released_at?: string | null
        }
        Update: {
          changed_at?: string
          id?: string
          new_handle?: string
          old_handle?: string
          profile_id?: string
          released_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "handle_history_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_prefs: {
        Row: {
          created_at: string
          email_address: string | null
          last_digest_at: string | null
          member_id: string
          prefs: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          email_address?: string | null
          last_digest_at?: string | null
          member_id: string
          prefs?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          email_address?: string | null
          last_digest_at?: string | null
          member_id?: string
          prefs?: Json
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actor_member_id: string | null
          created_at: string
          email_sent_at: string | null
          email_status: string
          id: string
          is_read: boolean
          payload: Json
          read_at: string | null
          recipient_member_id: string
          target_id: string | null
          target_type: string | null
          target_url: string | null
          type: string
        }
        Insert: {
          actor_member_id?: string | null
          created_at?: string
          email_sent_at?: string | null
          email_status?: string
          id?: string
          is_read?: boolean
          payload?: Json
          read_at?: string | null
          recipient_member_id: string
          target_id?: string | null
          target_type?: string | null
          target_url?: string | null
          type: string
        }
        Update: {
          actor_member_id?: string | null
          created_at?: string
          email_sent_at?: string | null
          email_status?: string
          id?: string
          is_read?: boolean
          payload?: Json
          read_at?: string | null
          recipient_member_id?: string
          target_id?: string | null
          target_type?: string | null
          target_url?: string | null
          type?: string
        }
        Relationships: []
      }
      opinion_map_overrides: {
        Row: {
          ai_recommendation: Json
          article_id: string
          created_at: string
          editor_note: string | null
          final_approved: Json
          ghost_post_id: string
          id: string
        }
        Insert: {
          ai_recommendation: Json
          article_id: string
          created_at?: string
          editor_note?: string | null
          final_approved: Json
          ghost_post_id: string
          id?: string
        }
        Update: {
          ai_recommendation?: Json
          article_id?: string
          created_at?: string
          editor_note?: string | null
          final_approved?: Json
          ghost_post_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "opinion_map_overrides_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      opinion_map_positions: {
        Row: {
          article_id: string
          coordinates: Json
          id: string
          map_index: number
          map_type: string
          reader_id: string
          recorded_at: string
          stage: string
        }
        Insert: {
          article_id: string
          coordinates: Json
          id?: string
          map_index?: number
          map_type: string
          reader_id: string
          recorded_at?: string
          stage: string
        }
        Update: {
          article_id?: string
          coordinates?: Json
          id?: string
          map_index?: number
          map_type?: string
          reader_id?: string
          recorded_at?: string
          stage?: string
        }
        Relationships: []
      }
      profile_admin_capability_grants: {
        Row: {
          capability_id: string
          expires_at: string | null
          granted: boolean
          granted_at: string
          granted_by: string | null
          note: string | null
          profile_id: string
        }
        Insert: {
          capability_id: string
          expires_at?: string | null
          granted: boolean
          granted_at?: string
          granted_by?: string | null
          note?: string | null
          profile_id: string
        }
        Update: {
          capability_id?: string
          expires_at?: string | null
          granted?: boolean
          granted_at?: string
          granted_by?: string | null
          note?: string | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_admin_capability_grants_capability_id_fkey"
            columns: ["capability_id"]
            isOneToOne: false
            referencedRelation: "admin_capabilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_admin_capability_grants_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_admin_capability_grants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_admin_roles: {
        Row: {
          expires_at: string | null
          granted_at: string
          granted_by: string | null
          note: string | null
          profile_id: string
          role_id: string
        }
        Insert: {
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          note?: string | null
          profile_id: string
          role_id: string
        }
        Update: {
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          note?: string | null
          profile_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_admin_roles_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_admin_roles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_admin_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "admin_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          aspirational_archetype: string | null
          avatar_url: string | null
          bio: string | null
          current_aspiration_id: string | null
          display_name: string | null
          field_notes: Json
          ghost_member_id: string
          gift_expires_at: string | null
          gifted_by_member_id: string | null
          handle: string | null
          handle_set_at: string | null
          handle_set_by_user: boolean
          id: string
          influences: Json
          is_admin: boolean
          is_author: boolean
          is_charter: boolean
          is_gifted: boolean
          is_quote_admin: boolean
          is_seed: boolean
          last_order_classified_count: number
          location: string | null
          mind_changes: Json
          order_assigned_at: string | null
          order_family: string | null
          order_id: string | null
          order_label: string | null
          order_negotiation_log: Json
          order_pending_proposal: Json | null
          pact_agreed_at: string | null
          pact_path: string | null
          pact_signed_name: string | null
          pact_version: string | null
          polish_preferences: Json | null
          resonance: number
          signature_font: string
          subscription_tier: string
          subscription_tier_set_by: string | null
          subscription_tier_updated_at: string | null
          updated_at: string | null
          wrestling_with: string | null
        }
        Insert: {
          aspirational_archetype?: string | null
          avatar_url?: string | null
          bio?: string | null
          current_aspiration_id?: string | null
          display_name?: string | null
          field_notes?: Json
          ghost_member_id: string
          gift_expires_at?: string | null
          gifted_by_member_id?: string | null
          handle?: string | null
          handle_set_at?: string | null
          handle_set_by_user?: boolean
          id?: string
          influences?: Json
          is_admin?: boolean
          is_author?: boolean
          is_charter?: boolean
          is_gifted?: boolean
          is_quote_admin?: boolean
          is_seed?: boolean
          last_order_classified_count?: number
          location?: string | null
          mind_changes?: Json
          order_assigned_at?: string | null
          order_family?: string | null
          order_id?: string | null
          order_label?: string | null
          order_negotiation_log?: Json
          order_pending_proposal?: Json | null
          pact_agreed_at?: string | null
          pact_path?: string | null
          pact_signed_name?: string | null
          pact_version?: string | null
          polish_preferences?: Json | null
          resonance?: number
          signature_font?: string
          subscription_tier?: string
          subscription_tier_set_by?: string | null
          subscription_tier_updated_at?: string | null
          updated_at?: string | null
          wrestling_with?: string | null
        }
        Update: {
          aspirational_archetype?: string | null
          avatar_url?: string | null
          bio?: string | null
          current_aspiration_id?: string | null
          display_name?: string | null
          field_notes?: Json
          ghost_member_id?: string
          gift_expires_at?: string | null
          gifted_by_member_id?: string | null
          handle?: string | null
          handle_set_at?: string | null
          handle_set_by_user?: boolean
          id?: string
          influences?: Json
          is_admin?: boolean
          is_author?: boolean
          is_charter?: boolean
          is_gifted?: boolean
          is_quote_admin?: boolean
          is_seed?: boolean
          last_order_classified_count?: number
          location?: string | null
          mind_changes?: Json
          order_assigned_at?: string | null
          order_family?: string | null
          order_id?: string | null
          order_label?: string | null
          order_negotiation_log?: Json
          order_pending_proposal?: Json | null
          pact_agreed_at?: string | null
          pact_path?: string | null
          pact_signed_name?: string | null
          pact_version?: string | null
          polish_preferences?: Json | null
          resonance?: number
          signature_font?: string
          subscription_tier?: string
          subscription_tier_set_by?: string | null
          subscription_tier_updated_at?: string | null
          updated_at?: string | null
          wrestling_with?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_current_aspiration_id_fkey"
            columns: ["current_aspiration_id"]
            isOneToOne: false
            referencedRelation: "aspirations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          author: string | null
          created_at: string
          created_by: string | null
          id: string
          quote_id: string
          source: string | null
          status: string
          tags: string[]
          text: string
          updated_at: string
          updated_by: string | null
          year: number | null
        }
        Insert: {
          author?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          quote_id: string
          source?: string | null
          status?: string
          tags?: string[]
          text: string
          updated_at?: string
          updated_by?: string | null
          year?: number | null
        }
        Update: {
          author?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          quote_id?: string
          source?: string | null
          status?: string
          tags?: string[]
          text?: string
          updated_at?: string
          updated_by?: string | null
          year?: number | null
        }
        Relationships: []
      }
      reserved_handles: {
        Row: {
          added_at: string
          added_by: string | null
          handle: string
          reason: string | null
        }
        Insert: {
          added_at?: string
          added_by?: string | null
          handle: string
          reason?: string | null
        }
        Update: {
          added_at?: string
          added_by?: string | null
          handle?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reserved_handles_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      self_descriptions: {
        Row: {
          id: string
          member_id: string
          prompt_id: string
          recorded_at: string
          statement_verbatim: string
        }
        Insert: {
          id?: string
          member_id: string
          prompt_id: string
          recorded_at?: string
          statement_verbatim: string
        }
        Update: {
          id?: string
          member_id?: string
          prompt_id?: string
          recorded_at?: string
          statement_verbatim?: string
        }
        Relationships: [
          {
            foreignKeyName: "self_descriptions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["ghost_member_id"]
          },
        ]
      }
      share_events: {
        Row: {
          channel: string
          created_at: string
          id: string
          member_id: string | null
          surface_id: string
          surface_type: string
        }
        Insert: {
          channel: string
          created_at?: string
          id?: string
          member_id?: string | null
          surface_id: string
          surface_type: string
        }
        Update: {
          channel?: string
          created_at?: string
          id?: string
          member_id?: string | null
          surface_id?: string
          surface_type?: string
        }
        Relationships: []
      }
      sparring_partners: {
        Row: {
          article_count: number
          id: string
          last_engagement_at: string
          member_a: string
          member_b: string
          recognized_at: string
          visibility_a: boolean
          visibility_b: boolean
        }
        Insert: {
          article_count?: number
          id?: string
          last_engagement_at?: string
          member_a: string
          member_b: string
          recognized_at?: string
          visibility_a?: boolean
          visibility_b?: boolean
        }
        Update: {
          article_count?: number
          id?: string
          last_engagement_at?: string
          member_a?: string
          member_b?: string
          recognized_at?: string
          visibility_a?: boolean
          visibility_b?: boolean
        }
        Relationships: []
      }
      tier_nominations: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          member_id: string
          note: string | null
          reason_key: string
          target_tier: string
          updated_at: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          member_id: string
          note?: string | null
          reason_key: string
          target_tier: string
          updated_at?: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          member_id?: string
          note?: string | null
          reason_key?: string
          target_tier?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tier_nominations_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      profile_effective_capabilities: {
        Row: {
          capability_id: string | null
          profile_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      initialise_contributor_axes: {
        Args: { p_member_id: string }
        Returns: undefined
      }
    }
    Enums: {
      archetype_confidence: "forming" | "emerging" | "established"
      archetype_id:
        | "advocate"
        | "builder"
        | "contextualist"
        | "empiricist"
        | "illuminator"
        | "reviser"
        | "skeptic"
        | "synthesizer"
      article_engagement_level: "specific" | "general"
      axis:
        | "acuity"
        | "reach"
        | "calibration"
        | "magnanimity"
        | "discourse"
        | "consistency"
      comment_status: "pending_review" | "published" | "suppressed"
      emotion_level: "low" | "medium" | "high"
      fp_snapshot_reason:
        | "first_entry"
        | "aspiration_declaration"
        | "recommitment"
        | "archetype_shift"
        | "pillar_milestone"
      opposing_view_level: "yes" | "partially" | "no"
      polish_level_enum: "light" | "standard" | "editorial" | "custom"
      tier: "forum" | "spark" | "echo" | "fog" | "heat" | "stance" | "breach"
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
      archetype_confidence: ["forming", "emerging", "established"],
      archetype_id: [
        "advocate",
        "builder",
        "contextualist",
        "empiricist",
        "illuminator",
        "reviser",
        "skeptic",
        "synthesizer",
      ],
      article_engagement_level: ["specific", "general"],
      axis: [
        "acuity",
        "reach",
        "calibration",
        "magnanimity",
        "discourse",
        "consistency",
      ],
      comment_status: ["pending_review", "published", "suppressed"],
      emotion_level: ["low", "medium", "high"],
      fp_snapshot_reason: [
        "first_entry",
        "aspiration_declaration",
        "recommitment",
        "archetype_shift",
        "pillar_milestone",
      ],
      opposing_view_level: ["yes", "partially", "no"],
      polish_level_enum: ["light", "standard", "editorial", "custom"],
      tier: ["forum", "spark", "echo", "fog", "heat", "stance", "breach"],
    },
  },
} as const
