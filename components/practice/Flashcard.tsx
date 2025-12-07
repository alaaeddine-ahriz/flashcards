"use client";

import { useState } from "react";

interface FlashcardProps {
    front: string;
    back: string;
}

export function Flashcard({ front, back }: FlashcardProps) {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div className="flex flex-col items-center">
            <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="flex h-[400px] w-full max-w-md cursor-pointer flex-col rounded-xl bg-card p-6 shadow-lg transition-transform active:scale-[0.99]"
            >
                {!isFlipped ? (
                    // Front of card
                    <div className="flex flex-1 items-center justify-center text-center">
                        <h1 className="text-3xl font-bold text-foreground">{front}</h1>
                    </div>
                ) : (
                    // Back of card
                    <div className="flex flex-1 flex-col items-start justify-start text-left">
                        <p className="text-base font-medium text-muted-foreground">
                            {front}
                        </p>
                        <hr className="my-4 w-full border-t border-muted" />
                        <h1 className="text-3xl font-bold text-foreground">{back}</h1>
                    </div>
                )}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
                {isFlipped ? "How well did you know this?" : "Tap card to see answer"}
            </p>
        </div>
    );
}
