import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export default function AdminCategories(){
  const { isAuthenticated, user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token') || '';

  const load = async () => {
    try{
      const res = await axios.get(`${API_URL}/api/categories`);
      setCategories(res.data);
      setError(null);
    }catch{ setError('Failed to load categories'); }
  };

  useEffect(()=>{ if (isAuthenticated && user?.role==='admin') load(); }, [isAuthenticated, user]);

  const add = async () => {
    try{
      await axios.post(`${API_URL}/api/categories`, { name, slug, description }, { headers: { Authorization: `Bearer ${token}` } });
      setName(''); setSlug(''); setDescription('');
      load();
    }catch(e){ alert(e.response?.data?.error || 'Failed to add'); }
  };
  const update = async (id, body) => {
    try{
      await axios.put(`${API_URL}/api/categories/${id}`, body, { headers: { Authorization: `Bearer ${token}` } });
      load();
    }catch(e){ alert(e.response?.data?.error || 'Failed to update'); }
  };
  const del = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try{
      await axios.delete(`${API_URL}/api/categories/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      load();
    }catch(e){ alert(e.response?.data?.error || 'Failed to delete'); }
  };

  if (!isAuthenticated || user?.role !== 'admin') return <div style={{padding:'1rem'}}>Unauthorized</div>;

  return (
    <div style={{ padding:'1.5rem' }}>
      <h2 className="section-title">Manage Categories</h2>
      <div className="divider-accent" />
      {error && <div style={{ color:'#b00020', marginBottom:'1rem' }}>{error}</div>}
      <div className="glass" style={{ padding:'1rem', borderRadius:12, marginBottom:16, display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:12 }}>
        <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
        <input placeholder="Slug" value={slug} onChange={e=>setSlug(e.target.value)} />
        <input placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />
        <button onClick={add} style={{ padding:'0.5rem 1rem', borderRadius:8, border:'none', background:'#8B4513', color:'#fff' }}>Add</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))', gap:12 }}>
        {categories.map(c => (
          <div key={c._id} className="glass" style={{ padding:'1rem', borderRadius:12 }}>
            <div style={{ fontWeight:600 }}>{c.name}</div>
            <div style={{ color:'#666' }}>/{c.slug}</div>
            {c.description && <div style={{ marginTop:6 }}>{c.description}</div>}
            <div style={{ display:'flex', gap:8, marginTop:10 }}>
              <button onClick={()=>{
                const nn = prompt('New name', c.name) || c.name;
                const ns = prompt('New slug', c.slug) || c.slug;
                const nd = prompt('New description', c.description||'') || '';
                update(c._id, { name: nn, slug: ns, description: nd });
              }} style={{ padding:'0.4rem 0.8rem', borderRadius:8, border:'none', background:'#FFC107' }}>Edit</button>
              <button onClick={()=>del(c._id)} style={{ padding:'0.4rem 0.8rem', borderRadius:8, border:'none', background:'#DC3545', color:'#fff' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}