import React, { useState, useEffect } from 'react';
import StatusBadge from '../components/StatusBadge';
import MapView from '../components/MapView';
import { openLiveNavigation } from '../utils/navigation';
import { i18nDict } from '../i18n';

export default function VolunteerPage({ lang }) {
  const t = i18nDict[lang] || i18nDict.en;

  const [volunteer, setVolunteer] = useState({ id: 'VOL-001', name: 'Ramesh Kumar', phone: '9876543210' });
  const [openJobs, setOpenJobs] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [ngos, setNgos] = useState([]);

  const fetchOpenJobs = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/volunteers/open-jobs');
      const data = await res.json();
      if (data.openJobs) setOpenJobs(data.openJobs);
    } catch(e) {}
  };

  const fetchMyTasks = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/volunteers/${volunteer.id}/my-jobs`);
      const data = await res.json();
      if (data.jobs) setMyTasks(data.jobs);
    } catch(e) {}
  };

  const fetchNgos = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/ngos');
      const data = await res.json();
      if (data.ngos) setNgos(data.ngos);
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
      const res = await fetch('http://localhost:5001/api/volunteers/claim-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volunteer_id: volunteer.id, donation_id: donationId })
      });
      const data = await res.json();
      if (data.success) {
        alert(`🛵 Transport delivery job claimed by ${volunteer.name}!`);
        fetchOpenJobs();
        fetchMyTasks();
      }
    } catch(e) {
      alert('Error claiming job.');
    }
  };

  const handleUpdateStatus = async (donationId, status) => {
    try {
      const res = await fetch('http://localhost:5001/api/deliveries/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donation_id: donationId, status, beneficiary_name: 'Shelter Beneficiaries' })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Status updated to ${status}!`);
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
          <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-bold">
            🚀 Fast Transport Dispatch
          </span>
        </div>
      </div>

      {/* Interactive Map Location Preview */}
      <div className="bg-white dark:bg-[#0D1E36] rounded-2xl p-6 border border-slate-200/80 dark:border-navy-700/80 shadow-sm space-y-3">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h3 className="text-sm font-black uppercase text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>🗺️ Live Logistics Route & GPS Pickup Preview</span>
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
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">
              🚴 {t.volOpenJobs}
            </h3>

            {openJobs.length === 0 ? (
              <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 dark:border-navy-700 rounded-xl font-semibold text-xs">
                🚴 No open pickups currently requesting volunteer transport.
              </div>
            ) : (
              <div className="space-y-4">
                {openJobs.map((j) => (
                  <div key={j.id} className="p-4 rounded-xl bg-slate-50 dark:bg-[#0A1628] border border-slate-200/80 dark:border-navy-700 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-black text-sm text-slate-900 dark:text-white">{j.food_type} ({j.quantity} Servings)</h4>
                      <StatusBadge status={j.status} />
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300 font-medium space-y-1">
                      <div>📍 Pickup Venue: <strong>{j.pickup_address}</strong></div>
                      <div>🏛️ Deliver to: <strong>{j.ngo_name}</strong></div>
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
                        <span>🗺️</span>
                        <span>Open Live GPS Navigation</span>
                      </button>

                      <button 
                        onClick={() => handleClaimJob(j.id)}
                        className="py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl transition-colors shadow"
                      >
                        🛵 Claim Job
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
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">
              🎯 {t.volMyTasks}
            </h3>

            {myTasks.length === 0 ? (
              <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 dark:border-navy-700 rounded-xl font-semibold text-xs">
                🎯 You have no active delivery tasks assigned.
              </div>
            ) : (
              <div className="space-y-4">
                {myTasks.map((task) => (
                  <div key={task.id} className="p-4 rounded-xl bg-slate-50 dark:bg-[#0A1628] border border-slate-200/80 dark:border-navy-700 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-black text-sm text-slate-900 dark:text-white">{task.food_type} ({task.quantity} Servings)</h4>
                      <StatusBadge status={task.status} />
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300 font-medium space-y-1">
                      <div>🏬 Donor: {task.donor_name} ({task.donor_phone})</div>
                      <div>📍 Venue Address: <strong>{task.pickup_address}</strong></div>
                      <div>🏛️ Target Shelter: <strong>{task.ngo_name}</strong></div>
                    </div>

                    {/* LIVE TURN-BY-TURN NAVIGATION BUTTON */}
                    <div className="p-3 bg-blue-50 dark:bg-navy-950 rounded-xl border border-blue-200 dark:border-navy-700 space-y-2">
                      <div className="text-[11px] font-bold text-blue-900 dark:text-sky-300 flex items-center justify-between">
                        <span>🛰️ Native Turn-by-Turn GPS Guidance:</span>
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
                        <span>🧭</span>
                        <span>Start Turn-by-Turn Route (Google/Apple Maps)</span>
                        <span>&rarr;</span>
                      </button>
                    </div>

                    <div className="pt-2 flex gap-2">
                      {(task.status === 'volunteer_assigned' || task.status === 'accepted') && (
                        <button 
                          onClick={() => handleUpdateStatus(task.id, 'picked_up')}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm flex-1"
                        >
                          📦 Confirm Pickup at Venue
                        </button>
                      )}
                      {task.status === 'picked_up' && (
                        <button 
                          onClick={() => handleUpdateStatus(task.id, 'delivered')}
                          className="px-3 py-2 bg-[#00A86B] hover:bg-[#00965E] text-white text-xs font-bold rounded-xl shadow-sm flex-1"
                        >
                          🏁 Confirm Delivery at Shelter
                        </button>
                      )}
                      {task.status === 'delivered' && (
                        <span className="text-xs font-black text-[#00875A] dark:text-emerald-400">✓ Delivery Completed</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
