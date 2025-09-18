import React from 'react';
import { Link } from 'react-router-dom';

const AdminExitPage = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Layered Bluish Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-indigo-700 to-sky-600" />
      <div className="absolute -top-32 -left-32 w-[36rem] h-[36rem] rounded-full bg-blue-500 opacity-20 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-[36rem] h-[36rem] rounded-full bg-cyan-400 opacity-20 blur-3xl" />

      {/* Decorative waves */}
      <svg className="absolute inset-x-0 bottom-0 text-blue-500/20" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path fill="currentColor" d="M0,256L40,250.7C80,245,160,235,240,208C320,181,400,139,480,133.3C560,128,640,160,720,181.3C800,203,880,213,960,218.7C1040,224,1120,224,1200,224C1280,224,1360,224,1400,224L1440,224L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z"></path>
      </svg>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        {/* Top Row: Brand + Illustration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-10">
          {/* Brand */}
          <div className="text-white">
            <div className="flex items-center gap-4 mb-6">
              <img src="/IMAGES/LOGO.png" alt="Kingdom Equippers Logo" className="h-60 w-auto object-contain drop-shadow-xl" />
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Kingdom Equippers</h1>
                <p className="text-blue-100 leading-tight">Recognition of Prior Learning • Admin Portal</p>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">You are logged out</h2>
            <p className="mt-3 text-blue-100 text-lg max-w-xl">
              Thanks for keeping the platform running smoothly. Choose what you’d like to do next below.
            </p>
          </div>

          {/* Illustration */}
          <div className="hidden lg:block">
            <img
              src="https://res.cloudinary.com/dqvsjtkqw/image/upload/v1757230094/top-view-patients-standing-circle-holding-hands_xy4dcg.webp"
              alt="Admin Illustration"
              className="rounded-2xl shadow-2xl ring-1 ring-white/10"
            />
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Admin Login */}
          <div className="group relative bg-white/95 backdrop-blur rounded-2xl shadow-xl ring-1 ring-white/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/5 group-hover:to-blue-600/10 transition-colors pointer-events-none" />
            <div className="p-6">
              <div className="text-3xl mb-3">🔐</div>
              <h3 className="text-lg font-bold text-gray-900">Admin Login</h3>
              <p className="text-sm text-gray-600 mt-1 mb-4">Sign back into the admin dashboard</p>
              <Link
                to="/login"
                state={{ admin: true }}
                className="inline-flex items-center rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 shadow"
              >
                Go to Login
              </Link>
            </div>
          </div>

          {/* Create Admin Account */}
          <div className="group relative bg-white/95 backdrop-blur rounded-2xl shadow-xl ring-1 ring-white/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/0 to-purple-600/0 group-hover:from-purple-600/5 group-hover:to-purple-600/10 transition-colors pointer-events-none" />
            <div className="p-6">
              <div className="text-3xl mb-3">🛡️</div>
              <h3 className="text-lg font-bold text-gray-900">Create Admin Account</h3>
              <p className="text-sm text-gray-600 mt-1 mb-4">Register a new admin account</p>
              <Link
                to="/admin-signup"
                className="inline-flex items-center rounded-lg bg-purple-600 text-white px-4 py-2 text-sm font-semibold hover:bg-purple-700 shadow"
              >
                Create Account
              </Link>
            </div>
          </div>

          {/* Explore System */}
          <div className="group relative bg-white/95 backdrop-blur rounded-2xl shadow-xl ring-1 ring-white/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-green-600/0 to-green-600/0 group-hover:from-green-600/5 group-hover:to-green-600/10 transition-colors pointer-events-none" />
            <div className="p-6">
              <div className="text-3xl mb-3">🌍</div>
              <h3 className="text-lg font-bold text-gray-900">Explore System</h3>
              <p className="text-sm text-gray-600 mt-1 mb-4">Return to the public landing page</p>
              <Link
                to="/"
                className="inline-flex items-center rounded-lg bg-green-600 text-white px-4 py-2 text-sm font-semibold hover:bg-green-700 shadow"
              >
                Go to Landing
              </Link>
            </div>
          </div>

          {/* Create Super Admin */}
          <div className="group relative bg-white/95 backdrop-blur rounded-2xl shadow-xl ring-1 ring-white/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/5 group-hover:to-blue-600/10 transition-colors pointer-events-none" />
            <div className="p-6">
              <div className="text-3xl mb-3">👑</div>
              <h3 className="text-lg font-bold text-gray-900">Create Super Admin</h3>
              <p className="text-sm text-gray-600 mt-1 mb-4">Register a super admin account</p>
              <Link
                to="/super-admin-signup"
                className="inline-flex items-center rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 shadow"
              >
                Create Super Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminExitPage;
