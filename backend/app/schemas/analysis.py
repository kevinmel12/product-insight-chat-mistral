from typing import List, Dict, Any, Literal
from pydantic import BaseModel, Field


class UXInsight(BaseModel):
    """
    Single UX insight with evidence, hypothesis, and recommendation.
    
    Represents an actionable finding from LLM analysis of user behavior data.
    """
    
    id: str = Field(..., description="Unique identifier for this insight")
    title: str = Field(..., max_length=100, description="Clear, actionable title")
    severity: Literal["low", "medium", "high"] = Field(
        ..., 
        description="Impact level on conversion or user experience"
    )
    metric_evidence: str = Field(
        ..., 
        description="Quantitative data supporting this insight"
    )
    hypothesized_cause: str = Field(
        ..., 
        description="Probable UX or behavioral root cause"
    )
    recommendation: str = Field(
        ..., 
        description="Specific UI/UX action to address the issue"
    )
    target_segment: str = Field(
        ..., 
        description="User group most affected by this issue"
    )


class ComputedMetrics(BaseModel):
    """
    Raw metrics computed from the dataset before LLM analysis.
    
    Includes conversion rates, engagement indicators, and segmentation data.
    """
    
    total_sessions: int
    total_conversions: int
    conversion_rate: float
    avg_bounce_rate: float
    avg_exit_rate: float
    avg_page_value: float
    weekend_sessions: int
    weekday_sessions: int
    weekend_conversion_rate: float
    weekday_conversion_rate: float
    visitor_type_breakdown: Dict[str, Dict[str, Any]]
    top_converting_months: List[Dict[str, Any]]


class UXInsightsResponse(BaseModel):
    """
    Complete response from UX analysis endpoint.
    
    Contains LLM-generated insights with supporting metrics and executive summary.
    """
    
    summary: str = Field(
        ..., 
        description="Executive summary highlighting main opportunities"
    )
    insights: List[UXInsight] = Field(
        ..., 
        min_items=1,
        max_items=10,
        description="Prioritized list of UX insights"
    )
    metrics: ComputedMetrics = Field(
        ..., 
        description="Raw metrics used to generate insights"
    )


class AnalysisError(BaseModel):
    """Error response when analysis fails."""
    
    error: str = Field(..., description="Error type or category")
    detail: str = Field(..., description="Detailed error message")
    suggestion: str = Field(
        default="Verify dataset format and API configuration",
        description="Suggested resolution"
    )

