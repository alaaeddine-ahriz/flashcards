interface ChipProps {
    label: string;
    active?: boolean;
    onClick?: () => void;
}

export function Chip({ label, active = false, onClick }: ChipProps) {
    return (
        <button
            onClick={onClick}
            className={`
        flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4
        text-sm font-medium transition-colors
        ${active ? "bg-primary text-white" : "bg-muted text-foreground hover:bg-muted/80"}
      `}
        >
            {label}
        </button>
    );
}

interface ChipGroupProps {
    children: React.ReactNode;
}

export function ChipGroup({ children }: ChipGroupProps) {
    return (
        <div className="hide-scrollbar flex gap-3 overflow-x-auto p-3 pl-4">
            {children}
        </div>
    );
}
