export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      contact_messages: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          is_read: boolean;
          message: string;
          name: string;
          privacy_accepted_at: string;
          privacy_version: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          is_read?: boolean;
          message: string;
          name: string;
          privacy_accepted_at: string;
          privacy_version: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          is_read?: boolean;
          message?: string;
          name?: string;
          privacy_accepted_at?: string;
          privacy_version?: string;
        };
        Relationships: [];
      };
      meetings: {
        Row: {
          created_at: string;
          created_by: string | null;
          description: string | null;
          id: string;
          image_path: string | null;
          meeting_date: string | null;
          published: boolean;
          title: string;
          type: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          image_path?: string | null;
          meeting_date?: string | null;
          published?: boolean;
          title: string;
          type?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          image_path?: string | null;
          meeting_date?: string | null;
          published?: boolean;
          title?: string;
          type?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      page_views: {
        Row: {
          created_at: string;
          id: string;
          page: string;
          user_agent: string | null;
          visitor_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          id?: string;
          page?: string;
          user_agent?: string | null;
          visitor_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          page?: string;
          user_agent?: string | null;
          visitor_id?: string | null;
        };
        Relationships: [];
      };
      site_content: {
        Row: {
          created_at: string;
          description: string | null;
          extra_data: NonNullable<Json>;
          id: string;
          image_path: string | null;
          section_key: string;
          subtitle: string | null;
          title: string | null;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          description?: string | null;
          extra_data?: NonNullable<Json>;
          id?: string;
          image_path?: string | null;
          section_key: string;
          subtitle?: string | null;
          title?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          extra_data?: NonNullable<Json>;
          id?: string;
          image_path?: string | null;
          section_key?: string;
          subtitle?: string | null;
          title?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      testimonials: {
        Row: {
          business_type: string | null;
          content: string;
          created_at: string;
          id: string;
          image_path: string | null;
          is_published: boolean;
          name: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          business_type?: string | null;
          content: string;
          created_at?: string;
          id?: string;
          image_path?: string | null;
          is_published?: boolean;
          name: string;
          updated_at?: string;
        };
        Update: {
          business_type?: string | null;
          content?: string;
          created_at?: string;
          id?: string;
          image_path?: string | null;
          is_published?: boolean;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      contact_rate_limit_hit: { Args: { p_ip: string }; Returns: boolean };
      human_page_views: {
        Args: { p_desde: string; p_hasta: string };
        Returns: {
          created_at: string;
          id: string;
          page: string;
          user_agent: string | null;
          visitor_id: string | null;
        }[];
        SetofOptions: {
          from: "*";
          to: "page_views";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      is_bot_user_agent: { Args: { p_user_agent: string }; Returns: boolean };
      meeting_stats: {
        Args: { p_desde: string; p_hasta: string };
        Returns: {
          asesorias: number;
          mes: string;
          publicadas: number;
          reuniones: number;
          total: number;
        }[];
      };
      page_view_stats: {
        Args: { p_desde: string; p_hasta: string };
        Returns: {
          mes: string;
          visitantes_unicos: number;
          visitas: number;
        }[];
      };
      page_view_totals: {
        Args: { p_desde: string; p_hasta: string };
        Returns: {
          visitantes_unicos: number;
          visitas: number;
        }[];
      };
    };
    Enums: {
      app_role: "admin" | "user";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const;
