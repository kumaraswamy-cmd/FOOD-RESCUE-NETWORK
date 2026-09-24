import React, { useState, useEffect } from 'react';
import StatusBadge from '../components/StatusBadge';
import StepperProgress from '../components/StepperProgress';
import OtpModal from '../components/OtpModal';
import MapView from '../components/MapView';
import { openLiveNavigation } from '../utils/navigation';
import { i18nDict } from '../i18n';
import { apiFetch } from '../utils/api';

import { useNavigate } from 'react-router-dom';

export default function DonorPage({ lang, user }) {
  const t = i18nDict[lang] || i18nDict.en;
  const navigate = useNavigate();

  const [donor, setDonor] = useState(() => ({
    id: user?.id || 'GUEST-DONOR',
    name: user?.name || 'Guest Donor',
    email: user?.email || '',
    phone: user?.phone || '9848022338',
    otp_verified: user ? 1 : 0
  }));
  const [showOtp, setShowOtp] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);

  useEffect(() => {
    if (user) {
      setDonor({
        id: user.id,
        name: user.name || 'User Donor',
        email: user.email || '',
        phone: user.phone || '9848022338',
        otp_verified: 1
      });
    }
  }, [user]);

  const [donations, setDonations] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [foodType, setFoodType] = useState('');
  const [quantity, setQuantity] = useState(50);
  const [cookedTime, setCookedTime] = useState('19:00');
  const [freshnessMinutes, setFreshnessMinutes] = useState(120);
  const [pickupAddress, setPickupAddress] = useState('Beach Road, Visakhapatnam');
  const [pickupLat, setPickupLat] = useState(17.7123);
  const [pickupLng, setPickupLng] = useState(83.3150);
  const [notes, setNotes] = useState('');
  const [foodPhoto, setFoodPhoto] = useState('');

  const handleOpenPostModal = () => {
    if (!user) {
      alert('🔐 Sign In Required: Please sign in to your account so your surplus food rescue posts are saved & synced to your account in Cloud Firestore.');
      navigate('/login');
      return;
    }
    setShowPostModal(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File size too large. Please select an image under 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFoodPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const fetchDonations = async () => {
    try {
      const data = await apiFetch(`/api/donations/donor/${donor.id}`);
      if (data && data.donations) setDonations(data.donations);
    } catch(e) {}
  };

  const fetchNgos = async () => {
    try {
      const data = await apiFetch('/api/ngos');
      if (data && data.ngos) setNgos(data.ngos);
    } catch(e) {}
  };

  useEffect(() => {
    fetchDonations();
    fetchNgos();
    const interval = setInterval(fetchDonations, 3000);
    return () => clearInterval(interval);
  }, [donor.id]);

  const handleAutoFillLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setPickupLat(lat);
          setPickupLng(lng);

          try {
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const geoData = await geoRes.json();
            if (geoData && geoData.display_name) {
              setPickupAddress(geoData.display_name);
            } else {
              setPickupAddress(`Visakhapatnam GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
            }
          } catch(e) {
            setPickupAddress(`Visakhapatnam GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
          }

          alert('📍 High-accuracy GPS location captured!');
        },
        () => {
          alert('Could not access Geolocation. Using Visakhapatnam default coordinates.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!donor.otp_verified) {
      setShowOtp(true);
      return;
    }

    setLoading(true);
    try {
      const data = await apiFetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor_id: donor.id,
          food_type: foodType,
          quantity,
          packaging: 'Sealed Containers',
          pickup_lat: pickupLat,
          pickup_lng: pickupLng,
          pickup_address: pickupAddress,
          freshness_window_minutes: freshnessMinutes,
          food_image_url: foodPhoto,
          notes
        })
      });

      if (data && data.success) {
        if (data.flagged) {
          alert(`⚠️ ${data.message || 'Inspection Flagged'}\nReason: ${data.flagReason}`);
        } else {
          alert('🚀 Surplus food post published! Smart recommendation engine matched nearby verified NGOs.');
        }
        setFoodType('');
        setNotes('');
        setFoodPhoto('');
        setShowPostModal(false);
        fetchDonations();
      } else {
        alert('Error creating donation post.');
      }
    } catch(e) {
      alert('Error creating donation post.');
    }
    setLoading(false);
  };

  const displayDonations = donations.length > 0 ? donations : [
    { id: '1', food_type: 'Vegetable Biryani', quantity: 50, pickup_address: 'Visakhapatnam, Andhra Pradesh', pickup_lat: 17.7123, pickup_lng: 83.3150, assigned_ngo_name: 'Asha Care Foundation', created_at: new Date().toISOString(), status: 'delivered' },
    { id: '2', food_type: 'Paneer Curry & Naan', quantity: 30, pickup_address: 'Srikakulam, Andhra Pradesh', pickup_lat: 17.7250, pickup_lng: 83.3012, assigned_ngo_name: 'Akshaya Shelter Trust', created_at: new Date().toISOString(), status: 'volunteer_assigned' },
    { id: '3', food_type: 'Fresh Produce Fruits (Bananas)', quantity: 40, pickup_address: 'Vizianagaram, Andhra Pradesh', pickup_lat: 17.7050, pickup_lng: 83.2900, assigned_ngo_name: 'Mother Theresa Orphanage', created_at: new Date().toISOString(), status: 'posted' },
    { id: '4', food_type: 'Rice & Sambar', quantity: 60, pickup_address: 'Visakhapatnam, Andhra Pradesh', pickup_lat: 17.7198, pickup_lng: 83.3180, assigned_ngo_name: 'Asha Care Foundation', created_at: new Date().toISOString(), status: 'delivered' },
    { id: '5', food_type: 'Mixed Buffet Meals', quantity: 25, pickup_address: 'Visakhapatnam, Andhra Pradesh', pickup_lat: 17.7150, pickup_lng: 83.3120, assigned_ngo_name: 'Akshaya Shelter Trust', created_at: new Date().toISOString(), status: 'delivered' }
  ];

  return (
    <div className="space-y-8">
      {/* WELCOME HERO HEADER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-8 space-y-2">
          <div className="text-xs font-black tracking-widest text-[#00A86B] uppercase">
            DONOR DASHBOARD
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Welcome back, {user ? user.name : 'Guest'}!
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed font-medium">
            Thank you for making a difference. Together, we can reduce food waste and help more communities.
          </p>
        </div>

        {/* Hero Card Banner */}
        <div className="lg:col-span-4 bg-gradient-to-r from-[#E0F7ED] to-emerald-50 dark:from-[#0D1E36] dark:to-[#1C3B64] p-6 rounded-2xl border border-emerald-200/60 dark:border-navy-700 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
              Less Food Waste
            </div>
            <div className="text-sm font-black text-[#00A86B] dark:text-emerald-400">
              A Brighter Tomorrow
            </div>
            <div className="w-8 h-1 bg-[#00A86B] rounded-full mt-2"></div>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#0A1628] flex items-center justify-center text-3xl shadow-sm">
            🍲
          </div>
        </div>
      </div>

      {/* KPI CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-[#0D1E36] p-5 rounded-2xl border border-slate-200/80 dark:border-navy-700/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brandGreen-100 dark:bg-emerald-950/60 text-[#00A86B] flex items-center justify-center text-xl font-bold">
            🍴
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Meals Saved</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">1,248</div>
            <div className="text-[11px] font-extrabold text-[#00A86B] dark:text-emerald-400 mt-0.5">↑ +12% from last month</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D1E36] p-5 rounded-2xl border border-slate-200/80 dark:border-navy-700/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-sky-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center text-xl font-bold">
            📄
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Active Requests</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">6</div>
            <div className="text-[11px] font-extrabold text-blue-600 dark:text-sky-400 mt-0.5">3 NGO partners</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D1E36] p-5 rounded-2xl border border-slate-200/80 dark:border-navy-700/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xl font-bold">
            👥
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">NGOs Supported</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">12</div>
            <div className="text-[11px] font-extrabold text-teal-600 dark:text-teal-400 mt-0.5">Across 3 cities</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D1E36] p-5 rounded-2xl border border-slate-200/80 dark:border-navy-700/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-blue-950/60 text-sky-600 dark:text-blue-400 flex items-center justify-center text-xl font-bold">
            ⚖️
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Food Waste Reduced</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">320 kg</div>
            <div className="text-[11px] font-extrabold text-sky-600 dark:text-blue-400 mt-0.5">Equivalent to 640 meals</div>
          </div>
        </div>
      </div>

      {/* RECENT DONATIONS TABLE SECTION */}
      <div className="bg-white dark:bg-[#0D1E36] rounded-2xl border border-slate-200/80 dark:border-navy-700/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-navy-700/80 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Recent Donations</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Live proximity dispatch pipeline and recipient NGO status
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="text-xs font-extrabold text-slate-600 hover:text-slate-900 dark:text-slate-300">
              View All
            </button>
            <button 
              onClick={handleOpenPostModal} 
              className="px-4 py-2.5 bg-[#00A86B] hover:bg-[#00965E] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <span>+</span>
              <span>New Donation</span>
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0A1628] text-slate-400 dark:text-slate-400 uppercase font-black tracking-wider border-b border-slate-100 dark:border-navy-700">
                <th className="p-4 w-12">#</th>
                <th className="p-4">Food Items</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Location</th>
                <th className="p-4">NGO Partner</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions / GPS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-700/80 font-semibold text-slate-700 dark:text-slate-200">
              {displayDonations.map((d, index) => (
                <tr key={d.id} className="hover:bg-slate-50/80 dark:hover:bg-[#1C3B64]/50 transition-colors">
                  <td className="p-4 font-mono font-bold text-slate-400">{index + 1}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {d.food_image_url ? (
                        <img src={d.food_image_url} alt={d.food_type} className="w-10 h-10 object-cover rounded-xl border border-slate-200 dark:border-navy-700 shadow-sm" />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-[#0A1628] text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-lg font-bold border border-emerald-100 dark:border-navy-700">
                          🍲
                        </div>
                      )}
                      <div>
                        <div className="font-extrabold text-slate-900 dark:text-white text-sm">{d.food_type}</div>
                        <div className="text-[11px] text-slate-400">Cooked Food</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white">{d.quantity} packs</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <span>📍</span>
                      <span>{d.pickup_address}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-[10px]">
                        🏛️
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {d.assigned_ngo_name || 'Asha Care Foundation'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    {new Date(d.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => openLiveNavigation({
                        lat: d.pickup_lat || 17.7123,
                        lng: d.pickup_lng || 83.3150,
                        title: d.food_type
                      })}
                      className="px-2.5 py-1 bg-[#00A86B] hover:bg-[#00965E] text-white font-extrabold text-[11px] rounded-lg shadow flex items-center justify-center gap-1 mx-auto"
                      title="Open Turn-by-Turn GPS Map Navigation"
                    >
                      <span>🗺️</span>
                      <span>GPS</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MAP & ACTIVE PIPELINE SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white dark:bg-[#0D1E36] rounded-2xl p-6 border border-slate-200/80 dark:border-navy-700/80 shadow-sm">
          <h4 className="text-sm font-extrabold uppercase text-slate-500 dark:text-slate-400 mb-3 flex items-center justify-between">
            <span>🗺️ Proximity Geographic Rescue Nodes</span>
            <span className="text-[11px] text-[#00A86B] dark:text-emerald-400 font-bold">Visakhapatnam Network</span>
          </h4>
          <MapView donations={donations} ngos={ngos} />
        </div>

        {/* Stepper Pipeline View */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0D1E36] rounded-2xl p-6 border border-slate-200/80 dark:border-navy-700/80 shadow-sm space-y-4">
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
            ⏳ Real-Time Live Delivery Tracker
          </h4>
          {donations.length > 0 ? (
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {donations.map((d) => (
                <div key={d.id} className="p-4 rounded-xl bg-slate-50 dark:bg-[#0A1628] border border-slate-200/60 dark:border-navy-700 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs">{d.food_type}</span>
                    <StatusBadge status={d.status} />
                  </div>
                  <StepperProgress status={d.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-navy-700 rounded-xl text-xs font-semibold">
              Live delivery progress steppers will display here.
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM CTA BANNER */}
      <div className="bg-[#E0F7ED] dark:bg-[#0D1E36] p-6 sm:p-8 rounded-2xl border border-emerald-200 dark:border-navy-700 flex items-center justify-between flex-wrap gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#00A86B] text-white flex items-center justify-center text-2xl font-bold shadow-sm">
            🌿
          </div>
          <div>
            <h4 className="text-base font-black text-slate-900 dark:text-white">Together, we can end food waste.</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
              Your contributions help feed people and build stronger communities.
            </p>
          </div>
        </div>

        <button 
          onClick={handleOpenPostModal} 
          className="px-5 py-3 bg-[#00A86B] hover:bg-[#00965E] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <span>Make Another Donation</span>
          <span>&rarr;</span>
        </button>
      </div>

      {/* NEW DONATION POST MODAL */}
      {showPostModal && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0D1E36] rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl border border-slate-200 dark:border-navy-700 max-h-[90vh] overflow-y-auto text-slate-900 dark:text-white">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-navy-700 pb-3">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <span>🍲</span>
                <span>Publish Surplus Food Rescue Post</span>
              </h3>
              <button onClick={() => setShowPostModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleSubmitPost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Donor Organisation Name</label>
                <input 
                  type="text" 
                  value={donor.name} 
                  onChange={(e) => setDonor({ ...donor, name: e.target.value })} 
                  className="w-full p-3 border border-slate-200 dark:border-navy-700 bg-white dark:bg-[#0A1628] rounded-xl text-xs font-semibold text-slate-900 dark:text-white" 
                  required 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Food Item & Description</label>
                  <input 
                    type="text" 
                    value={foodType} 
                    onChange={(e) => setFoodType(e.target.value)} 
                    placeholder="e.g. Paneer Biryani & Naan" 
                    className="w-full p-3 border border-slate-200 dark:border-navy-700 bg-white dark:bg-[#0A1628] rounded-xl text-xs font-semibold text-slate-900 dark:text-white" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Quantity (Servings / Packs)</label>
                  <input 
                    type="number" 
                    value={quantity} 
                    onChange={(e) => setQuantity(e.target.value)} 
                    className="w-full p-3 border border-slate-200 dark:border-navy-700 bg-white dark:bg-[#0A1628] rounded-xl text-xs font-semibold text-slate-900 dark:text-white" 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Prepared Time</label>
                  <input 
                    type="time" 
                    value={cookedTime} 
                    onChange={(e) => setCookedTime(e.target.value)} 
                    className="w-full p-3 border border-slate-200 dark:border-navy-700 bg-white dark:bg-[#0A1628] rounded-xl text-xs font-semibold text-slate-900 dark:text-white" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Freshness Expiry Window</label>
                  <select 
                    value={freshnessMinutes} 
                    onChange={(e) => setFreshnessMinutes(e.target.value)} 
                    className="w-full p-3 border border-slate-200 dark:border-navy-700 bg-white dark:bg-[#0A1628] rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value={20} className="dark:bg-[#0D1E36]">20 Mins (Triggers Admin Safety Flag)</option>
                    <option value={60} className="dark:bg-[#0D1E36]">1 Hour (Urgent Dispatch)</option>
                    <option value={120} className="dark:bg-[#0D1E36]">2 Hours (Standard)</option>
                    <option value={180} className="dark:bg-[#0D1E36]">3 Hours (Good State)</option>
                    <option value={240} className="dark:bg-[#0D1E36]">4 Hours (Maximum Freshness Limit)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                  📸 Upload Food Photo (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="block w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#00A86B]/10 file:text-[#00A86B] dark:file:bg-emerald-950 dark:file:text-emerald-400 hover:file:bg-[#00A86B]/20 cursor-pointer" 
                  />
                  {foodPhoto && (
                    <div className="relative flex-shrink-0">
                      <img src={foodPhoto} alt="Preview" className="w-12 h-12 object-cover rounded-xl border border-emerald-500 shadow-sm" />
                      <button 
                        type="button" 
                        onClick={() => setFoodPhoto('')} 
                        className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold shadow"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">Pickup Address / Venue</label>
                  <button 
                    type="button" 
                    onClick={handleAutoFillLocation} 
                    className="text-xs font-black text-[#00A86B] dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>📍 Detect High-Accuracy Live GPS</span>
                  </button>
                </div>
                <input 
                  type="text" 
                  value={pickupAddress} 
                  onChange={(e) => setPickupAddress(e.target.value)} 
                  className="w-full p-3 border border-slate-200 dark:border-navy-700 bg-white dark:bg-[#0A1628] rounded-xl text-xs font-semibold text-slate-900 dark:text-white" 
                  required 
                />
                <div className="text-[10px] font-mono text-slate-400 mt-1">
                  Captured GPS: {pickupLat.toFixed(5)}, {pickupLng.toFixed(5)}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Packaging Details</label>
                <textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  rows={2} 
                  placeholder="Sealed stainless steel food containers. Temperature controlled." 
                  className="w-full p-3 border border-slate-200 dark:border-navy-700 bg-white dark:bg-[#0A1628] rounded-xl text-xs font-semibold text-slate-900 dark:text-white" 
                />
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full py-3.5 bg-[#00A86B] hover:bg-[#00965E] text-white font-extrabold rounded-xl shadow-md transition-colors text-xs"
              >
                {loading ? 'Publishing Post...' : '🚀 Publish Surplus Food Rescue Post'}
              </button>
            </form>
          </div>
        </div>
      )}

      <OtpModal 
        isOpen={showOtp} 
        onClose={() => setShowOtp(false)} 
        onVerified={(user) => {
          setDonor({ ...donor, ...user, otp_verified: 1 });
          setShowOtp(false);
          alert('Phone number verified via SMS OTP!');
        }} 
      />
    </div>
  );
}
