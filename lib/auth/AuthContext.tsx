"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Role } from "@/types";
import { mockDataService } from "@/lib/services/mock/MockDataService";

interface AuthContextType {
    user: User | null;
    login: (email: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check local storage for session simulation
        const storedUser = localStorage.getItem("karate_user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string) => {
        setIsLoading(true);
        try {
            const loggedInUser = await mockDataService.login(email);
            if (loggedInUser) {
                setUser(loggedInUser);
                localStorage.setItem("karate_user", JSON.stringify(loggedInUser));
            } else {
                alert("Invalid email (use admin@karate.com or john@karate.com)");
            }
        } catch (e) {
            console.error(e);
            alert("Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("karate_user");
        // Redirect logic usually goes here or in the component
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
