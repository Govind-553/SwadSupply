import React from 'react';

const OrderCard = ({ 
  order, 
  userRole = 'vendor',
  onViewDetails,
  onUpdateStatus,
  onTrackOrder,
  onCancelOrder,
  onRateOrder
}) => {
  const {
    id,
    total_amount,
    status,
    created_at,
    delivery_address,
    items = [],
    vendor_name,
    vendor_phone,
    supplier_name,
    estimated_delivery
  } = order;

  const statusConfig = {
    pending: { color: '#f59e0b', icon: '⏳', label: 'Pending' },
    confirmed: { color: '#3b82f6', icon: '✅', label: 'Confirmed' },
    preparing: { color: '#8b5cf6', icon: '👨‍🍳', label: 'Preparing' },
    shipped: { color: '#06b6d4', icon: '🚚', label: 'Shipped' },
    delivered: { color: '#10b981', icon: '📦', label: 'Delivered' },
    cancelled: { color: '#ef4444', icon: '❌', label: 'Cancelled' }
  };

  const currentStatus = statusConfig[status] || statusConfig.pending;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const canCancelOrder = () => {
    return ['pending', 'confirmed'].includes(status);
  };

  const canTrackOrder = () => {
    return ['confirmed', 'preparing', 'shipped'].includes(status);
  };

  const canRateOrder = () => {
    return status === 'delivered' && userRole === 'vendor';
  };

  const getOrderItemsSummary = () => {
    if (items.length === 0) return 'No items';
    if (items.length === 1) return items[0].name || items[0].product_name;
    return `${items[0].name || items[0].product_name} +${items.length - 1} more`;
  };

  return (
    <div className="order-card">
      <div className="order-header">
        <div className="order-id-section">
          <h3 className="order-id">Order #{id.toString().slice(-8)}</h3>
          <div className="order-date">{formatDate(created_at)}</div>
        </div>
        
        <div 
          className="order-status-badge"
          style={{ backgroundColor: currentStatus.color }}
        >
          <span className="status-icon">{currentStatus.icon}</span>
          <span className="status-text">{currentStatus.label}</span>
        </div>
      </div>

      <div className="order-content">
        {/* Customer/Vendor Info */}
        {userRole === 'supplier' && vendor_name && (
          <div className="customer-info">
            <div className="info-row">
              <span className="info-label">Customer:</span>
              <span className="info-value">{vendor_name}</span>
            </div>
            {vendor_phone && (
              <div className="info-row">
                <span className="info-label">Phone:</span>
                <span className="info-value">{vendor_phone}</span>
              </div>
            )}
          </div>
        )}

        {/* Supplier Info for Vendors */}
        {userRole === 'vendor' && supplier_name && (
          <div className="supplier-info">
            <div className="info-row">
              <span className="info-label">Supplier:</span>
              <span className="info-value">{supplier_name}</span>
            </div>
          </div>
        )}

        {/* Delivery Address */}
        {delivery_address && (
          <div className="delivery-info">
            <div className="info-row">
              <span className="info-label">Delivery:</span>
              <span className="info-value">{delivery_address}</span>
            </div>
          </div>
        )}

        {/* Estimated Delivery */}
        {estimated_delivery && status !== 'delivered' && (
          <div className="delivery-estimate">
            <div className="info-row">
              <span className="info-label">Expected:</span>
              <span className="info-value">{formatDate(estimated_delivery)}</span>
            </div>
          </div>
        )}

        {/* Order Items Summary */}
        <div className="order-items-summary">
          <div className="items-header">
            <span className="items-label">Items ({items.length}):</span>
            <span className="items-summary">{getOrderItemsSummary()}</span>
          </div>
          
          {items.length > 0 && (
            <div className="items-preview">
              {items.slice(0, 3).map((item, index) => (
                <div key={index} className="item-preview">
                  <span className="item-name">
                    {item.name || item.product_name}
                  </span>
                  <span className="item-quantity">
                    {item.quantity} {item.unit}
                  </span>
                  <span className="item-price">
                    {formatPrice(item.unit_price * item.quantity)}
                  </span>
                </div>
              ))}
              {items.length > 3 && (
                <div className="more-items">
                  +{items.length - 3} more items
                </div>
              )}
            </div>
          )}
        </div>

        {/* Order Total */}
        <div className="order-total">
          <span className="total-label">Total Amount:</span>
          <span className="total-amount">{formatPrice(total_amount)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="order-actions">
        <div className="primary-actions">
          {onViewDetails && (
            <button 
              className="action-btn view-details"
              onClick={() => onViewDetails(order)}
            >
              View Details
            </button>
          )}

          {canTrackOrder() && onTrackOrder && (
            <button 
              className="action-btn track-order"
              onClick={() => onTrackOrder(order)}
            >
              Track Order
            </button>
          )}
        </div>

        <div className="secondary-actions">
          {canRateOrder() && onRateOrder && (
            <button 
              className="action-btn rate-order"
              onClick={() => onRateOrder(order)}
            >
              ⭐ Rate Order
            </button>
          )}

          {canCancelOrder() && onCancelOrder && (
            <button 
              className="action-btn cancel-order"
              onClick={() => onCancelOrder(order)}
            >
              Cancel Order
            </button>
          )}

          {userRole === 'supplier' && onUpdateStatus && (
            <select 
              className="status-update-select"
              value={status}
              onChange={(e) => onUpdateStatus(order.id, e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;