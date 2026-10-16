import json
import time
import httpx
from typing import List, Optional, Tuple
from schemas import FeatureMetrics, AIInsightsResponse, ActionableRecommendation
from config import get_ollama_base_url, get_ollama_model, REQUEST_TIMEOUT_SECONDS
from services.rules_engine import analyze_with_rules

async def check_ollama_health(base_url: Optional[str] = None) -> Tuple[bool, List[str]]:
    """Checks if Ollama is running locally and retrieves list of installed models."""
    primary_url = (base_url or get_ollama_base_url()).rstrip("/")
    candidate_urls = [primary_url]
    if "localhost" in primary_url:
        candidate_urls.append(primary_url.replace("localhost", "127.0.0.1"))
    elif "127.0.0.1" in primary_url:
        candidate_urls.append(primary_url.replace("127.0.0.1", "localhost"))

    for url in candidate_urls:
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                resp = await client.get(f"{url}/api/tags")
                if resp.status_code == 200:
                    data = resp.json()
                    models = [m.get("name", "") for m in data.get("models", []) if "name" in m]
                    return True, models
        except Exception:
            continue
    return False, []

async def analyze_with_ollama(
    features: List[FeatureMetrics],
    model_name: Optional[str] = None,
    base_url: Optional[str] = None,
    date_range: Optional[str] = "Last 30 Days"
) -> AIInsightsResponse:
    start_time = time.time()
    url = (base_url or get_ollama_base_url()).rstrip("/")
    configured_model = get_ollama_model()
    target_model = model_name or configured_model
    
    # 1. Quick check if Ollama is available
    is_connected, available_models = await check_ollama_health(url)
    if not is_connected:
        print(f"[Ollama] Ollama server is offline or unreachable at {url}. Falling back to Rule-Based Engine.")
        fallback = analyze_with_rules(features, model_name=f"Rule-Based Engine (Ollama Offline at {url})")
        fallback.source = "rule-based-fallback"
        return fallback

    # Check if the requested model is present in available models
    if available_models:
        if target_model not in available_models:
            # Check if any model contains target name or 'gemma'
            matching = [m for m in available_models if target_model.lower() in m.lower() or "gemma" in m.lower()]
            if matching:
                target_model = matching[0]
            else:
                target_model = available_models[0]

    # 2. Build feature summary for LLM prompt
    features_summary_list = []
    total_cost = 0
    total_revenue = 0
    total_time_saved = 0

    for f in features:
        total_cost += f.ai_cost
        total_revenue += f.revenue_impact
        total_time_saved += f.time_saved_hours
        net = f.revenue_impact - f.ai_cost
        features_summary_list.append(
            f"- {f.name} (Category: {f.category}, Status: {f.status}):\n"
            f"  Active Users: {f.users:,} | Frequency: {f.usage_frequency:.1f} actions/mo | "
            f"Retention: {f.retention_rate:.1f}% | CSAT: {f.customer_satisfaction:.1f}/5.0\n"
            f"  Monthly AI Cost: ${f.ai_cost:,.0f} | Revenue Impact: ${f.revenue_impact:,.0f} | "
            f"Net Value: ${net:,.0f} | Time Saved: {f.time_saved_hours:,.0f} hrs"
        )

    portfolio_text = "\n".join(features_summary_list)
    overall_net = total_revenue - total_cost

    prompt = f"""You are an executive AI Product Strategist and ROI Analyst.
Analyze the following portfolio of AI features for period '{date_range}'.

Portfolio Summary:
- Total AI Features: {len(features)}
- Total Monthly AI Operating Cost: ${total_cost:,.0f}
- Total Monthly Revenue Impact: ${total_revenue:,.0f}
- Net Monthly Margin: ${overall_net:,.0f}
- Total Time Saved for Customers: {total_time_saved:,.0f} hours

Feature Breakdown:
{portfolio_text}

Provide an in-depth impact analysis answering these 5 core questions:
1. Which AI feature provides the highest net commercial and customer value?
2. Which feature(s) cost more than the value/revenue they generate (loss-making)?
3. Which feature(s) have low adoption, low retention, or low CSAT and need improvement?
4. What concrete actions should the company take to reduce AI inference and compute costs?
5. What actions can improve customer satisfaction (CSAT) and retention?

YOU MUST RETURN ONLY A VALID RAW JSON OBJECT matching this exact schema (no markdown fences, no extra text):
{{
  "highest_value_feature": "<Name of top feature>",
  "highest_value_explanation": "<Detailed explanation of why it is the top driver>",
  "loss_making_features": ["<feature 1>", "<feature 2>"],
  "cost_vs_value_explanation": "<Analysis of features that burn cash vs their return>",
  "features_to_improve": ["<feature 1>", "<feature 2>"],
  "improvement_recommendations": "<Clear engineering and product steps to improve these features>",
  "cost_reduction_strategies": [
    "<Concrete cost saving strategy 1>",
    "<Concrete cost saving strategy 2>",
    "<Concrete cost saving strategy 3>"
  ],
  "retention_csat_actions": [
    "<Retention & CSAT action 1>",
    "<Retention & CSAT action 2>",
    "<Retention & CSAT action 3>"
  ],
  "executive_summary": "<2-3 sentence strategic executive summary>",
  "recommendations": [
    {{
      "category": "Cost Optimization",
      "feature_name": "<feature name>",
      "recommendation": "<actionable step>",
      "expected_impact": "<projected ROI or savings>",
      "priority": "High"
    }},
    {{
      "category": "High Value Scale",
      "feature_name": "<feature name>",
      "recommendation": "<actionable step>",
      "expected_impact": "<projected growth>",
      "priority": "High"
    }},
    {{
      "category": "Improvement",
      "feature_name": "<feature name>",
      "recommendation": "<actionable step>",
      "expected_impact": "<projected CSAT boost>",
      "priority": "Medium"
    }}
  ]
}}
"""

    try:
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT_SECONDS) as client:
            resp = await client.post(f"{url}/api/chat", json={
                "model": target_model,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are an executive AI ROI strategist. Do NOT think or reason. Do NOT output <thought>. Output raw valid JSON only, starting with {."
                    },
                    {"role": "user", "content": prompt}
                ],
                "stream": False,
                "format": "json",
                "options": {
                    "temperature": 0.1,
                    "num_ctx": 2048,
                    "num_predict": 750
                }
            })
            if resp.status_code == 200:
                result_json = resp.json()
                msg = result_json.get("message", {})
                raw_response = msg.get("content", "").strip() or msg.get("thinking", "").strip()
                
                # Clean any markdown if model enclosed in ```json
                if raw_response.startswith("```"):
                    lines = raw_response.splitlines()
                    if lines[0].startswith("```"):
                        lines = lines[1:]
                    if lines and lines[-1].strip().startswith("```"):
                        lines = lines[:-1]
                    raw_response = "\n".join(lines).strip()

                parsed = json.loads(raw_response)
                
                # Parse recommendations
                parsed_recs = []
                for r in parsed.get("recommendations", []):
                    parsed_recs.append(ActionableRecommendation(
                        category=r.get("category", "General"),
                        feature_name=r.get("feature_name", "AI Portfolio"),
                        recommendation=r.get("recommendation", ""),
                        expected_impact=r.get("expected_impact", ""),
                        priority=r.get("priority", "Medium")
                    ))

                elapsed = round(time.time() - start_time, 2)
                return AIInsightsResponse(
                    highest_value_feature=parsed.get("highest_value_feature", features[0].name),
                    highest_value_explanation=parsed.get("highest_value_explanation", ""),
                    loss_making_features=parsed.get("loss_making_features", []),
                    cost_vs_value_explanation=parsed.get("cost_vs_value_explanation", ""),
                    features_to_improve=parsed.get("features_to_improve", []),
                    improvement_recommendations=parsed.get("improvement_recommendations", ""),
                    cost_reduction_strategies=parsed.get("cost_reduction_strategies", []),
                    retention_csat_actions=parsed.get("retention_csat_actions", []),
                    executive_summary=parsed.get("executive_summary", ""),
                    recommendations=parsed_recs,
                    model_used=target_model,
                    source="ollama",
                    processing_time_sec=elapsed
                )
            else:
                print(f"[Ollama] Error response from {url}: {resp.status_code} - {resp.text}")
    except Exception as e:
        print(f"[Ollama API Exception at {url}]: {e}. Falling back to Rule-based Engine.")

    # Fallback to rules engine if model failed or errored
    fallback = analyze_with_rules(features, model_name=f"{target_model} (Rule Fallback)")
    fallback.processing_time_sec = round(time.time() - start_time, 2)
    return fallback
