import { Flashcard, Difficulty } from "@/types";
import { getFlashcards, updateFlashcardSM2 } from "./flashcardService";

/**
 * SM-2 Algorithm Implementation
 * https://en.wikipedia.org/wiki/SuperMemo#Description_of_SM-2_algorithm
 */

/**
 * Get cards due for review in a deck
 */
export function getCardsForReview(deckId: string): Flashcard[] {
    const cards = getFlashcards(deckId);
    const now = new Date().toISOString();

    // Cards due for review (nextReviewDate <= now)
    const dueCards = cards.filter((c) => c.nextReviewDate <= now);

    // Sort by review date (oldest first)
    dueCards.sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate));

    return dueCards;
}

/**
 * Get all cards in a deck for initial learning
 */
export function getAllCardsForPractice(deckId: string): Flashcard[] {
    const cards = getFlashcards(deckId);
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
            return 2; // Incorrect response where correct was remembered
        case "good":
            return 4; // Correct response with some hesitation
        case "easy":
            return 5; // Perfect response
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

    // If quality < 3, restart repetitions
    if (quality < 3) {
        repetitions = 0;
        interval = 1;
    } else {
        // Calculate new ease factor
        easeFactor = Math.max(
            1.3,
            easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
        );

        // Calculate new interval
        if (repetitions === 0) {
            interval = 1;
        } else if (repetitions === 1) {
            interval = 6;
        } else {
            interval = Math.round(interval * easeFactor);
        }

        repetitions++;
    }

    // Calculate next review date
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);

    return {
        easeFactor: Math.round(easeFactor * 100) / 100, // Round to 2 decimals
        interval,
        repetitions,
        nextReviewDate: nextDate.toISOString(),
    };
}

/**
 * Record a review and update the card
 */
export function recordReview(
    cardId: string,
    difficulty: Difficulty
): Flashcard | null {
    const cards = getFlashcards("");
    const card = cards.find((c) => c.id === cardId);

    if (!card) return null;

    const sm2Data = calculateNextReview(card, difficulty);
    return updateFlashcardSM2(cardId, sm2Data);
}

/**
 * Get practice session summary
 */
export interface PracticeSession {
    deckId: string;
    cards: Flashcard[];
    currentIndex: number;
    completed: number;
    remaining: number;
}

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
