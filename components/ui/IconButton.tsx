import { ButtonHTMLAttributes } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon: string;
    size?: "sm" | "md" | "lg";
    variant?: "default" | "ghost";
}

const sizeClasses = {
    sm: "size-8 text-xl",
    md: "size-10 text-2xl",
    lg: "size-12 text-3xl",
};

export function IconButton({
    icon,
    size = "md",
    variant = "ghost",
    className = "",
    ...props
}: IconButtonProps) {
    return (
        <button
            className={`
        flex shrink-0 items-center justify-center rounded-full
        transition-colors
        ${variant === "ghost" ? "text-muted-foreground hover:bg-muted/50" : "bg-muted text-foreground hover:bg-muted/80"}
        ${sizeClasses[size]}
        ${className}
      `}
            {...props}
        >
            <span className="material-symbols-outlined">{icon}</span>
        </button>
    );
}
