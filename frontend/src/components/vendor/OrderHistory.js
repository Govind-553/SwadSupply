import React, { useState } from 'react';
import { ref, update } from 'firebase/database';
import { database } from '../../services/firebase';
import OrderTracking from './OrderTracking';

const OrderHistory = ({ orders }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [trackingOrderId, setTrackingOrderId] = useState(null);

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

  const cancelOrder = async (orderId) => {
    const confirmCancel = window.confirm('Are you sure you want to cancel this order?');
    if (!confirmCancel) return;

    try {
      await update(ref(database, `orders/${orderId}`), {
        status: 'cancelled',
        updatedAt: new Date().toISOString(),
        cancelledAt: new Date().toISOString()
      });
      alert('Order cancelled successfully!');
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order. Please try again.');
    }
  };

  const rateOrder = async (orderId) => {
    const rating = prompt('Rate this order (1-5 stars):');
    if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
      alert('Please enter a valid rating between 1-5');
      return;
    }

    const review = prompt('Leave a review (optional):') || '';

    try {
      // Add review to the order
      await update(ref(database, `orders/${orderId}`), {
        rating: parseInt(rating),
        review: review,
        reviewedAt: new Date().toISOString()
      });

      // You can also add this to a separate reviews collection
      // for better analytics and supplier rating calculations

      alert('Thank you for your review!');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  const trackOrder = (orderId) => {
    setTrackingOrderId(orderId);
  };

  return (
    <div className="order-history">
      <div className="history-header">
        <h2>📋 Order History</h2>
        <div className="status-filters">
          <button 
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All Orders ({orders.length})
          </button>
          {Object.keys(statusColors).map(status => {
            const count = orders.filter(order => order.status === status).length;
            return (
              <button 
                key={status}
                className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
                onClick={() => setFilterStatus(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
              </button>
            );
          })}
        </div>
      </div>

      <div className="orders-list">
        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <p>
              {filterStatus === 'all' 
                ? 'No orders found. Start ordering some raw materials!' 
                : `No ${filterStatus} orders found.`
              }
            </p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <div className="order-id">Order #{order.id.slice(-8)}</div>
                  <div className="supplier-name">Supplier: {order.supplierName || 'Unknown'}</div>
                </div>
                <div 
                  className="order-status"
                  style={{ backgroundColor: statusColors[order.status] }}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </div>
              </div>
              
              <div className="order-date">
                Ordered: {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
                {order.estimatedDelivery && (
                  <div className="estimated-delivery">
                    Expected: {new Date(order.estimatedDelivery).toLocaleDateString('en-IN')}
                  </div>
                )}
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
                  {order.rating && (
                    <div className="order-rating">
                      {'⭐'.repeat(order.rating)} ({order.rating}/5)
                    </div>
                  )}
                </div>
                <div className="order-actions">
                  {order.status === 'delivered' && !order.rating && (
                    <button 
                      className="rate-btn"
                      onClick={() => rateOrder(order.id)}
                    >
                      Rate Order
                    </button>
                  )}
                  {['pending', 'confirmed'].includes(order.status) && (
                    <button 
                      className="cancel-btn"
                      onClick={() => cancelOrder(order.id)}
                    >
                      Cancel Order
                    </button>
                  )}
                  {!['cancelled', 'delivered'].includes(order.status) && (
                    <button 
                      className="track-btn"
                      onClick={() => trackOrder(order.id)}
                    >
                      Track Order
                    </button>
                  )}
                  {order.status === 'delivered' && order.rating && (
                    <span className="reviewed-badge">✅ Reviewed</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Tracking Modal */}
      {trackingOrderId && (
        <OrderTracking 
          orderId={trackingOrderId}
          onClose={() => setTrackingOrderId(null)}
        />
      )}
    </div>
  );
};

export default OrderHistory;