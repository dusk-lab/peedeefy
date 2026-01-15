import React, { useState } from 'react';
import { ToolLayout } from '../../layouts/ToolLayout';
import { imagesToPDF } from '../../utils/images';
import { downloadPDF } from '../../utils/pdf';
import { MdCloudUpload, MdImage, MdArrowUpward, MdArrowDownward, MdDelete } from 'react-icons/md';
import '../../styles/Tools.css';

export const ImagesToPdfTool: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files).filter(
                f => f.type === 'image/jpeg' || f.type === 'image/png'
            );
            setFiles(prev => [...prev, ...selectedFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const moveFile = (index: number, direction: 1 | -1) => {
        if (index + direction < 0 || index + direction >= files.length) return;
        const newFiles = [...files];
        const temp = newFiles[index];
        newFiles[index] = newFiles[index + direction];
        newFiles[index + direction] = temp;
        setFiles(newFiles);
    };

    const handleConvert = async () => {
        if (files.length === 0) return;
        setIsProcessing(true);
        try {
            const pdfBytes = await imagesToPDF(files);
            downloadPDF(pdfBytes, 'images-converted.pdf');
        } catch (err) {
            console.error(err);
            alert('Failed to convert images.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolLayout title="Images to PDF" description="Convert JPG & PNG images to PDF">
            <div className="tool-container">

                <label className="drop-zone">
                    <input
                        type="file"
                        accept="image/jpeg, image/png"
                        multiple
                        className="hidden"
                        onChange={handleFileInput}
                        style={{ display: 'none' }}
                    />
                    <MdCloudUpload className="drop-icon text-6xl mb-4 text-primary" />
                    <div className="text-center">
                        <p className="drop-text">Select Images (JPG, PNG)</p>
                    </div>
                </label>

                {files.length > 0 && (
                    <div className="file-list">
                        {files.map((file, index) => (
                            <div key={`${file.name}-${index}`} className="file-item">
                                <div className="file-info">
                                    <MdImage className="text-2xl text-text-secondary" />
                                    <span className="file-name">{file.name}</span>
                                </div>
                                <div className="file-actions">
                                    <button onClick={() => moveFile(index, -1)} disabled={index === 0} className="action-btn"><MdArrowUpward/></button>
                                    <button onClick={() => moveFile(index, 1)} disabled={index === files.length - 1} className="action-btn"><MdArrowDownward/></button>
                                    <button onClick={() => removeFile(index)} className="action-btn delete"><MdDelete/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="tool-actions">
                    <button className="btn-primary" onClick={handleConvert} disabled={files.length === 0 || isProcessing}>
                        {isProcessing ? 'Converting...' : 'Convert to PDF'}
                    </button>
                </div>

            </div>
        </ToolLayout>
    );
};
