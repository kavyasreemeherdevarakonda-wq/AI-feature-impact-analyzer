import React from 'react';
import { ProductKPIs } from '../types';

interface KPICardsProps {
  kpis: ProductKPIs;
  currency: string;
}

export const KPICards: React.FC<KPICardsProps> = ({ kpis, currency }) => {
  const isNetPositive = kpis.netMargin >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* 1. Net Commercial Margin */}
      <div className="executive-card p-6 flex flex-col justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-slate">
            Net Commercial Margin
          </span>
          <div className="pt-2 flex items-baseline gap-1">
            <span className={`text-3xl font-extrabold tracking-tight font-mono ${
              isNetPositive ? 'text-brand-emerald' : 'text-alert-coral'
            }`}>
              {isNetPositive ? `+${currency}${kpis.netMargin.toLocaleString()}` : `-${currency}${Math.abs(kpis.netMargin).toLocaleString()}`}
            </span>
            <span className="text-xs text-muted-slate font-medium">/mo</span>
          </div>
        </div>
        <p className="text-xs text-muted-slate mt-4 pt-3 border-t border-surface-borderSubtle">
          Net operating yield after LLM infrastructure costs
        </p>
      </div>

      {/* 2. Total Monthly Spend */}
      <div className="executive-card p-6 flex flex-col justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-slate">
            Total Monthly Spend
          </span>
          <div className="pt-2 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
              {currency}{kpis.totalSpend.toLocaleString()}
            </span>
            <span className="text-xs text-muted-slate font-medium">/mo</span>
          </div>
        </div>
        <p className="text-xs text-muted-slate mt-4 pt-3 border-t border-surface-borderSubtle">
          Direct model tokens, API billing & host compute
        </p>
      </div>

      {/* 3. Capital at Risk */}
      <div className="executive-card p-6 flex flex-col justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-slate">
            Capital at Risk
          </span>
          <div className="pt-2 flex items-baseline gap-1">
            <span className={`text-3xl font-extrabold tracking-tight font-mono ${
              kpis.capitalAtRisk > 0 ? 'text-alert-coral' : 'text-muted-slate'
            }`}>
              {currency}{kpis.capitalAtRisk.toLocaleString()}
            </span>
            <span className="text-xs text-muted-slate font-medium">/mo</span>
          </div>
        </div>
        <p className="text-xs text-muted-slate mt-4 pt-3 border-t border-surface-borderSubtle">
          {kpis.atRiskCount > 0 
            ? `Underperforming deficit across ${kpis.atRiskCount} feature(s)`
            : 'Zero capital at risk; all features are net-positive'}
        </p>
      </div>
    </div>
  );
};
