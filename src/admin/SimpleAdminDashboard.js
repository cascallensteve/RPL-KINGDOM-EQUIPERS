import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI, contactAPI, newsletterAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
// Tailwind-first styling (progressive migration from CSS classes)

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
  // Date/Time at header
  const [now, setNow] = useState(new Date());
  
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
  // Newsletters (admin/super-admin)
  const [newsletters, setNewsletters] = useState([]);
  const [nlLoading, setNlLoading] = useState(false);
  const [nlError, setNlError] = useState('');
  const [nlSubject, setNlSubject] = useState('');
  const [nlBody, setNlBody] = useState('');
  const [showNlModal, setShowNlModal] = useState(false);
  const [selectedNewsletter, setSelectedNewsletter] = useState(null);

  // Helper: add activity to notifications (memoized for dependency-safe callbacks)
  const addActivity = useCallback((title, message, type = 'info') => {
    const item = {
      id: Date.now() + Math.random(),
      title,
      message,
      type,
      time: new Date().toLocaleString(),
    };
    setNotifications(prev => [item, ...prev].slice(0, 50));
  }, []);

  // Newsletters logic
  const fetchAllNewsletters = useCallback(async () => {
    if (nlLoading) return;
    setNlLoading(true);
    setNlError('');
    try {
      const data = await newsletterAPI.getAllNewsletters();
      const list = Array.isArray(data?.Newsletters) ? data.Newsletters : (Array.isArray(data) ? data : []);
      setNewsletters(list);
      addActivity('Newsletters Loaded', `Fetched ${list.length} newsletters`, 'success');
    } catch (err) {
      setNlError(err?.message || err?.detail || 'Failed to fetch newsletters');
      setNewsletters([]);
    } finally {
      setNlLoading(false);
    }
  }, [nlLoading, addActivity]);

  const sendNewsletter = async (e) => {
    e.preventDefault();
    if (!nlSubject.trim() || !nlBody.trim()) return;
    try {
      const resp = await newsletterAPI.sendNewsletter({ subject: nlSubject.trim(), body: nlBody.trim() });
      addActivity('Newsletter Sent', resp?.message || 'Newsletter sent', 'success');
      setNlSubject('');
      setNlBody('');
      fetchAllNewsletters();
    } catch (err) {
      setNlError(err?.message || err?.detail || 'Failed to send newsletter');
    }
  };

  const viewNewsletter = async (id) => {
    setSelectedNewsletter(null);
    setShowNlModal(true);
    try {
      const data = await newsletterAPI.getNewsletterDetail(id);
      setSelectedNewsletter(data?.Newsletter || null);
    } catch (err) {
      setSelectedNewsletter({ error: err?.message || err?.detail || 'Failed to load newsletter' });
    }
  };

  const renderNewsletters = () => (
    <div className="content-section bg-white rounded-2xl shadow border border-gray-100 p-5">
      <div className="section-header flex items-center justify-between border-b pb-3 mb-4">
        <h2><span className="material-icons">campaign</span> Newsletters</h2>
        <div className="header-actions" style={{display:'flex',gap:'8px',flexWrap:'wrap',alignItems:'center'}}>
          <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 text-sm bg-white hover:bg-gray-50 disabled:opacity-60" onClick={fetchAllNewsletters} disabled={nlLoading}>
            <span className="material-icons">{nlLoading ? 'hourglass_empty' : 'refresh'}</span>
            {nlLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Send Newsletter Form */}
      <div className="mb-4">
        <div className="bg-white rounded-xl border p-4">
          {nlError && <div className="mb-3 rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">{nlError}</div>}
          <form onSubmit={sendNewsletter} className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                value={nlSubject}
                onChange={(e)=>setNlSubject(e.target.value)}
                placeholder="Subject"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
              <textarea
                value={nlBody}
                onChange={(e)=>setNlBody(e.target.value)}
                rows={4}
                placeholder="Body"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <button type="submit" className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60" disabled={nlLoading || !nlSubject.trim() || !nlBody.trim()}>
                <span className="material-icons">send</span>
                Send Newsletter
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* List Newsletters */}
      <div className="bg-white rounded-2xl shadow border border-gray-100">
        {nlLoading ? (
          <div className="p-8 text-center text-gray-600">Loading newsletters...</div>
        ) : newsletters.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-3">📧</div>
            <h4 className="text-lg font-semibold text-gray-800">No newsletters found</h4>
            <p className="text-gray-500">Sent newsletters will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Author</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Timestamp</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {newsletters.map(n => (
                  <tr key={n.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">{n.id}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{n.subject}</td>
                    <td className="px-4 py-3 text-sm text-emerald-700 font-mono">{n.author}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{n.timestamp ? new Date(n.timestamp).toLocaleString() : '—'}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700" onClick={()=>viewNewsletter(n.id)}>
                        <span className="material-icons text-sm">visibility</span>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Newsletter Detail Modal */}
      {showNlModal && (
        <div className="modal-overlay fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4" onClick={()=>setShowNlModal(false)}>
          <div className="client-modal bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden" onClick={(e)=>e.stopPropagation()}>
            <div className="section-header" style={{padding:'1rem 1.5rem', marginBottom:0}}>
              <h2 style={{margin:0}}><span className="material-icons">mail</span> Newsletter Details</h2>
              <button className="modal-close text-gray-500 hover:text-gray-700" onClick={()=>setShowNlModal(false)}>&times;</button>
            </div>
            <div className="client-details-grid">
              {!selectedNewsletter ? (
                <div className="loading-state"><div className="spinner"></div><p>Loading...</p></div>
              ) : selectedNewsletter?.error ? (
                <div className="detail-section full-width"><h4>Error</h4><div className="detail-row"><label>Message</label><span>{selectedNewsletter.error}</span></div></div>
              ) : (
                <>
                  <div className="detail-section full-width">
                    <h4><span className="material-icons">topic</span> Subject</h4>
                    <div className="detail-row"><label>Subject</label><span>{selectedNewsletter.subject}</span></div>
                    <div className="detail-row"><label>Author</label><span>{selectedNewsletter.author}</span></div>
                    <div className="detail-row"><label>Timestamp</label><span>{selectedNewsletter.timestamp ? new Date(selectedNewsletter.timestamp).toLocaleString() : '—'}</span></div>
                  </div>
                  <div className="detail-section full-width">
                    <h4><span className="material-icons">notes</span> Body</h4>
                    <div className="detail-row" style={{alignItems:'flex-start'}}><label>Content</label><span style={{whiteSpace:'pre-wrap'}}>{selectedNewsletter.body}</span></div>
                  </div>
                </>
              )}
            </div>
            <div className="modal-actions px-6 pb-6 pt-2 flex justify-end gap-2">
              <button className="px-3 py-2 rounded-md border border-gray-300 bg-gray-100 hover:bg-gray-200 text-sm" onClick={()=>setShowNlModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  /* eslint-enable no-unused-vars */

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

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

  // Inquiries (admin or super-admin)
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsError, setContactsError] = useState('');
  const [contactsSearch, setContactsSearch] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactsSortKey, setContactsSortKey] = useState('id');
  const [contactsSortDir, setContactsSortDir] = useState('desc'); // 'asc' | 'desc'

  // Fetch users on component mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (user && (user.userType === 'admin' || user.userType === 'super-admin')) {
      const timer = setTimeout(() => {
        fetchUsers();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [user, fetchUsers]);

  // Fetch all transactions when Payments section is opened by a super-admin
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (user?.userType === 'super-admin' && activeSection === 'payments') {
      fetchTransactions();
    }
  }, [activeSection, user, fetchTransactions]);

  // Fetch all referrals when Referrals section is opened by admin or super-admin
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if ((user?.userType === 'admin' || user?.userType === 'super-admin') && activeSection === 'referrals') {
      fetchAllReferrals();
    }
  }, [activeSection, user, fetchAllReferrals]);

  // Fetch all inquiries when Inquiries section is opened by admin or super-admin
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if ((user?.userType === 'admin' || user?.userType === 'super-admin') && activeSection === 'inquiries') {
      fetchAllContacts();
    }
  }, [activeSection, user, fetchAllContacts]);

  // Fetch newsletters when Newsletters section is opened
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if ((user?.userType === 'admin' || user?.userType === 'super-admin') && activeSection === 'newsletters') {
      fetchAllNewsletters();
    }
  }, [activeSection, user, fetchAllNewsletters]);

  // Ensure users are available when opening Rewards section
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if ((user?.userType === 'admin' || user?.userType === 'super-admin') && activeSection === 'rewards') {
      if (!Array.isArray(users) || users.length === 0) {
        fetchUsers();
      }
    }
  }, [activeSection, user, users, fetchUsers]);

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

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminAPI.getAllUsers();
      const fetched = data.users || data || [];
      setUsers(fetched);
      addActivity('Users Loaded', `Fetched ${fetched.length} users`, 'success');
    } catch (err) {
      console.error('Error fetching users:', err);
      setError((err && (err.message || err.detail)) || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [addActivity]);

  const fetchTransactions = useCallback(async () => {
    if (txLoading) return;
    setTxLoading(true);
    setTxError('');
    try {
      const data = await adminAPI.getAllTransactions();
      const list = data.transactions || [];
      setTransactions(Array.isArray(list) ? list : []);
      addActivity('Payments Loaded', `Fetched ${Array.isArray(list) ? list.length : 0} transactions`, 'success');
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setTxError((err && (err.message || err.detail)) || 'Failed to fetch transactions');
      setTransactions([]);
    } finally {
      setTxLoading(false);
    }
  }, [txLoading, addActivity]);

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

  const fetchAllReferrals = useCallback(async () => {
    if (referralsLoading) return;
    setReferralsLoading(true);
    setReferralsError('');
    try {
      const data = await adminAPI.getAllReferrals();
      // API returns an array
      setReferrals(Array.isArray(data) ? data : (data.referrals || []));
      const count = Array.isArray(data) ? data.length : (data?.referrals?.length || 0);
      addActivity('Referrals Loaded', `Fetched ${count} referrals`, 'success');
    } catch (err) {
      console.error('Error fetching referrals:', err);
      setReferralsError((err && (err.message || err.detail)) || 'Failed to fetch referrals');
      setReferrals([]);
    } finally {
      setReferralsLoading(false);
    }
  }, [referralsLoading, addActivity]);

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
        { id: 'newsletters', label: 'Newsletters', icon: 'campaign' },
        { id: 'inquiries', label: 'Inquiries', icon: 'mark_email_unread' },
        { id: 'payments', label: 'Payments', icon: 'payment' },
        { id: 'referrals', label: 'Referrals', icon: 'share' },
        { id: 'rewards', label: 'Rewards', icon: 'card_giftcard' }
      ]
      : [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
        { id: 'users', label: 'Users', icon: 'people' },
        { id: 'newsletters', label: 'Newsletters', icon: 'campaign' },
        { id: 'inquiries', label: 'Inquiries', icon: 'mark_email_unread' },
        { id: 'referrals', label: 'Referrals', icon: 'share' },
        { id: 'rewards', label: 'Rewards', icon: 'card_giftcard' }
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
      case 'newsletters':
        return renderNewsletters();
      case 'inquiries':
        return renderInquiries();
      case 'payments':
        return renderPayments();
      case 'referrals':
        return renderReferrals();
      case 'rewards':
        return renderRewards();
      default:
        return renderDashboard();
    }
  };

  const fetchAllContacts = useCallback(async () => {
    if (contactsLoading) return;
    setContactsLoading(true);
    setContactsError('');
    try {
      const data = await contactAPI.getAllContacts();
      const list = Array.isArray(data?.contacts) ? data.contacts : (Array.isArray(data) ? data : []);
      setContacts(list);
      addActivity('Inquiries Loaded', `Fetched ${list.length} inquiries`, 'success');
    } catch (err) {
      setContactsError(err?.message || err?.detail || 'Failed to fetch inquiries');
      setContacts([]);
    } finally {
      setContactsLoading(false);
    }
  }, [contactsLoading, addActivity]);

  const viewContact = async (contactId) => {
    if (!contactId) return;
    setSelectedContact(null);
    setShowContactModal(true);
    try {
      const data = await contactAPI.getContactDetails(contactId);
      setSelectedContact(data?.contact || null);
      if (data?.contact) addActivity('Viewed Inquiry', `#${contactId} - ${data.contact.full_name}`, 'info');
    } catch (err) {
      setSelectedContact({ error: err?.message || err?.detail || 'Failed to load contact' });
    }
  };

  const getFilteredContacts = () => {
    const term = (contactsSearch || '').trim().toLowerCase();
    if (!term) return contacts;
    return contacts.filter(c =>
      (c.full_name || '').toLowerCase().includes(term) ||
      (c.email || '').toLowerCase().includes(term) ||
      (c.phone_number || '').toLowerCase().includes(term) ||
      (c.subject || '').toLowerCase().includes(term) ||
      (c.message || '').toLowerCase().includes(term)
    );
  };

  const getSortedContacts = () => {
    const data = [...getFilteredContacts()];
    const key = contactsSortKey;
    const dir = contactsSortDir === 'asc' ? 1 : -1;
    data.sort((a, b) => {
      const va = (a?.[key] ?? '').toString().toLowerCase();
      const vb = (b?.[key] ?? '').toString().toLowerCase();
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return data;
  };

  const toggleSort = (key) => {
    if (contactsSortKey === key) {
      setContactsSortDir(contactsSortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setContactsSortKey(key);
      setContactsSortDir('asc');
    }
  };

  const downloadContactsCSV = () => {
    const rows = getSortedContacts();
    if (!rows.length) return;
    const headers = ['id','full_name','email','phone_number','subject','message'];
    const csv = [headers.join(',')].concat(
      rows.map(c => headers.map(h => `"${String(c?.[h] ?? '').replace(/"/g,'""')}"`).join(','))
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inquiries_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderInquiries = () => (
    <div className="content-section bg-white rounded-2xl shadow border border-gray-100 p-5">
      <div className="section-header flex items-center justify-between border-b pb-3 mb-4">
        <h2><span className="material-icons">mark_email_unread</span> Inquiries</h2>
        <div className="header-actions" style={{display:'flex',gap:'8px',flexWrap:'wrap',alignItems:'center'}}>
          <input
            type="text"
            placeholder="Search name, email, subject"
            value={contactsSearch}
            onChange={(e)=>setContactsSearch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 text-sm bg-white hover:bg-gray-50 disabled:opacity-60" onClick={fetchAllContacts} disabled={contactsLoading}>
            <span className="material-icons">{contactsLoading ? 'hourglass_empty' : 'refresh'}</span>
            {contactsLoading ? 'Loading...' : 'Refresh'}
          </button>
          <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 text-sm bg-white hover:bg-gray-50 disabled:opacity-60" onClick={downloadContactsCSV} disabled={getFilteredContacts().length===0}>
            <span className="material-icons">download</span>
            Download CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow border border-gray-100">
        {contactsLoading ? (
          <div className="p-8 text-center text-gray-600">Loading inquiries...</div>
        ) : contactsError ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h4 className="text-lg font-semibold text-gray-800">{contactsError}</h4>
            <p className="text-gray-500">Try refreshing to load inquiries.</p>
          </div>
        ) : getFilteredContacts().length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-3">✉️</div>
            <h4 className="text-lg font-semibold text-gray-800">No inquiries found</h4>
            <p className="text-gray-500">New messages will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={()=>toggleSort('id')}>ID {contactsSortKey==='id' ? (contactsSortDir==='asc'?'▲':'▼') : ''}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={()=>toggleSort('full_name')}>Name {contactsSortKey==='full_name' ? (contactsSortDir==='asc'?'▲':'▼') : ''}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={()=>toggleSort('email')}>Email {contactsSortKey==='email' ? (contactsSortDir==='asc'?'▲':'▼') : ''}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={()=>toggleSort('phone_number')}>Phone {contactsSortKey==='phone_number' ? (contactsSortDir==='asc'?'▲':'▼') : ''}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={()=>toggleSort('subject')}>Subject {contactsSortKey==='subject' ? (contactsSortDir==='asc'?'▲':'▼') : ''}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={()=>toggleSort('message')}>Message {contactsSortKey==='message' ? (contactsSortDir==='asc'?'▲':'▼') : ''}</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {getSortedContacts().map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">{c.id}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.full_name}</td>
                    <td className="px-4 py-3 text-sm text-emerald-700 font-mono">{c.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{c.phone_number || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{c.subject}</td>
                    <td className="px-4 py-3 text-sm text-gray-700" title={c.message}>{String(c.message || '').length > 40 ? `${String(c.message).slice(0,40)}…` : c.message}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
                        onClick={() => viewContact(c.id)}
                        title="View details"
                      >
                        <span className="material-icons text-sm">visibility</span>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Contact Details Modal */}
      {showContactModal && (
        <div className="modal-overlay fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4" onClick={()=>setShowContactModal(false)}>
          <div className="client-modal bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden" onClick={(e)=>e.stopPropagation()}>
            <div className="section-header" style={{padding:'1rem 1.5rem', marginBottom:0}}>
              <h2 style={{margin:0}}><span className="material-icons">mail</span> Inquiry Details</h2>
              <button className="modal-close text-gray-500 hover:text-gray-700" onClick={()=>setShowContactModal(false)}>&times;</button>
            </div>
            <div className="client-details-grid">
              {selectedContact?.error ? (
                <div className="detail-section full-width">
                  <h4><span className="material-icons">error_outline</span> Error</h4>
                  <div className="detail-row"><label>Message</label><span>{selectedContact.error}</span></div>
                </div>
              ) : !selectedContact ? (
                <div className="loading-state"><div className="spinner"></div><p>Loading...</p></div>
              ) : (
                <>
                  <div className="detail-section">
                    <h4><span className="material-icons">person</span> Contact</h4>
                    <div className="detail-row"><label>Name</label><span>{selectedContact.full_name}</span></div>
                    <div className="detail-row"><label>Email</label><span>{selectedContact.email}</span></div>
                    <div className="detail-row"><label>Phone</label><span>{selectedContact.phone_number || '—'}</span></div>
                  </div>
                  <div className="detail-section">
                    <h4><span className="material-icons">topic</span> Subject</h4>
                    <div className="detail-row"><label>Subject</label><span>{selectedContact.subject}</span></div>
                  </div>
                  <div className="detail-section full-width">
                    <h4><span className="material-icons">notes</span> Message</h4>
                    <div className="detail-row" style={{alignItems:'flex-start'}}>
                      <label>Content</label>
                      <span style={{whiteSpace:'pre-wrap'}}>{selectedContact.message}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="modal-actions px-6 pb-6 pt-2 flex justify-end gap-2">
              <button className="btn-cancel" onClick={()=>setShowContactModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderDashboard = () => (
    <div className="content-section bg-white rounded-2xl shadow border border-gray-100 p-5">
      <div className="section-header border-b pb-3 mb-4">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
          <span className="material-icons text-emerald-600">dashboard</span>
          Dashboard Overview
        </h2>
        <p className="text-gray-500">Welcome to the RPL Admin Dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div className="stat-card bg-white rounded-2xl shadow border border-gray-100 p-4 flex items-center gap-4">
          <div className="stat-icon w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <span className="material-icons">people</span>
          </div>
          <div className="stat-content">
            <h3 className="text-2xl font-bold text-gray-900">{users.length}</h3>
            <p className="text-sm text-gray-500">Total Users</p>
          </div>
        </div>
        
        <div className="stat-card bg-white rounded-2xl shadow border border-gray-100 p-4 flex items-center gap-4">
          <div className="stat-icon w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <span className="material-icons">verified</span>
          </div>
          <div className="stat-content">
            <h3 className="text-2xl font-bold text-gray-900">{users.filter(u => u.is_email_verified).length}</h3>
            <p className="text-sm text-gray-500">Verified Users</p>
          </div>
        </div>
        
        <div className="stat-card bg-white rounded-2xl shadow border border-gray-100 p-4 flex items-center gap-4">
          <div className="stat-icon w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <span className="material-icons">hourglass_empty</span>
          </div>
          <div className="stat-content">
            <h3 className="text-2xl font-bold text-gray-900">{users.filter(u => !u.is_email_verified).length}</h3>
            <p className="text-sm text-gray-500">Pending Verification</p>
          </div>
        </div>
        
        <div className="stat-card bg-white rounded-2xl shadow border border-gray-100 p-4 flex items-center gap-4">
          <div className="stat-icon w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <span className="material-icons">school</span>
          </div>
          <div className="stat-content">
            <h3 className="text-2xl font-bold text-gray-900">{users.filter(u => u.userType === 'mentor').length}</h3>
            <p className="text-sm text-gray-500">Mentors</p>
          </div>
        </div>

        <div className="stat-card bg-white rounded-2xl shadow border border-gray-100 p-4 flex items-center gap-4">
          <div className="stat-icon w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <span className="material-icons">share</span>
          </div>
          <div className="stat-content">
            <h3 className="text-2xl font-bold text-gray-900">{referrals.filter(r => r.status === 'Completed').length}</h3>
            <p className="text-sm text-gray-500">Successful Referrals</p>
          </div>
        </div>
      </div>

      {/* Recent Activity (from notifications) */}
      <div className="activity-section mt-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
          <span className="material-icons text-emerald-600">timeline</span>
          Recent Activity
        </h3>
        <div className="activity-list flex flex-col gap-3">
          {notifications.length === 0 ? (
            <div className="empty-state p-4 bg-white rounded-xl border text-center">
              <span className="empty-icon block text-3xl mb-1"><span className="material-icons text-gray-400">notifications_none</span></span>
              <h4 className="text-gray-800 font-medium">No recent activity</h4>
              <p className="text-gray-500 text-sm">System events will appear here.</p>
            </div>
          ) : (
            notifications.slice(0, 6).map(n => (
              <div key={n.id} className="activity-item bg-white rounded-xl border p-3 flex items-start gap-3">
                <span className={`activity-icon w-9 h-9 rounded-lg flex items-center justify-center ${n.type === 'success' ? 'bg-emerald-50 text-emerald-600' : (n.type === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600')}`}>
                  <span className="material-icons">{n.type === 'success' ? 'check_circle' : (n.type === 'warning' ? 'warning' : 'info')}</span>
                </span>
                <div className="activity-content">
                  <p className="text-sm text-gray-800"><span className="font-semibold">{n.title}</span> — {n.message}</p>
                  <small className="text-gray-500">{n.time}</small>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="content-section bg-white rounded-2xl shadow border border-gray-100 p-5">
      <div className="section-header flex items-center justify-between border-b pb-3 mb-4">
        <h2><span className="material-icons">people</span> User Management</h2>
        <div className="header-actions">
          <div className="filters flex gap-2 flex-wrap items-center">
            <input
              type="text"
              placeholder="Search name or email"
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <select value={filterType} onChange={(e)=>setFilterType(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">All Types</option>
              <option value="client">Client</option>
              <option value="mentor">Mentor</option>
              <option value="admin">Admin</option>
            </select>
            <select value={filterVerified} onChange={(e)=>setFilterVerified(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
            </select>
            <input
              type="text"
              placeholder="County"
              value={filterCounty}
              onChange={(e)=>setFilterCounty(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 text-sm bg-white hover:bg-gray-50 disabled:opacity-60" onClick={fetchUsers} disabled={loading}>
              <span className="material-icons">{loading ? 'hourglass_empty' : 'refresh'}</span>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 text-sm bg-white hover:bg-gray-50 disabled:opacity-60" onClick={exportUsers} disabled={getFilteredUsers().length === 0}>
              <span className="material-icons">picture_as_pdf</span>
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow border border-gray-100">
        {loading ? (
          <div className="p-8 text-center text-gray-600">Loading users...</div>
        ) : getFilteredUsers().length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-3">👥</div>
            <h4 className="text-lg font-semibold text-gray-800">No users found</h4>
            <p className="text-gray-500">Click refresh to load users or check your connection.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">County</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {getFilteredUsers().map(row => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">{row.id}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.username}</td>
                    <td className="px-4 py-3 text-sm text-emerald-700 font-mono">{row.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${row.userType==='admin' ? 'bg-red-100 text-red-700' : row.userType==='mentor' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{row.userType}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${row.is_email_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        <span className="material-icons text-sm">{row.is_email_verified ? 'verified' : 'pending'}</span>
                        {row.is_email_verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.county || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.phone_no || 'N/A'}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button 
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
                        onClick={() => viewClientDetails(row)}
                        title="View client details"
                      >
                        <span className="material-icons text-sm">visibility</span>
                        View
                      </button>
                      { ((user?.userType === 'admin') || (user?.userType === 'super-admin')) && (
                        <button
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-700 ml-2"
                          onClick={() => openRewards(row)}
                          title="View rewards"
                        >
                          <span className="material-icons text-sm">card_giftcard</span>
                          Rewards
                        </button>
                      ) }
                      <button
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-gray-800 text-white text-sm hover:bg-gray-900 ml-2"
                        onClick={() => printUser(row)}
                        title="Print user"
                      >
                        <span className="material-icons text-sm">print</span>
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

  /* eslint-disable no-unused-vars */
  const renderCertifications = () => (
    <div className="content-section bg-white rounded-2xl shadow border border-gray-100 p-5">
      <div className="section-header border-b pb-3 mb-4">
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
    <div className="content-section bg-white rounded-2xl shadow border border-gray-100 p-5 max-w-[1100px] mx-auto">
      <div className="border-b pb-3 mb-4">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
          <span className="material-icons text-emerald-600">payment</span>
          Payments
        </h2>
        <p className="text-gray-500">Track and manage payment transactions</p>
      </div>

      {/* Stats based on fetched transactions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl border border-emerald-100 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <span className="material-icons">account_balance_wallet</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              KES {transactions
                .filter(t => (t.status === 'success' || t.status === 'completed'))
                .reduce((sum, t) => sum + (parseFloat(t.amount || 0) || 0), 0)
                .toLocaleString()}
            </h3>
            <p className="text-sm text-gray-500">Total Revenue</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <span className="material-icons">payment</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{transactions.length}</h3>
            <p className="text-sm text-gray-500">Total Payments</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl border border-amber-100 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <span className="material-icons">hourglass_empty</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{transactions.filter(t => t.status === 'pending').length}</h3>
            <p className="text-sm text-gray-500">Pending</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="flex items-center gap-2 text-gray-900 font-semibold mr-2">
            <span className="material-icons">table_chart</span>
            All Transactions
          </h3>
          <input
            type="text"
            placeholder="Search by name, email, phone or receipt"
            value={txSearch}
            onChange={(e)=>setTxSearch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[260px]"
          />
          <select
            value={txStatus}
            onChange={(e)=>setTxStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="success">Success</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 text-sm bg-white hover:bg-gray-50 disabled:opacity-60"
            onClick={fetchTransactions}
            disabled={txLoading}
          >
            <span className="material-icons">{txLoading ? 'hourglass_empty' : 'refresh'}</span>
            {txLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {txError && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 text-red-800 px-4 py-3 flex items-center justify-between">
          <span>{txError}</span>
          <button onClick={() => setTxError('')} className="text-red-600">×</button>
        </div>
      )}

      {/* Transaction Details Modal (Super Admin) */}
      {showTxModal && (
        <div className="modal-overlay fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4" onClick={() => setShowTxModal(false)}>
          <div className="client-modal bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><span className="material-icons">receipt_long</span> Transaction Details</h3>
              <button onClick={() => setShowTxModal(false)} className="modal-close text-gray-500 hover:text-gray-700">×</button>
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
            <div className="modal-actions px-6 pb-6 pt-2 flex justify-end gap-2">
              <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60" onClick={() => printTransactionReceipt(selectedTx)}>
                <span className="material-icons">print</span>
                Print Receipt
              </button>
              <button className="px-3 py-2 rounded-md border border-gray-300 bg-gray-100 hover:bg-gray-200 text-sm" onClick={() => setShowTxModal(false)}>Close</button>
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
                    {/* Computed commission at 30% when amounts are provided */}
                    <div className="stat-card">
                      <div className="stat-icon">
                        <span className="material-icons">percent</span>
                      </div>
                      <div className="stat-content">
                        {(() => {
                          const commission = Array.isArray(rewardsData.details)
                            ? rewardsData.details.reduce((sum, r) => sum + ((parseFloat(r.amount || 0) || 0) * 0.3), 0)
                            : 0;
                          return (
                            <>
                              <h3>KES {commission.toLocaleString()}</h3>
                              <p>Commission (30%)</p>
                            </>
                          );
                        })()}
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
                          <th>Reward (30%)</th>
                          <th>Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rewardsData.details.length === 0 ? (
                          <tr>
                            <td colSpan="6" style={{ textAlign:'center', color:'#6b7280' }}>No rewards found</td>
                          </tr>
                        ) : rewardsData.details.map((r, idx) => (
                          <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td>{r.description || '—'}</td>
                            <td>{(parseFloat(r.amount || 0) || 0).toLocaleString()}</td>
                            <td>{(((parseFloat(r.amount || 0) || 0) * 0.3)).toLocaleString()}</td>
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

      <div className="mt-2">
        {txLoading ? (
          <div className="p-8 text-center text-gray-600">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-3">💳</div>
            <h4 className="text-lg font-semibold text-gray-800">No transactions found</h4>
            <p className="text-gray-500">Click refresh to load transactions or check your connection.</p>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="max-h-[60vh] overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount (KES)</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Receipt</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Time</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {getFilteredTransactions().map(t => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">{t.id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{getTransactionUserLabel(t)}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{t.phone_number || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{(parseFloat(t.amount || 0) || 0).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                          (t.status === 'success' || t.status === 'completed')
                            ? 'bg-green-100 text-green-700'
                            : (t.status === 'failed'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700')
                        }`}>
                          <span className="material-icons text-sm">{
                            (t.status === 'success' || t.status === 'completed') ? 'verified' : (t.status === 'failed' ? 'error' : 'pending')
                          }</span>
                          {t.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{t.mpesa_receipt_number || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{t.transaction_date ? new Date(t.transaction_date).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{t.transaction_date ? formatTimeOnly(t.transaction_date) : '—'}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700" title="View details" onClick={() => viewTransactionDetails(t.id)}>
                          <span className="material-icons text-sm">visibility</span>
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderRewards = () => (
    <div className="content-section bg-white rounded-2xl shadow border border-gray-100 p-5">
      <div className="section-header flex items-center justify-between border-b pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="material-icons text-emerald-600">card_giftcard</span>
          <h2 className="text-xl font-semibold text-gray-900">Rewards</h2>
          <span className="ml-2 inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
            <span className="material-icons text-sm">people</span>
            Users: {users.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <p className="hidden sm:block text-sm text-gray-500 mr-2">View referral rewards per user</p>
          <button
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 text-sm bg-white hover:bg-gray-50 disabled:opacity-60"
            onClick={fetchUsers}
            disabled={loading}
            title="Refresh users"
          >
            <span className="material-icons">{loading ? 'hourglass_empty' : 'refresh'}</span>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow border border-gray-100">
        {loading ? (
          <div className="p-8 text-center text-gray-600">Loading users...</div>
        ) : getFilteredUsers().length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-3">🎁</div>
            <h4 className="text-lg font-semibold text-gray-800">No users found</h4>
            <p className="text-gray-500">Click refresh to load users or check your connection.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {getFilteredUsers().map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">{u.id}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{u.username}</td>
                    <td className="px-4 py-3 text-sm text-emerald-700 font-mono">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${u.userType==='admin' ? 'bg-red-100 text-red-700' : u.userType==='mentor' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{u.userType}</span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-700"
                        onClick={() => openRewards(u)}
                        title="View rewards"
                      >
                        <span className="material-icons text-sm">card_giftcard</span>
                        View Rewards
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
    <div className="content-section bg-white rounded-2xl shadow border border-gray-100 p-5" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div className="section-header border-b pb-3 mb-4">
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
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 text-sm bg-white hover:bg-gray-50 disabled:opacity-60" onClick={fetchAllReferrals} disabled={referralsLoading}>
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
    <div className="admin-dashboard min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <div className="admin-sidebar fixed left-0 top-0 h-screen w-60 bg-gradient-to-br from-emerald-900 to-emerald-700 text-white shadow-xl z-50 flex flex-col">
        {/* Admin Profile Section */}
        <div className="admin-profile px-5 py-6 border-b border-white/10 text-center">
          <div className="profile-avatar w-16 h-16 rounded-full mx-auto mb-3 bg-emerald-500 flex items-center justify-center shadow-lg">
            <span className="material-icons avatar-icon">admin_panel_settings</span>
          </div>
          <div className="profile-info">
            <h3>{user?.username || 'Admin User'}</h3>
            <p>{user?.email || 'admin@rpl.com'}</p>
            <span className="profile-role inline-flex items-center gap-2 px-3 py-1 rounded-full text-emerald-300 bg-white/10 text-xs font-semibold">
              <span className="material-icons">verified_user</span>
              System Administrator
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="admin-nav flex-1 px-3 py-2 overflow-y-auto">
          <ul className="space-y-1">
            {navigationItems.map(item => (
              <li key={item.id} className={(activeSection === item.id ? 'bg-white/15 text-white shadow-sm translate-x-1 ' : 'text-emerald-50 hover:bg-white/10 ') + 'rounded-lg transition-all'}>
                <button onClick={() => setActiveSection(item.id)} className="w-full flex items-center gap-3 px-4 py-3">
                  <span className="material-icons nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="sidebar-footer px-3 py-3 border-t border-white/10">
          <button className="btn-logout-sidebar w-full inline-flex items-center gap-3 px-4 py-3 rounded-lg border border-red-300/40 text-red-200 bg-red-900/20 hover:bg-red-900/30 transition" onClick={handleLogout}>
            <span className="material-icons nav-icon">logout</span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="admin-main ml-60 flex-1 flex flex-col">
        {/* Top Header */}
        <div className="admin-header bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow sticky top-0 z-40">
          <div className="header-content max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="header-left flex items-center">
              <div className="logo-wrap h-20 mr-3">
                <img
                  src="/IMAGES/LOGO.png"
                  alt="Kingdom Equippers Logo"
                  className="h-full w-auto object-contain drop-shadow"
                />
              </div>
              <div className="leading-tight">
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <span className="material-icons">school</span>
                  RPL Admin Portal
                </h1>
                <p className="text-sm text-emerald-50/90">Kingdom Equippers • Recognition of Prior Learning System</p>
              </div>
            </div>
            <div className="header-right flex items-center gap-3">
              <div className="date-time-pill px-3 py-1 rounded-md border text-sm text-emerald-900 bg-white" title="Current date and time">
                <span className="font-semibold">{now.toLocaleDateString()}</span>
                <span className="mx-2 text-gray-400">•</span>
                <span>{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              </div>
              <button
                className="notif-bell hover:bg-white/10 rounded-md"
                title="Notifications"
                onClick={() => setShowNotifications(!showNotifications)}
                style={{ position:'relative' }}
              >
                <span className="material-icons text-white" style={{ fontSize:'28px' }}>notifications</span>
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs px-2 py-0.5">{notifications.length}</span>
                )}
              </button>
              <div className="admin-status inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 text-emerald-700 text-sm">
                <span className="material-icons status-icon">circle</span>
                <span className="font-medium">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="notification error fixed top-20 right-5 z-50 bg-red-600 text-white rounded-lg shadow px-4 py-3 flex items-center gap-3">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-white/80 hover:text-white">×</button>
          </div>
        )}
        
        {success && (
          <div className="notification success fixed top-20 right-5 z-50 bg-emerald-600 text-white rounded-lg shadow px-4 py-3 flex items-center gap-3">
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="text-white/80 hover:text-white">×</button>
          </div>
        )}

        {/* Dynamic Content */}
        <div className="content-wrapper max-w-7xl mx-auto px-4 py-6">
          {renderContent()}
        </div>
        {/* Notifications Panel */}
        {showNotifications && (
          <div className="fixed top-20 right-5 w-80 max-h-[70vh] overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-2xl z-50">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <strong>Notifications</strong>
              <button onClick={()=>setNotifications([])} className="text-gray-500 hover:text-gray-700">Clear</button>
            </div>
            <div>
              {notifications.length === 0 ? (
                <div className="p-4 text-gray-500">No notifications</div>
              ) : notifications.map(n => (
                <div key={n.id} className="px-4 py-3 border-b last:border-b-0">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{n.title}</div>
                    <small className="text-gray-500">{n.time}</small>
                  </div>
                  <div className="text-sm text-gray-700 mt-1">{n.message}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Client Details Modal */}
      {showClientModal && selectedClient && (
        <div className="modal-overlay fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4" onClick={() => setShowClientModal(false)}>
          <div className="client-modal bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="modal-header px-6 py-4 border-b flex items-center justify-between">
              <h3><span className="material-icons">people</span> Client Details</h3>
              <button onClick={() => setShowClientModal(false)} className="modal-close text-gray-500 hover:text-gray-700">×</button>
            </div>
            <div className="modal-content p-6">
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
            <div className="modal-actions px-6 py-4 border-t flex items-center justify-end gap-3">
              <button className="btn-cancel inline-flex items-center px-4 py-2 rounded-lg border bg-white text-gray-700 hover:bg-gray-50" onClick={() => setShowClientModal(false)}>
                Close
              </button>
              <button className="btn-action inline-flex items-center px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
                <span className="material-icons">message</span>
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal-overlay fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="modal bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="modal-header px-6 py-4 border-b">
              <h3><span className="material-icons">logout</span> Confirm Logout</h3>
            </div>
            <div className="modal-content p-6">
              <p>Are you sure you want to logout from the admin panel?</p>
            </div>
            <div className="modal-actions px-6 py-4 border-t flex items-center justify-end gap-3">
              <button className="btn-cancel inline-flex items-center px-4 py-2 rounded-lg border bg-white text-gray-700 hover:bg-gray-50" onClick={cancelLogout}>
                Cancel
              </button>
              <button className="btn-confirm inline-flex items-center px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700" onClick={confirmLogout}>
INUE            Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleAdminDashboard;
