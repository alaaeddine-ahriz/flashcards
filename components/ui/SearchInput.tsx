import { InputHTMLAttributes } from "react";

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
    onSearch?: (value: string) => void;
}

export function SearchInput({
    placeholder = "Search...",
    className = "",
    ...props
}: SearchInputProps) {
    return (
        <div className={`flex h-12 w-full ${className}`}>
            <div className="flex items-center justify-center rounded-l-lg bg-muted pl-4 text-muted-foreground">
                <span className="material-symbols-outlined">search</span>
            </div>
            <input
                type="text"
                className="w-full min-w-0 flex-1 rounded-r-lg border-none bg-muted px-4 pl-2 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0"
                placeholder={placeholder}
                {...props}
            />
        </div>
    );
}
