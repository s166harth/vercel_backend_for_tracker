import React, { useState, useEffect, useMemo } from 'react';
import { StatsCard } from './StatsCard';
import { ActivityChart, HorizontalBarChart } from './Charts';
import { Music, Disc, Mic2, PlayCircle, ExternalLink } from 'lucide-react';
import { AlbumInsights } from './AlbumInsights';

export function MusicInsights({ albums }) {
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
                const artistRes = await fetch(
                    `https://ws.audioscrobbler.com/2.0/?method=user.getweeklyartistchart&user=${username}&api_key=${apiKey}&format=json`
                );
                const artistData = await artistRes.json();

                if (!artistData.weeklyartistchart) throw new Error("Invalid artist data");

                const artistList = artistData.weeklyartistchart.artist;
                const top10Artists = artistList.slice(0, 10);
                setTopArtists(top10Artists);

                const trackRes = await fetch(
                    `https://ws.audioscrobbler.com/2.0/?method=user.getweeklytrackchart&user=${username}&api_key=${apiKey}&format=json`
                );
                const trackData = await trackRes.json();
                if (trackData.weeklytrackchart) {
                    const tracks = trackData.weeklytrackchart.track;
                    const total = tracks.reduce((acc, t) => acc + parseInt(t.playcount), 0);
                    setTotalScrobbles(total);
                }

                const genreMap = {};

                await Promise.all(top10Artists.map(async (artist) => {
                    try {
                        const tagsRes = await fetch(
                            `https://ws.audioscrobbler.com/2.0/?method=artist.gettoptags&artist=${encodeURIComponent(artist.name)}&api_key=${apiKey}&format=json`
                        );
                        const tagsData = await tagsRes.json();

                        if (tagsData.toptags && tagsData.toptags.tag) {
                            const topTags = tagsData.toptags.tag.slice(0, 3);

                            topTags.forEach(tag => {
                                const genreName = tag.name;
                                if (!genreMap[genreName]) genreMap[genreName] = 0;
                                genreMap[genreName] += parseInt(artist.playcount);
                            });
                        }
                    } catch (e) {
                        console.warn(`Failed to fetch tags for ${artist.name}`);
                    }
                }));

                const genreArray = Object.entries(genreMap)
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 15);

                setTopGenres(genreArray);

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

    const artistChartData = useMemo(() => {
        return {
            labels: topArtists.map(a => a.name),
            values: topArtists.map(a => parseInt(a.playcount))
        };
    }, [topArtists]);

    const genreChartData = useMemo(() => {
        return {
            labels: topGenres.map(g => g.name),
            values: topGenres.map(g => g.count)
        };
    }, [topGenres]);

    if (!apiKey) {
        return (
            <div className="music-placeholder">
                <Music size={48} />
                <h3>Last.fm Integration Required</h3>
                <p>Please add VITE_LASTFM_API_KEY to your environment variables.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="loading-state">
                Loading Music Charts...
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-state">
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
                    <div className="chart-container">
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
                    <div className="chart-container">
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
                    <div className="stats-table-container">
                        <table className="stats-table">
                            <tbody>
                                <tr>
                                    <td className="stats-table-label">Total Scrobbles</td>
                                    <td className="stats-table-value">{parseInt(userInfo.playcount).toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td className="stats-table-label">Artist Count</td>
                                    <td className="stats-table-value">{parseInt(userInfo.artist_count).toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td className="stats-table-label">Track Count</td>
                                    <td className="stats-table-value">{parseInt(userInfo.track_count).toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td className="stats-table-label">Album Count</td>
                                    <td className="stats-table-value">{parseInt(userInfo.album_count).toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td className="stats-table-label">Registered Since</td>
                                    <td className="stats-table-value">
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

            <div className="album-insights-section">
                <h2 className="chart-title">Album Reviews</h2>
                <AlbumInsights albums={albums} />
            </div>
        </div>
    );
}
