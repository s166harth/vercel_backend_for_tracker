import React, { useState } from 'react';
import { Star, Music, Disc, Tag } from 'lucide-react';
import { Modal } from './Modal';

export function AlbumInsights({ albums }) {
    const [selectedAlbum, setSelectedAlbum] = useState(null);

    if (!albums || albums.length === 0) {
        return (
            <div className="empty-state">
                No album reviews found.
            </div>
        );
    }

    return (
        <div className="insights-container" style={{ paddingTop: 0 }}>
            <div className="albums-grid">
                {albums.map((album, idx) => (
                    <div
                        key={idx}
                        className="album-card"
                        onClick={() => setSelectedAlbum(album)}
                    >
                        <h4 className="album-title">{album['Album']}</h4>
                        <p className="album-artist">by {album['Artist']}</p>
                        <div className="album-meta">
                            <div className="album-genre-tag">
                                <Tag size={14} />
                                <span>{album['Genre']}</span>
                            </div>
                            <div className="album-rating">
                                <Star size={14} />
                                <span>{album['My Rating']}</span>
                            </div>
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
