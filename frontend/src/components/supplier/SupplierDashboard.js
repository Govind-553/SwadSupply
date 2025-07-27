import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../../services/firebase';
import ManageInventory from './ManageInventory';
import OrderManagement from './OrderManagement';
import Analytics from './Analytics';

const SupplierDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('orders');
  const [userProfile, setUserProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Fetch user profile
    const userRef = ref(database, `users/${user.uid}`);
    onValue(userRef, (snapshot) => {
      setUserProfile(snapshot.val());
    });

    // Fetch supplier orders
    const ordersRef = ref(database, `orders`);
    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const supplierOrders = Object.keys(data)
          .map(key => ({ id: key, ...data[key] }))
          .filter(order => order.supplierId === user.uid)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(supplierOrders);
      }
    });

    // Fetch supplier products
    const productsRef = ref(database, `products`);
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const supplierProducts = Object.keys(data)
          .map(key => ({ id: key, ...data[key] }))
          .filter(product => product.supplierId === user.uid);
        setProducts(supplierProducts);
      }
    });
  }, [user.uid]);

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    completedOrders: orders.filter(o => o.status === 'delivered').length,
    totalRevenue: orders.filter(o => o.status === 'delivered').reduce((sum, order) => sum + (order.totalAmount || 0), 0),
    activeProducts: products.length,
    averageRating: 4.2 // This should be calculated from actual ratings
  };

  return (
    <div className="supplier-dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome, {userProfile?.name || user.displayName}! 🏪</h1>
          <p>Manage your inventory and fulfill orders from local vendors</p>
        </div>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.totalOrders}</div>
            <div className="stat-label">Total Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.pendingOrders}</div>
            <div className="stat-label">Pending Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">₹{stats.totalRevenue.toLocaleString()}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.activeProducts}</div>
            <div className="stat-label">Active Products</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">⭐ {stats.averageRating}</div>
            <div className="stat-label">Average Rating</div>
          </div>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          📦 Orders
        </button>
        <button 
          className={`tab ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          📋 Inventory
        </button>
        <button 
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'orders' && <OrderManagement orders={orders} user={user} />}
        {activeTab === 'inventory' && <ManageInventory products={products} user={user} />}
        {activeTab === 'analytics' && <Analytics orders={orders} products={products} />}
      </div>
    </div>
  );
};

export default SupplierDashboard;