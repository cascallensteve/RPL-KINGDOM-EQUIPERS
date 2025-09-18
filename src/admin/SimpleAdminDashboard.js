import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './SimpleAdminDashboard.css';

const SimpleAdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Navigation state
  const [activeSection, setActiveSection] = useState('dashboard');
  
  // Simple state
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  // Filters
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState(''); // '', 'admin', 'client', 'mentor'
  const [filterVerified, setFilterVerified] = useState(''); // '', 'verified', 'pending'
  const [filterCounty, setFilterCounty] = useState('');
  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Client details modal
  const [showClientModal, setShowClientModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  // Payments (super-admin only)
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);
  const [txError, setTxError] = useState('');
  const [showTxModal, setShowTxModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [txSearch, setTxSearch] = useState('');
  const [txStatus, setTxStatus] = useState(''); // '', success, failed, pending

  // Rewards (admin or super-admin)
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [rewardsLoading, setRewardsLoading] = useState(false);
  const [rewardsError, setRewardsError] = useState('');
  const [rewardsData, setRewardsData] = useState(null); // { total_rewards, details }
  const [selectedUserForRewards, setSelectedUserForRewards] = useState(null);

  // Helpers
  const resolveUserByPhone = (phone) => {
    if (!phone || !Array.isArray(users)) return null;
    const norm = (p) => String(p || '').replace(/\D/g, '');
    const p = norm(phone);
    const last9 = p.slice(-9);
    const variants = new Set([
      p,
      last9,
      p.startsWith('254') ? '0' + last9 : '',
      p.startsWith('0') ? '254' + p.slice(1) : '',
      p.startsWith('254') ? p : ('254' + last9),
    ].filter(Boolean));

    for (const userObj of users) {
      const up = norm(userObj?.phone_no);
      if (!up) continue;
      const ulast9 = up.slice(-9);
      const uvars = [up, ulast9, up.startsWith('254') ? '0' + ulast9 : '', up.startsWith('0') ? '254' + up.slice(1) : '', '254' + ulast9];
      if (uvars.some(v => variants.has(v))) {
        return userObj;
      }
    }
    return null;
  };

  const getTransactionUserEmail = (t) => {
    const owner = t?.owner;
    if (owner?.email) return owner.email;
    const u = resolveUserByPhone(t?.phone_number);
    return u?.email || '—';
  };

  const getFilteredTransactions = () => {
    let data = Array.isArray(transactions) ? [...transactions] : [];
    const term = (txSearch || '').trim().toLowerCase();
    if (term) {
      data = data.filter(t => {
        const name = getTransactionUserLabel(t).toLowerCase();
        const email = (getTransactionUserEmail(t) || '').toLowerCase();
        const phone = String(t.phone_number || '').toLowerCase();
        const receipt = String(t.mpesa_receipt_number || '').toLowerCase();
        return name.includes(term) || email.includes(term) || phone.includes(term) || receipt.includes(term);
      });
    }
    if (txStatus) {
      data = data.filter(t => (t.status || '').toLowerCase() === txStatus.toLowerCase());
    }
    return data;
  };

  const printTransactionReceipt = (tx) => {
    if (!tx) return;
    const name = getTransactionUserLabel(tx);
    const email = getTransactionUserEmail(tx);
    const phone = tx.phone_number || '—';
    const amount = (parseFloat(tx.amount || 0) || 0).toLocaleString();
    const status = tx.status || '—';
    const dateStr = tx.transaction_date ? new Date(tx.transaction_date).toLocaleString() : '—';
    const receipt = tx.mpesa_receipt_number || '—';
    const id = tx.id || '—';

    const win = window.open('', 'PRINT', 'height=700,width=600');
    const title = `Payment Receipt - #${id}`;
    win.document.write(`<html><head><title>${title}</title>`);
    win.document.write(`
      <style>
        body{font-family:Arial,Helvetica,sans-serif;background:#f8fafc;color:#111827;margin:0;padding:24px}
        .receipt{max-width:520px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.08);overflow:hidden}
        .header{display:flex;align-items:center;gap:12px;padding:16px 20px;border-bottom:1px solid #f3f4f6;background:#f9fafb}
        .logo{height:48px;width:auto;object-fit:contain}
        h1{font-size:18px;margin:0}
        .meta{padding:16px 20px}
        .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px dashed #f1f5f9}
        .row:last-child{border-bottom:none}
        .label{color:#6b7280}
        .value{font-weight:600}
        .status{display:inline-flex;align-items:center;gap:6px;padding:4px 8px;border-radius:9999px;font-size:12px}
        .status.success{background:#ecfdf5;color:#065f46}
        .status.failed{background:#fef2f2;color:#991b1b}
        .status.pending{background:#fff7ed;color:#9a3412}
        .footer{padding:14px 20px;border-top:1px solid #f3f4f6;color:#6b7280;font-size:12px;text-align:center}
      </style>
    `);
    win.document.write('</head><body>');
    win.document.write(`
      <div class="receipt">
        <div class="header">
          <img src="/IMAGES/LOGO.png" class="logo" alt="Logo"/>
          <div>
            <h1>Payment Receipt</h1>
            <div style="color:#6b7280;font-size:12px">Receipt #: ${receipt !== '—' ? receipt : id}</div>
          </div>
        </div>
        <div class="meta">
          <div class="row"><span class="label">Payer</span><span class="value">${name}</span></div>
          <div class="row"><span class="label">Email</span><span class="value">${email}</span></div>
          <div class="row"><span class="label">Phone</span><span class="value">${phone}</span></div>
          <div class="row"><span class="label">Amount</span><span class="value">KES ${amount}</span></div>
          <div class="row"><span class="label">Status</span><span class="value"><span class="status ${status}">${status}</span></span></div>
          <div class="row"><span class="label">Date</span><span class="value">${dateStr}</span></div>
          <div class="row"><span class="label">Transaction ID</span><span class="value">${id}</span></div>
        </div>
        <div class="footer">Powered by Kingdom Equippers • Thank you for your payment</div>
      </div>
    `);
    win.document.write('</body></html>');
    win.document.close();
    win.focus();
    win.print();
  };

  const formatTimeOnly = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return '—';
    }
  };

  const getDisplayName = (u) => {
    if (!u) return '—';
    const name = u.username || [u.first_name, u.last_name].filter(Boolean).join(' ').trim();
    return name || u.email || '—';
  };

  const getTransactionUserLabel = (t) => {
    // Prefer server-provided owner object if available
    const owner = t?.owner;
    if (owner && (owner.username || owner.first_name || owner.last_name || owner.email)) {
      return getDisplayName(owner);
    }
    // Fallback: resolve via phone number mapping to users list
    const u = resolveUserByPhone(t?.phone_number);
    if (u) return getDisplayName(u);
    // Final fallback: mask phone last digits in local 0XXXXXXXXX form
    const msisdn = formatMsisdnLocal(t?.phone_number);
    return msisdn ? `Unknown (${msisdn.slice(0,3)}****${msisdn.slice(-2)})` : 'Unknown';
  };

  const formatMsisdnLocal = (phone) => {
    if (!phone) return '';
    const digits = String(phone).replace(/\D/g, '');
    const last9 = digits.slice(-9);
    if (!last9) return '';
    // Return 0XXXXXXXXX format
    return '0' + last9;
  };
  
  // Referrals (admin or super-admin)
  const [referrals, setReferrals] = useState([]);
  const [referralsLoading, setReferralsLoading] = useState(false);
  const [referralsError, setReferralsError] = useState('');
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [referralSearch, setReferralSearch] = useState('');
  const [referralRewardFilter, setReferralRewardFilter] = useState(''); // '', earned, not_earned

  // Fetch users on component mount
  useEffect(() => {
    if (user && (user.userType === 'admin' || user.userType === 'super-admin')) {
      const timer = setTimeout(() => {
        fetchUsers();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Fetch all transactions when Payments section is opened by a super-admin
  useEffect(() => {
    if (user?.userType === 'super-admin' && activeSection === 'payments') {
      fetchTransactions();
    }
  }, [activeSection, user]);

  // Fetch all referrals when Referrals section is opened by admin or super-admin
  useEffect(() => {
    if ((user?.userType === 'admin' || user?.userType === 'super-admin') && activeSection === 'referrals') {
      fetchAllReferrals();
    }
  }, [activeSection, user]);

  // Demo realtime notifications (replace with websocket later)
  useEffect(() => {
    if (!(user?.userType === 'admin' || user?.userType === 'super-admin')) return;
    const id = setInterval(() => {
      setNotifications((prev) => {
        const ntf = {
          id: Date.now(),
          title: 'New Event',
          message: 'A user action occurred in the system.',
          time: new Date().toLocaleTimeString(),
          type: ['info','success','warning'][Math.floor(Math.random()*3)]
        };
        return [ntf, ...prev].slice(0, 20);
      });
    }, 15000);
    return () => clearInterval(id);
  }, [user]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminAPI.getAllUsers();
      const fetched = data.users || data || [];
      setUsers(fetched);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError((err && (err.message || err.detail)) || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    if (txLoading) return;
    setTxLoading(true);
    setTxError('');
    try {
      const data = await adminAPI.getAllTransactions();
      const list = data.transactions || [];
      setTransactions(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setTxError((err && (err.message || err.detail)) || 'Failed to fetch transactions');
      setTransactions([]);
    } finally {
      setTxLoading(false);
    }
  };

  const viewTransactionDetails = async (txId) => {
    if (!txId) return;
    setSelectedTx(null);
    setShowTxModal(true);
    try {
      const data = await adminAPI.getTransactionDetails(txId);
      setSelectedTx(data.transaction || null);
    } catch (err) {
      console.error('Error fetching transaction details:', err);
      setSelectedTx({ error: (err && (err.message || err.detail)) || 'Failed to fetch transaction details' });
    }
  };

  const openRewards = async (u) => {
    if (!u) return;
    setSelectedUserForRewards(u);
    setRewardsData(null);
    setRewardsError('');
    setShowRewardsModal(true);
    setRewardsLoading(true);
    try {
      const data = await adminAPI.getUserRewards(u.id);
      setRewardsData({
        total_rewards: data.total_rewards ?? 0,
        details: Array.isArray(data.details) ? data.details : []
      });
    } catch (err) {
      console.error('Error fetching rewards:', err);
      setRewardsError((err && (err.message || err.detail)) || 'Failed to fetch rewards');
    } finally {
      setRewardsLoading(false);
    }
  };

  const fetchAllReferrals = async () => {
    if (referralsLoading) return;
    setReferralsLoading(true);
    setReferralsError('');
    try {
      const data = await adminAPI.getAllReferrals();
      // API returns an array
      setReferrals(Array.isArray(data) ? data : (data.referrals || []));
    } catch (err) {
      console.error('Error fetching referrals:', err);
      setReferralsError((err && (err.message || err.detail)) || 'Failed to fetch referrals');
      setReferrals([]);
    } finally {
      setReferralsLoading(false);
    }
  };

  const viewReferralDetails = async (refId) => {
    if (!refId) return;
    setSelectedReferral(null);
    setShowReferralModal(true);
    try {
      const data = await adminAPI.getReferralDetails(refId);
      setSelectedReferral(data.referral || null);
    } catch (err) {
      console.error('Error fetching referral details:', err);
      setSelectedReferral({ error: (err && (err.message || err.detail)) || 'Failed to fetch referral details' });
    }
  };

  const getFilteredReferrals = () => {
    let data = Array.isArray(referrals) ? [...referrals] : [];
    const term = (referralSearch || '').trim().toLowerCase();
    if (term) {
      data = data.filter(r => {
        const refName = (r.referrer?.username || '').toLowerCase();
        const refEmail = (r.referrer?.email || '').toLowerCase();
        const recName = (r.referred?.username || '').toLowerCase();
        const recEmail = (r.referred?.email || '').toLowerCase();
        return refName.includes(term) || refEmail.includes(term) || recName.includes(term) || recEmail.includes(term);
      });
    }
    if (referralRewardFilter) {
      const want = referralRewardFilter === 'earned';
      data = data.filter(r => !!r.reward_earned === want);
    }
    return data;
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/admin-exit', { replace: true });
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const exportUsers = () => {
    const data = getFilteredUsers();
    if (data.length === 0) {
      setError('No users to export');
      return;
    }
    
    try {
      // Create printable HTML (User asked PDF; browsers support Save as PDF via print dialog)
      const win = window.open('', 'PRINT', 'height=700,width=900');
      const title = `Users Report - ${new Date().toLocaleString()}`;
      win.document.write(`<html><head><title>${title}</title>`);
      win.document.write('<style>body{font-family:Arial,sans-serif;padding:20px;} h1{margin-bottom:12px;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ddd;padding:8px;font-size:12px;} th{background:#f3f4f6;text-align:left;} .muted{color:#666;font-size:12px;margin:8px 0 16px}</style>');
      win.document.write('</head><body>');
      win.document.write(`<h1>${title}</h1><div class="muted">${title}</div>`);
      win.document.write('<table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Type</th><th>Status</th><th>County</th><th>Phone</th></tr></thead><tbody>');
      data.forEach(u => {
        win.document.write(`<tr><td>${u.id}</td><td>${u.username||''}</td><td>${u.email||''}</td><td>${u.userType||''}</td><td>${u.is_email_verified?'Verified':'Pending'}</td><td>${u.county||'N/A'}</td><td>${u.phone_no||'N/A'}</td></tr>`);
      });
      win.document.write('</tbody></table>');
      win.document.write('</body></html>');
      win.document.close();
      win.focus();
      win.print();
      setSuccess(`Prepared PDF export for ${data.length} users. Use the print dialog to save as PDF.`);
    } catch (error) {
      setError('Failed to prepare PDF export');
    }
  };

  // Filter users based on search and selected filters
  const getFilteredUsers = () => {
    let data = Array.isArray(users) ? [...users] : [];
    const term = (search || '').trim().toLowerCase();
    if (term) {
      data = data.filter(u =>
        (u?.username || '').toLowerCase().includes(term) ||
        (u?.email || '').toLowerCase().includes(term)
      );
    }
    if (filterType) {
      data = data.filter(u => (u?.userType || '').toLowerCase() === filterType.toLowerCase());
    }
    if (filterVerified) {
      data = data.filter(u => filterVerified === 'verified' ? !!u?.is_email_verified : !u?.is_email_verified);
    }
    const countyTerm = (filterCounty || '').trim().toLowerCase();
    if (countyTerm) {
      data = data.filter(u => (u?.county || '').toLowerCase().includes(countyTerm));
    }
    return data;
  };

  // Print a single user's details (browser print dialog allows saving as PDF)
  const printUser = (u) => {
    if (!u) return;
    const win = window.open('', 'PRINT', 'height=700,width=900');
    const title = `User Details - ${u.username || ''}`;
    win.document.write(`<html><head><title>${title}</title>`);
    win.document.write('<style>body{font-family:Arial,sans-serif;padding:20px;} h1{margin-bottom:12px;} .row{margin:6px 0;} .label{display:inline-block;min-width:140px;color:#374151;font-weight:600} .value{color:#111827} .muted{color:#6b7280;margin-bottom:12px}</style>');
    win.document.write('</head><body>');
    win.document.write(`<h1>${title}</h1><div class="muted">Printed: ${new Date().toLocaleString()}</div>`);
    const fields = [
      ['ID', u.id],
      ['Name', u.username || ''],
      ['Email', u.email || ''],
      ['Type', u.userType || ''],
      ['Status', u.is_email_verified ? 'Verified' : 'Pending'],
      ['County', u.county || 'N/A'],
      ['Phone', u.phone_no || 'N/A']
    ];
    fields.forEach(([label, value]) => {
      win.document.write(`<div class="row"><span class="label">${label}:</span> <span class="value">${value}</span></div>`);
    });
    win.document.write('</body></html>');
    win.document.close();
    win.focus();
    win.print();
  };

  // Navigation items with Material Icons (payments visible only to super-admin)
  const navigationItems = (
    user?.userType === 'super-admin'
      ? [
          { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
          { id: 'users', label: 'Users', icon: 'people' },
          { id: 'certifications', label: 'Certifications', icon: 'workspace_premium' },
          { id: 'payments', label: 'Payments', icon: 'payment' },
          { id: 'referrals', label: 'Referrals', icon: 'share' }
        ]
      : [
          { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
          { id: 'users', label: 'Users', icon: 'people' },
          { id: 'certifications', label: 'Certifications', icon: 'workspace_premium' },
          { id: 'referrals', label: 'Referrals', icon: 'share' }
        ]
  );

  // Handle client details view
  const viewClientDetails = (client) => {
    setSelectedClient(client);
    setShowClientModal(true);
  };

  // Render different sections based on active selection
  const renderContent = () => {
    // Prevent non-super-admins from accessing payments section
    const section = (user?.userType === 'super-admin') ? activeSection : (activeSection === 'payments' ? 'dashboard' : activeSection);
    switch (section) {
      case 'dashboard':
        return renderDashboard();
      case 'users':
        return renderUsers();
      case 'certifications':
        return renderCertifications();
      case 'payments':
        return renderPayments();
      case 'referrals':
        return renderReferrals();
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <div className="content-section">
      <div className="section-header">
        <h2><span className="material-icons">dashboard</span> Dashboard Overview</h2>
        <p>Welcome to the RPL Admin Dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons">people</span>
          </div>
          <div className="stat-content">
            <h3>{users.length}</h3>
            <p>Total Users</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons">verified</span>
          </div>
          <div className="stat-content">
            <h3>{users.filter(u => u.is_email_verified).length}</h3>
            <p>Verified Users</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons">hourglass_empty</span>
          </div>
          <div className="stat-content">
            <h3>{users.filter(u => !u.is_email_verified).length}</h3>
            <p>Pending Verification</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons">school</span>
          </div>
          <div className="stat-content">
            <h3>{users.filter(u => u.userType === 'mentor').length}</h3>
            <p>Mentors</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons">share</span>
          </div>
          <div className="stat-content">
            <h3>{referrals.filter(r => r.status === 'Completed').length}</h3>
            <p>Successful Referrals</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-section">
        <h3><span className="material-icons">timeline</span> Recent Activity</h3>
        <div className="activity-list">
          <div className="activity-item">
            <span className="activity-icon">
              <span className="material-icons">person_add</span>
            </span>
            <div className="activity-content">
              <p>New user registered</p>
              <small>2 hours ago</small>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-icon">
              <span className="material-icons">mark_email_read</span>
            </span>
            <div className="activity-content">
              <p>Email verification completed</p>
              <small>4 hours ago</small>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-icon">
              <span className="material-icons">payment</span>
            </span>
            <div className="activity-content">
              <p>Payment processed</p>
              <small>6 hours ago</small>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-icon">
              <span className="material-icons">person_add_alt</span>
            </span>
            <div className="activity-content">
              <p>New referral completed</p>
              <small>8 hours ago</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="content-section">
      <div className="section-header">
        <h2><span className="material-icons">people</span> User Management</h2>
        <div className="header-actions">
          <div className="filters" style={{display:'flex',gap:'8px',flexWrap:'wrap',alignItems:'center'}}>
            <input
              type="text"
              placeholder="Search name or email"
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
              className="filter-input"
              style={{padding:'6px 8px',border:'1px solid #ddd',borderRadius:'6px'}}
            />
            <select value={filterType} onChange={(e)=>setFilterType(e.target.value)} className="filter-select" style={{padding:'6px 8px',border:'1px solid #ddd',borderRadius:'6px'}}>
              <option value="">All Types</option>
              <option value="client">Client</option>
              <option value="mentor">Mentor</option>
              <option value="admin">Admin</option>
            </select>
            <select value={filterVerified} onChange={(e)=>setFilterVerified(e.target.value)} className="filter-select" style={{padding:'6px 8px',border:'1px solid #ddd',borderRadius:'6px'}}>
              <option value="">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
            </select>
            <input
              type="text"
              placeholder="County"
              value={filterCounty}
              onChange={(e)=>setFilterCounty(e.target.value)}
              className="filter-input"
              style={{padding:'6px 8px',border:'1px solid #ddd',borderRadius:'6px'}}
            />
          </div>
          <div style={{display:'flex',gap:'8px'}}>
            <button className="btn-refresh" onClick={fetchUsers} disabled={loading}>
              <span className="material-icons">{loading ? 'hourglass_empty' : 'refresh'}</span>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            <button className="btn-export" onClick={exportUsers} disabled={getFilteredUsers().length === 0}>
              <span className="material-icons">picture_as_pdf</span>
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-section">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading users...</p>
          </div>
        ) : getFilteredUsers().length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">
              <span className="material-icons">people_outline</span>
            </span>
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
                {getFilteredUsers().map(user => (
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
                        <span className="material-icons">{user.is_email_verified ? 'verified' : 'pending'}</span>
                        {user.is_email_verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td>{user.county || 'N/A'}</td>
                    <td>{user.phone_no || 'N/A'}</td>
                    <td>
                      <button 
                        className="btn-view-client"
                        onClick={() => viewClientDetails(user)}
                        title="View client details"
                      >
                        <span className="material-icons">visibility</span>
                        View
                      </button>
                      { (user?.userType === 'admin' || user?.userType === 'super-admin') && (
                        <button
                          className="btn-export"
                          onClick={() => openRewards(user)}
                          title="View rewards"
                          style={{marginLeft:'6px'}}
                        >
                          <span className="material-icons">card_giftcard</span>
                          Rewards
                        </button>
                      ) }
                      <button
                        className="btn-export"
                        onClick={() => printUser(user)}
                        title="Print user"
                        style={{marginLeft:'6px'}}
                      >
                        <span className="material-icons">print</span>
                        Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderCertifications = () => (
    <div className="content-section">
      <div className="section-header">
        <h2><span className="material-icons">workspace_premium</span> Certifications</h2>
        <p>Manage RPL certifications and awards</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons">workspace_premium</span>
          </div>
          <div className="stat-content">
            <h3>45</h3>
            <p>Total Certificates</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons">hourglass_empty</span>
          </div>
          <div className="stat-content">
            <h3>12</h3>
            <p>Pending Reviews</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons">verified</span>
          </div>
          <div className="stat-content">
            <h3>33</h3>
            <p>Approved</p>
          </div>
        </div>
      </div>

      <div className="certification-list">
        <h3><span className="material-icons">timeline</span> Recent Certifications</h3>
        <div className="certification-item">
          <span className="cert-icon">
            <span className="material-icons">workspace_premium</span>
          </span>
          <div className="cert-content">
            <h4>Biblical Studies Certificate</h4>
            <p>Awarded to John Doe - ID: 12345</p>
            <small>Issued: 2 days ago</small>
          </div>
          <span className="cert-status approved">
            <span className="material-icons">verified</span>
            Approved
          </span>
        </div>
        <div className="certification-item">
          <span className="cert-icon">
            <span className="material-icons">hourglass_empty</span>
          </span>
          <div className="cert-content">
            <h4>Pastoral Care Certificate</h4>
            <p>Application by Mary Smith - ID: 12346</p>
            <small>Applied: 1 week ago</small>
          </div>
          <span className="cert-status pending">
            <span className="material-icons">pending</span>
            Pending
          </span>
        </div>
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className="content-section" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div className="section-header">
        <h2><span className="material-icons">payment</span> Payments</h2>
        <p>Track and manage payment transactions</p>
      </div>

      {/* Stats based on fetched transactions */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons">account_balance_wallet</span>
          </div>
          <div className="stat-content">
            <h3>
              KES {transactions
                .filter(t => (t.status === 'success' || t.status === 'completed'))
                .reduce((sum, t) => sum + (parseFloat(t.amount || 0) || 0), 0)
                .toLocaleString()}
            </h3>
            <p>Total Revenue</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons">payment</span>
          </div>
          <div className="stat-content">
            <h3>{transactions.length}</h3>
            <p>Total Payments</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons">hourglass_empty</span>
          </div>
          <div className="stat-content">
            <h3>{transactions.filter(t => t.status === 'pending').length}</h3>
            <p>Pending</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="section-header" style={{marginTop:'8px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'8px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap'}}>
          <h3 style={{marginRight:'12px'}}><span className="material-icons">table_chart</span> All Transactions</h3>
          <input
            type="text"
            placeholder="Search by name, email, phone or receipt"
            value={txSearch}
            onChange={(e)=>setTxSearch(e.target.value)}
            style={{padding:'6px 8px',border:'1px solid #ddd',borderRadius:'6px',minWidth:'260px'}}
          />
          <select value={txStatus} onChange={(e)=>setTxStatus(e.target.value)} style={{padding:'6px 8px',border:'1px solid #ddd',borderRadius:'6px'}}>
            <option value="">All Status</option>
            <option value="success">Success</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div style={{display:'flex',gap:'8px'}}>
          <button className="btn-refresh" onClick={fetchTransactions} disabled={txLoading}>
            <span className="material-icons">{txLoading ? 'hourglass_empty' : 'refresh'}</span>
            {txLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {txError && (
        <div className="notification error" style={{marginBottom:'12px'}}>
          <span>{txError}</span>
          <button onClick={() => setTxError('')}>×</button>
        </div>
      )}

      {/* Transaction Details Modal (Super Admin) */}
      {showTxModal && (
        <div className="modal-overlay" onClick={() => setShowTxModal(false)}>
          <div className="client-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><span className="material-icons">receipt_long</span> Transaction Details</h3>
              <button onClick={() => setShowTxModal(false)} className="modal-close">×</button>
            </div>
            <div className="modal-content">
              {!selectedTx ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading transaction...</p>
                </div>
              ) : selectedTx.error ? (
                <div className="notification error">
                  <span>{selectedTx.error}</span>
                </div>
              ) : (
                <div className="client-details-grid">
                  <div className="detail-section">
                    <h4><span className="material-icons">info</span> Basic</h4>
                    <div className="detail-row"><label>ID:</label><span>{selectedTx.id}</span></div>
                    <div className="detail-row"><label>Status:</label><span className={`status ${selectedTx.status}`}><span className="material-icons">{selectedTx.status === 'success' || selectedTx.status === 'completed' ? 'verified' : (selectedTx.status === 'failed' ? 'error' : 'pending')}</span>{selectedTx.status}</span></div>
                    <div className="detail-row"><label>Amount:</label><span>KES {(parseFloat(selectedTx.amount || 0) || 0).toLocaleString()}</span></div>
                    <div className="detail-row"><label>Date:</label><span>{selectedTx.transaction_date ? new Date(selectedTx.transaction_date).toLocaleString() : '—'}</span></div>
                  </div>
                  <div className="detail-section">
                    <h4><span className="material-icons">receipt_long</span> Receipt</h4>
                    <div className="detail-row"><label>Receipt No.:</label><span>{selectedTx.mpesa_receipt_number || '—'}</span></div>
                  </div>
                  <div className="detail-section">
                    <h4><span className="material-icons">contact_phone</span> Contact</h4>
                    <div className="detail-row"><label>Phone:</label><span>{selectedTx.phone_number || '—'}</span></div>
                    <div className="detail-row"><label>User:</label><span>{getTransactionUserLabel(selectedTx)}</span></div>
                    <div className="detail-row"><label>Email:</label><span>{getTransactionUserEmail(selectedTx)}</span></div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn-action" onClick={() => printTransactionReceipt(selectedTx)}>
                <span className="material-icons">print</span>
                Print Receipt
              </button>
              <button className="btn-cancel" onClick={() => setShowTxModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Rewards Modal (Super Admin and owner/admin by endpoint policy; UI exposed here to super-admin) */}
      {showRewardsModal && (
        <div className="modal-overlay" onClick={() => setShowRewardsModal(false)}>
          <div className="client-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><span className="material-icons">card_giftcard</span> Rewards for {selectedUserForRewards?.username || ''}</h3>
              <button onClick={() => setShowRewardsModal(false)} className="modal-close">×</button>
            </div>
            <div className="modal-content">
              {rewardsLoading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading rewards...</p>
                </div>
              ) : rewardsError ? (
                <div className="notification error">
                  <span>{rewardsError}</span>
                  <button onClick={() => setRewardsError('')}>×</button>
                </div>
              ) : !rewardsData ? (
                <div className="empty-state">
                  <h4>No data</h4>
                </div>
              ) : (
                <>
                  <div className="stats-grid" style={{marginBottom:'12px'}}>
                    <div className="stat-card">
                      <div className="stat-icon">
                        <span className="material-icons">savings</span>
                      </div>
                      <div className="stat-content">
                        <h3>KES {(parseFloat(rewardsData.total_rewards || 0) || 0).toLocaleString()}</h3>
                        <p>Total Rewards</p>
                      </div>
                    </div>
                  </div>
                  <div className="users-table">
                    <table>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Description</th>
                          <th>Amount (KES)</th>
                          <th>Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rewardsData.details.length === 0 ? (
                          <tr>
                            <td colSpan="5" style={{ textAlign:'center', color:'#6b7280' }}>No rewards found</td>
                          </tr>
                        ) : rewardsData.details.map((r, idx) => (
                          <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td>{r.description || '—'}</td>
                            <td>{(parseFloat(r.amount || 0) || 0).toLocaleString()}</td>
                            <td>{r.date ? new Date(r.date).toLocaleDateString() : '—'}</td>
                            <td>{r.status || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowRewardsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <div className="users-section" style={{ overflowX: 'auto' }}>
        {txLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">
              <span className="material-icons">payment</span>
            </span>
            <h4>No transactions found</h4>
            <p>Click refresh to load transactions or check your connection.</p>
          </div>
        ) : (
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Phone</th>
                  <th>Amount (KES)</th>
                  <th>Status</th>
                  <th>Receipt</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredTransactions().map(t => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{getTransactionUserLabel(t)}</td>
                    <td>{t.phone_number || '—'}</td>
                    <td>{(parseFloat(t.amount || 0) || 0).toLocaleString()}</td>
                    <td>
                      <span className={`status ${t.status || 'pending'}`}>
                        <span className="material-icons">{t.status === 'success' || t.status === 'completed' ? 'verified' : (t.status === 'failed' ? 'error' : 'pending')}</span>
                        {t.status || 'pending'}
                      </span>
                    </td>
                    <td>{t.mpesa_receipt_number || '—'}</td>
                    <td>{t.transaction_date ? new Date(t.transaction_date).toLocaleDateString() : '—'}</td>
                    <td>{t.transaction_date ? formatTimeOnly(t.transaction_date) : '—'}</td>
                    <td>
                      <button className="btn-view-client" title="View details" onClick={() => viewTransactionDetails(t.id)}>
                        <span className="material-icons">visibility</span>
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderReferrals = () => (
    <div className="content-section" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div className="section-header">
        <h2><span className="material-icons">share</span> Referral Management</h2>
        <p>Track and manage user referrals and rewards</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons">share</span>
          </div>
          <div className="stat-content">
            <h3>{referrals.length}</h3>
            <p>Total Referrals</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons">savings</span>
          </div>
          <div className="stat-content">
            <h3>{referrals.filter(r => !!r.reward_earned).length}</h3>
            <p>Rewards Earned</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="section-header" style={{marginTop:'8px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'8px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap'}}>
          <h3 style={{marginRight:'12px'}}><span className="material-icons">table_chart</span> All Referrals</h3>
          <input
            type="text"
            placeholder="Search referrer/referred name or email"
            value={referralSearch}
            onChange={(e)=>setReferralSearch(e.target.value)}
            style={{padding:'6px 8px',border:'1px solid #ddd',borderRadius:'6px',minWidth:'280px'}}
          />
          <select value={referralRewardFilter} onChange={(e)=>setReferralRewardFilter(e.target.value)} style={{padding:'6px 8px',border:'1px solid #ddd',borderRadius:'6px'}}>
            <option value="">All</option>
            <option value="earned">Reward Earned</option>
            <option value="not_earned">No Reward</option>
          </select>
        </div>
        <div style={{display:'flex',gap:'8px'}}>
          <button className="btn-refresh" onClick={fetchAllReferrals} disabled={referralsLoading}>
            <span className="material-icons">{referralsLoading ? 'hourglass_empty' : 'refresh'}</span>
            {referralsLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {referralsError && (
        <div className="notification error" style={{marginBottom:'12px'}}>
          <span>{referralsError}</span>
          <button onClick={() => setReferralsError('')}>×</button>
        </div>
      )}

      {/* Referral Details Modal */}
      {showReferralModal && (
        <div className="modal-overlay" onClick={() => setShowReferralModal(false)}>
          <div className="client-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><span className="material-icons">visibility</span> Referral Details</h3>
              <button onClick={() => setShowReferralModal(false)} className="modal-close">×</button>
            </div>
            <div className="modal-content">
              {!selectedReferral ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading referral...</p>
                </div>
              ) : selectedReferral.error ? (
                <div className="notification error"><span>{selectedReferral.error}</span></div>
              ) : (
                <div className="client-details-grid">
                  <div className="detail-section">
                    <h4><span className="material-icons">person</span> Referrer</h4>
                    <div className="detail-row"><label>Name:</label><span>{selectedReferral.referrer?.username || '—'}</span></div>
                    <div className="detail-row"><label>Email:</label><span>{selectedReferral.referrer?.email || '—'}</span></div>
                  </div>
                  <div className="detail-section">
                    <h4><span className="material-icons">person_add</span> Referred</h4>
                    <div className="detail-row"><label>Name:</label><span>{selectedReferral.referred?.username || '—'}</span></div>
                    <div className="detail-row"><label>Email:</label><span>{selectedReferral.referred?.email || '—'}</span></div>
                  </div>
                  <div className="detail-section">
                    <h4><span className="material-icons">info</span> Meta</h4>
                    <div className="detail-row"><label>ID:</label><span>{selectedReferral.id}</span></div>
                    <div className="detail-row"><label>Date:</label><span>{selectedReferral.created_at ? new Date(selectedReferral.created_at).toLocaleString() : '—'}</span></div>
                    <div className="detail-row"><label>Reward Earned:</label><span>{selectedReferral.reward_earned ? 'Yes' : 'No'}</span></div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowReferralModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <div className="referrals-table-section" style={{ overflowX:'auto' }}>
        <h3><span className="material-icons">table_chart</span> All Referrals</h3>
        {referralsLoading ? (
          <div className="loading-state"><div className="spinner"></div><p>Loading referrals...</p></div>
        ) : getFilteredReferrals().length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon"><span className="material-icons">people_outline</span></span>
            <h4>No referrals found</h4>
            <p>Click refresh to load referrals or adjust your filters.</p>
          </div>
        ) : (
          <div className="referrals-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Referrer</th>
                  <th>Referrer Email</th>
                  <th>Referred</th>
                  <th>Referred Email</th>
                  <th>Date</th>
                  <th>Reward Earned</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredReferrals().map(r => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.referrer?.username || '—'}</td>
                    <td className="email-text">{r.referrer?.email || '—'}</td>
                    <td>{r.referred?.username || '—'}</td>
                    <td className="email-text">{r.referred?.email || '—'}</td>
                    <td>{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</td>
                    <td>
                      <span className={`status ${r.reward_earned ? 'verified' : 'pending'}`}>
                        <span className="material-icons">{r.reward_earned ? 'verified' : 'pending'}</span>
                        {r.reward_earned ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn-view-referral"
                        onClick={() => viewReferralDetails(r.id)}
                        title="View referral details"
                      >
                        <span className="material-icons">visibility</span>
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

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

  if (!(user.userType === 'admin' || user.userType === 'super-admin')) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  return (
    <div className="admin-dashboard">
      {/* Left Sidebar */}
      <div className="admin-sidebar">
        {/* Admin Profile Section */}
        <div className="admin-profile">
          <div className="profile-avatar">
            <span className="material-icons avatar-icon">admin_panel_settings</span>
          </div>
          <div className="profile-info">
            <h3>{user?.username || 'Admin User'}</h3>
            <p>{user?.email || 'admin@rpl.com'}</p>
            <span className="profile-role">
              <span className="material-icons">verified_user</span>
              System Administrator
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="admin-nav">
          <ul>
            {navigationItems.map(item => (
              <li key={item.id} className={activeSection === item.id ? 'active' : ''}>
                <button onClick={() => setActiveSection(item.id)}>
                  <span className="material-icons nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="sidebar-footer">
          <button className="btn-logout-sidebar" onClick={handleLogout}>
            <span className="material-icons nav-icon">logout</span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Top Header */}
        <div className="admin-header">
          <div className="header-content">
            <div className="header-left" style={{ display: 'flex', alignItems: 'center' }}>
              <div className="logo-wrap" style={{ height: '144px', marginRight: '12px' }}>
                <img
                  src="/IMAGES/LOGO.png"
                  alt="Kingdom Equippers Logo"
                  style={{ height: '100%', width: 'auto', objectFit: 'contain' }}
                />
              </div>
              <div>
                <h1>
                  <span className="material-icons">school</span>
                  RPL Admin Portal
                </h1>
                <p>Kingdom Equippers • Recognition of Prior Learning System</p>
              </div>
            </div>
            <div className="header-right" style={{ display:'flex', alignItems:'center', gap:'12px' }}>
              <button
                className="notif-bell"
                title="Notifications"
                onClick={() => setShowNotifications(!showNotifications)}
                style={{ position:'relative', background:'transparent', border:'none', cursor:'pointer' }}
              >
                <span className="material-icons" style={{ fontSize:'28px' }}>notifications</span>
                {notifications.length > 0 && (
                  <span style={{ position:'absolute', top:'-4px', right:'-4px', background:'#ef4444', color:'#fff', borderRadius:'9999px', fontSize:'11px', padding:'2px 6px' }}>{notifications.length}</span>
                )}
              </button>
              <div className="admin-status">
                <span className="material-icons status-icon">circle</span>
                <span>Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="notification error">
            <span>{error}</span>
            <button onClick={() => setError('')}>×</button>
          </div>
        )}
        
        {success && (
          <div className="notification success">
            <span>{success}</span>
            <button onClick={() => setSuccess('')}>×</button>
          </div>
        )}

        {/* Dynamic Content */}
        <div className="content-wrapper">
          {renderContent()}
        </div>
        {/* Notifications Panel */}
        {showNotifications && (
          <div style={{ position:'fixed', top:'80px', right:'20px', width:'360px', maxHeight:'70vh', overflowY:'auto', background:'#fff', border:'1px solid #e5e7eb', borderRadius:'12px', boxShadow:'0 10px 25px rgba(0,0,0,0.1)', zIndex:1000 }}>
            <div style={{ padding:'12px 16px', borderBottom:'1px solid #e5e7eb', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <strong>Notifications</strong>
              <button onClick={()=>setNotifications([])} className="btn-clear" style={{ background:'transparent', border:'none', color:'#6b7280', cursor:'pointer' }}>Clear</button>
            </div>
            <div>
              {notifications.length === 0 ? (
                <div style={{ padding:'16px', color:'#6b7280' }}>No notifications</div>
              ) : notifications.map(n => (
                <div key={n.id} style={{ padding:'12px 16px', borderBottom:'1px solid #f3f4f6' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ fontWeight:600 }}>{n.title}</div>
                    <small style={{ color:'#6b7280' }}>{n.time}</small>
                  </div>
                  <div style={{ color:'#374151', fontSize:'14px', marginTop:'4px' }}>{n.message}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Client Details Modal */}
      {showClientModal && selectedClient && (
        <div className="modal-overlay" onClick={() => setShowClientModal(false)}>
          <div className="client-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><span className="material-icons">people</span> Client Details</h3>
              <button onClick={() => setShowClientModal(false)} className="modal-close">×</button>
            </div>
            <div className="modal-content">
              <div className="client-details-grid">
                <div className="detail-section">
                  <h4><span className="material-icons">person</span> Basic Information</h4>
                  <div className="detail-row">
                    <label>ID:</label>
                    <span>{selectedClient.id}</span>
                  </div>
                  <div className="detail-row">
                    <label>Name:</label>
                    <span>{selectedClient.username}</span>
                  </div>
                  <div className="detail-row">
                    <label>Email:</label>
                    <span>{selectedClient.email}</span>
                  </div>
                  <div className="detail-row">
                    <label>User Type:</label>
                    <span className={`user-type ${selectedClient.userType}`}>
                      {selectedClient.userType}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4><span className="material-icons">contact_phone</span> Contact Information</h4>
                  <div className="detail-row">
                    <label>Phone:</label>
                    <span>{selectedClient.phone_no || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <label>County:</label>
                    <span>{selectedClient.county || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <label>Age:</label>
                    <span>{selectedClient.age || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <label>Gender:</label>
                    <span>{selectedClient.gender || 'N/A'}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4><span className="material-icons">account_circle</span> Account Status</h4>
                  <div className="detail-row">
                    <label>Email Verified:</label>
                    <span className={`status ${selectedClient.is_email_verified ? 'verified' : 'pending'}`}>
                      <span className="material-icons">
                        {selectedClient.is_email_verified ? 'verified' : 'pending'}
                      </span>
                      {selectedClient.is_email_verified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <label>Registration Status:</label>
                    <span className={`status ${selectedClient.registered ? 'verified' : 'pending'}`}>
                      <span className="material-icons">
                        {selectedClient.registered ? 'verified' : 'pending'}
                      </span>
                      {selectedClient.registered ? 'Registered' : 'Not Registered'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowClientModal(false)}>
                Close
              </button>
              <button className="btn-action">
                <span className="material-icons">message</span>
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3><span className="material-icons">logout</span> Confirm Logout</h3>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to logout from the admin panel?</p>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={cancelLogout}>
                Cancel
              </button>
              <button className="btn-confirm" onClick={confirmLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleAdminDashboard;
