import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Product, AIFeatureItem } from '../types';
import { calculateFeatureStatus } from '../data/sampleData';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Product) => void;
}

interface InitialFeatureRow {
  name: string;
  monthly_cost: number;
  attributed_revenue: number;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct
}) => {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('B2B Enterprise SaaS');
  const [currency, setCurrency] = useState('$');
  const [featureRows, setFeatureRows] = useState<InitialFeatureRow[]>([
    { name: 'AI Smart Concierge', monthly_cost: 3500, attributed_revenue: 28000 }
  ]);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAddFeatureRow = () => {
    setFeatureRows(prev => [
      ...prev,
      { name: '', monthly_cost: 2000, attributed_revenue: 12000 }
    ]);
  };

  const handleRemoveFeatureRow = (index: number) => {
    if (featureRows.length === 1) return;
    setFeatureRows(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleFeatureRowChange = (index: number, field: keyof InitialFeatureRow, value: any) => {
    setFeatureRows(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) {
      setError('Product name is required.');
      return;
    }

    const createdFeatures: AIFeatureItem[] = featureRows
      .filter(f => f.name.trim().length > 0)
      .map((f, idx) => {
        const cost = Number(f.monthly_cost) || 0;
        const rev = Number(f.attributed_revenue) || 0;
        return {
          id: `feat-${Date.now()}-${idx}`,
          name: f.name.trim(),
          monthly_cost: cost,
          attributed_revenue: rev,
          status: calculateFeatureStatus(cost, rev),
          enabled: true,
          notes: 'Initial feature entry configured during product onboarding.'
        };
      });

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: productName.trim(),
      category: category.trim(),
      currency,
      features: createdFeatures,
      createdAt: new Date().toISOString().split('T')[0]
    };

    onAddProduct(newProduct);
    onClose();
    // Reset state
    setProductName('');
    setFeatureRows([{ name: 'AI Assistant', monthly_cost: 3000, attributed_revenue: 18000 }]);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-surface-card border border-surface-border rounded-xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-border bg-surface-bg">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Add New Product
            </h2>
            <p className="text-xs text-muted-slate mt-0.5">
              Create a dedicated portfolio view with initial AI features
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-alert-coralBg border border-alert-coral/30 text-alert-coral text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Product Name */}
            <div className="md:col-span-1">
              <label className="block text-white font-medium mb-1.5">
                Product Name *
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => {
                  setProductName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g. Mobile App Suite"
                className="w-full px-3 py-2 rounded-lg bg-surface-bg border border-surface-border text-white placeholder-muted-subtle focus:outline-none focus:border-brand-emerald"
              />
            </div>

            {/* Category / Industry */}
            <div className="md:col-span-1">
              <label className="block text-white font-medium mb-1.5">
                Industry / Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. B2B SaaS, Fintech"
                className="w-full px-3 py-2 rounded-lg bg-surface-bg border border-surface-border text-white placeholder-muted-subtle focus:outline-none focus:border-brand-emerald"
              />
            </div>

            {/* Operating Currency */}
            <div className="md:col-span-1">
              <label className="block text-white font-medium mb-1.5">
                Operating Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-bg border border-surface-border text-white focus:outline-none focus:border-brand-emerald cursor-pointer"
              >
                <option value="$">USD ($)</option>
                <option value="€">EUR (€)</option>
                <option value="£">GBP (£)</option>
                <option value="¥">JPY (¥)</option>
              </select>
            </div>
          </div>

          {/* Initial AI Features List */}
          <div className="pt-3 border-t border-surface-border space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">
                  Initial AI Features
                </span>
                <span className="text-[11px] text-muted-slate">
                  Feature name, monthly compute cost, and attributed revenue
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddFeatureRow}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-bg hover:bg-surface-hover text-brand-emerald border border-surface-border text-xs font-semibold"
              >
                <Plus className="w-3 h-3" />
                <span>Add Feature Row</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {featureRows.map((row, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-surface-bg border border-surface-border grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) => handleFeatureRowChange(idx, 'name', e.target.value)}
                      placeholder="e.g. AI Copilot"
                      className="w-full px-2.5 py-1.5 rounded bg-surface-card border border-surface-border text-white placeholder-muted-subtle focus:outline-none focus:border-brand-emerald"
                    />
                  </div>
                  <div className="col-span-3">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-slate font-mono">
                        {currency}
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={row.monthly_cost}
                        onChange={(e) => handleFeatureRowChange(idx, 'monthly_cost', Number(e.target.value))}
                        placeholder="Cost"
                        className="w-full pl-6 pr-2 py-1.5 rounded bg-surface-card border border-surface-border text-white focus:outline-none focus:border-brand-emerald font-mono"
                      />
                    </div>
                  </div>
                  <div className="col-span-3">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-slate font-mono">
                        {currency}
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={row.attributed_revenue}
                        onChange={(e) => handleFeatureRowChange(idx, 'attributed_revenue', Number(e.target.value))}
                        placeholder="Revenue"
                        className="w-full pl-6 pr-2 py-1.5 rounded bg-surface-card border border-surface-border text-white focus:outline-none focus:border-brand-emerald font-mono"
                      />
                    </div>
                  </div>
                  <div className="col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveFeatureRow(idx)}
                      disabled={featureRows.length === 1}
                      className="p-1 rounded text-muted-slate hover:text-alert-coral disabled:opacity-30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-muted-slate hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-bold bg-brand-emerald text-surface-bg hover:bg-brand-emeraldLight active:scale-[0.98] transition-all shadow-sm"
            >
              Create Product View
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
