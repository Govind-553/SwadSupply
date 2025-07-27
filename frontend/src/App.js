import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import RoleSelection from './components/auth/RoleSelection';
import VendorDashboard from './components/vendor/VendorDashboard';
import SupplierDashboard from './components/supplier/SupplierDashboard';
import LoadingSpinner from './components/common/LoadingSpinner';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        // Get user role from database
        const role = await getUserRole(user.uid);
        setUserRole(role);
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getUserRole = async (uid) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/users/${uid}/role`);
      const data = await response.json();
      return data.role;
    } catch (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <div className="App">
        <Header user={user} userRole={userRole} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={
              user ? (
                userRole ? (
                  userRole === 'vendor' ? <Navigate to="/vendor-dashboard" /> : <Navigate to="/supplier-dashboard" />
                ) : <Navigate to="/role-selection" />
              ) : <Navigate to="/login" />
            } />
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
            <Route path="/role-selection" element={user && !userRole ? <RoleSelection setUserRole={setUserRole} /> : <Navigate to="/" />} />
            <Route path="/vendor-dashboard" element={user && userRole === 'vendor' ? <VendorDashboard user={user} /> : <Navigate to="/" />} />
            <Route path="/supplier-dashboard" element={user && userRole === 'supplier' ? <SupplierDashboard user={user} /> : <Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;