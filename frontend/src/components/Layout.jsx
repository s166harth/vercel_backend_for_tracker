import React, { useState } from 'react';
import { LayoutDashboard, BookOpen, Image, FileText, Palette, Menu, X, PenTool, Music } from 'lucide-react';
import { Modal } from './Modal';

export function Layout({ children, activeView, onNavigate, currentTheme, onThemeChange }) {
    const [profileOpen, setProfileOpen] = useState(false);
    const [themeOpen, setThemeOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const themes = [
        { id: 'theme-red', label: 'Snappy Red', color: '#dc2626', bg: '#0f0505' },
        { id: 'theme-green', label: 'Retro Green', color: '#10b981', bg: '#022c22' },
        { id: 'theme-blue', label: 'Neon Blue', color: '#3b82f6', bg: '#0f172a' },
    ];

    const navItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'gallery', icon: Image, label: 'Gallery' },
        { id: 'books', icon: BookOpen, label: 'Books' },
        { id: 'articles', icon: FileText, label: 'Articles' },
        { id: 'blogs', icon: PenTool, label: 'Blogs' },
        { id: 'music', icon: Music, label: 'Music' },
    ];

    return (
        <div className="app-layout">
            {/* Cockpit - Top Navigation Bar */}
            <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo">
                        <LayoutDashboard size={24} className="logo-icon" />
                        <span>All-Track</span>
                    </div>
                </div>

                {/* Navigation - Horizontal */}
                <nav className="sidebar-nav">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                className={`nav-item ${activeView === item.id ? 'active' : ''}`}
                                onClick={() => {
                                    onNavigate(item.id);
                                    setMobileMenuOpen(false);
                                }}
                                title={item.label}
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Right Side Actions */}
                <div className="cockpit-actions">
                    <button
                        className="aesthetic-btn variant-outline"
                        onClick={() => setThemeOpen(true)}
                        title="Change Aesthetic"
                    >
                        <Palette size={18} />
                        <span>Aesthetic</span>
                    </button>

                    <button className="aesthetic-btn variant-solid" onClick={() => setProfileOpen(true)}>
                        <div className="btn-avatar">SD</div>
                        <span>siddharthsagar2019@gmail.com</span>
                    </button>

                    {/* Mobile menu toggle */}
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        style={{ display: 'none' }}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </aside>

            {/* Sidebar Overlay for mobile */}
            <div
                className={`sidebar-overlay ${mobileMenuOpen ? 'visible' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
            />

            <main className="main-content">
                <div className="content-area">
                    {children}
                </div>
            </main>

            <Modal isOpen={profileOpen} onClose={() => setProfileOpen(false)} title="User Profile">
                <div className="profile-content">
                    <div className="profile-avatar">SD</div>
                    <h2 className="profile-email">siddharthsagar2019@gmail.com</h2>
                </div>
            </Modal>

            <Modal isOpen={themeOpen} onClose={() => setThemeOpen(false)} title="Select Aesthetic">
                <div className="theme-options">
                    {themes.map(theme => (
                        <button
                            key={theme.id}
                            className={`theme-option ${currentTheme === theme.id ? 'active' : ''}`}
                            onClick={() => {
                                onThemeChange(theme.id);
                                setThemeOpen(false);
                            }}
                        >
                            <div className="theme-preview" style={{
                                background: theme.bg,
                                borderColor: theme.color
                            }}>
                                <div className="theme-preview-dot" style={{ background: theme.color }}></div>
                            </div>
                            <span className="theme-label">{theme.label}</span>
                            {currentTheme === theme.id && <span className="theme-status">Active</span>}
                        </button>
                    ))}
                </div>
            </Modal>
        </div>
    );
}
