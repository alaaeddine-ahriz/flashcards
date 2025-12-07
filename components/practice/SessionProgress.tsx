import { IconButton } from "@/components/ui/IconButton";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface SessionProgressProps {
    current: number;
    total: number;
    onClose?: () => void;
}

export function SessionProgress({
    current,
    total,
    onClose,
}: SessionProgressProps) {
    const progress = total > 0 ? (current / total) * 100 : 0;

    return (
        <header className="flex w-full flex-col p-4 pt-6">
            <div className="flex items-center justify-between gap-4">
                <IconButton icon="close" onClick={onClose} />
                <h2 className="flex-1 text-center text-sm font-medium text-muted-foreground">
                    {current}/{total}
                </h2>
                <div className="size-10 shrink-0" /> {/* Spacer for centering */}
            </div>
            <div className="mt-4 w-full">
                <ProgressBar value={progress} size="sm" />
            </div>
        </header>
    );
}
