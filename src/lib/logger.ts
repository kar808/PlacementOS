import { isSupabaseConfigured, getSupabase, supabaseDb, supabaseAuth } from "./supabase";

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
  private async persistToCloud(entry: LogEntry) {
    let userId = entry.userId;
    if (!userId) {
      if (isSupabaseConfigured()) {
        try {
          const user = await supabaseAuth.getCurrentUser();
          userId = user?.uid || null;
        } catch {
          userId = null;
        }
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
      // If no cloud is configured, log locally in console/localStorage if needed
      try {
        const localLogs = JSON.parse(localStorage.getItem("placement_local_logs") || "[]");
        localLogs.push({ ...entry, stackTrace });
        localStorage.setItem("placement_local_logs", JSON.stringify(localLogs.slice(-100)));
      } catch (e) {
        console.error("Failed to save local log:", e);
      }
    }
  }

  log(level: LogLevel, category: LogEntry["category"], message: string, details?: any) {
    const entry: LogEntry = {
      level,
      category,
      message,
      timestamp: new Date().toISOString(),
      details,
      userId: null,
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
