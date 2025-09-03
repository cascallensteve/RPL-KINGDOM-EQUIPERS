import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './PaymentPage.css';

const PaymentPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [checkoutRequestId, setCheckoutRequestId] = useState('');
  const [statusChecking, setStatusChecking] = useState(false);

  const REGISTRATION_FEE = 1; // 1 shilling as requested

  const handlePhoneChange = (e) => {
    // Force phone number to be numeric and max 9 digits (after +254)
    const input = e.target.value.replace(/\D/g, '').slice(0, 9);
    setPhone(input);
    setError('');
  };

  // Check transaction status
  const checkTransactionStatus = async (requestId) => {
    try {
      setStatusChecking(true);
      const response = await fetch(`https://kingdom-equippers-rpl.vercel.app/payments/transaction-status/${requestId}/`);
      
      if (!response.ok) {
        throw new Error('Failed to check transaction status');
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        setPaymentStatus('completed');
        setSuccess(`🎉 Payment Successful! Receipt: ${data.receipt || 'N/A'}`);
        localStorage.setItem('payment_completed', 'true');
        localStorage.setItem('payment_receipt', data.receipt || '');
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => navigate('/dashboard'), 3000);
        return true;
      } else if (data.status === 'failed') {
        setPaymentStatus('failed');
        setError('❌ Payment failed. Please try again.');
        return false;
      }
      
      // Still processing
      return null;
      
    } catch (err) {
      console.error('Status check error:', err);
      setError('Failed to check payment status');
      return false;
    } finally {
      setStatusChecking(false);
    }
  };

  // Poll for transaction status
  useEffect(() => {
    if (!checkoutRequestId || paymentStatus !== 'processing') return;

    const statusInterval = setInterval(async () => {
      const result = await checkTransactionStatus(checkoutRequestId);
      
      if (result !== null) {
        clearInterval(statusInterval);
      }
    }, 3000); // Check every 3 seconds

    // Stop checking after 2 minutes
    const timeout = setTimeout(() => {
      clearInterval(statusInterval);
      if (paymentStatus === 'processing') {
        setError('⏰ Payment timeout. Please check your M-Pesa messages or try again.');
        setPaymentStatus('failed');
      }
    }, 120000);

    return () => {
      clearInterval(statusInterval);
      clearTimeout(timeout);
    };
  }, [checkoutRequestId, paymentStatus, navigate]);

  const handlePayNow = async (e) => {
    e.preventDefault();

    if (phone.length !== 9) {
      setError('Please enter a valid Safaricom number (e.g. 712345678)');
      return;
    }

    const fullPhone = `254${phone}`;

    setLoading(true);
    setError('');
    setSuccess('');
    setPaymentStatus('processing');

    try {
      const response = await fetch('https://kingdom-equippers-rpl.vercel.app/payments/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: fullPhone,
          amount: REGISTRATION_FEE
        })
      });

      if (!response.ok) {
        throw new Error('Payment request failed');
      }

      const data = await response.json();

      if (data.ResponseCode === "0" || data.success) {
        const requestId = data.CheckoutRequestID || data.checkout_request_id;
        setCheckoutRequestId(requestId);
        setSuccess('💳 Payment request sent! Please check your phone for M-Pesa prompt and enter your PIN.');
        
        // Start checking status immediately
        setTimeout(() => {
          checkTransactionStatus(requestId);
        }, 5000);
        
      } else {
        throw new Error(data.ResponseDescription || data.message || 'Payment initiation failed');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please check your connection and try again.');
      setPaymentStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePayLater = () => {
    setSuccess('Payment deferred. Redirecting to dashboard...');
    setPaymentStatus('deferred');
    localStorage.setItem('payment_deferred', 'true');
    setTimeout(() => navigate('/dashboard'), 2000);
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="payment-page">
      <div className="payment-header">
        <div className="header-content">
          <div className="logo-section">
            <img src="https://via.placeholder.com/60x60/28a745/ffffff?text=RPL" alt="Logo" className="logo-image"/>
            <div className="logo-text">
              <h1>RPL System</h1>
              <p>Kingdom Equippers</p>
            </div>
          </div>
          <div className="user-section">
            <div className="user-info">
              <span className="user-name">{user.username}</span>
              <span className="user-email">{user.email}</span>
            </div>
            <button onClick={logout} className="btn-logout">Logout</button>
          </div>
        </div>
      </div>

      <div className="payment-main">
        <div className="payment-card">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <h2 className="payment-title">Complete Your Registration</h2>
          <p className="payment-subtitle">Welcome! Please complete your registration by paying the required fee.</p>

          <div className="payment-summary">
            <div className="summary-item">
              <span>Registration Fee:</span>
              <span>KES {REGISTRATION_FEE.toLocaleString()}</span>
            </div>
            <div className="summary-item total">
              <span>Total:</span>
              <span>KES {REGISTRATION_FEE.toLocaleString()}</span>
            </div>
          </div>

          <form onSubmit={handlePayNow} className="payment-form">
            <label htmlFor="phone" className="form-label">M-Pesa Phone Number</label>
            <div className="phone-input-wrapper">
              <span className="phone-prefix">+254</span>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-control phone-input"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="712345678"
                disabled={paymentStatus !== 'pending'}
                required
              />
            </div>
            <small className="form-help">Enter your number without the +254 (e.g. 712345678)</small>

            <div className="payment-actions">
              <button 
                type="submit" 
                className="btn-primary"
                disabled={loading || paymentStatus !== 'pending'}
              >
                {loading ? 'Processing...' : `Pay Now (KES ${REGISTRATION_FEE})`}
              </button>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={handlePayLater}
                disabled={paymentStatus !== 'pending'}
              >
                Pay Later
              </button>
            </div>
          </form>

          {/* Enhanced Status Messages */}
          {paymentStatus === 'processing' && (
            <div className="payment-status processing">
              <div className="processing-indicator">
                <div className="spinner"></div>
                <div className="processing-text">
                  <h4>Processing Payment...</h4>
                  <p>Please complete the payment on your phone</p>
                  {statusChecking && <small>⏳ Checking payment status...</small>}
                </div>
              </div>
            </div>
          )}
          
          {paymentStatus === 'completed' && (
            <div className="payment-status success">
              <div className="success-animation">🎉</div>
              <div className="success-content">
                <h3>Payment Successful!</h3>
                <p>Your registration is now complete</p>
                <small>Redirecting to dashboard...</small>
              </div>
            </div>
          )}
          
          {paymentStatus === 'failed' && (
            <div className="payment-status error">
              <div className="error-icon">❌</div>
              <div className="error-content">
                <h3>Payment Failed</h3>
                <p>Please try again or contact support</p>
              </div>
            </div>
          )}
          
          {paymentStatus === 'deferred' && (
            <div className="payment-status info">
              <div className="info-icon">⏰</div>
              <div className="info-content">
                <h3>Payment Deferred</h3>
                <p>You can complete payment later from your dashboard</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
