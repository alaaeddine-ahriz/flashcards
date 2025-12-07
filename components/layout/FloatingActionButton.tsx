interface FloatingActionButtonProps {
    icon?: string;
    onClick?: () => void;
    label?: string;
}

export function FloatingActionButton({
    icon = "add",
    onClick,
    label,
}: FloatingActionButtonProps) {
    return (
        <div className="fixed bottom-6 right-6 z-20">
            <button
                onClick={onClick}
                aria-label={label || "Add"}
                className="flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform active:scale-95"
            >
                <span className="material-symbols-outlined text-3xl">{icon}</span>
            </button>
        </div>
    );
}
