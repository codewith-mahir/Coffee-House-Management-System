import { useEffect, useState } from 'react';
import axios from 'axios';
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, Line } from 'recharts';
import { useAuth } from '../contexts/AuthContext';

export default function AdminReports(){
  const { isAuthenticated, user } = useAuth();
  const [stats, setStats] = useState({ totalRevenue:0, totalOrders:0, byStatus:{}, topItems:[] });
  const [series, setSeries] = useState([]);
  const [error, setError] = useState(null);

  useEffect(()=>{
    if (!isAuthenticated || user?.role !== 'admin') return;
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const token = localStorage.getItem('token') || '';
    axios.get(`${API_URL}/api/reports/overview`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res=>{ setStats(res.data); setError(null); })
      .catch(()=> setError('Failed to load reports'));
    axios.get(`${API_URL}/api/reports/timeseries?range=daily`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res=> setSeries(res.data))
      .catch(()=>{});
  }, [isAuthenticated, user]);

  if (!isAuthenticated || user?.role !== 'admin') return <div style={{padding:'1rem'}}>Unauthorized</div>;

  return (
    <div style={{ padding:'1.5rem' }}>
      <h2 className="section-title">Sales Reports</h2>
      <div className="divider-accent" />
      {LineChart ? (
        <div className="glass" style={{ padding:'1rem', borderRadius:12, marginBottom:16 }}>
          <div style={{ fontWeight:600, marginBottom:8 }}>Daily Revenue</div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={series}>
              <XAxis dataKey="date" hide={false} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#8B4513" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : null}
      {error && <div style={{ color:'#b00020', marginBottom:'1rem' }}>{error}</div>}
      <div className="glass" style={{ padding:'1rem', borderRadius:12, marginBottom:16 }}>
        <div style={{ display:'flex', gap:24 }}>
          <div><div style={{ color:'#666' }}>Total Revenue</div><div style={{ fontSize:24, fontWeight:700 }}>৳{stats.totalRevenue}</div></div>
          <div><div style={{ color:'#666' }}>Total Orders</div><div style={{ fontSize:24, fontWeight:700 }}>{stats.totalOrders}</div></div>
        </div>
      </div>
      <div className="glass" style={{ padding:'1rem', borderRadius:12 }}>
        <div style={{ fontWeight:600, marginBottom:8 }}>Orders by Status</div>
        <ul>
          {Object.entries(stats.byStatus || {}).map(([k,v]) => (
            <li key={k} style={{ textTransform:'capitalize' }}>{k}: {v}</li>
          ))}
        </ul>
      </div>
      <div className="glass" style={{ padding:'1rem', borderRadius:12, marginTop:16 }}>
        <div style={{ fontWeight:600, marginBottom:8 }}>Top Items</div>
        <ul>
          {(stats.topItems || []).map((t,i) => (
            <li key={i}>{t.name} — {t.count} orders</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
