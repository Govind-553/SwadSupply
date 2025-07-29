import React, { useState, useEffect } from 'react';
import { ref, onValue, push} from 'firebase/database';
import { database } from '../../services/firebase';

const BrowseMaterials = ({ user }) => {
  const [products, setProducts] = useState([]);
  const [mandiPrices, setMandiPrices] = useState({});
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userProfile, setUserProfile] = useState(null);

  const categories = ['all', 'vegetables', 'spices', 'oils', 'grains', 'dairy'];

  useEffect(() => {
    // Fetch user profile for delivery address
    const userRef = ref(database, `users/${user.uid}`);
    onValue(userRef, (snapshot) => {
      setUserProfile(snapshot.val());
    });

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
  }, [user.uid]);

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
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    if (!userProfile) {
      alert('Please complete your profile first!');
      return;
    }

    try {
      // Group cart items by supplier
      const ordersBySupplier = {};
      
      cart.forEach(item => {
        const supplierId = item.supplierId;
        if (!ordersBySupplier[supplierId]) {
          ordersBySupplier[supplierId] = {
            supplierId: supplierId,
            supplierName: item.supplierName,
            items: [],
            totalAmount: 0
          };
        }
        
        ordersBySupplier[supplierId].items.push({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          unit: item.unit
        });
        
        ordersBySupplier[supplierId].totalAmount += item.price * item.quantity;
      });

      // Create separate orders for each supplier
      const orderPromises = Object.values(ordersBySupplier).map(async (supplierOrder) => {
        const orderData = {
          vendorId: user.uid,
          vendorName: user.displayName || userProfile.name,
          vendorPhone: userProfile.phone || 'Not provided',
          vendorEmail: user.email,
          supplierId: supplierOrder.supplierId,
          supplierName: supplierOrder.supplierName,
          items: supplierOrder.items,
          totalAmount: supplierOrder.totalAmount,
          status: 'pending',
          deliveryAddress: userProfile.address || 'Address not provided',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
        };

        const ordersRef = ref(database, 'orders');
        return await push(ordersRef, orderData);
      });

      await Promise.all(orderPromises);
      
      setCart([]);
      alert(`Successfully placed ${Object.keys(ordersBySupplier).length} order(s)!`);
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
                <img 
                  src={product.image || '/placeholder-product.jpg'} 
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = '/placeholder-product.jpg';
                  }}
                />
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
                  <span>📍 {product.supplierName}</span>
                  <span>📦 Stock: {product.quantity} {product.unit}</span>
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