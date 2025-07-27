import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../../services/firebase';

const TrustScore = ({ supplierId, user }) => {
  const [trustData, setTrustData] = useState({
    overallScore: 0,
    totalReviews: 0,
    completedOrders: 0,
    onTimeDeliveryRate: 0,
    qualityRating: 0,
    responseTime: 0,
    badges: [],
    recentFeedback: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supplierId) return;

    // Fetch supplier trust data
    const fetchTrustData = async () => {
      try {
        // Get supplier orders
        const ordersRef = ref(database, 'orders');
        onValue(ordersRef, (snapshot) => {
          const ordersData = snapshot.val();
          if (ordersData) {
            const supplierOrders = Object.keys(ordersData)
              .map(key => ({ id: key, ...ordersData[key] }))
              .filter(order => order.supplierId === supplierId);
            
            calculateTrustMetrics(supplierOrders);
          }
        });

        // Get supplier reviews
        const reviewsRef = ref(database, `reviews/suppliers/${supplierId}`);
        onValue(reviewsRef, (snapshot) => {
          const reviewsData = snapshot.val();
          if (reviewsData) {
            const reviews = Object.keys(reviewsData)
              .map(key => ({ id: key, ...reviewsData[key] }))
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            updateReviewMetrics(reviews);
          }
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching trust data:', error);
        setLoading(false);
      }
    };

    fetchTrustData();
  }, [supplierId]);

  const calculateTrustMetrics = (orders) => {
    if (orders.length === 0) return;

    const completedOrders = orders.filter(order => order.status === 'delivered');
    const totalOrders = orders.length;

    // Calculate on-time delivery rate
    const onTimeDeliveries = completedOrders.filter(order => {
      if (!order.estimatedDelivery || !order.actualDelivery) return false;
      return new Date(order.actualDelivery) <= new Date(order.estimatedDelivery);
    });

    const onTimeRate = completedOrders.length > 0 
      ? (onTimeDeliveries.length / completedOrders.length) * 100 
      : 0;

    // Calculate average response time (in hours)
    const responseTimes = orders
      .filter(order => order.responseTime)
      .map(order => order.responseTime);
    
    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;

    setTrustData(prev => ({
      ...prev,
      completedOrders: completedOrders.length,
      onTimeDeliveryRate: onTimeRate,
      responseTime: avgResponseTime
    }));
  };

  const updateReviewMetrics = (reviews) => {
    if (reviews.length === 0) return;

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    const qualityRatings = reviews
      .filter(review => review.qualityRating)
      .map(review => review.qualityRating);
    
    const avgQualityRating = qualityRatings.length > 0
      ? qualityRatings.reduce((sum, rating) => sum + rating, 0) / qualityRatings.length
      : 0;

    // Calculate overall trust score (0-100)
    const overallScore = calculateOverallTrustScore({
      averageRating,
      totalReviews: reviews.length,
      onTimeRate: trustData.onTimeDeliveryRate,
      completedOrders: trustData.completedOrders,
      responseTime: trustData.responseTime
    });

    // Determine badges based on performance
    const badges = calculateBadges({
      overallScore,
      totalReviews: reviews.length,
      onTimeRate: trustData.onTimeDeliveryRate,
      completedOrders: trustData.completedOrders,
      averageRating
    });

    setTrustData(prev => ({
      ...prev,
      overallScore,
      totalReviews: reviews.length,
      qualityRating: avgQualityRating,
      badges,
      recentFeedback: reviews.slice(0, 3)
    }));
  };

  const calculateOverallTrustScore = ({ averageRating, totalReviews, onTimeRate, completedOrders, responseTime }) => {
    // Weighted scoring system
    const ratingScore = (averageRating / 5) * 30; // Max 30 points
    const reviewVolumeScore = Math.min(totalReviews / 10, 1) * 15; // Max 15 points
    const deliveryScore = (onTimeRate / 100) * 25; // Max 25 points
    const experienceScore = Math.min(completedOrders / 50, 1) * 20; // Max 20 points
    const responsivenessScore = responseTime > 0 ? Math.max(0, (24 - responseTime) / 24) * 10 : 0; // Max 10 points

    return Math.round(ratingScore + reviewVolumeScore + deliveryScore + experienceScore + responsivenessScore);
  };

  const calculateBadges = ({ overallScore, totalReviews, onTimeRate, completedOrders, averageRating }) => {
    const badges = [];

    if (overallScore >= 90) badges.push({ type: 'premium', label: 'Premium Supplier', icon: '👑' });
    if (overallScore >= 80) badges.push({ type: 'trusted', label: 'Trusted Supplier', icon: '✅' });
    if (onTimeRate >= 95) badges.push({ type: 'punctual', label: 'Always On Time', icon: '⏰' });
    if (averageRating >= 4.5) badges.push({ type: 'quality', label: 'Quality Assured', icon: '⭐' });
    if (totalReviews >= 50) badges.push({ type: 'experienced', label: 'Experienced', icon: '🏆' });
    if (completedOrders >= 100) badges.push({ type: 'volume', label: 'High Volume', icon: '📦' });

    return badges;
  };

  const getTrustScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow
    if (score >= 40) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  const getTrustScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  if (loading) {
    return <div className="loading">Loading trust score...</div>;
  }

  return (
    <div className="trust-score-component">
      <div className="trust-score-header">
        <h3>🛡️ Trust Score</h3>
        <div className="overall-score">
          <div 
            className="score-circle"
            style={{ 
              background: `conic-gradient(${getTrustScoreColor(trustData.overallScore)} ${trustData.overallScore}%, #e5e7eb 0%)` 
            }}
          >
            <div className="score-inner">
              <span className="score-number">{trustData.overallScore}</span>
              <span className="score-label">{getTrustScoreLabel(trustData.overallScore)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Badges */}
      {trustData.badges.length > 0 && (
        <div className="trust-badges">
          <h4>Achievements</h4>
          <div className="badges-grid">
            {trustData.badges.map((badge, index) => (
              <div key={index} className={`trust-badge ${badge.type}`}>
                <span className="badge-icon">{badge.icon}</span>
                <span className="badge-label">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics Breakdown */}
      <div className="trust-metrics">
        <h4>Performance Metrics</h4>
        <div className="metrics-grid">
          <div className="metric-item">
            <div className="metric-value">{trustData.totalReviews}</div>
            <div className="metric-label">Total Reviews</div>
          </div>
          
          <div className="metric-item">
            <div className="metric-value">{trustData.completedOrders}</div>
            <div className="metric-label">Orders Completed</div>
          </div>
          
          <div className="metric-item">
            <div className="metric-value">{Math.round(trustData.onTimeDeliveryRate)}%</div>
            <div className="metric-label">On-Time Delivery</div>
          </div>
          
          <div className="metric-item">
            <div className="metric-value">⭐ {trustData.qualityRating.toFixed(1)}</div>
            <div className="metric-label">Quality Rating</div>
          </div>
          
          <div className="metric-item">
            <div className="metric-value">{Math.round(trustData.responseTime)}h</div>
            <div className="metric-label">Avg Response Time</div>
          </div>
        </div>
      </div>

      {/* Recent Feedback */}
      {trustData.recentFeedback.length > 0 && (
        <div className="recent-feedback">
          <h4>Recent Feedback</h4>
          <div className="feedback-list">
            {trustData.recentFeedback.map((feedback, index) => (
              <div key={index} className="feedback-item">
                <div className="feedback-header">
                  <div className="feedback-rating">
                    {'★'.repeat(feedback.rating)}{'☆'.repeat(5 - feedback.rating)}
                  </div>
                  <div className="feedback-date">
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </div>
                </div>
                {feedback.comment && (
                  <div className="feedback-comment">
                    "{feedback.comment}"
                  </div>
                )}
                <div className="feedback-author">
                  - {feedback.vendorName || 'Anonymous'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trust Score Improvement Tips */}
      {trustData.overallScore < 80 && (
        <div className="improvement-tips">
          <h4>💡 Ways to Improve Your Trust Score</h4>
          <div className="tips-list">
            {trustData.onTimeDeliveryRate < 90 && (
              <div className="tip-item">
                <span className="tip-icon">⏰</span>
                <span className="tip-text">Improve on-time delivery rate by setting realistic delivery times</span>
              </div>
            )}
            
            {trustData.totalReviews < 10 && (
              <div className="tip-item">
                <span className="tip-icon">⭐</span>
                <span className="tip-text">Encourage customers to leave reviews after successful deliveries</span>
              </div>
            )}
            
            {trustData.responseTime > 12 && (
              <div className="tip-item">
                <span className="tip-icon">💬</span>
                <span className="tip-text">Respond to orders and messages more quickly (within 6 hours)</span>
              </div>
            )}
            
            {trustData.qualityRating < 4.0 && (
              <div className="tip-item">
                <span className="tip-icon">🎯</span>
                <span className="tip-text">Focus on improving product quality and accurate descriptions</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trust Score History Chart */}
      <div className="trust-score-history">
        <h4>Trust Score Trend</h4>
        <div className="chart-placeholder">
          <p>Trust score tracking chart would be displayed here</p>
          <p className="chart-note">
            Note: Track your performance over time to see improvements
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrustScore;