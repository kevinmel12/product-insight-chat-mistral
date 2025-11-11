from pathlib import Path

from fastapi import APIRouter, HTTPException

from app.services.mistral_client import get_mistral_client, MistralClientError
from app.services.analysis_service import (
    load_dataset,
    generate_ux_insights,
    DatasetError,
    AnalysisError
)
from app.schemas.chat import UXChatRequest, UXChatResponse


router = APIRouter(tags=["Chat"])


DATASET_PATH = Path(__file__).resolve().parent.parent.parent.parent.parent / "datasets" / "online_shoppers_intention.csv"
ANALYSIS_PROMPT_PATH = Path(__file__).resolve().parent.parent.parent.parent.parent / "prompts" / "ux_analysis_prompt.md"
CHAT_PROMPT_PATH = Path(__file__).resolve().parent.parent.parent.parent.parent / "prompts" / "ux_chat_prompt.md"


def build_insights_context(insights_response) -> str:
    """
    Build a text context from UXInsightsResponse for chat prompt injection.
    
    Args:
        insights_response: UXInsightsResponse with insights and metrics
        
    Returns:
        Formatted string with summary, insights, and key metrics
    """
    context_parts = [
        "## Executive Summary",
        insights_response.summary,
        "",
        "## UX Insights",
        ""
    ]
    
    for insight in insights_response.insights:
        context_parts.extend([
            f"### {insight.title} (Severity: {insight.severity})",
            f"- **ID**: {insight.id}",
            f"- **Evidence**: {insight.metric_evidence}",
            f"- **Hypothesis**: {insight.hypothesized_cause}",
            f"- **Recommendation**: {insight.recommendation}",
            f"- **Target Segment**: {insight.target_segment}",
            ""
        ])
    
    context_parts.extend([
        "## Key Metrics",
        f"- Total Sessions: {insights_response.metrics.total_sessions:,}",
        f"- Total Conversions: {insights_response.metrics.total_conversions:,}",
        f"- Conversion Rate: {insights_response.metrics.conversion_rate}%",
        f"- Average Bounce Rate: {insights_response.metrics.avg_bounce_rate:.2%}",
        f"- Average Exit Rate: {insights_response.metrics.avg_exit_rate:.2%}",
        f"- Weekend Conversion Rate: {insights_response.metrics.weekend_conversion_rate}%",
        f"- Weekday Conversion Rate: {insights_response.metrics.weekday_conversion_rate}%",
        ""
    ])
    
    return "\n".join(context_parts)


@router.post("/chat", response_model=UXChatResponse)
async def chat_ux(request: UXChatRequest):
    """
    Answer user questions about UX insights using AI.
    
    Loads dataset insights and uses Mistral AI to provide contextual,
    evidence-based answers to user questions about UX analysis.
    
    Args:
        request: UXChatRequest with user question
        
    Returns:
        UXChatResponse with AI-generated answer
        
    Raises:
        HTTPException 500: Dataset or prompt loading error
        HTTPException 502: LLM service error
    """
    try:
        df = load_dataset(str(DATASET_PATH))
    except DatasetError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Dataset error: {str(e)}"
        )
    
    try:
        with open(ANALYSIS_PROMPT_PATH, "r", encoding="utf-8") as f:
            analysis_prompt = f.read()
    except FileNotFoundError:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis prompt not found: {ANALYSIS_PROMPT_PATH}"
        )
    
    try:
        with open(CHAT_PROMPT_PATH, "r", encoding="utf-8") as f:
            chat_prompt_template = f.read()
    except FileNotFoundError:
        raise HTTPException(
            status_code=500,
            detail=f"Chat prompt not found: {CHAT_PROMPT_PATH}"
        )
    
    mistral_client = get_mistral_client()
    
    try:
        insights = await generate_ux_insights(mistral_client, df, analysis_prompt)
    except (AnalysisError, MistralClientError) as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to generate insights: {str(e)}"
        )
    
    insights_context = build_insights_context(insights)
    
    final_prompt = chat_prompt_template.replace("{insights_context}", insights_context)
    final_prompt = final_prompt.replace("{user_question}", request.question)
    
    try:
        answer = await mistral_client.generate_completion(
            prompt=final_prompt,
            temperature=0.3,
            max_tokens=600
        )
    except MistralClientError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Chat completion failed: {str(e)}"
        )
    
    return UXChatResponse(
        answer=answer.strip(),
        used_insights=None
    )

