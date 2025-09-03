import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-root">
      <header className="lp-container landing-header">
        <div className="landing-brand">
          <h1>RPL System</h1>
          <span>Kingdom Equippers</span>
        </div>
        <div className="landing-actions">
          <button onClick={() => navigate('/login')} className="lp-btn-text">Sign In</button>
          <button onClick={() => navigate('/signup')} className="lp-btn-primary">Create Account</button>
          <button onClick={() => navigate('/admin-signup')} className="lp-btn-admin">Admin Signup</button>
        </div>
      </header>

      <section className="lp-container lp-hero">
        <div className="lp-hero-grid">
          <div className="lp-hero-text">
            <h2>Transform Your Skills Into Recognized Qualifications</h2>
            <p>
              Experience the future of professional certification with our advanced RPL (Recognition of Prior Learning) platform. 
              Streamlined for Kenya's KNQA framework, we help you showcase your expertise and achieve formal recognition for your valuable skills and experience.
            </p>
            <div className="lp-cta">
              <button className="lp-btn-primary" onClick={() => navigate('/signup')}>Start Your Journey</button>
              <button className="lp-btn-outline" onClick={() => navigate('/login')}>Sign In</button>
            </div>
          </div>
          <div className="lp-hero-image-wrap">
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80" 
              alt="Professional team collaboration"
              className="lp-hero-image"
            />
          </div>
        </div>
      </section>

      <section className="landing-features">
        <div className="lp-container">
          <h3 className="features-title">Why Choose Our Platform?</h3>
          <div className="features-grid">
            <div className="feature-tile">
              <div className="feature-icon-wrap"><span>🔐</span></div>
              <h4>Enterprise-Grade Security</h4>
              <p>Your data is protected with state-of-the-art encryption and secure authentication protocols</p>
            </div>
            <div className="feature-tile">
              <div className="feature-icon-wrap"><span>📋</span></div>
              <h4>KNQA-Compliant Framework</h4>
              <p>Complete digital checklist aligned with Kenya's National Qualifications Authority standards</p>
            </div>
            <div className="feature-tile">
              <div className="feature-icon-wrap"><span>👥</span></div>
              <h4>Advanced Mentorship Dashboard</h4>
              <p>Real-time progress tracking and milestone management for candidates and mentors</p>
            </div>
            <div className="feature-tile">
              <div className="feature-icon-wrap"><span>📤</span></div>
              <h4>Secure Content Portal</h4>
              <p>Upload and manage sermons, teaching materials, and testimonials with ease</p>
            </div>
            <div className="feature-tile">
              <div className="feature-icon-wrap"><span>💳</span></div>
              <h4>Seamless Payment Processing</h4>
              <p>Integrated payment solutions for hassle-free certification fee management</p>
            </div>
            <div className="feature-tile">
              <div className="feature-icon-wrap"><span>✅</span></div>
              <h4>Instant Verification System</h4>
              <p>Quick and secure email verification to get you started immediately</p>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-cta">
        <div className="lp-container landing-cta-inner">
          <h3>Ready to Transform Your Career?</h3>
          <p>
            Join thousands of professionals who have already taken the first step towards formal recognition of their skills and experience. 
            Start your RPL journey today and unlock new opportunities in your professional life.
          </p>
          <button className="lp-btn-contrast" onClick={() => navigate('/signup')}>Begin Your Certification Journey</button>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="lp-container landing-footer-inner">
          <div className="footer-brand">
            <h4>RPL System</h4>
            <p>Empowering Professionals Through Recognition</p>
          </div>
          <div className="footer-copy">
            <p>© {new Date().getFullYear()} RPL System by Kingdom Equippers Ltd. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;