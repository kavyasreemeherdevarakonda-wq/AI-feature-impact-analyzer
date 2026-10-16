import React from 'react';
import { Plus } from 'lucide-react';
import { AIFeatureItem } from '../types';

interface FeatureHealthTableProps {
  features: AIFeatureItem[];
  currency: string;
  onToggleEnabled: (id: string) => void;
  onInspectFeature: (feature: AIFeatureItem) => void;
  onOpenAddFeature: () => void;
  onDeleteFeature: (id: string) => void;
}

export const FeatureHealthTable: React.FC<FeatureHealthTableProps> = ({
  features,
  currency,
  onToggleEnabled,
  onInspectFeature,
  onOpenAddFeature,
  onDeleteFeature
}) => {
  return (
    <div className="executive-card overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-6 border-b border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Feature Health & Unit Economics
          </h3>
          <p className="text-xs text-muted-slate mt-0.5">
            Individual AI feature margins, inference costs, and deployment status
          </p>
        </div>

        <button
          onClick={onOpenAddFeature}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-emerald text-surface-bg hover:bg-brand-emeraldLight transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Feature</span>
        </button>
      </div>

      {/* Table View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-bg text-muted-slate uppercase tracking-wider text-[11px] font-semibold border-b border-surface-border">
            <tr>
              <th scope="col" className="px-6 py-3.5">Feature Name</th>
              <th scope="col" className="px-6 py-3.5">Monthly Cost</th>
              <th scope="col" className="px-6 py-3.5">Attributed Revenue</th>
              <th scope="col" className="px-6 py-3.5">Net Margin</th>
              <th scope="col" className="px-6 py-3.5">Status</th>
              <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {features.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-muted-slate">
                  No AI features tracked yet for this product. Click "Add Feature" to begin.
                </td>
              </tr>
            ) : (
              features.map((feature) => {
                const net = feature.attributed_revenue - feature.monthly_cost;
                const isLoss = net < 0;

                return (
                  <tr 
                    key={feature.id}
                    className={`transition-colors hover:bg-surface-hover ${
                      !feature.enabled ? 'opacity-40 bg-surface-bg' : ''
                    }`}
                  >
                    {/* Feature Name */}
                    <td className="px-6 py-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <span>{feature.name}</span>
                        {!feature.enabled && (
                          <span className="text-[10px] text-muted-slate font-normal italic">
                            (Disabled)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Monthly Cost */}
                    <td className="px-6 py-4 font-mono text-white">
                      {currency}{feature.monthly_cost.toLocaleString()}
                    </td>

                    {/* Attributed Revenue */}
                    <td className="px-6 py-4 font-mono text-white">
                      {currency}{feature.attributed_revenue.toLocaleString()}
                    </td>

                    {/* Net Margin */}
                    <td className="px-6 py-4 font-mono font-bold">
                      <span className={net >= 0 ? 'text-brand-emerald' : 'text-alert-coral'}>
                        {net >= 0 ? `+${currency}${net.toLocaleString()}` : `-${currency}${Math.abs(net).toLocaleString()}`}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      {feature.status === 'Scale' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold bg-brand-emeraldBg text-brand-emerald border border-brand-emerald/20">
                          Scale
                        </span>
                      )}
                      {feature.status === 'Optimize' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold bg-surface-bg text-muted-slate border border-surface-border">
                          Optimize
                        </span>
                      )}
                      {feature.status === 'Action Needed' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold bg-alert-coralBg text-alert-coral border border-alert-coral/20">
                          Action Needed
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3 text-xs">
                        <button
                          onClick={() => onInspectFeature(feature)}
                          className="text-muted-slate hover:text-white font-medium transition-colors"
                        >
                          Inspect
                        </button>
                        <button
                          onClick={() => onToggleEnabled(feature.id)}
                          className={`font-medium transition-colors ${
                            feature.enabled 
                              ? 'text-muted-slate hover:text-alert-coral' 
                              : 'text-brand-emerald hover:text-brand-emeraldLight'
                          }`}
                        >
                          {feature.enabled ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => onDeleteFeature(feature.id)}
                          className="text-muted-slate hover:text-alert-coral transition-colors"
                          title="Delete feature"
                        >
                          ×
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
