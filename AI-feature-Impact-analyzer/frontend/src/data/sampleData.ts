import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Core Web Platform',
    category: 'B2B Enterprise SaaS',
    currency: '$',
    createdAt: '2024-01-10',
    features: [
      {
        id: 'feat-101',
        name: 'AI Recommendation System',
        monthly_cost: 5400,
        attributed_revenue: 98000,
        status: 'Scale',
        enabled: true,
        notes: 'Primary revenue engine driving personalized cross-sells and dynamic product upgrades.'
      },
      {
        id: 'feat-102',
        name: 'AI Support Chatbot',
        monthly_cost: 3200,
        attributed_revenue: 42000,
        status: 'Scale',
        enabled: true,
        notes: 'Resolves 68% of support tickets autonomously, protecting expansion accounts.'
      },
      {
        id: 'feat-103',
        name: 'AI Writing Assistant',
        monthly_cost: 4100,
        attributed_revenue: 31500,
        status: 'Scale',
        enabled: true,
        notes: 'In-app copy and template generation with strong active user habituation.'
      },
      {
        id: 'feat-104',
        name: 'AI Semantic Search',
        monthly_cost: 4800,
        attributed_revenue: 8200,
        status: 'Optimize',
        enabled: true,
        notes: 'High vector database infrastructure cost with modest subscription attribution.'
      },
      {
        id: 'feat-105',
        name: 'AI Document & Invoice Extraction',
        monthly_cost: 7500,
        attributed_revenue: 5100,
        status: 'Action Needed',
        enabled: true,
        notes: 'Multimodal OCR compute cost exceeds attributed revenue by $2,400/mo. Needs immediate prompt batching or paywall gating.'
      }
    ]
  },
  {
    id: 'prod-2',
    name: 'Mobile App Suite',
    category: 'Mobile Applications',
    currency: '$',
    createdAt: '2024-03-15',
    features: [
      {
        id: 'feat-201',
        name: 'Contextual Smart Nudge Engine',
        monthly_cost: 2800,
        attributed_revenue: 19500,
        status: 'Scale',
        enabled: true,
        notes: 'Triggers relevant actions based on customer in-app telemetry.'
      },
      {
        id: 'feat-202',
        name: 'Smart Media Organizer',
        monthly_cost: 1200,
        attributed_revenue: 14000,
        status: 'Scale',
        enabled: true,
        notes: 'Lightweight on-device model with minimal server inference expense.'
      },
      {
        id: 'feat-203',
        name: 'AI Voice Support Agent',
        monthly_cost: 4200,
        attributed_revenue: 3900,
        status: 'Action Needed',
        enabled: true,
        notes: 'Operating at a $300/mo deficit with low mobile conversion.'
      },
      {
        id: 'feat-204',
        name: 'Automated Video Highlight Creator',
        monthly_cost: 6500,
        attributed_revenue: 4100,
        status: 'Action Needed',
        enabled: true,
        notes: 'GPU rendering overhead creates a $2,400/mo loss against freemium user tier.'
      }
    ]
  },
  {
    id: 'prod-3',
    name: 'Enterprise Data Engine',
    category: 'Data & Developer Tools',
    currency: '$',
    createdAt: '2024-05-01',
    features: [
      {
        id: 'feat-301',
        name: 'AI SQL Query Copilot',
        monthly_cost: 6200,
        attributed_revenue: 38000,
        status: 'Scale',
        enabled: true,
        notes: 'Highest valued engineering feature with 84% user satisfaction.'
      },
      {
        id: 'feat-302',
        name: 'Predictive Anomaly Detector',
        monthly_cost: 3500,
        attributed_revenue: 22000,
        status: 'Scale',
        enabled: true,
        notes: 'Monitors client database workloads and alerts on unexpected spikes.'
      },
      {
        id: 'feat-303',
        name: 'Automated Pipeline Healer',
        monthly_cost: 5800,
        attributed_revenue: 4200,
        status: 'Action Needed',
        enabled: true,
        notes: 'Frequent failed retry loops burn LLM tokens. Operating at a $1,600/mo loss.'
      }
    ]
  }
];

export function calculateFeatureStatus(cost: number, revenue: number): 'Scale' | 'Optimize' | 'Action Needed' {
  if (cost > revenue) return 'Action Needed';
  const margin = revenue - cost;
  if (margin >= 15000 || (cost > 0 && revenue / cost >= 2.5)) return 'Scale';
  return 'Optimize';
}
