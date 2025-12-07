import { createClient } from "@/lib/supabase";
import {
    Deck,
    DeckWithStats,
    CreateDeckInput,
    UpdateDeckInput,
} from "@/types";

// Database row types for explicit typing
interface DeckRow {
    id: string;
    user_id: string;
    name: string;
    tags: string[];
    created_at: string;
    updated_at: string;
}

interface FlashcardStatsRow {
    id: string;
    deck_id: string;
    interval: number;
    next_review_date: string;
}

/**
 * Get all decks for the current user
 */
export async function getDecks(): Promise<Deck[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from("decks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching decks:", error);
        return [];
    }

    return (data ?? []).map(mapDeckFromDb);
}

/**
 * Get all decks with computed stats
 */
export async function getDecksWithStats(): Promise<DeckWithStats[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const [decksResult, flashcardsResult] = await Promise.all([
        supabase
            .from("decks")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
        supabase
            .from("flashcards")
            .select("id, deck_id, interval, next_review_date")
            .eq("user_id", user.id),
    ]);

    if (decksResult.error || flashcardsResult.error) {
        console.error("Error fetching decks with stats");
        return [];
    }

    const decks = (decksResult.data ?? []) as DeckRow[];
    const flashcards = (flashcardsResult.data ?? []) as FlashcardStatsRow[];
    const now = new Date().toISOString();

    return decks.map((deck) => {
        const deckCards = flashcards.filter((c) => c.deck_id === deck.id);
        const cardCount = deckCards.length;

        // Calculate mastery: percentage of cards with interval >= 7 days
        const masteredCards = deckCards.filter((c) => c.interval >= 7).length;
        const mastery = cardCount > 0 ? Math.round((masteredCards / cardCount) * 100) : 0;

        // Count cards due for review
        const dueCardCount = deckCards.filter((c) => c.next_review_date <= now).length;

        return {
            ...mapDeckFromDb(deck),
            cardCount,
            mastery,
            dueCardCount,
        };
    });
}

/**
 * Get a single deck by ID
 */
export async function getDeck(id: string): Promise<Deck | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
        .from("decks")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (error || !data) return null;

    return mapDeckFromDb(data);
}

/**
 * Get deck with stats
 */
export async function getDeckWithStats(id: string): Promise<DeckWithStats | null> {
    const all = await getDecksWithStats();
    return all.find((d) => d.id === id) || null;
}

/**
 * Create a new deck
 */
export async function createDeck(input: CreateDeckInput): Promise<Deck | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
        .from("decks")
        .insert({
            user_id: user.id,
            name: input.name,
            tags: input.tags || [],
        })
        .select()
        .single();

    if (error || !data) {
        console.error("Error creating deck:", error);
        return null;
    }

    return mapDeckFromDb(data);
}

/**
 * Update a deck
 */
export async function updateDeck(id: string, input: UpdateDeckInput): Promise<Deck | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
        .from("decks")
        .update({
            ...input,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

    if (error || !data) {
        console.error("Error updating deck:", error);
        return null;
    }

    return mapDeckFromDb(data);
}

/**
 * Delete a deck and all its flashcards (cascade handled by DB)
 */
export async function deleteDeck(id: string): Promise<boolean> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { error } = await supabase
        .from("decks")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) {
        console.error("Error deleting deck:", error);
        return false;
    }

    return true;
}

/**
 * Get all unique tags across decks
 */
export async function getAllTags(): Promise<string[]> {
    const decks = await getDecks();
    const tagsSet = new Set<string>();

    for (const deck of decks) {
        for (const tag of deck.tags) {
            tagsSet.add(tag);
        }
    }

    return Array.from(tagsSet).sort();
}

/**
 * Get all registered tags (same as getAllTags for Supabase version)
 */
export async function getAllRegisteredTags(): Promise<string[]> {
    return getAllTags();
}

/**
 * Create a new tag (tags are stored on decks, this is a no-op for Supabase)
 */
export function createTag(_name: string): void {
    // Tags are stored on decks directly, no separate registry needed
}

// Helper to map database row to Deck type
function mapDeckFromDb(row: {
    id: string;
    name: string;
    tags: string[];
    created_at: string;
    updated_at: string;
}): Deck {
    return {
        id: row.id,
        name: row.name,
        tags: row.tags,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
