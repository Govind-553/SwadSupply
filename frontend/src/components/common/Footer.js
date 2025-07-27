import React from 'react';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>🍛 RasoiLink</h3>
          <p>Connecting street food vendors with trusted suppliers across India</p>
        </div>
        
        <div className="footer-section">
          <h4>For Vendors</h4>
          <ul>
            <li>Browse Materials</li>
            <li>Voice Ordering</li>
            <li>Price Comparison</li>
            <li>Group Ordering</li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>For Suppliers</h4>
          <ul>
            <li>Manage Inventory</li>
            <li>Order Management</li>
            <li>Analytics</li>
            <li>Trust Score</li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Support</h4>
          <ul>
            <li>Help Center</li>
            <li>Contact Us</li>
            <li>Terms of Service</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2024 RasoiLink. All rights reserved. Made with ❤️ for Indian street food vendors.</p>
      </div>
    </footer>
  );
};

export default Footer;