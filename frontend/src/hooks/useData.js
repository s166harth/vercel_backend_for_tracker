import { useState, useEffect } from 'react';

export function useData() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                // Use environment variable or fallback to production API
                const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://firestore-to-grafana-api.vercel.app';
                const response = await fetch(`${apiBase}/api/data`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const jsonData = await response.json();
                setData(jsonData);
            } catch (e) {
                setError(e);
                console.error("Failed to fetch data:", e);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    return { data, loading, error };
}
