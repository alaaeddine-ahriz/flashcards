type Difficulty = "hard" | "good" | "easy";

interface DifficultyButtonProps {
    difficulty: Difficulty;
    onClick?: () => void;
}

const difficultyStyles: Record<
    Difficulty,
    { bg: string; text: string; label: string }
> = {
    hard: {
        bg: "bg-destructive/10 dark:bg-destructive/20",
        text: "text-destructive",
        label: "Hard",
    },
    good: {
        bg: "bg-warning/10 dark:bg-warning/20",
        text: "text-warning",
        label: "Good",
    },
    easy: {
        bg: "bg-success/10 dark:bg-success/20",
        text: "text-success",
        label: "Easy",
    },
};

export function DifficultyButton({ difficulty, onClick }: DifficultyButtonProps) {
    const styles = difficultyStyles[difficulty];

    return (
        <button
            onClick={onClick}
            className={`flex h-12 flex-1 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl transition-transform active:scale-95 ${styles.bg} ${styles.text}`}
        >
            <span className="text-sm font-bold">{styles.label}</span>
        </button>
    );
}

interface DifficultyButtonGroupProps {
    onSelect?: (difficulty: Difficulty) => void;
}

export function DifficultyButtonGroup({ onSelect }: DifficultyButtonGroupProps) {
    return (
        <div className="flex w-full items-center justify-stretch gap-3">
            <DifficultyButton difficulty="hard" onClick={() => onSelect?.("hard")} />
            <DifficultyButton difficulty="good" onClick={() => onSelect?.("good")} />
            <DifficultyButton difficulty="easy" onClick={() => onSelect?.("easy")} />
        </div>
    );
}
