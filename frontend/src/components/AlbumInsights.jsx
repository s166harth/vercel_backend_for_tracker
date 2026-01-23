import React, { useState } from 'react';
import { Star, Music, Disc, Tag } from 'lucide-react';
import { Modal } from './Modal';

export function AlbumInsights({ albums }) {
    const [selectedAlbum, setSelectedAlbum] = useState(null);

    if (!albums || albums.length === 0) {
        return (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                No album reviews found.
            </div>
        );
    }

    return (
        <div className="insights-container" style={{ paddingTop: 0 }}>
            <div className="albums-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                {albums.map((album, idx) => (
                    <div
                        key={idx}
                        className="album-card"
                        onClick={() => setSelectedAlbum(album)}
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
                        <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>{album['Album']}</h4>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>by {album['Artist']}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            <Tag size={14} />
                            <span style={{ fontSize: '0.8rem' }}>{album['Genre']}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#facc15' /* yellow-400 */ }}>
                            <Star size={14} />
                            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{album['My Rating']}</span>
                        </div>
                    </div>
                ))}
            </div>

            <Modal
                isOpen={!!selectedAlbum}
                onClose={() => setSelectedAlbum(null)}
                title={selectedAlbum?.['Album'] || 'Album Details'}
            >
                {selectedAlbum && (
                    <div className="detailed-view">
                        {Object.entries(selectedAlbum).map(([key, value]) => {
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
                )}
            </Modal>
        </div>
    );
}
