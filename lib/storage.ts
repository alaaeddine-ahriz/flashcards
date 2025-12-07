/**
 * Local Storage wrapper for persistence
 * This will be replaced with Supabase later
 */

const STORAGE_KEYS = {
    DECKS: "flashcards_decks",
    FLASHCARDS: "flashcards_cards",
    PROGRESS: "flashcards_progress",
} as const;

export const storage = {
    get<T>(key: string): T | null {
        if (typeof window === "undefined") return null;

        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    },

    set<T>(key: string, value: T): void {
        if (typeof window === "undefined") return;

        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error("Failed to save to localStorage:", error);
        }
    },

    remove(key: string): void {
        if (typeof window === "undefined") return;
        localStorage.removeItem(key);
    },
};

export { STORAGE_KEYS };
