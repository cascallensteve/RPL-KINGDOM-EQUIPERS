import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState('pending');

  useEffect(() => {
    // Check if payment was completed or deferred
    const paymentCompleted = localStorage.getItem('payment_completed');
    
    if (paymentCompleted === 'true') {
      setPaymentStatus('completed');
    } else if (localStorage.getItem('payment_deferred') === 'true') {
      setPaymentStatus('deferred');
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCompletePayment = () => {
    navigate('/payment');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo">
              <img 
                src="https://via.placeholder.com/60x60/28a745/ffffff?text=RPL" 
                alt="RPL System Logo" 
                className="logo-image"
              />
              <div className="logo-text">
                <h1>RPL System</h1>
                <p>Kingdom Equippers</p>
              </div>
            </div>
          </div>
          
          <div className="user-section">
            <div className="user-info">
              <span className="user-name">{user.username}</span>
              <span className="user-email">{user.email}</span>
            </div>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        <div className="dashboard-container">
          {/* Welcome Section */}
          <div className="welcome-section">
            <h2>Welcome to RPL System, {user.username}! 👋</h2>
            <p>Your account has been successfully created and verified.</p>
          </div>

          {/* Status Cards */}
          <div className="status-cards">
            <div className="status-card">
              <div className="card-icon">✅</div>
              <h3>Account Status</h3>
              <p>Active</p>
            </div>
            
            <div className="status-card">
              <div className="card-icon">📧</div>
              <h3>Email Verification</h3>
              <p>Verified</p>
            </div>
            
            <div className="status-card">
              <div className="card-icon">💰</div>
              <h3>Payment Status</h3>
              <p className={paymentStatus === 'completed' ? 'status-success' : 'status-pending'}>
                {paymentStatus === 'completed' ? 'Completed' : 'Pending'}
              </p>
            </div>
          </div>

          {/* Payment Section */}
          {paymentStatus !== 'completed' && (
            <div className="payment-reminder">
              <div className="reminder-content">
                <h3>Complete Your Registration</h3>
                <p>To access all features, please complete your payment of KES 200.</p>
                <button onClick={handleCompletePayment} className="btn-primary">
                  Complete Payment
                </button>
              </div>
            </div>
          )}

          {/* Dashboard Features */}
          <div className="dashboard-features">
            <h3>Available Features</h3>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">📚</div>
                <h4>Learning Resources</h4>
                <p>Access comprehensive learning materials and courses</p>
                <span className="feature-status available">Available</span>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h4>Progress Tracking</h4>
                <p>Monitor your learning progress and achievements</p>
                <span className="feature-status available">Available</span>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">👥</div>
                <h4>Community</h4>
                <p>Connect with other learners and mentors</p>
                <span className={`feature-status ${paymentStatus === 'completed' ? 'available' : 'locked'}`}>
                  {paymentStatus === 'completed' ? 'Available' : 'Locked'}
                </span>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">🏆</div>
                <h4>Certification</h4>
                <p>Earn certificates upon course completion</p>
                <span className={`feature-status ${paymentStatus === 'completed' ? 'available' : 'locked'}`}>
                  {paymentStatus === 'completed' ? 'Available' : 'Locked'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="actions-grid">
              <button className="action-btn">
                <span className="action-icon">👤</span>
                <span>Edit Profile</span>
              </button>
              
              <button className="action-btn">
                <span className="action-icon">🔒</span>
                <span>Change Password</span>
              </button>
              
              <button className="action-btn">
                <span className="action-icon">📱</span>
                <span>Contact Support</span>
              </button>
              
              <button className="action-btn">
                <span className="action-icon">❓</span>
                <span>Help & FAQ</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
