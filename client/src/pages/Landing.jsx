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
  ArrowRight,
  Sparkles,
  CheckCircle2,
  BarChart3,
  User,
  Zap,
  KeyRound,
  Camera,
  MapPin,
  ChevronRight
} from 'lucide-react';

export default function Landing({ lang, user }) {
  const navigate = useNavigate();
  const t = i18nDict[lang] || i18nDict.en;

  const currentRole = user?.role || 'volunteer';
  const userName = user?.name || 'Rescue Partner';

  const roleConfigs = {
    donor: {
      title: 'Food Donor Workspace',
      subtitle: 'Post surplus food from events, restaurants & function halls before it spoils.',
      badge: 'Surplus Food Donor',
      icon: Building2,
      variant: 'emerald',
      path: '/donor',
      actionText: '+ Post Surplus Food Now',
      features: [
        { label: 'Instant NGO Alerting', icon: Zap },
        { label: '4-Digit Pickup OTP', icon: KeyRound },
        { label: 'Real-Time Status Track', icon: CheckCircle2 }
      ]
    },
    ngo: {
      title: 'NGO & Shelter Portal',
      subtitle: 'Browse matched surplus food posts, run FSSAI quality audits, and claim donations.',
      badge: 'Verified Shelter NGO',
      icon: HeartHandshake,
      variant: 'blue',
      path: '/ngo',
      actionText: 'Browse & Claim Surplus Food',
      features: [
        { label: 'FSSAI Safety Checklist', icon: CheckCircle2 },
        { label: 'Request Volunteer Transport', icon: Truck },
        { label: 'Live Location Pickup', icon: MapPin }
      ]
    },
    volunteer: {
      title: 'Volunteer Logistics Command',
      subtitle: 'Accept active food transport jobs, navigate to venues, verify OTPs, and deliver to shelters.',
      badge: 'Volunteer Logistics Hero',
      icon: Truck,
      variant: 'purple',
      path: '/volunteer',
      actionText: 'View Active Transport Jobs',
      features: [
        { label: 'Turn-by-Turn GPS Nav', icon: MapPin },
        { label: '4-Digit Pickup OTP Verify', icon: KeyRound },
        { label: 'Photo Proof Upload', icon: Camera }
      ]
    },
    admin: {
      title: 'Admin Operations & Governance',
      subtitle: 'Audit pending NGO registrations, review master surplus registry, and monitor system metrics.',
      badge: 'System Administrator',
      icon: ShieldCheck,
      variant: 'navy',
      path: '/admin',
      actionText: 'Open Governance Console',
      features: [
        { label: 'NGO Verification Queue', icon: CheckCircle2 },
        { label: 'Master Surplus Audit', icon: BarChart3 },
        { label: 'Platform Security Control', icon: ShieldCheck }
      ]
    }
  };

  const activeConfig = roleConfigs[currentRole] || roleConfigs.volunteer;

  const allRolesList = [
    { id: 'donor', name: 'Food Donor', path: '/donor', icon: Building2 },
    { id: 'ngo', name: 'Verified NGO', path: '/ngo', icon: HeartHandshake },
    { id: 'volunteer', name: 'Volunteer Logistics', path: '/volunteer', icon: Truck },
    { id: 'admin', name: 'Administrator', path: '/admin', icon: ShieldCheck }
  ];

  return (
    <div className="space-y-8 py-4 max-w-6xl mx-auto">
      {/* Dynamic Role Hero Header */}
      <div className="bg-gradient-to-r from-[#0D1E36] via-[#102A4C] to-[#0A1628] rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden border border-navy-700/80">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-[#00A86B]/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00A86B]/20 text-emerald-300 border border-[#00A86B]/40 text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>ACTIVE SESSION &bull; {activeConfig.badge}</span>
            </div>

            <div className="text-xs font-mono text-slate-300 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
              User ID: <span className="text-emerald-400 font-bold">{user?.id || 'FRN-HERO'}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Welcome back, <span className="text-[#00A86B] dark:text-emerald-400">{userName}</span>!
            </h1>
            <p className="text-sm sm:text-lg text-slate-300 max-w-2xl font-medium leading-relaxed">
              {activeConfig.subtitle}
            </p>
          </div>

          {/* Primary Action Button Bar */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={() => navigate(activeConfig.path)}
              className="px-6 py-3.5 rounded-2xl bg-[#00A86B] hover:bg-[#008f5a] text-white font-black text-sm tracking-wide shadow-lg hover:shadow-emerald-900/30 transition-all flex items-center gap-3 group"
            >
              <activeConfig.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>{activeConfig.actionText}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/impact')}
              className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/15 transition-all flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>View Community Impact</span>
            </button>
          </div>
        </div>
      </div>

      {/* Role Feature Cards & Workstation Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {activeConfig.features.map((feat, idx) => (
          <div 
            key={idx} 
            className="p-5 rounded-2xl bg-white dark:bg-[#0D1E36] border border-slate-200/80 dark:border-navy-700/80 shadow-sm flex items-center gap-4 hover:border-[#00A86B] dark:hover:border-[#00A86B] transition-colors"
          >
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-[#0A1628] text-[#00A86B] dark:text-emerald-400 border border-emerald-100 dark:border-navy-700">
              <feat.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Feature Ready</div>
              <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{feat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Real-Time Impact Metric Bar */}
      <div className="bg-white dark:bg-[#0D1E36] rounded-3xl p-8 border border-slate-200/80 dark:border-navy-700/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-navy-700">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Leaf className="w-5 h-5 text-[#00A86B]" />
              <span>Real-Time Rescue Network Impact</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Live metrics across donors, NGOs, volunteers, and shelters.
            </p>
          </div>
          
          <button 
            onClick={() => navigate('/impact')}
            className="text-xs font-black text-[#00A86B] dark:text-emerald-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Full Analytics Report</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0A1628] border border-slate-100 dark:border-navy-700">
            <div className="text-3xl font-black text-[#00A86B] dark:text-emerald-400">5,240+</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">Meals Saved</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0A1628] border border-slate-100 dark:border-navy-700">
            <div className="text-3xl font-black text-amber-600 dark:text-amber-400">2,096 kg</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">Food Waste Prevented</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0A1628] border border-slate-100 dark:border-navy-700">
            <div className="text-3xl font-black text-blue-600 dark:text-sky-400">4 Verified</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">NGO Partners</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0A1628] border border-slate-100 dark:border-navy-700">
            <div className="text-3xl font-black text-purple-600 dark:text-purple-400">98.6%</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">Delivery Success Rate</div>
          </div>
        </div>
      </div>

      {/* Secondary Context Shortcuts (Compact Footer) */}
      <div className="p-6 rounded-2xl bg-slate-100/70 dark:bg-[#0A1628]/60 border border-slate-200/60 dark:border-navy-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-black uppercase text-slate-600 dark:text-slate-300">
            Switch Workspace Context
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Authorized stakeholders can navigate directly between dedicated operational views.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {allRolesList.map((r) => {
            const isCurrent = r.id === currentRole;
            return (
              <button
                key={r.id}
                onClick={() => navigate(r.path)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isCurrent 
                    ? 'bg-[#00A86B] text-white shadow-sm' 
                    : 'bg-white dark:bg-[#0D1E36] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700 border border-slate-200 dark:border-navy-700'
                }`}
              >
                <r.icon className="w-3.5 h-3.5" />
                <span>{r.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
