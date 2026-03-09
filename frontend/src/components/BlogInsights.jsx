import React, { useState, useEffect } from 'react';
import { StatsCard } from './StatsCard';
import { PenTool, Calendar, ExternalLink } from 'lucide-react';

export function BlogInsights({ posts = [] }) {
    const [visibleCount, setVisibleCount] = useState(6);

    const handleShowMore = () => {
        setVisibleCount(prev => prev + 6);
    };

    const visiblePosts = posts.slice(0, visibleCount);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

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
                            className="blog-card"
                        >
                            {post.thumbnail && (
                                <div className="blog-thumbnail" style={{
                                    backgroundImage: `url(${post.thumbnail})`,
                                }} />
                            )}

                            <h4 className="blog-title">
                                {post.title}
                            </h4>

                            <div className="blog-date">
                                <Calendar size={12} />
                                {formatDate(post.pubDate)}
                            </div>

                            <div className="blog-excerpt">
                                {stripHtml(post.description || post.content)}
                            </div>

                            <a
                                href={post.link}
                                target="_blank"
                                rel="noreferrer"
                                className="blog-link"
                            >
                                Read Article <ExternalLink size={16} />
                            </a>
                        </div>
                    ))}
                </div>

                {visibleCount < posts.length && (
                    <div className="show-more-container">
                        <button className="btn-show-more" onClick={handleShowMore}>
                            Show More
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
