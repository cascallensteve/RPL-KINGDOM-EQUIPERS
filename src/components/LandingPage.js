import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="landing-container">
        <div className="hero-section">
          <div className="logo-section">
            <h1 className="main-title">RPL System</h1>
            <p className="subtitle">Kingdom Equippers</p>
            <div className="logo-divider"></div>
          </div>
          
          <div className="hero-content">
            <h2 className="hero-title">Welcome to the RPL System</h2>
            <p className="hero-description">
              Your gateway to seamless registration and verification. 
              Join our community and experience the power of digital transformation.
            </p>
            
            <div className="cta-buttons">
              <button 
                className="btn-primary btn-large"
                onClick={() => navigate('/signup')}
              >
                Create Account
              </button>
              <button 
                className="btn-secondary btn-large"
                onClick={() => navigate('/login')}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
        
        <div className="features-section">
          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <h3>Secure Authentication</h3>
            <p>Advanced security measures to protect your account</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3>Email Verification</h3>
            <p>Quick and secure email verification process</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">💳</div>
            <h3>Payment Integration</h3>
            <p>Seamless payment processing for your needs</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;


