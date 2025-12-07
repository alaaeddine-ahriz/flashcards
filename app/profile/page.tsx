"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { SegmentedTabs } from "@/components/profile/SegmentedTabs";
import { ProgressBar, StatCard } from "@/components/ui";
import { DeckProgressItem } from "@/components/deck";
import {
    getOverallMastery,
    getTotalCardsMastered,
    getCurrentStreak,
    getWeakestDeck,
    getDeckProgress,
} from "@/services/progressService";
import { getAllFlashcards } from "@/services/flashcardService";
import { DeckProgress } from "@/types";

const tabs = [
    { value: "overview", label: "Overview" },
    { value: "decks", label: "Decks" },
    { value: "activity", label: "Activity" },
];

export default function ProfilePage() {
    const [overallMastery, setOverallMastery] = useState(0);
    const [cardsMastered, setCardsMastered] = useState(0);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [weakestDeck, setWeakestDeck] = useState<{ name: string; mastery: number } | null>(null);
    const [deckProgress, setDeckProgress] = useState<DeckProgress[]>([]);
    const [totalCards, setTotalCards] = useState(0);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        loadStats();
    }, []);

    function loadStats() {
        setOverallMastery(getOverallMastery());
        setCardsMastered(getTotalCardsMastered());
        setCurrentStreak(getCurrentStreak());
        setWeakestDeck(getWeakestDeck());
        setDeckProgress(getDeckProgress());
        setTotalCards(getAllFlashcards().length);
    }

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
                    ME
                </div>
                <div>
                    <p className="text-xl font-bold text-foreground">Student</p>
                    <p className="text-sm text-muted-foreground">
                        Mastery Level: {overallMastery}%
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
                    {/* Overall Mastery */}
                    <div className="flex flex-col gap-3 p-4">
                        <ProgressBar
                            value={overallMastery}
                            label="Overall Mastery"
                            showPercentage
                        />
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 p-4">
                        <StatCard label="Cards Mastered" value={cardsMastered.toLocaleString()} />
                        <StatCard
                            label="Current Streak"
                            value={currentStreak > 0 ? `${currentStreak} Day${currentStreak !== 1 ? "s" : ""}` : "—"}
                        />
                        <StatCard
                            label="Weakest Deck"
                            value={weakestDeck?.name || "—"}
                            fullWidth
                        />
                    </div>

                    {/* Quick Stats */}
                    <div className="flex flex-wrap gap-4 p-4 pt-0">
                        <StatCard label="Total Cards" value={totalCards.toLocaleString()} />
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
                                    icon={deck.icon}
                                    progress={deck.progress}
                                />
                            ))
                        )}
                    </div>
                </>
            )}

            {activeTab === "activity" && (
                <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
                    <span className="material-symbols-outlined text-6xl text-muted-foreground">
                        timeline
                    </span>
                    <p className="text-lg font-medium text-muted-foreground">
                        Activity tracking coming soon!
                    </p>
                </div>
            )}
        </div>
    );
}
