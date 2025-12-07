import { CSVRow } from "@/types";

/**
 * Parse CSV content into flashcard data
 * Expects: Column A = Front, Column B = Back
 * Supports comma and semicolon delimiters
 */
export function parseCSV(content: string): CSVRow[] {
    const lines = content.trim().split(/\r?\n/);
    const rows: CSVRow[] = [];

    // Detect delimiter (comma or semicolon)
    const firstLine = lines[0] || "";
    const delimiter = firstLine.includes(";") ? ";" : ",";

    for (const line of lines) {
        if (!line.trim()) continue;

        // Simple CSV parsing (handles quoted values)
        const values = parseCSVLine(line, delimiter);

        if (values.length >= 2) {
            const front = values[0].trim();
            const back = values[1].trim();

            if (front && back) {
                rows.push({ front, back });
            }
        }
    }

    return rows;
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string, delimiter: string): string[] {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++; // Skip escaped quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === delimiter && !inQuotes) {
            values.push(current);
            current = "";
        } else {
            current += char;
        }
    }

    values.push(current);
    return values;
}

/**
 * Read a file as text
 */
export function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsText(file);
    });
}

/**
 * Generate CSV template content
 */
export function generateCSVTemplate(): string {
    return `front,back
What is the capital of France?,Paris
What is 2 + 2?,4
How do you say "Hello" in Spanish?,Hola`;
}

/**
 * Download CSV template
 */
export function downloadCSVTemplate(): void {
    const content = generateCSVTemplate();
    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "flashcards-template.csv";
    link.click();

    URL.revokeObjectURL(url);
}
