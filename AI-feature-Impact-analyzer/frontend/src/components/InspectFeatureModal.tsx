import React from 'react';
import { X } from 'lucide-react';
import { AIFeatureItem } from '../types';

interface InspectFeatureModalProps {
  feature: AIFeatureItem | null;
  currency: string;
  onClose: () => void;
  onToggleEnabled: (id: string) => void;
}

export const InspectFeatureModal: React.FC<InspectFeatureModalProps> = ({
  feature,
  currency,
  onClose,
  onToggleEnabled
}) => {
  if (!feature) return null;

  const net = feature.attributed_revenue - feature.monthly_cost;
  const isLoss = net < 0;
  const roi = feature.monthly_cost > 0 
    ? ((feature.attributed_revenue - feature.monthly_cost) / feature.monthly_cost) * 100 
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-surface-card border border-surface-border rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-border bg-surface-bg">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">{feature.name}</h2>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                feature.status === 'Scale'
                  ? 'bg-brand-emeraldBg text-brand-emerald border-brand-emerald/20'
                  : feature.status === 'Action Needed'
                  ? 'bg-alert-coralBg text-alert-coral border-alert-coral/20'
                  : 'bg-surface-bg text-muted-slate border-surface-border'
              }`}>
                {feature.status}
              </span>
            </div>
            <p className="text-xs text-muted-slate mt-0.5">Feature Unit Economics & Health</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-slate hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* Main Net Margin Box */}
          <div className="p-4 rounded-lg bg-surface-bg border border-surface-border flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-slate block">
                Net Commercial Margin
              </span>
              <span className={`text-2xl font-extrabold font-mono ${net >= 0 ? 'text-brand-emerald' : 'text-alert-coral'}`}>
                {net >= 0 ? `+${currency}${net.toLocaleString()}` : `-${currency}${Math.abs(net).toLocaleString()}`}
                <span className="text-xs font-normal text-muted-slate ml-1">/mo</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-slate block">
                Feature ROI
              </span>
              <span className={`text-lg font-bold font-mono ${net >= 0 ? 'text-brand-emerald' : 'text-alert-coral'}`}>
                {roi > 0 ? `+${roi.toFixed(0)}%` : `${roi.toFixed(0)}%`}
              </span>
            </div>
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 rounded-lg bg-surface-bg border border-surface-border">
              <span className="text-[11px] text-muted-slate block">Monthly AI Cost</span>
              <span className="text-base font-bold text-white font-mono mt-1 block">
                {currency}{feature.monthly_cost.toLocaleString()}
              </span>
              <span className="text-[10px] text-muted-slate mt-0.5 block">Inference compute expense</span>
            </div>

            <div className="p-3.5 rounded-lg bg-surface-bg border border-surface-border">
              <span className="text-[11px] text-muted-slate block">Attributed Revenue</span>
              <span className="text-base font-bold text-white font-mono mt-1 block">
                {currency}{feature.attributed_revenue.toLocaleString()}
              </span>
              <span className="text-[10px] text-muted-slate mt-0.5 block">Monthly commercial yield</span>
            </div>
          </div>

          {/* Diagnosis & Operational Context */}
          <div className="p-4 rounded-lg bg-surface-bg border border-surface-border space-y-1.5">
            <span className="text-[11px] font-bold text-muted-slate uppercase tracking-wider block">
              Portfolio Diagnosis
            </span>
            <p className="text-xs text-white leading-relaxed font-medium">
              {feature.status === 'Scale' && 'This capability generates high commercial yield relative to infrastructure costs. Expand user onboarding and marketing.'}
              {feature.status === 'Optimize' && 'This capability is operating near break-even. Review prompt token length and cache static queries.'}
              {feature.status === 'Action Needed' && `This capability is operating at a ${currency}${Math.abs(net).toLocaleString()}/mo deficit. Refactor the prompt pipeline or gate behind premium subscriptions.`}
            </p>
            {feature.notes && (
              <p className="text-[11px] text-muted-slate pt-2 border-t border-surface-border">
                {feature.notes}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-surface-border">
            <button
              onClick={() => {
                onToggleEnabled(feature.id);
                onClose();
              }}
              className={`text-xs font-semibold px-3 py-1.5 rounded transition-colors ${
                feature.enabled 
                  ? 'bg-alert-coralBg text-alert-coral hover:bg-alert-coral/20' 
                  : 'bg-brand-emeraldBg text-brand-emerald hover:bg-brand-emerald/20'
              }`}
            >
              {feature.enabled ? 'Disable Feature' : 'Enable Feature'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-surface-border hover:bg-surface-borderSubtle text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
