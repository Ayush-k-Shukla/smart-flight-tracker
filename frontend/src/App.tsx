import axios from 'axios';
import { Clock, Plane, RefreshCw, Search, TrendingDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip } from 'recharts';
import './index.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [flights, setFlights] = useState<any[]>([]);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [insightData, setInsightData] = useState<Record<string, any>>({});
  const [historyData, setHistoryData] = useState<Record<string, any[]>>({});
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [originSearch, setOriginSearch] = useState('');
  const [destSearch, setDestSearch] = useState('');
  const [originSuggestions, setOriginSuggestions] = useState<any[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<any[]>([]);
  const [showOriginList, setShowOriginList] = useState(false);
  const [showDestList, setShowDestList] = useState(false);

  useEffect(() => {
    fetchFlights();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (originSearch && !origin) {
        fetchSuggestions(originSearch, setOriginSuggestions);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [originSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (destSearch && !destination) {
        fetchSuggestions(destSearch, setDestSuggestions);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [destSearch]);

  const fetchSuggestions = async (q: string, setter: (val: any[]) => void) => {
    try {
      const res = await axios.get(`${API_BASE}/flights/search-locations?q=${q}`);
      setter(res.data);
    } catch (e) {
      console.error('Failed to fetch suggestions', e);
    }
  };

  const fetchFlights = async () => {
    try {
      const res = await axios.get(`${API_BASE}/flights`);
      setFlights(res.data);
      // Fetch insights and history for each
      res.data.forEach((f: any) => {
        fetchInsight(f._id);
        fetchHistory(f._id);
      });
    } catch (e) {
      console.error('Failed to fetch flights', e);
    }
  };

  const fetchInsight = async (id: string, forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setInsightData(prev => {
          const newData = { ...prev };
          delete newData[id]; // Trigger loading state
          return newData;
        });
      }
      const res = await axios.get(`${API_BASE}/ai-insight/${id}${forceRefresh ? '?forceRefresh=true' : ''}`);
      setInsightData(prev => ({ ...prev, [id]: res.data }));
    } catch (e) {
      console.error('Failed to fetch insight', e);
    }
  };

  const fetchHistory = async (id: string) => {
    try {
      const res = await axios.get(`${API_BASE}/flights/${id}/history`);
      const formattedData = res.data.map((h: any) => ({
        name: new Date(h.fetchedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        price: h.price
      }));
      setHistoryData(prev => ({ ...prev, [id]: formattedData }));
    } catch (e) {
      console.error('Failed to fetch history', e);
    }
  };

  const addFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination || !date) return;
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/flights`, { origin, destination, departureDate: date });
      setOrigin(''); setDestination(''); setDate('');
      await fetchFlights();
      setOriginSearch(''); setDestSearch('');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.autocomplete-container')) {
        setShowOriginList(false);
        setShowDestList(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }} className="animate-fade-in">
        <h1 style={{ fontSize: '3rem', fontWeight: '800', background: 'linear-gradient(to right, #a8c0ff, #3f2b96)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Smart Flight Tracker
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>Powered by Gemini AI Insights</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '30px' }}>

        {/* Tracker Form */}
        <div className="glass-panel animate-fade-in" style={{ padding: '30px', height: 'fit-content' }}>
          <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Plane size={24} color="var(--accent)" /> Track Route
          </h2>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }} onSubmit={addFlight}>
            <div className="autocomplete-container" style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Origin City or Code"
                value={originSearch}
                onChange={e => {
                  setOriginSearch(e.target.value);
                  setOrigin(''); // Clear selection if user types
                  setShowOriginList(true);
                }}
                onFocus={() => setShowOriginList(true)}
                required
              />
              {showOriginList && (originSearch || originSuggestions.length > 0) && (
                <div className="glass-panel" style={{ 
                  position: 'absolute', 
                  top: '100%', 
                  left: 0, 
                  right: 0, 
                  zIndex: 100, 
                  marginTop: '5px', 
                  maxHeight: '200px', 
                  overflowY: 'auto', 
                  padding: '10px',
                  backgroundColor: 'rgba(15, 23, 42, 0.95)', // Solid dark background for readability
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)'
                }}>
                  {originSuggestions.length > 0 ? originSuggestions.map(s => (
                    <div
                      key={s.iata}
                      className="suggestion-item"
                      style={{ padding: '8px', cursor: 'pointer', borderRadius: '4px', borderBottom: '1px solid var(--glass-border)' }}
                      onClick={() => {
                        setOrigin(s.iata);
                        setOriginSearch(`${s.city} (${s.iata})`);
                        setShowOriginList(false);
                      }}
                    >
                      <div style={{ fontWeight: 'bold' }}>{s.city} ({s.iata})</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.name}</div>
                    </div>
                  )) : <div style={{ padding: '8px', color: 'var(--text-secondary)' }}>Searching...</div>}
                </div>
              )}
            </div>

            <div className="autocomplete-container" style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Destination City or Code"
                value={destSearch}
                onChange={e => {
                  setDestSearch(e.target.value);
                  setDestination('');
                  setShowDestList(true);
                }}
                onFocus={() => setShowDestList(true)}
                required
              />
              {showDestList && (destSearch || destSuggestions.length > 0) && (
                <div className="glass-panel" style={{ 
                  position: 'absolute', 
                  top: '100%', 
                  left: 0, 
                  right: 0, 
                  zIndex: 100, 
                  marginTop: '5px', 
                  maxHeight: '200px', 
                  overflowY: 'auto', 
                  padding: '10px',
                  backgroundColor: 'rgba(15, 23, 42, 0.95)', // Solid dark background for readability
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)'
                }}>
                  {destSuggestions.length > 0 ? destSuggestions.map(s => (
                    <div
                      key={s.iata}
                      className="suggestion-item"
                      style={{ padding: '8px', cursor: 'pointer', borderRadius: '4px', borderBottom: '1px solid var(--glass-border)' }}
                      onClick={() => {
                        setDestination(s.iata);
                        setDestSearch(`${s.city} (${s.iata})`);
                        setShowDestList(false);
                      }}
                    >
                      <div style={{ fontWeight: 'bold' }}>{s.city} ({s.iata})</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.name}</div>
                    </div>
                  )) : <div style={{ padding: '8px', color: 'var(--text-secondary)' }}>Searching...</div>}
                </div>
              )}
            </div>

            <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
            <button type="submit" className="btn" disabled={loading || !origin || !destination} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              {loading ? 'Adding...' : <><Search size={18} /> Start Tracking</>}
            </button>
          </form>
        </div>

        {/* Tracked Flights Dashboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }} className="animate-fade-in">
            <button
              onClick={() => setActiveTab('upcoming')}
              className="btn"
              style={{
                flex: 1,
                background: activeTab === 'upcoming' ? 'var(--accent)' : 'var(--glass-bg)',
                border: activeTab === 'upcoming' ? '1px solid var(--accent)' : '1px solid var(--glass-border)',
                color: activeTab === 'upcoming' ? 'white' : 'var(--text-secondary)'
              }}
            >
              New Tracking
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className="btn"
              style={{
                flex: 1,
                background: activeTab === 'past' ? 'var(--accent)' : 'var(--glass-bg)',
                border: activeTab === 'past' ? '1px solid var(--accent)' : '1px solid var(--glass-border)',
                color: activeTab === 'past' ? 'white' : 'var(--text-secondary)'
              }}
            >
              Past Tracking
            </button>
          </div>

          {(() => {
            const todayStr = new Date().toISOString().split('T')[0];
            const filteredFlights = flights.filter(f => activeTab === 'upcoming' ? f.departureDate >= todayStr : f.departureDate < todayStr);

            if (filteredFlights.length === 0) {
              return (
                <div className="glass-panel animate-fade-in" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No {activeTab} flights tracked yet. Add one to begin!
                </div>
              );
            }

            return filteredFlights.map((flight, idx) => (
              <div key={flight._id} className="glass-panel animate-fade-in" style={{ animationDelay: idx * 0.1 + 's', padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px' }}>
                  <h3 style={{ fontSize: '1.5rem' }}>{flight.origin} → {flight.destination}</h3>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Departs: {flight.departureDate}</span>
                </div>

                {/* Content Grid */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'stretch' }}>
                  
                  {/* AI Insight Section */}
                  <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <h4 style={{ marginBottom: '10px', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <TrendingDown size={18} /> AI Insight
                        </div>
                        <button
                          onClick={() => fetchInsight(flight._id, true)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '5px', borderRadius: '50%', display: 'flex', alignItems: 'center', transition: 'color 0.2s', ...(!insightData[flight._id] ? { opacity: 0.5, pointerEvents: 'none' } : {}) }}
                          title="Force Refresh Insight"
                          onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'}
                          onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                        >
                          <RefreshCw size={16} className={!insightData[flight._id] ? "spin" : ""} />
                        </button>
                      </h4>
                      {insightData[flight._id] ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <div style={{
                            display: 'inline-block',
                            padding: '5px 12px',
                            borderRadius: '20px',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            marginBottom: '10px',
                            alignSelf: 'start',
                            background: insightData[flight._id].recommendation === 'Buy Now' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                            color: insightData[flight._id].recommendation === 'Buy Now' ? 'var(--success)' : 'var(--warning)'
                          }}>
                            {insightData[flight._id].recommendation}
                          </div>
                          <p style={{ fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '8px', flex: 1 }}>{insightData[flight._id].explanation}</p>
                          {insightData[flight._id].generatedAt && (
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 'auto' }}>
                              <Clock size={12} style={{ display: 'inline', marginRight: '4px', position: 'relative', top: '-1px' }}/>
                              Last updated: {new Date(insightData[flight._id].generatedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      ) : <div style={{ color: 'var(--text-secondary)' }}><Clock size={16} style={{ display: 'inline', marginRight: '5px' }}/> Analyzing...</div>}
                    </div>
                  </div>

                  {/* Mini Chart Section */}
                  <div style={{ flex: '1', minWidth: '300px', minHeight: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.1)', borderRadius: '12px', padding: '10px' }}>
                    {(historyData[flight._id] && historyData[flight._id].length > 0) ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={historyData[flight._id]}>
                          <Tooltip
                            contentStyle={{ background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                            itemStyle={{ color: 'var(--accent)' }}
                          />
                          <Line type="monotone" dataKey="price" stroke="var(--accent)" strokeWidth={3} dot={{ fill: 'var(--accent)', r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.9rem' }}>
                        <TrendingDown size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
                        <br />
                        No price history yet.<br />Tracking data soon.
                      </div>
                    )}
                  </div>

                </div>
              </div>
            ));
          })()}
        </div>

      </div>
    </div>
  );
}

export default App;
