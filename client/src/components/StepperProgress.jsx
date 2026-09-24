import React from 'react';

export default function StepperProgress({ status }) {
  const steps = ['posted', 'accepted', 'picked_up', 'delivered'];
  const labels = ['Posted', 'NGO Matched', 'Picked Up', 'Delivered'];

  const curIdx = steps.indexOf(
    status === 'volunteer_assigned' || status === 'ngo_notified' ? 'accepted' : status
  );

  let pct = 0;
  if (curIdx >= 0) pct = (curIdx / (steps.length - 1)) * 100;

  return (
    <div className="relative my-4">
      <div className="absolute top-4 left-6 right-6 h-1 bg-gray-200 -z-0">
        <div 
          className="h-full bg-emerald-600 transition-all duration-300" 
          style={{ width: `${pct}%` }} 
        />
      </div>

      <div className="flex justify-between items-center relative z-10">
        {steps.map((s, idx) => {
          const isDone = idx < curIdx;
          const isCurrent = idx === curIdx;

          return (
            <div key={s} className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                  isDone 
                    ? 'bg-emerald-600 border-emerald-600 text-white' 
                    : isCurrent 
                      ? 'bg-emerald-800 border-emerald-500 text-white ring-4 ring-emerald-100' 
                      : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {isDone ? '✓' : idx + 1}
              </div>
              <span className={`text-[11px] font-bold mt-1 ${isDone || isCurrent ? 'text-gray-900' : 'text-gray-400'}`}>
                {labels[idx]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
