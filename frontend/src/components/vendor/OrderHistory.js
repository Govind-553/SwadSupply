import React, { useState } from 'react';

const OrderHistory = ({ orders }) => {
  const [filterStatus, setFilterStatus] = useState('all');

  const statusColors = {
    pending: '#f59e0b',
    confirmed: '#3b82f6',
    preparing: '#8b5cf6',
    shipped: '#06b6d4',
    delivered: '#10b981',
    cancelled: '#ef4444'
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  return (
    <div className="order-history">
      <div className="history-header">
        <h2>📋 Order History</h2>
        <div className="status-filters">
          <button 
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All Orders
          </button>
          {Object.keys(statusColors).map(status => (
            <button 
              key={status}
              className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
              onClick={() => setFilterStatus(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="orders-list">
        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <p>No orders found for the selected filter.</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-id">Order #{order.id.slice(-8)}</div>
                <div 
                  className="order-status"
                  style={{ backgroundColor: statusColors[order.status] }}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </div>
              </div>
              
              <div className="order-date">
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>

              <div className="order-items">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <span className="item-name">{item.name}</span>
                    <span className="item-quantity">{item.quantity} {item.unit}</span>
                    <span className="item-price">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <div className="order-total">
                  <strong>Total: ₹{order.totalAmount.toLocaleString()}</strong>
                </div>
                <div className="order-actions">
                  {order.status === 'delivered' && (
                    <button className="rate-btn">Rate Order</button>
                  )}
                  {['pending', 'confirmed'].includes(order.status) && (
                    <button className="cancel-btn">Cancel Order</button>
                  )}
                  <button className="track-btn">Track Order</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderHistory;