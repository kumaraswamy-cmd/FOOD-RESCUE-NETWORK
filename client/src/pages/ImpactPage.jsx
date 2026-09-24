import React, { useState, useEffect } from 'react';
import MapView from '../components/MapView';
import { i18nDict } from '../i18n';
import { apiFetch } from '../utils/api';

export default function ImpactPage({ lang }) {
  const t = i18nDict[lang] || i18nDict.en;

  const [stats, setStats] = useState({ totalDonations: 0, deliveredDonations: 0, totalMealsSaved: 0, kgRescued: 0, activeNgos: 0, activeVolunteers: 0, successRate: 0 });
  const [donations, setDonations] = useState([]);
  const [ngos, setNgos] = useState([]);

  useEffect(() => {
    apiFetch('/api/admin/stats')
      .then(data => data && data.stats && setStats(data.stats))
      .catch(() => {});

    apiFetch('/api/admin/all-donations')
      .then(data => data && data.donations && setDonations(data.donations))
      .catch(() => {});

    apiFetch('/api/ngos')
      .then(data => data && data.ngos && setNgos(data.ngos))
      .catch(() => {});
  }, []);

  const leaders = [
    { name: 'Royal Grand Palace Hall', meals: 680 },
    { name: 'Novotel Corporate Convention', meals: 490 },
    { name: 'Spice Garden Caterers', meals: 310 },
    { name: 'Green Leaf Function Hall', meals: 240 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-6 sm:p-8 mb-8 shadow-md">
        <h2 className="text-2xl sm:text-3xl font-extrabold">{t.impactTitle}</h2>
        <p className="text-emerald-100 text-sm mt-1 max-w-2xl">{t.impactSub}</p>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-emerald-950 p-6 rounded-2xl border border-gray-200 dark:border-emerald-900 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 text-3xl flex items-center justify-center">🍲</div>
          <div>
            <div className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats.totalMealsSaved}</div>
            <div className="text-xs text-gray-500 font-bold mt-1">{t.kpiMeals}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-emerald-950 p-6 rounded-2xl border border-gray-200 dark:border-emerald-900 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 text-3xl flex items-center justify-center">⚖️</div>
          <div>
            <div className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats.kgRescued} kg</div>
            <div className="text-xs text-gray-500 font-bold mt-1">{t.kpiKg}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-emerald-950 p-6 rounded-2xl border border-gray-200 dark:border-emerald-900 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 text-3xl flex items-center justify-center">🏛️</div>
          <div>
            <div className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats.activeNgos}</div>
            <div className="text-xs text-gray-500 font-bold mt-1">{t.kpiNgos}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-emerald-950 p-6 rounded-2xl border border-gray-200 dark:border-emerald-900 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 text-3xl flex items-center justify-center">🚴</div>
          <div>
            <div className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats.activeVolunteers}</div>
            <div className="text-xs text-gray-500 font-bold mt-1">{t.kpiVols}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Leaflet Map */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-emerald-950 rounded-2xl p-6 border border-gray-200 dark:border-emerald-900 shadow-sm">
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-4">
              🗺️ {t.mapHeading}
            </h3>
            <MapView donations={donations} ngos={ngos} />
          </div>
        </div>

        {/* Leaderboard */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-emerald-950 rounded-2xl p-6 border border-gray-200 dark:border-emerald-900 shadow-sm">
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-4">
              🏆 {t.leaderboardHeading}
            </h3>

            <div className="space-y-3">
              {leaders.map((l, idx) => (
                <div key={l.name} className="p-3.5 rounded-xl bg-gray-50 dark:bg-emerald-900/40 border border-gray-200 dark:border-emerald-800 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-gray-900 dark:text-emerald-100">{l.name}</span>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-600">{l.meals} Meals</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
