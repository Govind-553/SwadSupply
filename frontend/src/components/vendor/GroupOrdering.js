import React, { useState, useEffect } from 'react';
import { ref, onValue, push, update } from 'firebase/database';
import { database } from '../../services/firebase';

const GroupOrdering = ({ user }) => {
  const [activeGroupOrders, setActiveGroupOrders] = useState([]);
  const [myGroupOrders, setMyGroupOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [newGroupOrder, setNewGroupOrder] = useState({
    productId: '',
    targetQuantity: '',
    myQuantity: '',
    maxPrice: '',
    expiryHours: 24,
    description: ''
  });

  useEffect(() => {
    // Fetch active group orders
    const groupOrdersRef = ref(database, 'groupOrders');
    onValue(groupOrdersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const orders = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        
        const active = orders.filter(order => 
          order.status === 'active' && 
          new Date(order.expiryDate) > new Date()
        );
        
        const mine = orders.filter(order => 
          order.createdBy === user.uid || 
          (order.participants && order.participants[user.uid])
        );
        
        setActiveGroupOrders(active);
        setMyGroupOrders(mine);
      }
      setLoading(false);
    });

    // Fetch products for creating group orders
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
    });
  }, [user.uid]);

  const handleCreateGroupOrder = async (e) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      alert('Please select a product');
      return;
    }

    try {
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + parseInt(newGroupOrder.expiryHours));

      const groupOrderData = {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        productImage: selectedProduct.image,
        productUnit: selectedProduct.unit,
        targetQuantity: parseInt(newGroupOrder.targetQuantity),
        currentQuantity: parseInt(newGroupOrder.myQuantity),
        maxPricePerUnit: parseFloat(newGroupOrder.maxPrice),
        expiryDate: expiryDate.toISOString(),
        description: newGroupOrder.description,
        createdBy: user.uid,
        createdByName: user.displayName,
        status: 'active',
        participants: {
          [user.uid]: {
            name: user.displayName,
            quantity: parseInt(newGroupOrder.myQuantity),
            joinedAt: new Date().toISOString()
          }
        },
        createdAt: new Date().toISOString()
      };

      await push(ref(database, 'groupOrders'), groupOrderData);
      
      // Reset form
      setNewGroupOrder({
        productId: '',
        targetQuantity: '',
        myQuantity: '',
        maxPrice: '',
        expiryHours: 24,
        description: ''
      });
      setSelectedProduct(null);
      setShowCreateForm(false);
      
      alert('Group order created successfully!');
    } catch (error) {
      console.error('Error creating group order:', error);
      alert('Failed to create group order');
    }
  };

  const joinGroupOrder = async (groupOrderId) => {
    const quantity = prompt('How much quantity do you want to order?');
    if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    try {
      const groupOrderRef = ref(database, `groupOrders/${groupOrderId}`);
      const participantData = {
        [`participants/${user.uid}`]: {
          name: user.displayName,
          quantity: parseInt(quantity),
          joinedAt: new Date().toISOString()
        }
      };

      // Update current quantity
      const groupOrder = activeGroupOrders.find(order => order.id === groupOrderId);
      const newCurrentQuantity = groupOrder.currentQuantity + parseInt(quantity);
      
      await update(groupOrderRef, {
        ...participantData,
        currentQuantity: newCurrentQuantity,
        updatedAt: new Date().toISOString()
      });

      alert('Successfully joined the group order!');
    } catch (error) {
      console.error('Error joining group order:', error);
      alert('Failed to join group order');
    }
  };

  const completeGroupOrder = async (groupOrderId) => {
    try {
      await update(ref(database, `groupOrders/${groupOrderId}`), {
        status: 'completed',
        completedAt: new Date().toISOString()
      });

      // Here you would typically create individual orders for each participant
      // and notify suppliers
      
      alert('Group order completed! Individual orders will be created.');
    } catch (error) {
      console.error('Error completing group order:', error);
      alert('Failed to complete group order');
    }
  };

  const getProgress = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const getRemainingTime = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''} left`;
    }
    
    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    }
    
    return `${minutes}m left`;
  };

  if (loading) {
    return <div className="loading">Loading group orders...</div>;
  }

  return (
    <div className="group-ordering">
      <div className="group-ordering-header">
        <h2>🤝 Group Ordering</h2>
        <p>Join with other vendors to get better prices through bulk purchasing</p>
        
        <button 
          className="create-group-order-btn"
          onClick={() => setShowCreateForm(true)}
        >
          + Create Group Order
        </button>
      </div>

      {/* Create Group Order Form */}
      {showCreateForm && (
        <div className="group-order-form-modal">
          <div className="group-order-form">
            <div className="form-header">
              <h3>Create New Group Order</h3>
              <button 
                className="close-btn"
                onClick={() => setShowCreateForm(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreateGroupOrder}>
              <div className="form-group">
                <label>Select Product *</label>
                <select
                  value={selectedProduct?.id || ''}
                  onChange={(e) => {
                    const product = products.find(p => p.id === e.target.value);
                    setSelectedProduct(product);
                  }}
                  required
                >
                  <option value="">Choose a product...</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ₹{product.price}/{product.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Target Quantity *</label>
                  <input
                    type="number"
                    value={newGroupOrder.targetQuantity}
                    onChange={(e) => setNewGroupOrder({
                      ...newGroupOrder,
                      targetQuantity: e.target.value
                    })}
                    required
                    min="1"
                    placeholder="e.g., 100"
                  />
                </div>
                
                <div className="form-group">
                  <label>My Quantity *</label>
                  <input
                    type="number"
                    value={newGroupOrder.myQuantity}
                    onChange={(e) => setNewGroupOrder({
                      ...newGroupOrder,
                      myQuantity: e.target.value
                    })}
                    required
                    min="1"
                    placeholder="e.g., 20"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Max Price per Unit *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newGroupOrder.maxPrice}
                    onChange={(e) => setNewGroupOrder({
                      ...newGroupOrder,
                      maxPrice: e.target.value
                    })}
                    required
                    min="0"
                    placeholder="₹0.00"
                  />
                </div>
                
                <div className="form-group">
                  <label>Expires in (hours) *</label>
                  <select
                    value={newGroupOrder.expiryHours}
                    onChange={(e) => setNewGroupOrder({
                      ...newGroupOrder,
                      expiryHours: e.target.value
                    })}
                  >
                    <option value={6}>6 hours</option>
                    <option value={12}>12 hours</option>
                    <option value={24}>24 hours</option>
                    <option value={48}>48 hours</option>
                    <option value={72}>72 hours</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea
                  value={newGroupOrder.description}
                  onChange={(e) => setNewGroupOrder({
                    ...newGroupOrder,
                    description: e.target.value
                  })}
                  placeholder="Any special requirements or notes..."
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => setShowCreateForm(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button type="submit" className="create-btn">
                  Create Group Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Active Group Orders */}
      <div className="group-orders-section">
        <h3>🔥 Active Group Orders</h3>
        {activeGroupOrders.length === 0 ? (
          <div className="no-group-orders">
            <p>No active group orders at the moment. Create one to get started!</p>
          </div>
        ) : (
          <div className="group-orders-grid">
            {activeGroupOrders.map(order => {
              const progress = getProgress(order.currentQuantity, order.targetQuantity);
              const isParticipant = order.participants && order.participants[user.uid];
              const participantCount = order.participants ? Object.keys(order.participants).length : 0;
              
              return (
                <div key={order.id} className="group-order-card">
                  <div className="group-order-header">
                    <div className="product-info">
                      <img 
                        src={order.productImage || '/placeholder-product.jpg'} 
                        alt={order.productName}
                        className="product-image"
                      />
                      <div>
                        <h4>{order.productName}</h4>
                        <p>Max ₹{order.maxPricePerUnit}/{order.productUnit}</p>
                      </div>
                    </div>
                    <div className="time-remaining">
                      {getRemainingTime(order.expiryDate)}
                    </div>
                  </div>

                  <div className="group-order-progress">
                    <div className="progress-header">
                      <span>Progress: {order.currentQuantity}/{order.targetQuantity} {order.productUnit}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="group-order-meta">
                    <div className="participants">
                      👥 {participantCount} participant{participantCount !== 1 ? 's' : ''}
                    </div>
                    <div className="created-by">
                      Created by: {order.createdByName}
                    </div>
                  </div>

                  {order.description && (
                    <div className="group-order-description">
                      {order.description}
                    </div>
                  )}

                  <div className="group-order-actions">
                    {!isParticipant ? (
                      <button 
                        className="join-group-btn"
                        onClick={() => joinGroupOrder(order.id)}
                      >
                        Join Group Order
                      </button>
                    ) : (
                      <div className="participant-status">
                        ✅ You're participating ({order.participants[user.uid].quantity} {order.productUnit})
                      </div>
                    )}
                    
                    {order.createdBy === user.uid && progress >= 100 && (
                      <button 
                        className="complete-group-btn"
                        onClick={() => completeGroupOrder(order.id)}
                      >
                        Complete Order
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* My Group Orders */}
      <div className="my-group-orders-section">
        <h3>📋 My Group Orders</h3>
        {myGroupOrders.length === 0 ? (
          <div className="no-group-orders">
            <p>You haven't participated in any group orders yet.</p>
          </div>
        ) : (
          <div className="my-group-orders-list">
            {myGroupOrders.map(order => (
              <div key={order.id} className="my-group-order-item">
                <div className="order-info">
                  <h4>{order.productName}</h4>
                  <p>Status: <span className={`status-${order.status}`}>{order.status}</span></p>
                </div>
                <div className="order-quantity">
                  My Quantity: {order.participants && order.participants[user.uid] 
                    ? order.participants[user.uid].quantity 
                    : 0} {order.productUnit}
                </div>
                <div className="order-date">
                  {order.createdBy === user.uid ? 'Created' : 'Joined'}: {' '}
                  {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupOrdering;