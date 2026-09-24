import React, { useState, useEffect } from 'react';
import StatusBadge from '../components/StatusBadge';
import { i18nDict } from '../i18n';

export default function VolunteerPage({ lang }) {
  const t = i18nDict[lang] || i18nDict.en;

  const [volunteer, setVolunteer] = useState({ id: 'VOL-001', name: 'Ramesh Kumar', phone: '9876543210' });
  const [openJobs, setOpenJobs] = useState([]);
  const [myTasks, setMyTasks] = useState([]);

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

  useEffect(() => {
    fetchOpenJobs();
    fetchMyTasks();
    const interval = setInterval(() => {
      fetchOpenJobs();
      fetchMyTasks();
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
        body: JSON.stringify({ donation_id: donationId, status, beneficiary_name: 'Children Shelter' })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Status updated to ${status}!`);
        fetchMyTasks();
      }
    } catch(e) {}
  };

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
                  <div key={j.id} className="p-4 rounded-xl bg-slate-50 dark:bg-[#0A1628] border border-slate-200/80 dark:border-navy-700 shadow-sm space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-black text-sm text-slate-900 dark:text-white">{j.food_type} ({j.quantity} Servings)</h4>
                      <StatusBadge status={j.status} />
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      📍 Pickup: <strong>{j.pickup_address}</strong> &rarr; Deliver to <strong>{j.ngo_name}</strong>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Donor Contact: {j.donor_name} ({j.donor_phone})
                    </div>
                    <button 
                      onClick={() => handleClaimJob(j.id)}
                      className="w-full mt-2 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl transition-colors shadow"
                    >
                      🛵 Accept Transport Delivery Job
                    </button>
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

                    <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      From: {task.donor_name} ({task.donor_phone}) &bull; Address: {task.pickup_address}
                    </div>

                    <div className="pt-2 flex gap-2">
                      {(task.status === 'volunteer_assigned' || task.status === 'accepted') && (
                        <button 
                          onClick={() => handleUpdateStatus(task.id, 'picked_up')}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm"
                        >
                          📦 Confirm Pickup at Venue
                        </button>
                      )}
                      {task.status === 'picked_up' && (
                        <button 
                          onClick={() => handleUpdateStatus(task.id, 'delivered')}
                          className="px-3 py-1.5 bg-[#00A86B] hover:bg-[#00965E] text-white text-xs font-bold rounded-lg shadow-sm"
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
