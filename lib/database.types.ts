export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    email: string | null;
                    created_at: string;
                };
                Insert: {
                    id: string;
                    email?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string | null;
                    created_at?: string;
                };
            };
            decks: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    tags: string[];
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    name: string;
                    tags?: string[];
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    name?: string;
                    tags?: string[];
                    created_at?: string;
                    updated_at?: string;
                };
            };
            flashcards: {
                Row: {
                    id: string;
                    deck_id: string;
                    user_id: string;
                    front: string;
                    back: string;
                    ease_factor: number;
                    interval: number;
                    repetitions: number;
                    next_review_date: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    deck_id: string;
                    user_id: string;
                    front: string;
                    back: string;
                    ease_factor?: number;
                    interval?: number;
                    repetitions?: number;
                    next_review_date?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    deck_id?: string;
                    user_id?: string;
                    front?: string;
                    back?: string;
                    ease_factor?: number;
                    interval?: number;
                    repetitions?: number;
                    next_review_date?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            user_progress: {
                Row: {
                    id: string;
                    user_id: string;
                    total_cards_reviewed: number;
                    total_cards_mastered: number;
                    current_streak: number;
                    last_practice_date: string | null;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    total_cards_reviewed?: number;
                    total_cards_mastered?: number;
                    current_streak?: number;
                    last_practice_date?: string | null;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    total_cards_reviewed?: number;
                    total_cards_mastered?: number;
                    current_streak?: number;
                    last_practice_date?: string | null;
                };
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
    };
}
