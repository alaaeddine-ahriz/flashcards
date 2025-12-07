/**
 * Local Cache Service
 * Provides localStorage caching to reduce Supabase round-trips.
 * Data is synced from Supabase on login and updated in background after practice.
 */

import { Deck, Flashcard, UserProgress } from "@/types";

const CACHE_KEYS = {
    DECKS: "cache_decks",
    FLASHCARDS: "cache_flashcards",
    PROGRESS: "cache_progress",
    TAGS: "cache_tags",
    LAST_SYNC: "cache_last_sync",
    PENDING_UPDATES: "cache_pending_updates",
} as const;

// Types for pending updates
interface PendingFlashcardUpdate {
    id: string;
    easeFactor: number;
    interval: number;
    repetitions: number;
    nextReviewDate: string;
}

interface PendingProgressUpdate {
    totalCardsReviewed: number;
    currentStreak: number;
    lastPracticeDate: string;
}

interface PendingUpdates {
    flashcards: PendingFlashcardUpdate[];
    progress: PendingProgressUpdate | null;
}

// Helper to safely access localStorage
function getFromStorage<T>(key: string): T | null {
    if (typeof window === "undefined") return null;
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

function setToStorage<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error("Cache write error:", error);
    }
}

// ============================================
// Cache Read Operations (synchronous, fast)
// ============================================

export function getCachedDecks(): Deck[] {
    return getFromStorage<Deck[]>(CACHE_KEYS.DECKS) || [];
}

export function getCachedFlashcards(): Flashcard[] {
    return getFromStorage<Flashcard[]>(CACHE_KEYS.FLASHCARDS) || [];
}

export function getCachedFlashcardsForDeck(deckId: string): Flashcard[] {
    const all = getCachedFlashcards();
    return all.filter((f) => f.deckId === deckId);
}

export function getCachedFlashcard(id: string): Flashcard | null {
    const all = getCachedFlashcards();
    return all.find((f) => f.id === id) || null;
}

export function getCachedProgress(): UserProgress {
    return (
        getFromStorage<UserProgress>(CACHE_KEYS.PROGRESS) || {
            totalCardsReviewed: 0,
            totalCardsMastered: 0,
            currentStreak: 0,
            lastPracticeDate: null,
        }
    );
}

export function isCacheReady(): boolean {
    return getFromStorage<number>(CACHE_KEYS.LAST_SYNC) !== null;
}

export function getCachedTags(): string[] {
    return getFromStorage<string[]>(CACHE_KEYS.TAGS) || [];
}

// ============================================
// Cache Write Operations
// ============================================

export function setCachedDecks(decks: Deck[]): void {
    setToStorage(CACHE_KEYS.DECKS, decks);
}

export function setCachedFlashcards(flashcards: Flashcard[]): void {
    setToStorage(CACHE_KEYS.FLASHCARDS, flashcards);
}

export function setCachedProgress(progress: UserProgress): void {
    setToStorage(CACHE_KEYS.PROGRESS, progress);
}

export function setLastSyncTime(): void {
    setToStorage(CACHE_KEYS.LAST_SYNC, Date.now());
}

export function setCachedTags(tags: string[]): void {
    setToStorage(CACHE_KEYS.TAGS, tags);
}

export function addCachedTag(tag: string): void {
    const tags = getCachedTags();
    if (!tags.includes(tag)) {
        tags.push(tag);
        tags.sort();
        setCachedTags(tags);
    }
}

export function updateDeckTags(deckId: string, tags: string[]): void {
    const decks = getCachedDecks();
    const index = decks.findIndex((d) => d.id === deckId);
    if (index !== -1) {
        decks[index] = { ...decks[index], tags };
        setCachedDecks(decks);
    }
}

export function addCachedDeck(deck: Deck): void {
    const decks = getCachedDecks();
    decks.push(deck);
    setCachedDecks(decks);
}

export function updateCachedDeck(id: string, updates: Partial<Deck>): void {
    const decks = getCachedDecks();
    const index = decks.findIndex((d) => d.id === id);
    if (index !== -1) {
        decks[index] = { ...decks[index], ...updates };
        setCachedDecks(decks);
    }
}

export function deleteCachedDeck(id: string): void {
    const decks = getCachedDecks().filter((d) => d.id !== id);
    const flashcards = getCachedFlashcards().filter((f) => f.deckId !== id);
    setCachedDecks(decks);
    setCachedFlashcards(flashcards);
}

export function addCachedFlashcards(newCards: Flashcard[]): void {
    const flashcards = getCachedFlashcards();
    flashcards.push(...newCards);
    setCachedFlashcards(flashcards);
}

export function updateCachedFlashcard(id: string, updates: Partial<Flashcard>): void {
    const flashcards = getCachedFlashcards();
    const index = flashcards.findIndex((f) => f.id === id);
    if (index !== -1) {
        flashcards[index] = { ...flashcards[index], ...updates };
        setCachedFlashcards(flashcards);
    }
}

export function deleteCachedFlashcard(id: string): void {
    const flashcards = getCachedFlashcards().filter((f) => f.id !== id);
    setCachedFlashcards(flashcards);
}

// ============================================
// Pending Updates (for background sync)
// ============================================

function getPendingUpdates(): PendingUpdates {
    return (
        getFromStorage<PendingUpdates>(CACHE_KEYS.PENDING_UPDATES) || {
            flashcards: [],
            progress: null,
        }
    );
}

function setPendingUpdates(updates: PendingUpdates): void {
    setToStorage(CACHE_KEYS.PENDING_UPDATES, updates);
}

export function queueFlashcardUpdate(update: PendingFlashcardUpdate): void {
    const pending = getPendingUpdates();
    // Replace existing update for same card or add new
    const index = pending.flashcards.findIndex((f) => f.id === update.id);
    if (index !== -1) {
        pending.flashcards[index] = update;
    } else {
        pending.flashcards.push(update);
    }
    setPendingUpdates(pending);
}

export function queueProgressUpdate(update: PendingProgressUpdate): void {
    const pending = getPendingUpdates();
    pending.progress = update;
    setPendingUpdates(pending);
}

export function getPendingFlashcardUpdates(): PendingFlashcardUpdate[] {
    return getPendingUpdates().flashcards;
}

export function getPendingProgressUpdate(): PendingProgressUpdate | null {
    return getPendingUpdates().progress;
}

export function clearPendingUpdates(): void {
    setPendingUpdates({ flashcards: [], progress: null });
}

// ============================================
// Full Cache Clear
// ============================================

export function clearCache(): void {
    if (typeof window === "undefined") return;
    Object.values(CACHE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
    });
}
