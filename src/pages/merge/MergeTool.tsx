import React, { useState, useEffect } from 'react';
import { ToolLayout } from '../../layouts/ToolLayout';
import { mergePDFs, downloadPDF } from '../../utils/pdf';
import { compressPDF } from '../../utils/compress'; // Reuse compression logic
import '../../styles/Tools.css';

interface PDFFile {
    id: string;
    file: File;
}

export const MergeTool: React.FC = () => {
    // State
    const [files, setFiles] = useState<PDFFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [mergedPdf, setMergedPdf] = useState<Uint8Array | null>(null); // Store result
    const [filename, setFilename] = useState('');
    const [placeholderName, setPlaceholderName] = useState('');

    // Update placeholder time
    useEffect(() => {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
        setPlaceholderName(`peefeefy_merged_${dateStr}_${timeStr}.pdf`);
    }, []);

    // Drag & Drop Handlers
    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => { setIsDragging(false); };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) addFiles(Array.from(e.dataTransfer.files));
    };
    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) addFiles(Array.from(e.target.files));
    };

    const addFiles = (newFiles: File[]) => {
        const pdfFiles = newFiles
            .filter(f => f.type === 'application/pdf')
            .map(f => ({
                id: Math.random().toString(36).substr(2, 9),
                file: f
            }));
        setFiles(prev => [...prev, ...pdfFiles]);
    };

    const removeFile = (id: string) => setFiles(prev => prev.filter(f => f.id !== id));
    const moveFile = (index: number, direction: -1 | 1) => {
        if (index + direction < 0 || index + direction >= files.length) return;
        const newFiles = [...files];
        const temp = newFiles[index];
        newFiles[index] = newFiles[index + direction];
        newFiles[index + direction] = temp;
        setFiles(newFiles);
    };

    // Action Handlers
    const handleMerge = async () => {
        if (files.length < 2) return;
        setIsProcessing(true);
        try {
            const result = await mergePDFs(files.map(f => f.file));
            setMergedPdf(result);
        } catch (error) {
            console.error('Failed to merge PDFs', error);
            alert('Failed to merge PDFs.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = async (quality?: 'original' | 'compressed') => {
        if (!mergedPdf) return;

        const finalName = filename.trim() || placeholderName;

        if (quality === 'original') {
            downloadPDF(mergedPdf, finalName);
        } else if (quality === 'compressed') {
            // Experimental: Compress the *created* PDF
            setIsProcessing(true);
            try {
                const blob = new Blob([mergedPdf as BlobPart], { type: 'application/pdf' });
                const file = new File([blob], finalName, { type: 'application/pdf' });
                // Use "Recommended" settings: 0.7 quality
                const compressedBytes = await compressPDF(file, 0.7, 1.0);
                downloadPDF(compressedBytes, finalName.replace('.pdf', '_compressed.pdf'));
            } catch (err) {
                console.error(err);
                alert('Compression failed.');
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const handleReset = () => {
        setFiles([]);
        setMergedPdf(null);
        setFilename('');
        // Update placeholder again
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
        setPlaceholderName(`peefeefy_merged_${dateStr}_${timeStr}.pdf`);
    };

    // View: Success Screen
    if (mergedPdf) {
        return (
            <ToolLayout title="Merge PDFs" description="Success! Your files have been combined.">
                <div className="max-w-2xl mx-auto text-center space-y-8">
                    <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200">
                        <span className="text-2xl mr-2">✅</span>
                        <span className="font-semibold">PDF Successfully Merged!</span>
                    </div>

                    <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
                        <h3 className="font-bold text-lg mb-4">Download Options</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <button onClick={() => handleDownload('original')} className="p-4 border border-primary bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors text-left">
                                <div className="font-bold text-text-primary">Original Quality</div>
                                <div className="text-sm text-text-muted">Best for printing. Max file size.</div>
                                <div className="mt-2 text-primary font-bold">Download ⬇️</div>
                            </button>
                            <button onClick={() => handleDownload('compressed')} className="p-4 border border-border bg-surface rounded-lg hover:border-primary transition-colors text-left" disabled={isProcessing}>
                                <div className="font-bold text-text-primary">Compressed</div>
                                <div className="text-sm text-text-muted">Smaller size. Good for sharing.</div>
                                <div className="mt-2 text-text-secondary font-bold">{isProcessing ? 'Compressing...' : 'Compress & Download ⬇️'}</div>
                            </button>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <button onClick={() => setMergedPdf(null)} className="text-text-secondary hover:text-primary underline">Edit Previous Files</button>
                            <span className="text-border">|</span>
                            <button onClick={handleReset} className="text-text-secondary hover:text-primary underline">Merge New PDFs</button>
                        </div>
                    </div>
                </div>
            </ToolLayout>
        );
    }

    // View: Split Layout (Upload + List)
    return (
        <ToolLayout title="Merge PDFs" description="Combine multiple PDFs into one document">
            <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-200px)] min-h-[500px]">

                {/* Section 1: Drag & Drop (Top on mobile, Left on Desktop) */}
                <div className="flex-1 flex flex-col gap-4">
                    <label
                        className={`drop-zone flex-1 ${isDragging ? 'active' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <input type="file" accept=".pdf" multiple className="hidden" onChange={handleFileInput} style={{ display: 'none' }} />
                        <div className="drop-icon text-4xl mb-4">📄</div>
                        <div className="text-center">
                            <p className="drop-text font-bold text-lg">Drag & drop PDF files</p>
                            <p className="drop-subtext text-sm text-text-muted mt-2">or click to browse</p>
                        </div>
                    </label>

                </div>

                {/* Section 2: Preview / File List (Bottom on mobile, Right on Desktop) */}
                <div className="flex-1 flex flex-col gap-4">

                    {/* File List Panel */}
                    <div className="flex-1 bg-surface rounded-xl border border-border overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-border bg-background/50 backdrop-blur">
                            <h3 className="font-bold text-text-primary">Selected Files ({files.length})</h3>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {files.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-text-muted opacity-50">
                                    <div className="text-4xl mb-2">📋</div>
                                    <p>No files selected</p>
                                </div>
                            ) : (
                                files.map((file, index) => (
                                    <div key={file.id} className="file-item bg-background p-3 rounded-lg border border-border flex items-center justify-between group hover:border-primary/50 transition-colors">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-8 h-8 rounded bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">PDF</div>
                                            <div className="min-w-0">
                                                <p className="font-medium truncate text-sm">{file.file.name}</p>
                                                <p className="text-xs text-text-muted">{(file.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => moveFile(index, -1)} disabled={index === 0} className="p-1 hover:bg-gray-100 rounded text-text-secondary disabled:opacity-30">⬆️</button>
                                            <button onClick={() => moveFile(index, 1)} disabled={index === files.length - 1} className="p-1 hover:bg-gray-100 rounded text-text-secondary disabled:opacity-30">⬇️</button>
                                            <button onClick={() => removeFile(file.id)} className="p-1 hover:bg-red-50 text-red-500 rounded ml-1">✕</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Controls Panel (Moved here) */}
                    <div className="bg-surface p-4 rounded-xl border border-border flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-text-secondary">Output Filename (Optional)</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-border rounded bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                placeholder={placeholderName}
                                value={filename}
                                onChange={(e) => setFilename(e.target.value)}
                            />
                        </div>

                        <button
                            className="btn-primary w-full py-3 font-bold text-lg shadow-md hover:shadow-lg transition-all"
                            onClick={handleMerge}
                            disabled={files.length < 2 || isProcessing}
                        >
                            {isProcessing ? 'Merging...' : 'Merge PDFs'}
                        </button>
                    </div>

                </div>

            </div>
        </ToolLayout>
    );
};
