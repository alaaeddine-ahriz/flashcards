import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface DeckCardProps {
    title: string;
    cardCount: number;
    mastery: number;
    onPractice?: () => void;
    onMenuClick?: () => void;
}

export function DeckCard({
    title,
    cardCount,
    mastery,
    onPractice,
    onMenuClick,
}: DeckCardProps) {
    return (
        <div className="w-full">
            <div className="flex flex-col rounded-xl bg-card shadow-sm">
                <div className="flex min-w-72 grow flex-col gap-3 p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <p className="text-lg font-bold leading-tight tracking-tight text-foreground">
                            {title}
                        </p>
                        <IconButton icon="more_vert" size="sm" onClick={onMenuClick} />
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

                    {/* Actions */}
                    <div className="mt-2 flex items-center justify-end gap-3">
                        <Button onClick={onPractice}>Practice</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
