import React from 'react';

const ProductCard = ({ 
  product, 
  onAddToCart, 
  onViewDetails,
  showSupplierInfo = true,
  showMandiComparison = true,
  cartQuantity = 0,
  onUpdateQuantity
}) => {
  const {
    id,
    name,
    description,
    price,
    unit,
    category,
    image_url,
    supplier,
    mandi_comparison,
    quantity_available
  } = product;

  const handleQuantityChange = (newQuantity) => {
    if (onUpdateQuantity) {
      onUpdateQuantity(id, Math.max(0, newQuantity));
    }
  };

  const getPriceComparisonClass = () => {
    if (!mandi_comparison) return '';
    if (mandi_comparison.is_cheaper) return 'price-comparison-lower';
    if (mandi_comparison.price_difference > 0) return 'price-comparison-higher';
    return 'price-comparison-same';
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="product-card">
      <div className="product-image">
        <img 
          src={image_url || '/api/placeholder/300/200'} 
          alt={name}
          onError={(e) => {
            e.target.src = '/api/placeholder/300/200';
          }}
        />
        <div className="product-category-badge">
          {category}
        </div>
        {quantity_available <= 10 && (
          <div className="low-stock-badge">
            Low Stock: {quantity_available} {unit}
          </div>
        )}
      </div>

      <div className="product-info">
        <div className="product-header">
          <h3 className="product-name">{name}</h3>
          <div className="product-price">
            {formatPrice(price)}/{unit}
          </div>
        </div>

        {description && (
          <p className="product-description">{description}</p>
        )}

        {showMandiComparison && mandi_comparison && mandi_comparison.mandi_price > 0 && (
          <div className={`mandi-comparison ${getPriceComparisonClass()}`}>
            <div className="mandi-price">
              Mandi: {formatPrice(mandi_comparison.mandi_price)}/{unit}
            </div>
            {mandi_comparison.price_difference !== 0 && (
              <div className="price-difference">
                {mandi_comparison.price_difference > 0 ? '+' : ''}
                {formatPrice(Math.abs(mandi_comparison.price_difference))}
                ({mandi_comparison.percentage_diff > 0 ? '+' : ''}
                {mandi_comparison.percentage_diff}%)
              </div>
            )}
          </div>
        )}

        {showSupplierInfo && supplier && (
          <div className="supplier-info">
            <div className="supplier-details">
              <span className="supplier-name">📍 {supplier.name}</span>
              <div className="supplier-meta">
                <span className="supplier-rating">⭐ {supplier.rating || 'N/A'}</span>
                {supplier.distance && (
                  <span className="supplier-distance">{supplier.distance}km away</span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="product-stock">
          <span className={`stock-indicator ${quantity_available <= 10 ? 'low-stock' : ''}`}>
            {quantity_available > 0 ? `${quantity_available} ${unit} available` : 'Out of stock'}
          </span>
        </div>

        <div className="product-actions">
          {cartQuantity > 0 ? (
            <div className="quantity-controls">
              <button 
                className="quantity-btn decrease"
                onClick={() => handleQuantityChange(cartQuantity - 1)}
                disabled={cartQuantity <= 0}
              >
                −
              </button>
              <span className="quantity-display">{cartQuantity}</span>
              <button 
                className="quantity-btn increase"
                onClick={() => handleQuantityChange(cartQuantity + 1)}
                disabled={cartQuantity >= quantity_available}
              >
                +
              </button>
            </div>
          ) : (
            <button 
              className="add-to-cart-btn"
              onClick={() => onAddToCart && onAddToCart(product)}
              disabled={quantity_available <= 0}
            >
              {quantity_available <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          )}

          {onViewDetails && (
            <button 
              className="view-details-btn"
              onClick={() => onViewDetails(product)}
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;