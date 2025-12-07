"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
    useCallback,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";
import { syncFromSupabase, syncToSupabase, clearCacheOnLogout } from "@/lib/sync";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    syncing: boolean;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    syncData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const supabase = createClient();

    // Sync data from Supabase to local cache
    const syncData = useCallback(async () => {
        setSyncing(true);
        await syncFromSupabase();
        setSyncing(false);
    }, []);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                await syncData();
            }
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (event === "SIGNED_IN" && session?.user) {
                await syncData();
            } else if (event === "SIGNED_OUT") {
                clearCacheOnLogout();
            }

            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [supabase.auth, syncData]);

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { error: error as Error | null };
    };

    const signUp = async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                // Disable email confirmation as requested
                emailRedirectTo: undefined,
            },
        });
        return { error: error as Error | null };
    };

    const signOut = async () => {
        // Sync any pending updates before logout
        await syncToSupabase();
        clearCacheOnLogout();
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                loading,
                syncing,
                signIn,
                signUp,
                signOut,
                syncData,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
