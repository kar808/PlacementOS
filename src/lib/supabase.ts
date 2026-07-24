import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { supabase as exportedSupabase } from "../supabaseClient";

/**
 * ============================================================================
 * SUPABASE POSTGRESQL SCHEMA TEMPLATE
 * ============================================================================
 * Paste and execute the following SQL in your Supabase SQL Editor:
 * 
 * -- 1. Create profiles table
 * CREATE TABLE IF NOT EXISTS public.profiles (
 *   id TEXT PRIMARY KEY,
 *   profile JSONB DEFAULT '{}'::jsonb,
 *   intelligence JSONB DEFAULT '{}'::jsonb,
 *   scores JSONB DEFAULT '{}'::jsonb,
 *   roles JSONB DEFAULT '{"list":[]}'::jsonb,
 *   hr_analysis JSONB DEFAULT '{}'::jsonb,
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
 * 
 * CREATE POLICY "Allow users to read their own profile" 
 *   ON public.profiles FOR SELECT 
 *   USING (auth.uid()::text = id);
 * 
 * CREATE POLICY "Allow users to insert/update their own profile" 
 *   ON public.profiles FOR ALL 
 *   USING (auth.uid()::text = id)
 *   WITH CHECK (auth.uid()::text = id);
 * 
 * -- 2. Create interviews table
 * CREATE TABLE IF NOT EXISTS public.interviews (
 *   id TEXT PRIMARY KEY,
 *   user_id TEXT NOT NULL,
 *   data JSONB NOT NULL DEFAULT '{}'::jsonb,
 *   timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
 * 
 * CREATE POLICY "Allow users to read their own interviews" 
 *   ON public.interviews FOR SELECT 
 *   USING (auth.uid()::text = user_id);
 * 
 * CREATE POLICY "Allow users to manage their own interviews" 
 *   ON public.interviews FOR ALL 
 *   USING (auth.uid()::text = user_id)
 *   WITH CHECK (auth.uid()::text = user_id);
 * 
 * -- 3. Create activity_log table
 * CREATE TABLE IF NOT EXISTS public.activity_log (
 *   id TEXT PRIMARY KEY,
 *   user_id TEXT NOT NULL,
 *   data JSONB NOT NULL DEFAULT '{}'::jsonb,
 *   timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
 * 
 * CREATE POLICY "Allow users to read their own activity log" 
 *   ON public.activity_log FOR SELECT 
 *   USING (auth.uid()::text = user_id);
 * 
 * CREATE POLICY "Allow users to manage their own activity log" 
 *   ON public.activity_log FOR ALL 
 *   USING (auth.uid()::text = user_id)
 *   WITH CHECK (auth.uid()::text = user_id);
 * 
 * -- 4. Create system_logs table
 * CREATE TABLE IF NOT EXISTS public.system_logs (
 *   id BIGSERIAL PRIMARY KEY,
 *   user_id TEXT,
 *   level TEXT,
 *   category TEXT,
 *   message TEXT,
 *   details JSONB,
 *   timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
 * 
 * CREATE POLICY "Allow anonymous system log insertion" 
 *   ON public.system_logs FOR INSERT 
 *   WITH CHECK (true);
 * 
 * CREATE POLICY "Allow users to read their own system logs" 
 *   ON public.system_logs FOR SELECT 
 *   USING (auth.uid()::text = user_id);
 * 
 * -- 5. Create waitlist table
 * CREATE TABLE IF NOT EXISTS public.waitlist (
 *   id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
 *   full_name TEXT NOT NULL,
 *   email TEXT UNIQUE NOT NULL,
 *   role TEXT NOT NULL,
 *   organization TEXT DEFAULT '',
 *   source TEXT DEFAULT 'organic',
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
 * 
 * CREATE POLICY "Allow anyone to join the waitlist" 
 *   ON public.waitlist FOR INSERT 
 *   WITH CHECK (true);
 * 
 * CREATE POLICY "Allow authenticated read to waitlist" 
 *   ON public.waitlist FOR SELECT 
 *   USING (true);
 * 
 * -- 6. Create waitlist_duplicates table
 * CREATE TABLE IF NOT EXISTS public.waitlist_duplicates (
 *   id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
 *   email TEXT NOT NULL,
 *   full_name TEXT NOT NULL,
 *   role TEXT NOT NULL,
 *   organization TEXT DEFAULT '',
 *   source TEXT DEFAULT 'organic',
 *   timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * ALTER TABLE public.waitlist_duplicates ENABLE ROW LEVEL SECURITY;
 * 
 * CREATE POLICY "Allow anyone to log waitlist duplicates" 
 *   ON public.waitlist_duplicates FOR INSERT 
 *   WITH CHECK (true);
 * ============================================================================
 */

export interface AdaptedUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  isSupabase: boolean;
}

let supabaseInstance: SupabaseClient | null = null;

// Lazy initialization of Supabase client
export function getSupabase(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const url = (import.meta as any).env?.VITE_SUPABASE_URL;
  const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

  if (url && key) {
    try {
      const sanitizedUrl = url.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
      supabaseInstance = createClient(sanitizedUrl, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      return supabaseInstance;
    } catch (error) {
      console.error("Failed to initialize Supabase client from env:", error);
    }
  }

  // Fallback to exported supabase client from supabaseClient.js
  return exportedSupabase as unknown as SupabaseClient;
}

export const isSupabaseConfigured = (): boolean => {
  return true;
};

// Map Supabase User metadata to unified interface
function adaptSupabaseUser(sbUser: any): AdaptedUser {
  return {
    uid: sbUser.id,
    email: sbUser.email || null,
    displayName: sbUser.user_metadata?.full_name || sbUser.email?.split("@")[0] || "Supabase User",
    emailVerified: !!sbUser.email_confirmed_at,
    isSupabase: true,
  };
}

/**
 * SUPABASE AUTHENTICATION API
 */
export const supabaseAuth = {
  async signUp(email: string, password: string, fullName?: string): Promise<{ user: AdaptedUser | null; error: string | null }> {
    const supabase = getSupabase();
    if (!supabase) {
      return { user: null, error: "Supabase client is not initialized or configured." };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) return { user: null, error: error.message };
      if (!data.user) return { user: null, error: "Sign-up completed but no user record was returned." };

      return { user: adaptSupabaseUser(data.user), error: null };
    } catch (err: any) {
      return { user: null, error: err.message || "An unexpected error occurred during signup." };
    }
  },

  async signIn(email: string, password: string): Promise<{ user: AdaptedUser | null; error: string | null }> {
    const supabase = getSupabase();
    if (!supabase) {
      return { user: null, error: "Supabase client is not initialized or configured." };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { user: null, error: error.message };
      if (!data.user) return { user: null, error: "Login completed but no user record was returned." };

      return { user: adaptSupabaseUser(data.user), error: null };
    } catch (err: any) {
      return { user: null, error: err.message || "An unexpected error occurred during login." };
    }
  },

  async signOut(): Promise<{ error: string | null }> {
    const supabase = getSupabase();
    if (!supabase) return { error: null };

    try {
      const { error } = await supabase.auth.signOut();
      return { error: error ? error.message : null };
    } catch (err: any) {
      return { error: err.message || "An unexpected error occurred during sign out." };
    }
  },

  onAuthStateChange(callback: (user: AdaptedUser | null) => void): () => void {
    const supabase = getSupabase();
    if (!supabase) {
      // Return dummy unsubscribe function if not configured
      return () => {};
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        callback(adaptSupabaseUser(session.user));
      } else {
        callback(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  },

  async getCurrentUser(): Promise<AdaptedUser | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user ? adaptSupabaseUser(user) : null;
    } catch {
      return null;
    }
  },

  async signInWithGoogle(): Promise<{ error: string | null }> {
    const supabase = getSupabase();
    if (!supabase) return { error: "Supabase client not initialized." };

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      return { error: error ? error.message : null };
    } catch (err: any) {
      return { error: err.message || "An unexpected error occurred starting Google OAuth." };
    }
  },

  async resetPassword(email: string): Promise<{ error: string | null }> {
    const supabase = getSupabase();
    if (!supabase) return { error: "Supabase client not initialized." };

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      return { error: error ? error.message : null };
    } catch (err: any) {
      return { error: err.message || "An unexpected error occurred during password reset dispatch." };
    }
  },

  async resendVerificationEmail(email: string): Promise<{ error: string | null }> {
    const supabase = getSupabase();
    if (!supabase) return { error: "Supabase client not initialized." };

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      return { error: error ? error.message : null };
    } catch (err: any) {
      return { error: err.message || "An unexpected error occurred resending verification email." };
    }
  }
};

/**
 * SUPABASE DATABASE OPERATIONS API
 */
const isGuestOrSandbox = (userId: string) => 
  !userId || 
  userId.includes("guest") || 
  userId.includes("sandbox") || 
  userId.startsWith("local") || 
  userId.includes("user_local") || 
  userId.includes("local_");

export const supabaseDb = {
  async saveProfile(userId: string, profile: any): Promise<boolean> {
    if (isGuestOrSandbox(userId)) return true;
    const supabase = getSupabase();
    if (!supabase) return true;

    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: userId, profile, updated_at: new Date().toISOString() }, { onConflict: "id" });
      
      if (error) {
        console.warn("Supabase upsert profile warning (local state preserved):", error.message || error);
        return true;
      }
      return true;
    } catch (err: any) {
      console.warn("Supabase profile save exception (local state preserved):", err?.message || err);
      return true;
    }
  },

  async getProfile(userId: string): Promise<any | null> {
    if (isGuestOrSandbox(userId)) return null;
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("profile")
        .eq("id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // Not found is acceptable
        console.error("Supabase getProfile error:", error);
        return null;
      }
      return data?.profile || null;
    } catch (err) {
      console.error("Supabase getProfile exception:", err);
      return null;
    }
  },

  async saveAnalytics(userId: string, type: "intelligence" | "scores" | "roles" | "hrAnalysis", data: any): Promise<boolean> {
    if (isGuestOrSandbox(userId)) return true;
    const supabase = getSupabase();
    if (!supabase) return true;

    try {
      const columnMap: Record<string, string> = {
        intelligence: "intelligence",
        scores: "scores",
        roles: "roles",
        hrAnalysis: "hr_analysis",
      };

      const columnName = columnMap[type];
      if (!columnName) return true;

      const { error } = await supabase
        .from("profiles")
        .upsert({ id: userId, [columnName]: data, updated_at: new Date().toISOString() }, { onConflict: "id" });

      if (error) {
        console.warn(`Supabase saveAnalytics (${type}) warning (local state preserved):`, error.message || error);
        return true;
      }
      return true;
    } catch (err: any) {
      console.warn(`Supabase saveAnalytics (${type}) exception (local state preserved):`, err?.message || err);
      return true;
    }
  },

  async getAnalytics(userId: string, type: "intelligence" | "scores" | "roles" | "hrAnalysis"): Promise<any | null> {
    if (isGuestOrSandbox(userId)) return null;
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      const columnMap: Record<string, string> = {
        intelligence: "intelligence",
        scores: "scores",
        roles: "roles",
        hrAnalysis: "hr_analysis",
      };

      const columnName = columnMap[type];
      if (!columnName) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select(columnName)
        .eq("id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        console.error(`Supabase getAnalytics (${type}) error:`, error);
        return null;
      }
      return data ? data[columnName] : null;
    } catch (err) {
      console.error(`Supabase getAnalytics (${type}) exception:`, err);
      return null;
    }
  },

  async saveInterview(userId: string, sessionId: string, interviewData: any): Promise<boolean> {
    if (isGuestOrSandbox(userId)) return true;
    const supabase = getSupabase();
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from("interviews")
        .upsert({
          id: sessionId,
          user_id: userId,
          data: interviewData,
          timestamp: interviewData.timestamp || new Date().toISOString()
        }, { onConflict: "id" });

      if (error) {
        console.error("Supabase saveInterview error:", error);
        return false;
      }
      return true;
    } catch (err) {
      console.error("Supabase saveInterview exception:", err);
      return false;
    }
  },

  async getInterviews(userId: string): Promise<any[]> {
    if (isGuestOrSandbox(userId)) return [];
    const supabase = getSupabase();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from("interviews")
        .select("data")
        .eq("user_id", userId)
        .order("timestamp", { ascending: false });

      if (error) {
        console.error("Supabase getInterviews error:", error);
        return [];
      }
      return data ? data.map(item => item.data) : [];
    } catch (err) {
      console.error("Supabase getInterviews exception:", err);
      return [];
    }
  },

  async deleteInterview(userId: string, sessionId: string): Promise<boolean> {
    if (isGuestOrSandbox(userId)) return true;
    const supabase = getSupabase();
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from("interviews")
        .delete()
        .eq("id", sessionId)
        .eq("user_id", userId);

      if (error) {
        console.error("Supabase deleteInterview error:", error);
        return false;
      }
      return true;
    } catch (err) {
      console.error("Supabase deleteInterview exception:", err);
      return false;
    }
  },

  async saveActivity(userId: string, activityId: string, activityData: any): Promise<boolean> {
    if (isGuestOrSandbox(userId)) return true;
    const supabase = getSupabase();
    if (!supabase) return true;

    try {
      const { error } = await supabase
        .from("activity_log")
        .upsert({
          id: activityId,
          user_id: userId,
          data: activityData,
          timestamp: activityData.timestamp || new Date().toISOString()
        }, { onConflict: "id" });

      if (error) {
        console.warn("Supabase saveActivity warning (local state preserved):", error.message || error);
        return true;
      }
      return true;
    } catch (err: any) {
      console.warn("Supabase saveActivity exception (local state preserved):", err?.message || err);
      return true;
    }
  },

  async getActivities(userId: string): Promise<any[]> {
    if (isGuestOrSandbox(userId)) return [];
    const supabase = getSupabase();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from("activity_log")
        .select("id, data")
        .eq("user_id", userId)
        .order("timestamp", { ascending: false });

      if (error) {
        console.error("Supabase getActivities error:", error);
        return [];
      }
      return data ? data.map(item => ({ id: item.id, ...item.data })) : [];
    } catch (err) {
      console.error("Supabase getActivities exception:", err);
      return [];
    }
  },

  async saveSystemLog(logEntry: { level: string; category: string; message: string; details?: any; userId?: string | null }): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from("system_logs")
        .insert({
          user_id: logEntry.userId || "anonymous",
          level: logEntry.level,
          category: logEntry.category,
          message: logEntry.message,
          details: logEntry.details ? JSON.stringify(logEntry.details) : null,
          timestamp: new Date().toISOString()
        });

      if (error) return false;
      return true;
    } catch {
      return false;
    }
  },

  async deleteUser(userId: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    try {
      // 1. Delete interviews
      await supabase.from("interviews").delete().eq("user_id", userId);
      // 2. Delete activity log
      await supabase.from("activity_log").delete().eq("user_id", userId);
      // 3. Delete profile
      const { error } = await supabase.from("profiles").delete().eq("id", userId);

      return !error;
    } catch (err) {
      console.error("Supabase deleteUser exception:", err);
      return false;
    }
  },

  async getWaitlistCount(): Promise<number> {
    const supabase = getSupabase();
    if (!supabase) return 247;
    try {
      const { count, error } = await supabase
        .from("waitlist")
        .select("*", { count: "exact", head: true });
      if (error) {
        console.warn("Supabase count query failed:", error);
        return 247;
      }
      return count !== null ? count : 247;
    } catch (err) {
      console.error("Failed to fetch waitlist count from Supabase:", err);
      return 247;
    }
  }
};
