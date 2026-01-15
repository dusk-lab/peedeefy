import React from 'react';
import { Link } from 'react-router-dom';

interface ToolLayoutProps {
    title: string;
    description?: string;
    children: React.ReactNode;
}

export const ToolLayout: React.FC<ToolLayoutProps> = ({ title, description, children }) => {
    return (
        <div className="tool-layout animate-fade-in">
            {/* Breadcrumb / Back Navigation */}
            <div className="mb-6 container text-sm">
                <Link to="/" className="text-text-secondary hover:text-primary transition-colors flex items-center gap-2">
                    &larr; Back to Tools
                </Link>
            </div>

            <div className="container max-w-4xl">
                <header className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-primary mb-2">{title}</h1>
                    {description && <p className="text-text-secondary">{description}</p>}
                </header>

                <main className="bg-surface rounded-lg shadow-md border border-border p-6 md:p-8 min-h-[400px]">
                    {children}
                </main>
            </div>
        </div>
    );
};
