import React from 'react';
import { Star, Music, Disc } from 'lucide-react';

export function AlbumInsights({ albums }) {
    if (!albums || albums.length === 0) {
        return (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                No album reviews found.
            </div>
        );
    }

    // Display the most recent album, assuming the first one is the latest
    const latestAlbum = albums[0];

    return (
        <div className="insights-container" style={{ paddingTop: 0 }}>
            <div className="chart-card" style={{ padding: '1.5rem' }}>
                <div className="chart-header" style={{ marginBottom: '1.5rem' }}>
                    <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Disc size={22} />
                        Latest Album Review
                    </h3>
                </div>
                <div className="detailed-view">
                    {Object.entries(latestAlbum).map(([key, value]) => {
                        if (key === 'id' || key === 'collection' || !value) return null;

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
            </div>
        </div>
    );
}
