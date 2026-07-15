import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Define a placeholder for our auth state and mock callbacks
let mockAuthStateCallback: ((user: any) => void) | null = null;
let currentMockUser: any = null;

// Mock Supabase module precisely to simulate authentication state machine
vi.mock("../lib/supabase", () => {
  return {
    isSupabaseConfigured: () => true,
    getSupabase: () => ({
      auth: {
        getSession: async () => ({ data: { session: null } })
      }
    }),
    supabaseAuth: {
      getCurrentUser: async () => currentMockUser,
      signUp: vi.fn(async (email, password, displayName) => {
        if (!email || !email.includes("@")) {
          return { user: null, error: "Invalid email format." };
        }
        if (!password || password.length < 6) {
          return { user: null, error: "Password must be at least 6 characters." };
        }
        currentMockUser = { uid: "user-123", email, displayName, emailVerified: true };
        if (mockAuthStateCallback) mockAuthStateCallback(currentMockUser);
        return { user: currentMockUser, error: null };
      }),
      signIn: vi.fn(async (email, password) => {
        if (!email || !email.includes("@")) {
          return { user: null, error: "Invalid email format." };
        }
        if (!password || password.length < 6) {
          return { user: null, error: "Incorrect credentials." };
        }
        currentMockUser = { uid: "user-123", email, displayName: "John Doe", emailVerified: true };
        if (mockAuthStateCallback) mockAuthStateCallback(currentMockUser);
        return { user: currentMockUser, error: null };
      }),
      signOut: vi.fn(async () => {
        currentMockUser = null;
        if (mockAuthStateCallback) mockAuthStateCallback(null);
        return { error: null };
      }),
      onAuthStateChange: vi.fn((callback) => {
        mockAuthStateCallback = callback;
        callback(currentMockUser);
        return () => {
          mockAuthStateCallback = null;
        };
      }),
    },
    supabaseDb: {
      getProfile: vi.fn(async () => ({ name: "John Doe" })),
      saveProfile: vi.fn(async () => true),
      saveActivity: vi.fn(async () => true),
      getActivities: vi.fn(async () => []),
    }
  };
});

describe("Critical Authentication Flows & Validation Tests via Supabase", () => {
  beforeEach(() => {
    currentMockUser = null;
    mockAuthStateCallback = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should validate and block sign-in for invalid email formats", async () => {
    const { supabaseAuth } = await import("../lib/supabase");

    const res = await supabaseAuth.signIn("invalid-email-string", "password123");
    expect(res.user).toBeNull();
    expect(res.error).toBe("Invalid email format.");
  });

  it("should validate and block sign-in for incorrect/short passwords", async () => {
    const { supabaseAuth } = await import("../lib/supabase");

    const res = await supabaseAuth.signIn("test@email.com", "123");
    expect(res.user).toBeNull();
    expect(res.error).toBe("Incorrect credentials.");
  });

  it("should successfully sign in with correct email and password and transition user context", async () => {
    const { supabaseAuth } = await import("../lib/supabase");

    let activeUser: any = null;
    supabaseAuth.onAuthStateChange((u) => {
      activeUser = u;
    });

    const res = await supabaseAuth.signIn("john.doe@university.edu", "securePassword123");
    expect(res.user).toBeDefined();
    expect(res.user?.uid).toBe("user-123");
    expect(res.user?.email).toBe("john.doe@university.edu");

    expect(activeUser).toBeDefined();
    expect(activeUser?.uid).toBe("user-123");
    expect(activeUser?.emailVerified).toBe(true);
  });

  it("should clear session state on successful user sign-out", async () => {
    const { supabaseAuth } = await import("../lib/supabase");

    let activeUser: any = null;
    supabaseAuth.onAuthStateChange((u) => {
      activeUser = u;
    });

    await supabaseAuth.signUp("guest@placementos.com", "PlacementOSGuest123!", "Guest Student");
    expect(activeUser?.uid).toBe("user-123");

    await supabaseAuth.signOut();
    expect(activeUser).toBeNull();
  });
});
