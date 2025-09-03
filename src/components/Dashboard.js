import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [showProfile, setShowProfile] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [notification, setNotification] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    // Check if payment was completed or deferred
    const paymentCompleted = localStorage.getItem('payment_completed');
    
    if (paymentCompleted === 'true') {
      setPaymentStatus('completed');
    } else if (localStorage.getItem('payment_deferred') === 'true') {
      setPaymentStatus('deferred');
    }

    // Initialize profile data with only registration fields
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        age: user.age || '',
        gender: user.gender || '',
        phone_no: user.phone_no || '',
        county: user.county || ''
      });
    }
  }, [user]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
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

  const handleCompletePayment = () => {
    navigate('/payment');
  };

  const handleProfileEdit = () => {
    setEditMode(true);
  };

  const handleProfileSave = () => {
    try {
      // Update user profile
      const updatedUser = { ...user, ...profileData };
      updateUser(updatedUser);
      setEditMode(false);
      showNotification('Profile updated successfully!', 'success');
      // You could also make an API call here to update the backend
    } catch (error) {
      showNotification('Failed to update profile. Please try again.', 'error');
    }
  };

  const handleProfileCancel = () => {
    setProfileData({
      username: user.username || '',
      email: user.email || '',
      age: user.age || '',
      gender: user.gender || '',
      phone_no: user.phone_no || '',
      county: user.county || ''
    });
    setEditMode(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
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
            <button onClick={() => setShowProfile(true)} className="btn-profile">
              👤 Profile
            </button>
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

      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && (
        <div className="profile-modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h2>User Profile</h2>
              <button 
                className="modal-close-btn" 
                onClick={() => setShowProfile(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="profile-modal-content">
              {!editMode ? (
                // View Mode
                <div className="profile-view">
                  <div className="profile-section">
                    <h3>Personal Information</h3>
                    <div className="profile-grid">
                      <div className="profile-field">
                        <label>Full Name:</label>
                        <span>{profileData.username || 'Not provided'}</span>
                      </div>
                      <div className="profile-field">
                        <label>Email:</label>
                        <span>{profileData.email || 'Not provided'}</span>
                      </div>
                      <div className="profile-field">
                        <label>Age:</label>
                        <span>{profileData.age || 'Not provided'}</span>
                      </div>
                      <div className="profile-field">
                        <label>Gender:</label>
                        <span>{profileData.gender || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="profile-section">
                    <h3>Contact & Location</h3>
                    <div className="profile-grid">
                      <div className="profile-field">
                        <label>Phone Number:</label>
                        <span>{profileData.phone_no || 'Not provided'}</span>
                      </div>
                      <div className="profile-field">
                        <label>County:</label>
                        <span>{profileData.county || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="profile-actions">
                    <button onClick={handleProfileEdit} className="btn-edit">
                      ✏️ Edit Profile
                    </button>
                    <button onClick={handleLogout} className="btn-logout">
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                // Edit Mode
                <div className="profile-edit">
                  <div className="profile-section">
                    <h3>Personal Information</h3>
                    <div className="profile-grid">
                      <div className="profile-field">
                        <label>Full Name:</label>
                        <input
                          type="text"
                          name="username"
                          value={profileData.username}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="profile-field">
                        <label>Age:</label>
                        <input
                          type="number"
                          name="age"
                          value={profileData.age}
                          onChange={handleInputChange}
                          placeholder="Enter your age"
                          min="18"
                          max="120"
                        />
                      </div>
                      <div className="profile-field">
                        <label>Gender:</label>
                        <select
                          name="gender"
                          value={profileData.gender}
                          onChange={handleInputChange}
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="profile-section">
                    <h3>Contact & Location</h3>
                    <div className="profile-grid">
                      <div className="profile-field">
                        <label>Phone Number:</label>
                        <input
                          type="tel"
                          name="phone_no"
                          value={profileData.phone_no}
                          onChange={handleInputChange}
                          placeholder="+2547XXXXXXXX or 07XXXXXXXX"
                        />
                      </div>
                      <div className="profile-field">
                        <label>County:</label>
                        <select
                          name="county"
                          value={profileData.county}
                          onChange={handleInputChange}
                        >
                          <option value="">Select a county</option>
                          <option value="Mombasa">Mombasa</option>
                          <option value="Kwale">Kwale</option>
                          <option value="Kilifi">Kilifi</option>
                          <option value="Tana River">Tana River</option>
                          <option value="Lamu">Lamu</option>
                          <option value="Taita Taveta">Taita Taveta</option>
                          <option value="Garissa">Garissa</option>
                          <option value="Wajir">Wajir</option>
                          <option value="Mandera">Mandera</option>
                          <option value="Marsabit">Marsabit</option>
                          <option value="Isiolo">Isiolo</option>
                          <option value="Meru">Meru</option>
                          <option value="Tharaka Nithi">Tharaka Nithi</option>
                          <option value="Embu">Embu</option>
                          <option value="Kitui">Kitui</option>
                          <option value="Machakos">Machakos</option>
                          <option value="Makueni">Makueni</option>
                          <option value="Nyandarua">Nyandarua</option>
                          <option value="Nyeri">Nyeri</option>
                          <option value="Kirinyaga">Kirinyaga</option>
                          <option value="Murang'a">Murang'a</option>
                          <option value="Kiambu">Kiambu</option>
                          <option value="Turkana">Turkana</option>
                          <option value="West Pokot">West Pokot</option>
                          <option value="Samburu">Samburu</option>
                          <option value="Trans Nzoia">Trans Nzoia</option>
                          <option value="Uasin Gishu">Uasin Gishu</option>
                          <option value="Elgeyo Marakwet">Elgeyo Marakwet</option>
                          <option value="Nandi">Nandi</option>
                          <option value="Baringo">Baringo</option>
                          <option value="Laikipia">Laikipia</option>
                          <option value="Nakuru">Nakuru</option>
                          <option value="Narok">Narok</option>
                          <option value="Kajiado">Kajiado</option>
                          <option value="Kericho">Kericho</option>
                          <option value="Bomet">Bomet</option>
                          <option value="Kakamega">Kakamega</option>
                          <option value="Vihiga">Vihiga</option>
                          <option value="Bungoma">Bungoma</option>
                          <option value="Busia">Busia</option>
                          <option value="Siaya">Siaya</option>
                          <option value="Kisumu">Kisumu</option>
                          <option value="Homa Bay">Homa Bay</option>
                          <option value="Migori">Migori</option>
                          <option value="Kisii">Kisii</option>
                          <option value="Nyamira">Nyamira</option>
                          <option value="Nairobi">Nairobi</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="profile-actions">
                    <button onClick={handleProfileSave} className="btn-save">
                      💾 Save Changes
                    </button>
                    <button onClick={handleProfileCancel} className="btn-cancel">
                      ❌ Cancel
                    </button>
                    <button onClick={handleLogout} className="btn-logout">
                      Logout
                    </button>
                  </div>
                </div>
              )}
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
              <p>Are you sure you want to log out of your account?</p>
              <p className="logout-warning">You will need to log in again to access your dashboard.</p>
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

export default Dashboard;
