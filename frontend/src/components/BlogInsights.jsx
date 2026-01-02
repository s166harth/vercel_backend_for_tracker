import React, { useState, useEffect } from 'react';
import { StatsCard } from './StatsCard';
import { PenTool, Calendar, ExternalLink } from 'lucide-react';

export function BlogInsights({ posts = [] }) {
    const [visibleCount, setVisibleCount] = useState(6);

    const handleShowMore = () => {
        setVisibleCount(prev => prev + 6);
    };

    const visiblePosts = posts.slice(0, visibleCount);

    // Format date helper
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Strip HTML helper
    const stripHtml = (html) => {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };




    return (
        <div className="insights-container">
            <div className="stats-grid">
                <StatsCard
                    title="Latest Post"
                    value={posts.length > 0 ? formatDate(posts[0].pubDate) : 'N/A'}
                    icon={Calendar}
                    color="red"
                />
                <StatsCard
                    title="Total Posts Fetched"
                    value={posts.length}
                    icon={PenTool}
                    color="blue"
                />
            </div>

            <div className="list-section">
                <div className="list-filters">
                    <h3 className="chart-title">Latest from Substack</h3>
                </div>

                <div className="articles-grid">
                    {visiblePosts.map((post, idx) => (
                        <div
                            key={idx}
                            className="book-card"
                            style={{
                                height: 'auto',
                                minHeight: '200px',
                                cursor: 'default',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            {post.thumbnail && (
                                <div style={{
                                    width: '100%',
                                    height: '150px',
                                    backgroundImage: `url(${post.thumbnail})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    borderRadius: '0.25rem',
                                    marginBottom: '1rem',
                                    flexShrink: 0
                                }} />
                            )}

                            <h4 style={{ color: 'var(--primary)', fontSize: '1.2rem', lineHeight: '1.4', marginBottom: '0.5rem' }}>
                                {post.title}
                            </h4>

                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <Calendar size={12} />
                                {formatDate(post.pubDate)}
                            </div>

                            <div style={{
                                fontSize: '0.95rem',
                                color: 'var(--text-main)',
                                lineHeight: '1.6',
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 4,
                                WebkitBoxOrient: 'vertical',
                                marginBottom: '1.5rem',
                                flex: 1
                            }}>
                                {stripHtml(post.description || post.content)}
                            </div>

                            <a
                                href={post.link}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: 'var(--primary)',
                                    borderRadius: '0.5rem',
                                    marginTop: 'auto',
                                    transition: 'all 0.2s',
                                    fontWeight: 600,
                                    textDecoration: 'none'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'var(--primary)';
                                    e.currentTarget.style.color = '#fff';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                    e.currentTarget.style.color = 'var(--primary)';
                                }}
                            >
                                Read Article <ExternalLink size={16} />
                            </a>
                        </div>
                    ))}
                </div>

                {visibleCount < posts.length && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                        <button
                            onClick={handleShowMore}
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--primary)',
                                color: 'var(--primary)',
                                padding: '0.75rem 2rem',
                                borderRadius: '2rem',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                transition: 'all 0.2s',
                                fontWeight: 500
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--primary)';
                                e.currentTarget.style.color = '#fff';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--primary)';
                            }}
                        >
                            Show More
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
