from typing import List
from schemas import FeatureMetrics, AIInsightsResponse, ActionableRecommendation

def analyze_with_rules(features: List[FeatureMetrics], model_name: str = "Rule-based Engine") -> AIInsightsResponse:
    if not features:
        return AIInsightsResponse(
            highest_value_feature="None",
            highest_value_explanation="No AI features provided for analysis.",
            loss_making_features=[],
            cost_vs_value_explanation="No data available.",
            features_to_improve=[],
            improvement_recommendations="Add AI features to begin evaluation.",
            cost_reduction_strategies=["Add AI features with token tracking and cost metrics."],
            retention_csat_actions=["Measure baseline customer engagement before and after AI adoption."],
            executive_summary="No features detected. Add AI features to analyze business impact and ROI.",
            recommendations=[],
            model_used=model_name,
            source="rule-based-fallback",
            processing_time_sec=0.01
        )

    # 1. Calculate Net Profit and ROI for each feature
    # Net ROI ($) = revenue_impact - ai_cost
    # ROI % = (revenue_impact - ai_cost) / ai_cost * 100 if ai_cost > 0
    # Cost per hour saved = ai_cost / time_saved_hours if time_saved_hours > 0
    
    scored_features = []
    loss_making = []
    features_to_improve = []
    recommendations: List[ActionableRecommendation] = []

    for f in features:
        net_value = f.revenue_impact - f.ai_cost
        cost_ratio = (f.revenue_impact / f.ai_cost) if f.ai_cost > 0 else (999.0 if f.revenue_impact > 0 else 1.0)
        cost_per_hour = (f.ai_cost / f.time_saved_hours) if f.time_saved_hours > 0 else 0
        scored_features.append({
            "feature": f,
            "net_value": net_value,
            "cost_ratio": cost_ratio,
            "cost_per_hour": cost_per_hour
        })

        # Identify loss-making features
        if f.ai_cost > f.revenue_impact:
            loss_making.append(f.name)
            deficit = f.ai_cost - f.revenue_impact
            recommendations.append(ActionableRecommendation(
                category="Cost Optimization",
                feature_name=f.name,
                recommendation=f"Implement semantic response caching and route simpler user intents to lightweight open-source models to reduce monthly spend by ~40-60%. Currently running at a ${deficit:,.0f}/mo deficit.",
                expected_impact=f"Turn negative margin into net-neutral or positive, saving up to ${deficit*0.6:,.0f}/mo.",
                priority="High"
            ))

        # Identify features to improve (low CSAT < 4.0 or low retention < 75% or low frequency < 10)
        needs_improvement = False
        reasons = []
        if f.customer_satisfaction < 4.0:
            needs_improvement = True
            reasons.append(f"low CSAT score ({f.customer_satisfaction:.1f}/5.0)")
        if f.retention_rate < 75.0:
            needs_improvement = True
            reasons.append(f"below-average retention ({f.retention_rate:.1f}%)")
        if f.usage_frequency < 8.0 and f.users > 200:
            needs_improvement = True
            reasons.append(f"infrequent monthly engagement ({f.usage_frequency:.1f} actions/user)")

        if needs_improvement:
            features_to_improve.append(f.name)
            recommendations.append(ActionableRecommendation(
                category="Improvement",
                feature_name=f.name,
                recommendation=f"Revamp workflow UX and latency: address {', '.join(reasons)}. Introduce streaming responses and contextual inline hints.",
                expected_impact=f"Projected +0.5 to +0.8 boost in CSAT and +12% retention among active users.",
                priority="Medium" if f.customer_satisfaction >= 3.6 else "High"
            ))

    # Sort features by highest net value
    scored_features.sort(key=lambda x: x["net_value"], reverse=True)
    top_feature_data = scored_features[0]
    top_feature = top_feature_data["feature"]
    
    highest_val_name = top_feature.name
    highest_val_expl = (
        f"'{top_feature.name}' generates the highest net commercial value at ${top_feature_data['net_value']:,.0f}/month "
        f"(${top_feature.revenue_impact:,.0f} revenue vs ${top_feature.ai_cost:,.0f} cost). "
        f"It maintains a {top_feature.retention_rate:.1f}% customer retention rate with {top_feature.time_saved_hours:,.0f} hours saved across {top_feature.users:,} active users."
    )

    # Cost vs Value explanation
    if loss_making:
        cost_vs_value_expl = (
            f"{len(loss_making)} feature(s) ({', '.join(loss_making)}) cost more in LLM compute and infrastructure "
            f"than the direct revenue attributed to them. Restructuring pricing tiers or gating access behind paid tiers is recommended."
        )
    else:
        cost_vs_value_expl = (
            "All tracked AI features are currently operating at a net positive commercial margin. "
            "Total revenue generation exceeds aggregate AI inference costs across the entire portfolio."
        )

    # Improvement recommendations
    if features_to_improve:
        improve_expl = (
            f"Focus engineering sprint on {', '.join(features_to_improve)}. Common friction points stem from prompt drift, "
            f"latency timeouts, or lack of personalization which suppress user satisfaction."
        )
    else:
        improve_expl = "All features are meeting standard quality thresholds (>4.0 CSAT and >75% retention). Focus on horizontal scaling."

    # General cost reduction strategies
    cost_reduction = [
        "Enable Prompt Caching: Leverage prefix caching to eliminate repeated system prompt token charges by up to 80%.",
        "Hybrid Model Routing: Route 60-70% of simple classification and extraction tasks to smaller local/edge models (e.g. Gemma 2B/9B) and reserve larger models for complex multi-step reasoning.",
        "Token Pruning & RAG Guardrails: Truncate unnecessary context histories and compress retrieved documents before passing them to the model context window.",
        "Batching Non-Realtime Workflows: Queue background summaries and batch recommendations during off-peak hours to take advantage of spot GPU pricing."
    ]

    # Retention and CSAT actions
    retention_actions = [
        "Incorporate Feedback Micro-surveys: Add simple thumbs-up/down buttons at the point of generation to catch hallucinations before users abandon the feature.",
        "Proactive Fallback & Latency Guard: Show instant speculative responses or skeletal loaders within 400ms to eliminate perception of sluggishness.",
        "Interactive AI Onboarding: Guide new users through high-impact 'quick win' templates during their first week to lock in long-term habit formation.",
        "Personalized Memory: Persist user preferences across sessions so the AI avoids asking repetitive clarifying questions."
    ]

    # Add a Scale recommendation for top feature
    recommendations.insert(0, ActionableRecommendation(
        category="High Value Scale",
        feature_name=top_feature.name,
        recommendation=f"Double down on marketing and onboarding visibility for '{top_feature.name}'. Feature it prominently on the product landing page and upgrade workflows.",
        expected_impact=f"Estimated additional $15,000 - $35,000 ARR with high customer adoption momentum.",
        priority="High"
    ))

    total_cost = sum(f.ai_cost for f in features)
    total_rev = sum(f.revenue_impact for f in features)
    portfolio_roi = ((total_rev - total_cost) / total_cost * 100) if total_cost > 0 else 0

    executive_summary = (
        f"The portfolio of {len(features)} AI features is generating ${total_rev:,.0f}/mo in revenue impact against ${total_cost:,.0f}/mo in AI operating cost "
        f"(Net Margin: +${(total_rev - total_cost):,.0f}/mo, Overall Portfolio ROI: {portfolio_roi:.0f}%). "
        f"'{highest_val_name}' is your primary growth engine, while {len(loss_making)} feature(s) need immediate cost optimization to prevent margin erosion."
    )

    return AIInsightsResponse(
        highest_value_feature=highest_val_name,
        highest_value_explanation=highest_val_expl,
        loss_making_features=loss_making,
        cost_vs_value_explanation=cost_vs_value_expl,
        features_to_improve=features_to_improve,
        improvement_recommendations=improve_expl,
        cost_reduction_strategies=cost_reduction,
        retention_csat_actions=retention_actions,
        executive_summary=executive_summary,
        recommendations=recommendations,
        model_used=model_name,
        source="rule-based-fallback",
        processing_time_sec=0.02
    )
