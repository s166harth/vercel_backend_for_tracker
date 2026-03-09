import React, { useState, useEffect, useCallback } from 'react';
import Masonry from 'react-masonry-css';
import { Image } from 'lucide-react';

export function Gallery() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchImages = useCallback(async () => {
        setLoading(true);
        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://firestore-to-grafana-api.vercel.app';
            const response = await fetch(`${apiBase}/api/gallery`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const imageData = await response.json();
            setImages(imageData);
        } catch (e) {
            setError(e.message);
            console.error("Failed to fetch gallery data:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    const breakpointColumnsObj = {
        default: 4,
        1100: 3,
        700: 2,
        500: 1
    };

    return (
        <div className="gallery-container">
            <h2 className="gallery-title">Image Gallery</h2>

            {loading && <p className="loading-text">Loading images...</p>}
            {error && <p className="error-text">Error fetching images: {error}</p>}

            {!loading && images.length === 0 && (
                <p className="empty-text">No images found. Upload one to get started!</p>
            )}

            {!loading && images.length > 0 && (
                <Masonry
                    breakpointCols={breakpointColumnsObj}
                    className="my-masonry-grid"
                    columnClassName="my-masonry-grid_column"
                >
                    {images.map(image => (
                        <div key={image.id} className="gallery-item">
                            {image.url ? (
                                <img src={image.url} alt={image.title} className="gallery-image" />
                            ) : (
                                <div className="gallery-placeholder">
                                    <Image size={40} />
                                </div>
                            )}
                            <div className="gallery-item-info">
                                <h4>
                                    {image.title}
                                </h4>
                                <p>
                                    {new Date(image.date).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </Masonry>
            )}
        </div>
    );
}
