import * as pdfjsLib from 'pdfjs-dist';

// Define the worker source URL (using CDN for simplicity/reliability in Vite without complex config)
// In a production app, we might copy the worker file to public/
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

export interface PDFPreviewData {
    pageCount: number;
    pdf: pdfjsLib.PDFDocumentProxy;
}

export async function loadPDFForPreview(file: File): Promise<PDFPreviewData> {
    const arrayBuffer = await file.arrayBuffer();
    // Using document loading task
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    return {
        pageCount: pdf.numPages,
        pdf: pdf
    };
}

export async function renderPageToImage(
    pdf: pdfjsLib.PDFDocumentProxy,
    pageIndex: number, // 1-based index for PDF.js getPage? No, getPage(1) is first page.
    scale: number = 0.5
): Promise<string> {
    // Page index in PDF.js is 1-based
    const page = await pdf.getPage(pageIndex);

    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    if (!context) throw new Error('Could not get canvas context');

    const renderContext = {
        canvasContext: context,
        viewport: viewport
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await page.render(renderContext as any).promise;

    return canvas.toDataURL('image/jpeg', 0.8);
}
