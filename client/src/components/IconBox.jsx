import React from 'react';

/**
 * Standardized Vector Icon Container Component
 * Follows the Food Rescue Network visual design system:
 * - 2px stroke weight
 * - Consistent dimensions (sm: 32x32, md: 40x40, lg: 48x48, xl: 56x56)
 * - Brand navy / emerald / semantic color variants
 */
export default function IconBox({ 
  icon: Icon, 
  size = 'md', 
  variant = 'default', 
  className = '',
  iconClassName = '',
  strokeWidth = 2
}) {
  const sizeMap = {
    sm: { container: 'w-8 h-8 rounded-lg', iconSize: 16 },
    md: { container: 'w-10 h-10 rounded-xl', iconSize: 20 },
    lg: { container: 'w-12 h-12 rounded-2xl', iconSize: 24 },
    xl: { container: 'w-14 h-14 rounded-2xl', iconSize: 28 },
  };

  const variantMap = {
    default: 'bg-slate-100 dark:bg-[#0A1628] text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-navy-700',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/60 text-[#00A86B] dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60',
    blue: 'bg-blue-50 dark:bg-sky-950/60 text-blue-600 dark:text-sky-400 border border-blue-200/60 dark:border-navy-700',
    amber: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-navy-700',
    purple: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-navy-700',
    red: 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200/60 dark:border-navy-700',
    navy: 'bg-[#0D1E36] text-white border border-navy-700 shadow-sm',
    white: 'bg-white dark:bg-[#0A1628] text-slate-800 dark:text-white border border-slate-200 dark:border-navy-700 shadow-sm',
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const currentVariant = variantMap[variant] || variantMap.default;

  return (
    <div className={`inline-flex items-center justify-center flex-shrink-0 ${currentSize.container} ${currentVariant} ${className}`}>
      {Icon && <Icon size={currentSize.iconSize} strokeWidth={strokeWidth} className={iconClassName} />}
    </div>
  );
}
