import React, { useState } from 'react';
import { ToolLayout } from '../../layouts/ToolLayout';
import { mergePDFs, downloadPDF } from '../../utils/pdf';
import '../../styles/Tools.css';

interface PDFFile {
    id: string;
    file: File;
}

export const MergeTool: React.FC = () => {
    const [files, setFiles] = useState<PDFFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files) {
            addFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            addFiles(Array.from(e.target.files));
        }
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

    const removeFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const moveFile = (index: number, direction: -1 | 1) => {
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
            const mergedPdfBytes = await mergePDFs(files.map(f => f.file));
            downloadPDF(mergedPdfBytes, 'merged-document.pdf');
        } catch (error) {
            console.error('Failed to merge PDFs', error);
            alert('Failed to merge PDFs. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolLayout title="Merge PDFs" description="Combine multiple PDFs into one document">
            <div className="tool-container">

                {/* Upload Zone */}
                <label
                    className={`drop-zone ${isDragging ? 'active' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        accept=".pdf"
                        multiple
                        className="hidden"
                        onChange={handleFileInput}
                        style={{ display: 'none' }}
                        id="file-upload"
                    />
                    <div className="drop-icon">📄</div>
                    <div className="text-center">
                        <p className="drop-text">Drag & drop PDF files here</p>
                        <p className="drop-subtext">or click to select files</p>
                    </div>
                </label>

                {/* File List */}
                {files.length > 0 && (
                    <div className="file-list">
                        {files.map((file, index) => (
                            <div key={file.id} className="file-item">
                                <div className="file-info">
                                    <div className="file-icon">📄</div>
                                    <span className="file-name" title={file.file.name}>{file.file.name}</span>
                                    <span className="text-sm text-muted">
                                        ({(file.file.size / 1024 / 1024).toFixed(2)} MB)
                                    </span>
                                </div>
                                <div className="file-actions">
                                    <button
                                        className="action-btn"
                                        onClick={() => moveFile(index, -1)}
                                        disabled={index === 0}
                                        title="Move Up"
                                    >
                                        ⬆️
                                    </button>
                                    <button
                                        className="action-btn"
                                        onClick={() => moveFile(index, 1)}
                                        disabled={index === files.length - 1}
                                        title="Move Down"
                                    >
                                        ⬇️
                                    </button>
                                    <button
                                        className="action-btn delete"
                                        onClick={() => removeFile(file.id)}
                                        title="Remove"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className="tool-actions">
                    <button
                        className="btn-primary"
                        onClick={handleMerge}
                        disabled={files.length < 2 || isProcessing}
                    >
                        {isProcessing ? 'Merging...' : 'Merge PDFs'}
                    </button>
                </div>

            </div>
        </ToolLayout>
    );
};
