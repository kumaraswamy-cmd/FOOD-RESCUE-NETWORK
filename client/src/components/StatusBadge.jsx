import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  Truck, 
  PackageCheck, 
  AlertTriangle, 
  XCircle, 
  ShieldAlert, 
  Send 
} from 'lucide-react';

export default function StatusBadge({ status }) {
  const badgeMap = {
    posted: { label: 'Posted / Available', bg: 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60', icon: Clock },
    POSTED: { label: 'Posted / Available', bg: 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60', icon: Clock },
    AVAILABLE: { label: 'Posted / Available', bg: 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60', icon: Clock },
    ngo_notified: { label: 'Matching NGO', bg: 'bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60', icon: Send },
    accepted: { label: 'Accepted by NGO', bg: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60', icon: CheckCircle2 },
    NGO_ACCEPTED: { label: 'Accepted by NGO', bg: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60', icon: CheckCircle2 },
    volunteer_assigned: { label: 'Volunteer Dispatched', bg: 'bg-sky-100 dark:bg-sky-950/80 text-sky-900 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/60', icon: Truck },
    VOLUNTEER_DISPATCHED: { label: 'Volunteer Dispatched', bg: 'bg-sky-100 dark:bg-sky-950/80 text-sky-900 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/60', icon: Truck },
    OTP_VERIFIED: { label: 'Pickup Verified (In Transit)', bg: 'bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60', icon: PackageCheck },
    picked_up: { label: 'Picked Up (In Transit)', bg: 'bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60', icon: PackageCheck },
    IN_TRANSIT: { label: 'Picked Up (In Transit)', bg: 'bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60', icon: PackageCheck },
    delivered: { label: 'Delivered to Shelter', bg: 'bg-[#E0F7ED] dark:bg-emerald-950/80 text-[#00875A] dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/60', icon: CheckCircle2 },
    DELIVERED: { label: 'Delivered to Shelter', bg: 'bg-[#E0F7ED] dark:bg-emerald-950/80 text-[#00875A] dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/60', icon: CheckCircle2 },
    flagged: { label: 'Flagged Audit Queue', bg: 'bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60', icon: ShieldAlert },
    flagged_for_inspection: { label: 'Flagged Audit Queue', bg: 'bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60', icon: ShieldAlert },
    expired: { label: 'Expired Shelf-Life', bg: 'bg-red-100 dark:bg-red-950/80 text-red-900 dark:text-red-300 border border-red-200/60 dark:border-red-800/60', icon: AlertTriangle },
    rejected: { label: 'Declined / Rejected', bg: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-navy-700', icon: XCircle }
  };

  const info = badgeMap[status] || { label: status, bg: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-navy-700', icon: Clock };
  const IconComponent = info.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black shadow-xs ${info.bg}`}>
      <IconComponent size={13} strokeWidth={2.5} />
      <span>{info.label}</span>
    </span>
  );
}
