"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthPage() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { signIn, signUp } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const result = isSignUp
                ? await signUp(email, password)
                : await signIn(email, password);

            if (result.error) {
                setError(result.error.message);
            } else {
                router.push("/decks");
            }
        } catch {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-primary text-3xl">
                            school
                        </span>
                    </div>
                    <h1 className="text-2xl font-semibold text-on-surface">
                        Flashcards
                    </h1>
                    <p className="text-on-surface-variant mt-1">
                        {isSignUp ? "Create your account" : "Welcome back"}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email Input */}
                    <div className="space-y-2">
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-on-surface"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline/20 
                                     text-on-surface placeholder:text-on-surface-variant/50
                                     focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                                     transition-colors"
                            placeholder="you@example.com"
                        />
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-on-surface"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline/20 
                                     text-on-surface placeholder:text-on-surface-variant/50
                                     focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                                     transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 rounded-xl bg-error/10 border border-error/20">
                            <p className="text-sm text-error">{error}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 rounded-xl bg-primary text-on-primary font-medium
                                 hover:bg-primary/90 active:scale-[0.98] transition-all
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                                {isSignUp ? "Creating account..." : "Signing in..."}
                            </span>
                        ) : isSignUp ? (
                            "Create account"
                        ) : (
                            "Sign in"
                        )}
                    </button>
                </form>

                {/* Toggle Sign In/Sign Up */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-on-surface-variant">
                        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                        <button
                            type="button"
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError(null);
                            }}
                            className="text-primary font-medium hover:underline"
                        >
                            {isSignUp ? "Sign in" : "Sign up"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
