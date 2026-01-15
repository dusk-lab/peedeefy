// Imports
import React, { useState, useEffect } from 'react';
import { ToolLayout } from '../../layouts/ToolLayout';
import { mergePDFs, downloadPDF } from '../../utils/pdf';
import { loadPDFForPreview } from '../../utils/preview'; // For thumbnail generation
import { MdPictureAsPdf, MdDelete, MdArrowUpward, MdArrowDownward, MdAdd, MdCloudUpload, MdCheckCircle, MdSearch } from 'react-icons/md';
import '../../styles/Tools.css';

interface PDFFile {
    id: string;
    file: File;
    pageCount: number;
    preview?: string; // Data URL of first page
}

export const MergeTool: React.FC = () => {
    // State
    const [files, setFiles] = useState<PDFFile[]>([]);
    const [selectedFileId, setSelectedFileId] = useState<string | null>(null); // For large preview
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [mergedPdf, setMergedPdf] = useState<Uint8Array | null>(null);
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

    const addFiles = async (newFiles: File[]) => {
        setIsProcessing(true);
        const pdfFilesPromises = newFiles
            .filter(f => f.type === 'application/pdf')
            .map(async (f) => {
                // Load Info & Preview
                try {
                    const { pageCount, pdf } = await loadPDFForPreview(f);

                    // Generate Thumbnail of Page 1
                    const page = await pdf.getPage(1);
                    const viewport = page.getViewport({ scale: 0.5 }); // Small thumbnail
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    if (context) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        await page.render({ canvasContext: context, viewport } as any).promise;
                    }
                    const previewUrl = canvas.toDataURL();

                    return {
                        id: Math.random().toString(36).substr(2, 9),
                        file: f,
                        pageCount,
                        preview: previewUrl
                    };
                } catch {
                    return {
                        id: Math.random().toString(36).substr(2, 9),
                        file: f,
                        pageCount: 0
                    };
                }
            });

        const addedFiles = await Promise.all(pdfFilesPromises);
        setFiles(prev => [...prev, ...addedFiles]);

        // Auto-select the first added file if none selected
        if (!selectedFileId && addedFiles.length > 0) {
            setSelectedFileId(addedFiles[0].id);
        }
        setIsProcessing(false);
    };

    const removeFile = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setFiles(prev => prev.filter(f => f.id !== id));
        if (selectedFileId === id) setSelectedFileId(null);
    };

    const moveFile = (index: number, direction: -1 | 1, e: React.MouseEvent) => {
        e.stopPropagation();
        if (index + direction < 0 || index + direction >= files.length) return;
        const newFiles = [...files];
        const temp = newFiles[index];
        newFiles[index] = newFiles[index + direction];
        newFiles[index + direction] = temp;
        setFiles(newFiles);
    };

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

    const handleDownload = async () => {
        if (!mergedPdf) return;
        const finalName = filename.trim() || placeholderName;
        downloadPDF(mergedPdf, finalName);
    };

    const handleReset = () => {
        setFiles([]);
        setMergedPdf(null);
        setFilename('');
        setSelectedFileId(null);
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
        setPlaceholderName(`peefeefy_merged_${dateStr}_${timeStr}.pdf`);
    };

    // Success View
    if (mergedPdf) {
        return (
            <ToolLayout title="Merge PDFs" description="Success! Your files have been combined.">
                <div className="max-w-2xl mx-auto text-center space-y-8">
                    <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200 flex items-center justify-center gap-2">
                        <MdCheckCircle className="text-2xl" />
                        <span className="font-semibold">PDF Successfully Merged!</span>
                    </div>

                    <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
                        <h3 className="font-bold text-lg mb-4">Download Options</h3>

                        <div className="flex flex-col items-center justify-center mb-6">
                            <button onClick={() => handleDownload()} disabled={isProcessing} className="p-6 border-2 border-primary bg-primary/5 rounded-xl hover:bg-primary/10 transition-all text-left flex flex-col justify-between disabled:opacity-50 min-w-[300px] shadow-sm hover:shadow-md">
                                <div>
                                    <div className="font-bold text-xl text-text-primary mb-1">Download PDF</div>
                                    <div className="text-sm text-text-muted">Save your merged document.</div>
                                </div>
                                <div className="mt-6 text-primary font-bold text-lg flex items-center justify-between">
                                    <span>{isProcessing ? 'Processing...' : 'Download Now'}</span>
                                    <MdArrowDownward className="text-2xl"/>
                                </div>
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

    // Main Tool Layout (Side-by-Side Split)
    // Left: 75% (Preview + D&D), Right: 25% (List + Controls)
    return (
        <ToolLayout title="Merge PDFs" description="Combine multiple PDFs into one document">
            <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-200px)] min-h-[600px]">

                {/* Left Side (75%) */}
                <div className="w-full md:w-3/4 flex flex-col gap-4">
                    {/* Preview Area (Shows active file) */}
                    <div className="flex-1 bg-background rounded-xl border border-border flex flex-col items-center justify-center p-8 relative overflow-hidden bg-cover bg-center" style={{ backgroundImage: 'radial-gradient(#E4E4E7 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                        {files.length > 0 && selectedFileId ? (
                            <div className="relative shadow-2xl rounded max-h-full max-w-full flex items-center justify-center">
                                {files.find(f => f.id === selectedFileId)?.preview ? (
                                    <img src={files.find(f => f.id === selectedFileId)?.preview} alt="Preview" className="max-h-[500px] border border-border rounded shadow-lg object-contain" />
                                ) : (
                                    <div className="w-48 h-64 bg-white flex items-center justify-center text-text-muted">No Preview</div>
                                )}
                                <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">
                                    Page 1 of {files.find(f => f.id === selectedFileId)?.pageCount}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center opacity-50">
                                <MdSearch className="text-6xl text-text-muted mx-auto mb-2" />
                                <h3 className="text-xl font-bold text-text-secondary">Preview Area</h3>
                                <p className="text-text-muted">Select a file from the list to preview</p>
                            </div>
                        )}
                    </div>

                    {/* Drag & Drop Zone (Below Preview) */}
                    <label
                        className={`drop-zone h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-surface/50 transition-colors ${isDragging ? 'active' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <input type="file" accept=".pdf" multiple className="hidden" onChange={handleFileInput} style={{ display: 'none' }} />
                        <MdCloudUpload className="text-3xl mb-2 text-primary" />
                        <div className="text-center">
                            <p className="font-bold text-text-primary">Click to Add More Files</p>
                            <p className="text-xs text-text-muted">or drag and drop here</p>
                        </div>
                    </label>
                </div>

                {/* Right Side (25%) */}
                <div className="w-full md:w-1/4 flex flex-col gap-4">
                    {/* File List */}
                    <div className="flex-1 bg-surface rounded-xl border border-border flex flex-col overflow-hidden shadow-sm">
                        <div className="p-3 border-b border-border bg-background/50">
                            <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                                <MdPictureAsPdf /> Selected Files ({files.length})
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {files.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-text-muted opacity-50 p-4 text-center">
                                    <p className="text-sm">No files selected</p>
                                </div>
                            ) : (
                                files.map((file, index) => (
                                    <div
                                        key={file.id}
                                        onClick={() => setSelectedFileId(file.id)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedFileId === file.id ? 'bg-primary/5 border-primary ring-1 ring-primary' : 'bg-background border-border hover:border-primary/50'}`}
                                    >
                                        <div className="flex items-start gap-2 mb-2">
                                            <div className="min-w-0 flex-1">
                                                <p className="font-bold text-sm truncate" title={file.file.name}>{file.file.name}</p>
                                                <div className="flex items-center gap-2 text-xs text-text-secondary mt-1">
                                                    <span className="bg-gray-100 px-1 rounded">{file.pageCount} pgs</span>
                                                    <span>{(file.file.size / 1024 / 1024).toFixed(2)} MB</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-end gap-1 border-t border-border pt-2">
                                            <button onClick={(e) => moveFile(index, -1, e)} disabled={index === 0} className="p-1 hover:bg-gray-200 rounded text-text-secondary disabled:opacity-30"><MdArrowUpward size={14} /></button>
                                            <button onClick={(e) => moveFile(index, 1, e)} disabled={index === files.length - 1} className="p-1 hover:bg-gray-200 rounded text-text-secondary disabled:opacity-30"><MdArrowDownward size={14} /></button>
                                            <button onClick={(e) => removeFile(file.id, e)} className="p-1 hover:bg-red-50 text-red-500 rounded"><MdDelete size={14} /></button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="bg-surface p-4 rounded-xl border border-border flex flex-col gap-3 shadow-sm">
                        <div>
                            <label className="block text-xs font-semibold mb-1 text-text-secondary">Output Filename</label>
                            <input
                                type="text"
                                className="w-full p-2 text-sm border border-border rounded bg-background focus:border-primary outline-none"
                                placeholder={placeholderName}
                                value={filename}
                                onChange={(e) => setFilename(e.target.value)}
                            />
                        </div>

                        <button
                            className="btn-primary w-full py-3 font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            onClick={handleMerge}
                            disabled={files.length < 2 || isProcessing}
                        >
                            {isProcessing ? 'Merging...' : <>Merge PDFs <MdAdd className="text-xl" /></>}
                        </button>
                    </div>
                </div>

            </div>
        </ToolLayout>
    );
};
