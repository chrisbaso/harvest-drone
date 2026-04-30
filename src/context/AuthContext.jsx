import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

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
        setProfile(null);
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        await loadProfile(session.user.id);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signUp({ email, password }) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  }

  async function signOut() {
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
      signIn,
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
