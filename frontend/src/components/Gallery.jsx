import React, { useState, useEffect, useCallback } from 'react';
import { ImageUpload } from './ImageUpload';
import { Image } from 'lucide-react';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // Import carousel styles

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

    return (
        <div className="gallery-container">
            <ImageUpload onUploadSuccess={fetchImages} />

            <h2 style={{color: 'var(--text-main)', marginBottom: '1.5rem'}}>Image Gallery</h2>

            {loading && <p>Loading images...</p>}
            {error && <p style={{ color: 'var(--error)' }}>Error fetching images: {error}</p>}

            {!loading && images.length === 0 && (
                <p style={{ color: 'var(--text-muted)' }}>No images found. Upload one to get started!</p>
            )}

            {!loading && images.length > 0 && (
                <Carousel
                    showArrows={true}
                    infiniteLoop={true}
                    useKeyboardArrows={true}
                    autoPlay={true}
                    interval={5000}
                    showThumbs={false}
                    dynamicHeight={false}
                    className="image-carousel"
                    style={{ maxWidth: '800px', margin: '0 auto' }}
                >
                    {images.map(image => (
                        <div key={image.id} style={{
                            backgroundColor: 'var(--bg-card)',
                            borderRadius: '0.75rem',
                            border: '1px solid var(--border-color)',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '500px' // Fixed height for carousel items
                        }}>
                            {image.url ? (
                                <img src={image.url} alt={image.title} style={{
                                    maxWidth: '100%',
                                    maxHeight: '80%',
                                    objectFit: 'contain', // Use contain to show full image
                                    display: 'block',
                                    margin: 'auto'
                                }} />
                            ) : (
                                <div style={{ height: '100%', width: '100%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Image size={40} color="#666" />
                                </div>
                            )}
                            <p className="legend" style={{
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                color: 'white',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.25rem',
                                fontSize: '1rem',
                                position: 'absolute',
                                bottom: '10px',
                                margin: 0
                            }}>
                                {image.title}
                            </p>
                        </div>
                    ))}
                </Carousel>
            )}
        </div>
    );
}
