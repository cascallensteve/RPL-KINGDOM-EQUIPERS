import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

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
        user.age || 'N/A',
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

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };



  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo">
              <span className="logo-icon">👑</span>
              <div className="logo-text">
                <h1>RPL System</h1>
                <p>Admin Portal</p>
              </div>
            </div>
          </div>

          <div className="admin-info">
            <div className="admin-details">
              <span className="admin-welcome">Welcome, {user?.username || user?.email || 'Admin'}</span>
              <div className="session-status">
                <span className="status-dot"></span>
                <span>Session Active</span>
              </div>
            </div>
          </div>
          
          <div className="header-actions">
            <button className="btn-refresh" onClick={fetchUsers} disabled={loading}>
              {loading ? '🔄 Loading...' : '🔄 Refresh'}
            </button>
            <button className="btn-export" onClick={handleExportData} disabled={users.length === 0}>
              📊 Export
            </button>
            <button onClick={handleLogout} className="btn-logout">
              🚪 Logout
            </button>
            <button 
              onClick={async () => {
                const token = localStorage.getItem('rpl_token');
                const userData = localStorage.getItem('rpl_user');
                
                console.log('🧪 Debug Info:');
                console.log('Token:', token);
                console.log('User:', userData);
                
                if (!token) {
                  alert('No token found!');
                  return;
                }
                
                try {
                  // Test different endpoints and token formats
                  const endpointsToTest = [
                    'all-users',
                    'admin/users',
                    'admin/all-users', 
                    'users',
                    'api/users',
                    'api/admin/users'
                  ];
                  
                  const tokenFormats = [
                    { name: 'Bearer format', headers: { 'Authorization': `Bearer ${token}` } },
                    { name: 'Token format', headers: { 'Authorization': `Token ${token}` } },
                    { name: 'Direct token', headers: { 'Authorization': token } },
                    { name: 'X-Auth-Token', headers: { 'X-Auth-Token': token } },
                  ];
                  
                  let successFound = false;
                  
                  // Test main endpoint with different token formats first
                  for (const format of tokenFormats) {
                    if (successFound) break;
                    
                    console.log(`🧪 Testing endpoint 'all-users' with ${format.name}:`);
                    console.log('Headers:', format.headers);
                    
                    try {
                      const response = await fetch('https://kingdom-equippers-rpl.vercel.app/all-users', {
                        method: 'GET',
                        headers: {
                          ...format.headers,
                          'Content-Type': 'application/json'
                        }
                      });
                      
                      console.log(`all-users + ${format.name} - Status:`, response.status);
                      
                      if (response.ok) {
                        const data = await response.json();
                        console.log(`✅ SUCCESS: all-users + ${format.name}`, data);
                        alert(`✅ Found working combination!\nEndpoint: all-users\nAuth: ${format.name}\nStatus: ${response.status}\nUsers: ${data.users?.length || 'N/A'}`);
                        successFound = true;
                        break;
                      } else {
                        const errorText = await response.text();
                        console.log(`❌ all-users + ${format.name} - Error (${response.status}):`, errorText);
                      }
                    } catch (err) {
                      console.log(`💥 all-users + ${format.name} - Exception:`, err);
                    }
                  }
                  
                  // If no success, try different endpoints with Bearer format
                  if (!successFound) {
                    console.log('🔄 Trying different endpoints...');
                    
                    for (const endpoint of endpointsToTest) {
                      if (successFound) break;
                      
                      console.log(`🧪 Testing endpoint: ${endpoint}`);
                      
                      try {
                        const response = await fetch(`https://kingdom-equippers-rpl.vercel.app/${endpoint}`, {
                          method: 'GET',
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                          }
                        });
                        
                        console.log(`${endpoint} - Status:`, response.status);
                        
                        if (response.ok) {
                          const data = await response.json();
                          console.log(`✅ SUCCESS: ${endpoint}`, data);
                          alert(`✅ Found working endpoint!\nEndpoint: ${endpoint}\nStatus: ${response.status}\nData: ${JSON.stringify(data).substring(0, 100)}...`);
                          successFound = true;
                          break;
                        } else {
                          const errorText = await response.text();
                          console.log(`❌ ${endpoint} - Error (${response.status}):`, errorText);
                        }
                      } catch (err) {
                        console.log(`💥 ${endpoint} - Exception:`, err);
                      }
                    }
                  }
                  
                  if (!successFound) {
                    alert('❌ No working combination found. Check console for details.');
                  }
                } catch (error) {
                  console.error('Test error:', error);
                }
              }}
              className="btn-refresh"
              style={{ marginLeft: '10px' }}
            >
              🧪 Debug API
            </button>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <span className="notification-message">{notification.message}</span>
          <button 
            onClick={() => setNotification(null)} 
            className="notification-close"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="admin-main">
        <div className="content-header">
          <h2>👥 User Management</h2>
          <p>Manage all registered users in the RPL system</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>{users.length}</h3>
              <p>Total Users</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{users.filter(u => u.is_email_verified).length}</h3>
              <p>Verified Users</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>{users.filter(u => !u.is_email_verified).length}</h3>
              <p>Pending Verification</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">👨‍🏫</div>
            <div className="stat-content">
              <h3>{users.filter(u => u.userType === 'mentor').length}</h3>
              <p>Mentors</p>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="users-section">
          <div className="section-header">
            <h3>📋 Users List</h3>
            <span className="user-count">{users.length} users found</span>
          </div>
          
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
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
                          {user.is_email_verified ? '✅ Verified' : '⏳ Pending'}
                        </span>
                      </td>
                      <td>{user.county || 'N/A'}</td>
                      <td>{user.phone_no || 'N/A'}</td>
                      <td>
                        <button 
                          onClick={() => fetchUserDetails(user.id)}
                          className="btn-secondary"
                          style={{marginRight: '5px', padding: '4px 8px', fontSize: '0.8rem'}}
                        >
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
                  <span>{userDetails.age || 'N/A'}</span>
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
