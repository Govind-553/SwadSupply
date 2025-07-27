import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../../services/firebase';
import MapComponent from '../shared/MapComponent';

const OrderTracking = ({ orderId, onClose }) => {
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    // Listen for order updates
    const orderRef = ref(database, `orders/${orderId}`);
    const unsubscribe = onValue(orderRef, (snapshot) => {
      const orderData = snapshot.val();
      if (orderData) {
        setOrder(orderData);
      }
      setLoading(false);
    });

    // Mock tracking data - in production, integrate with delivery service
    setTracking({
      status: 'out_for_delivery',
      estimatedDelivery: '30 minutes',
      currentLocation: { lat: 18.5204, lng: 73.8567 },
      deliveryRoute: [
        { lat: 18.5204, lng: 73.8567, time: '2:00 PM', status: 'Order picked up' },
        { lat: 18.5304, lng: 73.8467, time: '2:15 PM', status: 'In transit' },
        { lat: 18.5404, lng: 73.8367, time: '2:30 PM', status: 'Arriving soon' }
      ]
    });

    return () => unsubscribe();
  }, [orderId]);

  if (loading) {
    return <div className="loading">Loading order details...</div>;
  }

  if (!order) {
    return <div className="error">Order not found</div>;
  }

  const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: '📝' },
    { key: 'confirmed', label: 'Confirmed', icon: '✅' },
    { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
    { key: 'shipped', label: 'Out for Delivery', icon: '🚚' },
    { key: 'delivered', label: 'Delivered', icon: '🏠' }
  ];

  const currentStepIndex = statusSteps.findIndex(step => step.key === order.status);

  return (
    <div className="order-tracking-modal">
      <div className="tracking-content">
        <div className="tracking-header">
          <h2>Track Order #{orderId.slice(-8)}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="order-summary">
          <div className="order-info">
            <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> ₹{order.totalAmount.toLocaleString()}</p>
            <p><strong>Delivery Address:</strong> {order.deliveryAddress}</p>
          </div>
        </div>

        <div className="status-timeline">
          <h3>Order Status</h3>
          <div className="timeline">
            {statusSteps.map((step, index) => (
              <div 
                key={step.key} 
                className={`timeline-step ${index <= currentStepIndex ? 'completed' : ''} ${index === currentStepIndex ? 'current' : ''}`}
              >
                <div className="step-icon">{step.icon}</div>
                <div className="step-info">
                  <div className="step-label">{step.label}</div>
                  {index === currentStepIndex && tracking && (
                    <div className="step-eta">ETA: {tracking.estimatedDelivery}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {tracking && order.status === 'shipped' && (
          <div className="live-tracking">
            <h3>Live Tracking</h3>
            <MapComponent
              center={[tracking.currentLocation.lat, tracking.currentLocation.lng]}
              markers={[
                {
                  lat: tracking.currentLocation.lat,
                  lng: tracking.currentLocation.lng,
                  popup: 'Delivery vehicle current location'
                }
              ]}
              height="300px"
            />
            
            <div className="delivery-updates">
              {tracking.deliveryRoute.map((update, index) => (
                <div key={index} className="delivery-update">
                  <div className="update-time">{update.time}</div>
                  <div className="update-status">{update.status}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="order-items">
          <h3>Order Items</h3>
          {order.items.map((item, index) => (
            <div key={index} className="tracking-order-item">
              <span>{item.name}</span>
              <span>{item.quantity} {item.unit}</span>
              <span>₹{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
