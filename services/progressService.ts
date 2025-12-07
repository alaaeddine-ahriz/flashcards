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
 * Get overall stats with Anki-style card counts
 */
export function getOverallStats(): {
    newCount: number;
    learningCount: number;
    masteredCount: number;
    totalCount: number;
    masteryPercent: number;
} {
    const flashcards = getCachedFlashcards();
    const totalCount = flashcards.length;

    if (totalCount === 0) {
        return { newCount: 0, learningCount: 0, masteredCount: 0, totalCount: 0, masteryPercent: 0 };
    }

    const newCount = flashcards.filter((c) => c.repetitions === 0).length;
    const masteredCount = flashcards.filter((c) => c.interval >= MASTERY_THRESHOLD_DAYS).length;
    const learningCount = totalCount - newCount - masteredCount;
    const masteryPercent = Math.round((masteredCount / totalCount) * 100);

    return { newCount, learningCount, masteredCount, totalCount, masteryPercent };
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
        const totalCount = deckCards.length;

        // Anki-style card states
        const newCount = deckCards.filter((c) => c.repetitions === 0).length;
        const masteredCount = deckCards.filter((c) => c.interval >= MASTERY_THRESHOLD_DAYS).length;
        const learningCount = totalCount - newCount - masteredCount;

        const progress = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

        // Choose icon based on progress
        let icon = "pending";
        if (progress >= 80) icon = "done_all";
        else if (progress >= 50) icon = "translate";

        return {
            id: deck.id,
            name: deck.name,
            icon,
            progress,
            newCount,
            learningCount,
            masteredCount,
            totalCount,
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
