import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Layout.css';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="layout-wrapper">
            {/* Header */}
            <header className="navbar">
                <div className="navbar-container">
                    <Link to="/" className="navbar-brand">
                        <span className="brand-icon">⚡</span>
                        <span>Peedeefy</span>
                    </Link>
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
