"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { DifficultyButtonGroup } from "@/components/practice/DifficultyButton";
import { SessionProgress } from "@/components/practice/SessionProgress";
import { Button } from "@/components/ui";
import { getCachedDecks } from "@/lib/cache";
import {
    getAllCardsForPractice,
    recordReview,
    updateStreak,
    incrementCardsReviewed,
    syncPracticeUpdates,
} from "@/services/practiceService";
import { Flashcard as FlashcardType, Difficulty } from "@/types";

export default function PracticePage() {
    const router = useRouter();
    const params = useParams();
    const deckId = params.id as string;

    const [cards, setCards] = useState<FlashcardType[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [deckName, setDeckName] = useState("");

    useEffect(() => {
        // Synchronous cache reads - fast!
        const decks = getCachedDecks();
        const deck = decks.find((d) => d.id === deckId);
        if (deck) {
            setDeckName(deck.name);
            const practiceCards = getAllCardsForPractice(deckId);
            setCards(practiceCards);
        }
        setIsLoading(false);
    }, [deckId]);

    const handleClose = useCallback(() => {
        router.push("/decks");
    }, [router]);

    const handleCardClick = useCallback(() => {
        setIsFlipped((prev) => !prev);
    }, []);

    const handleDifficulty = useCallback((difficulty: Difficulty) => {
        if (cards.length === 0) return;

        const currentCard = cards[currentIndex];

        // Synchronous cache updates - fast!
        recordReview(currentCard.id, difficulty);
        incrementCardsReviewed();
        updateStreak();

        // Move to next card
        if (currentIndex < cards.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            setIsFlipped(false);
        } else {
            // Practice complete - sync to Supabase in background
            syncPracticeUpdates();
            router.push("/decks");
        }
    }, [cards, currentIndex, router]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    if (cards.length === 0) {
        return (
            <div className="relative flex min-h-screen w-full flex-col items-center justify-center gap-4 p-4">
                <span className="material-symbols-outlined text-6xl text-muted-foreground">
                    school
                </span>
                <p className="text-lg font-medium text-muted-foreground">
                    No cards in this deck yet!
                </p>
                <button
                    onClick={handleClose}
                    className="text-primary underline"
                >
                    Go back
                </button>
            </div>
        );
    }

    const currentCard = cards[currentIndex];

    return (
        <div className="relative flex min-h-screen w-full flex-col">
            {/* Session Header */}
            <SessionProgress
                current={currentIndex + 1}
                total={cards.length}
                onClose={handleClose}
            />

            {/* Deck name */}
            <p className="px-4 text-center text-sm text-muted-foreground">
                {deckName}
            </p>

            {/* Main Content - Centered card with flip animation */}
            <main className="flex flex-1 items-center justify-center px-4">
                <div
                    className="perspective w-full max-w-md cursor-pointer"
                    onClick={handleCardClick}
                >
                    <div
                        className={`flip-card ${isFlipped ? "flipped" : ""}`}
                        style={{ height: "400px" }}
                    >
                        {/* Front of card */}
                        <div className="flip-card-front absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-card p-6 shadow-lg">
                            <h1 className="text-center text-2xl font-bold leading-relaxed text-foreground">
                                {currentCard.front}
                            </h1>
                        </div>

                        {/* Back of card */}
                        <div className="flip-card-back absolute inset-0 flex flex-col rounded-xl bg-card p-6 shadow-lg">
                            <div className="flex flex-1 flex-col justify-center">
                                <p className="mb-4 text-sm font-medium text-muted-foreground">
                                    {currentCard.front}
                                </p>
                                <hr className="mb-4 border-t border-muted" />
                                <h1 className="text-2xl font-bold leading-relaxed text-foreground">
                                    {currentCard.back}
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Hint text */}
            <p className="px-4 pb-2 text-center text-sm text-muted-foreground">
                {isFlipped ? "Tap card to hide answer" : "Tap card to reveal answer"}
            </p>

            {/* Footer Controls - Always visible */}
            <footer className="w-full p-4 pb-8">
                {!isFlipped ? (
                    <Button fullWidth size="lg" onClick={handleCardClick}>
                        <span className="material-symbols-outlined">visibility</span>
                        Reveal Answer
                    </Button>
                ) : (
                    <DifficultyButtonGroup onSelect={handleDifficulty} />
                )}
            </footer>
        </div>
    );
}
