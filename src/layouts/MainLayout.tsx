import React from 'react';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen bg-background text-text-primary">
            {/* Header */}
            <header className="bg-surface border-b border-border shadow-sm sticky top-0 z-10">
                <div className="container h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-primary">Peedeefy</span>
                    </div>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-text-secondary">
                        <a href="#" className="hover:text-primary transition-colors">Tools</a>
                        <a href="#" className="hover:text-primary transition-colors">About</a>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container py-8">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-surface border-t border-border mt-auto">
                <div className="container py-8 text-center text-sm text-text-muted">
                    <p>&copy; {new Date().getFullYear()} <a href="https://dusk-lab.github.io/main-website" target='_blank' rel='noopener noreferrer'>Dusk Labs</a>. Privacy first. No uploads.</p>
                </div>
            </footer>
        </div>
    );
};
