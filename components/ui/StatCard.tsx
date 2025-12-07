interface StatCardProps {
    label: string;
    value: string | number;
    fullWidth?: boolean;
}

export function StatCard({ label, value, fullWidth = false }: StatCardProps) {
    return (
        <div
            className={`
        flex flex-col gap-2 rounded-xl border border-muted bg-card/50 p-4
        ${fullWidth ? "w-full" : "min-w-[158px] flex-1"}
      `}
        >
            <p className="text-base font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold tracking-tight text-foreground">
                {value}
            </p>
        </div>
    );
}
