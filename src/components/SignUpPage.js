import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const SignUpPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: '',
    phone_no: '',
    county: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // All 47 Kenyan Counties
  const counties = [
    'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita Taveta', 'Garissa', 'Wajir', 'Mandera', 'Marsabit',
    'Isiolo', 'Meru', 'Tharaka Nithi', 'Embu', 'Kitui', 'Machakos', 'Makueni', 'Nyandarua', 'Nyeri', 'Kirinyaga',
    'Murang\'a', 'Kiambu', 'Turkana', 'West Pokot', 'Samburu', 'Trans Nzoia', 'Uasin Gishu', 'Elgeyo Marakwet', 'Nandi', 'Baringo',
    'Laikipia', 'Nakuru', 'Narok', 'Kajiado', 'Kericho', 'Bomet', 'Kakamega', 'Vihiga', 'Bungoma', 'Busia',
    'Siaya', 'Kisumu', 'Homa Bay', 'Migori', 'Kisii', 'Nyamira', 'Nairobi'
  ];

  const totalSteps = 4;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validatePhoneNumber = (phone) => {
    // Accept +2547XXXXXXXX or 07XXXXXXXX format
    const phoneRegex = /^(\+2547\d{8}|07\d{8})$/;
    return phoneRegex.test(phone);
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.username.trim()) return 'Full name is required';
        if (!formData.email.trim()) return 'Email is required';
        if (!formData.email.includes('@')) return 'Please enter a valid email';
        return null;
      case 2:
        if (!formData.password) return 'Password is required';
        if (formData.password.length < 6) return 'Password must be at least 6 characters';
        if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
        return null;
      case 3:
        if (!formData.age) return 'Age is required';
        if (formData.age < 18 || formData.age > 120) return 'Age must be between 18 and 120';
        if (!formData.gender) return 'Please select your gender';
        return null;
      case 4:
        if (!formData.phone_no) return 'Phone number is required';
        if (!validatePhoneNumber(formData.phone_no)) return 'Phone number must be in format: +2547XXXXXXXX or 07XXXXXXXX';
        if (!formData.county) return 'Please select a county';
        return null;
      default:
        return null;
    }
  };

  const nextStep = () => {
    const validationError = validateStep(currentStep);
    if (validationError) {
      setError(validationError);
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    setError('');
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateStep(currentStep);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Regular user signup
      const { confirmPassword, ...submitData } = formData;
      const response = await authAPI.signUp(submitData);
      
      if (response.message && response.user) {
        setSuccess(response.message);
        
        // Store user data temporarily for email verification
        localStorage.setItem('temp_user_email', formData.email);
        // If API returns token, log in and go to payment; else go to verify-email
        if (response.token) {
          try {
            login(response.token, response.user);
          } catch (_) {}
          setTimeout(() => {
            navigate('/payment');
          }, 2000);
        } else {
          setTimeout(() => {
            navigate('/verify-email');
          }, 2000);
        }
      }
    } catch (err) {
      setError(err.detail || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {Array.from({ length: totalSteps }, (_, index) => (
        <div key={index} className={`step ${index + 1 <= currentStep ? 'active' : ''}`}>
          <div className="step-number">{index + 1}</div>
          <div className="step-label">
            {index === 0 ? 'Personal Info' : 
             index === 1 ? 'Security' : 
             index === 2 ? 'Demographics' : 'Location'}
          </div>
        </div>
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <h3>Personal Information</h3>
            <p className="step-description">Let's start with your basic information</p>
            
            <div className="form-group">
              <label htmlFor="username" className="form-label">Full Name</label>
              <input
                type="text"
                id="username"
                name="username"
                className="form-control"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>
          </>
        );

      case 2:
        return (
          <>
            <h3>Security Setup</h3>
            <p className="step-description">Create a strong password for your account</p>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="password-input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Create a password"
                  minLength="6"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              <small className="form-help">Password must be at least 6 characters long</small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <div className="password-input-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-control"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>
          </>
        );

      case 3:
        return (
          <>
            <h3>Demographics</h3>
            <p className="step-description">Tell us a bit more about yourself</p>
            
            <div className="form-group">
              <label htmlFor="age" className="form-label">Age</label>
              <input
                type="number"
                id="age"
                name="age"
                className="form-control"
                value={formData.age}
                onChange={handleChange}
                required
                placeholder="Enter your age"
                min="18"
                max="120"
              />
              <small className="form-help">You must be at least 18 years old</small>
            </div>

            <div className="form-group">
              <label htmlFor="gender" className="form-label">Gender</label>
              <select
                id="gender"
                name="gender"
                className="form-control"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select your gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </>
        );

      case 4:
        return (
          <>
            <h3>Location Details</h3>
            <p className="step-description">Where are you located?</p>
            
            <div className="form-group">
              <label htmlFor="phone_no" className="form-label">Phone Number</label>
              <input
                type="tel"
                id="phone_no"
                name="phone_no"
                className="form-control"
                value={formData.phone_no}
                onChange={handleChange}
                required
                placeholder="+2547XXXXXXXX or 07XXXXXXXX"
              />
              <small className="form-help">Format: +2547XXXXXXXX or 07XXXXXXXX</small>
            </div>

            <div className="form-group">
              <label htmlFor="county" className="form-label">County</label>
              <select
                id="county"
                name="county"
                className="form-control"
                value={formData.county}
                onChange={handleChange}
                required
              >
                <option value="">Select a county</option>
                {counties.map(county => (
                  <option key={county} value={county}>{county}</option>
                ))}
              </select>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="page-container">
      <div className="auth-container">
        <div className="logo">
          <h1>RPL System</h1>
          <p>Create your account</p>
        </div>

        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {renderStepIndicator()}

          <form onSubmit={handleSubmit}>
            {renderStepContent()}

            <div className="step-navigation">
              {currentStep > 1 && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={prevStep}
                  disabled={loading}
                >
                  Previous
                </button>
              )}
              
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={nextStep}
                  disabled={loading}
                >
                  Next
                </button>
              ) : (
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? <span className="loading"></span> : 'Create Account'}
                </button>
              )}
            </div>
          </form>

          <div className="link-text">
            Already have an account? <Link to="/login">Sign in here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
