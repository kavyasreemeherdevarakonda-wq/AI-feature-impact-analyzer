import os
import time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import (
    FeatureMetrics, 
    AnalyzeRequest, 
    AIInsightsResponse, 
    HealthResponse,
    ConnectionTestRequest,
    ConnectionTestResponse,
    ConfigUpdateRequest,
    ProductAuditRequest,
    ProductAuditResponse
)
import config
from services.ollama_service import check_ollama_health, analyze_with_ollama
from services.rules_engine import analyze_with_rules

app = FastAPI(
    title="AI Feature Impact Analyzer API",
    description="Backend service providing metrics analysis and Ollama Gemma model insights (local or second device)",
    version="1.0.0"
)

# Enable CORS for local Vite frontend (localhost:5173, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "app": "AI Feature Impact Analyzer API",
        "status": "online",
        "configured_base_url": config.get_ollama_base_url(),
        "configured_model": config.get_ollama_model(),
        "docs": "/docs"
    }

@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    current_url = config.get_ollama_base_url()
    current_model = config.get_ollama_model()
    ollama_ok, models = await check_ollama_health(current_url)
    return HealthResponse(
        status="healthy",
        backend_version="1.0.0",
        ollama_connected=ollama_ok,
        ollama_url=current_url,
        available_models=models,
        default_model=current_model
    )

@app.get("/api/models")
async def list_models():
    current_url = config.get_ollama_base_url()
    current_model = config.get_ollama_model()
    ollama_ok, models = await check_ollama_health(current_url)
    return {
        "ollama_connected": ollama_ok,
        "ollama_url": current_url,
        "default_model": current_model,
        "models": models
    }

@app.post("/api/test-connection", response_model=ConnectionTestResponse)
async def test_ollama_connection(req: ConnectionTestRequest):
    """Tests connectivity to a local or remote Ollama server (e.g. second device) and checks model availability."""
    target_url = req.base_url.strip().rstrip("/")
    target_model = (req.model_name or config.get_ollama_model()).strip()
    
    start = time.perf_counter()
    connected, available = await check_ollama_health(target_url)
    elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
    
    if not connected:
        return ConnectionTestResponse(
            success=False,
            base_url=target_url,
            model_requested=target_model,
            model_found=False,
            available_models=[],
            latency_ms=elapsed_ms,
            message=f"Failed to connect to Ollama at {target_url}. Check if the second device is powered on, port 11434 is open, and Ollama was started with OLLAMA_HOST=0.0.0.0."
        )

    model_found = target_model in available
    if not model_found and available:
        # Check partial match (e.g. gemma)
        matching = [m for m in available if target_model.lower() in m.lower() or "gemma" in m.lower()]
        if matching:
            model_found = True
            target_model = matching[0]

    msg = (
        f"Connected successfully to {target_url} in {elapsed_ms}ms! "
        f"Model '{target_model}' is available." if model_found else
        f"Connected to {target_url} in {elapsed_ms}ms, but '{target_model}' was not found in installed models: {available}."
    )

    return ConnectionTestResponse(
        success=True,
        base_url=target_url,
        model_requested=target_model,
        model_found=model_found,
        available_models=available,
        latency_ms=elapsed_ms,
        message=msg
    )

@app.post("/api/config")
async def update_config(payload: ConfigUpdateRequest):
    if payload.ollama_base_url:
        clean_url = payload.ollama_base_url.strip().rstrip("/")
        os.environ["OLLAMA_BASE_URL"] = clean_url
        config.OLLAMA_BASE_URL = clean_url
    if payload.ollama_model:
        clean_model = payload.ollama_model.strip()
        os.environ["OLLAMA_MODEL"] = clean_model
        config.OLLAMA_MODEL = clean_model
        config.DEFAULT_MODEL = clean_model
    
    return {
        "status": "updated",
        "ollama_base_url": config.get_ollama_base_url(),
        "ollama_model": config.get_ollama_model()
    }

@app.post("/api/analyze", response_model=AIInsightsResponse)
async def analyze_features(payload: AnalyzeRequest):
    if not payload.features:
        raise HTTPException(status_code=400, detail="At least one AI feature is required for analysis.")
    
    if payload.force_rules_only:
        return analyze_with_rules(payload.features, model_name="Rule-Based Engine (Forced)")

    target_model = payload.model_name or config.get_ollama_model()
    insights = await analyze_with_ollama(
        features=payload.features,
        model_name=target_model,
        date_range=payload.date_range
    )
    return insights

@app.post("/api/analyze/rules", response_model=AIInsightsResponse)
def analyze_features_rules_only(payload: AnalyzeRequest):
    if not payload.features:
        raise HTTPException(status_code=400, detail="At least one AI feature is required for analysis.")
    return analyze_with_rules(payload.features, model_name="Rule-Based Analytical Engine")

@app.post("/api/audit", response_model=ProductAuditResponse)
async def audit_product(payload: ProductAuditRequest):
    """Generates a concise 3-bullet executive audit for a specific product."""
    import json
    import httpx
    
    enabled_features = [f for f in payload.features if f.enabled]
    if not enabled_features:
        return ProductAuditResponse(
            flagship_feature="No active features",
            primary_inefficiency="No enabled AI capabilities to evaluate in this product portfolio.",
            immediate_decision="Add and enable your initial AI features to establish baseline unit economics."
        )

    curr = payload.currency or "$"
    scored = sorted(enabled_features, key=lambda f: f.attributed_revenue - f.monthly_cost, reverse=True)
    top_feature = scored[0]
    top_net = top_feature.attributed_revenue - top_feature.monthly_cost

    loss_makers = [f for f in enabled_features if f.monthly_cost > f.attributed_revenue]
    worst_feature = sorted(loss_makers, key=lambda f: f.monthly_cost - f.attributed_revenue, reverse=True)[0] if loss_makers else None

    # Deterministic high-precision bullet points
    flagship_text = f"{top_feature.name} generates {curr}{top_net:,.0f}/mo in net profit ({curr}{top_feature.attributed_revenue:,.0f} revenue vs {curr}{top_feature.monthly_cost:,.0f} cost)."
    
    if worst_feature:
        deficit = worst_feature.monthly_cost - worst_feature.attributed_revenue
        inefficiency_text = f"{worst_feature.name} burns {curr}{worst_feature.monthly_cost:,.0f}/mo against only {curr}{worst_feature.attributed_revenue:,.0f} revenue ({curr}{deficit:,.0f}/mo negative margin)."
        decision_text = f"Implement semantic prompt caching or gate {worst_feature.name} behind premium tiers to eliminate {curr}{deficit:,.0f}/mo in capital drain, while prioritizing {top_feature.name}."
    else:
        lowest_margin = scored[-1]
        lowest_net = lowest_margin.attributed_revenue - lowest_margin.monthly_cost
        inefficiency_text = f"All capabilities operate with positive returns. Lowest margin driver is {lowest_margin.name} ({curr}{lowest_net:,.0f}/mo net)."
        decision_text = f"Accelerate self-serve upgrade discovery for {top_feature.name} to capture expansion ARR momentum."

    # Attempt local Ollama generation with gemma4:12b
    try:
        url = config.get_ollama_base_url()
        target_model = config.get_ollama_model()
        summary_lines = [f"- {f.name}: Cost {curr}{f.monthly_cost:,.0f}/mo, Revenue {curr}{f.attributed_revenue:,.0f}/mo" for f in enabled_features]
        summary_str = "\n".join(summary_lines)
        
        prompt = f"""You are an executive commercial auditor. Review these AI features for product '{payload.product_name}':
{summary_str}

Do NOT think or output <thought> tags. Output only a valid raw JSON object with these 3 keys:
{{
  "flagship_feature": "<1 concise sentence highlighting top net profit driver>",
  "primary_inefficiency": "<1 concise sentence diagnosing the worst deficit feature>",
  "immediate_decision": "<1 actionable decision to execute this quarter>"
}}"""

        urls = [url]
        if "localhost" in url:
            urls.append(url.replace("localhost", "127.0.0.1"))
        elif "127.0.0.1" in url:
            urls.append(url.replace("127.0.0.1", "localhost"))

        timeout_val = float(config.REQUEST_TIMEOUT_SECONDS)
        for target_url in urls:
            try:
                async with httpx.AsyncClient(timeout=timeout_val) as client:
                    resp = await client.post(f"{target_url}/api/chat", json={
                        "model": target_model,
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are an executive ROI auditor. Do NOT think or reason. Do NOT output <thought>. Output raw valid JSON only, starting with {."
                            },
                            {"role": "user", "content": prompt}
                        ],
                        "stream": False,
                        "format": "json",
                        "options": {
                            "temperature": 0.1,
                            "num_predict": 250,
                            "num_ctx": 2048
                        }
                    })
                    if resp.status_code == 200:
                        data = resp.json()
                        msg = data.get("message", {})
                        raw = msg.get("content", "").strip() or msg.get("thinking", "").strip()
                        if raw.startswith("```"):
                            lines = [l for l in raw.splitlines() if not l.startswith("```")]
                            raw = "\n".join(lines).strip()
                        parsed = json.loads(raw)
                        return ProductAuditResponse(
                            flagship_feature=parsed.get("flagship_feature", flagship_text),
                            primary_inefficiency=parsed.get("primary_inefficiency", inefficiency_text),
                            immediate_decision=parsed.get("immediate_decision", decision_text)
                        )
            except Exception:
                continue
    except Exception as e:
        print(f"[Audit Endpoint] Ollama local inference note: {e}. Using deterministic synthesis.")

    return ProductAuditResponse(
        flagship_feature=flagship_text,
        primary_inefficiency=inefficiency_text,
        immediate_decision=decision_text
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=config.API_HOST, port=config.API_PORT, reload=True)
