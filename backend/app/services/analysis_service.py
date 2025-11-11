import json
from pathlib import Path
from typing import Dict, Any

import pandas as pd

from app.services.mistral_client import MistralClient
from app.schemas.analysis import UXInsightsResponse, UXInsight, ComputedMetrics


class DatasetError(Exception):
    """Raised when dataset loading or validation fails."""
    pass


class AnalysisError(Exception):
    """Raised when analysis or LLM generation fails."""
    pass


def load_dataset(path: str) -> pd.DataFrame:
    """
    Load and validate the e-commerce dataset.
    
    Args:
        path: Path to the CSV file
        
    Returns:
        Validated pandas DataFrame
        
    Raises:
        DatasetError: If file is missing or has invalid structure
    """
    file_path = Path(path)
    
    if not file_path.exists():
        raise DatasetError(f"Dataset file not found: {path}")
    
    try:
        df = pd.read_csv(file_path)
    except Exception as e:
        raise DatasetError(f"Failed to read CSV file: {str(e)}")
    
    required_columns = [
        "Revenue", "BounceRates", "ExitRates", "PageValues",
        "Weekend", "Month", "VisitorType"
    ]
    
    missing_columns = [col for col in required_columns if col not in df.columns]
    if missing_columns:
        raise DatasetError(f"Missing required columns: {', '.join(missing_columns)}")
    
    return df


def compute_basic_metrics(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Calculate fundamental UX and conversion metrics.
    
    Args:
        df: DataFrame with e-commerce session data
        
    Returns:
        Dictionary with computed metrics (JSON-serializable)
    """
    total_sessions = len(df)
    
    revenue_column = df["Revenue"].astype(str).str.upper()
    conversions = (revenue_column == "TRUE").sum()
    conversion_rate = (conversions / total_sessions * 100) if total_sessions > 0 else 0.0
    
    avg_bounce_rate = df["BounceRates"].mean()
    avg_exit_rate = df["ExitRates"].mean()
    avg_page_value = df["PageValues"].mean()
    
    weekend_column = df["Weekend"].astype(str).str.upper()
    weekend_sessions = (weekend_column == "TRUE").sum()
    weekday_sessions = total_sessions - weekend_sessions
    
    weekend_conversions = df[weekend_column == "TRUE"]
    weekday_conversions = df[weekend_column == "FALSE"]
    
    weekend_conv_rate = (
        (weekend_conversions["Revenue"].astype(str).str.upper() == "TRUE").sum() 
        / len(weekend_conversions) * 100
    ) if len(weekend_conversions) > 0 else 0.0
    
    weekday_conv_rate = (
        (weekday_conversions["Revenue"].astype(str).str.upper() == "TRUE").sum() 
        / len(weekday_conversions) * 100
    ) if len(weekday_conversions) > 0 else 0.0
    
    visitor_type_conversion = {}
    for visitor_type in df["VisitorType"].unique():
        subset = df[df["VisitorType"] == visitor_type]
        visitor_conversions = (subset["Revenue"].astype(str).str.upper() == "TRUE").sum()
        visitor_rate = (visitor_conversions / len(subset) * 100) if len(subset) > 0 else 0.0
        visitor_type_conversion[str(visitor_type)] = {
            "sessions": int(len(subset)),
            "conversion_rate": round(visitor_rate, 2)
        }
    
    month_conversion = {}
    for month in df["Month"].unique():
        subset = df[df["Month"] == month]
        month_conversions = (subset["Revenue"].astype(str).str.upper() == "TRUE").sum()
        month_rate = (month_conversions / len(subset) * 100) if len(subset) > 0 else 0.0
        month_conversion[str(month)] = {
            "sessions": int(len(subset)),
            "conversions": int(month_conversions),
            "conversion_rate": round(month_rate, 2)
        }
    
    top_months = sorted(
        month_conversion.items(),
        key=lambda x: x[1]["conversion_rate"],
        reverse=True
    )[:3]
    
    return {
        "total_sessions": int(total_sessions),
        "total_conversions": int(conversions),
        "conversion_rate": round(conversion_rate, 2),
        "avg_bounce_rate": round(avg_bounce_rate, 4),
        "avg_exit_rate": round(avg_exit_rate, 4),
        "avg_page_value": round(avg_page_value, 2),
        "weekend_sessions": int(weekend_sessions),
        "weekday_sessions": int(weekday_sessions),
        "weekend_conversion_rate": round(weekend_conv_rate, 2),
        "weekday_conversion_rate": round(weekday_conv_rate, 2),
        "visitor_type_breakdown": visitor_type_conversion,
        "top_converting_months": [
            {"month": month, **stats} for month, stats in top_months
        ]
    }


def build_llm_context(df: pd.DataFrame, metrics: Dict[str, Any]) -> str:
    """
    Build structured context for LLM analysis.
    
    Converts dataset overview and computed metrics into a readable
    text format suitable for prompt injection.
    
    Args:
        df: Source DataFrame
        metrics: Pre-computed metrics dictionary
        
    Returns:
        Formatted context string in English
    """
    context_parts = [
        "Dataset Overview:",
        f"- Type: E-commerce user session data",
        f"- Total sessions: {metrics['total_sessions']:,}",
        f"- Data points per session: {len(df.columns)} attributes",
        "",
        "Key Performance Indicators:",
        f"- Overall conversion rate: {metrics['conversion_rate']}%",
        f"- Total conversions: {metrics['total_conversions']:,}",
        f"- Average bounce rate: {metrics['avg_bounce_rate']:.2%}",
        f"- Average exit rate: {metrics['avg_exit_rate']:.2%}",
        f"- Average page value: ${metrics['avg_page_value']:.2f}",
        "",
        "Temporal Patterns:",
        f"- Weekend sessions: {metrics['weekend_sessions']:,} ({metrics['weekend_conversion_rate']}% conversion)",
        f"- Weekday sessions: {metrics['weekday_sessions']:,} ({metrics['weekday_conversion_rate']}% conversion)",
        "",
        "Top Converting Months:",
    ]
    
    for item in metrics["top_converting_months"]:
        context_parts.append(
            f"  {item['month']}: {item['conversion_rate']}% "
            f"({item['conversions']} conversions from {item['sessions']} sessions)"
        )
    
    context_parts.extend([
        "",
        "Visitor Segmentation:"
    ])
    
    for visitor_type, stats in metrics["visitor_type_breakdown"].items():
        context_parts.append(
            f"  {visitor_type}: {stats['sessions']:,} sessions, "
            f"{stats['conversion_rate']}% conversion rate"
        )
    
    context_parts.extend([
        "",
        "Notable Observations:",
        f"- Bounce rate is {'high' if metrics['avg_bounce_rate'] > 0.05 else 'moderate'} "
        f"at {metrics['avg_bounce_rate']:.2%}",
        f"- Weekend vs weekday conversion differential: "
        f"{abs(metrics['weekend_conversion_rate'] - metrics['weekday_conversion_rate']):.2f} percentage points"
    ])
    
    return "\n".join(context_parts)


async def generate_ux_insights(
    mistral_client: MistralClient,
    df: pd.DataFrame,
    prompt_template: str
) -> UXInsightsResponse:
    """
    Generate structured UX insights using Mistral AI.
    
    Orchestrates data analysis, context building, and LLM invocation
    to produce actionable UX recommendations.
    
    Args:
        mistral_client: Configured Mistral API client
        df: E-commerce session DataFrame
        prompt_template: Template string with {context} placeholder
        
    Returns:
        Validated UXInsightsResponse with insights and metrics
        
    Raises:
        AnalysisError: If metrics computation or LLM generation fails
    """
    try:
        metrics_dict = compute_basic_metrics(df)
    except Exception as e:
        raise AnalysisError(f"Failed to compute metrics: {str(e)}")
    
    context = build_llm_context(df, metrics_dict)
    
    final_prompt = prompt_template.replace("{context}", context)
    
    try:
        raw_response = await mistral_client.generate_completion(
            prompt=final_prompt,
            temperature=0.2,
            max_tokens=1200
        )
    except Exception as e:
        raise AnalysisError(f"Mistral API call failed: {str(e)}")
    
    try:
        llm_output = json.loads(raw_response)
    except json.JSONDecodeError as e:
        raise AnalysisError(f"LLM returned invalid JSON: {str(e)}")
    
    try:
        insights_list = [UXInsight(**insight) for insight in llm_output.get("insights", [])]
        metrics_model = ComputedMetrics(**metrics_dict)
        
        response = UXInsightsResponse(
            summary=llm_output.get("summary", "No summary provided"),
            insights=insights_list,
            metrics=metrics_model
        )
        
        return response
    except Exception as e:
        raise AnalysisError(f"Failed to validate LLM output structure: {str(e)}")

