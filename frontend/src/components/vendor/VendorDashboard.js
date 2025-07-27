import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../../services/firebase';
import BrowseMaterials from './BrowseMaterials';
import OrderHistory from './OrderHistory';
import VoiceOrder from './VoiceOrder';

const VendorDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('browse');
  const [userProfile, setUserProfile] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Fetch user profile
    const userRef = ref(database, `users/${user.uid}`);
    onValue(userRef, (snapshot) => {
      setUserProfile(snapshot.val());
    });

    // Fetch user orders
    const ordersRef = ref(database, `orders`);
    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userOrders = Object.keys(data)
          .map(key => ({ id: key, ...data[key] }))
          .filter(order => order.vendorId === user.uid)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(userOrders);
      }
    });
  }, [user.uid]);

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    completedOrders: orders.filter(o => o.status === 'delivered').length,
    totalSpent: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
  };

  return (
    <div className="vendor-dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {userProfile?.name || user.displayName}! 🍛</h1>
          <p>Manage your raw material orders and discover new suppliers</p>
        </div>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.totalOrders}</div>
            <div className="stat-label">Total Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.pendingOrders}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.completedOrders}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">₹{stats.totalSpent.toLocaleString()}</div>
            <div className="stat-label">Total Spent</div>
          </div>
        </div>
          </div>
      
    <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          🛒 Browse Materials
        </button>
        <button 
          className={`tab ${activeTab === 'voice' ? 'active' : ''}`}
          onClick={() => setActiveTab('voice')}
        >
          🎤 Voice Order
        </button>
        <button 
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📋 Order History
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'browse' && <BrowseMaterials user={user} />}
        {activeTab === 'voice' && <VoiceOrder user={user} />}
        {activeTab === 'history' && <OrderHistory orders={orders} />}
      </div>
    </div>
  );
};

export default VendorDashboard;
  