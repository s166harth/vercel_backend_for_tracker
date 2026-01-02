import React, { useMemo, useState } from 'react';
import { ActivityChart, HorizontalBarChart } from './Charts';
import { StatsCard } from './StatsCard';
import { Search, Star, Book, Library } from 'lucide-react';
import { Modal } from './Modal';

export function BookInsights({ books }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBook, setSelectedBook] = useState(null);

    const genreStats = useMemo(() => {
        const stats = {};
        books.forEach(book => {
            const genreField = book['Genre'] || 'Unknown';
            // Split genres by comma, semicolon, or hashtags
            const genres = genreField.replace(/#/g, ',#').split(/[;,]+/).map(t => t.trim()).filter(Boolean);

            genres.forEach(genre => {
                stats[genre] = (stats[genre] || 0) + 1;
            });
        });

        // Sort by count
        const sortedEntries = Object.entries(stats).sort((a, b) => b[1] - a[1]);

        return {
            labels: sortedEntries.map(e => e[0]),
            values: sortedEntries.map(e => e[1])
        };
    }, [books]);

    const filteredBooks = useMemo(() => {
        return books.filter(book => {
            const title = book['Book Title'] || '';
            const author = book['Author'] || '';
            const term = searchTerm.toLowerCase();
            return title.toLowerCase().includes(term) || author.toLowerCase().includes(term);
        });
    }, [books, searchTerm]);

    const booksWithDates = useMemo(() => {
        return books.map(b => ({
            ...b,
            date: b.date || b['Publication Year'] || '2024'
        }));
    }, [books]);

    const totalPages = useMemo(() => {
        return books.reduce((acc, book) => {
            const pages = parseInt(book['Pages'] || book['Page Count'] || book['Length'] || 0);
            return acc + (isNaN(pages) ? 0 : pages);
        }, 0);
    }, [books]);

    return (
        <div className="insights-container">
            <div className="stats-grid">
                <StatsCard
                    title="Total Books Read"
                    value={books.length}
                    icon={Library}
                    color="purple"
                    trend={books.length > 0 ? 100 : 0} // Placeholder trend
                />
                <StatsCard
                    title="Total Pages Read"
                    value={totalPages.toLocaleString()}
                    icon={Book}
                    color="red"
                />
            </div>

            <div className="charts-grid">
                <div className="chart-card" style={{ height: 'auto', minHeight: '400px' }}>
                    <div className="chart-header">
                        <h3 className="chart-title">Genre Distribution</h3>
                    </div>
                    {/* Horizontal Bar Chart automatically handles its own height */}
                    <HorizontalBarChart
                        labels={genreStats.labels}
                        values={genreStats.values}
                        label="Books"
                        color="#dc2626"
                    />
                </div>
                <div className="chart-card">
                    <div className="chart-header">
                        <h3 className="chart-title">Books Read Over Time</h3>
                    </div>
                    <ActivityChart data={booksWithDates} />
                </div>
            </div>

            <div className="list-section">
                <div className="list-filters">
                    <h3 className="chart-title">Reading List</h3>
                    <div className="search-box">
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search books..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>

                <div className="books-grid">
                    {filteredBooks.map((book, idx) => (
                        <div
                            key={idx}
                            className="book-card"
                            onClick={() => setSelectedBook(book)}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <div>
                                <h4 style={{ color: 'var(--primary)', marginBottom: '0.25rem' }}>{book['Book Title']}</h4>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>by {book['Author']}</p>
                            </div>
                            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{
                                    fontSize: '0.75rem',
                                    background: 'rgba(220, 38, 38, 0.1)',
                                    color: '#ef4444',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '0.25rem'
                                }}>
                                    {book['Genre']}
                                </span>
                                {book['My Rating'] && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24' }}>
                                        <Star size={14} fill="#fbbf24" />
                                        <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>{book['My Rating']}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Modal
                isOpen={!!selectedBook}
                onClose={() => setSelectedBook(null)}
                title={selectedBook?.['Book Title'] || 'Book Details'}
            >
                {selectedBook && (
                    <div className="detailed-view">
                        {Object.entries(selectedBook).map(([key, value]) => {
                            if (key === 'id' || key === 'collection' || value === '') return null;
                            const isUrl = typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'));
                            return (
                                <div className="detail-row" key={key}>
                                    <div className="detail-label">{key}</div>
                                    <div className="detail-value">
                                        {isUrl ? (
                                            <a href={value} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                                                {value}
                                            </a>
                                        ) : (
                                            String(value)
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Modal>
        </div>
    );
}
