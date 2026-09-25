import React, { useState, useEffect } from 'react';
import MapView from '../components/MapView';
import { i18nDict } from '../i18n';
import { apiFetch } from '../utils/api';
import IconBox from '../components/IconBox';
import { 
  Utensils, 
  Scale, 
  Building2, 
  Truck, 
  Compass, 
  Trophy 
} from 'lucide-react';

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
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-navy-700">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{t.impactTitle}</h2>
        <p className="text-slate-300 text-sm mt-1 max-w-2xl font-medium">{t.impactSub}</p>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#0D1E36] p-6 rounded-2xl border border-slate-200/80 dark:border-navy-700/80 shadow-sm flex items-center gap-4">
          <IconBox icon={Utensils} variant="emerald" size="lg" />
          <div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalMealsSaved}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">{t.kpiMeals}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D1E36] p-6 rounded-2xl border border-slate-200/80 dark:border-navy-700/80 shadow-sm flex items-center gap-4">
          <IconBox icon={Scale} variant="navy" size="lg" />
          <div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">{stats.kgRescued} kg</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">{t.kpiKg}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D1E36] p-6 rounded-2xl border border-slate-200/80 dark:border-navy-700/80 shadow-sm flex items-center gap-4">
          <IconBox icon={Building2} variant="blue" size="lg" />
          <div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">{stats.activeNgos}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">{t.kpiNgos}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D1E36] p-6 rounded-2xl border border-slate-200/80 dark:border-navy-700/80 shadow-sm flex items-center gap-4">
          <IconBox icon={Truck} variant="purple" size="lg" />
          <div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">{stats.activeVolunteers}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">{t.kpiVols}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Leaflet Map */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-[#0D1E36] rounded-2xl p-6 border border-slate-200/80 dark:border-navy-700/80 shadow-sm space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#00A86B]" />
              <span>{t.mapHeading}</span>
            </h3>
            <MapView donations={donations} ngos={ngos} />
          </div>
        </div>

        {/* Leaderboard */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-[#0D1E36] rounded-2xl p-6 border border-slate-200/80 dark:border-navy-700/80 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>{t.leaderboardHeading}</span>
            </h3>

            <div className="space-y-3">
              {leaders.map((l, idx) => (
                <div key={l.name} className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0A1628] border border-slate-200 dark:border-navy-700 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#00A86B] text-white font-extrabold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{l.name}</span>
                  </div>
                  <span className="text-xs font-black text-[#00A86B] dark:text-emerald-400">{l.meals} Meals</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

