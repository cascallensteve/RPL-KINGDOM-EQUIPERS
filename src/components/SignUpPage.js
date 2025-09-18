import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';

// Helper function to get referral code from URL
const getReferralCodeFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('ref') || '';
};

const SignUpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Get the previous path or default to home
  const from = location.state?.from?.pathname || '/';
  
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Initialize form data with referral code from URL if present
  const [formData, setFormData] = useState(() => ({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: '',
    phone_no: '',
    county: '',
    subcounty: '',
    referralCode: getReferralCodeFromURL()
  }));
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: '',
    percentage: 0
  });
  const [filteredSubcounties, setFilteredSubcounties] = useState([]);

  // All 47 Kenyan Counties with their subcounties
  const countiesWithSubcounties = useMemo(() => ({
    'Mombasa': ['Changamwe', 'Jomvu', 'Kisauni', 'Likoni', 'Mvita', 'Nyali'],
    'Kwale': ['Kinango', 'Lungalunga', 'Matuga', 'Msambweni'],
    'Kilifi': ['Ganze', 'Kaloleni', 'Kilifi North', 'Kilifi South', 'Magarini', 'Malindi', 'Rabai'],
    'Tana River': ['Bura', 'Galole', 'Garsen'],
    'Lamu': ['Lamu East', 'Lamu West'],
    'Taita Taveta': ['Mwatate', 'Taveta', 'Voi', 'Wundanyi'],
    'Garissa': ['Daadab', 'Fafi', 'Garissa Township', 'Hulugho', 'Ijara', 'Lagdera', 'Balambala'],
    'Wajir': ['Eldas', 'Tarbaj', 'Wajir East', 'Wajir North', 'Wajir South', 'Wajir West'],
    'Mandera': ['Banissa', 'Lafey', 'Mandera East', 'Mandera North', 'Mandera South', 'Mandera West'],
    'Marsabit': ['Laisamis', 'Moyale', 'North Horr', 'Saku'],
    'Isiolo': ['Isiolo', 'Merti', 'Garbatulla'],
    'Meru': ['Buuri', 'Igembe Central', 'Igembe North', 'Igembe South', 'Meru Central', 'Meru South', 'Tigania Central', 'Tigania East', 'Tigania West'],
    'Tharaka Nithi': ['Chuka', 'Maara', 'Tharaka'],
    'Embu': ['Embu East', 'Embu North', 'Embu West', 'Mbeere North', 'Mbeere South'],
    'Kitui': ['Kitui Central', 'Kitui East', 'Kitui Rural', 'Kitui South', 'Kitui West', 'Mwingi Central', 'Mwingi North', 'Mwingi West'],
    'Machakos': ['Athiriver', 'Kathiani', 'Machakos Town', 'Masinga', 'Matungulu', 'Mavoko', 'Yatta'],
    'Makueni': ['Kibwezi East', 'Kibwezi West', 'Kilome', 'Makueni', 'Mbooni'],
    'Nyandarua': ['Kinangop', 'Kipipiri', 'Ndaragwa', 'Ol Kalou', 'Ol Jorok'],
    'Nyeri': ['Kieni East', 'Kieni West', 'Mathira East', 'Mathira West', 'Mukurweini', 'Nyeri Central', 'Nyeri South', 'Tetu'],
    'Kirinyaga': ['Gichugu', 'Kirinyaga Central', 'Kirinyaga East', 'Kirinyaga West', 'Mwea East', 'Mwea West'],
    'Murang\'a': ['Gatanga', 'Kahuro', 'Kandara', 'Kangema', 'Kigumo', 'Kiharu', 'Maragwa', 'Murang\'a South'],
    'Kiambu': ['Gatundu North', 'Gatundu South', 'Githunguri', 'Juja', 'Kabete', 'Kiambu', 'Kiambaa', 'Kikuyu', 'Lari', 'Limuru', 'Ruiru', 'Thika Town'],
    'Turkana': ['Loima', 'Turkana Central', 'Turkana East', 'Turkana North', 'Turkana South', 'Turkana West'],
    'West Pokot': ['Central Pokot', 'North Pokot', 'Pokot South', 'West Pokot'],
    'Samburu': ['Samburu East', 'Samburu North', 'Samburu West'],
    'Trans Nzoia': ['Cherangany', 'Endebess', 'Kiminini', 'Kwanza', 'Saboti'],
    'Uasin Gishu': ['Ainabkoi', 'Kapseret', 'Kesses', 'Moiben', 'Soy', 'Turbo'],
    'Elgeyo Marakwet': ['Keiyo North', 'Keiyo South', 'Marakwet East', 'Marakwet West'],
    'Nandi': ['Aldai', 'Chesumei', 'Emgwen', 'Mosop', 'Nandi Hills', 'Tinderet'],
    'Baringo': ['Baringo Central', 'Baringo North', 'Baringo South', 'Eldama Ravine', 'Mogotio', 'Tiaty'],
    'Laikipia': ['Laikipia Central', 'Laikipia East', 'Laikipia North', 'Laikipia West', 'Nyahururu'],
    'Nakuru': ['Bahati', 'Gilgil', 'Kuresoi North', 'Kuresoi South', 'Molo', 'Naivasha', 'Nakuru Town East', 'Nakuru Town West', 'Njoro', 'Rongai', 'Subukia'],
    'Narok': ['Narok East', 'Narok North', 'Narok South', 'Narok West', 'Transmara East', 'Transmara West'],
    'Kajiado': ['Isinya', 'Kajiado Central', 'Kajiado East', 'Kajiado North', 'Kajiado South', 'Kajiado West'],
    'Kericho': ['Ainamoi', 'Belgut', 'Bureti', 'Kipkelion East', 'Kipkelion West', 'Soin Sigowet'],
    'Bomet': ['Bomet Central', 'Bomet East', 'Chepalungu', 'Konoin', 'Sotik'],
    'Kakamega': ['Butere', 'Kakamega Central', 'Kakamega East', 'Kakamega North', 'Kakamega South', 'Khwisero', 'Lugari', 'Lukuyani', 'Matungu', 'Mumias East', 'Mumias West', 'Navakholo'],
    'Vihiga': ['Emuhaya', 'Hamisi', 'Luanda', 'Sabatia', 'Vihiga'],
    'Bungoma': ['Bumula', 'Kabuchai', 'Kanduyi', 'Kimilili', 'Mt Elgon', 'Tongaren', 'Webuye East', 'Webuye West'],
    'Busia': ['Budalangi', 'Butula', 'Funyula', 'Nambele', 'Teso North', 'Teso South'],
    'Siaya': ['Alego Usonga', 'Bondo', 'Gem', 'Rarieda', 'Ugenya', 'Unguja'],
    'Kisumu': ['Kisumu Central', 'Kisumu East', 'Kisumu West', 'Muhoroni', 'Nyakach', 'Nyando', 'Seme'],
    'Homa Bay': ['Homa Bay Town', 'Kabondo Kasipul', 'Karachuonyo', 'Kasipul', 'Mbita', 'Ndhiwa', 'Rangwe', 'Suba'],
    'Migori': ['Awendo', 'Kuria East', 'Kuria West', 'Mabera', 'Ntimaru', 'Rongo', 'Suna East', 'Suna West', 'Uriri'],
    'Kisii': ['Bobasi', 'Bomachoge Borabu', 'Bomachoge Chache', 'Bonchari', 'Kitutu Chache North', 'Kitutu Chache South', 'Nyaribari Chache', 'Nyaribari Masaba', 'South Mugirango'],
    'Nyamira': ['Borabu', 'Manga', 'Masaba North', 'Nyamira North', 'Nyamira South'],
    'Nairobi': ['Dagoretti North', 'Dagoretti South', 'Embakasi Central', 'Embakasi East', 'Embakasi North', 'Embakasi South', 'Embakasi West', 'Kamukunji', 'Kasarani', 'Kibra', 'Langata', 'Makadara', 'Mathare', 'Roysambu', 'Ruaraka', 'Starehe', 'Westlands']
  }), []);

  const counties = Object.keys(countiesWithSubcounties);
  const totalSteps = 4;

  // Update subcounties when county changes
  useEffect(() => {
    if (formData.county && countiesWithSubcounties[formData.county]) {
      setFilteredSubcounties(countiesWithSubcounties[formData.county]);
      // Reset subcounty when county changes
      setFormData(prev => ({ ...prev, subcounty: '' }));
    } else {
      setFilteredSubcounties([]);
    }
  }, [formData.county, countiesWithSubcounties]);

  // Calculate password strength when password changes
  useEffect(() => {
    if (formData.password) {
      calculatePasswordStrength(formData.password);
    } else {
      setPasswordStrength({
        score: 0,
        label: '',
        percentage: 0
      });
    }
  }, [formData.password]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const calculatePasswordStrength = (password) => {
    let score = 0;
    
    // Length check (minimum 8 characters)
    if (password.length >= 8) score += 1;
    
    // Contains lowercase letter
    if (/[a-z]/.test(password)) score += 1;
    
    // Contains uppercase letter
    if (/[A-Z]/.test(password)) score += 1;
    
    // Contains number
    if (/\d/.test(password)) score += 1;
    
    // Contains special character
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    // Determine strength label and percentage
    let percentage = (score / 5) * 100;
    let label = '';
    
    switch (score) {
      case 0:
      case 1:
        label = 'Very Weak';
        break;
      case 2:
        label = 'Weak';
        break;
      case 3:
        label = 'Medium';
        break;
      case 4:
        label = 'Strong';
        break;
      case 5:
        label = 'Very Strong';
        break;
      default:
        label = '';
    }
    
    setPasswordStrength({
      score,
      label,
      percentage
    });
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
        if (formData.password.length < 8) return 'Password must be at least 8 characters';
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate form data
    const validationError = validateStep(currentStep);
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      setLoading(false);
      return;
    }

    // Submit form data
    try {
      const response = await authAPI.signUp(formData);
      
      // Handle successful signup
      if (response.message && response.user) {
        // Process referral if exists
        const referralCode = formData.referralCode || localStorage.getItem('pendingReferral');
        if (referralCode) {
          try {
            // Get existing referrals or initialize empty array
            const referrals = JSON.parse(localStorage.getItem('referralTracking') || '[]');
            
            // Add new referral
            referrals.push({
              code: referralCode,
              email: formData.email,
              timestamp: new Date().toISOString()
            });
            
            // Save back to localStorage
            localStorage.setItem('referralTracking', JSON.stringify(referrals));
            
            // Clear pending referral
            localStorage.removeItem('pendingReferral');
          } catch (err) {
            console.error('Error processing referral:', err);
            // Don't fail the signup if referral processing fails
          }
        }
        
        setSuccess(response.message);
        
        // Store user data temporarily for email verification
        localStorage.setItem('temp_user_email', formData.email);
        
        // If API returns token, log in and go to dashboard; else go to verify-email
        if (response.token) {
          try {
            login(response.user, response.token);
            setTimeout(() => {
              navigate('/dashboard');
            }, 1500);
          } catch (_) {
            // Handle login error if needed
          }
        } else {
          setTimeout(() => {
            navigate('/verify-email');
          }, 1500);
        }
      }
    } catch (err) {
      // Check if the error indicates an existing email
      const errorMessage = err.detail || err.message || 'Registration failed. Please try again.';
      
      if (errorMessage.toLowerCase().includes('email') && 
          (errorMessage.toLowerCase().includes('exist') || 
           errorMessage.toLowerCase().includes('already'))) {
        setError('This email address is already registered. Please use a different email or try signing in.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex justify-between items-center mb-8 relative">
      {/* Progress Line */}
      <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 -z-10"></div>
      
      {Array.from({ length: totalSteps }, (_, index) => (
        <div key={index} className="flex flex-col items-center relative z-10 flex-1">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
            index + 1 <= currentStep 
              ? 'bg-green-500 text-white transform scale-110' 
              : 'bg-white border-2 border-gray-300 text-gray-500'
          }`}>
            {index + 1}
          </div>
          <div className={`text-xs mt-2 text-center max-w-20 leading-tight font-medium ${
            index + 1 <= currentStep ? 'text-green-600' : 'text-gray-500'
          }`}>
            {index === 0 ? 'Personal Info' : 
             index === 1 ? 'Security' : 
             index === 2 ? 'Demographics' : 'Location'}
          </div>
        </div>
      ))}
    </div>
  );

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score <= 1) return 'bg-red-500';
    if (passwordStrength.score === 2) return 'bg-orange-500';
    if (passwordStrength.score === 3) return 'bg-yellow-500';
    if (passwordStrength.score === 4) return 'bg-green-500';
    return 'bg-green-600';
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">Personal Information</h3>
            <p className="text-gray-600 text-center mb-8">Let's start with your basic information</p>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                />
              </div>
            </div>
          </>
        );

      case 2:
        return (
          <>
            <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">Security Setup</h3>
            <p className="text-gray-600 text-center mb-8">Create a strong password for your account</p>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Create a password (min. 8 characters)"
                    minLength="8"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">Password strength:</span>
                      <span className={`text-xs font-semibold ${
                        passwordStrength.score <= 1 ? 'text-red-500' :
                        passwordStrength.score === 2 ? 'text-orange-500' :
                        passwordStrength.score === 3 ? 'text-yellow-500' :
                        passwordStrength.score >= 4 ? 'text-green-500' : ''
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${getPasswordStrengthColor()} transition-all duration-300`}
                        style={{ width: `${passwordStrength.percentage}%` }}
                      ></div>
                    </div>
                    <small className="text-gray-500 text-sm mt-1 block">
                      Include uppercase, lowercase, numbers, and special characters for a stronger password
                    </small>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>
            </div>
          </>
        );

      case 3:
        return (
          <>
            <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">Demographics</h3>
            <p className="text-gray-600 text-center mb-8">Tell us a bit more about yourself</p>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="age" className="block text-sm font-semibold text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  placeholder="Enter your age"
                  min="18"
                  max="120"
                />
                <small className="text-gray-500 text-sm mt-1 block">You must be at least 18 years old</small>
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-semibold text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select your gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </>
        );

      case 4:
        return (
          <>
            <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">Location Details</h3>
            <p className="text-gray-600 text-center mb-8">Where are you located?</p>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="phone_no" className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone_no"
                  name="phone_no"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  value={formData.phone_no}
                  onChange={handleChange}
                  required
                  placeholder="+2547XXXXXXXX or 07XXXXXXXX"
                />
                <small className="text-gray-500 text-sm mt-1 block">Format: +2547XXXXXXXX or 07XXXXXXXX</small>
              </div>

              <div>
                <label htmlFor="county" className="block text-sm font-semibold text-gray-700 mb-2">
                  County
                </label>
                <select
                  id="county"
                  name="county"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
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

              <div>
                <label htmlFor="subcounty" className="block text-sm font-semibold text-gray-700 mb-2">
                  Subcounty (Optional)
                </label>
                <select
                  id="subcounty"
                  name="subcounty"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  value={formData.subcounty || ''}
                  onChange={handleChange}
                  disabled={!formData.county}
                >
                  <option value="">Select a subcounty (optional)</option>
                  {formData.county && filteredSubcounties.map(subcounty => (
                    <option key={subcounty} value={subcounty}>{subcounty}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="referralCode" className="block text-sm font-semibold text-gray-700 mb-2">
                  Referral Code (Optional)
                </label>
                <input
                  type="text"
                  id="referralCode"
                  name="referralCode"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  value={formData.referralCode}
                  onChange={handleChange}
                  placeholder="Enter referral code if any"
                />
                <small className="text-gray-500 text-sm mt-1 block">If someone referred you, enter their code here</small>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-gradient-to-br from-blue-700 via-indigo-700 to-sky-600">
      {/* Soft glow overlays to add depth without clutter */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-blue-400 opacity-20 blur-3xl"></div>
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-sky-400 opacity-20 blur-3xl"></div>
      
      {/* Back Button */}
      <button
        onClick={() => navigate(from)}
        className="absolute top-6 left-6 z-20 flex items-center text-white hover:text-yellow-300 transition-colors group"
        aria-label="Go back"
      >
        <ArrowLeft className="h-6 w-6 mr-1 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back</span>
      </button>
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-8">
            <img 
              src="/IMAGES/LOGO.png" 
              alt="Kingdom Equippers Logo" 
              className="h-40 w-auto object-contain"
            />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-2">Kingdom Equippers</h1>
          <p className="text-blue-100 text-lg">Create your account</p>
        </div>

        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          {/* Step Indicator */}
          {renderStepIndicator()}

          <form onSubmit={handleSubmit}>
            {/* Step Content */}
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8 justify-between">
              {currentStep > 1 && (
                <button
                  type="button"
                  className="flex-1 bg-transparent border-2 border-green-500 text-green-600 font-semibold py-3 px-6 rounded-lg hover:bg-green-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={prevStep}
                  disabled={loading}
                >
                  Previous
                </button>
              )}
              
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  onClick={nextStep}
                  disabled={loading}
                >
                  Next
                </button>
              ) : (
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Sign In Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-green-600 hover:text-green-700 font-semibold transition-colors duration-200"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;