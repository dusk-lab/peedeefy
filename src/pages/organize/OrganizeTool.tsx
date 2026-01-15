import React, { useState } from 'react';
import { ToolLayout } from '../../layouts/ToolLayout';
import { loadPDFForPreview, renderPageToImage } from '../../utils/preview';
import { modifyPdfPages, downloadPDF } from '../../utils/pdf';
import '../../styles/Tools.css';

export const OrganizeTool: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [pages, setPages] = useState<{ index: number, image: string }[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type !== 'application/pdf') {
                setError('Please select a valid PDF file.');
                return;
            }

            setFile(selectedFile);
            setPages([]);
            setError(null);
            setIsProcessing(true);

            try {
                const { pageCount, pdf } = await loadPDFForPreview(selectedFile);

                // Render thumbnails
                const newPages = [];
                for (let i = 1; i <= pageCount; i++) {
                    const image = await renderPageToImage(pdf, i, 0.3); // Low scale for thumbnails
                    newPages.push({ index: i - 1, image });
                }
                setPages(newPages);
            } catch (err) {
                console.error(err);
                setError('Failed to load PDF preview.');
                setFile(null);
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const movePage = (currentIndex: number, direction: -1 | 1) => {
        if (currentIndex + direction < 0 || currentIndex + direction >= pages.length) return;
        const newPages = [...pages];
        const temp = newPages[currentIndex];
        newPages[currentIndex] = newPages[currentIndex + direction];
        newPages[currentIndex + direction] = temp;
        setPages(newPages);
    };

    const deletePage = (indexToRemove: number) => {
        setPages(prev => prev.filter((_, i) => i !== indexToRemove));
    };

    const handleSave = async () => {
        if (!file || pages.length === 0) return;
        setIsProcessing(true);
        try {
            const pageIndices = pages.map(p => p.index);
            const newPdfBytes = await modifyPdfPages(file, pageIndices);
            downloadPDF(newPdfBytes, 'organized-document.pdf');
        } catch (err) {
            console.error(err);
            setError('Failed to save PDF.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolLayout title="Reorder PDF" description="Rearrange or delete pages">
            <div className="tool-container">
                {!file ? (
                    <label className="drop-zone">
                        <input
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                        <div className="drop-icon">📄</div>
                        <div className="text-center">
                            <p className="drop-text">Select a PDF to organize</p>
                        </div>
                    </label>
                ) : (
                    <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-center bg-surface border-b border-border pb-4">
                            <div>
                                <h3 className="font-bold">{file.name}</h3>
                                <p className="text-sm text-text-muted">{pages.length} pages remaining</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => { setFile(null); setPages([]); }} className="text-sm text-text-secondary hover:text-primary">Cancel</button>
                                <button onClick={handleSave} className="btn-primary" disabled={isProcessing || pages.length === 0}>
                                    {isProcessing ? 'Saving...' : 'Download PDF'}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="text-error bg-red-50 p-3 rounded-md border border-red-100 mb-4">
                                {error}
                            </div>
                        )}

                        {/* Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {pages.map((page, i) => (
                                <div key={`${page.index}-${i}`} className="relative group bg-background border border-border rounded-lg overflow-hidden transition-all hover:shadow-md">
                                    <div className="aspect-[1/1.4] relative">
                                        <img src={page.image} alt={`Page ${page.index + 1}`} className="w-full h-full object-contain bg-gray-100" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button onClick={() => movePage(i, -1)} disabled={i === 0} className="p-2 bg-white rounded-full text-black hover:bg-gray-200 disabled:opacity-50">⬅️</button>
                                            <button onClick={() => movePage(i, 1)} disabled={i === pages.length - 1} className="p-2 bg-white rounded-full text-black hover:bg-gray-200 disabled:opacity-50">➡️</button>
                                        </div>
                                    </div>
                                    <div className="p-2 flex justify-between items-center text-xs border-t border-border bg-surface">
                                        <span className="text-text-muted">Pg {page.index + 1}</span>
                                        <button onClick={() => deletePage(i)} className="text-error hover:text-red-700 font-bold">✕ DEL</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </ToolLayout>
    );
};
