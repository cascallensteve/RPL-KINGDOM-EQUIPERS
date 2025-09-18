import React from 'react';
import { FiCheckCircle, FiBookOpen, FiUsers, FiAward, FiArrowRight } from 'react-icons/fi';
import { useNavigate, Link } from 'react-router-dom';

const AboutRPLPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">About RPL (Recognition of Prior Learning)</h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl">
            RPL is a process that formally recognizes the skills, knowledge, and experience you have already gained through ministry and community service.
          </p>
          <div className="mt-6 flex gap-3">
            <button onClick={() => navigate('/signup')} className="rounded-full bg-white text-blue-700 font-semibold px-6 py-3 hover:bg-gray-100 transition">
              Apply for RPL
            </button>
            <Link to="/contact" className="rounded-full border-2 border-white text-white font-semibold px-6 py-3 hover:bg-white hover:text-blue-700 transition">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* What is RPL */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What is RPL?</h2>
            <p className="text-gray-700 leading-7 mb-4">
              Recognition of Prior Learning (RPL) is a structured evaluation of your existing competencies. Instead of repeating training, your ministry experience and evidence are assessed against established standards to award recognition or certification.
            </p>
            <ul className="space-y-3 text-gray-800">
              <li className="flex items-start"><FiCheckCircle className="text-green-600 mt-1 mr-2"/> Formal recognition aligned with KNQA standards</li>
              <li className="flex items-start"><FiCheckCircle className="text-green-600 mt-1 mr-2"/> Focus on your real ministry work and impact</li>
              <li className="flex items-start"><FiCheckCircle className="text-green-600 mt-1 mr-2"/> Saves time and cost compared to traditional pathways</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Your Portfolio of Evidence</h3>
            <p className="text-gray-700 mb-4">We guide you to assemble practical evidence of your ministry:</p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center"><FiBookOpen className="mr-2 text-blue-600"/> Sermons, teachings, lesson plans</li>
              <li className="flex items-center"><FiUsers className="mr-2 text-blue-600"/> Mentorship and discipleship activities</li>
              <li className="flex items-center"><FiAward className="mr-2 text-blue-600"/> Testimonials, impact reports, certifications</li>
            </ul>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-2xl p-6">
              <h4 className="font-semibold text-gray-900 mb-2">1. Apply</h4>
              <p className="text-gray-700">Create your account and start your RPL application online.</p>
            </div>
            <div className="bg-blue-50 rounded-2xl p-6">
              <h4 className="font-semibold text-gray-900 mb-2">2. Build Evidence</h4>
              <p className="text-gray-700">Upload sermons, testimonies, and records with mentor guidance.</p>
            </div>
            <div className="bg-blue-50 rounded-2xl p-6">
              <h4 className="font-semibold text-gray-900 mb-2">3. Get Recognized</h4>
              <p className="text-gray-700">Undergo assessment aligned with KNQA and receive recognition.</p>
            </div>
          </div>
          <div className="mt-8">
            <button onClick={() => navigate('/signup')} className="inline-flex items-center rounded-lg bg-blue-600 text-white px-6 py-3 font-semibold hover:bg-blue-700">
              Start Application <FiArrowRight className="ml-2"/>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutRPLPage;
