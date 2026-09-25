import React, { useState, useEffect } from 'react';
import StatusBadge from '../components/StatusBadge';
import MapView from '../components/MapView';
import PickupVerifyModal from '../components/PickupVerifyModal';
import DeliveryProofModal from '../components/DeliveryProofModal';
import { openLiveNavigation } from '../utils/navigation';
import { i18nDict } from '../i18n';
import { apiFetch } from '../utils/api';
import IconBox from '../components/IconBox';
import { 
  Truck, 
  Bike, 
  Compass, 
  MapPin, 
  Building2, 
  Navigation, 
  Package, 
  CheckCircle2, 
  Target, 
  ArrowRight, 
  Zap, 
  Store,
  Sparkles,
  KeyRound,
  Camera
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

export default function VolunteerPage({ lang, user }) {
  const t = i18nDict[lang] || i18nDict.en;
  const navigate = useNavigate();

  const [volunteer, setVolunteer] = useState(() => ({
    id: user?.id || 'VOL-001',
    name: user?.name || 'Ramesh Kumar',
    phone: user?.phone || '9876543210'
  }));

  useEffect(() => {
    if (user) {
      setVolunteer({
        id: user.id,
        name: user.name || 'Volunteer Hero',
        phone: user.phone || '9876543210'
      });
    }
  }, [user]);

  const [openJobs, setOpenJobs] = useState([
    {
      id: 'DON-1002',
      food_type: 'Paneer Butter Masala & Naan',
      quantity: 90,
      pickup_address: 'Beach Road, Visakhapatnam',
      pickup_lat: 17.7123,
      pickup_lng: 83.3150,
      ngo_name: 'Asha Care Foundation',
      ngo_lat: 17.7200,
      ngo_lng: 83.3100,
      status: 'accepted'
    }
  ]);
  const [myTasks, setMyTasks] = useState([]);
  const [ngos, setNgos] = useState([]);

  const fetchOpenJobs = async () => {
    try {
      const data = await apiFetch('/api/volunteers/open-jobs');
      if (data && (data.jobs || data.openJobs)) setOpenJobs(data.jobs || data.openJobs);
    } catch(e) {}
  };

  const fetchMyTasks = async () => {
    try {
      const data = await apiFetch(`/api/volunteers/${volunteer.id}/my-jobs`);
      if (data && data.jobs) setMyTasks(data.jobs);
    } catch(e) {}
  };

  const fetchNgos = async () => {
    try {
      const data = await apiFetch('/api/ngos');
      if (data && data.ngos) setNgos(data.ngos);
    } catch(e) {}
  };

  useEffect(() => {
    fetchOpenJobs();
    fetchMyTasks();
    fetchNgos();
    const interval = setInterval(() => {
      fetchOpenJobs();
      fetchMyTasks();
      fetchNgos();
    }, 3000);
    return () => clearInterval(interval);
  }, [volunteer.id]);

  const handleClaimJob = async (donationId) => {
    try {
      const data = await apiFetch('/api/volunteers/claim-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volunteer_id: volunteer.id, donation_id: donationId })
      });
      if (data && data.success) {
        alert(`Transport delivery job claimed by ${volunteer.name}! Moved to Active Deliveries.`);
        
        // Instant UI update
        const claimed = openJobs.find(j => j.id === donationId) || {
          id: donationId,
          food_type: 'Naan (90 Servings)',
          quantity: 90,
          pickup_address: 'Beach Road, Visakhapatnam',
          pickup_lat: 17.7123,
          pickup_lng: 83.3150,
          ngo_name: 'Asha Care Foundation',
          donor_name: 'Kumar Thale',
          donor_phone: '9848022338',
          status: 'volunteer_assigned'
        };

        claimed.status = 'volunteer_assigned';
        setMyTasks(prev => [claimed, ...prev.filter(t => t.id !== donationId)]);
        setOpenJobs(prev => prev.filter(j => j.id !== donationId));

        fetchOpenJobs();
        fetchMyTasks();
      }
    } catch(e) {
      alert('Error claiming job.');
    }
  };

  const [showPickupOtpModal, setShowPickupOtpModal] = useState(false);
  const [selectedPickupDonation, setSelectedPickupDonation] = useState(null);

  const [showDeliveryProofModal, setShowDeliveryProofModal] = useState(false);
  const [selectedDeliveryDonation, setSelectedDeliveryDonation] = useState(null);

  const handleOpenPickupOtp = (task) => {
    setSelectedPickupDonation(task);
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
        setMyTasks(prev => prev.map(t => t.id === selectedPickupDonation.id ? { ...t, status: 'picked_up' } : t));
        fetchMyTasks();
      } else {
        alert(data ? data.error : 'Incorrect OTP code.');
      }
    } catch(e) {
      alert('Error verifying OTP code.');
    }
  };

  const handleOpenDeliveryProof = (task) => {
    setSelectedDeliveryDonation(task);
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
        alert(data.message || '✓ Delivery proof image recorded! Status updated to Delivered.');
        setShowDeliveryProofModal(false);
        setMyTasks(prev => prev.map(t => t.id === selectedDeliveryDonation.id ? { ...t, status: 'delivered', delivery_photo_url: photoData.delivery_photo_url } : t));
        fetchMyTasks();
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
        body: JSON.stringify({ donation_id: donationId, status, beneficiary_name: 'Shelter Beneficiaries' })
      });
      if (data && data.success) {
        alert(`Status updated to ${status}!`);
        setMyTasks(prev => prev.map(t => t.id === donationId ? { ...t, status } : t));
        fetchMyTasks();
      }
    } catch(e) {}
  };

  const allActiveJobs = [...myTasks, ...openJobs];

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white rounded-2xl p-6 sm:p-8 shadow-md flex justify-between items-center flex-wrap gap-4 border border-navy-700">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{t.volTitle}</h2>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl font-medium">{t.volSub}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-300">Volunteer Hero:</div>
            <div className="font-bold text-sm">{volunteer.name}</div>
          </div>
          <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-bold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span>Fast Transport Dispatch</span>
          </span>
        </div>
      </div>

      {/* Interactive Map Location Preview */}
      <div className="bg-white dark:bg-[#0D1E36] rounded-2xl p-6 border border-slate-200/80 dark:border-navy-700/80 shadow-sm space-y-3">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h3 className="text-sm font-black uppercase text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#00A86B]" />
            <span>Live Logistics Route & GPS Pickup Preview</span>
          </h3>
          <span className="text-xs font-bold text-[#00A86B] dark:text-emerald-400">
            OpenStreetMap & Live Coordinates
          </span>
        </div>
        <MapView donations={allActiveJobs} ngos={ngos} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Open Pickups Needing Transport */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-[#0D1E36] rounded-2xl p-6 border border-slate-200/80 dark:border-navy-700/80 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#00A86B]" />
              <span>{t.volOpenJobs}</span>
            </h3>

            {openJobs.length === 0 ? (
              <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 dark:border-navy-700 rounded-xl font-semibold text-xs flex flex-col items-center justify-center gap-2">
                <Truck className="w-6 h-6 text-slate-400" />
                <span>No open pickups currently requesting volunteer transport.</span>
              </div>
            ) : (
              <div className="space-y-4">
                {openJobs.map((j) => (
                  <div key={j.id} className="p-4 rounded-xl bg-slate-50 dark:bg-[#0A1628] border border-slate-200/80 dark:border-navy-700 shadow-sm space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-3">
                        {j.food_image_url ? (
                          <img src={j.food_image_url} alt={j.food_type} className="w-12 h-12 object-cover rounded-xl border border-slate-200 dark:border-navy-700 shadow-sm" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 flex items-center justify-center font-bold">
                            <Bike className="w-5 h-5" />
                          </div>
                        )}
                        <h4 className="font-black text-sm text-slate-900 dark:text-white">{j.food_type} ({j.quantity} Servings)</h4>
                      </div>
                      <StatusBadge status={j.status} />
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300 font-medium space-y-1">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#00A86B]" />
                        <span>Pickup Venue: <strong>{j.pickup_address}</strong></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Deliver to: <strong>{j.ngo_name}</strong></span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        GPS: {j.pickup_lat?.toFixed(4)}, {j.pickup_lng?.toFixed(4)}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button 
                        onClick={() => openLiveNavigation({
                          lat: j.pickup_lat,
                          lng: j.pickup_lng,
                          destLat: j.ngo_lat,
                          destLng: j.ngo_lng,
                          title: j.food_type
                        })}
                        className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition-colors shadow flex items-center justify-center gap-1.5"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Open Live GPS Navigation</span>
                      </button>

                      <button 
                        onClick={() => handleClaimJob(j.id)}
                        className="py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl transition-colors shadow flex items-center gap-1"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Claim Job</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Volunteer Deliveries */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-[#0D1E36] rounded-2xl p-6 border border-slate-200/80 dark:border-navy-700/80 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              <span>{t.volMyTasks}</span>
            </h3>

            {myTasks.length === 0 ? (
              <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 dark:border-navy-700 rounded-xl font-semibold text-xs flex flex-col items-center justify-center gap-2">
                <Target className="w-6 h-6 text-slate-400" />
                <span>You have no active delivery tasks assigned.</span>
              </div>
            ) : (
              <div className="space-y-4">
                {myTasks.map((task) => (
                  <div key={task.id} className="p-4 rounded-xl bg-slate-50 dark:bg-[#0A1628] border border-slate-200/80 dark:border-navy-700 shadow-sm space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-3">
                        {task.food_image_url ? (
                          <img src={task.food_image_url} alt={task.food_type} className="w-12 h-12 object-cover rounded-xl border border-slate-200 dark:border-navy-700 shadow-sm" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 flex items-center justify-center font-bold">
                            <Target className="w-5 h-5 text-[#00A86B]" />
                          </div>
                        )}
                        <h4 className="font-black text-sm text-slate-900 dark:text-white">{task.food_type} ({task.quantity} Servings)</h4>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300 font-medium space-y-1">
                      <div className="flex items-center gap-1">
                        <Store className="w-3.5 h-3.5 text-slate-400" />
                        <span>Donor: {task.donor_name} ({task.donor_phone})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#00A86B]" />
                        <span>Venue Address: <strong>{task.pickup_address}</strong></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Target Shelter: <strong>{task.ngo_name}</strong></span>
                      </div>
                    </div>

                    {/* LIVE TURN-BY-TURN NAVIGATION BUTTON */}
                    <div className="p-3 bg-blue-50 dark:bg-navy-950 rounded-xl border border-blue-200 dark:border-navy-700 space-y-2">
                      <div className="text-[11px] font-bold text-blue-900 dark:text-sky-300 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Navigation className="w-3.5 h-3.5 text-blue-600" />
                          <span>Native Turn-by-Turn GPS Guidance:</span>
                        </span>
                        <span className="font-mono text-[10px] text-blue-600 dark:text-sky-400">Google / Apple Maps</span>
                      </div>
                      <button 
                        onClick={() => openLiveNavigation({
                          lat: task.pickup_lat,
                          lng: task.pickup_lng,
                          destLat: task.ngo_lat,
                          destLng: task.ngo_lng,
                          title: task.food_type
                        })}
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
                      >
                        <Compass className="w-4 h-4" />
                        <span>Start Turn-by-Turn Route (Google/Apple Maps)</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="pt-2 flex gap-2">
                      {(task.status === 'volunteer_assigned' || task.status === 'accepted') && (
                        <button 
                          onClick={() => handleOpenPickupOtp(task)}
                          className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-sm flex-1 flex items-center justify-center gap-1.5"
                        >
                          <KeyRound className="w-4 h-4" />
                          <span>Enter Pickup OTP (from Donor)</span>
                        </button>
                      )}
                      {task.status === 'picked_up' && (
                        <button 
                          onClick={() => handleOpenDeliveryProof(task)}
                          className="px-3 py-2 bg-[#00A86B] hover:bg-[#00965E] text-white text-xs font-bold rounded-xl shadow-sm flex-1 flex items-center justify-center gap-1.5"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Upload Delivery Photo & Confirm</span>
                        </button>
                      )}
                      {task.status === 'delivered' && (
                        <div className="flex-1 text-[#00875A] dark:text-emerald-400 text-xs font-black flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Delivery Completed</span>
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

