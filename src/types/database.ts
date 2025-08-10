export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      mind_maps: {
        Row: {
          id: string;
          name: string;
          nodes: any;
          edges: any;
          created_at: string;
          updated_at: string;
          owner_id: string;
          collaborators: string[];
        };
        Insert: {
          id?: string;
          name: string;
          nodes?: any;
          edges?: any;
          created_at?: string;
          updated_at?: string;
          owner_id: string;
          collaborators?: string[];
        };
        Update: {
          id?: string;
          name?: string;
          nodes?: any;
          edges?: any;
          created_at?: string;
          updated_at?: string;
          owner_id?: string;
          collaborators?: string[];
        };
      };
    };
  };
}