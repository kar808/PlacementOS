import { db, auth } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

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
    const userId = entry.userId || this.getUserId();
    if (!userId) {
      // If no user is logged in, send it to the server-side logging API
      try {
        await fetch("/api/logs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(entry),
        });
      } catch (e) {
        console.error("Failed to send log to server:", e);
      }
      return;
    }

    try {
      // Based on level/category, select subcollection according to firestore.rules
      const subcollection = entry.level === LogLevel.ERROR ? "errorLog" : "activityLog";
      const path = `users/${userId}/${subcollection}`;
      await addDoc(collection(db, path), {
        level: entry.level,
        category: entry.category,
        message: entry.message,
        timestamp: serverTimestamp(),
        details: entry.details ? JSON.stringify(entry.details) : null,
        userId,
      });
    } catch (err) {
      console.error("Failed to persist log to Firestore:", err);
      // Fallback to server endpoint
      try {
        await fetch("/api/logs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(entry),
        });
      } catch (e) {
        // Silently swallow fallback failures to avoid infinite loops
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
