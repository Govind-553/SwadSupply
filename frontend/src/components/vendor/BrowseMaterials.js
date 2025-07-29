import React, { useState, useEffect } from 'react';
import { ref, onValue, push} from 'firebase/database';
import { database } from '../../services/firebase';

const BrowseMaterials = ({ user }) => {
  const [products, setProducts] = useState([]);
  const [mandiPrices, setMandiPrices] = useState({});
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'vegetables', 'spices', 'oils', 'grains', 'dairy'];

  useEffect(() => {
    // Fetch products
    const productsRef = ref(database, 'products');
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productsList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setProducts(productsList);
      }
      setLoading(false);
    });

    // Fetch mandi prices
    fetchMandiPrices();
  }, []);

  const fetchMandiPrices = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/mandi-prices`);
      const data = await response.json();
      setMandiPrices(data);
    } catch (error) {
      console.error('Error fetching mandi prices:', error);
    }
  };

  const addToCart = (product, quantity = 1) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item => 
        item.id === productId 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const placeOrder = async () => {
    if (cart.length === 0) return;

    try {
      const order = {
        vendorId: user.uid,
        items: cart,
        totalAmount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        status: 'pending',
        createdAt: new Date().toISOString(),
        deliveryAddress: 'User Address', // This should come from user profile
      };

      const ordersRef = ref(database, 'orders');
      await push(ordersRef, order);
      
      setCart([]);
      alert('Order placed successfully!');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="browse-materials">
      <div className="browse-header">
        <h2>🛒 Browse Raw Materials</h2>
        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.map(product => {
          const mandiPrice = mandiPrices[product.name] || 0;
          const priceDifference = product.price - mandiPrice;
          const priceStatus = priceDifference > 0 ? 'higher' : priceDifference < 0 ? 'lower' : 'same';
          
          return (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <img src={product.image || '/placeholder-product.jpg'} alt={product.name} />
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="price-info">
                  <div className="current-price">₹{product.price}/{product.unit}</div>
                  {mandiPrice > 0 && (
                    <div className={`mandi-comparison ${priceStatus}`}>
                      Mandi: ₹{mandiPrice}/{product.unit}
                      {priceDifference !== 0 && (
                        <span className="price-diff">
                          {priceDifference > 0 ? '+' : ''}₹{Math.abs(priceDifference)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="supplier-info">
                  <span>📍 {product.supplierLocation}</span>
                  <span>⭐ {product.supplierRating || '4.5'}</span>
                </div>
                <div className="product-actions">
                  <div className="quantity-controls">
                    <button onClick={() => updateCartQuantity(product.id, (cart.find(item => item.id === product.id)?.quantity || 0) - 1)}>-</button>
                    <span>{cart.find(item => item.id === product.id)?.quantity || 0}</span>
                    <button onClick={() => addToCart(product, 1)}>+</button>
                  </div>
                  <button className="add-to-cart-btn" onClick={() => addToCart(product, 1)}>
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {cart.length > 0 && (
        <div className="cart-summary">
          <div className="cart-header">
            <h3>🛒 Cart ({cart.length} items)</h3>
            <button className="place-order-btn" onClick={placeOrder}>
              Place Order - ₹{cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}
            </button>
          </div>
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <span>{item.name}</span>
                <div className="cart-item-controls">
                  <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)}>+</button>
                  <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                  <button onClick={() => removeFromCart(item.id)} className="remove-btn">×</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseMaterials;