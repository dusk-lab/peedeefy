import { PDFDocument } from 'pdf-lib';

// Ensure worker is set up (should be done in entry point or preview utils, but safe to set here too)
// Importing the preview util creates a circular dependency if we aren't careful, so we rely on global worker setup or re-import the loading logic.
// Actually, let's reuse loadPDFForPreview logic or similar to get the Proxy.
import { loadPDFForPreview } from './preview';

/**
 * Compresses a PDF by rendering each page to a JPEG and re-embedding it.
 * @param file Source PDF file
 * @param quality JPEG quality (0.0 to 1.0). Lower = more compression.
 * @param scale Scale factor (e.g. 1.0 = original size, 0.5 = half resolution).
 */
export async function compressPDF(file: File, quality: number = 0.7, scale: number = 1.0): Promise<Uint8Array> {
    // 1. Load original PDF to get pages
    const { pageCount, pdf } = await loadPDFForPreview(file);

    // 2. Create new PDF
    const newPdf = await PDFDocument.create();

    for (let i = 1; i <= pageCount; i++) {
        // 3. Render page to image (Base64 JPEG)
        // Note: renderPageToImage in preview.ts uses a hardcoded 0.8 quality.
        // We might need to modify renderPageToImage or create a custom one here to support custom quality.
        // Let's create a custom render function here to avoid breaking changes there, or Refactor preview.ts to accept quality.

        // For now, let's duplicate the render logic slightly to support custom quality/scale logic tailored for compression.
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) throw new Error('Canvas context unavailable');

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await page.render(renderContext as any).promise;

        // Compress to JPEG
        const imgDataUrl = canvas.toDataURL('image/jpeg', quality);
        const imgBuffer = await fetch(imgDataUrl).then(res => res.arrayBuffer());

        // 4. Embed into new PDF
        const embeddedImage = await newPdf.embedJpg(imgBuffer);
        const newPage = newPdf.addPage([viewport.width, viewport.height]);
        newPage.drawImage(embeddedImage, {
            x: 0,
            y: 0,
            width: viewport.width,
            height: viewport.height,
        });
    }

    return newPdf.save();
}
