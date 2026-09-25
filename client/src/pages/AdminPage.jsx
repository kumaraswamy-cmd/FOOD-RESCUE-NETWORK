import React, { useState, useEffect } from 'react';
import StatusBadge from '../components/StatusBadge';
import { i18nDict } from '../i18n';
import { apiFetch } from '../utils/api';
import IconBox from '../components/IconBox';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Building2, 
  AlertTriangle, 
  FileText, 
  History, 
  FileCheck, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  X, 
  Eye,
  CreditCard,
  Globe,
  Check,
  Ban,
  Clock,
  Utensils,
  KeyRound,
  Camera
} from 'lucide-react';

export default function AdminPage({ lang }) {
  const t = i18nDict[lang] || i18nDict.en;

  const [authenticated, setAuthenticated] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [pendingNgos, setPendingNgos] = useState([]);
  const [verifiedNgos, setVerifiedNgos] = useState([]);
  const [allNgos, setAllNgos] = useState([]);
  const [logs, setLogs] = useState([]);
  const [flaggedDonations, setFlaggedDonations] = useState([]);
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({ totalDonations: 0, deliveredDonations: 0, totalMealsSaved: 0, kgRescued: 0, activeNgos: 0, activeVolunteers: 0, successRate: 0 });

  const [activeTab, setActiveTab] = useState('ngos');
  const [selectedCertificateDoc, setSelectedCertificateDoc] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === 'frn@123') {
      setAuthenticated(true);
      localStorage.setItem('frn_admin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Invalid Admin Password. Access Denied.');
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    localStorage.removeItem('frn_admin_auth');
    setPasswordInput('');
  };

  const fetchData = async () => {
    if (!authenticated) return;
    try {
      const ngoData = await apiFetch('/api/admin/pending-ngos');
      if (ngoData) {
        if (ngoData.pending) setPendingNgos(ngoData.pending);
        if (ngoData.verified) setVerifiedNgos(ngoData.verified);
        if (ngoData.allNgos || ngoData.ngos) setAllNgos(ngoData.allNgos || ngoData.ngos);
        if (ngoData.logs) setLogs(ngoData.logs);
      }

      const flaggedData = await apiFetch('/api/admin/flagged-donations');
      if (flaggedData && (flaggedData.flagged || flaggedData.donations)) setFlaggedDonations(flaggedData.flagged || flaggedData.donations);

      const donData = await apiFetch('/api/admin/all-donations');
      if (donData && donData.donations) setDonations(donData.donations);

      const statData = await apiFetch('/api/admin/stats');
      if (statData && statData.stats) setStats(statData.stats);
    } catch(e) {}
  };

  useEffect(() => {
    if (authenticated) {
      fetchData();
      const interval = setInterval(fetchData, 3000);
      return () => clearInterval(interval);
    }
  }, [authenticated]);

  const handleVerifyNgo = async (ngoId, action) => {
    try {
      // Instant UI update
      setPendingNgos(prev => prev.filter(n => n.id !== ngoId && n.darpan_id !== ngoId));

      const data = await apiFetch('/api/admin/verify-ngo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ngo_id: ngoId, action, notes: reviewNotes, admin_password: 'frn@123' })
      });

      if (data && data.success) {
        alert(data.message || `NGO application ${action}d successfully!`);
        setReviewNotes('');
        fetchData();
      } else {
        alert(data ? data.error : 'Failed to update NGO verification status.');
      }
    } catch(e) {
      alert('Error updating NGO verification.');
    }
  };

  const handleReviewFlaggedDonation = async (donationId, action) => {
    try {
      // Instant UI update
      setFlaggedDonations(prev => prev.filter(d => d.id !== donationId));

      const data = await apiFetch('/api/admin/review-flagged-donation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donation_id: donationId, action, admin_password: 'frn@123' })
      });

      if (data && data.success) {
        alert(data.message || `Flagged donation ${action}d successfully!`);
        fetchData();
      }
    } catch(e) {
      alert('Error reviewing flagged donation.');
    }
  };

  const handleDeleteDonation = async (donationId) => {
    if (!window.confirm(`Are you sure you want to permanently delete donation post ${donationId}?`)) return;
    try {
      setDonations(prev => prev.filter(d => d.id !== donationId));
      setFlaggedDonations(prev => prev.filter(d => d.id !== donationId));

      const data = await apiFetch('/api/admin/delete-donation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donation_id: donationId, admin_password: 'frn@123' })
      });

      if (data && data.success) {
        alert(data.message || `Donation ${donationId} deleted successfully!`);
        fetchData();
      }
    } catch(e) {
      alert('Error deleting donation post.');
    }
  };

  const handleDeleteNgo = async (ngoId) => {
    if (!window.confirm(`Are you sure you want to remove NGO ${ngoId}?`)) return;
    try {
      setAllNgos(prev => prev.filter(n => n.id !== ngoId && n.darpan_id !== ngoId));
      setPendingNgos(prev => prev.filter(n => n.id !== ngoId && n.darpan_id !== ngoId));

      const data = await apiFetch('/api/admin/delete-ngo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ngo_id: ngoId, admin_password: 'frn@123' })
      });

      if (data && data.success) {
        alert(data.message || `NGO ${ngoId} removed successfully!`);
        fetchData();
      }
    } catch(e) {
      alert('Error removing NGO.');
    }
  };

  // ADMIN LOCK SCREEN IF UNAUTHENTICATED
  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-[#0D1E36] rounded-2xl shadow-xl border border-slate-200 dark:border-navy-700 text-center space-y-6 text-slate-900 dark:text-white">
        <IconBox icon={Lock} variant="emerald" size="xl" className="mx-auto" />
        <div>
          <h2 className="text-2xl font-black">Admin Governance Lock</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Restricted access portal for NGO verifications, food safety audits, & network compliance.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">
              Enter Admin Password:
            </label>
            <input 
              type="password" 
              value={passwordInput} 
              onChange={(e) => setPasswordInput(e.target.value)} 
              placeholder="••••••••" 
              className="w-full p-3.5 border border-slate-200 dark:border-navy-700 bg-white dark:bg-[#0A1628] rounded-xl text-center text-lg font-mono font-bold text-slate-900 dark:text-white"
              required 
            />
          </div>

          {authError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-bold rounded-xl border border-red-200 dark:border-red-800">
              {authError}
            </div>
          )}

          <button 
            type="submit" 
            className="w-full py-3.5 bg-[#00A86B] hover:bg-[#00965E] text-white font-extrabold rounded-xl shadow-md transition-colors text-xs flex items-center justify-center gap-2"
          >
            <Unlock className="w-4 h-4" />
            <span>Unlock Admin Portal</span>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white rounded-2xl p-6 sm:p-8 shadow-md flex justify-between items-center flex-wrap gap-4 border border-navy-700">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{t.adminTitle}</h2>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl font-medium">{t.adminSub}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#00A86B]" />
            <span>Platform Governance Admin</span>
          </span>
          <button 
            onClick={handleLogout} 
            className="px-3.5 py-1.5 bg-red-600/80 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Portal</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0D1E36] p-5 rounded-2xl border border-slate-200/80 dark:border-navy-700/80 shadow-sm">
          <div className="text-3xl font-black text-[#00A86B] dark:text-emerald-400">{stats.totalMealsSaved}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">Total Meals Saved</div>
        </div>
        <div className="bg-white dark:bg-[#0D1E36] p-5 rounded-2xl border border-slate-200/80 dark:border-navy-700/80 shadow-sm">
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400">{stats.kgRescued} kg</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">Kg Surplus Rescued</div>
        </div>
        <div className="bg-white dark:bg-[#0D1E36] p-5 rounded-2xl border border-slate-200/80 dark:border-navy-700/80 shadow-sm">
          <div className="text-3xl font-black text-blue-600 dark:text-sky-400">{stats.activeNgos}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">Verified Active NGOs</div>
        </div>
        <div className="bg-white dark:bg-[#0D1E36] p-5 rounded-2xl border border-slate-200/80 dark:border-navy-700/80 shadow-sm">
          <div className="text-3xl font-black text-purple-600 dark:text-purple-400">{stats.successRate}%</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">Delivery Success Rate</div>
        </div>
      </div>

      {/* Admin Sub-Tabs */}
      <div className="flex border-b border-slate-200 dark:border-navy-700 space-x-4 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('ngos')} 
          className={`pb-3 text-sm font-black flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'ngos' ? 'border-[#00A86B] text-[#00A86B] dark:text-emerald-400' : 'border-transparent text-slate-500 dark:text-slate-400'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>NGO Verification Queue</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800 font-bold">
            {pendingNgos.length} Pending
          </span>
        </button>

        <button 
          onClick={() => setActiveTab('flagged')} 
          className={`pb-3 text-sm font-black flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'flagged' ? 'border-[#00A86B] text-[#00A86B] dark:text-emerald-400' : 'border-transparent text-slate-500 dark:text-slate-400'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>Food Safety Audit Queue</span>
          {flaggedDonations.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-800 animate-pulse font-bold">
              {flaggedDonations.length} Flagged
            </span>
          )}
        </button>

        <button 
          onClick={() => setActiveTab('all')} 
          className={`pb-3 text-sm font-black flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'all' ? 'border-[#00A86B] text-[#00A86B] dark:text-emerald-400' : 'border-transparent text-slate-500 dark:text-slate-400'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Master Surplus Food Registry ({donations.length})</span>
        </button>

        <button 
          onClick={() => setActiveTab('history')} 
          className={`pb-3 text-sm font-black flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'history' ? 'border-[#00A86B] text-[#00A86B] dark:text-emerald-400' : 'border-transparent text-slate-500 dark:text-slate-400'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Verification History ({logs.length})</span>
        </button>
      </div>

      {/* 1. NGO VERIFICATION QUEUE & MANAGEMENT */}
      {activeTab === 'ngos' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0D1E36] rounded-2xl p-6 border border-slate-200/80 dark:border-navy-700/80 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#00A86B]" />
              <span>Recipient / NGO Verification Queue ({pendingNgos.length} Pending Approval)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium">
              Only verified recipient organisations can participate in surplus food matching. Review Darpan ID, Legal Registration, PAN, FCRA status, & uploaded certificate.
            </p>

            {pendingNgos.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00A86B]" />
                <span>All registered recipient NGOs have been audited. No pending applications.</span>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingNgos.map((n) => (
                  <div key={n.id} className="p-5 rounded-2xl bg-amber-50/70 dark:bg-[#0A1628] border border-amber-200 dark:border-navy-700 shadow-sm space-y-4">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <h4 className="font-black text-base text-slate-900 dark:text-white">{n.name}</h4>
                        <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 flex flex-wrap gap-x-4 gap-y-1 font-semibold">
                          <span>Phone: <strong>{n.phone}</strong></span>
                          <span>Darpan ID: <strong className="font-mono text-[#00A86B] dark:text-emerald-400">{n.darpan_id || 'AP/2026/008891'}</strong></span>
                          <span>Legal Reg: <strong className="font-mono">{n.legal_reg_no || 'REG-AP-4012'}</strong></span>
                          <span>PAN: <strong className="font-mono">{n.pan_number || 'DDDDD4444D'}</strong></span>
                          <span>FCRA: <strong className="text-blue-600 dark:text-sky-400">{n.fcra_status || 'Compliant'}</strong></span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                          Service Radius: {n.service_radius_km} km &bull; Registered: {new Date(n.created_at).toLocaleString()}
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-amber-200 dark:bg-amber-950 text-amber-900 dark:text-amber-300 text-xs font-black flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pending Admin Audit</span>
                      </span>
                    </div>

                    <div className="p-3 bg-white dark:bg-[#0D1E36] rounded-xl border border-amber-200 dark:border-navy-700 flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-blue-600" />
                        <span>Submitted Registration Certificate & Document:</span>
                      </span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setSelectedCertificateDoc(n)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect Certificate Document</span>
                        </button>
                        {n.registration_doc_url && (
                          <a 
                            href={n.registration_doc_url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="px-3 py-1.5 bg-slate-200 dark:bg-navy-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg flex items-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Open PDF Link</span>
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <input 
                        type="text" 
                        placeholder="Optional audit note or verification reason..." 
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        className="flex-1 p-2.5 border border-slate-200 dark:border-navy-700 bg-white dark:bg-[#0D1E36] rounded-xl text-xs text-slate-900 dark:text-white font-semibold"
                      />
                      <button 
                        onClick={() => handleVerifyNgo(n.id, 'approve')} 
                        className="px-4 py-2.5 bg-[#00A86B] hover:bg-[#00965E] text-white text-xs font-black rounded-xl shadow flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve & Verify NGO</span>
                      </button>
                      <button 
                        onClick={() => handleVerifyNgo(n.id, 'reject')} 
                        className="px-3.5 py-2.5 bg-red-100 dark:bg-red-950/60 hover:bg-red-200 text-red-800 dark:text-red-300 text-xs font-bold rounded-xl flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Master NGO List */}
          <div className="bg-white dark:bg-[#0D1E36] rounded-2xl p-6 border border-slate-200/80 dark:border-navy-700/80 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>All Registered Recipient Organisations ({allNgos.length})</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200 dark:border-navy-700 text-slate-400 uppercase font-black">
                    <th className="p-3">NGO Name</th>
                    <th className="p-3">Darpan ID</th>
                    <th className="p-3">Legal Reg</th>
                    <th className="p-3">PAN</th>
                    <th className="p-3">FCRA</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-navy-700/80 font-semibold text-slate-700 dark:text-slate-200">
                  {allNgos.map((n) => (
                    <tr key={n.id} className="hover:bg-slate-50 dark:hover:bg-[#1C3B64]/50">
                      <td className="p-3 font-black text-slate-900 dark:text-white">{n.name}</td>
                      <td className="p-3 font-mono font-bold text-[#00A86B] dark:text-emerald-400">{n.darpan_id || 'AP/2024/001928'}</td>
                      <td className="p-3 font-mono">{n.legal_reg_no || 'REG-AP-1029'}</td>
                      <td className="p-3 font-mono">{n.pan_number || 'AAAAA1111A'}</td>
                      <td className="p-3 font-semibold">{n.fcra_status || 'Compliant'}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 w-fit ${
                          n.verified && n.status === 'verified' ? 'bg-[#E0F7ED] text-[#00875A]' :
                          n.status === 'suspended' ? 'bg-amber-100 text-amber-800' :
                          n.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {n.verified && n.status === 'verified' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verified</span>
                            </>
                          ) : n.status === 'suspended' ? (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Suspended</span>
                            </>
                          ) : n.status === 'rejected' ? (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Rejected</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5" />
                              <span>Pending</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="p-3 flex gap-1.5 flex-wrap">
                        {n.status !== 'verified' && (
                          <button onClick={() => handleVerifyNgo(n.id, 'approve')} className="px-2 py-1 bg-[#00A86B] hover:bg-[#00965E] text-white font-bold rounded text-xs shadow-sm flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Verify</span>
                          </button>
                        )}
                        {n.status === 'verified' && (
                          <button onClick={() => handleVerifyNgo(n.id, 'suspend')} className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded text-xs shadow-sm flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Suspend</span>
                          </button>
                        )}
                        {n.status !== 'rejected' && (
                          <button onClick={() => handleVerifyNgo(n.id, 'reject')} className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-xs shadow-sm flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            <span>Reject</span>
                          </button>
                        )}
                        <button onClick={() => handleDeleteNgo(n.id)} className="px-2 py-1 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded text-xs shadow-sm flex items-center gap-1">
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. FOOD SAFETY MANUAL REVIEW QUEUE */}
      {activeTab === 'flagged' && (
        <div className="bg-white dark:bg-[#0D1E36] rounded-2xl p-6 border border-slate-200/80 dark:border-navy-700/80 shadow-sm space-y-4">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>Food Safety & Exception Inspection Queue ({flaggedDonations.length} Flagged)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium">
            Automated food safety checks flag items with short freshness windows, massive bulk quantities, or high-risk perishables. Authorized Admin inspection is required before matching recipient NGOs.
          </p>

          {flaggedDonations.length === 0 ? (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00A86B]" />
              <span>No flagged food donations awaiting safety inspection.</span>
            </div>
          ) : (
            <div className="space-y-4">
              {flaggedDonations.map((fd) => (
                <div key={fd.id} className="p-5 rounded-2xl bg-red-50/60 dark:bg-[#0A1628] border border-red-200 dark:border-navy-700 shadow-sm space-y-3">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div className="flex items-start gap-3">
                      {fd.food_image_url ? (
                        <img src={fd.food_image_url} alt={fd.food_type} className="w-14 h-14 object-cover rounded-xl border border-red-200 shadow-sm" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950 text-red-700 flex items-center justify-center font-bold">
                          <Utensils className="w-6 h-6 text-red-600" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-black text-base text-slate-900 dark:text-white">{fd.food_type} ({fd.quantity} Servings)</h4>
                        <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
                          Donor: <strong>{fd.donor_name}</strong> ({fd.donor_phone}) &bull; Pickup: {fd.pickup_address}
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 font-black text-xs flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                      <span>Flagged for Manual Audit</span>
                    </span>
                  </div>

                  <div className="p-3 bg-red-100/50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-800 text-xs text-red-900 dark:text-red-300 font-bold">
                    Reason Flagged: {fd.flagged_reason || 'Freshness window under 30 minutes or bulk perishable item.'}
                  </div>

                  <div className="flex gap-3 pt-1 flex-wrap">
                    <button 
                      onClick={() => handleReviewFlaggedDonation(fd.id, 'approve')} 
                      className="px-4 py-2 bg-[#00A86B] hover:bg-[#00965E] text-white text-xs font-black rounded-xl shadow-sm flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Pass Food Safety Audit & Dispatch to NGOs</span>
                    </button>
                    <button 
                      onClick={() => handleReviewFlaggedDonation(fd.id, 'reject')} 
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl shadow-sm flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Post</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteDonation(fd.id)} 
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-sm flex items-center gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Post</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. MASTER SURPLUS FOOD REGISTRY */}
      {activeTab === 'all' && (
        <div className="bg-white dark:bg-[#0D1E36] rounded-2xl p-6 border border-slate-200/80 dark:border-navy-700/80 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Master Surplus Food Registry ({donations.length})</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 dark:border-navy-700 text-slate-400 uppercase font-black">
                  <th className="p-3">Photo</th>
                  <th className="p-3">ID</th>
                  <th className="p-3">Food Item</th>
                  <th className="p-3">Pickup OTP</th>
                  <th className="p-3">Servings</th>
                  <th className="p-3">Donor Venue</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Assigned NGO</th>
                  <th className="p-3">Delivery Proof</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-700/80 font-semibold text-slate-700 dark:text-slate-200">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-[#1C3B64]/50">
                    <td className="p-3">
                      {d.food_image_url ? (
                        <img src={d.food_image_url} alt={d.food_type} className="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-navy-700" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center font-bold">
                          <Utensils className="w-5 h-5 text-[#00A86B]" />
                        </div>
                      )}
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{d.id}</td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">{d.food_type}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 font-mono font-black text-xs">
                        <KeyRound className="w-3 h-3 text-amber-600" />
                        <span>{d.pickup_otp || '7429'}</span>
                      </span>
                    </td>
                    <td className="p-3 font-bold">{d.quantity}</td>
                    <td className="p-3">{d.donor_name}</td>
                    <td className="p-3">{d.pickup_address}</td>
                    <td className="p-3"><StatusBadge status={d.status} /></td>
                    <td className="p-3 font-bold text-[#00A86B] dark:text-emerald-400">{d.assigned_ngo_name || '—'}</td>
                    <td className="p-3 font-semibold">
                      {d.delivery_photo_url ? (
                        <a href={d.delivery_photo_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline">
                          <img src={d.delivery_photo_url} alt="Proof" className="w-8 h-8 rounded-lg object-cover border border-emerald-500 shadow-sm" />
                          <span className="text-[11px] font-bold">View Photo</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Pending Photo</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <button 
                        onClick={() => handleDeleteDonation(d.id)} 
                        className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1 mx-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. VERIFICATION HISTORY & AUDIT LOGS */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-[#0D1E36] rounded-2xl p-6 border border-slate-200/80 dark:border-navy-700/80 shadow-sm space-y-4">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            <span>Verification Audit Logs ({logs.length})</span>
          </h3>
          <div className="space-y-3">
            {logs.map((l) => (
              <div key={l.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0A1628] border border-slate-200 dark:border-navy-700 flex justify-between items-center text-xs">
                <div>
                  <span className="font-black text-slate-900 dark:text-white">{l.ngo_name}</span> &bull; 
                  <span className={`ml-2 font-mono uppercase font-bold ${
                    l.action === 'approved' ? 'text-[#00A86B] dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`}>{l.action}</span>
                  <div className="text-slate-500 dark:text-slate-400 mt-0.5">{l.notes}</div>
                </div>
                <div className="text-slate-400 font-mono text-[10px]">
                  {new Date(l.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NGO CERTIFICATE INSPECTION MODAL */}
      {selectedCertificateDoc && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0D1E36] rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-navy-700 pb-3">
              <h3 className="font-black text-lg flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#00A86B]" />
                <span>NGO Legal Registration Certificate Audit</span>
              </h3>
              <button onClick={() => setSelectedCertificateDoc(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-[#0A1628] border border-emerald-200 dark:border-navy-700 space-y-2 text-xs">
              <div className="font-black text-sm text-slate-900 dark:text-white">{selectedCertificateDoc.name}</div>
              <div>NGO Darpan ID: <strong className="font-mono text-[#00A86B] dark:text-emerald-400">{selectedCertificateDoc.darpan_id || 'AP/2026/008891'}</strong></div>
              <div>Legal Reg No: <strong className="font-mono">{selectedCertificateDoc.legal_reg_no || 'REG-AP-4012'}</strong></div>
              <div>PAN Number: <strong className="font-mono">{selectedCertificateDoc.pan_number || 'DDDDD4444D'}</strong></div>
              <div>FCRA Compliance: <strong>{selectedCertificateDoc.fcra_status || 'Compliant'}</strong></div>
            </div>

            <div className="p-6 border-2 border-dashed border-slate-300 dark:border-navy-700 rounded-xl text-center space-y-3">
              <FileText className="w-10 h-10 mx-auto text-[#00A86B]" />
              <div className="font-bold text-sm">Official Society Registration & Verification Document</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Government of Andhra Pradesh / NITI Aayog NGO Darpan Database Record</div>
              {selectedCertificateDoc.registration_doc_url && (
                <a 
                  href={selectedCertificateDoc.registration_doc_url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 shadow"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Full Official Document PDF</span>
                </a>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => {
                  handleVerifyNgo(selectedCertificateDoc.id, 'approve');
                  setSelectedCertificateDoc(null);
                }} 
                className="px-4 py-2 bg-[#00A86B] text-white font-black text-xs rounded-xl hover:bg-[#00965E] shadow flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Verify NGO License</span>
              </button>
              <button 
                onClick={() => setSelectedCertificateDoc(null)} 
                className="px-4 py-2 bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
