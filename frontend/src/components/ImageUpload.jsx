import React, { useState } from 'react';

export function ImageUpload({ onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file to upload.');
            return;
        }

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);

        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://firestore-to-grafana-api.vercel.app';
            const response = await fetch(`${apiBase}/api/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Upload failed');
            }

            const result = await response.json();
            console.log('Upload successful:', result);

            // Reset form
            setFile(null);
            setTitle('');
            e.target.reset();


            // Notify parent component
            if (onUploadSuccess) {
                onUploadSuccess();
            }

        } catch (err) {
            setError(err.message);
            console.error('Upload error:', err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="upload-form-container" style={{
            padding: '1.5rem',
            backgroundColor: 'var(--bg-card)',
            borderRadius: '0.75rem',
            border: '1px solid var(--border-color)',
            marginBottom: '2rem'
        }}>
            <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Upload New Image</h3>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="title" style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Image Title (Optional)</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={handleTitleChange}
                        placeholder="e.g., 'Sunset over the mountains'"
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-main)',
                            color: 'var(--text-main)'
                        }}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="file" style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Image File</label>
                    <input
                        type="file"
                        id="file"
                        onChange={handleFileChange}
                        accept="image/png, image/jpeg, image/gif"
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            borderRadius: '0.5rem',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-main)',
                            color: 'var(--text-main)'
                        }}
                    />
                </div>
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Upload'}
                </button>
                {error && <p style={{ color: 'var(--error)', marginTop: '1rem' }}>Error: {error}</p>}
            </form>
        </div>
    );
}
