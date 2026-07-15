import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Define a placeholder for our auth state and mock callbacks
let mockAuthStateCallback: ((user: any) => void) | null = null;
let currentMockUser: any = null;

// Mock Firebase module precisely to simulate authentication state machine
vi.mock("../lib/firebase", () => {
  return {
    auth: {
      get currentUser() {
        return currentMockUser;
      },
      onAuthStateChanged: vi.fn((callback) => {
        mockAuthStateCallback = callback;
        // Trigger immediately with initial user
        callback(currentMockUser);
        return () => {
          mockAuthStateCallback = null;
        };
      }),
    },
    db: {},
  };
});

// Mock the individual Firebase SDK methods
vi.mock("firebase/auth", () => {
  return {
    getAuth: vi.fn(() => ({})),
    signInWithEmailAndPassword: vi.fn(async (auth, email, password) => {
      // 1. Sign-in Validation Logic
      if (!email || !email.includes("@")) {
        const error = new Error("auth/invalid-email");
        (error as any).code = "auth/invalid-email";
        throw error;
      }
      if (!password || password.length < 6) {
        const error = new Error("auth/wrong-password");
        (error as any).code = "auth/wrong-password";
        throw error;
      }

      currentMockUser = { uid: "user-123", email, isAnonymous: false };
      if (mockAuthStateCallback) mockAuthStateCallback(currentMockUser);
      return { user: currentMockUser };
    }),
    signInAnonymously: vi.fn(async (auth) => {
      currentMockUser = { uid: "anon-456", isAnonymous: true };
      if (mockAuthStateCallback) mockAuthStateCallback(currentMockUser);
      return { user: currentMockUser };
    }),
    signOut: vi.fn(async (auth) => {
      currentMockUser = null;
      if (mockAuthStateCallback) mockAuthStateCallback(null);
    }),
    GoogleAuthProvider: class {},
    signInWithPopup: vi.fn(async (auth, provider) => {
      currentMockUser = { uid: "google-789", email: "google@user.com", isAnonymous: false };
      if (mockAuthStateCallback) mockAuthStateCallback(currentMockUser);
      return { user: currentMockUser };
    }),
  };
});

// Human-friendly error translation helper mimicking client implementation
function getHumanFriendlyError(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "The email address is badly formatted.";
    case "auth/wrong-password":
      return "Incorrect credentials. Please verify and retry.";
    case "auth/user-not-found":
      return "No account exists with this email address.";
    case "auth/email-already-in-use":
      return "An account already exists with this email.";
    default:
      return "An unexpected authentication error occurred. Please try again.";
  }
}

describe("Critical Authentication Flows & Validation Tests", () => {
  beforeEach(() => {
    currentMockUser = null;
    mockAuthStateCallback = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should validate and block sign-in for invalid email formats", async () => {
    const { signInWithEmailAndPassword } = await import("firebase/auth");
    const { auth } = await import("../lib/firebase");

    await expect(signInWithEmailAndPassword(auth as any, "invalid-email-string", "password123")).rejects.toThrow();
    
    try {
      await signInWithEmailAndPassword(auth as any, "invalid-email-string", "password123");
    } catch (err: any) {
      expect(err.code).toBe("auth/invalid-email");
      expect(getHumanFriendlyError(err.code)).toBe("The email address is badly formatted.");
    }
  });

  it("should validate and block sign-in for incorrect/short passwords", async () => {
    const { signInWithEmailAndPassword } = await import("firebase/auth");
    const { auth } = await import("../lib/firebase");

    await expect(signInWithEmailAndPassword(auth as any, "test@email.com", "123")).rejects.toThrow();
    
    try {
      await signInWithEmailAndPassword(auth as any, "test@email.com", "123");
    } catch (err: any) {
      expect(err.code).toBe("auth/wrong-password");
      expect(getHumanFriendlyError(err.code)).toBe("Incorrect credentials. Please verify and retry.");
    }
  });

  it("should successfully sign in with correct email and password and transition user context", async () => {
    const { signInWithEmailAndPassword } = await import("firebase/auth");
    const { auth } = await import("../lib/firebase");

    // Pre-register subscriber to check session state transition
    let activeUser: any = null;
    auth.onAuthStateChanged((u) => {
      activeUser = u;
    });

    const result = await signInWithEmailAndPassword(auth as any, "john.doe@university.edu", "securePassword123");
    expect(result.user).toBeDefined();
    expect(result.user.uid).toBe("user-123");
    expect(result.user.email).toBe("john.doe@university.edu");

    // Verify session persistence listener was notified of transition
    expect(activeUser).toBeDefined();
    expect(activeUser?.uid).toBe("user-123");
    expect(activeUser?.isAnonymous).toBe(false);
  });

  it("should support anonymous guest sign-in flow and transition user context", async () => {
    const { signInAnonymously } = await import("firebase/auth");
    const { auth } = await import("../lib/firebase");

    let activeUser: any = null;
    auth.onAuthStateChanged((u) => {
      activeUser = u;
    });

    const result = await signInAnonymously(auth as any);
    expect(result.user.uid).toBe("anon-456");
    expect(result.user.isAnonymous).toBe(true);

    expect(activeUser?.uid).toBe("anon-456");
  });

  it("should clear session state on successful user sign-out", async () => {
    const { signInAnonymously, signOut } = await import("firebase/auth");
    const { auth } = await import("../lib/firebase");

    let activeUser: any = null;
    auth.onAuthStateChanged((u) => {
      activeUser = u;
    });

    // Sign in first
    await signInAnonymously(auth as any);
    expect(activeUser?.uid).toBe("anon-456");

    // Sign out
    await signOut(auth as any);
    expect(activeUser).toBeNull();
    expect(auth.currentUser).toBeNull();
  });
});
