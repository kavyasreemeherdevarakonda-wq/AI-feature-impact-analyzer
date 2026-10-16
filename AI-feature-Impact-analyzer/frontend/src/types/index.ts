export type FeatureStatus = 'Scale' | 'Optimize' | 'Action Needed';

export interface AIFeatureItem {
  id: string;
  name: string;
  monthly_cost: number;
  attributed_revenue: number;
  status: FeatureStatus;
  enabled: boolean;
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  currency: string;
  features: AIFeatureItem[];
  createdAt: string;
}

export interface ProductKPIs {
  netMargin: number;
  totalSpend: number;
  capitalAtRisk: number;
  featuresCount: number;
  profitableCount: number;
  atRiskCount: number;
}

export interface ExecutiveAuditResult {
  flagshipFeature: string;
  primaryInefficiency: string;
  immediateDecision: string;
  generatedAt: string;
}

export interface BackendHealth {
  status: string;
  backend_version: string;
  ollama_connected: boolean;
  ollama_url: string;
  available_models: string[];
  default_model: string;
}
