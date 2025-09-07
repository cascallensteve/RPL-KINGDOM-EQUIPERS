import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Import icons
import { 
  FiUser, FiLogOut, FiEdit, FiLock, FiHelpCircle, FiMail, 
  FiCheckCircle, FiXCircle, FiCreditCard, FiBook, FiBarChart2, 
  FiUsers, FiAward, FiSettings, FiX, FiSave, FiArrowLeft,
  FiMapPin, FiPhone, FiCalendar, FiGlobe, FiChevronDown
} from 'react-icons/fi';

const Dashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [showProfile, setShowProfile] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [notification, setNotification] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

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
        county: user.county || '',
        subcounty: user.subcounty || ''
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
      county: user.county || '',
      subcounty: user.subcounty || ''
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <FiBook className="text-white text-xl" />
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-gray-900">RPL System</h1>
                  <p className="text-xs text-gray-500">Kingdom Equippers</p>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <div className="relative ml-3">
                <div className="flex items-center">
                  <div className="mr-3 text-right hidden md:block">
                    <p className="text-sm font-medium text-gray-900">{user.username}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="bg-gray-100 rounded-full p-2 flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FiUser className="h-5 w-5 text-gray-600" />
                    <FiChevronDown className="ml-1 h-4 w-4 text-gray-400" />
                  </button>
                </div>

                {showUserMenu && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowProfile(true);
                          setShowUserMenu(false);
                        }}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <FiUser className="mr-3 h-4 w-4" />
                        Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <FiLogOut className="mr-3 h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {user.username}! 👋</h2>
          <p className="text-gray-600">Your account has been successfully created and verified.</p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <FiUser className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Account Status</h3>
            <p className="text-green-600 font-medium">Active</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <FiMail className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Email Verification</h3>
            <p className="text-green-600 font-medium">Verified</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <FiCreditCard className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Payment Status</h3>
            <p className={paymentStatus === 'completed' ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>
              {paymentStatus === 'completed' ? 'Completed' : 'Pending'}
            </p>
          </div>
        </div>

        {/* Payment Section */}
        {paymentStatus !== 'completed' && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-sm p-6 mb-8 text-white">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiCreditCard className="h-10 w-10 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold mb-1">Complete Your Registration</h3>
                <p className="opacity-90">To access all features, please complete your payment of KES 200.</p>
              </div>
              <button 
                onClick={handleCompletePayment}
                className="ml-4 bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Complete Payment
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Features */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Available Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <FiBook className="h-5 w-5 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Learning Resources</h4>
              <p className="text-gray-600 text-sm mb-3">Access comprehensive learning materials and courses</p>
              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Available
              </span>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <FiBarChart2 className="h-5 w-5 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Progress Tracking</h4>
              <p className="text-gray-600 text-sm mb-3">Monitor your learning progress and achievements</p>
              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Available
              </span>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <FiUsers className="h-5 w-5 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Community</h4>
              <p className="text-gray-600 text-sm mb-3">Connect with other learners and mentors</p>
              <span className={`inline-block text-xs px-2 py-1 rounded-full ${
                paymentStatus === 'completed' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {paymentStatus === 'completed' ? 'Available' : 'Locked'}
              </span>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <FiAward className="h-5 w-5 text-yellow-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Certification</h4>
              <p className="text-gray-600 text-sm mb-3">Earn certificates upon course completion</p>
              <span className={`inline-block text-xs px-2 py-1 rounded-full ${
                paymentStatus === 'completed' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {paymentStatus === 'completed' ? 'Available' : 'Locked'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => setShowProfile(true)}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                <FiUser className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Edit Profile</span>
            </button>
            
            <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-200 transition-colors">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                <FiLock className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Change Password</span>
            </button>
            
            <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-200 transition-colors">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                <FiHelpCircle className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Contact Support</span>
            </button>
            
            <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                <FiSettings className="h-5 w-5 text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border-l-4 ${
          notification.type === 'success' ? 'border-green-500' : 'border-red-500'
        } p-4 transform transition-transform duration-300 ease-in-out`}>
          <div className="flex items-start">
            {notification.type === 'success' ? (
              <FiCheckCircle className="h-6 w-6 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            ) : (
              <FiXCircle className="h-6 w-6 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {notification.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => !editMode && setShowProfile(false)}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {editMode ? 'Edit Profile' : 'User Profile'}
                      </h3>
                      <button
                        type="button"
                        className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                        onClick={() => {
                          setShowProfile(false);
                          if (editMode) handleProfileCancel();
                        }}
                      >
                        <FiX className="h-6 w-6" />
                      </button>
                    </div>

                    <div className="mt-6">
                      {!editMode ? (
                        // View Mode
                        <div className="space-y-6">
                          <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                              <FiUser className="h-10 w-10 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">{profileData.username}</h3>
                            <p className="text-sm text-gray-500">{profileData.email}</p>
                          </div>

                          <div className="border-t border-gray-200 pt-4">
                            <h4 className="text-md font-medium text-gray-900 flex items-center mb-3">
                              <FiUser className="mr-2 h-4 w-4" />
                              Personal Information
                            </h4>
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-3">
                              <div>
                                <dt className="text-sm font-medium text-gray-500 flex items-center">
                                  <FiUser className="mr-2 h-4 w-4" />
                                  Full Name
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900">{profileData.username || 'Not provided'}</dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-gray-500 flex items-center">
                                  <FiCalendar className="mr-2 h-4 w-4" />
                                  Age
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900">{profileData.age || 'Not provided'}</dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-gray-500 flex items-center">
                                  <FiUser className="mr-2 h-4 w-4" />
                                  Gender
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900">{profileData.gender || 'Not provided'}</dd>
                              </div>
                            </dl>
                          </div>

                          <div className="border-t border-gray-200 pt-4">
                            <h4 className="text-md font-medium text-gray-900 flex items-center mb-3">
                              <FiGlobe className="mr-2 h-4 w-4" />
                              Contact & Location
                            </h4>
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-3">
                              <div>
                                <dt className="text-sm font-medium text-gray-500 flex items-center">
                                  <FiMail className="mr-2 h-4 w-4" />
                                  Email
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900">{profileData.email || 'Not provided'}</dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-gray-500 flex items-center">
                                  <FiPhone className="mr-2 h-4 w-4" />
                                  Phone Number
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900">{profileData.phone_no || 'Not provided'}</dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-gray-500 flex items-center">
                                  <FiMapPin className="mr-2 h-4 w-4" />
                                  County
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900">{profileData.county || 'Not provided'}</dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-gray-500 flex items-center">
                                  <FiMapPin className="mr-2 h-4 w-4" />
                                  Subcounty
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900">{profileData.subcounty || 'Not provided'}</dd>
                              </div>
                            </dl>
                          </div>
                        </div>
                      ) : (
                        // Edit Mode
                        <div className="space-y-6">
                          <div className="border-t border-gray-200 pt-4">
                            <h4 className="text-md font-medium text-gray-900 flex items-center mb-3">
                              <FiUser className="mr-2 h-4 w-4" />
                              Personal Information
                            </h4>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                  <FiUser className="mr-2 h-4 w-4" />
                                  Full Name
                                </label>
                                <input
                                  type="text"
                                  name="username"
                                  value={profileData.username}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Enter your full name"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                  <FiCalendar className="mr-2 h-4 w-4" />
                                  Age
                                </label>
                                <input
                                  type="number"
                                  name="age"
                                  value={profileData.age}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Enter your age"
                                  min="18"
                                  max="120"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                  <FiUser className="mr-2 h-4 w-4" />
                                  Gender
                                </label>
                                <select
                                  name="gender"
                                  value={profileData.gender}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="">Select gender</option>
                                  <option value="Male">Male</option>
                                  <option value="Female">Female</option>
                                  <option value="Other">Other</option>
                                  <option value="Prefer not to say">Prefer not to say</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-gray-200 pt-4">
                            <h4 className="text-md font-medium text-gray-900 flex items-center mb-3">
                              <FiGlobe className="mr-2 h-4 w-4" />
                              Contact & Location
                            </h4>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                  <FiPhone className="mr-2 h-4 w-4" />
                                  Phone Number
                                </label>
                                <input
                                  type="tel"
                                  name="phone_no"
                                  value={profileData.phone_no}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="+2547XXXXXXXX or 07XXXXXXXX"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                  <FiMapPin className="mr-2 h-4 w-4" />
                                  County
                                </label>
                                <select
                                  name="county"
                                  value={profileData.county}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="">Select a county</option>
                                  <option value="Mombasa">Mombasa</option>
                                  <option value="Nairobi">Nairobi</option>
                                  {/* Add other counties as needed */}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                  <FiMapPin className="mr-2 h-4 w-4" />
                                  Subcounty
                                </label>
                                <input
                                  type="text"
                                  name="subcounty"
                                  value={profileData.subcounty}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Enter your subcounty"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {!editMode ? (
                  <>
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={handleProfileEdit}
                    >
                      <FiEdit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={handleLogout}
                    >
                      <FiLogOut className="mr-2 h-4 w-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={handleProfileSave}
                    >
                      <FiSave className="mr-2 h-4 w-4" />
                      Save Changes
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={handleProfileCancel}
                    >
                      <FiX className="mr-2 h-4 w-4" />
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={cancelLogout}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FiLogOut className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Confirm Logout
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to log out of your account?
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        You will need to log in again to access your dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={confirmLogout}
                >
                  <FiLogOut className="mr-2 h-4 w-4" />
                  Yes, Logout
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={cancelLogout}
                >
                  <FiArrowLeft className="mr-2 h-4 w-4" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;