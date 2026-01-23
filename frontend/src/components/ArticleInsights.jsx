import React, { useMemo, useState } from 'react';
import { BarChart, ActivityChart } from './Charts';
import { Search, Tag } from 'lucide-react';
import { Modal } from './Modal';

export function ArticleInsights({ articles }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedArticle, setSelectedArticle] = useState(null);

    const tagStats = useMemo(() => {
        const stats = {};
        articles.forEach(article => {
            const topics = article['Field/Topics'] || '';
            // Handle hashtags as separators by adding a comma before them, then split
            const tags = topics.replace(/#/g, ',#').split(/[;,]+/).map(t => t.trim()).filter(Boolean);

            tags.forEach(tag => {
                stats[tag] = (stats[tag] || 0) + 1;
            });
        });

        // Top 10 tags
        const sortedTags = Object.entries(stats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        return {
            labels: sortedTags.map(t => t[0]),
            values: sortedTags.map(t => t[1])
        };
    }, [articles]);

    const filteredArticles = useMemo(() => {
        return articles.filter(article => {
            const title = article['Article Title'] || '';
            const topics = article['Field/Topics'] || '';
            const term = searchTerm.toLowerCase();
            return title.toLowerCase().includes(term) || topics.toLowerCase().includes(term);
        });
    }, [articles, searchTerm]);

    // Enhance articles with formatted dates for ActivityChart
    const articlesWithDates = useMemo(() => {
        return articles.map(a => {
            let date = a['Publication Date'] || a['Date Added'];
            if (!date || isNaN(new Date(date).getTime())) {
                date = '2024-01-01'; // Fallback for invalid or missing dates
            }
            return {
                ...a,
                date: date
            };
        });
    }, [articles]);

    return (
        <div className="insights-container">
            <div className="charts-grid">
                <div className="chart-card">
                    <div className="chart-header">
                        <h3 className="chart-title">Popular Topics</h3>
                    </div>
                    <BarChart labels={tagStats.labels} values={tagStats.values} label="Articles per Topic" color="#f87171" />
                </div>
                <div className="chart-card">
                    <div className="chart-header">
                        <h3 className="chart-title">Articles Over Time</h3>
                    </div>
                    <ActivityChart data={articlesWithDates} />
                </div>
            </div>

            <div className="list-section">
                <div className="list-filters">
                    <h3 className="chart-title">Article Library</h3>
                    <div className="search-box">
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>

                <div className="articles-grid">
                    {filteredArticles.map((article, idx) => (
                        <div
                            key={idx}
                            className="article-card"
                            onClick={() => setSelectedArticle(article)}
                            style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '0.5rem',
                                padding: '1rem',
                                transition: 'all 0.2s',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{article['Article Title']}</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                                {(article['Field/Topics'] || '').replace(/#/g, ',#').split(/[;,]+/).map(t => t.trim()).filter(Boolean).slice(0, 3).map((tag, i) => (
                                    <span key={i} style={{
                                        fontSize: '0.75rem',
                                        padding: '0.25rem 0.5rem',
                                        background: 'rgba(252, 165, 165, 0.1)',
                                        color: 'var(--text-muted)',
                                        borderRadius: '0.25rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem'
                                    }}>
                                        <Tag size={12} />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Modal
                isOpen={!!selectedArticle}
                onClose={() => setSelectedArticle(null)}
                title={selectedArticle?.['Article Title'] || 'Article Details'}
            >
                {selectedArticle && (
                    <div className="detailed-view">
                        {Object.entries(selectedArticle).map(([key, value]) => {
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
