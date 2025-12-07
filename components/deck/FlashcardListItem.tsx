interface FlashcardListItemProps {
    frontText: string;
    onClick?: () => void;
}

export function FlashcardListItem({ frontText, onClick }: FlashcardListItemProps) {
    return (
        <div
            onClick={onClick}
            className="group flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-card p-3 transition-colors hover:bg-card/80"
        >
            <div className="flex flex-1 items-center gap-4 truncate">
                {/* Drag handle */}
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <span className="material-symbols-outlined text-muted-foreground">
                        drag_indicator
                    </span>
                </div>
                {/* Card text */}
                <p className="flex-1 truncate text-base text-foreground">{frontText}</p>
            </div>
            {/* Arrow */}
            <div className="shrink-0">
                <div className="flex size-7 items-center justify-center text-muted-foreground">
                    <span className="material-symbols-outlined">arrow_forward_ios</span>
                </div>
            </div>
        </div>
    );
}
