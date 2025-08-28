import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

const COLORS = ['#8B4513', '#D2691E', '#CD853F', '#DEB887', '#F4A460', '#D2B48C'];

export default function AdminAnalytics() {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Analytics data
  const [overviewData, setOverviewData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    byStatus: {},
    topItems: [],
    revenueByCategory: []
  });
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [topItemsData, setTopItemsData] = useState([]);
  const [revenueTrendsData, setRevenueTrendsData] = useState([]);
  const [hourlyPatternData, setHourlyPatternData] = useState([]);

  // Filters
  const [timeRange, setTimeRange] = useState('daily');
  const [periodFilter, setPeriodFilter] = useState('all');

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchAnalyticsData();
    }
  }, [isAuthenticated, user, timeRange, periodFilter]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token') || '';
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all analytics data in parallel
      const [
        overviewRes,
        timeSeriesRes,
        topItemsRes,
        revenueTrendsRes,
        hourlyPatternRes
      ] = await Promise.all([
        axios.get(`${API_URL}/api/reports/overview`, { headers }),
        axios.get(`${API_URL}/api/reports/timeseries?range=${timeRange}`, { headers }),
        axios.get(`${API_URL}/api/reports/top-items?period=${periodFilter}`, { headers }),
        axios.get(`${API_URL}/api/reports/revenue-trends`, { headers }),
        axios.get(`${API_URL}/api/reports/hourly-pattern`, { headers })
      ]);

      setOverviewData(overviewRes.data);
      setTimeSeriesData(timeSeriesRes.data);
      setTopItemsData(topItemsRes.data);
      setRevenueTrendsData(revenueTrendsRes.data);
      setHourlyPatternData(hourlyPatternRes.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount).replace('BDT', '৳');
  };

  const formatDate = (dateStr) => {
    if (timeRange === 'monthly') {
      return dateStr;
    }
    if (timeRange === 'weekly') {
      return dateStr;
    }
    return new Date(dateStr).toLocaleDateString();
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Unauthorized Access</h2>
        <p>You need admin privileges to view this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div>Loading analytics data...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#8B4513', marginBottom: '0.5rem' }}>Sales Analytics Dashboard</h1>
        <p style={{ color: '#666', margin: 0 }}>Comprehensive insights into your business performance</p>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e0e0e0' }}>
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'trends', label: 'Revenue Trends', icon: '📈' },
          { id: 'items', label: 'Top Items', icon: '🏆' },
          { id: 'patterns', label: 'Sales Patterns', icon: '⏰' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderBottom: activeTab === tab.id ? '3px solid #8B4513' : '3px solid transparent',
              backgroundColor: activeTab === tab.id ? '#fff' : 'transparent',
              color: activeTab === tab.id ? '#8B4513' : '#666',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              cursor: 'pointer',
              borderRadius: '8px 8px 0 0',
              transition: 'all 0.3s ease'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center' }}>
        <div>
          <label style={{ marginRight: '0.5rem', fontWeight: 'bold' }}>Time Range:</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div>
          <label style={{ marginRight: '0.5rem', fontWeight: 'bold' }}>Period:</label>
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="all">All Time</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
          </select>
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {/* Key Metrics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #8B4513, #D2691E)',
              color: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(139, 69, 19, 0.3)'
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', opacity: 0.9 }}>Total Revenue</h3>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{formatCurrency(overviewData.totalRevenue)}</div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #28a745, #20c997)',
              color: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)'
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', opacity: 0.9 }}>Total Orders</h3>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{overviewData.totalOrders}</div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #007bff, #6610f2)',
              color: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)'
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', opacity: 0.9 }}>Avg Order Value</h3>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                {overviewData.totalOrders > 0 ? formatCurrency(overviewData.totalRevenue / overviewData.totalOrders) : formatCurrency(0)}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
            {/* Revenue by Category */}
            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginTop: 0, color: '#8B4513', marginBottom: '1rem' }}>Revenue by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={overviewData.revenueByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {overviewData.revenueByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Order Status Distribution */}
            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginTop: 0, color: '#8B4513', marginBottom: '1rem' }}>Order Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(overviewData.byStatus).map(([status, count]) => ({ status, count }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8B4513" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Trends Tab */}
      {activeTab === 'trends' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))', gap: '2rem' }}>
            {/* Revenue Over Time */}
            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginTop: 0, color: '#8B4513', marginBottom: '1rem' }}>Revenue Trends</h3>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatDate} />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip
                    labelFormatter={(label) => `Date: ${formatDate(label)}`}
                    formatter={(value) => [formatCurrency(value), 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#8B4513" fill="#8B4513" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly Comparison */}
            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginTop: 0, color: '#8B4513', marginBottom: '1rem' }}>Monthly Revenue Comparison</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={revenueTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="revenue" fill="#D2691E" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Top Items Tab */}
      {activeTab === 'items' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem' }}>
            {/* Top Items by Revenue */}
            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginTop: 0, color: '#8B4513', marginBottom: '1rem' }}>Top Items by Revenue</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topItemsData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="totalRevenue" fill="#8B4513" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Items by Quantity */}
            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginTop: 0, color: '#8B4513', marginBottom: '1rem' }}>Top Items by Quantity Sold</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topItemsData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="totalQuantity" fill="#D2691E" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Items Table */}
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginTop: '2rem'
          }}>
            <h3 style={{ marginTop: 0, color: '#8B4513', marginBottom: '1rem' }}>Detailed Item Performance</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Item Name</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>Quantity Sold</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>Total Revenue</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>Avg Order Value</th>
                  </tr>
                </thead>
                <tbody>
                  {topItemsData.map((item, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ padding: '0.75rem' }}>{item.name}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>{item.totalQuantity}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>{formatCurrency(item.totalRevenue)}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        {formatCurrency(item.totalRevenue / item.orderCount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sales Patterns Tab */}
      {activeTab === 'patterns' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))', gap: '2rem' }}>
            {/* Hourly Sales Pattern */}
            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginTop: 0, color: '#8B4513', marginBottom: '1rem' }}>Hourly Sales Pattern</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={hourlyPatternData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" tickFormatter={(hour) => `${hour}:00`} />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(hour) => `${hour}:00`}
                    formatter={(value, name) => [value, name === 'orders' ? 'Orders' : 'Revenue (৳)']}
                  />
                  <Line type="monotone" dataKey="orders" stroke="#8B4513" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Orders vs Revenue Trend */}
            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginTop: 0, color: '#8B4513', marginBottom: '1rem' }}>Orders vs Revenue Trend</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatDate} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip
                    labelFormatter={(label) => `Date: ${formatDate(label)}`}
                    formatter={(value, name) => [
                      name === 'orders' ? value : formatCurrency(value),
                      name === 'orders' ? 'Orders' : 'Revenue'
                    ]}
                  />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#8B4513" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#D2691E" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
