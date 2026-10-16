import React, { useState } from 'react';
import { X } from 'lucide-react';
import { AIFeatureItem } from '../types';
import { calculateFeatureStatus } from '../data/sampleData';

interface AddFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: string;
  onAddFeature: (feature: AIFeatureItem) => void;
}

export const AddFeatureModal: React.FC<AddFeatureModalProps> = ({
  isOpen,
  onClose,
  currency,
  onAddFeature
}) => {
  const [name, setName] = useState('');
  const [cost, setCost] = useState<number>(3000);
  const [revenue, setRevenue] = useState<number>(25000);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Feature name is required.');
      return;
    }

    const costNum = Number(cost) || 0;
    const revNum = Number(revenue) || 0;

    const newFeature: AIFeatureItem = {
      id: `feat-${Date.now()}`,
      name: name.trim(),
      monthly_cost: costNum,
      attributed_revenue: revNum,
      status: calculateFeatureStatus(costNum, revNum),
      enabled: true,
      notes: notes.trim()
    };

    onAddFeature(newFeature);
    onClose();
    setName('');
    setCost(3000);
    setRevenue(25000);
    setNotes('');
    setError('');
  };

  const netPreview = (Number(revenue) || 0) - (Number(cost) || 0);
  const statusPreview = calculateFeatureStatus(Number(cost) || 0, Number(revenue) || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-surface-card border border-surface-border rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-border bg-surface-bg">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Add AI Feature
            </h2>
            <p className="text-xs text-muted-slate mt-0.5">
              Input monthly compute cost and attributed revenue
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-slate hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-alert-coralBg border border-alert-coral/30 text-alert-coral">
              {error}
            </div>
          )}

          <div>
            <label className="block text-white font-medium mb-1.5">
              Feature Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. AI Invoice Parser"
              className="w-full px-3 py-2 rounded-lg bg-surface-bg border border-surface-border text-white placeholder-muted-subtle focus:outline-none focus:border-brand-emerald"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-medium mb-1.5">
                Monthly AI Cost ({currency})
              </label>
              <input
                type="number"
                min="0"
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-surface-bg border border-surface-border text-white focus:outline-none focus:border-brand-emerald font-mono"
              />
            </div>
            <div>
              <label className="block text-white font-medium mb-1.5">
                Attributed Revenue ({currency})
              </label>
              <input
                type="number"
                min="0"
                value={revenue}
                onChange={(e) => setRevenue(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-surface-bg border border-surface-border text-white focus:outline-none focus:border-brand-emerald font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-white font-medium mb-1.5">
              Operational Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Uses vector embeddings; high user engagement."
              className="w-full px-3 py-2 rounded-lg bg-surface-bg border border-surface-border text-white placeholder-muted-subtle focus:outline-none focus:border-brand-emerald"
            />
          </div>

          {/* Real-time Economic Preview */}
          <div className="p-3.5 rounded-lg bg-surface-bg border border-surface-border flex items-center justify-between">
            <div>
              <span className="text-[11px] text-muted-slate block">Estimated Net Margin:</span>
              <span className={`text-sm font-bold font-mono ${netPreview >= 0 ? 'text-brand-emerald' : 'text-alert-coral'}`}>
                {netPreview >= 0 ? `+${currency}${netPreview.toLocaleString()}` : `-${currency}${Math.abs(netPreview).toLocaleString()}`}
                <span className="text-[11px] text-muted-slate font-normal ml-1">/mo</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-muted-slate block">Calculated Status:</span>
              <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${
                statusPreview === 'Scale'
                  ? 'bg-brand-emeraldBg text-brand-emerald border-brand-emerald/20'
                  : statusPreview === 'Action Needed'
                  ? 'bg-alert-coralBg text-alert-coral border-alert-coral/20'
                  : 'bg-surface-card text-muted-slate border-surface-border'
              }`}>
                {statusPreview}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-muted-slate hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-bold bg-brand-emerald text-surface-bg hover:bg-brand-emeraldLight active:scale-[0.98] transition-all"
            >
              Add Feature
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
