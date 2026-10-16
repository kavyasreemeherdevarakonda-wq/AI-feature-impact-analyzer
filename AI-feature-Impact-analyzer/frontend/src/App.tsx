import React, { useState, useEffect, useMemo } from 'react';
import { Product, AIFeatureItem, ProductKPIs, ExecutiveAuditResult } from './types';
import { INITIAL_PRODUCTS } from './data/sampleData';
import { generateProductAudit, runClientProductAudit } from './services/api';
import { Header } from './components/Header';
import { ProductsSidebar } from './components/ProductsSidebar';
import { KPICards } from './components/KPICards';
import { StrategicAuditCard } from './components/StrategicAuditCard';
import { FeatureHealthTable } from './components/FeatureHealthTable';
import { AddProductModal } from './components/AddProductModal';
import { AddFeatureModal } from './components/AddFeatureModal';
import { InspectFeatureModal } from './components/InspectFeatureModal';

const PRODUCTS_STORAGE_KEY = 'ai_feature_analyzer_products_v2';
const AUDITS_STORAGE_KEY = 'ai_feature_analyzer_audits_v2';

export function App() {
  // Products state with localStorage persistence
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load products from storage:', e);
    }
    return INITIAL_PRODUCTS;
  });

  const [selectedProductId, setSelectedProductId] = useState<string>(() => {
    return products[0]?.id || 'prod-1';
  });

  // Audits cache per product id
  const [audits, setAudits] = useState<Record<string, ExecutiveAuditResult>>(() => {
    try {
      const saved = localStorage.getItem(AUDITS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load audits from storage:', e);
    }
    return {};
  });

  // Modal States
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddFeatureOpen, setIsAddFeatureOpen] = useState(false);
  const [inspectingFeature, setInspectingFeature] = useState<AIFeatureItem | null>(null);
  const [isAuditLoading, setIsAuditLoading] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(AUDITS_STORAGE_KEY, JSON.stringify(audits));
  }, [audits]);

  // Active Product
  const activeProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId) || products[0] || null;
  }, [products, selectedProductId]);

  // Calculate 3 KPIs for active product
  const kpis: ProductKPIs = useMemo(() => {
    if (!activeProduct) {
      return {
        netMargin: 0,
        totalSpend: 0,
        capitalAtRisk: 0,
        featuresCount: 0,
        profitableCount: 0,
        atRiskCount: 0
      };
    }

    const enabled = activeProduct.features.filter(f => f.enabled);
    const totalSpend = enabled.reduce((acc, f) => acc + f.monthly_cost, 0);
    const totalRev = enabled.reduce((acc, f) => acc + f.attributed_revenue, 0);
    const netMargin = totalRev - totalSpend;

    // Capital at risk is the sum of deficits on loss-making features (cost > revenue)
    const atRiskFeatures = enabled.filter(f => f.monthly_cost > f.attributed_revenue);
    const capitalAtRisk = atRiskFeatures.reduce((acc, f) => acc + (f.monthly_cost - f.attributed_revenue), 0);
    const profitableCount = enabled.filter(f => f.attributed_revenue >= f.monthly_cost).length;

    return {
      netMargin,
      totalSpend,
      capitalAtRisk,
      featuresCount: enabled.length,
      profitableCount,
      atRiskCount: atRiskFeatures.length
    };
  }, [activeProduct]);

  // Handle Generating Strategic Audit
  const handleGenerateAudit = async () => {
    if (!activeProduct) return;
    setIsAuditLoading(true);
    try {
      const result = await generateProductAudit(
        activeProduct.name,
        activeProduct.currency,
        activeProduct.features
      );
      setAudits(prev => ({ ...prev, [activeProduct.id]: result }));
    } catch (err) {
      console.error('Audit failed, using fallback:', err);
      const fallback = runClientProductAudit(activeProduct.name, activeProduct.currency, activeProduct.features);
      setAudits(prev => ({ ...prev, [activeProduct.id]: fallback }));
    } finally {
      setIsAuditLoading(false);
    }
  };

  // Generate audit on product switch if not yet cached
  useEffect(() => {
    if (activeProduct && !audits[activeProduct.id]) {
      const initial = runClientProductAudit(activeProduct.name, activeProduct.currency, activeProduct.features);
      setAudits(prev => ({ ...prev, [activeProduct.id]: initial }));
    }
  }, [selectedProductId, activeProduct]);

  // Add Product handler
  const handleAddProduct = (newProduct: Product) => {
    setProducts(prev => [...prev, newProduct]);
    setSelectedProductId(newProduct.id);
  };

  // Add Feature to active product
  const handleAddFeature = (newFeature: AIFeatureItem) => {
    if (!activeProduct) return;
    setProducts(prev => prev.map(p => {
      if (p.id === activeProduct.id) {
        return {
          ...p,
          features: [...p.features, newFeature]
        };
      }
      return p;
    }));
  };

  // Toggle Feature Enabled/Disabled
  const handleToggleFeatureEnabled = (featureId: string) => {
    if (!activeProduct) return;
    setProducts(prev => prev.map(p => {
      if (p.id === activeProduct.id) {
        return {
          ...p,
          features: p.features.map(f => {
            if (f.id === featureId) {
              return { ...f, enabled: !f.enabled };
            }
            return f;
          })
        };
      }
      return p;
    }));
  };

  // Delete Feature
  const handleDeleteFeature = (featureId: string) => {
    if (!activeProduct) return;
    if (confirm('Delete this feature from the product?')) {
      setProducts(prev => prev.map(p => {
        if (p.id === activeProduct.id) {
          return {
            ...p,
            features: p.features.filter(f => f.id !== featureId)
          };
        }
        return p;
      }));
    }
  };

  // Delete Product
  const handleDeleteProduct = (productId: string) => {
    if (products.length <= 1) {
      alert('You must have at least one product in your portfolio.');
      return;
    }
    if (confirm(`Delete product "${activeProduct?.name}" and all its features?`)) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      const remaining = products.filter(p => p.id !== productId);
      if (remaining.length) {
        setSelectedProductId(remaining[0].id);
      }
    }
  };

  const activeAudit = activeProduct ? audits[activeProduct.id] || null : null;

  return (
    <div className="min-h-screen flex flex-col bg-surface-bg text-white font-sans selection:bg-brand-emerald selection:text-surface-bg">
      {/* 1. Clean Header & Branding (No badges, No model names) */}
      <Header />

      {/* Main Body with Left Multi-Product Directory */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* 3. Products Sidebar Directory */}
        <ProductsSidebar
          products={products}
          selectedProductId={selectedProductId}
          onSelectProduct={setSelectedProductId}
          onOpenAddProduct={() => setIsAddProductOpen(true)}
        />

        {/* 4. Minimalist Executive Dashboard (Per Selected Product) */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 overflow-hidden">
          {activeProduct ? (
            <>
              {/* Product Header Title & Meta */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">
                    {activeProduct.name}
                  </h2>
                  <p className="text-xs text-muted-slate mt-0.5">
                    {activeProduct.category} • Base Currency: {activeProduct.currency} • Tracking {activeProduct.features.length} AI Features
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsAddFeatureOpen(true)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-brand-emerald text-surface-bg hover:bg-brand-emeraldLight active:scale-[0.98] transition-all shadow-sm"
                  >
                    + Add Feature
                  </button>
                  {products.length > 1 && (
                    <button
                      onClick={() => handleDeleteProduct(activeProduct.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-slate hover:text-alert-coral border border-surface-border hover:border-alert-coral/30 transition-colors"
                      title="Delete this product"
                    >
                      Delete Product
                    </button>
                  )}
                </div>
              </div>

              {/* 4.1. ONLY 3 Top KPI Cards */}
              <KPICards kpis={kpis} currency={activeProduct.currency} />

              {/* 4.2. Strategic Executive Audit Card */}
              <StrategicAuditCard
                audit={activeAudit}
                isLoading={isAuditLoading}
                onGenerateAudit={handleGenerateAudit}
                productName={activeProduct.name}
              />

              {/* 4.3. ONE Simple Feature Health Table */}
              <FeatureHealthTable
                features={activeProduct.features}
                currency={activeProduct.currency}
                onToggleEnabled={handleToggleFeatureEnabled}
                onInspectFeature={setInspectingFeature}
                onOpenAddFeature={() => setIsAddFeatureOpen(true)}
                onDeleteFeature={handleDeleteFeature}
              />
            </>
          ) : (
            <div className="text-center py-20 text-muted-slate text-sm">
              No products found in portfolio. Click "Add Product" to create your first portfolio view.
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onAddProduct={handleAddProduct}
      />

      <AddFeatureModal
        isOpen={isAddFeatureOpen}
        onClose={() => setIsAddFeatureOpen(false)}
        currency={activeProduct?.currency || '$'}
        onAddFeature={handleAddFeature}
      />

      <InspectFeatureModal
        feature={inspectingFeature}
        currency={activeProduct?.currency || '$'}
        onClose={() => setInspectingFeature(null)}
        onToggleEnabled={handleToggleFeatureEnabled}
      />
    </div>
  );
}

export default App;
