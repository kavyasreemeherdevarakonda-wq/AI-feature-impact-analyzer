import React from 'react';
import { Loader2 } from 'lucide-react';
import { ExecutiveAuditResult } from '../types';

interface StrategicAuditCardProps {
  audit: ExecutiveAuditResult | null;
  isLoading: boolean;
  onGenerateAudit: () => void;
  productName: string;
}

export const StrategicAuditCard: React.FC<StrategicAuditCardProps> = ({
  audit,
  isLoading,
  onGenerateAudit,
  productName
}) => {
  return (
    <div className="executive-card p-6 space-y-5">
      {/* Header & Single Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-borderSubtle pb-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Strategic Executive Audit
          </h2>
          <p className="text-xs text-muted-slate mt-0.5">
            Unit economic synthesis for {productName}
          </p>
        </div>

        <button
          onClick={onGenerateAudit}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-brand-emerald text-surface-bg hover:bg-brand-emeraldLight active:scale-[0.98] transition-all disabled:opacity-60 shadow-sm self-start sm:self-auto shrink-0"
        >
          {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>{isLoading ? 'Buffering Audit...' : 'Generate Strategic Audit'}</span>
        </button>
      </div>

      {/* 3 High-Impact Bullet Points */}
      {audit ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Flagship Feature */}
          <div className="p-4 rounded-lg bg-surface-bg border border-surface-border space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-emerald block">
              1. Flagship Feature
            </span>
            <p className="text-xs text-white leading-relaxed font-medium">
              {audit.flagshipFeature}
            </p>
          </div>

          {/* 2. Primary Inefficiency */}
          <div className="p-4 rounded-lg bg-surface-bg border border-surface-border space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-alert-coral block">
              2. Primary Inefficiency
            </span>
            <p className="text-xs text-white leading-relaxed font-medium">
              {audit.primaryInefficiency}
            </p>
          </div>

          {/* 3. Immediate Recommended Decision */}
          <div className="p-4 rounded-lg bg-surface-bg border border-surface-border space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white block">
              3. Immediate Recommended Decision
            </span>
            <p className="text-xs text-white leading-relaxed font-medium">
              {audit.immediateDecision}
            </p>
          </div>
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-muted-slate">
          Click <span className="text-brand-emerald font-semibold">Generate Strategic Audit</span> to analyze flagship margins and stem capital at risk.
        </div>
      )}
    </div>
  );
};
