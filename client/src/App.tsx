import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import Home from './pages/Home';
import './App.css';

const queryClient = new QueryClient();

function Health() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/health`);
      if (!res.ok) throw new Error('Failed to fetch health');
      return res.json();
    },
  });
  return (
    <div style={{ padding: 24 }}>
      <h2>API Health</h2>
      {isLoading && <p>Loading…</p>}
      {error && <p style={{color:'crimson'}}>{String((error as Error).message)}</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div style={{ display: 'flex', gap: 12, padding: 12, borderBottom: '1px solid #ddd' }}>
          <Link to="/">Home</Link>
          <Link to="/health">Health</Link>
        </div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/health" element={<Health />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
