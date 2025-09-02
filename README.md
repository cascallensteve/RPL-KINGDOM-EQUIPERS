# RPL System - React Application

A comprehensive React-based system for user registration, email verification, login, and payment processing with admin capabilities.

## 🚀 Features

### **User Management**
- **Client Registration**: Multi-step registration form for regular users
- **Admin Access**: Hardcoded admin login for system administration
- **Email Verification**: Secure email verification with OTP
- **Password Management**: Secure password creation with visibility toggle

### **Client Features**
- **Complete Registration**: Personal info, demographics, location details
- **Age & Gender**: Age validation (18-120) and gender selection
- **County Selection**: All 47 Kenyan counties included
- **Phone Validation**: Accepts +2547XXXXXXXX or 07XXXXXXXX formats
- **Payment Integration**: M-Pesa payment system for registration fee

### **Admin Features**
- **Admin Portal**: Dedicated admin dashboard
- **User Management**: View all users, monitor platform activity
- **User Details**: Detailed user information and status tracking
- **Platform Overview**: Statistics and quick actions
- **System Administration**: Platform monitoring and configuration

### **Authentication & Security**
- **Two-Step Password Reset**: Secure password recovery process
- **Protected Routes**: Role-based access control
- **Session Management**: Persistent login state
- **Form Validation**: Comprehensive client-side validation

## 🔧 Technical Stack

- **React 18**: Modern React with hooks
- **React Router DOM**: Client-side routing
- **Context API**: Global state management
- **Axios**: HTTP client for API calls
- **CSS3**: Custom styling with CSS variables
- **Responsive Design**: Mobile-first approach

## 📱 API Endpoints

### **Authentication**
- `POST /signUp` - Client registration
- `POST /login` - User login
- `POST /verify-email` - Email verification
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token
- `POST /resend-verification-otp` - Resend verification code

### **Admin Operations**
- `GET /all-users` - Fetch all users (Admin only)
- `GET /user-details/{user_id}/` - Get specific user details (Admin only)

### **Payment**
- `POST /payments/pay` - Process M-Pesa payment

## 🔐 Admin Access

### **Hardcoded Admin Login**
- **Email**: `technoava@gmail.com`
- **Password**: `technova`
- **Access**: Direct access to admin dashboard
- **Features**: Full administrative privileges

## 🎯 User Flow

### **Client Registration Flow**
1. **Landing Page** → Welcome and account creation
2. **Sign Up** → Multi-step form (4 steps)
   - Step 1: Personal Information (username, email)
   - Step 2: Security Setup (password, confirm password)
   - Step 3: Demographics (age, gender)
   - Step 4: Location Details (phone, county)
3. **Email Verification** → Enter OTP code
4. **Payment Page** → M-Pesa payment (KES 200)
5. **Dashboard** → User dashboard with features

### **Admin Login Flow**
1. **Login Page** → Enter admin credentials
2. **Admin Dashboard** → Direct access to admin portal

### **Login Flow**
- **Admin**: Login with hardcoded credentials → Direct access to admin dashboard
- **Clients**: Login → Email verification check → Payment/Dashboard

## 🎨 Design Features

### **Color Scheme**
- **Primary Green**: #28a745 (Bootstrap success green)
- **Secondary Green**: #20c997 (Teal accent)
- **White**: #ffffff (Clean backgrounds)
- **Gray Scale**: Various shades for text and borders

### **UI Components**
- **Multi-step Forms**: Progress indicators and step navigation
- **Password Visibility**: Toggle buttons for password fields
- **Responsive Tables**: Admin user management tables
- **Modal Dialogs**: User detail views
- **Status Badges**: Color-coded status indicators
- **Card Layouts**: Clean, modern card designs

## 📁 Project Structure

```
src/
├── components/
│   ├── LandingPage.js          # Welcome page
│   ├── LoginPage.js            # User authentication with admin login
│   ├── SignUpPage.js           # Client registration form
│   ├── EmailVerificationPage.js # Email verification
│   ├── ForgotPasswordPage.js   # Password reset request
│   ├── ResetPasswordPage.js    # Password reset with token
│   ├── PaymentPage.js          # M-Pesa payment processing
│   ├── Dashboard.js            # Client user dashboard
│   ├── AdminDashboard.js       # Admin management portal
│   └── AuthPages.css           # Authentication page styles
├── context/
│   └── AuthContext.js          # Authentication state management
├── services/
│   └── api.js                  # API service functions
└── App.js                      # Main application with routing
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v14 or higher)
- npm or yarn

### **Installation**
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm start`
4. Open [http://localhost:3000](http://localhost:3000)

### **Build for Production**
```bash
npm run build
```

## 🔐 Security Features

- **Protected Routes**: Role-based access control
- **Token Authentication**: JWT-based authentication
- **Form Validation**: Client-side input validation
- **Password Security**: Minimum length requirements
- **Session Management**: Secure token storage

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Flexible Grids**: Responsive layouts using CSS Grid
- **Touch Friendly**: Optimized for touch interactions
- **Breakpoint System**: Consistent responsive breakpoints

## 🎯 Key Features

### **Multi-step Registration**
- **Step Indicators**: Visual progress tracking
- **Validation**: Step-by-step form validation
- **Navigation**: Previous/Next step controls
- **Dynamic Content**: Different steps for different user types

### **Admin Portal**
- **Overview Dashboard**: Platform statistics and metrics
- **User Management**: Complete user listing and details
- **Activity Monitoring**: Platform usage tracking
- **System Settings**: Administrative configuration

### **Payment System**
- **M-Pesa Integration**: Mobile money payment processing
- **Payment Options**: Pay Now or Pay Later
- **Status Tracking**: Payment completion monitoring
- **Dashboard Integration**: Seamless payment flow

## 🔧 Customization

### **Styling**
- **CSS Variables**: Easy theme customization
- **Component Styles**: Modular CSS organization
- **Responsive Utilities**: Mobile-first CSS classes
- **Animation Support**: Smooth transitions and effects

### **Configuration**
- **API Endpoints**: Centralized API configuration
- **Environment Variables**: Configurable settings
- **Routing**: Flexible route configuration
- **State Management**: Context-based state handling

## 📊 Performance

- **Code Splitting**: Route-based code splitting
- **Optimized Bundles**: Production build optimization
- **Lazy Loading**: Component lazy loading support
- **Memory Management**: Efficient state management

## 🧪 Testing

- **Component Testing**: Individual component testing
- **Integration Testing**: API integration testing
- **User Flow Testing**: End-to-end user journey testing
- **Responsive Testing**: Cross-device compatibility testing

## 🚀 Deployment

### **Build Process**
1. Run `npm run build`
2. Deploy `build/` folder to web server
3. Configure server for React Router

### **Environment Setup**
- Set production API endpoints
- Configure environment variables
- Set up SSL certificates
- Configure CDN for static assets

## 📈 Future Enhancements

- **Real-time Notifications**: WebSocket integration
- **Advanced Analytics**: User behavior tracking
- **Multi-language Support**: Internationalization
- **Advanced Admin Features**: User approval workflows
- **Payment Gateway Expansion**: Additional payment methods

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes and test
4. Submit pull request
5. Code review and merge

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using React and modern web technologies**
