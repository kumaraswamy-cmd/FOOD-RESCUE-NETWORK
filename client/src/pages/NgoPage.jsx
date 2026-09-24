import React, { useState, useEffect } from 'react';
import StatusBadge from '../components/StatusBadge';
import FssaiModal from '../components/FssaiModal';
import MapView from '../components/MapView';
import { openLiveNavigation } from '../utils/navigation';
import { i18nDict } from '../i18n';

export default function NgoPage({ lang }) {
  const t = i18nDict[lang] || i18nDict.en;

  const [ngo, setNgo] = useState({ 
    id: 'NGO-001', 
    name: 'Asha Care Foundation', 
    phone: '9849011223', 
    darpan_id: 'AP/2024/001928',
    verified: 1, 
    status: 'verified',
    lat: 17.7200,
    lng: 83.3100,
    service_radius_km: 10 
  });

  const [ngosList, setNgosList] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [showFssai, setShowFssai] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);

  // New NGO Registration Form State
  const [showRegModal, setShowRegModal] = useState(false);
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDarpan, setRegDarpan] = useState('AP/2026/089123');
  const [regLegalNo, setRegLegalNo] = useState('REG-AP-8812/2024');
  const [regPan, setRegPan] = useState('AAATN9988X');
  const [regFcra, setRegFcra] = useState('Compliant');
  const [regCertUrl, setRegCertUrl] = useState('https://docs.gov.in/ngo/AP2026_certificate.pdf');
  const [regRadius, setRegRadius] = useState(10);
  const [regLat, setRegLat] = useState(17.7200);
  const [regLng, setRegLng] = useState(83.3100);

  const fetchNgos = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/ngos');
      const data = await res.json();
      if (data.ngos) {
        setNgosList(data.ngos);
        const currentInDb = data.ngos.find(n => n.id === ngo.id);
        if (currentInDb) setNgo(currentInDb);
      }
    } catch(e) {}
  };

  const fetchIncoming = async () => {
    if (!ngo.id) return;
    try {
      const res = await fetch(`http://localhost:5001/api/ngos/${ngo.id}/incoming-matches`);
      const data = await res.json();
      if (data.ngo) setNgo(data.ngo);
      if (data.incoming) setIncoming(data.incoming);
      else setIncoming([]);
    } catch(e) {}
  };

  const fetchPickups = async () => {
    if (!ngo.id) return;
    try {
      const res = await fetch(`http://localhost:5001/api/ngos/${ngo.id}/pickups`);
      const data = await res.json();
      if (data.pickups) setPickups(data.pickups);
    } catch(e) {}
  };

  useEffect(() => {
    fetchNgos();
    fetchIncoming();
    fetchPickups();
    const interval = setInterval(() => {
      fetchNgos();
      fetchIncoming();
      fetchPickups();
    }, 3000);
    return () => clearInterval(interval);
  }, [ngo.id]);

  const handleRegisterNgoSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5001/api/ngos/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          phone: regPhone,
          darpan_id: regDarpan,
          legal_reg_no: regLegalNo,
          pan_number: regPan,
          fcra_status: regFcra,
          registration_doc_url: regCertUrl,
          service_radius_km: regRadius,
          lat: regLat,
          lng: regLng
        })
      });
      const data = await res.json();
      if (data.success && data.ngo) {
        alert('🏛️ Registration Application & Certificate submitted to Admin! Your profile is now pending verification.');
        setNgo(data.ngo);
        setShowRegModal(false);
        fetchNgos();
      }
    } catch(e) {
      alert('Error registering NGO.');
    }
  };

  const handleOpenAudit = (d) => {
    setSelectedDonation(d);
    setShowFssai(true);
  };

  const handleConfirmAccept = async () => {
    if (!selectedDonation) return;
    try {
      const res = await fetch(`http://localhost:5001/api/ngos/${ngo.id}/respond-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donation_id: selectedDonation.id,
          action: 'accept',
          fssai_confirmed: true
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`📋 FSSAI Audit Passed! Donation accepted for ${ngo.name}.`);
        setShowFssai(false);
        fetchIncoming();
        fetchPickups();
      } else {
        alert(data.error || 'Failed to accept match.');
      }
    } catch(e) {
      alert('Error accepting donation match.');
    }
  };

  const handleUpdateStatus = async (donationId, status) => {
    try {
      const res = await fetch('http://localhost:5001/api/deliveries/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donation_id: donationId, status })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Status updated to ${status}!`);
        fetchPickups();
      }
    } catch(e) {}
  };

  const allNgoDonations = [...incoming, ...pickups];

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white rounded-2xl p-6 sm:p-8 shadow-md flex justify-between items-center flex-wrap gap-4 border border-navy-700">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{t.ngoTitle}</h2>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl font-medium">{t.ngoSub}</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={ngo.id} 
            onChange={(e) => {
              const selected = ngosList.find(n => n.id === e.target.value);
              if (selected) setNgo(selected);
            }} 
            className="p-2.5 rounded-xl text-xs font-black text-slate-900 bg-white border border-slate-300 shadow-sm focus:outline-none"
          >
            {ngosList.map(n => {
              let label = '⏳ Pending Admin Audit';
              if (n.verified && n.status === 'verified') label = '✓ Verified';
              else if (n.status === 'rejected') label = '❌ Rejected by Admin';
              else if (n.status === 'suspended') label = '⚠️ Suspended';

              return (
                <option key={n.id} value={n.id}>
                  {n.name} ({label})
                </option>
              );
            })}
          </select>

          <button 
            onClick={() => setShowRegModal(true)} 
            className="px-4 py-2.5 bg-[#00A86B] hover:bg-[#00965E] text-white text-xs font-black rounded-xl shadow transition-all"
          >
            📝 Register New NGO
          </button>
        </div>
      </div>

      {/* STATUS WARNING BANNERS */}
      {ngo.status === 'rejected' && (
        <div className="p-5 rounded-2xl bg-red-50 border-2 border-red-300 text-red-950 font-bold text-sm space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-base text-red-900 font-black">
            <span>❌ NGO Registration Rejected by Admin</span>
          </div>
          <p className="text-xs text-red-800 font-medium">
            Your registration application and legal certificate were reviewed and <strong>declined</strong> by the Admin Governance Portal.
          </p>
          <div className="text-xs bg-white/80 p-3 rounded-xl border border-red-200 font-mono text-red-900">
            <strong>Admin Audit Reason:</strong> {ngo.verification_notes || 'Registration documents or Darpan ID failed official cross-check.'}
          </div>
        </div>
      )}

      {(ngo.status === 'pending' || (!ngo.verified && ngo.status !== 'rejected' && ngo.status !== 'suspended')) && (
        <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 font-bold text-sm space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-base text-amber-950 font-black">
            <span>⏳ Verification Pending: Certificate Reaching Admin</span>
          </div>
          <p className="text-xs text-amber-800 font-medium">
            Your NGO registration details (Darpan ID: <strong className="font-mono">{ngo.darpan_id || 'AP/2026/008891'}</strong> & Certificate) are reaching the Admin Governance Portal for official review.
            Unverified NGOs cannot receive or accept proximity food rescue matches.
          </p>
        </div>
      )}

      {/* Profile Overview */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 border border-slate-200/80 dark:border-navy-800 shadow-sm flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="text-xs text-slate-500 uppercase font-black tracking-wider">Active Recipient Organisation:</div>
          <div className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 mt-0.5">
            <span>{ngo.name}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-black ${
              ngo.verified && ngo.status === 'verified' ? 'bg-[#E0F7ED] text-[#00875A]' : 'bg-amber-100 text-amber-800'
            }`}>
              {ngo.verified && ngo.status === 'verified' ? '✓ Official Verified NGO' : '⏳ Pending Admin Verification'}
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-300 flex flex-wrap gap-6 font-semibold">
          <div>NGO Darpan ID: <strong className="font-mono text-[#00A86B]">{ngo.darpan_id || 'AP/2024/001928'}</strong></div>
          <div>Legal Reg: <strong className="font-mono">{ngo.legal_reg_no || 'REG-AP-1029'}</strong></div>
          <div>Service Radius: <strong>{ngo.service_radius_km} km</strong></div>
        </div>
      </div>

      {/* Interactive Map Preview for NGO */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-3">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h3 className="text-sm font-black uppercase text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>🗺️ Incoming Surplus Rescue Radar & Location Map</span>
          </h3>
          <span className="text-xs font-bold text-[#00A86B] dark:text-emerald-400">
            OpenStreetMap Radius: {ngo.service_radius_km} km
          </span>
        </div>
        <MapView donations={allNgoDonations} ngos={ngosList} center={[ngo.lat || 17.7200, ngo.lng || 83.3100]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Incoming Matched Surplus Food */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-navy-900 rounded-2xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                📍 {t.ngoSurplusHeading}
              </h3>
              <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                Proximity Matching Radar
              </span>
            </div>

            {(!ngo.verified || ngo.status !== 'verified') ? (
              <div className="text-center py-12 bg-amber-50/50 border-2 border-dashed border-amber-200 text-amber-800 rounded-xl space-y-2 p-6">
                <div className="text-4xl">🛡️</div>
                <div className="font-black text-base">Proximity Radar Locked</div>
                <div className="text-xs max-w-md mx-auto font-medium">
                  Application & certificate are reaching Admin for Darpan ID verification. Incoming matches will appear here once Admin approves.
                </div>
              </div>
            ) : incoming.length === 0 ? (
              <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl font-semibold text-xs">
                ✨ No incoming surplus food matches right now. Check back soon!
              </div>
            ) : (
              <div className="space-y-4">
                {incoming.map((d) => (
                  <div key={d.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-black text-base text-slate-900 dark:text-white">{d.food_type} ({d.quantity} Servings)</h4>
                        <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
                          🏬 Donor: <strong>{d.donor_name}</strong> &bull; Phone: {d.donor_phone}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                          📍 {d.pickup_address} (Distance: <strong className="text-[#00A86B]">{d.distance_km} km away</strong>)
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black">
                        {d.freshness_window_minutes}m Shelf-Life
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => openLiveNavigation({
                          lat: d.pickup_lat,
                          lng: d.pickup_lng,
                          destLat: ngo.lat,
                          destLng: ngo.lng,
                          title: d.food_type
                        })}
                        className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition-colors shadow flex items-center gap-1.5"
                      >
                        <span>🗺️</span>
                        <span>Open GPS Navigation</span>
                      </button>

                      <button 
                        onClick={() => handleOpenAudit(d)}
                        className="flex-1 py-2.5 px-4 bg-[#00A86B] hover:bg-[#00965E] text-white font-black rounded-xl text-xs transition-colors shadow-sm"
                      >
                        📋 Run FSSAI Safety Audit & Accept Pickup
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Accepted NGO Pickups */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-navy-900 rounded-2xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">
              📦 {t.ngoPickupsHeading}
            </h3>

            {pickups.length === 0 ? (
              <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl font-semibold text-xs">
                📦 No active accepted pickups for {ngo.name}.
              </div>
            ) : (
              <div className="space-y-4">
                {pickups.map((p) => (
                  <div key={p.id} className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{p.food_type} ({p.quantity} Meals)</h4>
                      <StatusBadge status={p.status} />
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      📍 {p.pickup_address} &bull; Donor: {p.donor_name}
                    </div>

                    {p.volunteer_name && (
                      <div className="text-xs font-black text-purple-700 dark:text-purple-400">
                        🚴 Volunteer Transport: {p.volunteer_name}
                      </div>
                    )}

                    <div className="pt-2 flex gap-2">
                      <button 
                        onClick={() => openLiveNavigation({
                          lat: p.pickup_lat,
                          lng: p.pickup_lng,
                          title: p.food_type
                        })}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm"
                      >
                        🗺️ Nav
                      </button>

                      {p.status === 'accepted' && (
                        <button 
                          onClick={() => handleUpdateStatus(p.id, 'picked_up')} 
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm flex-1"
                        >
                          🚚 Mark Picked Up
                        </button>
                      )}
                      {p.status === 'picked_up' && (
                        <button 
                          onClick={() => handleUpdateStatus(p.id, 'delivered')} 
                          className="px-3 py-1.5 bg-[#00A86B] hover:bg-[#00965E] text-white text-xs font-bold rounded-lg shadow-sm flex-1"
                        >
                          ✅ Confirm Delivery to Shelter
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* NEW NGO REGISTRATION MODAL */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200 dark:border-navy-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-navy-800 pb-3">
              <h3 className="font-black text-lg text-slate-900 dark:text-white">
                📝 Register Recipient NGO & Submit Verification Certificate
              </h3>
              <button onClick={() => setShowRegModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Submit organisation details, Darpan ID, Legal Registration, PAN, & Registration Certificate. Reaches Admin Governance Portal for verification.
            </p>

            <form onSubmit={handleRegisterNgoSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">NGO / Recipient Organisation Name</label>
                <input 
                  type="text" 
                  value={regName} 
                  onChange={(e) => setRegName(e.target.value)} 
                  placeholder="e.g. Hope Orphanage & Welfare Trust" 
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold" 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Contact Phone</label>
                  <input 
                    type="text" 
                    value={regPhone} 
                    onChange={(e) => setRegPhone(e.target.value)} 
                    placeholder="9876543210" 
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">NGO Darpan ID</label>
                  <input 
                    type="text" 
                    value={regDarpan} 
                    onChange={(e) => setRegDarpan(e.target.value)} 
                    placeholder="AP/2026/089123" 
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-mono font-bold" 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Legal Registration No.</label>
                  <input 
                    type="text" 
                    value={regLegalNo} 
                    onChange={(e) => setRegLegalNo(e.target.value)} 
                    placeholder="REG-AP-8812/2024" 
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-mono font-bold" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">PAN Number</label>
                  <input 
                    type="text" 
                    value={regPan} 
                    onChange={(e) => setRegPan(e.target.value)} 
                    placeholder="AAATN9988X" 
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-mono font-bold" 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">FCRA Status</label>
                  <select 
                    value={regFcra} 
                    onChange={(e) => setRegFcra(e.target.value)} 
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="Compliant">Compliant / Registered</option>
                    <option value="Exempt">Exempt</option>
                    <option value="N/A">Not Applicable</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Service Radius (KM)</label>
                  <input 
                    type="number" 
                    value={regRadius} 
                    onChange={(e) => setRegRadius(e.target.value)} 
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold" 
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Upload Registration Certificate / Document URL</label>
                <input 
                  type="text" 
                  value={regCertUrl} 
                  onChange={(e) => setRegCertUrl(e.target.value)} 
                  placeholder="https://docs.gov.in/ngo/AP2026_certificate.pdf" 
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-mono" 
                  required 
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-3.5 bg-[#00A86B] hover:bg-[#00965E] text-white font-extrabold rounded-xl text-xs shadow-md transition-colors"
              >
                🚀 Submit Registration & Certificate to Admin
              </button>
            </form>
          </div>
        </div>
      )}

      <FssaiModal 
        isOpen={showFssai} 
        onClose={() => setShowFssai(false)} 
        onConfirm={handleConfirmAccept} 
        donationTitle={selectedDonation ? selectedDonation.food_type : ''} 
      />
    </div>
  );
}
