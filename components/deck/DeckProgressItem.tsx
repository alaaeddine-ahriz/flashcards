import { ProgressBar } from "@/components/ui/ProgressBar";

type ProgressVariant = "primary" | "success" | "warning";

interface DeckProgressItemProps {
    name: string;
    icon: string;
    progress: number;
    iconColor?: string;
}

function getProgressVariant(progress: number): ProgressVariant {
    if (progress >= 80) return "success";
    if (progress >= 50) return "primary";
    return "warning";
}

function getIconBgColor(progress: number): string {
    if (progress >= 80) return "bg-success/20";
    if (progress >= 50) return "bg-primary/20";
    return "bg-warning/20";
}

function getIconTextColor(progress: number): string {
    if (progress >= 80) return "text-success";
    if (progress >= 50) return "text-primary";
    return "text-warning";
}

export function DeckProgressItem({
    name,
    icon,
    progress,
}: DeckProgressItemProps) {
    return (
        <div className="flex items-center gap-4 rounded-xl border border-muted bg-card/50 p-4">
            {/* Icon */}
            <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${getIconBgColor(progress)}`}
            >
                <span
                    className={`material-symbols-outlined ${getIconTextColor(progress)}`}
                >
                    {icon}
                </span>
            </div>

            {/* Content */}
            <div className="flex-1">
                <p className="font-semibold text-foreground">{name}</p>
                <div className="mt-1 flex items-center gap-2">
                    <div className="flex-1">
                        <ProgressBar value={progress} variant={getProgressVariant(progress)} size="sm" />
                    </div>
                    <p className="text-sm text-muted-foreground">{progress}%</p>
                </div>
            </div>
        </div>
    );
}
