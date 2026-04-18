import axios from 'axios';
import { Calendar, Clock, Info, Plane, RefreshCw, Search, TrendingDown, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import './index.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ─── Custom Chart Dot with hover detection ───────────────────────────────────
const CustomDot = (props: any) => {
  const { cx, cy, payload, onHover, onLeave } = props;
  if (cx == null || cy == null) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={6}
      fill="var(--accent)"
      stroke="rgba(255,255,255,0.3)"
      strokeWidth={2}
      style={{ cursor: 'pointer' }}
      onMouseEnter={(e) => onHover && onHover(payload, e)}
      onMouseLeave={() => onLeave && onLeave()}
    />
  );
};

// ─── Custom Rich Tooltip for chart ───────────────────────────────────────────
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.97)',
      border: '1px solid rgba(99, 102, 241, 0.4)',
      borderRadius: '12px',
      padding: '14px 18px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      minWidth: '160px'
    }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
        <Calendar size={12} style={{ display: 'inline', marginRight: '4px', position: 'relative', top: '-1px' }} />
        {d.name}
      </div>
      <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--accent)' }}>
        ₹{d.price?.toLocaleString('en-IN')}
      </div>
      {d.airline && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginTop: '6px', fontWeight: 'bold' }}>
          {d.airline} {d.flightNumber ? `(${d.flightNumber})` : ''}
        </div>
      )}
      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Current Price (INR)</div>
    </div>
  );
};

// ─── Flight Detail Modal ──────────────────────────────────────────────────────
interface FlightModalProps {
  flight: any;
  insight: any;
  history: any[];
  onClose: () => void;
}

const FlightModal = ({ flight, insight, history, onClose }: FlightModalProps) => {
  const backdropRef = useRef<HTMLDivElement>(null);

  const latestPrice = history.length > 0 ? history[history.length - 1].price : null;
  const lowestPrice = history.length > 0 ? Math.min(...history.map(h => h.price)) : null;
  const highestPrice = history.length > 0 ? Math.max(...history.map(h => h.price)) : null;

  const originLabel = flight.originCity ? `${flight.originCity} (${flight.origin})` : flight.origin;
  const destLabel = flight.destinationCity ? `${flight.destinationCity} (${flight.destination})` : flight.destination;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div className="glass-panel" style={{
        width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto',
        padding: '32px',
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        animation: 'slideUp 0.25s ease-out'
      }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{
                background: 'rgba(99, 102, 241, 0.15)', borderRadius: '50%', padding: '10px',
                border: '1px solid rgba(99, 102, 241, 0.3)'
              }}>
                <Plane size={22} color="var(--accent)" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Flight Details</div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '2px' }}>
                  {originLabel} → {destLabel}
                </h2>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem', marginLeft: '54px' }}>
              <Calendar size={14} />
              <span>Departs: <strong style={{ color: 'var(--text-primary)' }}>{new Date(flight.departureDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 0.2s' }}
            onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.2)'; (e.currentTarget as HTMLElement).style.color = '#ef4444'; }}
            onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Price Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '28px' }}>
          {[
            { label: 'Latest Price', value: latestPrice, color: 'var(--accent)' },
            { label: 'Lowest Tracked', value: lowestPrice, color: 'var(--success)' },
            { label: 'Highest Tracked', value: highestPrice, color: 'var(--warning)' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: 'rgba(0,0,0,0.25)', borderRadius: '12px', padding: '16px',
              border: '1px solid var(--glass-border)', textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: stat.color }}>
                {stat.value != null ? `₹${stat.value.toLocaleString('en-IN')}` : '—'}
              </div>
            </div>
          ))}
        </div>

        {/* Route Visual */}
        <div style={{
          background: 'rgba(0,0,0,0.2)', borderRadius: '14px', padding: '20px',
          border: '1px solid var(--glass-border)', marginBottom: '24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px'
        }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '0.05em', color: 'var(--accent)' }}>{flight.origin}</div>
            {flight.originCity && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{flight.originCity}</div>}
          </div>
          <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ flex: 1, height: '2px', background: 'linear-gradient(to right, var(--accent), transparent)' }} />
            <Plane size={20} color="var(--accent)" style={{ transform: 'rotate(0deg)' }} />
            <div style={{ flex: 1, height: '2px', background: 'linear-gradient(to right, transparent, var(--accent))' }} />
          </div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '0.05em', color: 'var(--accent)' }}>{flight.destination}</div>
            {flight.destinationCity && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{flight.destinationCity}</div>}
          </div>
        </div>

        {/* Latest Exact Flight Details */}
        {latestPrice != null && history.length > 0 && history[history.length - 1].airline && (
          <div style={{
            background: 'rgba(0,0,0,0.2)', borderRadius: '14px', padding: '16px 20px',
            border: '1px solid var(--glass-border)', marginBottom: '24px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>BEST FLIGHT FROM LATEST TRACKING</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                {history[history.length - 1].airline} <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal' }}>{history[history.length - 1].flightNumber || ''}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              {(history[history.length - 1].departureTime || history[history.length - 1].arrivalTime) && (
                <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  {history[history.length - 1].departureTime || '--'} - {history[history.length - 1].arrivalTime || '--'}
                </div>
              )}
              {history[history.length - 1].duration && (
                 <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                   {Math.floor(history[history.length - 1].duration / 60)}h {history[history.length - 1].duration % 60}m
                 </div>
              )}
            </div>
          </div>
        )}

        {/* Price History Chart */}
        {history.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Price History (INR)</h4>
            <div style={{ height: '180px', background: 'rgba(0,0,0,0.15)', borderRadius: '12px', padding: '10px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="var(--accent)"
                    strokeWidth={3}
                    dot={<CustomDot />}
                    activeDot={{ r: 8, fill: 'var(--accent)', stroke: 'white', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* AI Insight */}
        {insight && (
          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '18px', border: '1px solid var(--glass-border)' }}>
            <h4 style={{ marginBottom: '10px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
              <TrendingDown size={16} /> AI Insight
            </h4>
            <div style={{
              display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '10px',
              background: insight.recommendation === 'Buy Now' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
              color: insight.recommendation === 'Buy Now' ? 'var(--success)' : 'var(--warning)',
              border: `1px solid ${insight.recommendation === 'Buy Now' ? 'rgba(34,197,94,0.3)' : 'rgba(234,179,8,0.3)'}`
            }}>
              {insight.recommendation}
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>{insight.explanation}</p>
            {insight.generatedAt && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '10px' }}>
                <Clock size={11} style={{ display: 'inline', marginRight: '4px' }} />
                Updated: {new Date(insight.generatedAt).toLocaleString('en-IN')}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main App ─────────────────────────────────────────────────────────────────
function App() {
  const [flights, setFlights] = useState<any[]>([]);
  const [origin, setOrigin] = useState('');
  const [originCity, setOriginCity] = useState('');
  const [destination, setDestination] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
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
  const [selectedFlight, setSelectedFlight] = useState<any | null>(null);

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
          delete newData[id];
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
        name: new Date(h.fetchedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        price: h.price,
        fetchedAt: h.fetchedAt,
        currency: h.currency || 'INR',
        airline: h.airline,
        flightNumber: h.flightNumber,
        departureTime: h.departureTime,
        arrivalTime: h.arrivalTime,
        duration: h.duration
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
      await axios.post(`${API_BASE}/flights`, {
        origin,
        originCity,
        destination,
        destinationCity,
        departureDate: date
      });
      setOrigin(''); setOriginCity('');
      setDestination(''); setDestinationCity('');
      setDate('');
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
                  setOrigin('');
                  setOriginCity('');
                  setShowOriginList(true);
                }}
                onFocus={() => setShowOriginList(true)}
                required
              />
              {showOriginList && (originSearch || originSuggestions.length > 0) && (
                <div className="glass-panel" style={{
                  position: 'absolute', top: '100%', left: 0, right: 0,
                  zIndex: 100, marginTop: '5px', maxHeight: '200px', overflowY: 'auto', padding: '10px',
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)'
                }}>
                  {originSuggestions.length > 0 ? originSuggestions.map(s => (
                    <div
                      key={s.iata}
                      className="suggestion-item"
                      style={{ padding: '8px', cursor: 'pointer', borderRadius: '4px', borderBottom: '1px solid var(--glass-border)' }}
                      onClick={() => {
                        setOrigin(s.iata);
                        setOriginCity(s.city || s.name);
                        setOriginSearch(`${s.city} (${s.iata})`);
                        setShowOriginList(false);
                      }}
                    >
                      <div style={{ fontWeight: 'bold' }}>{s.city} <span style={{ color: 'var(--accent)' }}>({s.iata})</span></div>
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
                  setDestinationCity('');
                  setShowDestList(true);
                }}
                onFocus={() => setShowDestList(true)}
                required
              />
              {showDestList && (destSearch || destSuggestions.length > 0) && (
                <div className="glass-panel" style={{
                  position: 'absolute', top: '100%', left: 0, right: 0,
                  zIndex: 100, marginTop: '5px', maxHeight: '200px', overflowY: 'auto', padding: '10px',
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)'
                }}>
                  {destSuggestions.length > 0 ? destSuggestions.map(s => (
                    <div
                      key={s.iata}
                      className="suggestion-item"
                      style={{ padding: '8px', cursor: 'pointer', borderRadius: '4px', borderBottom: '1px solid var(--glass-border)' }}
                      onClick={() => {
                        setDestination(s.iata);
                        setDestinationCity(s.city || s.name);
                        setDestSearch(`${s.city} (${s.iata})`);
                        setShowDestList(false);
                      }}
                    >
                      <div style={{ fontWeight: 'bold' }}>{s.city} <span style={{ color: 'var(--accent)' }}>({s.iata})</span></div>
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

            return filteredFlights.map((flight, idx) => {
              const originLabel = flight.originCity ? `${flight.originCity} (${flight.origin})` : flight.origin;
              const destLabel = flight.destinationCity ? `${flight.destinationCity} (${flight.destination})` : flight.destination;
              const history = historyData[flight._id] || [];
              const latestPrice = history.length > 0 ? history[history.length - 1].price : null;

              return (
                <div
                  key={flight._id}
                  className="glass-panel animate-fade-in flight-card"
                  style={{ animationDelay: idx * 0.1 + 's', padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}
                >
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: '800' }}>
                        {originLabel} <span style={{ color: 'var(--accent)' }}>→</span> {destLabel}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '5px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        <Calendar size={13} />
                        <span>Departs: {new Date(flight.departureDate).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {latestPrice != null && (
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Latest</div>
                          <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--accent)' }}>₹{latestPrice.toLocaleString('en-IN')}</div>
                        </div>
                      )}
                      <button
                        onClick={() => setSelectedFlight(flight)}
                        title="View flight details"
                        style={{
                          background: 'rgba(99, 102, 241, 0.1)',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                          borderRadius: '8px', padding: '8px', cursor: 'pointer',
                          color: 'var(--accent)', transition: 'all 0.2s', display: 'flex', alignItems: 'center'
                        }}
                        onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.25)'; }}
                        onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.1)'; }}
                      >
                        <Info size={18} />
                      </button>
                    </div>
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
                              display: 'inline-block', padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '10px', alignSelf: 'start',
                              background: insightData[flight._id].recommendation === 'Buy Now' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                              color: insightData[flight._id].recommendation === 'Buy Now' ? 'var(--success)' : 'var(--warning)'
                            }}>
                              {insightData[flight._id].recommendation}
                            </div>
                            <p style={{ fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '8px', flex: 1 }}>{insightData[flight._id].explanation}</p>
                            {insightData[flight._id].generatedAt && (
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 'auto' }}>
                                <Clock size={12} style={{ display: 'inline', marginRight: '4px', position: 'relative', top: '-1px' }} />
                                Last updated: {new Date(insightData[flight._id].generatedAt).toLocaleString('en-IN')}
                              </p>
                            )}
                          </div>
                        ) : <div style={{ color: 'var(--text-secondary)' }}><Clock size={16} style={{ display: 'inline', marginRight: '5px' }} /> Analyzing...</div>}
                      </div>
                    </div>

                    {/* Mini Chart Section */}
                    <div style={{ flex: '1', minWidth: '300px', minHeight: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.1)', borderRadius: '12px', padding: '10px' }}>
                      {(historyData[flight._id] && historyData[flight._id].length > 0) ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={historyData[flight._id]}>
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                              type="monotone"
                              dataKey="price"
                              stroke="var(--accent)"
                              strokeWidth={3}
                              dot={<CustomDot />}
                              activeDot={{ r: 8, fill: 'var(--accent)', stroke: 'white', strokeWidth: 2 }}
                            />
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
              );
            });
          })()}
        </div>

      </div>

      {/* Flight Detail Modal */}
      {selectedFlight && (
        <FlightModal
          flight={selectedFlight}
          insight={insightData[selectedFlight._id]}
          history={historyData[selectedFlight._id] || []}
          onClose={() => setSelectedFlight(null)}
        />
      )}
    </div>
  );
}

export default App;
