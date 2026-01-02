import React, { useState, useEffect, useMemo } from 'react';
import { StatsCard } from './StatsCard';
import { ActivityChart, HorizontalBarChart } from './Charts';
import { Music, Disc, Mic2, PlayCircle, ExternalLink } from 'lucide-react';

export function MusicInsights() {
    const [topArtists, setTopArtists] = useState([]);
    const [topGenres, setTopGenres] = useState([]);
    const [totalScrobbles, setTotalScrobbles] = useState(0);
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const apiKey = import.meta.env.VITE_LASTFM_API_KEY;
    const username = 's166harth';

    useEffect(() => {
        async function fetchMusicData() {
            if (!apiKey) {
                setLoading(false);
                return;
            }

            try {
                // 1. Fetch Weekly Artist Chart
                const artistRes = await fetch(
                    `https://ws.audioscrobbler.com/2.0/?method=user.getweeklyartistchart&user=${username}&api_key=${apiKey}&format=json`
                );
                const artistData = await artistRes.json();

                if (!artistData.weeklyartistchart) throw new Error("Invalid artist data");

                const artistList = artistData.weeklyartistchart.artist;
                const top10Artists = artistList.slice(0, 10);
                setTopArtists(top10Artists);

                // Calculate Total Scrobbles directly from artist data (approximation of "active" listening)
                // Or fetch user.getWeeklyTrackChart just for the total count if needed.
                // For now, let's sum the artist playcounts as a proxy or just fetch recent tracks count if we want accuracy.
                // Actually, let's fetch track chart JUST for the stats count, but not display tracks.
                const trackRes = await fetch(
                    `https://ws.audioscrobbler.com/2.0/?method=user.getweeklytrackchart&user=${username}&api_key=${apiKey}&format=json`
                );
                const trackData = await trackRes.json();
                if (trackData.weeklytrackchart) {
                    // Sum of all tracks in the chart
                    // Note: Weekly track chart often paginates, but the top 1000 usually covers most listening.
                    // We can just use the provided attributes if available, or reduce.
                    const tracks = trackData.weeklytrackchart.track;
                    const total = tracks.reduce((acc, t) => acc + parseInt(t.playcount), 0);
                    setTotalScrobbles(total);
                }

                // 2. Fetch Tags for Top Artists to build Genre Heatmap
                // We'll process the top 10 artists
                const genreMap = {}; // { "Rock": 150, "Pop": 100 }

                await Promise.all(top10Artists.map(async (artist) => {
                    try {
                        const tagsRes = await fetch(
                            `https://ws.audioscrobbler.com/2.0/?method=artist.gettoptags&artist=${encodeURIComponent(artist.name)}&api_key=${apiKey}&format=json`
                        );
                        const tagsData = await tagsRes.json();

                        if (tagsData.toptags && tagsData.toptags.tag) {
                            // Take top 3 tags per artist
                            const topTags = tagsData.toptags.tag.slice(0, 3);

                            topTags.forEach(tag => {
                                const genreName = tag.name;
                                // Weight: The artist's playcount contributes to this genre
                                // We can split the playcount among the tags, or just add the full playcount to each (simple).
                                // Let's add full playcount to emphasize the vibe.
                                if (!genreMap[genreName]) genreMap[genreName] = 0;
                                genreMap[genreName] += parseInt(artist.playcount);
                            });
                        }
                    } catch (e) {
                        console.warn(`Failed to fetch tags for ${artist.name}`);
                    }
                }));

                // Convert map to array and sort
                const genreArray = Object.entries(genreMap)
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 15); // Top 15 Genres

                setTopGenres(genreArray);

                // 3. Fetch User Info (All Time Stats)
                const userRes = await fetch(
                    `https://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=${username}&api_key=${apiKey}&format=json`
                );
                const userData = await userRes.json();
                if (userData.user) {
                    setUserInfo(userData.user);
                }

            } catch (err) {
                console.error("Error fetching Last.fm data:", err);
                setError("Could not load music data.");
            } finally {
                setLoading(false);
            }
        }

        fetchMusicData();
    }, [apiKey]);


    // Format Data for Horizontal Bar Chart (Artists)
    const artistChartData = useMemo(() => {
        return {
            labels: topArtists.map(a => a.name),
            values: topArtists.map(a => parseInt(a.playcount))
        };
    }, [topArtists]);

    // Format Data for Horizontal Bar Chart (Genres)
    const genreChartData = useMemo(() => {
        return {
            labels: topGenres.map(g => g.name),
            values: topGenres.map(g => g.count)
        };
    }, [topGenres]);

    if (!apiKey) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '400px',
                color: 'var(--text-muted)',
                textAlign: 'center',
                gap: '1rem'
            }}>
                <Music size={48} />
                <h3>Last.fm Integration Required</h3>
                <p>Please add VITE_LASTFM_API_KEY to your environment variables.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', color: 'var(--text-muted)' }}>
                Loading Music Charts...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--error)' }}>
                {error}
            </div>
        );
    }

    return (
        <div className="insights-container">
            <div className="stats-grid">
                <StatsCard
                    title="Weekly Scrobbles"
                    value={totalScrobbles}
                    icon={Disc}
                    color="green"
                    trend={0}
                />
                <StatsCard
                    title="Top Artist"
                    value={topArtists.length > 0 ? topArtists[0].name : "N/A"}
                    icon={Mic2}
                    color="purple"
                />
            </div>

            <div className="charts-grid">
                <div className="chart-card" style={{ minHeight: '400px', overflow: 'hidden' }}>
                    <div className="chart-header">
                        <h3 className="chart-title">Top Artists (Last 7 Days)</h3>
                    </div>
                    <div style={{ position: 'relative', height: '350px', width: '100%' }}>
                        <HorizontalBarChart
                            labels={artistChartData.labels}
                            values={artistChartData.values}
                            label="Plays"
                            color="#a855f7"
                        />
                    </div>
                </div>

                <div className="chart-card" style={{ minHeight: '400px', overflow: 'hidden' }}>
                    <div className="chart-header">
                        <h3 className="chart-title">Top Genres</h3>
                    </div>
                    <div style={{ position: 'relative', height: '350px', width: '100%' }}>
                        <HorizontalBarChart
                            labels={genreChartData.labels}
                            values={genreChartData.values}
                            label="Score"
                            color="#f43f5e"
                        />
                    </div>
                </div>
            </div>

            {userInfo && (
                <div className="chart-card" style={{ marginTop: '1.5rem' }}>
                    <div className="chart-header">
                        <h3 className="chart-title">All Time Statistics</h3>
                    </div>
                    <div style={{ padding: '1rem', overflowX: 'auto' }}>
                        <table style={{
                            width: '100%',
                            minWidth: '300px', // Ensure it doesn't squish too much
                            borderCollapse: 'collapse',
                            color: 'var(--text-main)',
                            fontSize: '0.95rem'
                        }}>
                            <tbody>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Scrobbles</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>{parseInt(userInfo.playcount).toLocaleString()}</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Artist Count</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>{parseInt(userInfo.artist_count).toLocaleString()}</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Track Count</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>{parseInt(userInfo.track_count).toLocaleString()}</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Album Count</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>{parseInt(userInfo.album_count).toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Registered Since</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                        {new Date(userInfo.registered.unixtime * 1000).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
