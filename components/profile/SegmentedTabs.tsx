"use client";

import { useState } from "react";

interface Tab {
    value: string;
    label: string;
}

interface SegmentedTabsProps {
    tabs: Tab[];
    defaultValue?: string;
    onChange?: (value: string) => void;
}

export function SegmentedTabs({
    tabs,
    defaultValue,
    onChange,
}: SegmentedTabsProps) {
    const [selected, setSelected] = useState(defaultValue || tabs[0]?.value);

    const handleSelect = (value: string) => {
        setSelected(value);
        onChange?.(value);
    };

    return (
        <div className="flex h-10 flex-1 items-center justify-center rounded-lg bg-muted p-1">
            {tabs.map((tab) => (
                <button
                    key={tab.value}
                    onClick={() => handleSelect(tab.value)}
                    className={`
            flex h-full flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-lg px-2
            text-sm font-medium transition-all
            ${selected === tab.value
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }
          `}
                >
                    <span className="truncate">{tab.label}</span>
                </button>
            ))}
        </div>
    );
}
