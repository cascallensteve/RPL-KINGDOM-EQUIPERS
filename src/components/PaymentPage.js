import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import './PaymentPage.css';

const PaymentPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, completed, failed

  const REGISTRATION_FEE = 200; // 200 KES

  const handlePhoneChange = (e) => {
    setPhone(e.target.value);
    setError('');
  };

  const handlePayNow = async (e) => {
    e.preventDefault();
    
    if (!phone.trim()) {
      setError('Please enter your M-Pesa phone number');
      return;
    }

    // Validate phone number format (should start with 254)
    if (!phone.startsWith('254') || phone.length !== 12) {
      setError('Please enter a valid phone number in format: 254XXXXXXXXX');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setPaymentStatus('processing');

    try {
      const response = await authAPI.makePayment({
        phone: phone,
        amount: REGISTRATION_FEE
      });

      if (response.ResponseCode === "0") {
        setSuccess('Payment initiated successfully! Please check your phone for M-Pesa prompt.');
        setPaymentStatus('completed');
        
        // Store payment details
        localStorage.setItem('payment_completed', 'true');
        localStorage.setItem('payment_details', JSON.stringify(response));
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        throw new Error(response.ResponseDescription || 'Payment failed');
      }
    } catch (err) {
      setError(err.detail || err.message || 'Payment failed. Please try again.');
      setPaymentStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePayLater = () => {
    setSuccess('Payment deferred. Redirecting to dashboard...');
    setPaymentStatus('deferred');
    
    // Store payment deferred status
    localStorage.setItem('payment_deferred', 'true');
    
    // Redirect to dashboard after 2 seconds
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="payment-page">
      {/* Header */}
      <div className="payment-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo">
              <img 
                src="https://via.placeholder.com/80x80/28a745/ffffff?text=RPL" 
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

      {/* Main Payment Content */}
      <div className="payment-main">
        <div className="payment-container">
          <div className="payment-card">
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="payment-header-content">
              <h2>Complete Your Registration</h2>
              <p>Welcome to RPL System! Complete your registration by making the required payment.</p>
            </div>

            {/* Payment Summary */}
            <div className="payment-summary">
              <h3>Payment Summary</h3>
              <div className="summary-item">
                <span>Registration Fee:</span>
                <span className="amount">KES {REGISTRATION_FEE.toLocaleString()}</span>
              </div>
              <div className="summary-item total">
                <span>Total Amount:</span>
                <span className="amount">KES {REGISTRATION_FEE.toLocaleString()}</span>
              </div>
            </div>

            {/* M-Pesa Payment Form */}
            <div className="mpesa-payment">
              <div className="mpesa-logo">
                <img 
                  src="https://via.placeholder.com/60x60/00A651/ffffff?text=M" 
                  alt="M-Pesa Logo" 
                  className="mpesa-icon"
                />
                <h3>M-Pesa Payment</h3>
              </div>

              <form onSubmit={handlePayNow} className="payment-form">
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">M-Pesa Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="form-control"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="254XXXXXXXXX"
                    pattern="254[0-9]{9}"
                    required
                    disabled={paymentStatus === 'completed' || paymentStatus === 'deferred'}
                  />
                  <small className="form-help">Enter your M-Pesa registered phone number (format: 254XXXXXXXXX)</small>
                </div>

                <div className="payment-actions">
                  <button 
                    type="submit" 
                    className="btn-primary btn-pay-now"
                    disabled={loading || paymentStatus === 'completed' || paymentStatus === 'deferred'}
                  >
                    {loading ? <span className="loading"></span> : 'Pay Now (KES 200)'}
                  </button>
                  
                  <button 
                    type="button" 
                    className="btn-secondary btn-pay-later"
                    onClick={handlePayLater}
                    disabled={paymentStatus === 'completed' || paymentStatus === 'deferred'}
                  >
                    Pay Later
                  </button>
                </div>
              </form>

              {/* Payment Status */}
              {paymentStatus === 'completed' && (
                <div className="payment-status success">
                  <div className="status-icon">✅</div>
                  <h4>Payment Successful!</h4>
                  <p>Your registration is now complete. Redirecting to dashboard...</p>
                </div>
              )}

              {paymentStatus === 'deferred' && (
                <div className="payment-status info">
                  <div className="status-icon">⏰</div>
                  <h4>Payment Deferred</h4>
                  <p>Redirecting to dashboard. You can complete payment later.</p>
                </div>
              )}

              {paymentStatus === 'failed' && (
                <div className="payment-status error">
                  <div className="status-icon">❌</div>
                  <h4>Payment Failed</h4>
                  <p>Please try again or contact support if the issue persists.</p>
                </div>
              )}
            </div>

            {/* Important Notes */}
            <div className="payment-notes">
              <h4>Important Information</h4>
              <ul>
                <li>Ensure your M-Pesa account has sufficient balance</li>
                <li>You will receive an M-Pesa prompt on your phone</li>
                <li>Enter your M-Pesa PIN when prompted</li>
                <li>Payment is processed securely through M-Pesa</li>
                <li>Registration fee is non-refundable</li>
                <li>You can defer payment and complete it later from your dashboard</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
