import { PDFDocument } from 'pdf-lib';

export async function mergePDFs(files: File[]): Promise<Uint8Array> {
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    return mergedPdf.save();
}

/**
 * Creates a new PDF containing only the specified page indices from the source file.
 */
export async function extractPages(file: File, pageIndices: number[]): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    const srcPdf = await PDFDocument.load(arrayBuffer);
    const newPdf = await PDFDocument.create();

    const copiedPages = await newPdf.copyPages(srcPdf, pageIndices);
    copiedPages.forEach((page) => newPdf.addPage(page));

    return newPdf.save();
}

export async function downloadPDF(data: Uint8Array, filename: string) {
    const blob = new Blob([data as BlobPart], { type: 'application/pdf' });

    // Modern API: showSaveFilePicker (Allows user to choose location)
    if ('showSaveFilePicker' in window) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const handle = await (window as any).showSaveFilePicker({
                suggestedName: filename,
                types: [{
                    description: 'PDF Document',
                    accept: { 'application/pdf': ['.pdf'] },
                }],
            });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
            return;
        } catch (err: unknown) {
            // User cancelled or API failed -> Fallback to anchor
            // Check if error is 'AbortError' (User cancelled)
            if ((err as Error).name !== 'AbortError') {
                console.warn('File System Access API failed, falling back to download link.', err);
            } else {
                return; // User cancelled, do nothing
            }
        }
    }

    // Fallback: Anchor tag method
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Reorders or deletes pages from a PDF.
 * @param file Source PDF file
 * @param pageIndices Array of 0-based page indices to keep, in the desired order.
 */
export async function modifyPdfPages(file: File, pageIndices: number[]): Promise<Uint8Array> {
    return extractPages(file, pageIndices);
}

