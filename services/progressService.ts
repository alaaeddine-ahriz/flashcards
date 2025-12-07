/**
 * Progress Service - Cache-First Implementation
 * All reads are from local cache for instant response.
 * Note: updateStreak and incrementCardsReviewed are in practiceService
 */

import {
    getCachedProgress,
    getCachedFlashcards,
    getCachedDecks,
} from "@/lib/cache";
import { UserProgress, DeckProgress } from "@/types";

const MASTERY_THRESHOLD_DAYS = 7;

/**
 * Get user progress from cache
 */
export function getProgress(): UserProgress {
    return getCachedProgress();
}

/**
 * Calculate overall mastery percentage from cached flashcards
 */
export function getOverallMastery(): number {
    const flashcards = getCachedFlashcards();
    if (flashcards.length === 0) return 0;

    const mastered = flashcards.filter((c) => c.interval >= MASTERY_THRESHOLD_DAYS).length;
    return Math.round((mastered / flashcards.length) * 100);
}

/**
 * Get total cards mastered count
 */
export function getTotalCardsMastered(): number {
    const flashcards = getCachedFlashcards();
    return flashcards.filter((c) => c.interval >= MASTERY_THRESHOLD_DAYS).length;
}

/**
 * Get deck progress for all decks
 */
export function getDeckProgress(): DeckProgress[] {
    const decks = getCachedDecks();
    const flashcards = getCachedFlashcards();

    return decks.map((deck) => {
        const deckCards = flashcards.filter((c) => c.deckId === deck.id);
        const cardCount = deckCards.length;

        const mastered = deckCards.filter((c) => c.interval >= MASTERY_THRESHOLD_DAYS).length;
        const progress = cardCount > 0 ? Math.round((mastered / cardCount) * 100) : 0;

        // Choose icon based on progress
        let icon = "pending";
        if (progress >= 80) icon = "done_all";
        else if (progress >= 50) icon = "translate";

        return {
            id: deck.id,
            name: deck.name,
            icon,
            progress,
        };
    });
}

/**
 * Get the weakest deck (lowest mastery)
 */
export function getWeakestDeck(): { name: string; mastery: number } | null {
    const deckProgress = getDeckProgress();

    if (deckProgress.length === 0) return null;

    let weakest: { name: string; mastery: number } | null = null;

    for (const deck of deckProgress) {
        if (!weakest || deck.progress < weakest.mastery) {
            weakest = { name: deck.name, mastery: deck.progress };
        }
    }

    return weakest;
}

/**
 * Get current streak from cache
 */
export function getCurrentStreak(): number {
    const progress = getCachedProgress();

    const lastDate = progress.lastPracticeDate?.split("T")[0];
    if (!lastDate) return 0;

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (lastDate === today || lastDate === yesterdayStr) {
        return progress.currentStreak;
    }

    return 0;
}
