import React, { useState, useEffect } from 'react';
import StatusBadge from '../components/StatusBadge';
import StepperProgress from '../components/StepperProgress';
import OtpModal from '../components/OtpModal';
import MapView from '../components/MapView';
import { openLiveNavigation } from '../utils/navigation';
import { i18nDict } from '../i18n';
import { apiFetch } from '../utils/api';
import IconBox from '../components/IconBox';
import { 
  Utensils, 
  FileText, 
  Users, 
  Scale, 
  MapPin, 
  Building2, 
  Navigation, 
  Compass, 
  Clock, 
  Leaf, 
  ArrowRight, 
  Camera, 
  X, 
  Send, 
  Plus, 
  Lock,
  TrendingUp,
  KeyRound,
  Pencil,
  Trash2
} from 'lucide-react';

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
        name: user.name || 'Rahul Mehta',
        email: user.email || 'donor@nconvention.org',
        phone: user.phone || '9849012345',
        otp_verified: 1
      });
    }
  }, [user]);

  const [donations, setDonations] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [foodItems, setFoodItems] = useState([
    { itemName: '', quantity: 50, unit: 'plates', description: '' }
  ]);
  const [cookedTime, setCookedTime] = useState('19:00');
  const [freshnessMinutes, setFreshnessMinutes] = useState(120);
  const [pickupAddress, setPickupAddress] = useState('Madhapur, Hyderabad');
  const [pickupLat, setPickupLat] = useState(17.4560);
  const [pickupLng, setPickupLng] = useState(78.3840);
  const [notes, setNotes] = useState('');
  const [foodPhoto, setFoodPhoto] = useState('');

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDonation, setEditingDonation] = useState(null);
  const [editFoodItems, setEditFoodItems] = useState([
    { itemName: '', quantity: 50, unit: 'plates', description: '' }
  ]);
  const [editAddress, setEditAddress] = useState('');
  const [editFreshness, setEditFreshness] = useState(120);

  const handleAddFoodItem = () => {
    setFoodItems(prev => [...prev, { itemName: '', quantity: 50, unit: 'plates', description: '' }]);
  };

  const handleRemoveFoodItem = (index) => {
    if (foodItems.length <= 1) return;
    setFoodItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleFoodItemChange = (index, field, value) => {
    setFoodItems(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddEditFoodItem = () => {
    setEditFoodItems(prev => [...prev, { itemName: '', quantity: 50, unit: 'plates', description: '' }]);
  };

  const handleRemoveEditFoodItem = (index) => {
    if (editFoodItems.length <= 1) return;
    setEditFoodItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditFoodItemChange = (index, field, value) => {
    setEditFoodItems(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleOpenEditModal = (donation) => {
    setEditingDonation(donation);
    if (donation.food_items && Array.isArray(donation.food_items) && donation.food_items.length > 0) {
      setEditFoodItems(donation.food_items.map(i => ({ ...i })));
    } else {
      setEditFoodItems([
        { itemName: donation.food_type || '', quantity: donation.quantity || 50, unit: 'plates', description: '' }
      ]);
    }
    setEditAddress(donation.pickup_address || '');
    setEditFreshness(donation.freshness_window_minutes || 120);
    setShowEditModal(true);
  };

  const handleSaveEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingDonation) return;

    for (let i = 0; i < editFoodItems.length; i++) {
      const item = editFoodItems[i];
      if (!item.itemName || !item.itemName.trim()) {
        alert(`Please enter an Item Name for food item #${i + 1}.`);
        return;
      }
      if (!item.quantity || parseInt(item.quantity, 10) <= 0) {
        alert(`Please enter a valid Quantity (>0) for food item #${i + 1}.`);
        return;
      }
    }

    try {
      const data = await apiFetch(`/api/donations/${editingDonation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          food_items: editFoodItems,
          pickup_address: editAddress,
          freshness_window_minutes: editFreshness
        })
      });

      if (data && data.success) {
        alert('Food donation post modified successfully!');
        setShowEditModal(false);
        fetchDonations();
      } else {
        alert(data?.error || 'Failed to update donation post.');
      }
    } catch(e) {
      alert('Error updating donation post.');
    }
  };

  const handleDeleteDonation = async (donationId) => {
    if (!window.confirm('Are you sure you want to delete this food donation post?')) return;
    try {
      const data = await apiFetch(`/api/donations/${donationId}`, {
        method: 'DELETE'
      });
      if (data && data.success) {
        alert('Food donation post deleted successfully!');
        fetchDonations();
      } else {
        alert(data?.error || 'Failed to delete donation post.');
      }
    } catch(e) {
      alert('Error deleting donation post.');
    }
  };

  const handleOpenPostModal = () => {
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
              setPickupAddress(`Hyderabad GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
            }
          } catch(e) {
            setPickupAddress(`Hyderabad GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
          }

          alert('High-accuracy GPS location captured!');
        },
        () => {
          alert('Could not access Geolocation. Using Hyderabad default coordinates.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();

    for (let i = 0; i < foodItems.length; i++) {
      const item = foodItems[i];
      if (!item.itemName || !item.itemName.trim()) {
        alert(`Please enter an Item Name for food item #${i + 1}.`);
        return;
      }
      if (!item.quantity || parseInt(item.quantity, 10) <= 0) {
        alert(`Please enter a valid Quantity (>0) for food item #${i + 1}.`);
        return;
      }
    }

    setLoading(true);
    try {
      const data = await apiFetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor_id: donor.id,
          food_items: foodItems,
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
        if (data.donation) {
          setDonations(prev => [data.donation, ...prev.filter(d => d.id !== data.donation.id)]);
        }
        if (data.flagged) {
          alert(`${data.message || 'Inspection Flagged'}\nReason: ${data.flagReason}`);
        } else {
          alert('Surplus food post published! Smart recommendation engine matched nearby verified NGOs.');
        }
        setFoodItems([{ itemName: '', quantity: 50, unit: 'plates', description: '' }]);
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

  const displayDonations = donations;

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
          <IconBox icon={Utensils} variant="emerald" size="xl" />
        </div>
      </div>

      {/* KPI CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-[#0D1E36] p-5 rounded-2xl border border-slate-200/80 dark:border-navy-700/80 shadow-sm flex items-center gap-4">
          <IconBox icon={Utensils} variant="emerald" size="lg" />
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Meals Saved</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">1,248</div>
            <div className="text-[11px] font-extrabold text-[#00A86B] dark:text-emerald-400 mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+12% from last month</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D1E36] p-5 rounded-2xl border border-slate-200/80 dark:border-navy-700/80 shadow-sm flex items-center gap-4">
          <IconBox icon={FileText} variant="blue" size="lg" />
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Active Requests</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">6</div>
            <div className="text-[11px] font-extrabold text-blue-600 dark:text-sky-400 mt-0.5">3 NGO partners</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D1E36] p-5 rounded-2xl border border-slate-200/80 dark:border-navy-700/80 shadow-sm flex items-center gap-4">
          <IconBox icon={Users} variant="emerald" size="lg" />
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">NGOs Supported</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">12</div>
            <div className="text-[11px] font-extrabold text-teal-600 dark:text-teal-400 mt-0.5">Across 3 cities</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D1E36] p-5 rounded-2xl border border-slate-200/80 dark:border-navy-700/80 shadow-sm flex items-center gap-4">
          <IconBox icon={Scale} variant="navy" size="lg" />
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
                <th className="p-4">Quantity / Units</th>
                <th className="p-4">Pickup OTP</th>
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
                    <div className="flex items-start gap-3">
                      {d.food_image_url ? (
                        <img src={d.food_image_url} alt={d.food_type} className="w-10 h-10 object-cover rounded-xl border border-slate-200 dark:border-navy-700 shadow-sm flex-shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-[#0A1628] text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold border border-emerald-100 dark:border-navy-700 flex-shrink-0">
                          <Utensils className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        {d.food_items && Array.isArray(d.food_items) && d.food_items.length > 0 ? (
                          <div className="space-y-1">
                            {d.food_items.map((item, iIdx) => (
                              <div key={iIdx} className="text-xs">
                                <span className="font-extrabold text-slate-900 dark:text-white">{item.itemName}</span>
                                <span className="text-slate-500 font-medium ml-1">({item.quantity} {item.unit || 'plates'})</span>
                                {item.description && <div className="text-[11px] text-slate-400 italic">{item.description}</div>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <>
                            <div className="font-extrabold text-slate-900 dark:text-white text-sm">{d.food_type}</div>
                            <div className="text-[11px] text-slate-400">Cooked Food</div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white">
                    {d.food_items && Array.isArray(d.food_items) && d.food_items.length > 0 ? (
                      <div>
                        {d.food_items.map((i, iIdx) => (
                          <div key={iIdx} className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {i.quantity} {i.unit || 'plates'}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span>{d.quantity} packs</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 font-mono font-black text-xs border border-amber-300 dark:border-amber-800 shadow-sm" title="4-digit pickup code for Volunteer/NGO">
                      <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                      <span>{d.pickup_otp || '7429'}</span>
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-[#00A86B]" />
                      <span>{d.pickup_address}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-[10px]">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {d.assigned_ngo_name || 'Little Sisters of the Poor – Secunderabad'}
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
                    <div className="flex items-center justify-center gap-1.5">
                      <button 
                        onClick={() => openLiveNavigation({
                          lat: d.pickup_lat || 17.4560,
                          lng: d.pickup_lng || 78.3840,
                          title: d.food_type
                        })}
                        className="px-2 py-1 bg-[#00A86B] hover:bg-[#00965E] text-white font-extrabold text-[11px] rounded-lg shadow flex items-center justify-center gap-1"
                        title="Open Turn-by-Turn GPS Map Navigation"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>GPS</span>
                      </button>

                      <button 
                        onClick={() => handleOpenEditModal(d)}
                        className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow flex items-center justify-center cursor-pointer"
                        title="Edit / Modify Food Donation Post"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button 
                        onClick={() => handleDeleteDonation(d.id)}
                        className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow flex items-center justify-center cursor-pointer"
                        title="Delete Food Donation Post"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
            <span className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#00A86B]" />
              <span>Proximity Geographic Rescue Nodes</span>
            </span>
            <span className="text-[11px] text-[#00A86B] dark:text-emerald-400 font-bold">Hyderabad Network</span>
          </h4>
          <MapView donations={donations} ngos={ngos} />
        </div>

        {/* Stepper Pipeline View */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0D1E36] rounded-2xl p-6 border border-slate-200/80 dark:border-navy-700/80 shadow-sm space-y-4">
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#00A86B]" />
            <span>Real-Time Live Delivery Tracker</span>
          </h4>
          {donations.length > 0 ? (
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {donations.map((d) => (
                <div key={d.id} className="p-4 rounded-xl bg-slate-50 dark:bg-[#0A1628] border border-slate-200/60 dark:border-navy-700 space-y-2">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div>
                      {d.food_items && Array.isArray(d.food_items) && d.food_items.length > 0 ? (
                        <div className="font-extrabold text-slate-900 dark:text-white text-xs">
                          {d.food_items.map(i => `${i.itemName} (${i.quantity} ${i.unit || 'plates'})`).join(' + ')}
                        </div>
                      ) : (
                        <div className="font-extrabold text-slate-900 dark:text-white text-xs">{d.food_type}</div>
                      )}
                      <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-extrabold flex items-center gap-1 mt-0.5">
                        <KeyRound className="w-3 h-3" />
                        <span>Pickup OTP: {d.pickup_otp || '7429'}</span>
                      </div>
                    </div>
                    <StatusBadge status={d.status} />
                  </div>
                  <StepperProgress status={d.status} />
                  {d.delivery_photo_url && (
                    <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-navy-800 flex items-center gap-2">
                      <img src={d.delivery_photo_url} alt="Delivery Proof" className="w-10 h-10 object-cover rounded-lg border border-emerald-500 shadow-sm" />
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">✓ Verified Delivery Photo Attached</span>
                    </div>
                  )}
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
          <IconBox icon={Leaf} variant="emerald" size="lg" />
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
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* NEW DONATION POST MODAL */}
      {showPostModal && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0D1E36] rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl border border-slate-200 dark:border-navy-700 max-h-[90vh] overflow-y-auto text-slate-900 dark:text-white">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-navy-700 pb-3">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <Utensils className="w-5 h-5 text-[#00A86B]" />
                <span>Publish Surplus Food Rescue Post</span>
              </h3>
              <button onClick={() => setShowPostModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-lg p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-700">
                <X className="w-5 h-5" />
              </button>
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

              {/* FOOD ITEMS DYNAMIC LIST */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
                    Food Items ({foodItems.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddFoodItem}
                    className="px-3 py-1.5 bg-[#00A86B]/10 hover:bg-[#00A86B]/20 text-[#00A86B] dark:bg-emerald-950 dark:text-emerald-400 font-extrabold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Another Food Item</span>
                  </button>
                </div>

                {foodItems.map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 dark:bg-[#0A1628] rounded-xl border border-slate-200/80 dark:border-navy-700 space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Item #{idx + 1}
                      </span>
                      {foodItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFoodItem(idx)}
                          className="text-red-500 hover:text-red-700 font-bold text-xs flex items-center gap-1 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          title="Remove this food item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-6">
                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                          Food Item Name *
                        </label>
                        <input
                          type="text"
                          value={item.itemName}
                          onChange={(e) => handleFoodItemChange(idx, 'itemName', e.target.value)}
                          placeholder="e.g. Vegetable Biryani"
                          className="w-full p-2.5 border border-slate-200 dark:border-navy-700 bg-white dark:bg-[#0D1E36] rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                          required
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleFoodItemChange(idx, 'quantity', e.target.value)}
                          className="w-full p-2.5 border border-slate-200 dark:border-navy-700 bg-white dark:bg-[#0D1E36] rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                          required
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                          Unit *
                        </label>
                        <select
                          value={item.unit}
                          onChange={(e) => handleFoodItemChange(idx, 'unit', e.target.value)}
                          className="w-full p-2.5 border border-slate-200 dark:border-navy-700 bg-white dark:bg-[#0D1E36] rounded-xl text-xs font-semibold text-slate-900 dark:text-white capitalize"
                        >
                          <option value="plates">Plates</option>
                          <option value="meals">Meals</option>
                          <option value="packets">Packets</option>
                          <option value="kg">kg</option>
                          <option value="pieces">Pieces</option>
                          <option value="litres">Litres</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                        Description / Dietary Info (Optional)
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleFoodItemChange(idx, 'description', e.target.value)}
                        placeholder="e.g. Mild spice, vegetarian, freshly prepared"
                        className="w-full p-2 border border-slate-200 dark:border-navy-700 bg-white dark:bg-[#0D1E36] rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                ))}
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
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-[#00A86B]" />
                  <span>Upload Food Photo (Optional)</span>
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
                        className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center shadow"
                      >
                        <X className="w-3 h-3" />
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
                    <MapPin className="w-3 h-3" />
                    <span>Detect High-Accuracy Live GPS</span>
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
                className="w-full py-3.5 bg-[#00A86B] hover:bg-[#00965E] text-white font-extrabold rounded-xl shadow-md transition-colors text-xs flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Publishing Post...' : 'Publish Surplus Food Rescue Post'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT / MODIFY DONATION POST MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0D1E36] rounded-2xl max-w-lg w-full p-6 text-slate-900 dark:text-white border border-slate-200 dark:border-navy-700 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-navy-700">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-black">Edit Food Donation Post</h3>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSubmit} className="space-y-4 pt-4">
              {/* EDIT FOOD ITEMS DYNAMIC LIST */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
                    Food Items ({editFoodItems.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddEditFoodItem}
                    className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-extrabold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                {editFoodItems.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-[#0A1628] rounded-xl border border-slate-200 dark:border-navy-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-slate-400 uppercase">Item #{idx + 1}</span>
                      {editFoodItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveEditFoodItem(idx)}
                          className="text-red-500 hover:text-red-700 font-bold text-xs flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-6">
                        <input
                          type="text"
                          value={item.itemName}
                          onChange={(e) => handleEditFoodItemChange(idx, 'itemName', e.target.value)}
                          placeholder="Food Item Name"
                          className="w-full p-2 border border-slate-200 dark:border-navy-700 bg-white dark:bg-[#0D1E36] rounded-xl text-xs font-semibold"
                          required
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleEditFoodItemChange(idx, 'quantity', e.target.value)}
                          className="w-full p-2 border border-slate-200 dark:border-navy-700 bg-white dark:bg-[#0D1E36] rounded-xl text-xs font-semibold"
                          required
                        />
                      </div>
                      <div className="col-span-3">
                        <select
                          value={item.unit || 'plates'}
                          onChange={(e) => handleEditFoodItemChange(idx, 'unit', e.target.value)}
                          className="w-full p-2 border border-slate-200 dark:border-navy-700 bg-white dark:bg-[#0D1E36] rounded-xl text-xs font-semibold capitalize"
                        >
                          <option value="plates">Plates</option>
                          <option value="meals">Meals</option>
                          <option value="packets">Packets</option>
                          <option value="kg">kg</option>
                          <option value="pieces">Pieces</option>
                          <option value="litres">Litres</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={item.description || ''}
                        onChange={(e) => handleEditFoodItemChange(idx, 'description', e.target.value)}
                        placeholder="Description / Notes (Optional)"
                        className="w-full p-2 border border-slate-200 dark:border-navy-700 bg-white dark:bg-[#0D1E36] rounded-xl text-xs font-semibold"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Shelf-Life (Minutes)</label>
                <input 
                  type="number" 
                  value={editFreshness} 
                  onChange={(e) => setEditFreshness(e.target.value)} 
                  className="w-full p-3 border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-[#0A1628] rounded-xl text-xs font-semibold text-slate-900 dark:text-white" 
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Pickup Location Address</label>
                <input 
                  type="text" 
                  value={editAddress} 
                  onChange={(e) => setEditAddress(e.target.value)} 
                  className="w-full p-3 border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-[#0A1628] rounded-xl text-xs font-semibold text-slate-900 dark:text-white" 
                  required 
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md transition-colors text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Save Changes & Update Post</span>
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
