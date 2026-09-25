import React, { useState, useEffect } from 'react';
import StatusBadge from '../components/StatusBadge';
import FssaiModal from '../components/FssaiModal';
import PickupVerifyModal from '../components/PickupVerifyModal';
import DeliveryProofModal from '../components/DeliveryProofModal';
import MapView from '../components/MapView';
import { openLiveNavigation } from '../utils/navigation';
import { i18nDict } from '../i18n';
import { apiFetch } from '../utils/api';
import IconBox from '../components/IconBox';
import { 
  Building2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  FileSignature, 
  Compass, 
  MapPin, 
  ShieldAlert, 
  Sparkles, 
  Utensils, 
  Store, 
  Navigation, 
  ClipboardCheck, 
  Package, 
  Truck, 
  X, 
  Send,
  Plus,
  KeyRound,
  Camera
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

export default function NgoPage({ lang, user }) {
  const t = i18nDict[lang] || i18nDict.en;
  const navigate = useNavigate();

  const [ngo, setNgo] = useState({ 
    id: 'NGO-002', 
    name: 'Don Bosco Navajeevan for Boys', 
    phone: '9849078901', 
    darpan_id: 'TS/2024/002441',
    verified: 1, 
    status: 'verified',
    lat: 17.4320,
    lng: 78.5030,
    service_radius_km: 15 
  });

  const handleOpenRegModal = () => {
    setShowRegModal(true);
  };

  const [ngosList, setNgosList] = useState([
    { 
      id: 'NGO-001', 
      name: 'Little Sisters of the Poor – Secunderabad', 
      phone: '9849067890', 
      darpan_id: 'TS/2024/001928',
      verified: 1, 
      status: 'verified',
      lat: 17.4400,
      lng: 78.5000,
      service_radius_km: 10 
    },
    { 
      id: 'NGO-002', 
      name: 'Don Bosco Navajeevan for Boys', 
      phone: '9849078901', 
      darpan_id: 'TS/2024/002441',
      verified: 1, 
      status: 'verified',
      lat: 17.4320,
      lng: 78.5030,
      service_radius_km: 15 
    },
    { 
      id: 'NGO-003', 
      name: "St. Joseph's Orphanage for Girls", 
      phone: '9849089012', 
      darpan_id: 'TS/2025/005512',
      verified: 1, 
      status: 'verified',
      lat: 17.3940,
      lng: 78.4750,
      service_radius_km: 12 
    },
    { 
      id: 'NGO-004', 
      name: 'Tharuni', 
      phone: '9849090123', 
      darpan_id: 'TS/2025/007890',
      verified: 1, 
      status: 'verified',
      lat: 17.4020,
      lng: 78.4840,
      service_radius_km: 10 
    },
    { 
      id: 'NGO-005', 
      name: 'Robin Hood Army – Hyderabad', 
      phone: '9849001234', 
      darpan_id: 'TS/2026/009941',
      verified: 1, 
      status: 'verified',
      lat: 17.4310,
      lng: 78.4070,
      service_radius_km: 15 
    }
  ]);
  const [incoming, setIncoming] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [showFssai, setShowFssai] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);

  // New NGO Registration Form State
  const [showRegModal, setShowRegModal] = useState(false);
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDarpan, setRegDarpan] = useState('TS/2026/089123');
  const [regLegalNo, setRegLegalNo] = useState('REG-TS-8812/2024');
  const [regPan, setRegPan] = useState('AAATN9988X');
  const [regFcra, setRegFcra] = useState('Compliant');
  const [regCertUrl, setRegCertUrl] = useState('https://docs.gov.in/ngo/TS2026_certificate.pdf');
  const [regRadius, setRegRadius] = useState(10);
  const [regLat, setRegLat] = useState(17.4320);
  const [regLng, setRegLng] = useState(78.5030);

  const fetchNgos = async () => {
    try {
      const data = await apiFetch('/api/ngos');
      if (data && data.ngos) {
        setNgosList(data.ngos);
        const currentInDb = data.ngos.find(n => n.id === ngo.id);
        if (currentInDb) setNgo(currentInDb);
      }
    } catch(e) {}
  };

  const fetchIncoming = async () => {
    if (!ngo.id) return;
    try {
      const data = await apiFetch(`/api/ngos/${ngo.id}/incoming-matches`);
      if (data && data.ngo) setNgo(data.ngo);
      if (data && data.incoming) setIncoming(data.incoming);
      else setIncoming([]);
    } catch(e) {}
  };

  const fetchPickups = async () => {
    if (!ngo.id) return;
    try {
      const data = await apiFetch(`/api/ngos/${ngo.id}/pickups`);
      if (data && data.pickups) setPickups(data.pickups);
    } catch(e) {}
  };

  const handleAssignVolunteer = async (donationId, volId) => {
    if (!volId) return;
    try {
      const data = await apiFetch('/api/ngos/assign-volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donation_id: donationId,
          ngo_id: ngo.id,
          volunteer_id: volId
        })
      });
      if (data && data.success) {
        alert(data.message || 'Volunteer assigned successfully!');
        fetchPickups();
      }
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
      const data = await apiFetch('/api/ngos/register', {
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
      if (data && data.success && data.ngo) {
        alert('Registration Application & Certificate submitted to Admin! Your profile is now pending verification.');
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
      const data = await apiFetch(`/api/ngos/${ngo.id}/respond-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donation_id: selectedDonation.id,
          action: 'accept',
          fssai_confirmed: true
        })
      });
      if (data && data.success) {
        alert(`FSSAI Audit Passed! Donation accepted for ${ngo.name}.`);
        setShowFssai(false);
        fetchIncoming();
        fetchPickups();
      } else {
        alert(data ? data.error : 'Failed to accept match.');
      }
    } catch(e) {
      alert('Error accepting donation match.');
    }
  };

  const [showPickupOtpModal, setShowPickupOtpModal] = useState(false);
  const [selectedPickupDonation, setSelectedPickupDonation] = useState(null);

  const [showDeliveryProofModal, setShowDeliveryProofModal] = useState(false);
  const [selectedDeliveryDonation, setSelectedDeliveryDonation] = useState(null);

  const handleOpenPickupOtp = (p) => {
    setSelectedPickupDonation(p);
    setShowPickupOtpModal(true);
  };

  const handleVerifyPickupOtp = async (enteredOtp) => {
    if (!selectedPickupDonation) return;
    try {
      const data = await apiFetch('/api/deliveries/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donation_id: selectedPickupDonation.id, status: 'picked_up', entered_otp: enteredOtp })
      });
      if (data && data.success) {
        alert(data.message || '✓ Pickup OTP verified! Status updated to Picked Up.');
        setShowPickupOtpModal(false);
        fetchPickups();
      } else {
        alert(data ? data.error : 'Incorrect OTP code.');
      }
    } catch(e) {
      alert('Error verifying OTP code.');
    }
  };

  const handleOpenDeliveryProof = (p) => {
    setSelectedDeliveryDonation(p);
    setShowDeliveryProofModal(true);
  };

  const handleConfirmDeliveryPhoto = async (photoData) => {
    if (!selectedDeliveryDonation) return;
    try {
      const data = await apiFetch('/api/deliveries/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donation_id: selectedDeliveryDonation.id,
          status: 'delivered',
          delivery_photo_url: photoData.delivery_photo_url,
          beneficiary_name: photoData.beneficiary_name
        })
      });
      if (data && data.success) {
        alert(data.message || '✓ Delivery confirmed and photo attached!');
        setShowDeliveryProofModal(false);
        fetchPickups();
      } else {
        alert(data ? data.error : 'Failed to confirm delivery.');
      }
    } catch(e) {
      alert('Error confirming delivery.');
    }
  };

  const handleUpdateStatus = async (donationId, status) => {
    try {
      const data = await apiFetch('/api/deliveries/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donation_id: donationId, status })
      });
      if (data && data.success) {
        alert(`Status updated to ${status}!`);
        fetchPickups();
      }
    } catch(e) {}
  };

  const allNgoDonations = [...incoming, ...pickups];
  const displayNgos = ngosList.some(n => n.id === ngo.id) 
    ? ngosList 
    : [ngo, ...ngosList];

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white rounded-2xl p-6 sm:p-8 shadow-md flex justify-between items-center flex-wrap gap-4 border border-navy-700">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{t.ngoTitle}</h2>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl font-medium">{t.ngoSub}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <select 
            value={ngo.id} 
            onChange={(e) => {
              const selected = displayNgos.find(n => n.id === e.target.value);
              if (selected) setNgo(selected);
            }} 
            className="w-full sm:w-auto min-w-[240px] sm:min-w-[280px] max-w-full px-3.5 py-2.5 rounded-xl text-xs font-black text-slate-900 bg-white dark:bg-[#0A1628] dark:text-white border border-slate-300 dark:border-navy-700 shadow-md focus:outline-none focus:ring-2 focus:ring-[#00A86B] cursor-pointer"
          >
            {displayNgos.map(n => {
              let label = 'Pending Admin Audit';
              if (n.verified && (n.status === 'verified' || !n.status)) label = 'Verified';
              else if (n.status === 'rejected') label = 'Rejected by Admin';
              else if (n.status === 'suspended') label = 'Suspended';

              return (
                <option key={n.id} value={n.id} className="text-slate-900 dark:text-white bg-white dark:bg-[#0D1E36] font-bold">
                  {n.name} ({label})
                </option>
              );
            })}
          </select>

          <button 
            onClick={handleOpenRegModal} 
            className="whitespace-nowrap px-4 py-2.5 bg-[#00A86B] hover:bg-[#00965E] text-white text-xs font-black rounded-xl shadow transition-all flex-shrink-0 flex items-center gap-2"
          >
            <FileSignature className="w-4 h-4" />
            <span>Register New NGO</span>
          </button>
        </div>
      </div>

      {/* STATUS WARNING BANNERS */}
      {ngo.status === 'rejected' && (
        <div className="p-5 rounded-2xl bg-red-50 border-2 border-red-300 text-red-950 font-bold text-sm space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-base text-red-900 font-black">
            <XCircle className="w-5 h-5 text-red-600" />
            <span>NGO Registration Rejected by Admin</span>
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
            <Clock className="w-5 h-5 text-amber-600" />
            <span>Verification Pending: Certificate Reaching Admin</span>
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
            <span className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 ${
              ngo.verified && ngo.status === 'verified' ? 'bg-[#E0F7ED] text-[#00875A]' : 'bg-amber-100 text-amber-800'
            }`}>
              {ngo.verified && ngo.status === 'verified' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Official Verified NGO</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pending Admin Verification</span>
                </>
              )}
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
            <Compass className="w-4 h-4 text-[#00A86B]" />
            <span>Incoming Surplus Rescue Radar & Location Map</span>
          </h3>
          <span className="text-xs font-bold text-[#00A86B] dark:text-emerald-400">
            OpenStreetMap Radius: {ngo.service_radius_km} km
          </span>
        </div>
        <MapView donations={allNgoDonations} ngos={ngosList} center={[ngo.lat || 17.4320, ngo.lng || 78.5030]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Incoming Matched Surplus Food */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-navy-900 rounded-2xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#00A86B]" />
                <span>{t.ngoSurplusHeading}</span>
              </h3>
              <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                Proximity Matching Radar
              </span>
            </div>

            {incoming.length === 0 ? (
              <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl font-semibold text-xs flex flex-col items-center justify-center gap-2">
                <Sparkles className="w-6 h-6 text-slate-400" />
                <span>No incoming surplus food matches right now. Check back soon!</span>
              </div>
            ) : (
              <div className="space-y-4">
                {incoming.map((d) => (
                  <div key={d.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-start gap-3">
                        {d.food_image_url ? (
                          <img src={d.food_image_url} alt={d.food_type} className="w-14 h-14 object-cover rounded-xl border border-slate-200 dark:border-navy-700 shadow-sm" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 flex items-center justify-center font-bold">
                            <Utensils className="w-6 h-6 text-[#00A86B]" />
                          </div>
                        )}
                        <div>
                          {d.food_items && Array.isArray(d.food_items) && d.food_items.length > 0 ? (
                            <div>
                              <h4 className="font-black text-base text-slate-900 dark:text-white">
                                {d.food_items.map(i => i.itemName).join(', ')}
                              </h4>
                              <div className="text-xs font-bold text-[#00A86B] dark:text-emerald-400 mt-0.5">
                                {d.food_items.map(i => `${i.quantity} ${i.unit || 'plates'}`).join(' + ')}
                              </div>
                            </div>
                          ) : (
                            <h4 className="font-black text-base text-slate-900 dark:text-white">{d.food_type} ({d.quantity} Servings)</h4>
                          )}
                          <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium flex items-center gap-1">
                            <Store className="w-3.5 h-3.5 text-slate-400" />
                            <span>Donor: <strong>{d.donor_name}</strong> &bull; Phone: {d.donor_phone}</span>
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-[#00A86B]" />
                            <span>{d.pickup_address} (Distance: <strong className="text-[#00A86B]">{d.distance_km || 2} km away</strong>)</span>
                          </div>
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
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Open GPS Navigation</span>
                      </button>

                      <button 
                        onClick={() => handleOpenAudit(d)}
                        className="flex-1 py-2.5 px-4 bg-[#00A86B] hover:bg-[#00965E] text-white font-black rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <ClipboardCheck className="w-4 h-4" />
                        <span>Run FSSAI Safety Audit & Accept Pickup</span>
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
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#00A86B]" />
              <span>{t.ngoPickupsHeading}</span>
            </h3>

            {pickups.length === 0 ? (
              <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl font-semibold text-xs flex flex-col items-center justify-center gap-2">
                <Package className="w-6 h-6 text-slate-400" />
                <span>No active accepted pickups for {ngo.name}.</span>
              </div>
            ) : (
              <div className="space-y-4">
                {pickups.map((p) => (
                  <div key={p.id} className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-2">
                    <div className="flex justify-between items-start">
                      {p.food_items && Array.isArray(p.food_items) && p.food_items.length > 0 ? (
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {p.food_items.map(i => i.itemName).join(', ')}
                          </h4>
                          <div className="text-xs font-bold text-[#00A86B] dark:text-emerald-400">
                            {p.food_items.map(i => `${i.quantity} ${i.unit || 'plates'}`).join(' + ')}
                          </div>
                        </div>
                      ) : (
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{p.food_type} ({p.quantity} Meals)</h4>
                      )}
                      <StatusBadge status={p.status} />
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#00A86B]" />
                      <span>{p.pickup_address} &bull; Donor: {p.donor_name}</span>
                    </div>

                    {p.volunteer_name ? (
                      <div className="text-xs font-black text-purple-700 dark:text-purple-400 flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" />
                        <span>Volunteer Transport: {p.volunteer_name}</span>
                      </div>
                    ) : (
                      <div className="pt-1 flex items-center gap-2 bg-slate-100 dark:bg-[#0A1628] p-2 rounded-xl border border-slate-200 dark:border-navy-700">
                        <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-300 flex items-center gap-1">
                          <Truck className="w-3 h-3 text-purple-500" />
                          <span>Assign Volunteer:</span>
                        </span>
                        <select 
                          onChange={(e) => handleAssignVolunteer(p.id, e.target.value)}
                          className="px-2 py-1 rounded-lg text-xs font-bold bg-white dark:bg-[#0D1E36] border border-slate-300 dark:border-navy-600 text-slate-800 dark:text-white cursor-pointer"
                        >
                          <option value="">-- Select Volunteer (Or Leave Open) --</option>
                          <option value="VOL-001">Rajesh Kumar (VOL-001)</option>
                          <option value="VOL-002">Suresh Varma (VOL-002)</option>
                          <option value="VOL-HERO">Hero Volunteer</option>
                        </select>
                      </div>
                    )}

                    <div className="pt-2 flex gap-2">
                      <button 
                        onClick={() => openLiveNavigation({
                          lat: p.pickup_lat,
                          lng: p.pickup_lng,
                          title: p.food_type
                        })}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>Nav</span>
                      </button>

                      {p.status === 'accepted' && (
                        <button 
                          onClick={() => handleOpenPickupOtp(p)} 
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg shadow-sm flex-1 flex items-center justify-center gap-1.5"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Enter Pickup OTP (from Donor)</span>
                        </button>
                      )}
                      {p.status === 'picked_up' && (
                        <button 
                          onClick={() => handleOpenDeliveryProof(p)} 
                          className="px-3 py-1.5 bg-[#00A86B] hover:bg-[#00965E] text-white text-xs font-bold rounded-lg shadow-sm flex-1 flex items-center justify-center gap-1.5"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Upload Delivery Photo & Confirm</span>
                        </button>
                      )}
                      {p.status === 'delivered' && (
                        <div className="flex-1 text-[#00A86B] dark:text-emerald-400 text-xs font-black flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Delivery Confirmed</span>
                        </div>
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
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200 dark:border-navy-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-navy-800 pb-3">
              <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-[#00A86B]" />
                <span>Register Recipient NGO & Submit Verification Certificate</span>
              </h3>
              <button onClick={() => setShowRegModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-700">
                <X className="w-5 h-5" />
              </button>
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
                className="w-full py-3.5 bg-[#00A86B] hover:bg-[#00965E] text-white font-extrabold rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Registration & Certificate to Admin</span>
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

      <PickupVerifyModal
        isOpen={showPickupOtpModal}
        onClose={() => setShowPickupOtpModal(false)}
        onVerify={handleVerifyPickupOtp}
        donation={selectedPickupDonation}
      />

      <DeliveryProofModal
        isOpen={showDeliveryProofModal}
        onClose={() => setShowDeliveryProofModal(false)}
        onConfirm={handleConfirmDeliveryPhoto}
        donation={selectedDeliveryDonation}
      />
    </div>
  );
}
