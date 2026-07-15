import { db, auth } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { isSupabaseConfigured, getSupabase, supabaseDb } from "./supabase";

export enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

export interface LogEntry {
  level: LogLevel;
  category: "auth" | "api" | "system" | "error_boundary" | "unhandled";
  message: string;
  timestamp: string | Date;
  details?: any;
  userId?: string | null;
}

class CentralLogger {
  private getUserId(): string | null {
    try {
      return auth.currentUser?.uid || null;
    } catch {
      return null;
    }
  }

  private async persistToCloud(entry: LogEntry) {
    let userId = entry.userId;
    if (!userId) {
      if (isSupabaseConfigured()) {
        const supabase = getSupabase();
        try {
          const { data: { session } } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
          userId = session?.user?.id || null;
        } catch {
          userId = null;
        }
      } else {
        userId = this.getUserId();
      }
    }
    
    // Extract or capture stack trace
    let stackTrace: string | null = null;
    if (entry.level === LogLevel.ERROR) {
      if (entry.details && typeof entry.details === "object" && entry.details.stack) {
        stackTrace = entry.details.stack;
      } else if (entry.details instanceof Error) {
        stackTrace = entry.details.stack || null;
      } else {
        try {
          throw new Error("Log stack trace capture");
        } catch (e: any) {
          stackTrace = e.stack || null;
        }
      }
    }

    if (isSupabaseConfigured()) {
      try {
        await supabaseDb.saveSystemLog({
          level: entry.level,
          category: entry.category,
          message: entry.message,
          userId: userId || "anonymous",
          details: {
            stackTrace,
            details: entry.details ? (entry.details instanceof Error ? entry.details.message : entry.details) : null,
          }
        });
      } catch (err) {
        console.error("Failed to persist log to Supabase system_logs:", err);
      }

      // If it's auth or a user activity, sync to user-specific activity_log table
      if (userId && (entry.category === "auth" || entry.level === LogLevel.INFO)) {
        try {
          await supabaseDb.saveActivity(userId, `act_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`, {
            event: entry.message,
            description: entry.details ? (entry.details instanceof Error ? entry.details.message : JSON.stringify(entry.details)) : entry.message,
            timestamp: new Date().toISOString(),
            category: entry.category
          });
        } catch (err) {
          console.error("Failed to persist activity to Supabase activity_log:", err);
        }
      }
    } else {
      // 1. Dedicated systemLogs Firestore Collection Transport
      try {
        await addDoc(collection(db, "systemLogs"), {
          level: entry.level,
          category: entry.category,
          message: entry.message,
          timestamp: serverTimestamp(),
          userId: userId || "anonymous",
          stackTrace: stackTrace,
          details: entry.details ? (entry.details instanceof Error ? entry.details.message : JSON.stringify(entry.details)) : null,
        });
      } catch (err) {
        console.error("Failed to persist log to dedicated systemLogs collection:", err);
      }

      // 2. Backward compatible user-specific collection transport
      if (userId) {
        try {
          // Based on level/category, select subcollection according to firestore.rules
          const subcollection = entry.level === LogLevel.ERROR ? "errorLog" : "activityLog";
          const path = `users/${userId}/${subcollection}`;
          await addDoc(collection(db, path), {
            level: entry.level,
            category: entry.category,
            message: entry.message,
            timestamp: serverTimestamp(),
            details: entry.details ? (entry.details instanceof Error ? entry.details.message : JSON.stringify(entry.details)) : null,
            userId,
          });
        } catch (err) {
          console.error("Failed to persist log to Firestore user subcollection:", err);
        }
      } else {
        // If no user is logged in, send it to the server-side logging API
        try {
          await fetch("/api/logs", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ...entry, stackTrace }),
          });
        } catch (e) {
          console.error("Failed to send log to server:", e);
        }
      }
    }
  }

  log(level: LogLevel, category: LogEntry["category"], message: string, details?: any) {
    const userId = this.getUserId();
    const entry: LogEntry = {
      level,
      category,
      message,
      timestamp: new Date().toISOString(),
      details,
      userId,
    };

    // 1. Console Output with appropriate styles/colors
    const formattedMessage = `[PlacementOS Logger] [${level}] [${category.toUpperCase()}] ${message}`;
    if (level === LogLevel.ERROR) {
      console.error(formattedMessage, details || "");
    } else if (level === LogLevel.WARN) {
      console.warn(formattedMessage, details || "");
    } else {
      console.log(formattedMessage, details || "");
    }

    // 2. Persistent Storage (Fire & Forget async)
    this.persistToCloud(entry).catch((e) => console.error("Logger persistence failure:", e));
  }

  info(category: LogEntry["category"], message: string, details?: any) {
    this.log(LogLevel.INFO, category, message, details);
  }

  warn(category: LogEntry["category"], message: string, details?: any) {
    this.log(LogLevel.WARN, category, message, details);
  }

  error(category: LogEntry["category"], message: string, details?: any) {
    this.log(LogLevel.ERROR, category, message, details);
  }
}

export const logger = new CentralLogger();
