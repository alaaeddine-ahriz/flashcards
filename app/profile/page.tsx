"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { useAuth } from "@/contexts/AuthContext";
import { SegmentedTabs } from "@/components/profile/SegmentedTabs";
import { StatCard } from "@/components/ui";
import { DeckProgressItem } from "@/components/deck";
import {
    getOverallStats,
    getCurrentStreak,
    getWeakestDeck,
    getDeckProgress,
} from "@/services/progressService";
import { getCachedProgress } from "@/lib/cache";
import { DeckProgress } from "@/types";

// Helper to extract name and initials from email
function getUserDisplayInfo(email: string | undefined) {
    if (!email) return { name: "Student", initials: "ME" };
    const namePart = email.split("@")[0];
    // Capitalize first letter
    const name = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    // Get initials (first two characters, uppercase)
    const initials = namePart.slice(0, 2).toUpperCase();
    return { name, initials };
}

const tabs = [
    { value: "overview", label: "Overview" },
    { value: "decks", label: "Decks" },
    { value: "activity", label: "Activity" },
];

// Types for stats
interface OverallStats {
    newCount: number;
    learningCount: number;
    masteredCount: number;
    totalCount: number;
    masteryPercent: number;
}

export default function ProfilePage() {
    const router = useRouter();
    const { signOut, user } = useAuth();
    const { name, initials } = getUserDisplayInfo(user?.email ?? undefined);
    const [overallStats, setOverallStats] = useState<OverallStats>({
        newCount: 0,
        learningCount: 0,
        masteredCount: 0,
        totalCount: 0,
        masteryPercent: 0,
    });
    const [currentStreak, setCurrentStreak] = useState(0);
    const [weakestDeck, setWeakestDeck] = useState<{ name: string; mastery: number } | null>(null);
    const [deckProgress, setDeckProgress] = useState<DeckProgress[]>([]);
    const [totalCardsReviewed, setTotalCardsReviewed] = useState(0);
    const [activeTab, setActiveTab] = useState("overview");

    const handleLogout = async () => {
        await signOut();
        router.push("/auth");
    };

    const loadStats = useCallback(() => {
        // All synchronous cache reads - fast!
        setOverallStats(getOverallStats());
        setCurrentStreak(getCurrentStreak());
        setWeakestDeck(getWeakestDeck());
        setDeckProgress(getDeckProgress());
        setTotalCardsReviewed(getCachedProgress().totalCardsReviewed);
    }, []);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    // Calculate percentages for stacked bar
    const { newCount, learningCount, masteredCount, totalCount, masteryPercent } = overallStats;
    const newPercent = totalCount > 0 ? (newCount / totalCount) * 100 : 0;
    const learningPercent = totalCount > 0 ? (learningCount / totalCount) * 100 : 0;
    const masteredPercent = totalCount > 0 ? (masteredCount / totalCount) * 100 : 0;

    return (
        <div className="relative flex min-h-screen w-full flex-col">
            {/* Top App Bar */}
            <TopAppBar
                title="Profile"
                leftAction={
                    <Link href="/decks">
                        <span className="material-symbols-outlined text-2xl text-foreground">
                            arrow_back_ios_new
                        </span>
                    </Link>
                }
            />

            {/* Profile Summary */}
            <div className="flex items-center gap-4 px-4 py-4">
                <div className="flex size-16 items-center justify-center rounded-full bg-primary text-xl font-medium text-white">
                    {initials}
                </div>
                <div>
                    <p className="text-xl font-bold text-foreground">{name}</p>
                    <p className="text-sm text-muted-foreground">
                        {totalCount} cards • {masteryPercent}% mastered
                    </p>
                </div>
            </div>

            {/* Segmented Tabs */}
            <div className="sticky top-[60px] z-10 bg-background px-4 py-3">
                <SegmentedTabs
                    tabs={tabs}
                    defaultValue="overview"
                    onChange={setActiveTab}
                />
            </div>

            {activeTab === "overview" && (
                <>
                    {/* Overall Card Distribution */}
                    <div className="flex flex-col gap-4 p-4">
                        <h3 className="text-lg font-bold text-foreground">Card Distribution</h3>

                        {/* Stacked Progress Bar */}
                        <div className="h-4 w-full overflow-hidden rounded-full bg-muted">
                            <div className="flex h-full">
                                {masteredPercent > 0 && (
                                    <div
                                        className="bg-success transition-all"
                                        style={{ width: `${masteredPercent}%` }}
                                    />
                                )}
                                {learningPercent > 0 && (
                                    <div
                                        className="bg-primary transition-all"
                                        style={{ width: `${learningPercent}%` }}
                                    />
                                )}
                                {newPercent > 0 && (
                                    <div
                                        className="bg-warning transition-all"
                                        style={{ width: `${newPercent}%` }}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full bg-warning" />
                                <span className="text-sm text-muted-foreground">New</span>
                                <span className="font-semibold text-foreground">{newCount}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full bg-primary" />
                                <span className="text-sm text-muted-foreground">Learning</span>
                                <span className="font-semibold text-foreground">{learningCount}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full bg-success" />
                                <span className="text-sm text-muted-foreground">Mastered</span>
                                <span className="font-semibold text-foreground">{masteredCount}</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 p-4">
                        <StatCard
                            label="Current Streak"
                            value={currentStreak > 0 ? `${currentStreak} Day${currentStreak !== 1 ? "s" : ""}` : "—"}
                        />
                        <StatCard
                            label="Cards Reviewed"
                            value={totalCardsReviewed.toLocaleString()}
                        />
                        <StatCard
                            label="Weakest Deck"
                            value={weakestDeck?.name || "—"}
                            fullWidth
                        />
                    </div>

                    {/* Quick Stats */}
                    <div className="flex flex-wrap gap-4 p-4 pt-0">
                        <StatCard label="Total Cards" value={totalCount.toLocaleString()} />
                        <StatCard label="Decks" value={deckProgress.length.toString()} />
                    </div>
                </>
            )}

            {activeTab === "decks" && (
                <>
                    {/* Deck Progress List */}
                    <div className="flex flex-col px-4 pb-2 pt-4">
                        <h3 className="text-lg font-bold text-foreground">Deck Progress</h3>
                    </div>
                    <div className="flex flex-col gap-3 p-4 pt-2">
                        {deckProgress.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <span className="material-symbols-outlined text-5xl text-muted-foreground">
                                    style
                                </span>
                                <p className="mt-4 text-base text-muted-foreground">
                                    No decks yet. Create one to track progress!
                                </p>
                            </div>
                        ) : (
                            deckProgress.map((deck) => (
                                <DeckProgressItem
                                    key={deck.id}
                                    name={deck.name}
                                    newCount={deck.newCount}
                                    learningCount={deck.learningCount}
                                    masteredCount={deck.masteredCount}
                                    totalCount={deck.totalCount}
                                />
                            ))
                        )}
                    </div>
                </>
            )}

            {activeTab === "activity" && (
                <div className="flex flex-col gap-4 p-4">
                    <h3 className="text-lg font-bold text-foreground">Recent Activity</h3>

                    {/* Today's Stats */}
                    <div className="rounded-xl border border-muted bg-card/50 p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                                <span className="material-symbols-outlined text-primary">today</span>
                            </div>
                            <div>
                                <p className="font-semibold text-foreground">Today</p>
                                <p className="text-sm text-muted-foreground">
                                    {currentStreak > 0
                                        ? `${currentStreak} day streak! Keep it up!`
                                        : "Practice to start your streak!"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Summary */}
                    <div className="rounded-xl border border-muted bg-card/50 p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/20">
                                <span className="material-symbols-outlined text-success">check_circle</span>
                            </div>
                            <div>
                                <p className="font-semibold text-foreground">Total Reviews</p>
                                <p className="text-sm text-muted-foreground">
                                    {totalCardsReviewed.toLocaleString()} cards reviewed all time
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Mastery Progress */}
                    <div className="rounded-xl border border-muted bg-card/50 p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/20">
                                <span className="material-symbols-outlined text-warning">trending_up</span>
                            </div>
                            <div>
                                <p className="font-semibold text-foreground">Mastery Progress</p>
                                <p className="text-sm text-muted-foreground">
                                    {masteredCount} of {totalCount} cards mastered ({masteryPercent}%)
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Decks Info */}
                    <div className="rounded-xl border border-muted bg-card/50 p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                                <span className="material-symbols-outlined text-primary">folder</span>
                            </div>
                            <div>
                                <p className="font-semibold text-foreground">Decks</p>
                                <p className="text-sm text-muted-foreground">
                                    {deckProgress.length} deck{deckProgress.length !== 1 ? "s" : ""} created
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Logout Section */}
            <div className="mt-auto border-t border-muted p-4">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 font-medium text-destructive transition-colors hover:bg-destructive/20"
                >
                    <span className="material-symbols-outlined">logout</span>
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );
}
