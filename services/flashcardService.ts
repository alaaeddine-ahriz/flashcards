import { createClient } from "@/lib/supabase";
import {
    Flashcard,
    CreateFlashcardInput,
    UpdateFlashcardInput,
    CSVRow,
} from "@/types";

/**
 * Get all flashcards for the current user
 */
export async function getAllFlashcards(): Promise<Flashcard[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from("flashcards")
        .select("*")
        .eq("user_id", user.id);

    if (error) {
        console.error("Error fetching flashcards:", error);
        return [];
    }

    return (data ?? []).map(mapFlashcardFromDb);
}

/**
 * Get flashcards for a specific deck
 */
export async function getFlashcards(deckId: string, userId?: string): Promise<Flashcard[]> {
    const supabase = createClient();

    let currentUserId = userId;
    if (!currentUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];
        currentUserId = user.id;
    }

    const { data, error } = await supabase
        .from("flashcards")
        .select("*")
        .eq("deck_id", deckId)
        .eq("user_id", currentUserId);

    if (error) {
        console.error("Error fetching flashcards:", error);
        return [];
    }

    return (data ?? []).map(mapFlashcardFromDb);
}

/**
 * Get a single flashcard by ID
 */
export async function getFlashcard(id: string): Promise<Flashcard | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
        .from("flashcards")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (error || !data) return null;

    return mapFlashcardFromDb(data);
}

/**
 * Create a new flashcard
 */
export async function createFlashcard(input: CreateFlashcardInput): Promise<Flashcard | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
        .from("flashcards")
        .insert({
            user_id: user.id,
            deck_id: input.deckId,
            front: input.front,
            back: input.back,
            ease_factor: 2.5,
            interval: 0,
            repetitions: 0,
            next_review_date: new Date().toISOString(),
        })
        .select()
        .single();

    if (error || !data) {
        console.error("Error creating flashcard:", error);
        return null;
    }

    return mapFlashcardFromDb(data);
}

/**
 * Create multiple flashcards from CSV data
 */
export async function createFlashcardsFromCSV(
    deckId: string,
    rows: CSVRow[]
): Promise<Flashcard[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const now = new Date().toISOString();

    const cardsToInsert = rows.map((row) => ({
        user_id: user.id,
        deck_id: deckId,
        front: row.front,
        back: row.back,
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        next_review_date: now,
    }));

    const { data, error } = await supabase
        .from("flashcards")
        .insert(cardsToInsert)
        .select();

    if (error || !data) {
        console.error("Error creating flashcards from CSV:", error);
        return [];
    }

    return data.map(mapFlashcardFromDb);
}

/**
 * Update a flashcard
 */
export async function updateFlashcard(
    id: string,
    input: UpdateFlashcardInput
): Promise<Flashcard | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
        .from("flashcards")
        .update({
            ...input,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

    if (error || !data) {
        console.error("Error updating flashcard:", error);
        return null;
    }

    return mapFlashcardFromDb(data);
}

/**
 * Update flashcard with SM-2 data (internal use by practiceService)
 */
export async function updateFlashcardSM2(
    id: string,
    sm2Data: Pick<Flashcard, "easeFactor" | "interval" | "repetitions" | "nextReviewDate">
): Promise<Flashcard | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
        .from("flashcards")
        .update({
            ease_factor: sm2Data.easeFactor,
            interval: sm2Data.interval,
            repetitions: sm2Data.repetitions,
            next_review_date: sm2Data.nextReviewDate,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

    if (error || !data) {
        console.error("Error updating flashcard SM2:", error);
        return null;
    }

    return mapFlashcardFromDb(data);
}

/**
 * Delete a flashcard
 */
export async function deleteFlashcard(id: string): Promise<boolean> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { error } = await supabase
        .from("flashcards")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) {
        console.error("Error deleting flashcard:", error);
        return false;
    }

    return true;
}

// Helper to map database row to Flashcard type
function mapFlashcardFromDb(row: {
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
}): Flashcard {
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
