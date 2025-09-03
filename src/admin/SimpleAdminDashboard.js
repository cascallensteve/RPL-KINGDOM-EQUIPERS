import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './SimpleAdminDashboard.css';

const SimpleAdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Navigation state
  const [activeSection, setActiveSection] = useState('dashboard');
  
  // Simple state
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Client details modal
  const [showClientModal, setShowClientModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  
  // Sample referrals data (in real app, fetch from API)
  const [referrals] = useState([
    {
      id: 1,
      referrerName: 'John Doe',
      referrerEmail: 'john@example.com',
      referredName: 'Jane Smith',
      referredEmail: 'jane@example.com',
      referralType: 'Friend Referral',
      status: 'Completed',
      reward: 'KES 500',
      date: '2024-01-15'
    },
    {
      id: 2,
      referrerName: 'Mary Johnson',
      referrerEmail: 'mary@example.com',
      referredName: 'Peter Wilson',
      referredEmail: 'peter@example.com',
      referralType: 'Family Referral',
      status: 'Pending',
      reward: 'KES 300',
      date: '2024-01-10'
    },
    {
      id: 3,
      referrerName: 'David Brown',
      referrerEmail: 'david@example.com',
      referredName: 'Sarah Davis',
      referredEmail: 'sarah@example.com',
      referralType: 'Church Member',
      status: 'Completed',
      reward: 'KES 750',
      date: '2024-01-08'
    }
  ]);

  // Fetch users on component mount
  useEffect(() => {
    if (user && user.userType === 'admin') {
      const timer = setTimeout(() => {
        fetchUsers();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [user]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    
    const token = localStorage.getItem('rpl_token');
    
    if (!token) {
      setError('No authentication token found. Please log in again.');
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch('https://kingdom-equippers-rpl.vercel.app/all-users', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access denied. You need admin privileges to view users.');
        } else if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else {
          throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      setUsers(data.users || []);
      setSuccess(`Successfully loaded ${data.users?.length || 0} users`);
      
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message || 'Failed to fetch users. Please try again.');
      setUsers([]);
    } finally {
      setLoading(false);
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

  const exportUsers = () => {
    if (users.length === 0) {
      setError('No users to export');
      return;
    }
    
    try {
      const headers = ['ID', 'Name', 'Email', 'Type', 'Status', 'County', 'Phone'];
      const csvData = users.map(user => [
        user.id,
        user.username,
        user.email,
        user.userType,
        user.is_email_verified ? 'Verified' : 'Pending',
        user.county || 'N/A',
        user.phone_no || 'N/A'
      ]);
      
      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess(`Successfully exported ${users.length} users to CSV`);
    } catch (error) {
      setError('Failed to export data');
    }
  };

  // Navigation items with Material Icons
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'users', label: 'Users', icon: 'people' },
    { id: 'certifications', label: 'Certifications', icon: 'workspace_premium' },
    { id: 'payments', label: 'Payments', icon: 'payment' },
    { id: 'referrals', label: 'Referrals', icon: 'share' }
  ];

  // Handle client details view
  const viewClientDetails = (client) => {
    setSelectedClient(client);
    setShowClientModal(true);
  };

  // Render different sections based on active selection
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'users':
        return renderUsers();
      case 'certifications':
        return renderCertifications();
      case 'payments':
        return renderPayments();
      case 'referrals':
        return renderReferrals();
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <div className="content-section">
      <div className="section-header">
        <h2><span className="material-icons">dashboard</span> Dashboard Overview</h2>
        <p>Welcome to the RPL Admin Dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons">people</span>
          </div>
          <div className="stat-content">
            <h3>{users.length}</h3>
            <p>Total Users</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons">verified</span>
          </div>
          <div className="stat-content">
            <h3>{users.filter(u => u.is_email_verified).length}</h3>
            <p>Verified Users</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons">hourglass_empty</span>
          </div>
          <div className="stat-content">
            <h3>{users.filter(u => !u.is_email_verified).length}</h3>
            <p>Pending Verification</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons">school</span>
          </div>
          <div className="stat-content">
            <h3>{users.filter(u => u.userType === 'mentor').length}</h3>
            <p>Mentors</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons">share</span>
          </div>
          <div className="stat-content">
            <h3>{referrals.filter(r => r.status === 'Completed').length}</h3>
            <p>Successful Referrals</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-section">
        <h3><span className="material-icons">timeline</span> Recent Activity</h3>
        <div className="activity-list">
          <div className="activity-item">
            <span className="activity-icon">
              <span className="material-icons">person_add</span>
            </span>
            <div className="activity-content">
              <p>New user registered</p>
              <small>2 hours ago</small>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-icon">
              <span className="material-icons">mark_email_read</span>
            </span>
            <div className="activity-content">
              <p>Email verification completed</p>
              <small>4 hours ago</small>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-icon">
              <span className="material-icons">payment</span>
            </span>
            <div className="activity-content">
              <p>Payment processed</p>
              <small>6 hours ago</small>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-icon">
              <span className="material-icons">person_add_alt</span>
            </span>
            <div className="activity-content">
              <p>New referral completed</p>
              <small>8 hours ago</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="content-section">
      <div className="section-header">
        <h2><span className="material-icons">people</span> User Management</h2>
        <div className="header-actions">
          <button className="btn-refresh" onClick={fetchUsers} disabled={loading}>
            <span className="material-icons">{loading ? 'hourglass_empty' : 'refresh'}</span>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button className="btn-export" onClick={exportUsers} disabled={users.length === 0}>
            <span className="material-icons">download</span>
            Export
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-section">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">
              <span className="material-icons">people_outline</span>
            </span>
            <h4>No users found</h4>
            <p>Click refresh to load users or check your connection.</p>
          </div>
        ) : (
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>County</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td className="user-name">{user.username}</td>
                    <td className="user-email">{user.email}</td>
                    <td>
                      <span className={`user-type ${user.userType}`}>
                        {user.userType}
                      </span>
                    </td>
                    <td>
                      <span className={`status ${user.is_email_verified ? 'verified' : 'pending'}`}>
                        <span className="material-icons">{user.is_email_verified ? 'verified' : 'pending'}</span>
                        {user.is_email_verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td>{user.county || 'N/A'}</td>
                    <td>{user.phone_no || 'N/A'}</td>
                    <td>
                      <button 
                        className="btn-view-client"
                        onClick={() => viewClientDetails(user)}
                        title="View client details"
                      >
                        <span className="material-icons">visibility</span>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderCertifications = () => (
    <div className="content-section">
      <div className="section-header">
        <h2><span className="material-icons">workspace_premium</span> Certifications</h2>
        <p>Manage RPL certifications and awards</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons">workspace_premium</span>
          </div>
          <div className="stat-content">
            <h3>45</h3>
            <p>Total Certificates</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons">hourglass_empty</span>
          </div>
          <div className="stat-content">
            <h3>12</h3>
            <p>Pending Reviews</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons">verified</span>
          </div>
          <div className="stat-content">
            <h3>33</h3>
            <p>Approved</p>
          </div>
        </div>
      </div>

      <div className="certification-list">
        <h3><span className="material-icons">timeline</span> Recent Certifications</h3>
        <div className="certification-item">
          <span className="cert-icon">
            <span className="material-icons">workspace_premium</span>
          </span>
          <div className="cert-content">
            <h4>Biblical Studies Certificate</h4>
            <p>Awarded to John Doe - ID: 12345</p>
            <small>Issued: 2 days ago</small>
          </div>
          <span className="cert-status approved">
            <span className="material-icons">verified</span>
            Approved
          </span>
        </div>
        <div className="certification-item">
          <span className="cert-icon">
            <span className="material-icons">hourglass_empty</span>
          </span>
          <div className="cert-content">
            <h4>Pastoral Care Certificate</h4>
            <p>Application by Mary Smith - ID: 12346</p>
            <small>Applied: 1 week ago</small>
          </div>
          <span className="cert-status pending">
            <span className="material-icons">pending</span>
            Pending
          </span>
        </div>
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className="content-section">
      <div className="section-header">
        <h2><span className="material-icons">payment</span> Payments</h2>
        <p>Track and manage payment transactions</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons">account_balance_wallet</span>
          </div>
          <div className="stat-content">
            <h3>KES 245</h3>
            <p>Total Revenue</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons">payment</span>
          </div>
          <div className="stat-content">
            <h3>87</h3>
            <p>Total Payments</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons">hourglass_empty</span>
          </div>
          <div className="stat-content">
            <h3>5</h3>
            <p>Pending</p>
          </div>
        </div>
      </div>

      <div className="payments-list">
        <h3><span className="material-icons">timeline</span> Recent Payments</h3>
        <div className="payment-item">
          <span className="payment-icon">
            <span className="material-icons">payment</span>
          </span>
          <div className="payment-content">
            <h4>Registration Fee</h4>
            <p>John Doe - KES 1</p>
            <small>Processed: 1 hour ago</small>
          </div>
          <span className="payment-status success">
            <span className="material-icons">verified</span>
            Success
          </span>
        </div>
        <div className="payment-item">
          <span className="payment-icon">
            <span className="material-icons">hourglass_empty</span>
          </span>
          <div className="payment-content">
            <h4>Registration Fee</h4>
            <p>Mary Smith - KES 1</p>
            <small>Initiated: 2 hours ago</small>
          </div>
          <span className="payment-status pending">
            <span className="material-icons">pending</span>
            Pending
          </span>
        </div>
      </div>
    </div>
  );

  const renderReferrals = () => (
    <div className="content-section">
      <div className="section-header">
        <h2><span className="material-icons">share</span> Referral Management</h2>
        <p>Track and manage user referrals and rewards</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons">share</span>
          </div>
          <div className="stat-content">
            <h3>{referrals.length}</h3>
            <p>Total Referrals</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons">verified</span>
          </div>
          <div className="stat-content">
            <h3>{referrals.filter(r => r.status === 'Completed').length}</h3>
            <p>Completed</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons">hourglass_empty</span>
          </div>
          <div className="stat-content">
            <h3>{referrals.filter(r => r.status === 'Pending').length}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons">trending_up</span>
          </div>
          <div className="stat-content">
            <h3>KES {referrals.reduce((sum, r) => sum + parseInt(r.reward.replace('KES ', '')), 0).toLocaleString()}</h3>
            <p>Total Rewards</p>
          </div>
        </div>
      </div>

      <div className="referrals-table-section">
        <h3><span className="material-icons">table_chart</span> Referral Details</h3>
        <div className="referrals-table">
          <table>
            <thead>
              <tr>
                <th>Referrer</th>
                <th>Referred User</th>
                <th>Referral Type</th>
                <th>Status</th>
                <th>Reward</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map(referral => (
                <tr key={referral.id}>
                  <td>
                    <div className="referrer-info">
                      <strong>{referral.referrerName}</strong>
                      <br />
                      <small className="email-text">{referral.referrerEmail}</small>
                    </div>
                  </td>
                  <td>
                    <div className="referred-info">
                      <strong>{referral.referredName}</strong>
                      <br />
                      <small className="email-text">{referral.referredEmail}</small>
                    </div>
                  </td>
                  <td>
                    <span className={`referral-type ${referral.referralType.toLowerCase().replace(' ', '-')}`}>
                      {referral.referralType}
                    </span>
                  </td>
                  <td>
                    <span className={`referral-status ${referral.status.toLowerCase()}`}>
                      <span className="material-icons">
                        {referral.status === 'Completed' ? 'verified' : 'pending'}
                      </span>
                      {referral.status}
                    </span>
                  </td>
                  <td className="reward-amount">{referral.reward}</td>
                  <td>{new Date(referral.date).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="btn-view-referral"
                      onClick={() => alert(`Viewing details for referral ID: ${referral.id}`)}
                      title="View referral details"
                    >
                      <span className="material-icons">visibility</span>
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="referral-types-section">
        <h3><span className="material-icons">category</span> Referral Types Overview</h3>
        <div className="referral-types-grid">
          <div className="referral-type-card">
            <div className="type-icon">
              <span className="material-icons">people</span>
            </div>
            <div className="type-content">
              <h4>Friend Referral</h4>
              <p>Reward: KES 500</p>
              <small>{referrals.filter(r => r.referralType === 'Friend Referral').length} referrals</small>
            </div>
          </div>
          <div className="referral-type-card">
            <div className="type-icon">
              <span className="material-icons">family_restroom</span>
            </div>
            <div className="type-content">
              <h4>Family Referral</h4>
              <p>Reward: KES 300</p>
              <small>{referrals.filter(r => r.referralType === 'Family Referral').length} referrals</small>
            </div>
          </div>
          <div className="referral-type-card">
            <div className="type-icon">
              <span className="material-icons">church</span>
            </div>
            <div className="type-content">
              <h4>Church Member</h4>
              <p>Reward: KES 750</p>
              <small>{referrals.filter(r => r.referralType === 'Church Member').length} referrals</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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

  if (user.userType !== 'admin') {
    navigate('/dashboard', { replace: true });
    return null;
  }

  return (
    <div className="admin-dashboard">
      {/* Left Sidebar */}
      <div className="admin-sidebar">
        {/* Admin Profile Section */}
        <div className="admin-profile">
          <div className="profile-avatar">
            <span className="material-icons avatar-icon">admin_panel_settings</span>
          </div>
          <div className="profile-info">
            <h3>{user?.username || 'Admin User'}</h3>
            <p>{user?.email || 'admin@rpl.com'}</p>
            <span className="profile-role">
              <span className="material-icons">verified_user</span>
              System Administrator
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="admin-nav">
          <ul>
            {navigationItems.map(item => (
              <li key={item.id} className={activeSection === item.id ? 'active' : ''}>
                <button onClick={() => setActiveSection(item.id)}>
                  <span className="material-icons nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="sidebar-footer">
          <button className="btn-logout-sidebar" onClick={handleLogout}>
            <span className="material-icons nav-icon">logout</span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Top Header */}
        <div className="admin-header">
          <div className="header-content">
            <div className="header-left">
              <h1>
                <span className="material-icons">school</span>
                RPL Admin Portal
              </h1>
              <p>Kingdom Hall Recognition of Prior Learning System</p>
            </div>
            <div className="header-right">
              <div className="admin-status">
                <span className="material-icons status-icon">circle</span>
                <span>Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="notification error">
            <span>{error}</span>
            <button onClick={() => setError('')}>×</button>
          </div>
        )}
        
        {success && (
          <div className="notification success">
            <span>{success}</span>
            <button onClick={() => setSuccess('')}>×</button>
          </div>
        )}

        {/* Dynamic Content */}
        <div className="content-wrapper">
          {renderContent()}
        </div>
      </div>

      {/* Client Details Modal */}
      {showClientModal && selectedClient && (
        <div className="modal-overlay" onClick={() => setShowClientModal(false)}>
          <div className="client-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><span className="material-icons">people</span> Client Details</h3>
              <button onClick={() => setShowClientModal(false)} className="modal-close">×</button>
            </div>
            <div className="modal-content">
              <div className="client-details-grid">
                <div className="detail-section">
                  <h4><span className="material-icons">person</span> Basic Information</h4>
                  <div className="detail-row">
                    <label>ID:</label>
                    <span>{selectedClient.id}</span>
                  </div>
                  <div className="detail-row">
                    <label>Name:</label>
                    <span>{selectedClient.username}</span>
                  </div>
                  <div className="detail-row">
                    <label>Email:</label>
                    <span>{selectedClient.email}</span>
                  </div>
                  <div className="detail-row">
                    <label>User Type:</label>
                    <span className={`user-type ${selectedClient.userType}`}>
                      {selectedClient.userType}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4><span className="material-icons">contact_phone</span> Contact Information</h4>
                  <div className="detail-row">
                    <label>Phone:</label>
                    <span>{selectedClient.phone_no || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <label>County:</label>
                    <span>{selectedClient.county || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <label>Age:</label>
                    <span>{selectedClient.age || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <label>Gender:</label>
                    <span>{selectedClient.gender || 'N/A'}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4><span className="material-icons">account_circle</span> Account Status</h4>
                  <div className="detail-row">
                    <label>Email Verified:</label>
                    <span className={`status ${selectedClient.is_email_verified ? 'verified' : 'pending'}`}>
                      <span className="material-icons">
                        {selectedClient.is_email_verified ? 'verified' : 'pending'}
                      </span>
                      {selectedClient.is_email_verified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <label>Registration Status:</label>
                    <span className={`status ${selectedClient.registered ? 'verified' : 'pending'}`}>
                      <span className="material-icons">
                        {selectedClient.registered ? 'verified' : 'pending'}
                      </span>
                      {selectedClient.registered ? 'Registered' : 'Not Registered'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowClientModal(false)}>
                Close
              </button>
              <button className="btn-action">
                <span className="material-icons">message</span>
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3><span className="material-icons">logout</span> Confirm Logout</h3>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to logout from the admin panel?</p>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={cancelLogout}>
                Cancel
              </button>
              <button className="btn-confirm" onClick={confirmLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleAdminDashboard;
