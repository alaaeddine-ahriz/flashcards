/**
 * Practice Service - Cache-First Implementation
 * Reads from local cache for fast practice, queues updates for background sync.
 */

import { Flashcard, Difficulty } from "@/types";
import {
    getCachedFlashcardsForDeck,
    getCachedFlashcard,
    updateCachedFlashcard,
    getCachedProgress,
    setCachedProgress,
    queueFlashcardUpdate,
    queueProgressUpdate,
} from "@/lib/cache";
import { syncToSupabase } from "@/lib/sync";

/**
 * Get cards due for review in a deck (from cache)
 */
export function getCardsForReview(deckId: string): Flashcard[] {
    const cards = getCachedFlashcardsForDeck(deckId);
    const now = new Date().toISOString();

    // Cards due for review (nextReviewDate <= now)
    const dueCards = cards.filter((c) => c.nextReviewDate <= now);

    // Sort by review date (oldest first)
    dueCards.sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate));

    return dueCards;
}

/**
 * Get all cards in a deck for practice (from cache)
 */
export function getAllCardsForPractice(deckId: string): Flashcard[] {
    const cards = getCachedFlashcardsForDeck(deckId);
    // Sort by review date
    cards.sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate));
    return cards;
}

/**
 * Convert difficulty to quality grade (0-5 scale for SM-2)
 */
function difficultyToQuality(difficulty: Difficulty): number {
    switch (difficulty) {
        case "hard":
            return 2;
        case "good":
            return 4;
        case "easy":
            return 5;
    }
}

/**
 * Calculate next review using SM-2 algorithm
 */
export function calculateNextReview(
    card: Flashcard,
    difficulty: Difficulty
): Pick<Flashcard, "easeFactor" | "interval" | "repetitions" | "nextReviewDate"> {
    const quality = difficultyToQuality(difficulty);

    let { easeFactor, interval, repetitions } = card;

    if (quality < 3) {
        repetitions = 0;
        interval = 1;
    } else {
        easeFactor = Math.max(
            1.3,
            easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
        );

        if (repetitions === 0) {
            interval = 1;
        } else if (repetitions === 1) {
            interval = 6;
        } else {
            interval = Math.round(interval * easeFactor);
        }

        repetitions++;
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);

    return {
        easeFactor: Math.round(easeFactor * 100) / 100,
        interval,
        repetitions,
        nextReviewDate: nextDate.toISOString(),
    };
}

/**
 * Record a review - updates cache immediately, queues for background sync
 */
export function recordReview(cardId: string, difficulty: Difficulty): Flashcard | null {
    const card = getCachedFlashcard(cardId);

    if (!card) return null;

    const sm2Data = calculateNextReview(card, difficulty);

    // Update cache immediately (fast)
    updateCachedFlashcard(cardId, sm2Data);

    // Queue for background sync to Supabase
    queueFlashcardUpdate({
        id: cardId,
        ...sm2Data,
    });

    return { ...card, ...sm2Data };
}

/**
 * Update streak - updates cache, queues for sync
 */
export function updateStreak(): void {
    const progress = getCachedProgress();
    const today = new Date().toISOString().split("T")[0];
    const lastDate = progress.lastPracticeDate?.split("T")[0];

    if (lastDate === today) {
        return; // Already practiced today
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let newStreak = progress.currentStreak;
    if (lastDate === yesterdayStr) {
        newStreak += 1;
    } else {
        newStreak = 1;
    }

    const now = new Date().toISOString();
    const updatedProgress = {
        ...progress,
        currentStreak: newStreak,
        lastPracticeDate: now,
    };

    // Update cache
    setCachedProgress(updatedProgress);

    // Queue for sync
    queueProgressUpdate({
        totalCardsReviewed: updatedProgress.totalCardsReviewed,
        currentStreak: newStreak,
        lastPracticeDate: now,
    });
}

/**
 * Increment cards reviewed - updates cache, queues for sync
 */
export function incrementCardsReviewed(): void {
    const progress = getCachedProgress();
    const updatedProgress = {
        ...progress,
        totalCardsReviewed: progress.totalCardsReviewed + 1,
    };

    // Update cache
    setCachedProgress(updatedProgress);

    // Queue for sync
    queueProgressUpdate({
        totalCardsReviewed: updatedProgress.totalCardsReviewed,
        currentStreak: progress.currentStreak,
        lastPracticeDate: progress.lastPracticeDate || new Date().toISOString(),
    });
}

/**
 * Sync pending updates to Supabase (call after practice session)
 */
export async function syncPracticeUpdates(): Promise<void> {
    await syncToSupabase();
}

/**
 * Practice session type
 */
export interface PracticeSession {
    deckId: string;
    cards: Flashcard[];
    currentIndex: number;
    completed: number;
    remaining: number;
}

/**
 * Create practice session from cached data
 */
export function createPracticeSession(deckId: string): PracticeSession {
    const cards = getAllCardsForPractice(deckId);

    return {
        deckId,
        cards,
        currentIndex: 0,
        completed: 0,
        remaining: cards.length,
    };
}
