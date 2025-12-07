interface DeckProgressItemProps {
    name: string;
    newCount: number;
    learningCount: number;
    masteredCount: number;
    totalCount: number;
}

export function DeckProgressItem({
    name,
    newCount,
    learningCount,
    masteredCount,
    totalCount,
}: DeckProgressItemProps) {
    // Calculate percentages for the stacked bar
    const newPercent = totalCount > 0 ? (newCount / totalCount) * 100 : 0;
    const learningPercent = totalCount > 0 ? (learningCount / totalCount) * 100 : 0;
    const masteredPercent = totalCount > 0 ? (masteredCount / totalCount) * 100 : 0;

    return (
        <div className="flex flex-col gap-3 rounded-xl border border-muted bg-card/50 p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <p className="font-semibold text-foreground">{name}</p>
                <p className="text-sm text-muted-foreground">{totalCount} cards</p>
            </div>

            {/* Stacked Progress Bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="flex h-full">
                    {masteredPercent > 0 && (
                        <div
                            className="bg-success transition-all"
                            style={{ width: `${masteredPercent}%` }}
                        />
                    )}
                    {learningPercent > 0 && (
                        <div
                            className="bg-primary transition-all"
                            style={{ width: `${learningPercent}%` }}
                        />
                    )}
                    {newPercent > 0 && (
                        <div
                            className="bg-warning transition-all"
                            style={{ width: `${newPercent}%` }}
                        />
                    )}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-warning" />
                    <span className="text-muted-foreground">New</span>
                    <span className="font-medium text-foreground">{newCount}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                    <span className="text-muted-foreground">Learning</span>
                    <span className="font-medium text-foreground">{learningCount}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-success" />
                    <span className="text-muted-foreground">Mastered</span>
                    <span className="font-medium text-foreground">{masteredCount}</span>
                </div>
            </div>
        </div>
    );
}
