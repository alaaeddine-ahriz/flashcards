type ProgressVariant = "primary" | "success" | "warning";

interface ProgressBarProps {
    value: number; // 0-100
    label?: string;
    showPercentage?: boolean;
    variant?: ProgressVariant;
    size?: "sm" | "md";
}

const variantColors: Record<ProgressVariant, string> = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
};

export function ProgressBar({
    value,
    label,
    showPercentage = false,
    variant = "primary",
    size = "md",
}: ProgressBarProps) {
    const clampedValue = Math.min(100, Math.max(0, value));

    return (
        <div className="flex flex-col gap-1">
            {(label || showPercentage) && (
                <div className="flex items-center justify-between gap-2">
                    {label && (
                        <p className="text-sm font-normal text-muted-foreground">{label}</p>
                    )}
                    {showPercentage && (
                        <p className="text-sm font-medium text-foreground">
                            {Math.round(clampedValue)}%
                        </p>
                    )}
                </div>
            )}
            <div
                className={`rounded-full bg-muted ${size === "sm" ? "h-1.5" : "h-2"}`}
            >
                <div
                    className={`${size === "sm" ? "h-1.5" : "h-2"} rounded-full transition-all duration-300 ${variantColors[variant]}`}
                    style={{ width: `${clampedValue}%` }}
                />
            </div>
        </div>
    );
}
