import { AIFeatureItem, ExecutiveAuditResult, BackendHealth } from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000';

export async function checkBackendHealth(): Promise<BackendHealth> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend not reached directly, will use fallback:', err);
  }
  return {
    status: 'offline',
    backend_version: '1.0.0',
    ollama_connected: false,
    ollama_url: 'http://localhost:11434',
    available_models: [],
    default_model: 'gemma4:12b'
  };
}

export async function generateProductAudit(
  productName: string,
  currency: string,
  features: AIFeatureItem[]
): Promise<ExecutiveAuditResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_name: productName,
        currency,
        features: features.map(f => ({
          name: f.name,
          monthly_cost: f.monthly_cost,
          attributed_revenue: f.attributed_revenue,
          status: f.status,
          enabled: f.enabled
        }))
      }),
      // Allow up to 120s for local Ollama 12B generation on CPU/GPU
      signal: AbortSignal.timeout(120000)
    });
    if (res.ok) {
      const data = await res.json();
      return {
        flagshipFeature: data.flagship_feature,
        primaryInefficiency: data.primary_inefficiency,
        immediateDecision: data.immediate_decision,
        generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }
  } catch (e) {
    console.warn('Backend audit failed, using client fallback:', e);
  }
  return runClientProductAudit(productName, currency, features);
}

export function runClientProductAudit(
  productName: string,
  currency: string,
  features: AIFeatureItem[]
): ExecutiveAuditResult {
  const enabled = features.filter(f => f.enabled);
  if (!enabled.length) {
    return {
      flagshipFeature: "No active features configured.",
      primaryInefficiency: "No active AI capabilities to evaluate in this product.",
      immediateDecision: "Add or enable features to generate commercial metrics.",
      generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  }

  const sorted = [...enabled].sort((a, b) => (b.attributed_revenue - b.monthly_cost) - (a.attributed_revenue - a.monthly_cost));
  const top = sorted[0];
  const topMargin = top.attributed_revenue - top.monthly_cost;

  const lossMakers = enabled.filter(f => f.monthly_cost > f.attributed_revenue);
  const worst = lossMakers.length 
    ? [...lossMakers].sort((a, b) => (b.monthly_cost - b.attributed_revenue) - (a.monthly_cost - a.attributed_revenue))[0]
    : null;

  const flagshipFeature = `${top.name} delivers ${currency}${topMargin.toLocaleString()}/mo in net profit (${currency}${top.attributed_revenue.toLocaleString()} revenue vs ${currency}${top.monthly_cost.toLocaleString()} compute cost).`;

  let primaryInefficiency = "";
  let immediateDecision = "";

  if (worst) {
    const deficit = worst.monthly_cost - worst.attributed_revenue;
    primaryInefficiency = `${worst.name} burns ${currency}${worst.monthly_cost.toLocaleString()}/mo against only ${currency}${worst.attributed_revenue.toLocaleString()} in attributed revenue (${currency}${deficit.toLocaleString()}/mo negative margin).`;
    immediateDecision = `Refactor prompt pipeline and gate ${worst.name} behind premium tiers to eliminate ${currency}${deficit.toLocaleString()}/mo capital drain, while expanding onboarding for ${top.name}.`;
  } else {
    const lowest = sorted[sorted.length - 1];
    const lowestNet = lowest.attributed_revenue - lowest.monthly_cost;
    primaryInefficiency = `All features are profitable. Lowest net contribution is ${lowest.name} (${currency}${lowestNet.toLocaleString()}/mo).`;
    immediateDecision = `Accelerate promotion and self-serve upgrade discovery for ${top.name} to capture expansion ARR momentum.`;
  }

  return {
    flagshipFeature,
    primaryInefficiency,
    immediateDecision,
    generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}
