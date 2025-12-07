import { ReactNode } from "react";

interface StickyFooterProps {
    children: ReactNode;
}

export function StickyFooter({ children }: StickyFooterProps) {
    return (
        <footer className="sticky bottom-0 mt-auto w-full shrink-0 border-t border-white/10 bg-background/80 p-4 backdrop-blur-sm">
            {children}
        </footer>
    );
}
