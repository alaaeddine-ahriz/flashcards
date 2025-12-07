"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { StickyFooter } from "@/components/layout/StickyFooter";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { UploadDropzone, FileListItem } from "@/components/upload";
import {
    parseCSV,
    readFileAsText,
    downloadCSVTemplate,
} from "@/lib/csvParser";
import { createDeck } from "@/services/deckService";
import { createFlashcardsFromCSV } from "@/services/flashcardService";
import { CSVRow } from "@/types";

export default function UploadDeckPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [parsedRows, setParsedRows] = useState<CSVRow[]>([]);
    const [deckName, setDeckName] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleFileSelect() {
        fileInputRef.current?.click();
    }

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);

        try {
            const content = await readFileAsText(file);
            const rows = parseCSV(content);

            if (rows.length === 0) {
                setError(
                    "No valid flashcards found. Make sure your CSV has two columns: front (Column A) and back (Column B)."
                );
                return;
            }

            setSelectedFile(file);
            setParsedRows(rows);

            // Auto-fill deck name from filename
            const fileName = file.name.replace(/\.csv$/i, "");
            if (!deckName) {
                setDeckName(fileName);
            }
        } catch {
            setError("Failed to read file. Please try again.");
        }
    }

    function handleRemoveFile() {
        setSelectedFile(null);
        setParsedRows([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    async function handleUpload() {
        if (!selectedFile || parsedRows.length === 0 || !deckName.trim()) return;

        setIsUploading(true);

        try {
            // Create deck
            const deck = await createDeck({ name: deckName.trim() });

            if (!deck) {
                setError("Failed to create deck. Please try again.");
                setIsUploading(false);
                return;
            }

            // Create flashcards
            await createFlashcardsFromCSV(deck.id, parsedRows);

            // Navigate to deck list
            router.push("/decks");
        } catch {
            setError("Failed to create deck. Please try again.");
            setIsUploading(false);
        }
    }

    const canUpload = selectedFile && parsedRows.length > 0 && deckName.trim();

    return (
        <div className="relative flex min-h-screen w-full flex-col">
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
            />

            {/* Top App Bar */}
            <TopAppBar
                title="Upload Deck"
                leftAction={
                    <Link href="/decks">
                        <span className="material-symbols-outlined text-2xl text-foreground">
                            arrow_back_ios_new
                        </span>
                    </Link>
                }
            />

            {/* Main Content */}
            <main className="flex flex-1 flex-col p-4">
                {/* Headline */}
                {/* <div className="pb-6 pt-4">
                    <h2 className="text-center text-3xl font-bold tracking-tight text-foreground">
                        Import from CSV
                    </h2>
                </div> */}

                {/* Upload Area */}
                <UploadDropzone
                    onFileSelect={handleFileSelect}
                    onDownloadTemplate={downloadCSVTemplate}
                />

                {/* Error message */}
                {error && (
                    <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                {/* Selected File */}
                {selectedFile && (
                    <div className="pt-8">
                        <FileListItem
                            fileName={`${selectedFile.name} (${parsedRows.length} cards)`}
                            onRemove={handleRemoveFile}
                        />

                        {/* Deck Name Input */}
                        <div className="mt-6">
                            <TextInput
                                label="Deck Name"
                                value={deckName}
                                onChange={(e) => setDeckName(e.target.value)}
                                placeholder="Enter deck name..."
                            />
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <StickyFooter>
                <Button
                    fullWidth
                    size="lg"
                    onClick={handleUpload}
                    disabled={!canUpload || isUploading}
                >
                    {isUploading
                        ? "Creating..."
                        : `Upload & Create Deck${parsedRows.length > 0 ? ` (${parsedRows.length} cards)` : ""}`}
                </Button>
            </StickyFooter>
        </div>
    );
}
