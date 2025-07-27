import React from 'react';
import { logoutUser } from '../../services/auth';

const Header = ({ user, userRole }) => {
  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="logo">
          <h1>🍛 SwadSupply</h1>
          <p>AI-Powered Raw Material Sourcing</p>
        </div>
        
        {user && (
          <div className="header-user">
            <div className="user-info">
              <span className="user-name">Hello, {user.displayName}</span>
              <span className="user-role">
                {userRole === 'vendor' ? '🛒 Vendor' : '🏪 Supplier'}
              </span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;