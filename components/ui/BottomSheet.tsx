"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export function BottomSheet({
    isOpen,
    onClose,
    title,
    children,
}: BottomSheetProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    const handleBackdropClick = useCallback(
        (e: React.MouseEvent) => {
            if (e.target === e.currentTarget) {
                onClose();
            }
        },
        [onClose]
    );

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={handleBackdropClick}
        >
            <div
                className="w-full max-w-lg animate-slide-up rounded-t-2xl bg-card"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Handle bar */}
                <div className="flex justify-center pt-3">
                    <div className="h-1 w-10 rounded-full bg-muted" />
                </div>

                {/* Title */}
                {title && (
                    <div className="px-4 pb-2 pt-4">
                        <h3 className="text-lg font-bold text-foreground">{title}</h3>
                    </div>
                )}

                {/* Content */}
                <div className="max-h-[70vh] overflow-y-auto px-4 pb-8 pt-2">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}

interface BottomSheetOptionProps {
    icon: string;
    label: string;
    onClick: () => void;
    variant?: "default" | "danger";
}

export function BottomSheetOption({
    icon,
    label,
    onClick,
    variant = "default",
}: BottomSheetOptionProps) {
    return (
        <button
            onClick={onClick}
            className={`flex w-full items-center gap-4 rounded-xl px-4 py-3 transition-colors ${variant === "danger"
                    ? "text-destructive hover:bg-destructive/10"
                    : "text-foreground hover:bg-muted"
                }`}
        >
            <span className="material-symbols-outlined">{icon}</span>
            <span className="font-medium">{label}</span>
        </button>
    );
}
