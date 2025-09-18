import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Users, Award, BookOpen, Heart, Phone, Mail, MapPin, Menu, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  
  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const slides = [
    {
      image: "https://res.cloudinary.com/dqvsjtkqw/image/upload/v1757230094/top-view-patients-standing-circle-holding-hands_xy4dcg.webp",
      title: "Kingdom Equippers",
      subtitle: "Certifying Grassroots Pastors for Kingdom Impact",
      description: "Formal Recognition of Ministry through KNQA-aligned RPL, practical mentorship, and lifelong discipleship support."
    },
    {
      image: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1200&q=80",
      title: "Transform Lives",
      subtitle: "Through Recognized Certification",
      description: "Join thousands of pastors gaining formal recognition while continuing to serve their communities with excellence."
    },
    {
      image: "https://res.cloudinary.com/dqvsjtkqw/image/upload/v1757230090/african-american-male-friends-standing-park-discussing-bible_wzoljk.webp",
      title: "Empower Ministry",
      subtitle: "With Digital Portfolio Support",
      description: "Upload sermons, testimonies, and teaching materials to build your comprehensive Portfolio of Evidence."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="h-32 w-auto">
                <img 
                  src="/IMAGES/LOGO.png" 
                  alt="Kingdom Equippers Logo" 
                  className="h-full w-auto object-contain"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold text-gray-900">Kingdom Equippers</h1>
                <p className="text-sm text-gray-600">Empowering Ministry Excellence</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              <a href="#programs" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Programs</a>
              <a href="#mission" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Mission</a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Testimonials</a>
              <Link to="/contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Contact</Link>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMenu}
                className="text-gray-700 hover:text-blue-600 focus:outline-none"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="h-8 w-8" />
                ) : (
                  <Menu className="h-8 w-8" />
                )}
              </button>
            </div>
          </div>
          
          {/* Mobile menu */}
          <div 
            ref={menuRef}
            className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} bg-white shadow-lg rounded-lg mt-2 py-2`}
          >
            <a 
              href="#programs" 
              className="block px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Programs
            </a>
            <a 
              href="#mission" 
              className="block px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Mission
            </a>
            <a 
              href="#testimonials" 
              className="block px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Testimonials
            </a>
            <Link 
              to="/contact" 
              className="block px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="border-t border-gray-100 my-2"></div>
            <button
              onClick={() => {
                navigate('/login?forceLogin=1');
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 text-blue-600 hover:bg-blue-50 transition-colors font-medium"
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Carousel */}
      <section className="relative h-[80vh] overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="text-center text-white px-4 max-w-4xl">
                <h1 className="text-5xl md:text-7xl font-bold mb-4 animate-fade-in">
                  {slide.title}
                </h1>
                <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-blue-200">
                  {slide.subtitle}
                </h2>
                <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
                  {slide.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate('/login?forceLogin=1')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-xl"
                  >
                    Login Here
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-green-700 hover:to-green-800 transform hover:scale-105 transition-all duration-300 shadow-xl"
                  >
                    Get Started
                  </button>
                  <button onClick={() => navigate('/about-rpl')} className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300">
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Carousel Navigation */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all duration-300"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all duration-300"
        >
          <ChevronRight size={24} />
        </button>
        
        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose Kingdom Equippers?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience comprehensive pastoral certification with our innovative approach
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">KNQA-Aligned RPL Pathways</h3>
              <p className="text-gray-600 leading-relaxed">
                Formal recognition aligned with Kenya's National Qualifications Authority standards for credible certification.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Digital Portfolio Support</h3>
              <p className="text-gray-600 leading-relaxed">
                Upload sermons, videos, testimonies, and teaching materials to build your comprehensive Portfolio of Evidence.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Mentor-Led Certification</h3>
              <p className="text-gray-600 leading-relaxed">
                Affordable, practical mentorship and continuing pastoral formation with experienced ministry leaders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                To empower grassroots pastors and ministry leaders across Kenya by providing formal recognition of their valuable skills and experience through KNQA-aligned RPL pathways.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                We believe that every pastor deserves recognition for their dedication to serving their communities, regardless of their formal education background.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-700">Formal certification through practical experience</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-700">Digital portfolio development and management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-700">Mentorship and continuing pastoral formation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-700">Community transformation through recognized ministry</span>
                </div>
              </div>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300">
                Join Our Mission
              </button>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=800&q=80"
                alt="Ministry Training"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-2xl shadow-xl">
                <div className="flex items-center space-x-3">
                  <Heart className="text-white" size={24} />
                  <div>
                    <p className="font-bold text-lg">500+</p>
                    <p className="text-sm">Pastors Certified</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our Programs
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive pathways for pastoral development and certification
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">RPL Pathways</h3>
              <p className="text-gray-600 mb-6">
                Application portal, mentor assignments, Portfolio of Evidence support, readiness meter, and KNQA checklist.
              </p>
              <button className="text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                Apply Now →
              </button>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Resources & E-Bookstore</h3>
              <p className="text-gray-600 mb-6">
                Books, handbooks, and audio sermons with M-Pesa and card payment options for continued learning.
              </p>
              <button className="text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                Browse Resources →
              </button>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Capacity Building</h3>
              <p className="text-gray-600 mb-6">
                Short courses for pastors, Sunday school teachers, and youth leaders to enhance ministry skills.
              </p>
              <button className="text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                View Courses →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Our Pastors Say
            </h2>
            <p className="text-xl text-gray-600">
              Hear from pastors who have transformed their ministry through our certification program
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center mb-6">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                  alt="Pastor John"
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Pastor John Mwangi</h4>
                  <p className="text-gray-600">Nairobi, Kenya</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                "The RPL certification process gave me formal recognition for my 15 years of ministry experience. Now I can confidently serve my community with official credentials."
              </p>
              <div className="flex text-yellow-400">
                ★★★★★
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center mb-6">
                <img
                  src="https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=100&q=80"
                  alt="Pastor Mary"
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Pastor Mary Wanjiku</h4>
                  <p className="text-gray-600">Kisumu, Kenya</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                "The digital portfolio system helped me organize my sermons and teachings. The mentorship program provided invaluable guidance for my ministry growth."
              </p>
              <div className="flex text-yellow-400">
                ★★★★★
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center mb-6">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80"
                  alt="Pastor David"
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Pastor David Ochieng</h4>
                  <p className="text-gray-600">Mombasa, Kenya</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                "Kingdom Equippers made it possible for me to gain formal recognition without leaving my community. The KNQA alignment gives credibility to my ministry."
              </p>
              <div className="flex text-yellow-400">
                ★★★★★
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Ministry?
          </h2>
          <p className="text-xl mb-8 leading-relaxed">
            Join hundreds of pastors who have gained formal recognition while continuing to serve their communities with excellence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/login?forceLogin=1')} className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-xl">
              Apply for RPL Certification
            </button>
            <button onClick={() => navigate('/login?forceLogin=1')} className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300">
              Support Our Mission
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-start space-x-4 mb-6">
                <div className="h-16 w-auto">
                  <img 
                    src="/IMAGES/LOGO.png" 
                    alt="Kingdom Equippers Logo" 
                    className="h-full w-auto object-contain"
                  />
                </div>
                <div className="pt-1">
                  <h3 className="text-2xl font-bold text-white">Kingdom Equippers</h3>
                  <p className="text-gray-300 text-sm mt-1">Empowering Ministry Through Recognition</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Building an integrated digital ecosystem that empowers grassroots ministry and fosters community transformation across Kenya.
              </p>
            </div>
            
            <div>
              <h4 className="text-xl font-semibold mb-6">Contact Information</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone size={18} className="text-blue-400" />
                  <span className="text-gray-300">+254 725 326 367</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail size={18} className="text-blue-400" />
                  <span className="text-gray-300">info@kingdomequippers.org</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin size={18} className="text-blue-400" />
                  <span className="text-gray-300">Oyugis, Homa Bay County, Kenya</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-xl font-semibold mb-6">Quick Links</h4>
              <div className="space-y-3">
                <Link to="/signup" className="block text-gray-300 hover:text-white transition-colors">Apply for RPL</Link>
                <a href="#programs" className="block text-gray-300 hover:text-white transition-colors">Our Programs</a>
                <Link to="/resources" className="block text-gray-300 hover:text-white transition-colors">Resources</Link>
                <Link to="/donate" className="block text-gray-300 hover:text-white transition-colors">Support Us</Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} Kingdom Equippers Ltd. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;