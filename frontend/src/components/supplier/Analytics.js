import React from 'react';

const Analytics = ({ orders, products }) => {
  const calculateMetrics = () => {
    const totalRevenue = orders
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + order.totalAmount, 0);

    const monthlyRevenue = orders
      .filter(order => {
        const orderDate = new Date(order.createdAt);
        const currentMonth = new Date().getMonth();
        return order.status === 'delivered' && orderDate.getMonth() === currentMonth;
      })
      .reduce((sum, order) => sum + order.totalAmount, 0);

    const topProducts = products
      .map(product => {
        const productOrders = orders.filter(order => 
          order.items.some(item => item.name === product.name)
        );
        const totalSold = productOrders.reduce((sum, order) => {
          const item = order.items.find(item => item.name === product.name);
          return sum + (item ? item.quantity : 0);
        }, 0);
        return { ...product, totalSold };
      })
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5);

    const ordersByStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    return {
      totalRevenue,
      monthlyRevenue,
      topProducts,
      ordersByStatus,
      totalOrders: orders.length,
      activeProducts: products.length
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className="analytics">
      <h2>📊 Analytics Dashboard</h2>
      
      <div className="analytics-overview">
        <div className="metric-card">
          <div className="metric-value">₹{metrics.totalRevenue.toLocaleString()}</div>
          <div className="metric-label">Total Revenue</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">₹{metrics.monthlyRevenue.toLocaleString()}</div>
          <div className="metric-label">This Month</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{metrics.totalOrders}</div>
          <div className="metric-label">Total Orders</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{metrics.activeProducts}</div>
          <div className="metric-label">Active Products</div>
        </div>
      </div>

      <div className="analytics-charts">
        <div className="chart-section">
          <h3>Order Status Distribution</h3>
          <div className="status-chart">
            {Object.entries(metrics.ordersByStatus).map(([status, count]) => (
              <div key={status} className="status-bar">
                <span className="status-label">{status}</span>
                <div className="status-progress">
                  <div 
                    className={`status-fill status-${status}`}
                    style={{ width: `${(count / metrics.totalOrders) * 100}%` }}
                  ></div>
                </div>
                <span className="status-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-section">
          <h3>Top Selling Products</h3>
          <div className="top-products">
            {metrics.topProducts.map((product, index) => (
              <div key={product.id} className="top-product-item">
                <span className="product-rank">#{index + 1}</span>
                <span className="product-name">{product.name}</span>
                <span className="product-sold">{product.totalSold} {product.unit} sold</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;