import React from 'react';
import { useNavigate } from 'react-router-dom';
import { i18nDict } from '../i18n';
import IconBox from '../components/IconBox';
import { 
  Building2, 
  HeartHandshake, 
  Truck, 
  ShieldCheck, 
  Leaf, 
  ArrowRight 
} from 'lucide-react';

export default function Landing({ lang }) {
  const navigate = useNavigate();
  const t = i18nDict[lang] || i18nDict.en;

  const roles = [
    {
      id: 'donor',
      title: t.roleDonor,
      sub: t.roleDonorSub,
      icon: Building2,
      variant: 'emerald',
      badge: 'Post Food & Track',
      path: '/donor'
    },
    {
      id: 'ngo',
      title: t.roleNgo,
      sub: t.roleNgoSub,
      icon: HeartHandshake,
      variant: 'blue',
      badge: 'FSSAI Audit & Accept',
      path: '/ngo'
    },
    {
      id: 'volunteer',
      title: t.roleVolunteer,
      sub: t.roleVolunteerSub,
      icon: Truck,
      variant: 'purple',
      badge: 'Transport & Delivery',
      path: '/volunteer'
    },
    {
      id: 'admin',
      title: t.roleAdmin,
      sub: t.roleAdminSub,
      icon: ShieldCheck,
      variant: 'navy',
      badge: 'Verify NGOs & Governance',
      path: '/admin'
    }
  ];

  return (
    <div className="space-y-12 py-6">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E0F7ED] dark:bg-emerald-950/80 text-[#00A86B] dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800 text-xs font-black uppercase tracking-wider">
          <Leaf className="w-3.5 h-3.5" />
          <span>Enterprise Surplus Food Redistribution</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          {t.rolePickerTitle}
        </h1>
        
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
          {t.rolePickerSub}
        </p>
      </div>

      {/* Role Picker Grid (Dark Mode Polished Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {roles.map((r) => (
          <div 
            key={r.id} 
            onClick={() => navigate(r.path)}
            className="cursor-pointer rounded-2xl p-6 bg-white dark:bg-[#0D1E36] text-slate-900 dark:text-white border border-slate-200/80 dark:border-navy-700/80 hover:border-[#00A86B] dark:hover:border-[#00A86B] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="mb-4">
                <IconBox icon={r.icon} variant={r.variant} size="lg" />
              </div>
              <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#0A1628] text-[#00A86B] dark:text-emerald-400 mb-2 border border-slate-200/40 dark:border-navy-700">
                {r.badge}
              </span>
              <h3 className="text-xl font-black mb-2 text-slate-900 dark:text-white">{r.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-300 font-medium leading-relaxed">{r.sub}</p>
            </div>

            <button className="mt-6 w-full py-3 px-4 rounded-xl bg-[#0D1E36] dark:bg-[#0A1628] text-white hover:bg-[#00A86B] dark:hover:bg-[#00A86B] border border-transparent dark:border-navy-700 font-extrabold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm">
              <span>Select Role</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Quick Stats Preview */}
      <div className="bg-white dark:bg-[#0D1E36] rounded-2xl p-8 border border-slate-200/80 dark:border-navy-700/80 shadow-sm text-center">
        <h2 className="text-base font-black text-slate-900 dark:text-white mb-6 uppercase tracking-wide">
          Real-Time Rescue Network Impact Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0A1628] border border-slate-100 dark:border-navy-700">
            <div className="text-3xl font-black text-[#00A86B] dark:text-emerald-400">5,240+</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">Meals Saved</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0A1628] border border-slate-100 dark:border-navy-700">
            <div className="text-3xl font-black text-amber-600 dark:text-amber-400">2,096 kg</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">Food Waste Prevented</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0A1628] border border-slate-100 dark:border-navy-700">
            <div className="text-3xl font-black text-blue-600 dark:text-sky-400">4 Verified</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">NGO Partners</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0A1628] border border-slate-100 dark:border-navy-700">
            <div className="text-3xl font-black text-purple-600 dark:text-purple-400">98.6%</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">Delivery Success Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}

