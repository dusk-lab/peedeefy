import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Layout.css';

const getToolName = (path: string) => {
    if (path.includes('/merge')) return 'Merge PDF';
    if (path.includes('/split')) return 'Split PDF';
    if (path.includes('/compress')) return 'Compress PDF';
    if (path.includes('/organize')) return 'Organize PDF';
    if (path.includes('/images-to-pdf')) return 'Images to PDF';
    if (path.includes('/pdf-to-images')) return 'PDF to Images';
    return '';
};

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    return (
        <div className="layout-wrapper">
            {/* Header */}
            <header className="navbar">
                <div className="navbar-container">
                    <div className="flex items-center gap-2">
                        <Link to="/" className="navbar-brand">
                            <span className="brand-icon">⚡</span>
                            <span>Peedeefy</span>
                        </Link>
                        {/* Dynamic Breadcrumb */}
                        {location.pathname !== '/' && (
                            <div className="hidden md:flex items-center text-text-secondary">
                                <span>&nbsp;&nbsp;&gt;&nbsp;&nbsp;</span>
                                <span className="font-semibold text-text-primary">
                                    {getToolName(location.pathname)}
                                </span>
                            </div>
                        )}
                    </div>
                    <nav className="navbar-links hidden md:flex">
                        <Link to="/" className="nav-link">Tools</Link>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="main-content">
                {children}
            </main>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-container">
                    <p>&copy; {new Date().getFullYear()} <a href="https://dusk-lab.github.io/main-website" target='_blank' rel='noopener noreferrer' className="footer-link">Dusk Labs</a>. Privacy first. No uploads.</p>
                </div>
            </footer>
        </div>
    );
};
