/**
 * Parses a string of page ranges into a sorted array of 0-based page indices.
 * Example: "1-3, 5" -> [0, 1, 2, 4]
 * 
 * @param rangeString The input string (e.g., "1-3, 5")
 * @param maxPages The total number of pages in the document (for validation)
 * @returns Array of unique, sorted 0-based page indices
 */
export function parsePageRange(rangeString: string, maxPages: number): number[] {
    const pages = new Set<number>();
    const parts = rangeString.split(',').map(s => s.trim()).filter(s => s.length > 0);

    for (const part of parts) {
        if (part.includes('-')) {
            // Range: "1-5"
            const [startStr, endStr] = part.split('-').map(s => s.trim());
            const start = parseInt(startStr, 10);
            const end = parseInt(endStr, 10);

            if (!isNaN(start) && !isNaN(end) && start > 0 && end >= start) {
                for (let i = start; i <= end; i++) {
                    if (i <= maxPages) {
                        pages.add(i - 1);
                    }
                }
            }
        } else {
            // Single page: "5"
            const page = parseInt(part, 10);
            if (!isNaN(page) && page > 0 && page <= maxPages) {
                pages.add(page - 1);
            }
        }
    }

    return Array.from(pages).sort((a, b) => a - b);
}

/**
 * Validates if a range string is syntactically correct (basic check).
 */
export function isValidRangeFormat(rangeString: string): boolean {
    const validCharRegex = /^[0-9\s,\-]+$/;
    return validCharRegex.test(rangeString);
}
