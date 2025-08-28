import { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { addToCart, getItemQuantity, updateQuantity, items } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [customizations, setCustomizations] = useState({});
  const [reviewsState, setReviewsState] = useState({}); // { [itemId]: { reviews, averageRating, count, my: { rating, comment, id } } }
  const [expandedReviews, setExpandedReviews] = useState({}); // { [itemId]: boolean }

  // Categories for filtering
  const categories = [
    { value: 'all', label: 'All Items' },
    { value: 'coffee', label: 'Coffee' },
    { value: 'tea', label: 'Tea' },
    { value: 'beverage', label: 'Beverages' },
    { value: 'sandwich', label: 'Sandwiches' },
    { value: 'pastry', label: 'Pastries' },
    { value: 'dessert', label: 'Desserts' }
  ];

  // Extra surcharges aligned with backend (integer BDT)
  const extraSurcharge = (name) => {
    const n = String(name || '').toLowerCase();
    if (n.includes('sugar')) return 0; // sugar no charge
    if (n.includes('almond') && n.includes('milk')) return 180; // almond milk premium
    if (n.includes('oat') && n.includes('milk')) return 60; // oat milk premium
    if (n === 'milk') return 20; // simple milk add-on for tea
    if (n === 'lemon' || n === 'ginger' || n === 'mint') return 10; // small add-ons for tea
    if (n === 'extra cheese') return 30;
    if (n === 'extra sauce') return 15;
    if (n === 'chocolate drizzle' || n === 'extra cream') return 20;
    return 20;
  };

  // Helper function to get stock status
  const getStockStatus = (stock) => {
    const stockNum = Number(stock || 0);
    if (stockNum === 0) return { status: 'Out of Stock', color: '#dc3545', bg: '#f8d7da' };
    if (stockNum <= 5) return { status: 'Low Stock', color: '#ffc107', bg: '#fff3cd' };
    return { status: 'In Stock', color: '#28a745', bg: '#d4edda' };
  };

  // Extras presets per category
  const categoryExtras = {
    coffee: ['extra sugar','almond milk','oat milk','extra shot'],
    tea: ['extra sugar','milk','lemon','ginger','mint'],
    beverage: ['extra sugar','almond milk','oat milk'],
    sandwich: ['extra cheese','extra sauce'],
    pastry: ['chocolate drizzle','extra cream'],
    dessert: ['chocolate drizzle','extra cream']
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  // Filter items based on category and search term
  useEffect(() => {
    let filtered = menuItems;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => (item.category || '') === selectedCategory);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        const name = (item.name || '').toLowerCase();
        const desc = (item.description || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();
        return name.includes(term) || desc.includes(term) || cat.includes(term);
      });
    }

    setFilteredItems(filtered);
  }, [menuItems, selectedCategory, searchTerm]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${API_URL}/api/menu`);
      setMenuItems(response.data);
      // Preload reviews summary for each item (best-effort)
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const all = await Promise.all(response.data.map(async (it) => {
          try {
            const r = await axios.get(`${API_URL}/api/reviews/item/${it._id}`);
            return [it._id, r.data];
          } catch { return [it._id, { reviews: [], averageRating: 0, count: 0 }]; }
        }));
        const map = {};
        for (const [id, val] of all) map[id] = val;
        setReviewsState(map);
      } catch {}
      setError(null);
    } catch (err) {
      setError('Failed to load menu items');
      console.error('Error fetching menu:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => {
    const cz = customizations[item._id] || { size: 'medium', extras: [], instructions: '' };
    if (!isAuthenticated) {
      alert('Please login to add items to your cart.');
      window.location.href = '/login';
      return;
    }
    if (user?.role === 'admin') {
      alert('Cart is not available for admin accounts.');
      return;
    }

    // Check stock availability
    const currentStock = Number(item.stock || 0);
    const currentQuantity = getItemQuantity(item._id, cz.size, cz.extras);

    if (currentStock === 0) {
      alert(`Sorry, "${item.name}" is currently out of stock.`);
      return;
    }

    if (currentQuantity >= currentStock) {
      alert(`Sorry, only ${currentStock} unit(s) of "${item.name}" available in stock. You already have ${currentQuantity} in your cart.`);
      return;
    }

    // compute unitPrice from sizePrices + extras (non-sugar extras add 20)
    const large = item.sizePrices?.large ?? item.price;
    const medium = item.sizePrices?.medium ?? Math.round(((large * 2/3) + Number.EPSILON)*100)/100;
    const small = item.sizePrices?.small ?? Math.round(((large / 2) + Number.EPSILON)*100)/100;
    const base = cz.size === 'large' ? large : cz.size === 'small' ? small : medium;
    const extras = Array.isArray(cz.extras) ? cz.extras : [];
    const extrasCost = extras.reduce((sum, ex) => sum + extraSurcharge(ex), 0);
    const unitPrice = Math.round(base + extrasCost);
    addToCart({ ...item, customization: cz, unitPrice });
  };

  const handleQuantityChange = (item, change) => {
    if (!isAuthenticated) {
      alert('Please login to update your cart.');
      window.location.href = '/login';
      return;
    }
    if (user?.role === 'admin') {
      alert('Cart is not available for admin accounts.');
      return;
    }

    const size = (customizations[item._id]?.size) || 'medium';
    const extras = (customizations[item._id]?.extras) || [];
    const currentQuantity = getItemQuantity(item._id, size, extras);
    const newQuantity = currentQuantity + change;
    const availableStock = Number(item.stock || 0);

    // Prevent going below 0 or above available stock
    if (newQuantity < 0) return;
    if (newQuantity > availableStock) {
      alert(`Sorry, only ${availableStock} unit(s) of "${item.name}" available in stock.`);
      return;
    }

    if (newQuantity > 0) {
      if (currentQuantity === 0) {
        const cz = customizations[item._id] || { size: 'medium', extras: [], instructions: '' };
        const large = item.sizePrices?.large ?? item.price;
        const medium = item.sizePrices?.medium ?? Math.round(((large * 2/3) + Number.EPSILON)*100)/100;
        const small = item.sizePrices?.small ?? Math.round(((large / 2) + Number.EPSILON)*100)/100;
        const base = cz.size === 'large' ? large : cz.size === 'small' ? small : medium;
        const ex = Array.isArray(cz.extras) ? cz.extras : [];
        const extrasCost = ex.reduce((sum, e) => sum + extraSurcharge(e), 0);
        const unitPrice = Math.round(base + extrasCost);
        addToCart({ ...item, customization: cz, unitPrice });
      } else {
        // find index of this item entry by id+size+extras
        const extrasKey = (arr) => (arr || []).map(x => String(x).toLowerCase()).sort().join('|');
        const currKey = extrasKey(extras);
        const idx = items.findIndex(ci => ci._id === item._id && (ci.customization?.size || 'medium') === size && extrasKey(ci.customization?.extras) === currKey);
        if (idx !== -1) updateQuantity(idx, newQuantity);
      }
    } else {
      // Remove from cart if quantity becomes 0
      const extrasKey = (arr) => (arr || []).map(x => String(x).toLowerCase()).sort().join('|');
      const currKey = extrasKey(extras);
      const idx = items.findIndex(ci => ci._id === item._id && (ci.customization?.size || 'medium') === size && extrasKey(ci.customization?.extras) === currKey);
      if (idx !== -1) {
        const itemToRemove = items[idx];
        updateQuantity(idx, 0); // This will filter out items with quantity 0
      }
    }
  };

  const formatPrice = (price) => {
    return `৳${Math.round(price)}`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '18px' }}>Loading menu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
        <div>{error}</div>
        <button 
          onClick={fetchMenuItems}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ 
          fontSize: '3rem',
          background: 'linear-gradient(135deg, #8B4513, #D2691E, #CD853F)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontWeight: 'bold',
          marginBottom: '0.5rem',
          fontFamily: 'serif',
          letterSpacing: '2px'
        }}>
          Coffee house Menu
        </h1>
        <p style={{ 
          color: '#5D4037', 
          fontSize: '1.1rem',
          fontStyle: 'italic',
          marginBottom: '2rem'
        }}>
          Discover our premium coffee experience
        </p>

        {/* Search Bar */}
        <div style={{ 
          maxWidth: '500px', 
          margin: '0 auto',
          position: 'relative'
        }}>
          <input
            type="text"
            placeholder="Search by name, description, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '1rem 3rem 1rem 1.5rem',
              fontSize: '1rem',
              border: '2px solid #8B4513',
              borderRadius: '25px',
              outline: 'none',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(139, 69, 19, 0.1)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#D2691E';
              e.target.style.boxShadow = '0 4px 20px rgba(139, 69, 19, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#8B4513';
              e.target.style.boxShadow = '0 4px 15px rgba(139, 69, 19, 0.1)';
            }}
          />
          <div style={{
            position: 'absolute',
            right: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#8B4513',
            fontSize: '1.2rem'
          }}>
            🔍
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem' }}>
          {categories.map(category => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              style={{
                padding: '0.8rem 1.5rem',
                border: '2px solid #8B4513',
                borderRadius: '30px',
                backgroundColor: selectedCategory === category.value ? '#8B4513' : 'white',
                color: selectedCategory === category.value ? 'white' : '#8B4513',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: selectedCategory === category.value 
                  ? '0 4px 12px rgba(139, 69, 19, 0.3)' 
                  : '0 2px 8px rgba(139, 69, 19, 0.1)'
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== category.value) {
                  e.target.style.backgroundColor = '#F5F5DC';
                  e.target.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== category.value) {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items Grid */}
      {filteredItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <h3>No items found</h3>
          <p>
            {searchTerm.trim() 
              ? `No items match "${searchTerm}". Try a different search term.`
              : selectedCategory !== 'all' 
                ? 'No items found in this category. Try selecting a different category.'
                : 'No items available. Check back later.'
            }
          </p>
          {(searchTerm.trim() || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              style={{
                marginTop: '1rem',
                padding: '0.8rem 1.5rem',
                background: 'linear-gradient(135deg, #8B4513, #CD853F)',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
            >
              Show All Items
            </button>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '2rem',
          padding: '1rem 0'
        }}>
          {filteredItems.map(item => {
            const itemQuantity = getItemQuantity(item._id);
            const rState = reviewsState[item._id] || { reviews: [], averageRating: 0, count: 0 };
            
            return (
              <div
                key={item._id}
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  backgroundColor: 'white',
                  boxShadow: '0 8px 25px rgba(139, 69, 19, 0.1)',
                  transition: 'all 0.4s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 15px 35px rgba(139, 69, 19, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(139, 69, 19, 0.1)';
                }}
              >
                {/* Image */}
                <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x200?text=Image+Not+Available';
                    }}
                  />
                  {!item.available && (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      Unavailable
                    </div>
                  )}
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    textTransform: 'capitalize'
                  }}>
                    {item.category}
                  </div>
                  {itemQuantity > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      minWidth: '24px',
                      textAlign: 'center'
                    }}>
                      {itemQuantity}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div style={{ padding: '1.5rem' }}>
                  {/* Rating summary */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                    <span title={`${rState.averageRating}/5 from ${rState.count} review(s)`}>
                      {'★'.repeat(rState.averageRating)}{'☆'.repeat(5 - rState.averageRating)}
                    </span>
                    <span style={{ color: '#8B4513', fontWeight: 600 }}>({rState.count})</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <h3 style={{ 
                      margin: '0', 
                      fontSize: '1.25rem', 
                      fontWeight: 'bold', 
                      color: '#333',
                      flex: '1'
                    }}>
                      {item.name}
                    </h3>
                    <span style={{
                      fontSize: '1.4rem',
                      fontWeight: 'bold',
                      background: 'linear-gradient(135deg, #8B4513, #D2691E)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      marginLeft: '1rem'
                    }}>
                      {(() => {
                        const cz = customizations[item._id] || { size: 'medium', extras: [] };
                        const large = item.sizePrices?.large ?? item.price;
                        const medium = item.sizePrices?.medium ?? Math.round(((large * 2/3) + Number.EPSILON)*100)/100;
                        const small = item.sizePrices?.small ?? Math.round(((large / 2) + Number.EPSILON)*100)/100;
                        const base = cz.size === 'large' ? large : cz.size === 'small' ? small : medium;
                  const extras = Array.isArray(cz.extras) ? cz.extras : [];
                  const extrasCost = extras.reduce((sum, ex) => sum + extraSurcharge(ex), 0);
                        const unitPrice = Math.round(base + extrasCost);
                        return formatPrice(unitPrice);
                      })()}
                    </span>
                  </div>

                  {/* Stock Information */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.85rem',
                      color: getStockStatus(item.stock).color,
                      fontWeight: '500'
                    }}>
                      {getStockStatus(item.stock).text}
                    </span>
                    {item.stock <= 5 && item.stock > 0 && (
                      <span style={{
                        backgroundColor: '#FFF3CD',
                        color: '#856404',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}>
                        Only {item.stock} left!
                      </span>
                    )}
                  </div>

                  <p style={{
                    margin: '0 0 1rem 0',
                    color: '#666',
                    fontSize: '0.9rem',
                    lineHeight: '1.5',
                    minHeight: '3rem'
                  }}>
                    {item.description}
                  </p>

                  {/* Customization Controls */}
                  <div style={{
                    backgroundColor: '#FFF7ED',
                    border: '1px solid #F5E6D3',
                    borderRadius: '12px',
                    padding: '0.75rem',
                    marginTop: '0.5rem'
                  }}>
                    {/* Size */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ color: '#5D4037', fontSize: '0.9rem', minWidth: 40 }}>Size:</span>
                      {['small','medium','large'].map(sz => (
                        <button key={sz}
                          onClick={() => setCustomizations(prev => ({
                            ...prev,
                            [item._id]: { ...(prev[item._id] || { size: 'medium', extras: [], instructions: '' }), size: sz }
                          }))}
                          style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: '999px',
                            border: '1px solid #D7CCC8',
                            backgroundColor: (customizations[item._id]?.size || 'medium') === sz ? '#8B4513' : 'white',
                            color: (customizations[item._id]?.size || 'medium') === sz ? 'white' : '#8B4513',
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                          }}
                        >{sz[0].toUpperCase()+sz.slice(1)}</button>
                      ))}
                    </div>

                    {/* Extras */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      <span style={{ color: '#5D4037', fontSize: '0.9rem' }}>Extras:</span>
          {(categoryExtras[item.category] || []).map(extra => {
                        const active = (customizations[item._id]?.extras || []).includes(extra);
                        return (
                          <button key={extra}
                            onClick={() => setCustomizations(prev => {
                              const curr = prev[item._id] || { size: 'medium', extras: [], instructions: '' };
            // Only allow extras relevant to this item category
            const allowed = categoryExtras[item.category] || [];
            const exists = curr.extras.includes(extra);
            const nextList = exists ? curr.extras.filter(e => e !== extra) : [...curr.extras, extra];
            const newExtras = nextList.filter(e => allowed.includes(e));
                              return { ...prev, [item._id]: { ...curr, extras: newExtras } };
                            })}
                            style={{
                              padding: '0.3rem 0.7rem',
                              borderRadius: '999px',
                              border: '1px solid #D7CCC8',
                              backgroundColor: active ? '#D2691E' : 'white',
                              color: active ? 'white' : '#8B4513',
                              fontSize: '0.8rem',
                              cursor: 'pointer'
                            }}
                          >{extra}</button>
                        );
                      })}
                    </div>

                    {/* Instructions */}
                    <input
                      type="text"
                      placeholder="Special instructions (e.g., less ice)"
                      value={customizations[item._id]?.instructions || ''}
                      onChange={(e) => setCustomizations(prev => ({
                        ...prev,
                        [item._id]: { ...(prev[item._id] || { size: 'medium', extras: [], instructions: '' }), instructions: e.target.value }
                      }))}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.8rem',
                        borderRadius: '8px',
                        border: '1px solid #E0E0E0',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Reviews Section - Better Organized */}
                  <div style={{
                    marginTop: '1rem',
                    borderTop: '1px solid #F0E6D2',
                    paddingTop: '1rem'
                  }}>
                    {/* Review Summary Header */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.75rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: '#5D4037'
                        }}>
                          Customer Reviews
                        </span>
                        <span style={{
                          backgroundColor: '#8B4513',
                          color: 'white',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold'
                        }}>
                          {rState.count}
                        </span>
                      </div>
                      <button
                        onClick={() => setExpandedReviews(prev => ({ ...prev, [item._id]: !prev[item._id] }))}
                        style={{
                          background: expandedReviews[item._id] ? '#8B4513' : 'transparent',
                          color: expandedReviews[item._id] ? 'white' : '#8B4513',
                          border: '1px solid #8B4513',
                          padding: '0.4rem 0.8rem',
                          borderRadius: '20px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: '500',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {expandedReviews[item._id] ? 'Hide Reviews' : 'Show Reviews'}
                      </button>
                    </div>

                    {/* Average Rating Display */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.75rem',
                      padding: '0.5rem',
                      backgroundColor: '#FFF8F0',
                      borderRadius: '8px',
                      border: '1px solid #F5E6D3'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {[...Array(5)].map((_, i) => (
                          <span key={i} style={{
                            fontSize: '1.1rem',
                            color: i < rState.averageRating ? '#FFD700' : '#E0E0E0'
                          }}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span style={{
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: '#5D4037'
                      }}>
                        {rState.averageRating.toFixed(1)} out of 5
                      </span>
                      <span style={{
                        fontSize: '0.8rem',
                        color: '#8B7355'
                      }}>
                        ({rState.count} {rState.count === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>

                    {/* Review Submission - Only show when expanded */}
                    {expandedReviews[item._id] && isAuthenticated && user?.role !== 'admin' && (
                      <div style={{
                        marginBottom: '1rem',
                        padding: '1rem',
                        backgroundColor: '#F9F6F0',
                        borderRadius: '12px',
                        border: '1px solid #E8DCC0'
                      }}>
                        <h4 style={{
                          margin: '0 0 0.75rem 0',
                          fontSize: '0.9rem',
                          color: '#5D4037',
                          fontWeight: '600'
                        }}>
                          Share Your Experience
                        </h4>
                        <ReviewEditor
                          itemId={item._id}
                          rState={rState}
                          onUpdated={(val) => setReviewsState(s => ({ ...s, [item._id]: val }))}
                        />
                      </div>
                    )}

                    {/* Reviews List */}
                    {expandedReviews[item._id] && (
                      <div style={{
                        maxHeight: '400px',
                        overflowY: 'auto',
                        border: '1px solid #F0E6D2',
                        borderRadius: '12px',
                        backgroundColor: '#FAF7F0'
                      }}>
                        {(rState.reviews || []).length === 0 ? (
                          <div style={{
                            padding: '2rem',
                            textAlign: 'center',
                            color: '#8B7355',
                            fontSize: '0.9rem'
                          }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📝</div>
                            <div>No reviews yet. Be the first to share your thoughts!</div>
                          </div>
                        ) : (
                          <div style={{ padding: '0.5rem' }}>
                            {(rState.reviews || []).map(rv => (
                              <div key={rv._id} style={{
                                marginBottom: '1rem',
                                padding: '1rem',
                                backgroundColor: 'white',
                                borderRadius: '10px',
                                border: '1px solid #F0E6D2',
                                boxShadow: '0 2px 4px rgba(139, 69, 19, 0.05)'
                              }}>
                                {/* Review Header */}
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  justifyContent: 'space-between',
                                  marginBottom: '0.75rem'
                                }}>
                                  <div style={{ flex: '1' }}>
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.5rem',
                                      marginBottom: '0.25rem'
                                    }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.1rem' }}>
                                        {[...Array(5)].map((_, i) => (
                                          <span key={i} style={{
                                            fontSize: '1rem',
                                            color: i < rv.rating ? '#FFD700' : '#E0E0E0'
                                          }}>
                                            ★
                                          </span>
                                        ))}
                                      </div>
                                      <span style={{
                                        fontSize: '0.8rem',
                                        color: '#8B7355',
                                        fontWeight: '500'
                                      }}>
                                        {rv.rating}/5
                                      </span>
                                    </div>
                                    <div style={{
                                      fontSize: '0.9rem',
                                      color: '#333',
                                      lineHeight: '1.4',
                                      marginBottom: '0.5rem'
                                    }}>
                                      {rv.comment || 'No comment provided'}
                                    </div>
                                    <div style={{
                                      fontSize: '0.75rem',
                                      color: '#8B7355',
                                      fontWeight: '500'
                                    }}>
                                      By {rv.user?.name || 'Anonymous'} • {new Date(rv.createdAt).toLocaleDateString()}
                                    </div>
                                  </div>

                                  {/* Delete Button */}
                                  {(isAuthenticated && (user?.role === 'admin' || rv.user?._id === user?._id)) && (
                                    <button
                                      onClick={async () => {
                                        if (!window.confirm('Are you sure you want to delete this review?')) return;
                                        try {
                                          const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
                                          await axios.delete(`${API_URL}/api/reviews/${rv._id}`, {
                                            headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
                                          });
                                          const fres = await axios.get(`${API_URL}/api/reviews/item/${item._id}`);
                                          setReviewsState(s => ({ ...s, [item._id]: fres.data }));
                                        } catch (e) {
                                          alert('Failed to delete review');
                                        }
                                      }}
                                      style={{
                                        background: 'transparent',
                                        border: '1px solid #DC3545',
                                        color: '#DC3545',
                                        padding: '0.3rem 0.6rem',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '0.75rem',
                                        marginLeft: '0.5rem'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#DC3545';
                                        e.target.style.color = 'white';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                        e.target.style.color = '#DC3545';
                                      }}
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>

                                {/* Admin Replies */}
                                {rv.replies && rv.replies.length > 0 && (
                                  <div style={{
                                    marginTop: '1rem',
                                    padding: '0.75rem',
                                    backgroundColor: '#FFF8F0',
                                    borderRadius: '8px',
                                    border: '1px solid #F5E6D3'
                                  }}>
                                    <div style={{
                                      fontSize: '0.8rem',
                                      fontWeight: '600',
                                      color: '#8B4513',
                                      marginBottom: '0.5rem'
                                    }}>
                                      Admin Response{rv.replies.length > 1 ? 's' : ''}:
                                    </div>
                                    {rv.replies.map((rep, idx) => (
                                      <div key={idx} style={{
                                        marginBottom: idx < rv.replies.length - 1 ? '0.5rem' : 0,
                                        padding: '0.5rem',
                                        backgroundColor: 'white',
                                        borderRadius: '6px',
                                        border: '1px solid #E8DCC0'
                                      }}>
                                        <div style={{
                                          fontSize: '0.8rem',
                                          color: '#5D4037',
                                          fontWeight: '500',
                                          marginBottom: '0.25rem'
                                        }}>
                                          {rep.admin?.name || 'Admin'}:
                                        </div>
                                        <div style={{
                                          fontSize: '0.85rem',
                                          color: '#333',
                                          lineHeight: '1.3'
                                        }}>
                                          {rep.reply}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Admin Reply Input */}
                                {isAuthenticated && user?.role === 'admin' && (
                                  <div style={{
                                    marginTop: '1rem',
                                    paddingTop: '0.75rem',
                                    borderTop: '1px solid #F0E6D2'
                                  }}>
                                    <ReplyEditor
                                      reviewId={rv._id}
                                      onReplied={(updatedReview) => {
                                        const newReviews = rState.reviews.map(r => r._id === rv._id ? updatedReview : r);
                                        setReviewsState(s => ({ ...s, [item._id]: { ...rState, reviews: newReviews } }));
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Cart Controls */}
                  {itemQuantity > 0 && isAuthenticated && user?.role !== 'admin' ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: '#F5F5DC',
                      padding: '0.8rem',
                      borderRadius: '12px',
                      marginTop: '1rem'
                    }}>
                      <button
                        onClick={() => handleQuantityChange(item, -1)}
                        disabled={itemQuantity <= 0}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          border: '2px solid #8B4513',
                          backgroundColor: itemQuantity <= 0 ? '#ccc' : 'white',
                          color: itemQuantity <= 0 ? '#999' : '#8B4513',
                          cursor: itemQuantity <= 0 ? 'not-allowed' : 'pointer',
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (itemQuantity > 0) {
                            e.target.style.backgroundColor = '#8B4513';
                            e.target.style.color = 'white';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (itemQuantity > 0) {
                            e.target.style.backgroundColor = 'white';
                            e.target.style.color = '#8B4513';
                          }
                        }}
                      >
                        -
                      </button>
                      
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          fontSize: '1.3rem',
                          fontWeight: 'bold',
                          color: '#333'
                        }}>
                          {itemQuantity}
                        </div>
                        <div style={{
                          fontSize: '0.9rem',
                          color: '#666'
                        }}>
                          in cart
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleQuantityChange(item, 1)}
                        disabled={itemQuantity >= item.stock}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          border: '2px solid #8B4513',
                          backgroundColor: itemQuantity >= item.stock ? '#ccc' : 'white',
                          color: itemQuantity >= item.stock ? '#999' : '#8B4513',
                          cursor: itemQuantity >= item.stock ? 'not-allowed' : 'pointer',
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (itemQuantity < item.stock) {
                            e.target.style.backgroundColor = '#8B4513';
                            e.target.style.color = 'white';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (itemQuantity < item.stock) {
                            e.target.style.backgroundColor = 'white';
                            e.target.style.color = '#8B4513';
                          }
                        }}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={!item.available || item.stock === 0 || !isAuthenticated || user?.role === 'admin'}
                      style={{
                        width: '100%',
                        marginTop: '1rem',
                        padding: '1rem',
                        background: (item.available && (item.stock !== 0) && isAuthenticated && user?.role !== 'admin')
                          ? 'linear-gradient(135deg, #8B4513, #CD853F)' 
                          : '#ccc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: (item.available && (item.stock !== 0) && isAuthenticated && user?.role !== 'admin') ? 'pointer' : 'not-allowed',
                        transition: 'all 0.3s ease',
                        boxShadow: (item.available && (item.stock !== 0)) 
                          ? '0 4px 12px rgba(139, 69, 19, 0.3)' 
                          : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (item.available && (item.stock !== 0) && isAuthenticated && user?.role !== 'admin') {
                          e.target.style.background = 'linear-gradient(135deg, #6F3410, #A0522D)';
                          e.target.style.transform = 'translateY(-2px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (item.available && (item.stock !== 0) && isAuthenticated && user?.role !== 'admin') {
                          e.target.style.background = 'linear-gradient(135deg, #8B4513, #CD853F)';
                          e.target.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      {!isAuthenticated ? 'Login to Add' : user?.role === 'admin' ? 'Not for Admin' : (!item.available || item.stock === 0) ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Inline component for adding/updating review
function ReviewEditor({ itemId, rState, onUpdated }){
  const { isAuthenticated } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(()=>{ setRating(5); setComment(''); }, [itemId]);

  const submit = async () => {
    if (!isAuthenticated) return;
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token') || '';
      await axios.post(`${API_URL}/api/reviews/item/${itemId}`, { rating, comment }, { headers: { Authorization: `Bearer ${token}` } });
      const fres = await axios.get(`${API_URL}/api/reviews/item/${itemId}`);
      onUpdated && onUpdated(fres.data);
      setComment('');
    } catch (e) { alert('Failed to submit review'); }
  };

  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <select value={rating} onChange={(e)=>setRating(parseInt(e.target.value,10))} style={{ padding:'4px 6px', borderRadius:6, border:'1px solid #D7CCC8' }}>
        {[1,2,3,4,5].map(n=> <option key={n} value={n}>{n}★</option>)}
      </select>
      <input type="text" placeholder="Write a review" value={comment} onChange={(e)=>setComment(e.target.value)} style={{ padding:'6px 8px', borderRadius:6, border:'1px solid #E0E0E0' }}/>
      <button onClick={submit} style={{ padding:'6px 10px', borderRadius:6, background:'#8B4513', color:'#fff', border:'none', cursor:'pointer' }}>Post</button>
    </div>
  );
}

// Inline component for admin to reply to a review
function ReplyEditor({ reviewId, onReplied }){
  const [reply, setReply] = useState('');
  const { isAuthenticated, user } = useAuth();

  const submitReply = async () => {
    if (!reply.trim()) return;
    if (!isAuthenticated || user?.role !== 'admin') {
      alert('Only admins can reply to reviews');
      return;
    }
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token') || '';
      const res = await axios.post(`${API_URL}/api/reviews/${reviewId}/reply`, { reply }, { headers: { Authorization: `Bearer ${token}` } });
      onReplied && onReplied(res.data);
      setReply('');
    } catch (e) {
      console.error('Reply submission error:', e);
      alert('Failed to submit reply: ' + (e.response?.data?.error || e.message));
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null; // Don't show reply input for non-admins
  }

  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginTop: '0.5rem' }}>
      <input type="text" placeholder="Admin reply" value={reply} onChange={(e)=>setReply(e.target.value)} style={{ flex:1, padding:'4px 8px', borderRadius:6, border:'1px solid #E0E0E0', fontSize: '0.8rem' }}/>
      <button onClick={submitReply} style={{ padding:'4px 8px', borderRadius:6, background:'#28a745', color:'#fff', border:'none', cursor:'pointer', fontSize: '0.8rem' }}>Reply</button>
    </div>
  );
}
