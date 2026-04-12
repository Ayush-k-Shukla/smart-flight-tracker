import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plane, Search, TrendingDown, Clock, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './index.css';

const API_BASE = 'http://localhost:3000';

function App() {
  const [flights, setFlights] = useState<any[]>([]);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [insightData, setInsightData] = useState<Record<string, any>>({});
  const [historyData, setHistoryData] = useState<Record<string, any[]>>({});

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    try {
      const res = await axios.get(`${API_BASE}/flights`);
      setFlights(res.data);
      // Fetch insights and history for each
      res.data.forEach((f: any) => {
        fetchInsight(f._id);
      });
    } catch (e) {
      console.error('Failed to fetch flights', e);
    }
  };

  const fetchInsight = async (id: string) => {
    try {
      const res = await axios.get(`${API_BASE}/ai-insight/${id}`);
      setInsightData(prev => ({ ...prev, [id]: res.data }));
      
      // We don't have a direct history endpoint in controller yet,
      // so if we want charts, we might just mock them for presentation
      // or rely on insight endpoint including history if we modify it.
      // For now, let's mock history to show the Recharts UI since backend only exposes insights
      setHistoryData(prev => ({
        ...prev,
        [id]: Array.from({length: 5}).map((_, i) => ({
          name: `Day ${i+1}`,
          price: Math.floor(Math.random() * (500 - 100 + 1)) + 100
        }))
      }));
    } catch (e) {
      console.error('Failed to fetch insight', e);
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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

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
            <input type="text" placeholder="Origin (e.g. JFK)" value={origin} onChange={e => setOrigin(e.target.value.toUpperCase())} maxLength={3} required />
            <input type="text" placeholder="Destination (e.g. LHR)" value={destination} onChange={e => setDestination(e.target.value.toUpperCase())} maxLength={3} required />
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
            <button type="submit" className="btn" disabled={loading} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              {loading ? 'Adding...' : <><Search size={18} /> Start Tracking</>}
            </button>
          </form>
        </div>

        {/* Tracked Flights Dashboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {flights.length === 0 && (
            <div className="glass-panel animate-fade-in" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No flights tracked yet. Add one to begin!
            </div>
          )}

          {flights.map((flight, idx) => (
            <div key={flight._id} className="glass-panel animate-fade-in" style={{ animationDelay: idx * 0.1 + 's', padding: '25px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
              
              <div style={{ flex: '1', minWidth: '250px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 style={{ fontSize: '1.5rem' }}>{flight.origin} → {flight.destination}</h3>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Departs: {flight.departureDate}</span>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px', marginTop: '20px' }}>
                  <h4 style={{ marginBottom: '10px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingDown size={18} /> AI Insight
                  </h4>
                  {insightData[flight._id] ? (
                    <div>
                      <div style={{ 
                        display: 'inline-block', 
                        padding: '5px 12px', 
                        borderRadius: '20px', 
                        fontWeight: 'bold', 
                        fontSize: '0.9rem',
                        marginBottom: '10px',
                        background: insightData[flight._id].recommendation === 'Buy Now' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                        color: insightData[flight._id].recommendation === 'Buy Now' ? 'var(--success)' : 'var(--warning)'
                      }}>
                        {insightData[flight._id].recommendation}
                      </div>
                      <p style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>{insightData[flight._id].explanation}</p>
                    </div>
                  ) : <div style={{ color: 'var(--text-secondary)' }}><Clock size={16} style={{ display: 'inline', marginRight: '5px' }}/> Analyzing...</div>}
                </div>
              </div>

              {/* Mini Chart */}
              <div style={{ flex: '1', minWidth: '250px', height: '180px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData[flight._id] || []}>
                    <Tooltip 
                      contentStyle={{ background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                      itemStyle={{ color: 'var(--accent)' }}
                    />
                    <Line type="monotone" dataKey="price" stroke="var(--accent)" strokeWidth={3} dot={{ fill: 'var(--accent)', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
}

export default App;
