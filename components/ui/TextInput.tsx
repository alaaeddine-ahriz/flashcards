import { InputHTMLAttributes } from "react";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export function TextInput({ label, className = "", ...props }: TextInputProps) {
    return (
        <label className="flex flex-col">
            {label && (
                <p className="pb-2 text-base font-medium text-foreground">{label}</p>
            )}
            <input
                className={`
          h-14 w-full rounded-xl border border-muted bg-card p-4
          text-base text-foreground placeholder:text-muted-foreground
          transition-all
          focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
          ${className}
        `}
                {...props}
            />
        </label>
    );
}
