import React, { useState, useEffect } from 'react';
import StatusBadge from '../components/StatusBadge';
import { i18nDict } from '../i18n';

export default function AdminPage({ lang }) {
  const t = i18nDict[lang] || i18nDict.en;

  const [authenticated, setAuthenticated] = useState(() => {
    return localStorage.getItem('frn_admin_auth') === 'true';
  });
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
      const ngoRes = await fetch('http://localhost:5001/api/admin/pending-ngos');
      const ngoData = await ngoRes.json();
      if (ngoData.pending) setPendingNgos(ngoData.pending);
      if (ngoData.verified) setVerifiedNgos(ngoData.verified);
      if (ngoData.allNgos) setAllNgos(ngoData.allNgos);
      if (ngoData.logs) setLogs(ngoData.logs);

      const flaggedRes = await fetch('http://localhost:5001/api/admin/flagged-donations');
      const flaggedData = await flaggedRes.json();
      if (flaggedData.flagged) setFlaggedDonations(flaggedData.flagged);

      const donRes = await fetch('http://localhost:5001/api/admin/all-donations');
      const donData = await donRes.json();
      if (donData.donations) setDonations(donData.donations);

      const statRes = await fetch('http://localhost:5001/api/admin/stats');
      const statData = await statRes.json();
      if (statData.stats) setStats(statData.stats);
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
      const res = await fetch('http://localhost:5001/api/admin/verify-ngo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ngo_id: ngoId, action, notes: reviewNotes, admin_password: 'frn@123' })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setReviewNotes('');
        fetchData();
      } else {
        alert(data.error || 'Failed to update NGO verification status.');
      }
    } catch(e) {
      alert('Error updating NGO verification.');
    }
  };

  const handleReviewFlaggedDonation = async (donationId, action) => {
    try {
      const res = await fetch('http://localhost:5001/api/admin/review-flagged-donation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donation_id: donationId, action, admin_password: 'frn@123' })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchData();
      }
    } catch(e) {
      alert('Error reviewing flagged donation.');
    }
  };

  // 🔐 ADMIN LOCK SCREEN IF UNAUTHENTICATED
  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-[#0D1E36] rounded-2xl shadow-xl border border-slate-200 dark:border-navy-700 text-center space-y-6 text-slate-900 dark:text-white">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 rounded-2xl flex items-center justify-center mx-auto text-3xl">
          🔐
        </div>
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
            className="w-full py-3.5 bg-[#00A86B] hover:bg-[#00965E] text-white font-extrabold rounded-xl shadow-md transition-colors text-xs"
          >
            🔓 Unlock Admin Portal
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
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
            🛡️ Platform Governance Admin
          </span>
          <button 
            onClick={handleLogout} 
            className="px-3.5 py-1.5 bg-red-600/80 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow"
          >
            🔒 Lock Portal
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
          🏛️ NGO Verification Queue 
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
          ⚠️ Food Safety Audit Queue 
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
          📑 Master Surplus Food Registry ({donations.length})
        </button>

        <button 
          onClick={() => setActiveTab('history')} 
          className={`pb-3 text-sm font-black flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'history' ? 'border-[#00A86B] text-[#00A86B] dark:text-emerald-400' : 'border-transparent text-slate-500 dark:text-slate-400'
          }`}
        >
          📜 Verification History ({logs.length})
        </button>
      </div>

      {/* 1. NGO VERIFICATION QUEUE & MANAGEMENT */}
      {activeTab === 'ngos' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0D1E36] rounded-2xl p-6 border border-slate-200/80 dark:border-navy-700/80 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
              🏛️ Recipient / NGO Verification Queue ({pendingNgos.length} Pending Approval)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium">
              Only verified recipient organisations can participate in surplus food matching. Review Darpan ID, Legal Registration, PAN, FCRA status, & uploaded certificate.
            </p>

            {pendingNgos.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                ✓ All registered recipient NGOs have been audited. No pending applications.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingNgos.map((n) => (
                  <div key={n.id} className="p-5 rounded-2xl bg-amber-50/70 dark:bg-[#0A1628] border border-amber-200 dark:border-navy-700 shadow-sm space-y-4">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <h4 className="font-black text-base text-slate-900 dark:text-white">{n.name}</h4>
                        <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 flex flex-wrap gap-x-4 gap-y-1 font-semibold">
                          <span>📱 Phone: <strong>{n.phone}</strong></span>
                          <span>🆔 Darpan ID: <strong className="font-mono text-[#00A86B] dark:text-emerald-400">{n.darpan_id || 'AP/2026/008891'}</strong></span>
                          <span>📋 Legal Reg: <strong className="font-mono">{n.legal_reg_no || 'REG-AP-4012'}</strong></span>
                          <span>💳 PAN: <strong className="font-mono">{n.pan_number || 'DDDDD4444D'}</strong></span>
                          <span>🌐 FCRA: <strong className="text-blue-600 dark:text-sky-400">{n.fcra_status || 'Compliant'}</strong></span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                          📍 Service Radius: {n.service_radius_km} km &bull; Registered: {new Date(n.created_at).toLocaleString()}
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-amber-200 dark:bg-amber-950 text-amber-900 dark:text-amber-300 text-xs font-black">
                        ⏳ Pending Admin Audit
                      </span>
                    </div>

                    <div className="p-3 bg-white dark:bg-[#0D1E36] rounded-xl border border-amber-200 dark:border-navy-700 flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">📄 Submitted Registration Certificate & Document:</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setSelectedCertificateDoc(n)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm"
                        >
                          🔍 Inspect Certificate Document
                        </button>
                        {n.registration_doc_url && (
                          <a 
                            href={n.registration_doc_url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="px-3 py-1.5 bg-slate-200 dark:bg-navy-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg"
                          >
                            🔗 Open PDF Link
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
                        className="px-4 py-2.5 bg-[#00A86B] hover:bg-[#00965E] text-white text-xs font-black rounded-xl shadow"
                      >
                        ✓ Approve & Verify NGO
                      </button>
                      <button 
                        onClick={() => handleVerifyNgo(n.id, 'reject')} 
                        className="px-3.5 py-2.5 bg-red-100 dark:bg-red-950/60 hover:bg-red-200 text-red-800 dark:text-red-300 text-xs font-bold rounded-xl"
                      >
                        ❌ Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Master NGO List */}
          <div className="bg-white dark:bg-[#0D1E36] rounded-2xl p-6 border border-slate-200/80 dark:border-navy-700/80 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">
              📋 All Registered Recipient Organisations ({allNgos.length})
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
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                          n.verified && n.status === 'verified' ? 'bg-[#E0F7ED] text-[#00875A]' :
                          n.status === 'suspended' ? 'bg-amber-100 text-amber-800' :
                          n.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {n.verified && n.status === 'verified' ? '✓ Verified' : n.status === 'suspended' ? '⚠️ Suspended' : n.status === 'rejected' ? '❌ Rejected' : '⏳ Pending'}
                        </span>
                      </td>
                      <td className="p-3 flex gap-2">
                        {n.status !== 'verified' && (
                          <button onClick={() => handleVerifyNgo(n.id, 'approve')} className="px-2.5 py-1 bg-[#00A86B] text-white font-bold rounded">
                            Verify
                          </button>
                        )}
                        {n.status === 'verified' && (
                          <button onClick={() => handleVerifyNgo(n.id, 'suspend')} className="px-2.5 py-1 bg-amber-600 text-white font-bold rounded">
                            Suspend
                          </button>
                        )}
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
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
            ⚠️ Food Safety & Exception Inspection Queue ({flaggedDonations.length} Flagged)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium">
            Automated food safety checks flag items with short freshness windows, massive bulk quantities, or high-risk perishables. Authorized Admin inspection is required before matching recipient NGOs.
          </p>

          {flaggedDonations.length === 0 ? (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              ✓ No flagged food donations awaiting safety inspection.
            </div>
          ) : (
            <div className="space-y-4">
              {flaggedDonations.map((fd) => (
                <div key={fd.id} className="p-5 rounded-2xl bg-red-50/60 dark:bg-[#0A1628] border border-red-200 dark:border-navy-700 shadow-sm space-y-3">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <h4 className="font-black text-base text-slate-900 dark:text-white">{fd.food_type} ({fd.quantity} Servings)</h4>
                      <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
                        🏬 Donor: <strong>{fd.donor_name}</strong> ({fd.donor_phone}) &bull; Pickup: {fd.pickup_address}
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 font-black text-xs">
                      ⚠️ Flagged for Manual Audit
                    </span>
                  </div>

                  <div className="p-3 bg-red-100/50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-800 text-xs text-red-900 dark:text-red-300 font-bold">
                    Reason Flagged: {fd.flagged_reason || 'Freshness window under 30 minutes or bulk perishable item.'}
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button 
                      onClick={() => handleReviewFlaggedDonation(fd.id, 'approve')} 
                      className="px-4 py-2 bg-[#00A86B] hover:bg-[#00965E] text-white text-xs font-black rounded-xl shadow-sm"
                    >
                      ✅ Pass Food Safety Audit & Dispatch to NGOs
                    </button>
                    <button 
                      onClick={() => handleReviewFlaggedDonation(fd.id, 'reject')} 
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-sm"
                    >
                      ❌ Reject Food Donation Post
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
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">
            📑 Master Surplus Food Registry ({donations.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 dark:border-navy-700 text-slate-400 uppercase font-black">
                  <th className="p-3">ID</th>
                  <th className="p-3">Food Item</th>
                  <th className="p-3">Servings</th>
                  <th className="p-3">Donor Venue</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Assigned NGO</th>
                  <th className="p-3">Volunteer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-700/80 font-semibold text-slate-700 dark:text-slate-200">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-[#1C3B64]/50">
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{d.id}</td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">{d.food_type}</td>
                    <td className="p-3 font-bold">{d.quantity}</td>
                    <td className="p-3">{d.donor_name}</td>
                    <td className="p-3">{d.pickup_address}</td>
                    <td className="p-3"><StatusBadge status={d.status} /></td>
                    <td className="p-3 font-bold text-[#00A86B] dark:text-emerald-400">{d.assigned_ngo_name || '—'}</td>
                    <td className="p-3 text-purple-600 dark:text-purple-400 font-semibold">{d.assigned_volunteer_name || '—'}</td>
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
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">
            📜 Verification Audit Logs ({logs.length})
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
              <h3 className="font-black text-lg">
                📄 NGO Legal Registration Certificate Audit
              </h3>
              <button onClick={() => setSelectedCertificateDoc(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-[#0A1628] border border-emerald-200 dark:border-navy-700 space-y-2 text-xs">
              <div className="font-black text-sm text-slate-900 dark:text-white">{selectedCertificateDoc.name}</div>
              <div>NGO Darpan ID: <strong className="font-mono text-[#00A86B] dark:text-emerald-400">{selectedCertificateDoc.darpan_id || 'AP/2026/008891'}</strong></div>
              <div>Legal Reg No: <strong className="font-mono">{selectedCertificateDoc.legal_reg_no || 'REG-AP-4012'}</strong></div>
              <div>PAN Number: <strong className="font-mono">{selectedCertificateDoc.pan_number || 'DDDDD4444D'}</strong></div>
              <div>FCRA Compliance: <strong>{selectedCertificateDoc.fcra_status || 'Compliant'}</strong></div>
            </div>

            <div className="p-6 border-2 border-dashed border-slate-300 dark:border-navy-700 rounded-xl text-center space-y-3">
              <div className="text-4xl">📜</div>
              <div className="font-bold text-sm">Official Society Registration & Verification Document</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Government of Andhra Pradesh / NITI Aayog NGO Darpan Database Record</div>
              {selectedCertificateDoc.registration_doc_url && (
                <a 
                  href={selectedCertificateDoc.registration_doc_url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-block px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 shadow"
                >
                  🔗 View Full Official Document PDF
                </a>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => {
                  handleVerifyNgo(selectedCertificateDoc.id, 'approve');
                  setSelectedCertificateDoc(null);
                }} 
                className="px-4 py-2 bg-[#00A86B] text-white font-black text-xs rounded-xl hover:bg-[#00965E] shadow"
              >
                ✓ Verify NGO License
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
