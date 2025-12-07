import { ReactNode } from "react";

interface TopAppBarProps {
    title: string;
    leftAction?: ReactNode;
    rightAction?: ReactNode;
    sticky?: boolean;
}

export function TopAppBar({
    title,
    leftAction,
    rightAction,
    sticky = true,
}: TopAppBarProps) {
    return (
        <header
            className={`${sticky ? "sticky top-0 z-10" : ""
                } flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-background/80 px-4 backdrop-blur-sm`}
        >
            <div className="flex size-10 shrink-0 items-center justify-start">
                {leftAction}
            </div>
            <h1 className="flex-1 text-center text-lg font-bold text-foreground">
                {title}
            </h1>
            <div className="flex w-10 items-center justify-end">{rightAction}</div>
        </header>
    );
}
