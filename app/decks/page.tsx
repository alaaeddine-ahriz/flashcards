"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    SearchInput,
    Chip,
    ChipGroup,
    IconButton,
    BottomSheet,
    BottomSheetOption,
    TextInput,
    Button,
} from "@/components/ui";
import { DeckCard } from "@/components/deck";
import {
    getDecksWithStats,
    getAllRegisteredTags,
    updateDeck,
    deleteDeck,
    createTag,
} from "@/services/deckService";
import { DeckWithStats } from "@/types";

export default function DecksPage() {
    const router = useRouter();
    const [decks, setDecks] = useState<DeckWithStats[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [selectedTag, setSelectedTag] = useState<string>("All");
    const [searchQuery, setSearchQuery] = useState("");

    // Bottom sheet state
    const [selectedDeck, setSelectedDeck] = useState<DeckWithStats | null>(null);
    const [showDeckActions, setShowDeckActions] = useState(false);
    const [showLabelSheet, setShowLabelSheet] = useState(false);
    const [showNewLabelSheet, setShowNewLabelSheet] = useState(false);
    const [newLabelName, setNewLabelName] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    function loadData() {
        const allDecks = getDecksWithStats();
        const allTags = getAllRegisteredTags();
        setDecks(allDecks);
        setTags(["All", ...allTags]);
    }

    function handleDeckMenu(deck: DeckWithStats) {
        setSelectedDeck(deck);
        setShowDeckActions(true);
    }

    function handleEditDeck() {
        if (selectedDeck) {
            router.push(`/decks/${selectedDeck.id}/edit`);
        }
        setShowDeckActions(false);
    }

    function handleDeleteDeck() {
        if (selectedDeck && confirm("Are you sure you want to delete this deck?")) {
            deleteDeck(selectedDeck.id);
            loadData();
        }
        setShowDeckActions(false);
        setSelectedDeck(null);
    }

    function handleManageLabels() {
        setShowDeckActions(false);
        setShowLabelSheet(true);
    }

    function handleToggleLabel(label: string) {
        if (!selectedDeck) return;

        const currentTags = selectedDeck.tags || [];
        const newTags = currentTags.includes(label)
            ? currentTags.filter((t) => t !== label)
            : [...currentTags, label];

        updateDeck(selectedDeck.id, { tags: newTags });
        loadData();

        // Update selected deck with new tags
        setSelectedDeck((prev) => (prev ? { ...prev, tags: newTags } : null));
    }

    function handleCreateLabel() {
        if (!newLabelName.trim()) return;

        createTag(newLabelName.trim());
        loadData();
        setNewLabelName("");
        setShowNewLabelSheet(false);
        setShowLabelSheet(true);
    }

    // Filter decks based on search and selected tag
    const filteredDecks = decks.filter((deck) => {
        const matchesSearch = deck.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesTag =
            selectedTag === "All" || deck.tags.includes(selectedTag);
        return matchesSearch && matchesTag;
    });

    // Get tags without "All" for label management
    const availableLabels = tags.filter((t) => t !== "All");

    return (
        <div className="relative flex min-h-screen w-full flex-col">
            {/* Top App Bar */}
            <div className="sticky top-0 z-10 flex flex-col bg-background pt-4">
                <div className="flex items-center justify-between px-4 pb-2">
                    <Link href="/decks/upload">
                        <IconButton icon="add" />
                    </Link>
                    <h2 className="flex-1 text-center text-lg font-bold text-foreground">
                        Decks
                    </h2>
                    <Link href="/profile">
                        <div className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
                            ME
                        </div>
                    </Link>
                </div>

                {/* Search Bar */}
                <div className="px-4 py-3">
                    <SearchInput
                        placeholder="Search decks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Category Chips */}
                <ChipGroup>
                    {tags.map((tag) => (
                        <Chip
                            key={tag}
                            label={tag}
                            active={selectedTag === tag}
                            onClick={() => setSelectedTag(tag)}
                        />
                    ))}
                </ChipGroup>
            </div>

            {/* Deck Cards */}
            <main className="flex flex-grow flex-col gap-4 px-4 pb-24">
                {filteredDecks.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
                        <span className="material-symbols-outlined text-6xl text-muted-foreground">
                            style
                        </span>
                        <p className="text-lg font-medium text-muted-foreground">
                            {decks.length === 0
                                ? "No decks yet. Create your first deck!"
                                : "No decks match your search."}
                        </p>
                        {decks.length === 0 && (
                            <Link
                                href="/decks/upload"
                                className="mt-2 rounded-xl bg-primary px-6 py-3 font-medium text-white"
                            >
                                Upload CSV
                            </Link>
                        )}
                    </div>
                ) : (
                    filteredDecks.map((deck) => (
                        <DeckCard
                            key={deck.id}
                            title={deck.name}
                            cardCount={deck.cardCount}
                            mastery={deck.mastery}
                            onPractice={() => router.push(`/practice/${deck.id}`)}
                            onMenuClick={() => handleDeckMenu(deck)}
                        />
                    ))
                )}
            </main>

            {/* Deck Actions Bottom Sheet */}
            <BottomSheet
                isOpen={showDeckActions}
                onClose={() => {
                    setShowDeckActions(false);
                    setSelectedDeck(null);
                }}
                title={selectedDeck?.name}
            >
                <div className="flex flex-col">
                    <BottomSheetOption
                        icon="edit"
                        label="Edit Deck"
                        onClick={handleEditDeck}
                    />
                    <BottomSheetOption
                        icon="label"
                        label="Manage Labels"
                        onClick={handleManageLabels}
                    />
                    <BottomSheetOption
                        icon="delete"
                        label="Delete Deck"
                        onClick={handleDeleteDeck}
                        variant="danger"
                    />
                </div>
            </BottomSheet>

            {/* Labels Bottom Sheet */}
            <BottomSheet
                isOpen={showLabelSheet}
                onClose={() => {
                    setShowLabelSheet(false);
                    setSelectedDeck(null);
                }}
                title="Manage Labels"
            >
                <div className="flex flex-col gap-2">
                    {availableLabels.length === 0 ? (
                        <p className="py-4 text-center text-muted-foreground">
                            No labels yet. Create one to organize your decks!
                        </p>
                    ) : (
                        availableLabels.map((label) => {
                            const isActive = selectedDeck?.tags.includes(label);
                            return (
                                <button
                                    key={label}
                                    onClick={() => handleToggleLabel(label)}
                                    className={`flex items-center justify-between rounded-xl px-4 py-3 transition-colors ${isActive ? "bg-primary/10" : "hover:bg-muted"
                                        }`}
                                >
                                    <span className="font-medium text-foreground">{label}</span>
                                    {isActive && (
                                        <span className="material-symbols-outlined text-primary">
                                            check
                                        </span>
                                    )}
                                </button>
                            );
                        })
                    )}

                    <button
                        onClick={() => {
                            setShowLabelSheet(false);
                            setShowNewLabelSheet(true);
                        }}
                        className="mt-2 flex items-center gap-3 rounded-xl px-4 py-3 text-primary hover:bg-muted"
                    >
                        <span className="material-symbols-outlined">add</span>
                        <span className="font-medium">Create New Label</span>
                    </button>
                </div>
            </BottomSheet>

            {/* New Label Bottom Sheet */}
            <BottomSheet
                isOpen={showNewLabelSheet}
                onClose={() => {
                    setShowNewLabelSheet(false);
                    setNewLabelName("");
                    setShowLabelSheet(true);
                }}
                title="Create Label"
            >
                <div className="flex flex-col gap-4">
                    <TextInput
                        placeholder="Label name (e.g. Biology, Spanish...)"
                        value={newLabelName}
                        onChange={(e) => setNewLabelName(e.target.value)}
                    />
                    <Button onClick={handleCreateLabel} disabled={!newLabelName.trim()}>
                        Create Label
                    </Button>
                </div>
            </BottomSheet>
        </div>
    );
}
