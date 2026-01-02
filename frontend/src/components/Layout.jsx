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
        { id: 'books', icon: BookOpen, label: 'Books' },
        { id: 'articles', icon: FileText, label: 'Articles' },
        { id: 'blogs', icon: PenTool, label: 'Blogs' },
        { id: 'music', icon: Music, label: 'Music' },
        { id: 'paintings', icon: Image, label: 'Paintings' },
    ];

    return (
        <div className="app-layout">
            {/* Mobile Sidebar Overlay */}
            <div
                className={`sidebar-overlay ${mobileMenuOpen ? 'visible' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
            />

            <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
                <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="logo">
                        <LayoutDashboard size={24} className="logo-icon" />
                        <span>All-Track</span>
                    </div>
                    {/* Close button for mobile sidebar */}
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setMobileMenuOpen(false)}
                        style={{ display: mobileMenuOpen ? 'flex' : 'none' }} // Only show inside sidebar on mobile
                    >
                        <X size={24} />
                    </button>
                </div>
                <nav className="sidebar-nav">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                className={`nav-item ${activeView === item.id ? 'active' : ''}`}
                                onClick={() => {
                                    onNavigate(item.id);
                                    setMobileMenuOpen(false); // Close on navigate
                                }}
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </aside>
            <main className="main-content">
                <header className="top-bar">
                    <div className="top-bar-header">
                        <button
                            className="mobile-menu-btn"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="page-title">{activeView.charAt(0).toUpperCase() + activeView.slice(1)}</h1>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {/* Aesthetic/Theme Switcher Button */}
                        <button
                            className="aesthetic-btn variant-outline"
                            onClick={() => setThemeOpen(true)}
                            title="Change Aesthetic"
                            style={{
                                borderColor: 'var(--primary)',
                                color: 'var(--primary)',
                                height: '40px',
                                padding: '0 1rem',
                                cursor: 'pointer'
                            }}
                        >
                            <Palette size={18} style={{ pointerEvents: 'none' }} />
                            <span style={{ pointerEvents: 'none' }}>Aesthetic</span>
                        </button>

                        {/* Custom Profile Button */}
                        <button className="aesthetic-btn variant-solid" onClick={() => setProfileOpen(true)}>
                            <div className="btn-avatar">SD</div>
                            <span style={{ fontWeight: 500 }}>siddharthsagar2019@gmail.com</span>
                        </button>
                    </div>
                </header>
                <div className="content-area">
                    {children}
                </div>
            </main>

            <Modal isOpen={profileOpen} onClose={() => setProfileOpen(false)} title="User Profile">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem' }}>
                    <div className="avatar" style={{ width: '100px', height: '100px', fontSize: '2rem', marginBottom: '1.5rem', boxShadow: '0 0 20px rgba(220, 38, 38, 0.3)' }}>SD</div>
                    <h2 style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>siddharthsagar2019@gmail.com</h2>
                </div>
            </Modal>

            <Modal isOpen={themeOpen} onClose={() => setThemeOpen(false)} title="Select Aesthetic">
                <div style={{ display: 'grid', gap: '1rem', padding: '0.5rem' }}>
                    {themes.map(theme => (
                        <button
                            key={theme.id}
                            onClick={() => {
                                onThemeChange(theme.id);
                                setThemeOpen(false);
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem',
                                background: 'var(--bg-card)',
                                border: `1px solid ${currentTheme === theme.id ? 'var(--primary)' : 'var(--border-color)'}`,
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                width: '100%'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = currentTheme === theme.id ? 'var(--primary)' : 'var(--border-color)'}
                        >
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: theme.bg,
                                border: `2px solid ${theme.color}`,
                                display: 'grid',
                                placeItems: 'center'
                            }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: theme.color }}></div>
                            </div>
                            <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{theme.label}</span>
                            {currentTheme === theme.id && <div style={{ marginLeft: 'auto', color: 'var(--primary)', fontWeight: 'bold' }}>Active</div>}
                        </button>
                    ))}
                </div>
            </Modal>
        </div>
    );
}
