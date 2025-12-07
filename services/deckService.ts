import { createClient } from "@/lib/supabase";
import {
    addCachedTag,
    updateCachedDeck,
    updateDeckTags,
    getCachedTags,
    setCachedTags,
    getCachedDecks,
    setCachedDecks,
} from "@/lib/cache";
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
    tags: string[]; // Legacy field, may be empty
    created_at: string;
    updated_at: string;
}

interface DeckTagRow {
    deck_id: string;
    tag: string;
}

interface FlashcardStatsRow {
    id: string;
    deck_id: string;
    interval: number;
    next_review_date: string;
}

/**
 * Get all decks for the current user with tags from deck_tags table
 */
export async function getDecks(): Promise<Deck[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    // Fetch decks and deck_tags in parallel
    const [decksResult, tagsResult] = await Promise.all([
        supabase
            .from("decks")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
        supabase
            .from("deck_tags")
            .select("deck_id, tag")
            .eq("user_id", user.id),
    ]);

    if (decksResult.error) {
        console.error("Error fetching decks:", decksResult.error);
        return [];
    }

    const decks = (decksResult.data ?? []) as DeckRow[];
    const deckTags = (tagsResult.data ?? []) as DeckTagRow[];

    // Build a map of deck_id -> tags[]
    const deckTagsMap = new Map<string, string[]>();
    for (const dt of deckTags) {
        const existing = deckTagsMap.get(dt.deck_id) || [];
        existing.push(dt.tag);
        deckTagsMap.set(dt.deck_id, existing);
    }

    return decks.map((deck) => ({
        id: deck.id,
        name: deck.name,
        tags: deckTagsMap.get(deck.id) || [],
        createdAt: deck.created_at,
        updatedAt: deck.updated_at,
    }));
}

/**
 * Get all decks with computed stats
 */
export async function getDecksWithStats(): Promise<DeckWithStats[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const [decksResult, flashcardsResult, tagsResult] = await Promise.all([
        supabase
            .from("decks")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
        supabase
            .from("flashcards")
            .select("id, deck_id, interval, next_review_date")
            .eq("user_id", user.id),
        supabase
            .from("deck_tags")
            .select("deck_id, tag")
            .eq("user_id", user.id),
    ]);

    if (decksResult.error || flashcardsResult.error) {
        console.error("Error fetching decks with stats");
        return [];
    }

    const decks = (decksResult.data ?? []) as DeckRow[];
    const flashcards = (flashcardsResult.data ?? []) as FlashcardStatsRow[];
    const deckTags = (tagsResult.data ?? []) as DeckTagRow[];
    const now = new Date().toISOString();

    // Build a map of deck_id -> tags[]
    const deckTagsMap = new Map<string, string[]>();
    for (const dt of deckTags) {
        const existing = deckTagsMap.get(dt.deck_id) || [];
        existing.push(dt.tag);
        deckTagsMap.set(dt.deck_id, existing);
    }

    return decks.map((deck) => {
        const deckCards = flashcards.filter((c) => c.deck_id === deck.id);
        const cardCount = deckCards.length;

        // Calculate mastery: percentage of cards with interval >= 7 days
        const masteredCards = deckCards.filter((c) => c.interval >= 7).length;
        const mastery = cardCount > 0 ? Math.round((masteredCards / cardCount) * 100) : 0;

        // Count cards due for review
        const dueCardCount = deckCards.filter((c) => c.next_review_date <= now).length;

        return {
            id: deck.id,
            name: deck.name,
            tags: deckTagsMap.get(deck.id) || [],
            createdAt: deck.created_at,
            updatedAt: deck.updated_at,
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

    const [deckResult, tagsResult] = await Promise.all([
        supabase
            .from("decks")
            .select("*")
            .eq("id", id)
            .eq("user_id", user.id)
            .single(),
        supabase
            .from("deck_tags")
            .select("tag")
            .eq("deck_id", id)
            .eq("user_id", user.id),
    ]);

    if (deckResult.error || !deckResult.data) return null;

    const deck = deckResult.data as DeckRow;
    const tags = (tagsResult.data ?? []).map((t: { tag: string }) => t.tag);

    return {
        id: deck.id,
        name: deck.name,
        tags,
        createdAt: deck.created_at,
        updatedAt: deck.updated_at,
    };
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
            tags: [], // Legacy field, keep empty
        })
        .select()
        .single();

    if (error || !data) {
        console.error("Error creating deck:", error);
        return null;
    }

    const deck = data as DeckRow;

    // If tags provided, create deck_tags entries
    if (input.tags && input.tags.length > 0) {
        const tagInserts = input.tags.map((tag) => ({
            user_id: user.id,
            deck_id: deck.id,
            tag,
        }));
        await supabase.from("deck_tags").insert(tagInserts);
    }

    return {
        id: deck.id,
        name: deck.name,
        tags: input.tags || [],
        createdAt: deck.created_at,
        updatedAt: deck.updated_at,
    };
}

/**
 * Update a deck (name only, tags managed separately)
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

    // Fetch current tags for this deck
    const { data: tagsData } = await supabase
        .from("deck_tags")
        .select("tag")
        .eq("deck_id", id)
        .eq("user_id", user.id);

    const tags = (tagsData ?? []).map((t: { tag: string }) => t.tag);
    const deck = data as DeckRow;

    const updatedDeck = {
        id: deck.id,
        name: deck.name,
        tags,
        createdAt: deck.created_at,
        updatedAt: deck.updated_at,
    };

    // Update local cache
    updateCachedDeck(id, updatedDeck);

    return updatedDeck;
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

// ============================================
// Tag Management (User-owned tags)
// ============================================

/**
 * Get all tags for the current user from their profile
 */
export async function getUserTags(): Promise<string[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return getCachedTags();

    const { data, error } = await supabase
        .from("profiles")
        .select("tags")
        .eq("id", user.id)
        .single();

    if (error || !data) {
        return getCachedTags();
    }

    const tags = (data.tags || []) as string[];
    setCachedTags(tags);
    return tags;
}

/**
 * Create a new tag and save to user's profile
 * Uses optimistic update: cache is updated immediately for instant UI
 */
export async function createTag(name: string): Promise<boolean> {
    // Optimistic update: add to cache immediately for instant UI
    const currentCachedTags = getCachedTags();
    if (!currentCachedTags.includes(name)) {
        const newCachedTags = [...currentCachedTags, name].sort();
        setCachedTags(newCachedTags);
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        // Already added to cache above
        return true;
    }

    // Fetch current tags from Supabase and merge
    const { data: profileData } = await supabase
        .from("profiles")
        .select("tags")
        .eq("id", user.id)
        .single();

    const supabaseTags = (profileData?.tags || []) as string[];
    if (supabaseTags.includes(name)) {
        return true; // Already exists in Supabase
    }

    const newTags = [...supabaseTags, name].sort();

    const { error } = await supabase
        .from("profiles")
        .update({ tags: newTags })
        .eq("id", user.id);

    if (error) {
        console.error("Error creating tag:", error);
        // Cache already has the tag, so UI stays consistent
        return false;
    }

    // Sync cache with Supabase state
    setCachedTags(newTags);
    return true;
}

/**
 * Assign a tag to a deck for the current user
 * Returns the updated tags array for optimistic updates
 */
export async function assignTagToDeck(deckId: string, tag: string): Promise<string[] | null> {
    // Optimistic update: update cache first for instant UI
    const cachedDecks = getCachedDecks();
    const deck = cachedDecks.find((d) => d.id === deckId);
    const currentTags = deck?.tags || [];
    const newTags = currentTags.includes(tag) ? currentTags : [...currentTags, tag];
    updateDeckTags(deckId, newTags);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return newTags; // Return optimistic result

    const { error } = await supabase
        .from("deck_tags")
        .insert({
            user_id: user.id,
            deck_id: deckId,
            tag,
        });

    if (error) {
        // Might be a unique constraint violation (already exists)
        if (error.code === "23505") {
            return newTags; // Already assigned, that's fine
        }
        console.error("Error assigning tag to deck:", error);
        // Revert optimistic update on error
        updateDeckTags(deckId, currentTags);
        return null;
    }

    return newTags;
}

/**
 * Remove a tag from a deck for the current user
 * Returns the updated tags array for optimistic updates
 */
export async function removeTagFromDeck(deckId: string, tag: string): Promise<string[] | null> {
    // Optimistic update: update cache first for instant UI
    const cachedDecks = getCachedDecks();
    const deck = cachedDecks.find((d) => d.id === deckId);
    const currentTags = deck?.tags || [];
    const newTags = currentTags.filter((t) => t !== tag);
    updateDeckTags(deckId, newTags);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return newTags; // Return optimistic result

    const { error } = await supabase
        .from("deck_tags")
        .delete()
        .eq("user_id", user.id)
        .eq("deck_id", deckId)
        .eq("tag", tag);

    if (error) {
        console.error("Error removing tag from deck:", error);
        // Revert optimistic update on error
        updateDeckTags(deckId, currentTags);
        return null;
    }

    return newTags;
}

/**
 * Get tags assigned to a specific deck by the current user
 */
export async function getDeckTags(deckId: string): Promise<string[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from("deck_tags")
        .select("tag")
        .eq("user_id", user.id)
        .eq("deck_id", deckId);

    if (error) {
        console.error("Error fetching deck tags:", error);
        return [];
    }

    return (data ?? []).map((t: { tag: string }) => t.tag);
}
