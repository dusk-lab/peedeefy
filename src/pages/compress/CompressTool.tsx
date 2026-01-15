import React, { useState } from 'react';
import { ToolLayout } from '../../layouts/ToolLayout';
import { compressPDF } from '../../utils/compress';
import { downloadPDF } from '../../utils/pdf';
import '../../styles/Tools.css';

type CompressionLevel = 'extreme' | 'recommended' | 'less';

export const CompressTool: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [level, setLevel] = useState<CompressionLevel>('recommended');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState<string>('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type !== 'application/pdf') {
                setError('Please select a valid PDF file.');
                return;
            }
            setFile(selectedFile);
            setError(null);
            setProgress('');
        }
    };

    const handleCompress = async () => {
        if (!file) return;
        setIsProcessing(true);
        setError(null);
        setProgress('Compressing pages... this may take a moment.');

        try {
            let quality = 0.7;
            let scale = 1.0;

            switch (level) {
                case 'extreme':
                    quality = 0.5;
                    scale = 0.8; // Reduce resolution slightly for extreme
                    break;
                case 'recommended':
                    quality = 0.7;
                    scale = 1.0;
                    break;
                case 'less':
                    quality = 0.9;
                    scale = 1.0;
                    break;
            }

            const compressedPdf = await compressPDF(file, quality, scale);

            // Calculate savings (mock, since we have the blob)
            const originalSize = file.size;
            const newSize = compressedPdf.byteLength;
            const savings = ((originalSize - newSize) / originalSize * 100).toFixed(0);

            setProgress(`Done! Reduced by ${savings}%`);

            downloadPDF(compressedPdf, `compressed-${file.name}`);
        } catch (err) {
            console.error(err);
            setError('Failed to compress PDF. The file might be corrupted or password protected.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolLayout title="Compress PDF" description="Reduce file size while maintaining quality">
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
                        <div className="drop-icon">🗜️</div>
                        <div className="text-center">
                            <p className="drop-text">Select a PDF to compress</p>
                        </div>
                    </label>
                ) : (
                    <div className="flex flex-col gap-8 max-w-2xl mx-auto">
                        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm text-center">
                            <div className="text-4xl mb-2">📄</div>
                            <h3 className="font-bold text-lg mb-1">{file.name}</h3>
                            <p className="text-sm text-text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            <button
                                onClick={() => { setFile(null); setProgress(''); }}
                                className="text-primary text-sm mt-4 hover:underline"
                            >
                                Change File
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                onClick={() => setLevel('extreme')}
                                className={`p-4 rounded-xl border text-left transition-all ${level === 'extreme'
                                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                        : 'border-border bg-surface hover:border-primary/50'
                                    }`}
                            >
                                <div className="font-bold mb-1">Extreme</div>
                                <div className="text-xs text-text-muted">Low quality, high compression</div>
                            </button>

                            <button
                                onClick={() => setLevel('recommended')}
                                className={`p-4 rounded-xl border text-left transition-all ${level === 'recommended'
                                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                        : 'border-border bg-surface hover:border-primary/50'
                                    }`}
                            >
                                <div className="font-bold mb-1">Recommended</div>
                                <div className="text-xs text-text-muted">Good quality, good compression</div>
                            </button>

                            <button
                                onClick={() => setLevel('less')}
                                className={`p-4 rounded-xl border text-left transition-all ${level === 'less'
                                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                        : 'border-border bg-surface hover:border-primary/50'
                                    }`}
                            >
                                <div className="font-bold mb-1">Less</div>
                                <div className="text-xs text-text-muted">High quality, low compression</div>
                            </button>
                        </div>

                        {error && (
                            <div className="text-error bg-red-50 p-3 rounded-md border border-red-100 text-center">
                                {error}
                            </div>
                        )}

                        {progress && !isProcessing && (
                            <div className="text-green-600 bg-green-50 p-3 rounded-md border border-green-100 text-center font-medium">
                                {progress}
                            </div>
                        )}

                        <button
                            onClick={handleCompress}
                            disabled={isProcessing}
                            className="btn-primary w-full py-4 text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? 'Compressing PDF...' : 'Compress PDF'}
                        </button>
                    </div>
                )}
            </div>
        </ToolLayout>
    );
};
