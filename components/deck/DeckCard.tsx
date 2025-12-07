import { IconButton } from "@/components/ui/IconButton";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface DeckCardProps {
    title: string;
    cardCount: number;
    mastery: number;
    onClick?: () => void;
    onMenuClick?: () => void;
}

export function DeckCard({
    title,
    cardCount,
    mastery,
    onClick,
    onMenuClick,
}: DeckCardProps) {
    return (
        <div className="w-full">
            <div
                className="flex cursor-pointer flex-col rounded-xl bg-card shadow-sm transition-transform active:scale-[0.98]"
                onClick={onClick}
            >
                <div className="flex min-w-72 grow flex-col gap-3 p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <p className="text-lg font-bold leading-tight tracking-tight text-foreground">
                            {title}
                        </p>
                        <IconButton
                            icon="more_vert"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onMenuClick?.();
                            }}
                        />
                    </div>

                    {/* Card count */}
                    <p className="-mt-2 text-base text-muted-foreground">
                        {cardCount} Cards
                    </p>

                    {/* Mastery progress */}
                    <ProgressBar
                        value={mastery}
                        label="Mastery"
                        showPercentage
                        variant="primary"
                    />
                </div>
            </div>
        </div>
    );
}

