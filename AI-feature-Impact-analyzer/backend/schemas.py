from typing import List, Optional
from pydantic import BaseModel, Field

class FeatureMetrics(BaseModel):
    id: str
    name: str
    category: str = "Productivity" # e.g. Customer Support, Recommendations, Automation, Search, Analytics
    status: str = "Active" # Active, Beta, Deprecated, Planning
    users: int = Field(ge=0, description="Active users utilizing this AI feature")
    usage_frequency: float = Field(ge=0, description="Avg actions/queries per user per month")
    retention_rate: float = Field(ge=0, le=100, description="Customer retention rate (%)")
    time_saved_hours: float = Field(ge=0, description="Estimated total hours saved this month")
    ai_cost: float = Field(ge=0, description="Monthly AI operating cost ($) including compute/tokens")
    customer_satisfaction: float = Field(ge=0, le=5, description="CSAT score out of 5.0")
    revenue_impact: float = Field(ge=0, description="Estimated monthly revenue attributed ($)")
    launch_date: Optional[str] = "2024-01-15"
    notes: Optional[str] = ""

class ActionableRecommendation(BaseModel):
    category: str
    feature_name: str
    recommendation: str
    expected_impact: str
    priority: str # "High", "Medium", "Low"

class AIInsightsResponse(BaseModel):
    highest_value_feature: str
    highest_value_explanation: str
    loss_making_features: List[str]
    cost_vs_value_explanation: str
    features_to_improve: List[str]
    improvement_recommendations: str
    cost_reduction_strategies: List[str]
    retention_csat_actions: List[str]
    executive_summary: str
    recommendations: List[ActionableRecommendation]
    model_used: str
    source: str # "ollama" or "rule-based-fallback"
    processing_time_sec: float = 0.0

class AnalyzeRequest(BaseModel):
    features: List[FeatureMetrics]
    model_name: Optional[str] = None
    date_range: Optional[str] = "Last 30 Days"
    force_rules_only: Optional[bool] = False

class HealthResponse(BaseModel):
    status: str
    backend_version: str
    ollama_connected: bool
    ollama_url: str
    available_models: List[str]
    default_model: str

class ConnectionTestRequest(BaseModel):
    base_url: str
    model_name: Optional[str] = None

class ConnectionTestResponse(BaseModel):
    success: bool
    base_url: str
    model_requested: Optional[str] = None
    model_found: bool = False
    available_models: List[str] = []
    latency_ms: float = 0.0
    message: str

class ConfigUpdateRequest(BaseModel):
    ollama_base_url: Optional[str] = None
    ollama_model: Optional[str] = None

class ProductFeatureInput(BaseModel):
    name: str
    monthly_cost: float
    attributed_revenue: float
    status: Optional[str] = "Scale"
    enabled: Optional[bool] = True

class ProductAuditRequest(BaseModel):
    product_name: str
    currency: Optional[str] = "$"
    features: List[ProductFeatureInput]

class ProductAuditResponse(BaseModel):
    flagship_feature: str
    primary_inefficiency: str
    immediate_decision: str
