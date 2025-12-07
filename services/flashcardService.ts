import { storage, STORAGE_KEYS } from "@/lib/storage";
import {
    Flashcard,
    CreateFlashcardInput,
    UpdateFlashcardInput,
    CSVRow,
} from "@/types";

/**
 * Generate a unique ID
 */
function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create default SM-2 values for a new card
 */
function getDefaultSM2Values(): Pick<
    Flashcard,
    "easeFactor" | "interval" | "repetitions" | "nextReviewDate"
> {
    return {
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReviewDate: new Date().toISOString(), // Due immediately
    };
}

/**
 * Get all flashcards
 */
export function getAllFlashcards(): Flashcard[] {
    return storage.get<Flashcard[]>(STORAGE_KEYS.FLASHCARDS) || [];
}

/**
 * Get flashcards for a specific deck
 */
export function getFlashcards(deckId: string): Flashcard[] {
    const all = getAllFlashcards();
    return all.filter((c) => c.deckId === deckId);
}

/**
 * Get a single flashcard by ID
 */
export function getFlashcard(id: string): Flashcard | null {
    const all = getAllFlashcards();
    return all.find((c) => c.id === id) || null;
}

/**
 * Create a new flashcard
 */
export function createFlashcard(input: CreateFlashcardInput): Flashcard {
    const all = getAllFlashcards();
    const now = new Date().toISOString();

    const newCard: Flashcard = {
        id: generateId(),
        deckId: input.deckId,
        front: input.front,
        back: input.back,
        ...getDefaultSM2Values(),
        createdAt: now,
        updatedAt: now,
    };

    all.push(newCard);
    storage.set(STORAGE_KEYS.FLASHCARDS, all);

    return newCard;
}

/**
 * Create multiple flashcards from CSV data
 */
export function createFlashcardsFromCSV(
    deckId: string,
    rows: CSVRow[]
): Flashcard[] {
    const all = getAllFlashcards();
    const now = new Date().toISOString();

    const newCards: Flashcard[] = rows.map((row) => ({
        id: generateId(),
        deckId,
        front: row.front,
        back: row.back,
        ...getDefaultSM2Values(),
        createdAt: now,
        updatedAt: now,
    }));

    all.push(...newCards);
    storage.set(STORAGE_KEYS.FLASHCARDS, all);

    return newCards;
}

/**
 * Update a flashcard
 */
export function updateFlashcard(
    id: string,
    input: UpdateFlashcardInput
): Flashcard | null {
    const all = getAllFlashcards();
    const index = all.findIndex((c) => c.id === id);

    if (index === -1) return null;

    const updated: Flashcard = {
        ...all[index],
        ...input,
        updatedAt: new Date().toISOString(),
    };

    all[index] = updated;
    storage.set(STORAGE_KEYS.FLASHCARDS, all);

    return updated;
}

/**
 * Update flashcard with SM-2 data (internal use by practiceService)
 */
export function updateFlashcardSM2(
    id: string,
    sm2Data: Pick<Flashcard, "easeFactor" | "interval" | "repetitions" | "nextReviewDate">
): Flashcard | null {
    const all = getAllFlashcards();
    const index = all.findIndex((c) => c.id === id);

    if (index === -1) return null;

    const updated: Flashcard = {
        ...all[index],
        ...sm2Data,
        updatedAt: new Date().toISOString(),
    };

    all[index] = updated;
    storage.set(STORAGE_KEYS.FLASHCARDS, all);

    return updated;
}

/**
 * Delete a flashcard
 */
export function deleteFlashcard(id: string): boolean {
    const all = getAllFlashcards();
    const filtered = all.filter((c) => c.id !== id);

    if (filtered.length === all.length) return false;

    storage.set(STORAGE_KEYS.FLASHCARDS, filtered);
    return true;
}
