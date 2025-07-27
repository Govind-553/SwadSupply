import React, { useState } from 'react';

const RatingComponent = ({ 
  rating = 0, 
  maxRating = 5, 
  size = 'medium',
  interactive = false,
  onChange,
  showText = false,
  showCount = false,
  reviewCount = 0,
  disabled = false,
  precision = 1 
}) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(rating);

  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-lg',
    large: 'text-2xl',
    xlarge: 'text-3xl'
  };

  const getRatingText = (ratingValue) => {
    if (ratingValue === 0) return 'No rating';
    if (ratingValue <= 1) return 'Poor';
    if (ratingValue <= 2) return 'Fair';
    if (ratingValue <= 3) return 'Good';
    if (ratingValue <= 4) return 'Very Good';
    return 'Excellent';
  };

  const getStarType = (starIndex, currentRating) => {
    const starValue = starIndex + 1;
    
    if (precision === 0.5) {
      if (currentRating >= starValue) {
        return 'full';
      } else if (currentRating >= starValue - 0.5) {
        return 'half';
      } else {
        return 'empty';
      }
    } else {
      return currentRating >= starValue ? 'full' : 'empty';
    }
  };

  const handleStarClick = (starIndex) => {
    if (!interactive || disabled) return;
    
    const newRating = starIndex + 1;
    setSelectedRating(newRating);
    if (onChange) {
      onChange(newRating);
    }
  };

  const handleStarHover = (starIndex) => {
    if (!interactive || disabled) return;
    setHoveredRating(starIndex + 1);
  };

  const handleMouseLeave = () => {
    if (!interactive || disabled) return;
    setHoveredRating(0);
  };

  const displayRating = interactive ? (hoveredRating || selectedRating) : rating;
  const currentSizeClass = sizeClasses[size] || sizeClasses.medium;

  return (
    <div className={`rating-component ${interactive ? 'interactive' : 'display-only'} ${disabled ? 'disabled' : ''}`}>
      <div 
        className={`stars-container ${currentSizeClass}`}
        onMouseLeave={handleMouseLeave}
      >
          {[...Array(maxRating)].map((_, index) => {
            const starType = getStarType(index, displayRating);
            
            return (
              <span
                key={index}
                className={`star ${starType} ${interactive ? 'clickable' : ''}`}
                onClick={() => handleStarClick(index)}
                onMouseEnter={() => handleStarHover(index)}
                role={interactive ? 'button' : 'presentation'}
                tabIndex={interactive && !disabled ? 0 : -1}
                onKeyPress={(e) => {
                  if (interactive && !disabled && (e.key === 'Enter' || e.key === ' ')) {
                    handleStarClick(index);
                  }
                }}
              >
                {starType === 'full' && '★'}
                {starType === 'half' && '☆'}
                {starType === 'empty' && '☆'}
              </span>
            );
          })}
            </div>
            {showText && (
              <div className="rating-text">
                {getRatingText(displayRating)}
              </div>
            )}
            {showCount && (
              <div className="review-count">
                ({reviewCount})
              </div>
            )}
          </div>
        );
      };
      
      export default RatingComponent;