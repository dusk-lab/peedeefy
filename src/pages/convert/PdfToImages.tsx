import React, { useState } from 'react';
import JSZip from 'jszip';
import { ToolLayout } from '../../layouts/ToolLayout';
import { loadPDFForPreview, renderPageToImage } from '../../utils/preview';
import '../../styles/Tools.css';

export const PdfToImagesTool: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState('');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus('');
        }
    };

    const handleConvert = async () => {
        if (!file) return;
        setIsProcessing(true);
        setStatus('Loading PDF...');

        try {
            const { pageCount, pdf } = await loadPDFForPreview(file);
            const zip = new JSZip();

            for (let i = 1; i <= pageCount; i++) {
                setStatus(`Converting page ${i} of ${pageCount}...`);
                const dataUrl = await renderPageToImage(pdf, i, 1.5); // High quality
                // Remove header "data:image/jpeg;base64,"
                const base64Data = dataUrl.split(',')[1];
                zip.file(`page-${i}.jpg`, base64Data, { base64: true });
            }

            setStatus('Zipping...');
            const content = await zip.generateAsync({ type: 'blob' });

            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${file.name.replace('.pdf', '')}-images.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setStatus('Done!');
        } catch (err) {
            console.error(err);
            setStatus('Error during conversion.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolLayout title="PDF to Images" description="Convert each page to an image">
            <div className="tool-container">
                {!file ? (
                    <label className="drop-zone">
                        <input type="file" accept=".pdf" className="hidden" onChange={handleFileChange} style={{ display: 'none' }} />
                        <div className="drop-icon">📄</div>
                        <div className="text-center">
                            <p className="drop-text">Select PDF to convert</p>
                        </div>
                    </label>
                ) : (
                    <div className="bg-surface border border-border rounded-lg p-6 text-center">
                        <div className="text-4xl mb-4">📄</div>
                        <h3 className="font-bold text-lg mb-4">{file.name}</h3>
                        <button className="btn-primary" onClick={handleConvert} disabled={isProcessing}>
                            {isProcessing ? 'Processing... ' : 'Convert to Images (ZIP)'}
                        </button>
                        {status && <p className="mt-4 text-text-muted text-sm">{status}</p>}
                        {!isProcessing && (
                            <button onClick={() => setFile(null)} className="block mt-4 w-full text-sm text-text-secondary hover:underline">
                                Change File
                            </button>
                        )}
                    </div>
                )}
            </div>
        </ToolLayout>
    );
};
