import { IconButton } from "@/components/ui/IconButton";

interface FileListItemProps {
    fileName: string;
    onRemove?: () => void;
}

export function FileListItem({ fileName, onRemove }: FileListItemProps) {
    return (
        <div className="flex min-h-14 items-center justify-between gap-4 rounded-lg bg-muted/50 px-4">
            <div className="flex items-center gap-4">
                {/* File icon */}
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <span className="material-symbols-outlined">description</span>
                </div>
                {/* File name */}
                <p className="flex-1 truncate text-base text-foreground">{fileName}</p>
            </div>
            {/* Remove button */}
            <div className="shrink-0">
                <IconButton icon="close" size="sm" onClick={onRemove} />
            </div>
        </div>
    );
}
