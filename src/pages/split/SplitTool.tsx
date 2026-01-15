import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { ToolLayout } from '../../layouts/ToolLayout';
import { extractPages, downloadPDF } from '../../utils/pdf';
import { parsePageRange, isValidRangeFormat } from '../../utils/ranges';
import '../../styles/Tools.css';

export const SplitTool: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [pageCount, setPageCount] = useState<number>(0);
    const [rangeInput, setRangeInput] = useState('');
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
            setError(null);

            // Load PDF to get page count
            try {
                const arrayBuffer = await selectedFile.arrayBuffer();
                const pdf = await PDFDocument.load(arrayBuffer);
                setPageCount(pdf.getPageCount());
            } catch (err) {
                console.error(err);
                setError('Failed to load PDF. It might be corrupted or password protected.');
                setFile(null);
            }
        }
    };

    const handleExtract = async () => {
        if (!file || !rangeInput) return;

        if (!isValidRangeFormat(rangeInput)) {
            setError('Invalid format. Use numbers and ranges like "1-3, 5".');
            return;
        }

        const indices = parsePageRange(rangeInput, pageCount);
        if (indices.length === 0) {
            setError('No valid pages selected within the document range.');
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const newPdfBytes = await extractPages(file, indices);
            downloadPDF(newPdfBytes, `extracted-pages.pdf`);
        } catch (err) {
            console.error(err);
            setError('Failed to extract pages.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolLayout title="Split PDF" description="Extract specific pages from your document">
            <div className="tool-container">

                {/* Upload / File Display */}
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
                            <p className="drop-text">Select a PDF file to split</p>
                        </div>
                    </label>
                ) : (
                    <div className="bg-surface border border-border rounded-lg p-6 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="text-2xl">📄</div>
                                <div>
                                    <h3 className="font-bold">{file.name}</h3>
                                    <p className="text-sm text-text-muted">{pageCount} pages • {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <button onClick={() => { setFile(null); setPageCount(0); setRangeInput(''); }} className="text-primary hover:underline text-sm">
                                Change File
                            </button>
                        </div>

                        <div className="border-t border-border pt-4">
                            <label className="block text-sm font-bold mb-2 text-text-primary">Page Ranges to Extract</label>
                            <input
                                type="text"
                                className="w-full p-3 border border-border rounded-md bg-background focus:outline-none focus:border-primary transition-colors"
                                placeholder="e.g. 1-3, 5, 8-10"
                                value={rangeInput}
                                onChange={(e) => setRangeInput(e.target.value)}
                            />
                            <p className="text-xs text-text-muted mt-2">
                                Enter page numbers or ranges separated by commas.
                                {rangeInput && (
                                    <span className="ml-2 text-primary">
                                        Using {parsePageRange(rangeInput, pageCount).length} pages.
                                    </span>
                                )}
                            </p>
                        </div>

                        {error && (
                            <div className="text-error text-sm bg-red-50 p-3 rounded-md border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end pt-2">
                            <button
                                className="btn-primary"
                                onClick={handleExtract}
                                disabled={!rangeInput || isProcessing}
                            >
                                {isProcessing ? 'Processing...' : 'Download Extracted PDF'}
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </ToolLayout>
    );
};
