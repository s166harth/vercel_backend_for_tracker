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
            const genres = genreField.replace(/#/g, ',#').split(/[;,]+/).map(t => t.trim()).filter(Boolean);

            genres.forEach(genre => {
                stats[genre] = (stats[genre] || 0) + 1;
            });
        });

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
                    trend={books.length > 0 ? 100 : 0}
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
                        >
                            <div>
                                <h4 className="book-title">{book['Book Title']}</h4>
                                <p className="book-author">by {book['Author']}</p>
                            </div>
                            <div className="book-meta">
                                <span className="book-genre">{book['Genre']}</span>
                                {book['My Rating'] && (
                                    <div className="book-rating">
                                        <Star size={14} fill="#fbbf24" />
                                        <span>{book['My Rating']}</span>
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
                                            <a href={value} target="_blank" rel="noreferrer" className="link-primary">
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
