import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      // Distinguish cart items by id + size to support size-based pricing
      const keyFor = (x) => {
        const size = (x.customization?.size || 'medium');
        const extras = (x.customization?.extras || []).map(v => String(v).toLowerCase()).sort().join('|');
        return `${x._id}__${size}__${extras}`;
      };
      const keyMatches = (a, b) => keyFor(a) === keyFor(b);
      const existingItem = state.items.find(item => keyMatches(item, action.payload));
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            keyMatches(item, action.payload)
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }]
      };

  case 'REMOVE_FROM_CART':
      return {
        ...state,
    items: state.items.filter((item, idx) => idx !== action.payload)
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map((item, index) =>
          index === action.payload.index
            ? { ...item, quantity: Math.max(0, action.payload.quantity) }
            : item
        ).filter(item => item.quantity > 0)
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };

    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload || []
      };

    default:
      return state;
  }
};

// Initial state
const initialState = {
  items: []
};

export function CartProvider({ children }) {
  const [cartState, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cafflare_cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: parsedCart });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('cafflare_cart', JSON.stringify(cartState.items));
  }, [cartState.items]);

  // Actions
  const addToCart = (item) => {
    dispatch({ type: 'ADD_TO_CART', payload: item });
  };

  const removeFromCart = (index) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: index });
  };

  const updateQuantity = (index, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { index, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  // Computed values
  const cartItemsCount = cartState.items.reduce((total, item) => total + item.quantity, 0);
  
  const cartTotal = cartState.items.reduce((total, item) => total + ((item.unitPrice ?? item.price) * item.quantity), 0);

  const getItemQuantity = (itemId, size = 'medium', extras = []) => {
    const extrasKey = (arr) => (arr || []).map(x => String(x).toLowerCase()).sort().join('|');
    const matchKey = `${itemId}__${size}__${extrasKey(extras)}`;
    const item = cartState.items.find(item => {
      const sizeVal = (item.customization?.size || 'medium');
      const key = `${item._id}__${sizeVal}__${extrasKey(item.customization?.extras)}`;
      return key === matchKey;
    });
    return item ? item.quantity : 0;
  };

  const isInCart = (itemId, size = 'medium', extras = []) => {
    const extrasKey = (arr) => (arr || []).map(x => String(x).toLowerCase()).sort().join('|');
    const matchKey = `${itemId}__${size}__${extrasKey(extras)}`;
    return cartState.items.some(item => {
      const sizeVal = (item.customization?.size || 'medium');
      const key = `${item._id}__${sizeVal}__${extrasKey(item.customization?.extras)}`;
      return key === matchKey;
    });
  };

  const value = {
    items: cartState.items,
    cartItemsCount,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemQuantity,
    isInCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
