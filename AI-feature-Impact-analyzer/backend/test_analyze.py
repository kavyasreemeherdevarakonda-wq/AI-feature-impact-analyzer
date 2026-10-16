import asyncio
from services.ollama_service import analyze_with_ollama
from schemas import FeatureMetrics

async def main():
    sample_features = [
        FeatureMetrics(
            id="f1",
            name="AI Chatbot",
            category="Customer Support",
            status="High Performer",
            users=18400,
            usage_frequency=24.5,
            retention_rate=82.4,
            time_saved_hours=2850,
            ai_cost=3200,
            customer_satisfaction=4.7,
            revenue_impact=42000
        ),
        FeatureMetrics(
            id="f2",
            name="AI Invoice Extraction",
            category="Operations",
            status="Needs Attention",
            users=3100,
            usage_frequency=8.2,
            retention_rate=64.5,
            time_saved_hours=620,
            ai_cost=7500,
            customer_satisfaction=3.5,
            revenue_impact=5100
        )
    ]
    print("Testing analyze_with_ollama with gemma4:12b...")
    res = await analyze_with_ollama(sample_features, model_name="gemma4:12b")
    print("\n--- Analysis Result ---")
    print("Source:", res.source)
    print("Model:", res.model_used)
    print("Highest Value:", res.highest_value_feature)
    print("Loss-Making:", res.loss_making_features)
    print("Executive Summary:", res.executive_summary[:120], "...")
    print("Processing time:", res.processing_time_sec, "s")
    print("Recommendations count:", len(res.recommendations))

if __name__ == "__main__":
    asyncio.run(main())
