import React, { useState, useEffect, useCallback } from 'react';
import Masonry from 'react-masonry-css';
import { Image } from 'lucide-react';
// No ImageUpload component for Pinterest style
// No Carousel for Pinterest style

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

    // Define breakpoints for masonry columns
    const breakpointColumnsObj = {
        default: 4,
        1100: 3,
        700: 2,
        500: 1
    };

    return (
        <div className="gallery-container" style={{ padding: '1rem' }}>
            <h2 style={{color: 'var(--text-main)', marginBottom: '1.5rem'}}>Image Gallery</h2>

            {loading && <p>Loading images...</p>}
            {error && <p style={{ color: 'var(--error)' }}>Error fetching images: {error}</p>}

            {!loading && images.length === 0 && (
                <p style={{ color: 'var(--text-muted)' }}>No images found. Upload one to get started!</p>
            )}

            {!loading && images.length > 0 && (
                <Masonry
                    breakpointCols={breakpointColumnsObj}
                    className="my-masonry-grid"
                    columnClassName="my-masonry-grid_column"
                >
                    {images.map(image => (
                        <div key={image.id} className="gallery-item" style={{
                            backgroundColor: 'var(--bg-card)',
                            borderRadius: '0.75rem',
                            border: '1px solid var(--border-color)',
                            overflow: 'hidden',
                            marginBottom: '1rem', // Spacing between items
                            breakInside: 'avoid' // Prevent breaking inside item
                        }}>
                            {image.url ? (
                                <img src={image.url} alt={image.title} style={{
                                    width: '100%',
                                    height: 'auto', // Auto height for masonry
                                    display: 'block'
                                }} />
                            ) : (
                                <div style={{ height: '200px', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Image size={40} color="#666" />
                                </div>
                            )}
                            <div className="gallery-item-info" style={{ padding: '0.75rem' }}>
                                <h4 style={{ color: 'var(--text-main)', margin: 0, fontSize: '0.9rem' }}>
                                    {image.title}
                                </h4>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0.25rem 0 0 0' }}>
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

// Add some basic CSS for masonry layout
// This would ideally go into a CSS file, but for quick integration, inline is fine.
const masonryStyles = `
.my-masonry-grid {
  display: -webkit-box; /* Not needed if autoprefixing */
  display: -ms-flexbox; /* Not needed if autoprefixing */
  display: flex;
  margin-left: -1rem; /* gutter size offset */
  width: auto;
}
.my-masonry-grid_column {
  padding-left: 1rem; /* gutter size */
  background-clip: padding-box;
}

/* Style your items */
.my-masonry-grid_column > div { /* change div to all children you're rendering */
  background: grey;
  margin-bottom: 1rem;
}
`;

// Inject styles into the head (for quick integration)
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = masonryStyles;
    document.head.appendChild(styleSheet);
}

