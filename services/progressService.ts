import { storage, STORAGE_KEYS } from "@/lib/storage";
import { UserProgress, DeckProgress, Flashcard, Deck } from "@/types";

const MASTERY_THRESHOLD_DAYS = 7; // Cards with interval >= 7 days are "mastered"

/**
 * Get or create user progress
 */
export function getProgress(): UserProgress {
    const progress = storage.get<UserProgress>(STORAGE_KEYS.PROGRESS);

    if (!progress) {
        const initial: UserProgress = {
            totalCardsReviewed: 0,
            totalCardsMastered: 0,
            currentStreak: 0,
            lastPracticeDate: null,
        };
        storage.set(STORAGE_KEYS.PROGRESS, initial);
        return initial;
    }

    return progress;
}

/**
 * Update streak after practice
 */
export function updateStreak(): void {
    const progress = getProgress();
    const today = new Date().toISOString().split("T")[0];
    const lastDate = progress.lastPracticeDate?.split("T")[0];

    if (lastDate === today) {
        // Already practiced today, no change
        return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (lastDate === yesterdayStr) {
        // Practiced yesterday, increment streak
        progress.currentStreak += 1;
    } else {
        // Streak broken, reset to 1
        progress.currentStreak = 1;
    }

    progress.lastPracticeDate = new Date().toISOString();
    storage.set(STORAGE_KEYS.PROGRESS, progress);
}

/**
 * Increment total cards reviewed
 */
export function incrementCardsReviewed(): void {
    const progress = getProgress();
    progress.totalCardsReviewed += 1;
    storage.set(STORAGE_KEYS.PROGRESS, progress);
}

/**
 * Calculate overall mastery percentage
 */
export function getOverallMastery(): number {
    const flashcards = storage.get<Flashcard[]>(STORAGE_KEYS.FLASHCARDS) || [];

    if (flashcards.length === 0) return 0;

    const mastered = flashcards.filter((c) => c.interval >= MASTERY_THRESHOLD_DAYS).length;
    return Math.round((mastered / flashcards.length) * 100);
}

/**
 * Get total cards mastered count
 */
export function getTotalCardsMastered(): number {
    const flashcards = storage.get<Flashcard[]>(STORAGE_KEYS.FLASHCARDS) || [];
    return flashcards.filter((c) => c.interval >= MASTERY_THRESHOLD_DAYS).length;
}

/**
 * Get deck progress for all decks
 */
export function getDeckProgress(): DeckProgress[] {
    const decks = storage.get<Deck[]>(STORAGE_KEYS.DECKS) || [];
    const flashcards = storage.get<Flashcard[]>(STORAGE_KEYS.FLASHCARDS) || [];

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
    const decks = storage.get<Deck[]>(STORAGE_KEYS.DECKS) || [];
    const flashcards = storage.get<Flashcard[]>(STORAGE_KEYS.FLASHCARDS) || [];

    if (decks.length === 0) return null;

    let weakest: { name: string; mastery: number } | null = null;

    for (const deck of decks) {
        const deckCards = flashcards.filter((c) => c.deckId === deck.id);
        if (deckCards.length === 0) continue;

        const mastered = deckCards.filter((c) => c.interval >= MASTERY_THRESHOLD_DAYS).length;
        const mastery = Math.round((mastered / deckCards.length) * 100);

        if (!weakest || mastery < weakest.mastery) {
            weakest = { name: deck.name, mastery };
        }
    }

    return weakest;
}

/**
 * Get current streak
 */
export function getCurrentStreak(): number {
    const progress = getProgress();

    // Check if streak is still valid (last practice was today or yesterday)
    const lastDate = progress.lastPracticeDate?.split("T")[0];
    if (!lastDate) return 0;

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (lastDate === today || lastDate === yesterdayStr) {
        return progress.currentStreak;
    }

    // Streak is broken
    return 0;
}
