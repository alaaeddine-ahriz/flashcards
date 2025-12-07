/**
 * Sync Service
 * Handles syncing between localStorage cache and Supabase.
 * - syncFromSupabase: Pull all user data into cache on login
 * - syncToSupabase: Push pending updates to Supabase (background)
 */

import { createClient } from "@/lib/supabase";
import { Deck, Flashcard, UserProgress } from "@/types";
import {
    setCachedDecks,
    setCachedFlashcards,
    setCachedProgress,
    setCachedTags,
    setLastSyncTime,
    getPendingFlashcardUpdates,
    getPendingProgressUpdate,
    clearPendingUpdates,
    clearCache,
} from "@/lib/cache";

// Database row types
interface DeckRow {
    id: string;
    name: string;
    tags: string[];
    created_at: string;
    updated_at: string;
}

interface FlashcardRow {
    id: string;
    deck_id: string;
    front: string;
    back: string;
    ease_factor: number;
    interval: number;
    repetitions: number;
    next_review_date: string;
    created_at: string;
    updated_at: string;
}

interface ProgressRow {
    total_cards_reviewed: number;
    total_cards_mastered: number;
    current_streak: number;
    last_practice_date: string | null;
}

interface DeckTagRow {
    deck_id: string;
    tag: string;
}

interface ProfileRow {
    tags: string[] | null;
}

// Map database rows to app types
function mapDeck(row: DeckRow): Deck {
    return {
        id: row.id,
        name: row.name,
        tags: row.tags,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function mapFlashcard(row: FlashcardRow): Flashcard {
    return {
        id: row.id,
        deckId: row.deck_id,
        front: row.front,
        back: row.back,
        easeFactor: row.ease_factor,
        interval: row.interval,
        repetitions: row.repetitions,
        nextReviewDate: row.next_review_date,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function mapProgress(row: ProgressRow): UserProgress {
    return {
        totalCardsReviewed: row.total_cards_reviewed,
        totalCardsMastered: row.total_cards_mastered,
        currentStreak: row.current_streak,
        lastPracticeDate: row.last_practice_date,
    };
}

/**
 * Sync all user data from Supabase into local cache.
 * Call this on login.
 */
export async function syncFromSupabase(): Promise<boolean> {
    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        clearCache();
        return false;
    }

    try {
        // Fetch all data in parallel (including deck_tags and user profile for tags)
        const [decksResult, flashcardsResult, progressResult, deckTagsResult, profileResult] = await Promise.all([
            supabase.from("decks").select("*").eq("user_id", user.id),
            supabase.from("flashcards").select("*").eq("user_id", user.id),
            supabase.from("user_progress").select("*").eq("user_id", user.id).single(),
            supabase.from("deck_tags").select("deck_id, tag").eq("user_id", user.id),
            supabase.from("profiles").select("tags").eq("id", user.id).single(),
        ]);

        // Build deck_id -> tags[] map from deck_tags
        const deckTagsMap = new Map<string, string[]>();
        if (deckTagsResult.data) {
            for (const dt of deckTagsResult.data as DeckTagRow[]) {
                const existing = deckTagsMap.get(dt.deck_id) || [];
                existing.push(dt.tag);
                deckTagsMap.set(dt.deck_id, existing);
            }
        }

        // Cache decks with tags from deck_tags table (not legacy decks.tags)
        if (decksResult.data) {
            const decks = (decksResult.data as DeckRow[]).map((row) => ({
                ...mapDeck(row),
                tags: deckTagsMap.get(row.id) || [], // Use deck_tags, not legacy row.tags
            }));
            setCachedDecks(decks);
        }

        // Cache flashcards
        if (flashcardsResult.data) {
            const flashcards = (flashcardsResult.data as FlashcardRow[]).map(mapFlashcard);
            setCachedFlashcards(flashcards);
        }

        // Cache progress
        if (progressResult.data) {
            const progress = mapProgress(progressResult.data as ProgressRow);
            setCachedProgress(progress);
        }

        // Cache user tags from profile
        if (profileResult.data) {
            const profileData = profileResult.data as ProfileRow;
            setCachedTags(profileData.tags || []);
        }

        setLastSyncTime();
        return true;
    } catch (error) {
        console.error("Sync from Supabase failed:", error);
        return false;
    }
}

/**
 * Push pending updates to Supabase.
 * Call this after practice sessions complete.
 */
export async function syncToSupabase(): Promise<boolean> {
    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    const pendingFlashcards = getPendingFlashcardUpdates();
    const pendingProgress = getPendingProgressUpdate();

    if (pendingFlashcards.length === 0 && !pendingProgress) {
        return true; // Nothing to sync
    }

    try {
        // Batch update flashcards
        if (pendingFlashcards.length > 0) {
            const updatePromises = pendingFlashcards.map((update) =>
                supabase
                    .from("flashcards")
                    .update({
                        ease_factor: update.easeFactor,
                        interval: update.interval,
                        repetitions: update.repetitions,
                        next_review_date: update.nextReviewDate,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", update.id)
                    .eq("user_id", user.id)
            );
            await Promise.all(updatePromises);
        }

        // Update progress
        if (pendingProgress) {
            await supabase
                .from("user_progress")
                .update({
                    total_cards_reviewed: pendingProgress.totalCardsReviewed,
                    current_streak: pendingProgress.currentStreak,
                    last_practice_date: pendingProgress.lastPracticeDate,
                })
                .eq("user_id", user.id);
        }

        clearPendingUpdates();
        return true;
    } catch (error) {
        console.error("Sync to Supabase failed:", error);
        return false; // Keep pending updates for retry
    }
}

/**
 * Clear cache on logout
 */
export function clearCacheOnLogout(): void {
    clearCache();
}
