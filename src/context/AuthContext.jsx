import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { signInDemoAccess as requestDemoAccess } from "../lib/demoAccessApi";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);
const DEMO_SESSION_STORAGE_KEY = "harvest_drone_demo_session";
const SHARED_DEMO_SESSION_STORAGE_KEY = "harvest_drone_shared_demo_session";
const DEMO_USER_ID = "00000000-0000-4000-8000-000000000001";
const DEMO_NETWORK_ID = "11111111-1111-4111-8111-111111111111";
const DEMO_DEALER_ID = "22222222-2222-4222-8222-222222222222";
const isLocalDemoAuthAvailable = import.meta.env.DEV;

function createDemoSession(role = "admin") {
  const profile = {
    id: DEMO_USER_ID,
    email: "demo@harvestdrone.local",
    full_name: "Harvest Drone Demo",
    role,
    dealer_id: DEMO_DEALER_ID,
    network_id: DEMO_NETWORK_ID,
    is_active: true,
    is_demo: true,
    dealers: {
      id: DEMO_DEALER_ID,
      name: "Harvest Demo Territory",
      slug: "demo-territory",
      state: "Upper Midwest",
      counties_served: ["Demo County A", "Demo County B", "Demo County C"],
      territory_description: "Generic demo territory for attribution and operator readiness walkthroughs.",
      training_status: "active",
    },
    dealer_networks: {
      id: DEMO_NETWORK_ID,
      name: "Harvest Demo Network",
      slug: "harvest-demo-network",
    },
  };

  return {
    user: {
      id: DEMO_USER_ID,
      email: profile.email,
      app_metadata: {},
      user_metadata: { full_name: profile.full_name, demo: true },
      aud: "authenticated",
      role: "authenticated",
    },
    profile,
  };
}

function loadDemoSession() {
  if (!isLocalDemoAuthAvailable || typeof window === "undefined") return null;
  return window.localStorage.getItem(DEMO_SESSION_STORAGE_KEY) === "true"
    ? createDemoSession("admin")
    : null;
}

function loadSharedDemoSession() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(SHARED_DEMO_SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveDemoSession() {
  if (isLocalDemoAuthAvailable && typeof window !== "undefined") {
    window.localStorage.setItem(DEMO_SESSION_STORAGE_KEY, "true");
  }
}

function clearDemoSession() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(DEMO_SESSION_STORAGE_KEY);
    window.sessionStorage.removeItem(SHARED_DEMO_SESSION_STORAGE_KEY);
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadProfile(userId) {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*, dealers(*), dealer_networks(*)")
      .eq("id", userId)
      .single();

    if (error) {
      console.warn("Unable to load user profile", error.message);
      setProfile(null);
    } else {
      setProfile(data);
    }

    setIsLoading(false);
  }

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;

      setUser(session?.user ?? null);

      if (session?.user) {
        await loadProfile(session.user.id);
      } else {
        const demoSession = loadSharedDemoSession() || loadDemoSession();
        setUser(demoSession?.user ?? null);
        setProfile(demoSession?.profile ?? null);
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        clearDemoSession();
        await loadProfile(session.user.id);
      } else {
        const demoSession = loadSharedDemoSession() || loadDemoSession();
        setUser(demoSession?.user ?? null);
        setProfile(demoSession?.profile ?? null);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signIn(email, password) {
    clearDemoSession();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  function signInDemo() {
    if (!isLocalDemoAuthAvailable) {
      throw new Error("Local demo mode is only available while running the Vite dev server.");
    }

    const demoSession = createDemoSession("admin");
    saveDemoSession();
    setUser(demoSession.user);
    setProfile(demoSession.profile);
    setIsLoading(false);
  }

  async function signInSharedDemo({ email, password }) {
    clearDemoSession();
    const demoSession = await requestDemoAccess({ email, password });

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(SHARED_DEMO_SESSION_STORAGE_KEY, JSON.stringify(demoSession));
    }

    setUser(demoSession.user);
    setProfile(demoSession.profile);
    setIsLoading(false);

    return demoSession;
  }

  async function signUp({ email, password }) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    clearDemoSession();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  const value = useMemo(() => {
    const role = profile?.role;

    return {
      user,
      profile,
      isLoading,
      isAuthenticated: Boolean(user),
      isAdmin: role === "admin",
      isNetworkManager: role === "network_manager",
      isDealer: role === "dealer",
      isOperator: role === "operator",
      dealerId: profile?.dealer_id ?? null,
      networkId: profile?.network_id ?? null,
      isDemo: Boolean(profile?.is_demo),
      canUseLocalDemoAuth: isLocalDemoAuthAvailable,
      signIn,
      signInDemo,
      signInSharedDemo,
      signUp,
      signOut,
    };
  }, [isLoading, profile, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
