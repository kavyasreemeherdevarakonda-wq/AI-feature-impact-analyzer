import React from 'react';
import { Plus } from 'lucide-react';
import { Product } from '../types';

interface ProductsSidebarProps {
  products: Product[];
  selectedProductId: string;
  onSelectProduct: (id: string) => void;
  onOpenAddProduct: () => void;
}

export const ProductsSidebar: React.FC<ProductsSidebarProps> = ({
  products,
  selectedProductId,
  onSelectProduct,
  onOpenAddProduct
}) => {
  return (
    <aside className="w-full lg:w-72 bg-surface-bg border-r border-surface-border p-5 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* Products Header */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-slate">
            Products Directory
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-card text-muted-slate border border-surface-border">
            {products.length} Products
          </span>
        </div>

        {/* Prominent + Add Product Button Styled with Emerald Accent */}
        <button
          onClick={onOpenAddProduct}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-bold bg-brand-emerald text-surface-bg hover:bg-brand-emeraldLight active:scale-[0.98] transition-all shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Product</span>
        </button>

        {/* Product Directory List */}
        <div className="space-y-2">
          {products.map((product) => {
            const isSelected = product.id === selectedProductId;
            const enabledFeatures = product.features.filter(f => f.enabled);
            const totalRev = enabledFeatures.reduce((acc, f) => acc + f.attributed_revenue, 0);
            const totalCost = enabledFeatures.reduce((acc, f) => acc + f.monthly_cost, 0);
            const net = totalRev - totalCost;

            return (
              <button
                key={product.id}
                onClick={() => onSelectProduct(product.id)}
                className={`w-full text-left p-3.5 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-surface-card border-brand-emerald text-white shadow-sm'
                    : 'bg-surface-bg hover:bg-surface-card border-surface-border text-muted-slate hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                    {product.name}
                  </span>
                  <span className={`text-[11px] font-mono font-semibold ${
                    net >= 0 ? 'text-brand-emerald' : 'text-alert-coral'
                  }`}>
                    {net >= 0 ? `+${product.currency}${Math.round(net / 1000)}k` : `-${product.currency}${Math.round(Math.abs(net) / 1000)}k`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-slate">
                  <span>{product.category}</span>
                  <span className="font-mono">{product.features.length} features</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-surface-border text-[11px] text-muted-slate flex items-center justify-between">
        <span>Portfolio Health Monitor</span>
        <span className="text-white font-mono font-semibold">Active</span>
      </div>
    </aside>
  );
};
