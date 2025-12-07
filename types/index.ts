// ============================================
// Core Entity Types
// ============================================

export interface Deck {
    id: string;
    name: string;
    tags: string[]; // Now computed from deck_tags join table
    createdAt: string;
    updatedAt: string;
}

export interface DeckTag {
    id: string;
    userId: string;
    deckId: string;
    tag: string;
    createdAt: string;
}

export interface UserProfile {
    id: string;
    email: string | null;
    tags: string[]; // User's available tags
    createdAt: string;
}

export interface Flashcard {
    id: string;
    deckId: string;
    front: string;
    back: string;
    // SM-2 Spaced Repetition fields
    easeFactor: number;    // Default 2.5, minimum 1.3
    interval: number;      // Days until next review
    repetitions: number;   // Times answered correctly in a row
    nextReviewDate: string; // ISO date string
    createdAt: string;
    updatedAt: string;
}

export interface UserProgress {
    totalCardsReviewed: number;
    totalCardsMastered: number; // Cards with interval >= 21 days
    currentStreak: number;      // Days in a row with practice
    lastPracticeDate: string | null;
}

// ============================================
// Computed/View Types
// ============================================

export interface DeckWithStats extends Deck {
    cardCount: number;
    mastery: number;      // Percentage 0-100
    dueCardCount: number; // Cards due for review
}

export interface DeckProgress {
    id: string;
    name: string;
    icon: string;
    progress: number;
    // Anki-style card states
    newCount: number;      // Cards never reviewed (repetitions = 0)
    learningCount: number; // Cards being learned (repetitions > 0, interval < 7)
    masteredCount: number; // Cards mastered (interval >= 7)
    totalCount: number;
}

// ============================================
// Input Types
// ============================================

export interface CreateDeckInput {
    name: string;
    tags?: string[];
}

export interface UpdateDeckInput {
    name?: string;
}

export interface CreateFlashcardInput {
    deckId: string;
    front: string;
    back: string;
}

export interface UpdateFlashcardInput {
    front?: string;
    back?: string;
}

// ============================================
// Practice Types
// ============================================

export type Difficulty = "hard" | "good" | "easy";

export interface ReviewResult {
    cardId: string;
    difficulty: Difficulty;
    reviewedAt: string;
}

// ============================================
// CSV Types
// ============================================

export interface CSVRow {
    front: string;
    back: string;
}
