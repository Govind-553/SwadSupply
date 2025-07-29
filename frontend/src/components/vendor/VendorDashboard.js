import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../../services/firebase';
import BrowseMaterials from './BrowseMaterials';
import OrderHistory from './OrderHistory';
import VoiceOrder from './VoiceOrder';
import GroupOrdering from './GroupOrdering';

const VendorDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('browse');
  const [userProfile, setUserProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user profile
    const userRef = ref(database, `users/${user.uid}`);
    const unsubscribeUser = onValue(userRef, (snapshot) => {
      const userData = snapshot.val();
      setUserProfile(userData);
      
      // Show profile completion reminder if incomplete
      if (!userData?.address || !userData?.phone) {
        console.warn('Please complete your profile for better ordering experience');
      }
    });

    // Fetch user orders with real-time updates
    const ordersRef = ref(database, 'orders');
    const unsubscribeOrders = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userOrders = Object.keys(data)
          .map(key => ({ id: key, ...data[key] }))
          .filter(order => order.vendorId === user.uid)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(userOrders);
      } else {
        setOrders([]);
      }
      setLoading(false);
    });

    // Cleanup subscriptions
    return () => {
      unsubscribeUser();
      unsubscribeOrders();
    };
  }, [user.uid]);

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    confirmedOrders: orders.filter(o => o.status === 'confirmed').length,
    shippedOrders: orders.filter(o => o.status === 'shipped').length,
    deliveredOrders: orders.filter(o => o.status === 'delivered').length,
    cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
    totalSpent: orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0),
    monthlySpent: orders
      .filter(o => {
        const orderDate = new Date(o.createdAt);
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        return o.status === 'delivered' && 
               orderDate.getMonth() === currentMonth && 
               orderDate.getFullYear() === currentYear;
      })
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0)
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="vendor-dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {userProfile?.name || user.displayName}! 🍛</h1>
          <p>Manage your raw material orders and discover new suppliers</p>
          {(!userProfile?.address || !userProfile?.phone) && (
            <div className="profile-warning">
              ⚠️ Please complete your profile to ensure smooth order delivery
            </div>
          )}
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
            <div className="stat-number">{stats.deliveredOrders}</div>
            <div className="stat-label">Delivered</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">₹{stats.totalSpent.toLocaleString()}</div>
            <div className="stat-label">Total Spent</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">₹{stats.monthlySpent.toLocaleString()}</div>
            <div className="stat-label">This Month</div>
          </div>
        </div>

        {/* Recent Activity Summary */}
        <div className="recent-activity">
          <h3>📊 Quick Overview</h3>
          <div className="activity-items">
            {stats.pendingOrders > 0 && (
              <div className="activity-item pending">
                🕐 {stats.pendingOrders} order{stats.pendingOrders > 1 ? 's' : ''} awaiting confirmation
              </div>
            )}
            {stats.shippedOrders > 0 && (
              <div className="activity-item shipped">
                🚚 {stats.shippedOrders} order{stats.shippedOrders > 1 ? 's' : ''} out for delivery
              </div>
            )}
            {stats.confirmedOrders > 0 && (
              <div className="activity-item confirmed">
                ✅ {stats.confirmedOrders} order{stats.confirmedOrders > 1 ? 's' : ''} being prepared
              </div>
            )}
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
          className={`tab ${activeTab === 'group' ? 'active' : ''}`}
          onClick={() => setActiveTab('group')}
        >
          🤝 Group Orders
        </button>
        <button 
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📋 Order History
          {stats.pendingOrders > 0 && (
            <span className="tab-badge">{stats.pendingOrders}</span>
          )}
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'browse' && <BrowseMaterials user={user} />}
        {activeTab === 'voice' && <VoiceOrder user={user} />}
        {activeTab === 'group' && <GroupOrdering user={user} />}
        {activeTab === 'history' && <OrderHistory orders={orders} />}
      </div>
    </div>
  );
};

export default VendorDashboard;