import React from 'react';
import { EnrollmentStatusType } from '@/types';

interface StatusBadgeProps {
  status: EnrollmentStatusType;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<EnrollmentStatusType, string> = {
    ACTIVE: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/20',
    COMPLETED: 'bg-indigo-400/10 text-indigo-300 ring-indigo-400/20',
    WITHDRAWN: 'bg-amber-400/10 text-amber-300 ring-amber-400/20',
  };

  const labels: Record<EnrollmentStatusType, string> = {
    ACTIVE: 'Active',
    COMPLETED: 'Completed',
    WITHDRAWN: 'Withdrawn',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${
        styles[status] || 'bg-slate-700/40 text-slate-300 ring-slate-400/20'
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {labels[status] || status}
    </span>
  );
}