"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";
import { supabase } from "@/lib/supabase";
import { supabaseDataService } from "@/lib/services/SupabaseDataService";

interface AuthContextType {
    user: User | null;
    login: (email: string) => Promise<void>; // Kept for interface compatibility, but we might change usage
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const currentUser = await supabaseDataService.getCurrentUser();
                setUser(currentUser);
            } catch (e) {
                console.error("Auth check failed", e);
            } finally {
                setIsLoading(false);
            }
        };

        checkUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                const currentUser = await supabaseDataService.getCurrentUser();
                setUser(currentUser);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email: string) => {
        // Redundant in Supabase Auth flow usually (since we need password), 
        // but keeping method signature for now.
        // In real usage, components should call supabase.auth.signInWithPassword directly 
        // OR we expose a proper signIn method here.
        console.warn("Use supabase.auth.signInWithPassword instead of login(email)");
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        window.location.href = "/";
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

