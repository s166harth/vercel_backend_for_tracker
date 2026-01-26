import React, { useMemo, useState, useEffect } from 'react';
import { useData } from './hooks/useData';
import { Layout } from './components/Layout';
import { StatsCard } from './components/StatsCard';
import { ActivityChart, DistributionChart } from './components/Charts';
import { ArticleInsights } from './components/ArticleInsights';
import { BookInsights } from './components/BookInsights';
import { BlogInsights } from './components/BlogInsights';
import { MusicInsights } from './components/MusicInsights';
import { Gallery } from './components/Gallery';
import { BookOpen, FileText, PenTool, Library } from 'lucide-react';
import { Modal } from './components/Modal';
import './styles/dashboard.css';
import './styles/modal.css';
import './styles/buttons.css';

function App() {
  const { data, loading, error } = useData();
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedDashboardItem, setSelectedDashboardItem] = useState(null);

  // Theme State: 'theme-red' (default), 'theme-green', 'theme-blue'
  const [currentTheme, setCurrentTheme] = useState('theme-red');

  // Apply theme to body
  useEffect(() => {
    document.body.className = currentTheme;
  }, [currentTheme]);

  // Fetch Blog Posts
  const [blogPosts, setBlogPosts] = useState([]);
  useEffect(() => {
    async function fetchBlogPosts() {
      try {
        const response = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://siddharthsagar.substack.com/feed');
        const data = await response.json();
        if (data.status === 'ok') {
          setBlogPosts(data.items);
        }
      } catch (err) {
        console.error("Error fetching blog posts:", err);
      }
    }
    fetchBlogPosts();
  }, []);

  const stats = useMemo(() => {
    if (!data) return { article: 0, book: 0, painting: 0, writeup: 0, album: 0, total: 0 };
    return {
      article: data.article?.length || 0,
      book: data.book?.length || 0,
      // Removed painting from stats
      writeup: data.writeup?.length || 0,
      album: data.album?.length || 0,
      total: (data.article?.length || 0) + (data.book?.length || 0) + (data.painting?.length || 0) + (data.writeup?.length || 0) + (data.album?.length || 0)
    };
  }, [data]);

  const allItems = useMemo(() => {
    if (!data) return [];
    let items = [];
    if (data.article) items = [...items, ...data.article.map(i => ({ ...i, type: 'article' }))];
    if (data.book) items = [...items, ...data.book.map(i => ({ ...i, type: 'book' }))];
    // Removed painting from allItems
    if (data.writeup) items = [...items, ...data.writeup.map(i => ({ ...i, type: 'writeup' }))];
    if (data.album) items = [...items, ...data.album.map(i => ({ ...i, type: 'album' }))];

    // Sort by date if available
    return items.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [data]);

  if (loading) {
    return (
      <div className="loading-screen" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: 'var(--primary)',
        fontSize: '1.5rem'
      }}>
        Loading Interface...
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen" style={{ padding: '2rem', color: 'var(--error)' }}>
        <h2>Error loading data</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeView) {
      case 'articles':
        return <ArticleInsights articles={data.article || []} />;

      case 'books':
        return <BookInsights books={data.book || []} />;
      
      case 'gallery':
        return <Gallery />;

      case 'blogs':
        return <BlogInsights posts={blogPosts} />;

      case 'music':
        return <MusicInsights albums={data.album || []} />;

      // Removed paintings case

      case 'dashboard':
      default:
        return (
          <>
            <div className="dashboard-grid">
              <StatsCard
                title="Articles"
                value={stats.article}
                icon={FileText}
                color="blue"
                trend={12}
              />
              <StatsCard
                title="Total Books"
                value={stats.book}
                icon={Library}
                color="green"
                trend={5}
              />
              {/* Removed Paintings StatsCard */}
              <StatsCard
                title="Total Blogs"
                value={blogPosts.length}
                icon={PenTool}
                color="pink"
              />
            </div>

            <div className="charts-section">
              <div className="chart-card">
                <div className="chart-header">
                  <h3 className="chart-title">Activity Over Time</h3>
                </div>
                <ActivityChart data={allItems} />
              </div>
              <div className="chart-card">
                <div className="chart-header">
                  <h3 className="chart-title">Content Distribution</h3>
                </div>
                <DistributionChart counts={stats} />
              </div>
            </div>

            <div className="recent-items-section" style={{ marginTop: '2rem' }}>
              <h3 className="chart-title" style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Recent Activity</h3>
              <div className="recent-list">
                {allItems.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="recent-item"
                    onClick={() => setSelectedDashboardItem(item)}
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      padding: '1rem',
                      marginBottom: '0.5rem',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.backgroundColor = 'var(--bg-card)'; }}
                  >
                    <div>
                      <span className="badge" style={{
                        marginRight: '1rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        backgroundColor: 'rgba(220, 38, 38, 0.1)',
                        color: 'var(--primary)',
                        border: '1px solid rgba(220, 38, 38, 0.2)'
                      }}>
                        {item.type.toUpperCase()}
                      </span>
                      <span>{item['Article Title'] || item['Book Title'] || item['title'] || item['Writeup Title'] || 'Untitled'}</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{item.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <Layout
      activeView={activeView}
      onNavigate={setActiveView}
      currentTheme={currentTheme}
      onThemeChange={setCurrentTheme}
    >
      {renderContent()}

      <Modal
        isOpen={!!selectedDashboardItem}
        onClose={() => setSelectedDashboardItem(null)}
        title={selectedDashboardItem?.['Article Title'] || selectedDashboardItem?.['Book Title'] || selectedDashboardItem?.['title'] || 'Item Details'}
      >
        {selectedDashboardItem && (
          <div className="detailed-view">
            {Object.entries(selectedDashboardItem).map(([key, value]) => {
              if (key === 'id' || key === 'collection' || key === 'type' || value === '') return null;

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
    </Layout>
  );
}

export default App;
