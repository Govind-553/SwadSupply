import React, { useState } from 'react';
import { ref, update } from 'firebase/database';
import { auth, database } from '../../services/firebase';

const RoleSelection = ({ setUserRole }) => {
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleSubmit = async () => {
    if (!selectedRole) {
      setError('Please select a role');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = auth.currentUser;
      await update(ref(database, `users/${user.uid}`), {
        role: selectedRole,
        roleSelectedAt: new Date().toISOString()
      });
      
      setUserRole(selectedRole);
    } catch (error) {
      setError('Failed to save role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="role-selection-container">
      <div className="role-selection-card">
        <div className="role-header">
          <h2>🍛 Choose Your Role</h2>
          <p>Select how you'll be using RasoiLink</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="role-options">
          <div 
            className={`role-option ${selectedRole === 'vendor' ? 'selected' : ''}`}
            onClick={() => setSelectedRole('vendor')}
          >
            <div className="role-icon">🛒</div>
            <h3>Street Food Vendor</h3>
            <p>I want to buy raw materials for my food business</p>
            <ul>
              <li>Browse materials from verified suppliers</li>
              <li>Compare prices with mandi rates</li>
              <li>Join group orders for better prices</li>
              <li>Track deliveries in real-time</li>
            </ul>
          </div>
          
          <div 
            className={`role-option ${selectedRole === 'supplier' ? 'selected' : ''}`}
            onClick={() => setSelectedRole('supplier')}
          >
            <div className="role-icon">🏪</div>
            <h3>Supplier</h3>
            <p>I want to sell raw materials to local vendors</p>
            <ul>
              <li>List your products and inventory</li>
              <li>Receive orders from nearby vendors</li>
              <li>Build trust through ratings</li>
              <li>Grow your customer base</li>
            </ul>
          </div>
        </div>
        
        <button 
          className="role-submit-button" 
          onClick={handleRoleSubmit}
          disabled={loading || !selectedRole}
        >
          {loading ? 'Setting up your account...' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default RoleSelection;