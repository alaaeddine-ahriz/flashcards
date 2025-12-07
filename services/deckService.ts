import { storage, STORAGE_KEYS } from "@/lib/storage";
import {
    Deck,
    DeckWithStats,
    CreateDeckInput,
    UpdateDeckInput,
    Flashcard,
} from "@/types";

/**
 * Generate a unique ID
 */
function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get all decks
 */
export function getDecks(): Deck[] {
    return storage.get<Deck[]>(STORAGE_KEYS.DECKS) || [];
}

/**
 * Get all decks with computed stats
 */
export function getDecksWithStats(): DeckWithStats[] {
    const decks = getDecks();
    const flashcards = storage.get<Flashcard[]>(STORAGE_KEYS.FLASHCARDS) || [];
    const now = new Date().toISOString();

    return decks.map((deck) => {
        const deckCards = flashcards.filter((c) => c.deckId === deck.id);
        const cardCount = deckCards.length;

        // Calculate mastery: percentage of cards with interval >= 7 days
        const masteredCards = deckCards.filter((c) => c.interval >= 7).length;
        const mastery = cardCount > 0 ? Math.round((masteredCards / cardCount) * 100) : 0;

        // Count cards due for review
        const dueCardCount = deckCards.filter((c) => c.nextReviewDate <= now).length;

        return {
            ...deck,
            cardCount,
            mastery,
            dueCardCount,
        };
    });
}

/**
 * Get a single deck by ID
 */
export function getDeck(id: string): Deck | null {
    const decks = getDecks();
    return decks.find((d) => d.id === id) || null;
}

/**
 * Get deck with stats
 */
export function getDeckWithStats(id: string): DeckWithStats | null {
    const all = getDecksWithStats();
    return all.find((d) => d.id === id) || null;
}

/**
 * Create a new deck
 */
export function createDeck(input: CreateDeckInput): Deck {
    const decks = getDecks();
    const now = new Date().toISOString();

    const newDeck: Deck = {
        id: generateId(),
        name: input.name,
        tags: input.tags || [],
        createdAt: now,
        updatedAt: now,
    };

    decks.push(newDeck);
    storage.set(STORAGE_KEYS.DECKS, decks);

    return newDeck;
}

/**
 * Update a deck
 */
export function updateDeck(id: string, input: UpdateDeckInput): Deck | null {
    const decks = getDecks();
    const index = decks.findIndex((d) => d.id === id);

    if (index === -1) return null;

    const updated: Deck = {
        ...decks[index],
        ...input,
        updatedAt: new Date().toISOString(),
    };

    decks[index] = updated;
    storage.set(STORAGE_KEYS.DECKS, decks);

    return updated;
}

/**
 * Delete a deck and all its flashcards
 */
export function deleteDeck(id: string): boolean {
    const decks = getDecks();
    const filtered = decks.filter((d) => d.id !== id);

    if (filtered.length === decks.length) return false;

    // Also delete all flashcards in this deck
    const flashcards = storage.get<Flashcard[]>(STORAGE_KEYS.FLASHCARDS) || [];
    const filteredCards = flashcards.filter((c) => c.deckId !== id);

    storage.set(STORAGE_KEYS.DECKS, filtered);
    storage.set(STORAGE_KEYS.FLASHCARDS, filteredCards);

    return true;
}

/**
 * Get all unique tags across decks
 */
export function getAllTags(): string[] {
    const decks = getDecks();
    const tagsSet = new Set<string>();

    for (const deck of decks) {
        for (const tag of deck.tags) {
            tagsSet.add(tag);
        }
    }

    return Array.from(tagsSet).sort();
}

/**
 * Create a new tag (by adding it to a temporary list)
 * Tags are stored on decks, but we keep a registry for the UI
 */
const TAG_REGISTRY_KEY = "flashcards_tags";

export function createTag(name: string): void {
    const existingTags = storage.get<string[]>(TAG_REGISTRY_KEY) || [];
    if (!existingTags.includes(name)) {
        existingTags.push(name);
        storage.set(TAG_REGISTRY_KEY, existingTags);
    }
}

/**
 * Get all registered tags (combines deck tags + registry)
 */
export function getAllRegisteredTags(): string[] {
    const deckTags = getAllTags();
    const registeredTags = storage.get<string[]>(TAG_REGISTRY_KEY) || [];

    const allTags = new Set([...deckTags, ...registeredTags]);
    return Array.from(allTags).sort();
}
