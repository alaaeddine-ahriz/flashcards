"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { FloatingActionButton } from "@/components/layout/FloatingActionButton";
import {
    TextInput,
    Button,
    BottomSheet,
    BottomSheetOption,
} from "@/components/ui";
import { FlashcardListItem } from "@/components/deck";
import { getDeck, updateDeck, deleteDeck } from "@/services/deckService";
import {
    getFlashcards,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
} from "@/services/flashcardService";
import { Deck, Flashcard } from "@/types";

import { useAuth } from "@/contexts/AuthContext";

export default function EditDeckPage() {
    const router = useRouter();
    const params = useParams();
    const deckId = params.id as string;
    const { user, loading: authLoading } = useAuth();

    const [deck, setDeck] = useState<Deck | null>(null);
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [deckName, setDeckName] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // Add card bottom sheet
    const [showAddCard, setShowAddCard] = useState(false);
    const [newCardFront, setNewCardFront] = useState("");
    const [newCardBack, setNewCardBack] = useState("");

    // Edit card bottom sheet
    const [selectedCard, setSelectedCard] = useState<Flashcard | null>(null);
    const [showCardActions, setShowCardActions] = useState(false);
    const [showEditCard, setShowEditCard] = useState(false);
    const [editCardFront, setEditCardFront] = useState("");
    const [editCardBack, setEditCardBack] = useState("");

    // Delete confirmation
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<"card" | "deck" | null>(null);

    const loadDeck = useCallback(async () => {
        // Wait for auth to load
        if (authLoading) return;

        console.log("loadDeck started, deckId:", deckId);
        if (!deckId) {
            console.error("No deckId found");
            setIsLoading(false);
            return;
        }

        const fetchData = async () => {
            console.log("Fetching deck...");
            // Pass user.id to avoid redundant getUser() call
            const deckData = await getDeck(deckId, user?.id);
            console.log("Deck data received:", deckData);

            if (deckData) {
                setDeck(deckData);
                setDeckName(deckData.name);
                console.log("Fetching flashcards...");
                const cards = await getFlashcards(deckId, user?.id);
                console.log("Flashcards received:", cards.length);
                setFlashcards(cards);
            } else {
                console.log("Deck not found for id:", deckId);
            }
        };

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Request timed out")), 10000)
        );

        try {
            await Promise.race([fetchData(), timeoutPromise]);
        } catch (error) {
            console.error("Error in loadDeck:", error);
            // Optional: Show error toast or state
        } finally {
            console.log("Setting isLoading to false");
            setIsLoading(false);
        }
    }, [deckId, user, authLoading]);

    useEffect(() => {
        loadDeck();
    }, [loadDeck]);

    async function handleSave() {
        if (!deck || !deckName.trim()) return;
        await updateDeck(deck.id, { name: deckName.trim() });
        router.push("/decks");
    }

    // Add card handlers
    function handleOpenAddCard() {
        setShowAddCard(true);
    }

    async function handleAddCard() {
        if (!newCardFront.trim() || !newCardBack.trim()) return;
        await createFlashcard({
            deckId,
            front: newCardFront.trim(),
            back: newCardBack.trim(),
        });
        setNewCardFront("");
        setNewCardBack("");
        setShowAddCard(false);
        const cards = await getFlashcards(deckId);
        setFlashcards(cards);
    }

    // Card action handlers
    function handleCardClick(card: Flashcard) {
        setSelectedCard(card);
        setShowCardActions(true);
    }

    function handleOpenEditCard() {
        if (!selectedCard) return;
        setEditCardFront(selectedCard.front);
        setEditCardBack(selectedCard.back);
        setShowCardActions(false);
        setShowEditCard(true);
    }

    async function handleSaveEditCard() {
        if (!selectedCard || !editCardFront.trim() || !editCardBack.trim()) return;
        await updateFlashcard(selectedCard.id, {
            front: editCardFront.trim(),
            back: editCardBack.trim(),
        });
        setShowEditCard(false);
        setSelectedCard(null);
        const cards = await getFlashcards(deckId);
        setFlashcards(cards);
    }

    function handleRequestDeleteCard() {
        setShowCardActions(false);
        setDeleteTarget("card");
        setShowDeleteConfirm(true);
    }

    async function handleConfirmDeleteCard() {
        if (!selectedCard) return;
        await deleteFlashcard(selectedCard.id);
        setShowDeleteConfirm(false);
        setDeleteTarget(null);
        setSelectedCard(null);
        const cards = await getFlashcards(deckId);
        setFlashcards(cards);
    }

    // Deck delete handlers
    function handleRequestDeleteDeck() {
        setDeleteTarget("deck");
        setShowDeleteConfirm(true);
    }

    async function handleConfirmDeleteDeck() {
        if (!deck) return;
        await deleteDeck(deck.id);
        router.push("/decks");
    }

    function handleCancelDelete() {
        setShowDeleteConfirm(false);
        setDeleteTarget(null);
        if (deleteTarget === "card") {
            setShowCardActions(true);
        }
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    if (!deck) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4">
                <p className="text-lg text-muted-foreground">Deck not found</p>
                <Link href="/decks" className="text-primary">
                    Go back to decks
                </Link>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen w-full flex-col pb-20">
            {/* Top App Bar */}
            <TopAppBar
                title="Edit Deck"
                leftAction={
                    <Link href="/decks">
                        <span className="material-symbols-outlined text-foreground">
                            arrow_back_ios_new
                        </span>
                    </Link>
                }
                rightAction={
                    <button
                        onClick={handleSave}
                        className="text-base font-bold text-primary"
                    >
                        Save
                    </button>
                }
            />

            {/* Main Content */}
            <main className="flex-1 px-4 py-6">
                {/* Deck Name Input */}
                <div className="mb-8">
                    <TextInput
                        label="Deck Name"
                        value={deckName}
                        onChange={(e) => setDeckName(e.target.value)}
                    />
                </div>

                {/* Flashcards Section */}
                <div>
                    <h2 className="pb-2 text-lg font-bold text-foreground">
                        Flashcards ({flashcards.length})
                    </h2>

                    {/* List of Flashcards */}
                    <div className="flex flex-col gap-2">
                        {flashcards.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted py-12 text-center">
                                <span className="material-symbols-outlined text-5xl text-muted-foreground">
                                    style
                                </span>
                                <p className="mt-4 text-base font-medium text-muted-foreground">
                                    This deck is empty.
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Tap the &apos;+&apos; to add your first card!
                                </p>
                            </div>
                        ) : (
                            flashcards.map((card) => (
                                <FlashcardListItem
                                    key={card.id}
                                    frontText={card.front}
                                    onClick={() => handleCardClick(card)}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Delete Deck Section */}
                <div className="mt-12 border-t border-muted pt-6">
                    <Button variant="danger" fullWidth onClick={handleRequestDeleteDeck}>
                        <span className="material-symbols-outlined">delete</span>
                        <span>Delete Deck</span>
                    </Button>
                </div>
            </main>

            {/* FAB */}
            <FloatingActionButton icon="add" onClick={handleOpenAddCard} />

            {/* Add Card Bottom Sheet */}
            <BottomSheet
                isOpen={showAddCard}
                onClose={() => {
                    setShowAddCard(false);
                    setNewCardFront("");
                    setNewCardBack("");
                }}
                title="Add Flashcard"
            >
                <div className="flex flex-col gap-4">
                    <TextInput
                        placeholder="Front (Question)"
                        value={newCardFront}
                        onChange={(e) => setNewCardFront(e.target.value)}
                    />
                    <TextInput
                        placeholder="Back (Answer)"
                        value={newCardBack}
                        onChange={(e) => setNewCardBack(e.target.value)}
                    />
                    <Button
                        onClick={handleAddCard}
                        disabled={!newCardFront.trim() || !newCardBack.trim()}
                    >
                        Add Card
                    </Button>
                </div>
            </BottomSheet>

            {/* Card Actions Bottom Sheet */}
            <BottomSheet
                isOpen={showCardActions}
                onClose={() => {
                    setShowCardActions(false);
                    setSelectedCard(null);
                }}
                title="Card Options"
            >
                <div className="flex flex-col">
                    <BottomSheetOption
                        icon="edit"
                        label="Edit Card"
                        onClick={handleOpenEditCard}
                    />
                    <BottomSheetOption
                        icon="delete"
                        label="Delete Card"
                        onClick={handleRequestDeleteCard}
                        variant="danger"
                    />
                </div>
            </BottomSheet>

            {/* Edit Card Bottom Sheet */}
            <BottomSheet
                isOpen={showEditCard}
                onClose={() => {
                    setShowEditCard(false);
                    setSelectedCard(null);
                }}
                title="Edit Flashcard"
            >
                <div className="flex flex-col gap-4">
                    <TextInput
                        label="Front (Question)"
                        value={editCardFront}
                        onChange={(e) => setEditCardFront(e.target.value)}
                    />
                    <TextInput
                        label="Back (Answer)"
                        value={editCardBack}
                        onChange={(e) => setEditCardBack(e.target.value)}
                    />
                    <Button
                        onClick={handleSaveEditCard}
                        disabled={!editCardFront.trim() || !editCardBack.trim()}
                    >
                        Save Changes
                    </Button>
                </div>
            </BottomSheet>

            {/* Delete Confirmation Bottom Sheet */}
            <BottomSheet
                isOpen={showDeleteConfirm}
                onClose={handleCancelDelete}
                title={deleteTarget === "deck" ? "Delete Deck?" : "Delete Card?"}
            >
                <div className="flex flex-col gap-4">
                    <p className="text-muted-foreground">
                        {deleteTarget === "deck"
                            ? "This will permanently delete this deck and all its flashcards. This action cannot be undone."
                            : "This will permanently delete this flashcard. This action cannot be undone."}
                    </p>
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={handleCancelDelete} fullWidth>
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={
                                deleteTarget === "deck"
                                    ? handleConfirmDeleteDeck
                                    : handleConfirmDeleteCard
                            }
                            fullWidth
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </BottomSheet>
        </div>
    );
}
