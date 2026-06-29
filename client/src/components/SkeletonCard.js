import React from 'react';

// Single skeleton line
export const SkeletonLine = ({ className = '' }) => (
  <div className={`skeleton h-4 rounded ${className}`} />
);

// Stat card skeleton
export const SkeletonStatCard = () => (
  <div className="card flex-1 min-w-0 border-l-4 border-slate-200">
    <div className="flex items-start justify-between">
      <div className="flex-1 space-y-2">
        <SkeletonLine className="w-24 h-3" />
        <SkeletonLine className="w-32 h-7" />
        <SkeletonLine className="w-20 h-3" />
      </div>
      <div className="skeleton w-9 h-9 rounded-xl ml-4" />
    </div>
  </div>
);

// Table row skeleton
export const SkeletonTableRow = () => (
  <tr className="border-b border-slate-50">
    <td className="py-3.5 px-3">
      <div className="flex items-center gap-3">
        <div className="skeleton w-9 h-9 rounded-full flex-shrink-0" />
        <div className="space-y-1.5">
          <SkeletonLine className="w-28" />
          <SkeletonLine className="w-20 h-3" />
        </div>
      </div>
    </td>
    <td className="py-3.5 px-3"><SkeletonLine className="w-24" /></td>
    <td className="py-3.5 px-3"><SkeletonLine className="w-16 ml-auto" /></td>
    <td className="py-3.5 px-3"><SkeletonLine className="w-20 ml-auto" /></td>
  </tr>
);

// Customer card skeleton (mobile)
export const SkeletonCustomerCard = () => (
  <div className="card flex items-center gap-3 py-3.5 px-4">
    <div className="skeleton w-11 h-11 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <SkeletonLine className="w-32" />
      <SkeletonLine className="w-20 h-3" />
    </div>
    <div className="text-right space-y-1.5">
      <SkeletonLine className="w-16" />
      <SkeletonLine className="w-12 h-3" />
    </div>
  </div>
);

// Transaction row skeleton (mobile)
export const SkeletonTransactionCard = () => (
  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50">
    <div className="skeleton w-10 h-10 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-1.5">
      <SkeletonLine className="w-28" />
      <SkeletonLine className="w-20 h-3" />
    </div>
    <div className="text-right space-y-1.5">
      <SkeletonLine className="w-16" />
      <SkeletonLine className="w-14 h-3 ml-auto" />
    </div>
  </div>
);

// Generic card skeleton
export const SkeletonCard = ({ lines = 3 }) => (
  <div className="card space-y-3">
    {Array.from({ length: lines }).map((_, i) => (
      <SkeletonLine key={i} className={i === 0 ? 'w-2/3' : i % 2 === 0 ? 'w-full' : 'w-4/5'} />
    ))}
  </div>
);

export default SkeletonCard;
