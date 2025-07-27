import React, { useState } from 'react';
import { ref, update } from 'firebase/database';
import { database } from '../../services/firebase';

const OrderManagement = ({ orders, user }) => {
  const [selectedStatus, setSelectedStatus] = useState('all');

  const statusOptions = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await update(ref(database, `orders/${orderId}`), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      alert('Order status updated successfully!');
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedStatus);

  return (
    <div className="order-management">
      <div className="orders-header">
        <h2>📦 Order Management</h2>
        <div className="status-filter">
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="status-select"
          >
            <option value="all">All Orders</option>
            {Object.entries(statusOptions).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="orders-grid">
        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <p>No orders found for the selected status.</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="order-management-card">
              <div className="order-card-header">
                <div className="order-info">
                  <h3>Order #{order.id.slice(-8)}</h3>
                  <p className="order-date">
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div className={`order-status status-${order.status}`}>
                  {statusOptions[order.status]}
                </div>
              </div>

              <div className="vendor-info">
                <p><strong>Vendor:</strong> {order.vendorName || 'Unknown'}</p>
                <p><strong>Phone:</strong> {order.vendorPhone || 'N/A'}</p>
                <p><strong>Address:</strong> {order.deliveryAddress}</p>
              </div>

              <div className="order-items-list">
                <h4>Items:</h4>
                {order.items.map((item, index) => (
                  <div key={index} className="order-item-row">
                    <span>{item.name}</span>
                    <span>{item.quantity} {item.unit}</span>
                    <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="order-total">
                <strong>Total: ₹{order.totalAmount.toLocaleString()}</strong>
              </div>

              <div className="order-actions">
                <select 
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                  className="status-update-select"
                >
                  {Object.entries(statusOptions).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <button className="view-details-btn">View Details</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderManagement;