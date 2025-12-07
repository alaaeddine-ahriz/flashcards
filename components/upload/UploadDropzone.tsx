import { Button } from "@/components/ui/Button";

interface UploadDropzoneProps {
    onFileSelect?: () => void;
    onDownloadTemplate?: () => void;
}

export function UploadDropzone({
    onFileSelect,
    onDownloadTemplate,
}: UploadDropzoneProps) {
    return (
        <div
            onClick={onFileSelect}
            className="flex cursor-pointer flex-col gap-6 rounded-xl border-2 border-dashed border-muted p-6 transition-colors hover:border-primary/50"
        >
            <div className="flex flex-col items-center gap-2">
                <p className="text-center text-lg font-bold text-foreground">
                    Tap to select a .CSV file
                </p>
                <p className="text-center text-sm text-muted-foreground">
                    Column A: Front, Column B: Back
                </p>
            </div>
            <Button
                variant="secondary"
                onClick={(e) => {
                    e.stopPropagation();
                    onDownloadTemplate?.();
                }}
                className="mx-auto"
            >
                Download Template
            </Button>
        </div>
    );
}
