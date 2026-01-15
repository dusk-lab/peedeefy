import React, { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { ToolLayout } from '../../layouts/ToolLayout';
import { extractPages, downloadPDF } from '../../utils/pdf';
import { parsePageRange, isValidRangeFormat } from '../../utils/ranges';
import '../../styles/Tools.css';

export const SplitTool: React.FC = () => {
    // State
    const [file, setFile] = useState<File | null>(null);
    const [pageCount, setPageCount] = useState<number>(0);
    const [rangeInput, setRangeInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Result State
    const [splitPdf, setSplitPdf] = useState<Uint8Array | null>(null); // Store result
    const [filename, setFilename] = useState('');
    const [placeholderName, setPlaceholderName] = useState('');

    // Update placeholder time
    useEffect(() => {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
        setPlaceholderName(`peefeefy_split_${dateStr}_${timeStr}.pdf`);
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type !== 'application/pdf') {
                setError('Please select a valid PDF file.');
                return;
            }

            setFile(selectedFile);
            setError(null);
            setSplitPdf(null); // Reset result

            try {
                const arrayBuffer = await selectedFile.arrayBuffer();
                const pdf = await PDFDocument.load(arrayBuffer);
                setPageCount(pdf.getPageCount());
            } catch (err) {
                console.error(err);
                setError('Failed to load PDF.');
                setFile(null);
            }
        }
    };

    const handleSplit = async () => {
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
            setSplitPdf(newPdfBytes);
        } catch (err) {
            console.error(err);
            setError('Failed to extract pages.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = async () => {
        if (!splitPdf) return;
        const finalName = filename.trim() || placeholderName;
        downloadPDF(splitPdf, finalName);
    };

    const handleEdit = () => {
        setSplitPdf(null);
    };

    const handleReset = () => {
        setFile(null);
        setPageCount(0);
        setRangeInput('');
        setSplitPdf(null);
        setFilename('');
        setError(null);
        // Update placeholder
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
        setPlaceholderName(`peefeefy_split_${dateStr}_${timeStr}.pdf`);
    };

    // View: Success Screen
    if (splitPdf) {
        return (
            <ToolLayout title="Split PDF" description="Success! Your pages have been extracted.">
                <div className="max-w-2xl mx-auto text-center space-y-8">
                    <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200">
                        <span className="text-2xl mr-2">✅</span>
                        <span className="font-semibold">PDF Successfully Split!</span>
                    </div>

                    <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
                        <h3 className="font-bold text-lg mb-4">Download Options</h3>

                        <div className="flex flex-col items-center justify-center mb-6">
                            <button onClick={handleDownload} disabled={isProcessing} className="p-6 border-2 border-primary bg-primary/5 rounded-xl hover:bg-primary/10 transition-all text-left flex flex-col justify-between disabled:opacity-50 min-w-[300px] shadow-sm hover:shadow-md">
                                <div>
                                    <div className="font-bold text-xl text-text-primary mb-1">Download PDF</div>
                                    <div className="text-sm text-text-muted">Save your extracted pages.</div>
                                </div>
                                <div className="mt-6 text-primary font-bold text-lg flex items-center justify-between">
                                    <span>{isProcessing ? 'Processing...' : 'Download Now'}</span>
                                    <span className="text-2xl">⬇️</span>
                                </div>
                            </button>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <button onClick={handleEdit} className="text-text-secondary hover:text-primary underline">Edit Previous File</button>
                            <span className="text-border">|</span>
                            <button onClick={handleReset} className="text-text-secondary hover:text-primary underline">Split New PDF</button>
                        </div>
                    </div>
                </div>
            </ToolLayout>
        );
    }

    // View: Split Layout (Upload + Options)
    return (
        <ToolLayout title="Split PDF" description="Extract specific pages from your document">
            <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-200px)] min-h-[500px]">

                {/* Section 1: Drag & Drop (Left/Top) */}
                <div className="flex-1 flex flex-col gap-4">
                    {!file ? (
                        <label className="drop-zone flex-1">
                            <input type="file" accept=".pdf" className="hidden" onChange={handleFileChange} style={{ display: 'none' }} />
                            <div className="drop-icon text-4xl mb-4">📄</div>
                            <div className="text-center">
                                <p className="drop-text font-bold text-lg">Select PDF to Split</p>
                                <p className="drop-subtext text-sm text-text-muted mt-2">or click to browse</p>
                            </div>
                        </label>
                    ) : (
                        <div className="bg-surface border border-border rounded-lg p-6 flex flex-col gap-4 flex-1 justify-center items-center text-center relative max-h-[300px] md:max-h-full">
                            <div className="text-4xl mb-2">📄</div>
                            <h3 className="font-bold text-lg">{file.name}</h3>
                            <p className="text-sm text-text-muted">{pageCount} pages • {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            <button onClick={handleReset} className="text-primary hover:underline text-sm font-bold mt-2">Change File</button>
                        </div>
                    )}
                </div>

                {/* Section 2: Options Panel (Right/Bottom) */}
                <div className="flex-1 bg-surface rounded-xl border border-border p-6 flex flex-col gap-6">
                    <div>
                        <h3 className="font-bold text-lg mb-4 border-b border-border pb-2">Split Options</h3>

                        <label className="block text-sm font-semibold mb-2 text-text-primary">Page Ranges to Extract</label>
                        <input
                            type="text"
                            className="w-full p-3 border border-border rounded-md bg-background focus:outline-none focus:border-primary transition-colors"
                            placeholder="e.g. 1-3, 5, 8-10"
                            value={rangeInput}
                            onChange={(e) => setRangeInput(e.target.value)}
                        />
                        <p className="text-xs text-text-muted mt-2">
                            Enter page numbers separated by commas (e.g. 1, 3, 5-10)
                            {rangeInput && (
                                <span className="ml-2 text-primary">
                                    • {parsePageRange(rangeInput, pageCount).length} pages selected
                                </span>
                            )}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2 text-text-secondary">Output Filename (Optional)</label>
                        <input
                            type="text"
                            className="w-full p-3 border border-border rounded bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            placeholder={placeholderName}
                            value={filename}
                            onChange={(e) => setFilename(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="text-error text-sm bg-red-50 p-3 rounded-md border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="mt-auto">
                        <button
                            className="btn-primary w-full py-3 font-bold text-lg shadow-md hover:shadow-lg transition-all"
                            onClick={handleSplit}
                            disabled={!file || !rangeInput || isProcessing}
                        >
                            {isProcessing ? 'Processing...' : 'Split PDF'}
                        </button>
                    </div>
                </div>

            </div>
        </ToolLayout>
    );
};
