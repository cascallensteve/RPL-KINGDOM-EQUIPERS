import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './PaymentPage.css';
import { authAPI } from '../services/api'; // Ensure this import is correct

const PaymentPage = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [checkoutRequestId, setCheckoutRequestId] = useState('');
  const [statusChecking, setStatusChecking] = useState(false);

  const REGISTRATION_FEE = 1; // 1 shilling

  // Check payment status from server on component mount
  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!user?.id) return;
      
      try {
        console.log('🔍 PaymentPage checking payment status for user:', user.id);
        
        // Check if user already has payment status in context
        if (user?.has_paid === true) {
          console.log('✅ User already marked as paid in context, redirecting to dashboard');
          navigate('/dashboard');
          return;
        }
        
        // Check local storage first
        const localKey = `payment_completed_${user.id}`;
        const localPaymentCompleted = localStorage.getItem(localKey) === 'true';
        
        if (localPaymentCompleted) {
          console.log('✅ Payment completed according to local storage, verifying with server');
          // Verify with server (best-effort)
          try {
            const response = await authAPI.getUserPaymentStatus(user.id);
            console.log('📡 Server payment status response:', response);
            
            if (response?.has_paid) {
              console.log('✅ Server confirms payment completed, redirecting to dashboard');
              navigate('/dashboard');
              return;
            } else {
              // Server explicitly reports unpaid – clear local flag
              console.log('❌ Server says payment not completed, clearing local cache');
              localStorage.removeItem(localKey);
            }
          } catch (err) {
            // If endpoint is missing or fails, trust the local flag to avoid blocking paid users
            console.warn('User payment status check failed; trusting local flag and redirecting to dashboard');
            navigate('/dashboard');
            return;
          }
        }
        
        // If we get here, payment is required
        console.log('⏳ Payment required for user:', user.id);
        
      } catch (error) {
        console.error('Error checking payment status:', error);
        // If there's an error, assume payment is required
      }
    };

    checkPaymentStatus();
  }, [user, navigate]);

  const handlePhoneChange = (e) => {
    const input = e.target.value.replace(/\D/g, '').slice(0, 9);
    setPhone(input);
    setError('');
  };

  const checkTransactionStatus = useCallback(async (requestId) => {
    try {
      setStatusChecking(true);
      // Use centralized Axios API (handles baseURL, auth, errors)
      const data = await authAPI.getTransactionStatus(requestId);
      
      if (data.status === 'success') {
        setPaymentStatus('completed');
        setSuccess(`🎉 Payment Successful! Receipt: ${data.receipt || 'N/A'}`);
        
        console.log('✅ Payment completed successfully for user:', {
          user_id: user.id,
          user_name: user.username,
          user_email: user.email,
          phone_used: phone,
          receipt: data.receipt
        });
        
        // Update user's payment status in local storage and context
        try {
          if (user?.id) {
            localStorage.setItem(`payment_completed_${user.id}`, 'true');
          }
          localStorage.setItem('payment_receipt', data.receipt || '');
          // Clean up any stale global flags
          localStorage.removeItem('payment_completed');
          localStorage.removeItem('payment_deferred');
        } catch (_) {}
        
        // Update user context
        updateUser({ ...user, has_paid: true });

        // Update payment status on the server
        try {
          console.log('💰 Updating payment status for user:', {
            user_id: user.id,
            user_email: user.email,
            user_name: user.username,
            phone_used: phone,
            transaction_id: data.transaction_id,
            receipt: data.receipt
          });
          
          await authAPI.updatePaymentStatus({
            user_id: user.id,
            user_email: user.email,
            user_name: user.username,
            phone_used: phone,
            transaction_id: data.transaction_id,
            receipt_number: data.receipt,
            amount: data.amount || REGISTRATION_FEE
          });
        } catch (err) {
          console.error('Failed to update payment status:', err);
          // Continue even if this fails, as the payment was successful
        }

        setTimeout(() => navigate('/dashboard'), 3000);
        return true;
      } else if (data.status === 'failed') {
        setPaymentStatus('failed');
        setError('❌ Payment failed. Please try again.');
        return false;
      }

      return null;

    } catch (err) {
      console.error('Status check error:', err);
      setError('Failed to check payment status');
      return false;
    } finally {
      setStatusChecking(false);
    }
  }, [REGISTRATION_FEE, updateUser, user, navigate]);

  useEffect(() => {
    if (!checkoutRequestId || paymentStatus !== 'processing') return;

    const statusInterval = setInterval(async () => {
      const result = await checkTransactionStatus(checkoutRequestId);
      if (result !== null) clearInterval(statusInterval);
    }, 3000);

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
  }, [checkoutRequestId, paymentStatus, checkTransactionStatus]);

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
      // ✅ Using Axios-based authAPI - Include current user information
      const data = await authAPI.makePayment({
        phone: fullPhone,
        amount: REGISTRATION_FEE,
        user_id: user.id,  // Ensure payment is associated with current user
        user_email: user.email,  // Include user email for verification
        user_name: user.username  // Include user name for admin display
      });

      console.log('💰 Payment initiated for user:', {
        user_id: user.id,
        user_email: user.email,
        user_name: user.username,
        phone_used: fullPhone
      });
      console.log('✅ IMPORTANT: Payment will be credited to current logged-in user:', user.username);
      console.log('📱 Phone number used:', fullPhone, '(can be used for multiple users)');
      console.log('👤 Payment recipient:', user.username, '(current logged-in user)');
      console.log('💰 Payment response:', data);

      if (data.response_code === "0" || data.success) {
        const requestId = data.checkout_request_id || data.CheckoutRequestID;
        if (!requestId) throw new Error("No CheckoutRequestID returned from API");

        setCheckoutRequestId(requestId);
        setSuccess('💳 Payment request sent! Check your phone for the M-Pesa prompt.');

        setTimeout(() => checkTransactionStatus(requestId), 5000);
      } else {
        throw new Error(data.message || 'Payment initiation failed');
      }

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please check your connection and try again.');
      setPaymentStatus('failed');
    } finally {
      setLoading(false);
    }
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
          <p className="payment-subtitle">Please pay the registration fee to continue.</p>
          
          {/* Show whose account this payment is for */}
          <div className="alert alert-info" style={{ 
            backgroundColor: '#f0f9ff', 
            border: '2px solid #0ea5e9', 
            color: '#0c4a6e',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontWeight: 'bold'
          }}>
            <div style={{ fontSize: '16px', marginBottom: '8px' }}>
              💳 <strong>Payment for: {user.username}</strong>
            </div>
            <div style={{ fontSize: '14px', marginBottom: '8px' }}>
              Email: {user.email}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              ✅ This payment will be credited to your account ({user.username}) regardless of which phone number you use.
              <br />
              📱 You can use any M-Pesa phone number - it doesn't have to be yours.
              <br />
              👤 Admin will see YOUR details (not the phone number owner's details).
            </div>
          </div>
          
          {/* Special message for referred users */}
          {user?.referred_by && (
            <div className="alert alert-info" style={{ 
              backgroundColor: '#e3f2fd', 
              border: '1px solid #2196f3', 
              color: '#1976d2',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <strong>Welcome!</strong> You were referred by someone. Complete your payment to unlock all features and start earning rewards through your own referrals.
            </div>
          )}

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
            <small className="form-help">Enter your number without the +254 prefix</small>

            <div className="payment-actions">
              <button 
                type="submit" 
                className="btn-primary"
                disabled={loading || paymentStatus !== 'pending'}
              >
                {loading ? 'Processing...' : `Pay Now (KES ${REGISTRATION_FEE})`}
              </button>
            </div>
          </form>

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

        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
