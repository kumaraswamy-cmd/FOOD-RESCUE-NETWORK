import React from 'react';

export default function StatusBadge({ status }) {
  const badgeMap = {
    posted: { label: 'Pending', bg: 'bg-amber-100 text-amber-800' },
    ngo_notified: { label: 'Matching NGO', bg: 'bg-blue-100 text-blue-800' },
    accepted: { label: 'Accepted', bg: 'bg-teal-100 text-teal-800' },
    volunteer_assigned: { label: 'En-route', bg: 'bg-sky-100 text-sky-800' },
    picked_up: { label: 'In Transit', bg: 'bg-blue-100 text-blue-800' },
    delivered: { label: 'Delivered', bg: 'bg-[#E0F7ED] text-[#00875A]' },
    flagged_for_inspection: { label: 'Flagged Audit', bg: 'bg-rose-100 text-rose-800' },
    expired: { label: 'Expired', bg: 'bg-red-100 text-red-800' },
    rejected: { label: 'Declined', bg: 'bg-slate-100 text-slate-700' }
  };

  const info = badgeMap[status] || { label: status, bg: 'bg-slate-100 text-slate-800' };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold ${info.bg}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {info.label}
    </span>
  );
}
