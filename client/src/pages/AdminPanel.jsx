import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export default function AdminPanel() {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [showStockManager, setShowStockManager] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeTab, setActiveTab] = useState('menu');
  const [orders, setOrders] = useState([]);
  const [bulkStockValue, setBulkStockValue] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    sizePrices: { large: '', medium: '', small: '' },
    image: '',
    category: 'coffee',
    available: true,
    stock: 0
  });

  const [categories, setCategories] = useState(['coffee', 'tea', 'pastry', 'sandwich', 'dessert', 'beverage']);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchMenuItems();
      fetchOrders();
      // load categories
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      axios.get(`${API_URL}/api/categories`).then(res=>{
        if (Array.isArray(res.data) && res.data.length) {
          setCategories(res.data.map(c=>c.slug||c.name));
        }
      }).catch(()=>{});
    }
  }, [user]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      // Admin can see all items including unavailable ones
      const response = await axios.get(`${API_URL}/api/menu?available=all`);
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      alert('Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({
          ...prev,
          image: reader.result // Store base64 for now
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.description || !formData.price) {
      alert('Please fill in all required fields (name, description, price)');
      return;
    }

    // Check if at least one image source is provided
    if (!formData.image && !imageFile) {
      alert('Please provide an image URL or upload an image file');
      return;
    }

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      // Build size prices; default medium=2/3*large, small=1/2*large if empty
      const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
      const large = formData.sizePrices?.large !== '' ? parseFloat(formData.sizePrices.large) : parseFloat(formData.price);
      const medium = formData.sizePrices?.medium !== '' ? parseFloat(formData.sizePrices.medium) : round2(large * 2 / 3);
      const small = formData.sizePrices?.small !== '' ? parseFloat(formData.sizePrices.small) : round2(large / 2);

      const submitData = {
        ...formData,
        price: large,
        sizePrices: { large, medium, small },
        // Use uploaded image (base64) if available, otherwise use URL
        image: imageFile ? formData.image : formData.image
      };

      if (editingItem) {
        // Update existing item
        await axios.put(`${API_URL}/api/menu/${editingItem._id}`, submitData, config);
        alert('Menu item updated successfully!');
      } else {
        // Create new item
        await axios.post(`${API_URL}/api/menu`, submitData, config);
        alert('Menu item added successfully!');
      }

      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        sizePrices: { large: '', medium: '', small: '' },
        image: '',
        category: 'coffee',
        available: true,
        stock: 0
      });
      setImageFile(null);
      setImagePreview(null);
      setShowAddForm(false);
      setEditingItem(null);
      fetchMenuItems();
    } catch (error) {
      console.error('Error saving menu item:', error);
      const errorMsg = error.response?.data?.error || 'Failed to save menu item';
      alert(errorMsg);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      description: item.description,
      price: (item.sizePrices?.large ?? item.price).toString(),
      sizePrices: {
        large: (item.sizePrices?.large ?? item.price).toString(),
        medium: (item.sizePrices?.medium ?? Math.round(((item.sizePrices?.large ?? item.price) * 2 / 3 + Number.EPSILON) * 100) / 100).toString(),
        small: (item.sizePrices?.small ?? Math.round((((item.sizePrices?.large ?? item.price) / 2) + Number.EPSILON) * 100) / 100).toString(),
      },
      image: item.image,
      category: item.category,
      available: item.available,
      stock: Number(item.stock || 0)
    });
    setImagePreview(item.image);
    setImageFile(null);
    setEditingItem(item);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) {
      return;
    }

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      await axios.delete(`${API_URL}/api/menu/${id}`, config);
      alert('Menu item deleted successfully!');
      fetchMenuItems();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      const errorMsg = error.response?.data?.error || 'Failed to delete menu item';
      alert(errorMsg);
    }
  };

  const adjustStock = async (itemId, adjustment) => {
    try {
      const item = menuItems.find(i => i._id === itemId);
      if (!item) return;
      
      const newStock = Math.max(0, (item.stock || 0) + adjustment);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      await axios.put(`${API_URL}/api/menu/${itemId}`, { stock: newStock }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchMenuItems();
    } catch (error) {
      alert('Failed to update stock');
    }
  };

  const bulkUpdateStock = async () => {
    if (selectedItems.length === 0) {
      alert('Please select items to update');
      return;
    }
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      const promises = selectedItems.map(itemId =>
        axios.put(`${API_URL}/api/menu/${itemId}`, { stock: bulkStockValue }, {
          headers: { Authorization: `Bearer ${token}` }
        })
      );
      
      await Promise.all(promises);
      setSelectedItems([]);
      setBulkStockValue(0);
      fetchMenuItems();
      alert('Stock updated for selected items');
    } catch (error) {
      alert('Failed to update stock for some items');
    }
  };

  const getStockStatus = (stock) => {
    const stockNum = Number(stock || 0);
    if (stockNum === 0) return { status: 'Out of Stock', color: '#dc3545', bg: '#f8d7da' };
    if (stockNum <= 5) return { status: 'Low Stock', color: '#ffc107', bg: '#fff3cd' };
    return { status: 'In Stock', color: '#28a745', bg: '#d4edda' };
  };

  const fetchOrders = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const cancelEdit = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      sizePrices: { large: '', medium: '', small: '' },
      image: '',
      category: 'coffee',
      available: true,
      stock: 0
    });
    setImageFile(null);
    setImagePreview('');
    setEditingItem(null);
    setShowAddForm(false);
  };

  if (user?.role !== 'admin') {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>Access Denied</h2>
        <p>You must be an admin to access this page.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div className="admin-panel">
        <div className="admin-header">
          <h1 className="gradient-text" style={{ fontSize: '2rem', margin: 0, fontFamily: 'serif' }}>Admin Panel</h1>
          <div className="admin-nav">
            <button 
              className={`nav-btn ${activeTab === 'menu' ? 'active' : ''}`}
              onClick={() => setActiveTab('menu')}
            >
              Menu Management
            </button>
            <button 
              className={`nav-btn ${activeTab === 'stock' ? 'active' : ''}`}
              onClick={() => setActiveTab('stock')}
            >
              Stock Management
            </button>
            <button 
              className={`nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              Orders
            </button>
          </div>
        </div>

        {activeTab === 'menu' && (
          <div className="menu-management">
            <div className="section-header">
              <h2>Menu Management</h2>
              <button 
                className="add-btn"
                onClick={() => setShowAddForm(true)}
              >
                Add New Item
              </button>
            </div>

            {/* Add/Edit Form */}
            {showAddForm && (
              <div className="glass fade-in-up" style={{
                padding: '2rem',
                borderRadius: '15px',
                marginBottom: '2rem'
              }}>
                <h3>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h3>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Name:</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Price (৳, Large):</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      step="1"
                      min="0"
                      required
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Stock:</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      step="1"
                      min="0"
                      required
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Category:</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Description:</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows="3"
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Image:</label>
                    
                    {/* Image Upload Option */}
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                        Upload from device:
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ 
                          width: '100%', 
                          padding: '0.5rem', 
                          borderRadius: '4px', 
                          border: '1px solid #ccc',
                          backgroundColor: '#f8f9fa'
                        }}
                      />
                    </div>

                    {/* OR URL Input */}
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                        Or enter image URL:
                      </label>
                      <input
                        type="url"
                        name="image"
                        value={formData.image}
                        onChange={handleInputChange}
                        placeholder="https://example.com/image.jpg"
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                      />
                    </div>

                    {/* Image Preview */}
                    {(imagePreview || formData.image) && (
                      <div style={{ marginTop: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                          Preview:
                        </label>
                        <img
                          src={imagePreview || formData.image}
                          alt="Preview"
                          style={{
                            width: '200px',
                            height: '150px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '2px solid #ddd'
                          }}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/200x150?text=Invalid+Image';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      name="available"
                      checked={formData.available}
                      onChange={handleInputChange}
                      id="available"
                    />
                    <label htmlFor="available" style={{ fontWeight: 'bold' }}>Available</label>
                  </div>

                  {/* Size-based Pricing */}
                  <div style={{ gridColumn: '1 / -1', background: '#FFF7ED', border: '1px solid #F5E6D3', padding: '1rem', borderRadius: '10px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#5D4037' }}>Sizes & Prices</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Large (৳)</label>
                        <input
                          type="number"
                          value={formData.sizePrices.large}
                          onChange={(e) => setFormData(prev => ({ ...prev, sizePrices: { ...prev.sizePrices, large: e.target.value } }))}
                          step="1"
                          min="0"
                          placeholder="Defaults to Price"
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Medium (৳)</label>
                        <input
                          type="number"
                          value={formData.sizePrices.medium}
                          onChange={(e) => setFormData(prev => ({ ...prev, sizePrices: { ...prev.sizePrices, medium: e.target.value } }))}
                          step="1"
                          min="0"
                          placeholder="Defaults to 2/3 of Large"
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Small (৳)</label>
                        <input
                          type="number"
                          value={formData.sizePrices.small}
                          onChange={(e) => setFormData(prev => ({ ...prev, sizePrices: { ...prev.sizePrices, small: e.target.value } }))}
                          step="1"
                          min="0"
                          placeholder="Defaults to 1/2 of Large"
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                      </div>
                    </div>
                    <p style={{ marginTop: '0.5rem', color: '#6b4f3a', fontSize: '0.9rem' }}>
                      Tip: If left blank, Medium will be set to 2/3 of Large and Small to 1/2 of Large.
                    </p>
                  </div>

                  <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem' }}>
                    <button
                      type="submit"
                      className="glow-hover"
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(135deg, #007bff, #0056b3)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer'
                      }}
                    >
                      {editingItem ? 'Update Item' : 'Add Item'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="glow-hover"
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(135deg, #6c757d, #495057)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Menu Items List */}
            <div>
              <h3 className="gradient-text">Current Menu Items ({menuItems.length})</h3>
              {loading ? (
                <p>Loading...</p>
              ) : menuItems.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666', padding: '3rem' }}>
                  No menu items yet. Add your first item above!
                </p>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {menuItems.map(item => {
                    const stockStatus = getStockStatus(item.stock);
                    return (
                      <div
                        key={item._id}
                        className="glow-hover"
                        style={{
                          display: 'flex',
                          gap: '1rem',
                          padding: '1rem',
                          border: '1px solid #dee2e6',
                          borderRadius: '12px',
                          backgroundColor: item.available ? 'white' : '#f8f9fa'
                        }}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                          }}
                        />
                        <div style={{ flex: '1' }}>
                          <h4 style={{ margin: '0 0 0.5rem 0' }}>
                            {item.name} 
                            <span style={{ 
                              marginLeft: '1rem', 
                              fontSize: '0.9rem', 
                              color: '#666',
                              textTransform: 'capitalize'
                            }}>
                              ({item.category})
                            </span>
                          </h4>
                          <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>{item.description}</p>
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <strong>৳{item.price.toFixed(2)}</strong>
                            <span style={{
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                              backgroundColor: stockStatus.bg,
                              color: stockStatus.color
                            }}>
                              {stockStatus.status}: {item.stock || 0}
                            </span>
                            <span style={{
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                              backgroundColor: item.available ? '#d4edda' : '#f8d7da',
                              color: item.available ? '#155724' : '#721c24'
                            }}>
                              {item.available ? 'Available' : 'Unavailable'}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleEdit(item)}
                            className="glow-hover"
                            style={{
                              padding: '0.5rem 1rem',
                              background: 'linear-gradient(135deg, #ffc107, #d39e00)',
                              color: 'black',
                              border: 'none',
                              borderRadius: '10px',
                              cursor: 'pointer'
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="glow-hover"
                            style={{
                              padding: '0.5rem 1rem',
                              background: 'linear-gradient(135deg, #dc3545, #b21f2d)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '10px',
                              cursor: 'pointer'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'stock' && (
          <div className="stock-management">
            <h2>Stock Management</h2>
            <p>Stock management features coming soon...</p>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="orders-section">
            <h2>Recent Orders</h2>
            <p>Orders management coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
