import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import { FiDownload, FiDollarSign, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

// Helper function to format time ago
const formatTimeAgo = (dateString) => {
  if (!dateString) return 'Just now';
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch (e) {
    return 'Some time ago';
  }
};

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Normalize age to age group for display and exports
  const formatAgeGroup = (age) => {
    if (!age && age !== 0) return 'N/A';
    // If it's already a group string like "26-35" or "65+", return as-is
    if (typeof age === 'string' && (age.includes('-') || age.endsWith('+'))) return age;
    const n = parseInt(age, 10);
    if (isNaN(n)) return String(age);
    if (n >= 18 && n <= 25) return '18-25';
    if (n >= 26 && n <= 35) return '26-35';
    if (n >= 36 && n <= 46) return '36-46';
    if (n >= 47 && n <= 55) return '46-55';
    if (n >= 56 && n <= 65) return '55-65';
    if (n >= 66) return '65+';
    return String(age);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const mentors = [
    { id: 1, name: 'Dr. James Kiprop', email: 'james.kiprop@rpl.com', specialization: 'Theology', activeCandidates: 5 },
    { id: 2, name: 'Prof. Mary Wanjiku', email: 'mary.wanjiku@rpl.com', specialization: 'Biblical Studies', activeCandidates: 3 },
    { id: 3, name: 'Rev. Peter Ochieng', email: 'peter.ochieng@rpl.com', specialization: 'Pastoral Care', activeCandidates: 7 },
    { id: 4, name: 'Dr. Grace Akinyi', email: 'grace.akinyi@rpl.com', specialization: 'Church Leadership', activeCandidates: 4 }
  ];

  // Validate admin session on mount
  useEffect(() => {
    if (user && user.userType === 'admin') {
      // Validate token exists and is properly formatted
      const token = localStorage.getItem('rpl_token');
      if (!token) {
        showNotification('Authentication token missing. Please log in again.', 'error');
        setTimeout(() => {
          logout();
          navigate('/login', { replace: true });
        }, 2000);
        return;
      }
      
      // Add a small delay to ensure the component is fully mounted
      const timer = setTimeout(() => {
        fetchUsers();
        fetchPayments();
      }, 500); // Reduced delay for better UX
      
      return () => clearTimeout(timer);
    } else if (user && user.userType !== 'admin') {
      // Non-admin user trying to access admin dashboard
      showNotification('Access denied. Admin privileges required.', 'error');
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 2000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Update page title when users are loaded
  useEffect(() => {
    document.title = 'RPL Admin Dashboard';
  }, []);

  const fetchPayments = async () => {
    try {
      setPaymentLoading(true);
      const token = localStorage.getItem('rpl_token');
      const response = await fetch('https://kingdom-equippers-rpl.vercel.app/admin/payments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }

      const data = await response.json();
      // Transform the data to match our expected format
      const formattedPayments = data.payments.map(payment => ({
        ...payment,
        transaction_id: payment.checkout_request_id || payment.merchant_request_id || payment.id,
        user_name: payment.user ? `${payment.user.first_name} ${payment.user.last_name}` : 'N/A',
        user_email: payment.user?.email || 'N/A',
        amount: parseFloat(payment.amount) || 0,
        status: payment.status || 'pending',
        created_at: payment.created_at || new Date().toISOString()
      }));
      
      setPayments(formattedPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      showNotification('Failed to load payment history', 'error');
    } finally {
      setPaymentLoading(false);
    }
  };

  const checkTransactionStatus = async (checkoutRequestId) => {
    try {
      const token = localStorage.getItem('rpl_token');
      const response = await fetch(`https://kingdom-equippers-rpl.vercel.app/payments/transaction-status/${checkoutRequestId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to check transaction status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking transaction status:', error);
      showNotification('Failed to check transaction status', 'error');
      return null;
    }
  };

  const downloadReceipt = async (transactionId) => {
    try {
      const token = localStorage.getItem('rpl_token');
      const response = await fetch(`https://kingdom-equippers-rpl.vercel.app/admin/payments/${transactionId}/receipt`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download receipt');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${transactionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading receipt:', error);
      showNotification('Failed to download receipt. Please try again later.', 'error');
    }
  };

  const handleRefreshStatus = async (checkoutRequestId) => {
    try {
      setPaymentLoading(true);
      const status = await checkTransactionStatus(checkoutRequestId);
      if (status) {
        // Update the payment status in the local state
        setPayments(prevPayments => 
          prevPayments.map(payment => 
            payment.checkout_request_id === checkoutRequestId 
              ? { ...payment, status: status.status } 
              : payment
          )
        );
        showNotification('Payment status updated', 'success');
      }
    } catch (error) {
      console.error('Error refreshing status:', error);
      showNotification('Failed to refresh status', 'error');
    } finally {
      setPaymentLoading(false);
    }
  };

  // Add loading state check
  if (!user) {
    return (
      <div className="admin-loading">
        <div className="loading-content">
          <h2>Loading...</h2>
          <p>Please wait while we verify your credentials.</p>
        </div>
      </div>
    );
  }

  // Check if user is admin - redirect if not
  if (user.userType !== 'admin') {
    // Use React Router navigation
    navigate('/dashboard', { replace: true });
    return null;
  }

  const fetchUsers = async () => {
    setLoading(true);
    
    // Get current token and clean it
    let currentToken = localStorage.getItem('rpl_token');
    
    if (!currentToken) {
      showNotification('No authentication token found. Please log in again.', 'error');
      setLoading(false);
      return;
    }
    
    // Clean the token - remove quotes if present
    if (currentToken.startsWith('"') && currentToken.endsWith('"')) {
      currentToken = currentToken.slice(1, -1);
      localStorage.setItem('rpl_token', currentToken); // Save cleaned token
    }
    
    try {
      console.log('🚀 Fetching users from API...');
      console.log('🔑 Using token:', currentToken ? `${currentToken.substring(0, 20)}...` : 'No token');
      console.log('🔑 Full token:', currentToken);
      console.log('👤 User data:', user);
      
      const headers = {
        'Authorization': `Bearer ${currentToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      console.log('📨 Request headers:', headers);
      
      const response = await fetch('https://kingdom-equippers-rpl.vercel.app/all-users', {
        method: 'GET',
        headers: headers
      });
      
      console.log('🌐 Response status:', response.status);
      console.log('🌐 Response statusText:', response.statusText);
      console.log('🌐 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        // Get error details
        let errorMessage = `API Error: ${response.status} - ${response.statusText}`;
        let errorDetails = null;
        
        try {
          const errorText = await response.text();
          console.log('🚨 Raw error response:', errorText);
          
          // Try to parse as JSON
          try {
            errorDetails = JSON.parse(errorText);
            console.log('🚨 Parsed error data:', errorDetails);
            
            if (errorDetails.message) {
              errorMessage = errorDetails.message;
            } else if (errorDetails.detail) {
              errorMessage = errorDetails.detail;
            } else if (errorDetails.error) {
              errorMessage = errorDetails.error;
            }
          } catch (jsonError) {
            console.log('🚨 Error response is not JSON:', errorText);
            errorMessage = errorText.substring(0, 200); // Limit length
          }
        } catch (e) {
          console.log('🚨 Could not read error response:', e);
        }
        
        if (response.status === 403) {
          throw new Error('Access denied. You need admin privileges to view users.');
        } else if (response.status === 401) {
          // Clear invalid session
          localStorage.removeItem('rpl_token');
          localStorage.removeItem('rpl_user');
          throw new Error('Authentication failed. Please log in again.');
        } else {
          throw new Error(errorMessage);
        }
      }
      
      const data = await response.json();
      console.log('✅ Users fetched successfully:', data);
      
      const fetchedUsers = data.users || data || [];
      setUsers(fetchedUsers);
      
      showNotification(`Successfully fetched ${fetchedUsers.length} users`, 'success');
      
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      
      // Handle different error types
      let errorMessage = 'Failed to fetch users. Please try again.';
      
      if (error.message.includes('Authentication failed')) {
        errorMessage = 'Session expired. Please log in again.';
        // Force redirect to login after a short delay
        setTimeout(() => {
          logout();
          navigate('/login', { replace: true });
        }, 2000);
      } else if (error.message.includes('Access denied')) {
        errorMessage = 'Access denied. Admin privileges required.';
      } else if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        errorMessage = error.message;
      }
      
      showNotification(errorMessage, 'error');
      
      // Clear data on error
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const token = localStorage.getItem('rpl_token');
      const response = await fetch(`https://kingdom-equippers-rpl.vercel.app/user-details/${userId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserDetails(data['user-details'] || data.user || data);
        setShowUserModal(true);
      } else {
        throw new Error('Failed to fetch user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      showNotification('Failed to fetch user details. Please try again.', 'error');
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const handleExportData = () => {
    if (users.length === 0) {
      showNotification('No users to export', 'error');
      return;
    }
    
    try {
      // Convert users data to CSV format
      const headers = ['ID', 'Name', 'Email', 'Type', 'Status', 'County', 'Subcounty', 'Phone', 'Age', 'Gender', 'Registered'];
      const csvData = users.map(user => [
        user.id,
        user.username,
        user.email,
        user.userType,
        user.is_email_verified ? 'Verified' : 'Pending',
        user.county || 'N/A',
        user.subcounty || 'N/A',
        user.phone_no || 'N/A',
        formatAgeGroup(user.age) || 'N/A',
        user.gender || 'N/A',
        user.registered ? 'Yes' : 'No'
      ]);
      
      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
      
      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showNotification(`Successfully exported ${users.length} users to CSV`, 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      showNotification('Failed to export data', 'error');
    }
  };

  const handleAssignMentor = (userId) => {
    setSelectedUser(users.find(u => u.id === userId));
    setShowMentorModal(true);
  };


  const handleViewUser = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setShowUserModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
    setUserDetails(null);
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="flex items-center space-x-8">
          <div className="h-24 w-auto">
            <img 
              src="/IMAGES/LOGO.png" 
              alt="Kingdom Equippers Logo" 
              className="h-full w-auto object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        </div>
        <div className="admin-actions">
          <span className="admin-email">{user.email}</span>
          <button onClick={() => setShowLogoutConfirm(true)} className="btn btn-logout">
            Logout
          </button>
        </div>
      </header>

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          <FiDollarSign /> Payments
        </button>
      </div>

      <main className="admin-content">
        {activeTab === 'users' ? (
          loading ? (
            <div className="loading-spinner">Loading users...</div>
          ) : (
            <div className="users-grid">
              {users.map((user) => (
                <div key={user.id} className="user-card">
                  <h3>{user.username}</h3>
                  <p>{user.email}</p>
                  <p>Status: {user.is_verified ? 'Verified' : 'Pending'}</p>
                  <p>Role: {user.user_type}</p>
                  <p>Payment: {user.has_paid ? '✅ Paid' : '❌ Pending'}</p>
                  <button 
                    onClick={() => handleViewUser(user.id)}
                    className="btn btn-view"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="payments-section">
            <div className="payment-stats">
              <div className="stat-card">
                <div className="stat-icon">
                  <span className="material-icons">account_balance_wallet</span>
                </div>
                <div className="stat-details">
                  <h3>Total Revenue</h3>
                  <p>KES {payments
                    .filter(p => p.status === 'completed' || p.status === 'success')
                    .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
                    .toLocaleString()}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <span className="material-icons">payment</span>
                </div>
                <div className="stat-details">
                  <h3>Total Payments</h3>
                  <p>{payments.length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <span className="material-icons">hourglass_empty</span>
                </div>
                <div className="stat-details">
                  <h3>Pending</h3>
                  <p>{payments.filter(p => p.status === 'pending').length}</p>
                </div>
              </div>
            </div>

            <div className="recent-payments">
              <h2>Recent Payments</h2>
              {payments.length > 0 ? (
                <div className="payment-list">
                  {payments.slice(0, 5).map((payment) => (
                    <div key={payment.transaction_id} className="payment-item">
                      <div className="payment-icon">
                        <span className="material-icons">
                          {payment.status === 'completed' || payment.status === 'success' ? 'verified' : 'hourglass_empty'}
                        </span>
                      </div>
                      <div className="payment-details">
                        <div className="payment-title">
                          {payment.description || 'Payment'} - {payment.user_name || 'User'}
                        </div>
                        <div className="payment-amount">
                          KES {parseFloat(payment.amount || 0).toLocaleString()}
                        </div>
                        <div className="payment-meta">
                          {payment.status === 'completed' || payment.status === 'success' ? 'Processed' : 'Initiated'} • {formatTimeAgo(payment.created_at)}
                        </div>
                      </div>
                      <div className={`payment-status ${payment.status}`}>
                        {payment.status === 'completed' || payment.status === 'success' ? '✓' : '...'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No recent payments found.</p>
              )}
            </div>

            <h2>Payment History</h2>
            {paymentLoading ? (
              <div className="loading-spinner">Loading payments...</div>
            ) : payments.length === 0 ? (
              <p>No payment records found.</p>
            ) : (
              <div className="payments-table-container">
                <table className="payments-table">
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Checkout Request ID</th>
                      <th>User</th>
                      <th>Phone</th>
                      <th>Amount (KES)</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.transaction_id}>
                        <td>{payment.transaction_id || 'N/A'}</td>
                        <td className="break-word">{payment.checkout_request_id || 'N/A'}</td>
                        <td>{payment.user_name || payment.user_email || 'N/A'}</td>
                        <td>{payment.phone || 'N/A'}</td>
                        <td>{payment.amount ? payment.amount.toLocaleString() : '0.00'}</td>
                        <td>{payment.created_at ? new Date(payment.created_at).toLocaleString() : 'N/A'}</td>
                        <td>
                          <span className={`status-badge ${payment.status || 'pending'}`}>
                            {payment.status || 'Pending'}
                          </span>
                        </td>
                        <td className="actions-cell">
                          {payment.status === 'success' || payment.status === 'completed' ? (
                            <button 
                              onClick={() => downloadReceipt(payment.transaction_id)}
                              className="btn btn-sm btn-download"
                              title="Download Receipt"
                            >
                              <FiDownload />
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleRefreshStatus(payment.checkout_request_id)}
                              className="btn btn-sm btn-refresh"
                              title="Refresh Status"
                              disabled={paymentLoading}
                            >
                              {paymentLoading ? '...' : '🔄'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* User Details Modal */}
      {showUserModal && userDetails && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>User Details</h3>
              <button onClick={() => setShowUserModal(false)} className="modal-close">×</button>
            </div>
            <div className="modal-body">
              <div className="user-details-grid">
                <div className="detail-item">
                  <label>ID:</label>
                  <span>{userDetails.id}</span>
                </div>
                <div className="detail-item">
                  <label>Name:</label>
                  <span>{userDetails.username}</span>
                </div>
                <div className="detail-item">
                  <label>Email:</label>
                  <span>{userDetails.email}</span>
                </div>
                <div className="detail-item">
                  <label>Type:</label>
                  <span className={`user-type ${userDetails.userType}`}>
                    {userDetails.userType}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Status:</label>
                  <span className={`status ${userDetails.is_email_verified ? 'verified' : 'pending'}`}>
                    {userDetails.is_email_verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <div className="detail-item">
                  <label>County:</label>
                  <span>{userDetails.county || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Subcounty:</label>
                  <span>{userDetails.subcounty || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Phone:</label>
                  <span>{userDetails.phone_no || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Age:</label>
                  <span>{formatAgeGroup(userDetails.age) || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Gender:</label>
                  <span>{userDetails.gender || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Registered:</label>
                  <span>{userDetails.registered ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowUserModal(false)} className="btn-secondary">
                Close
              </button>
              <button 
                onClick={() => handleAssignMentor(userDetails.id)}
                className="btn-primary"
                disabled={userDetails.userType === 'admin'}
              >
                {userDetails.userType === 'admin' ? 'Admin User' : 'Assign Mentor'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mentor Assignment Modal */}
      {showMentorModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowMentorModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Assign Mentor</h3>
              <button onClick={() => setShowMentorModal(false)} className="modal-close">×</button>
            </div>
            <div className="modal-body">
              <p>Assign a mentor to <strong>{selectedUser.username}</strong></p>
              <div className="mentor-selection">
                <label>Select Mentor:</label>
                <select className="mentor-select">
                  <option value="">Choose a mentor...</option>
                  {mentors.map(mentor => (
                    <option key={mentor.id} value={mentor.id}>
                      {mentor.name} - {mentor.specialization}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowMentorModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button className="btn-primary">
                Assign Mentor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="logout-modal-overlay" onClick={cancelLogout}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="logout-modal-header">
              <div className="logout-icon">🚪</div>
              <h3>Confirm Logout</h3>
            </div>
            
            <div className="logout-modal-content">
              <p>Are you sure you want to log out of the admin panel?</p>
              <p className="logout-warning">You will need to log in again to access the admin dashboard.</p>
            </div>
            
            <div className="logout-modal-actions">
              <button onClick={cancelLogout} className="btn-cancel-logout">
                Cancel
              </button>
              <button onClick={confirmLogout} className="btn-confirm-logout">
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
