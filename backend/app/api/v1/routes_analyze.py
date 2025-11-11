from pathlib import Path

from fastapi import APIRouter, HTTPException

from app.services.mistral_client import get_mistral_client
from app.services.analysis_service import (
    load_dataset,
    generate_ux_insights,
    DatasetError,
    AnalysisError
)
from app.schemas.analysis import UXInsightsResponse


router = APIRouter(tags=["Analysis"])


DATASET_PATH = Path(__file__).resolve().parent.parent.parent.parent.parent / "datasets" / "online_shoppers_intention.csv"
PROMPT_PATH = Path(__file__).resolve().parent.parent.parent.parent.parent / "prompts" / "ux_analysis_prompt.md"


@router.get("/analyze", response_model=UXInsightsResponse)
async def analyze_ux():
    """
    Analyze e-commerce dataset and generate UX insights.
    
    Loads the local dataset, computes metrics, and uses Mistral AI
    to generate structured, actionable UX recommendations.
    
    Returns:
        UXInsightsResponse with insights, metrics, and executive summary
        
    Raises:
        HTTPException 500: Dataset loading or processing error
        HTTPException 502: LLM service error or invalid response
    """
    try:
        df = load_dataset(str(DATASET_PATH))
    except DatasetError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Dataset error: {str(e)}"
        )
    
    try:
        with open(PROMPT_PATH, "r", encoding="utf-8") as f:
            prompt_template = f.read()
    except FileNotFoundError:
        raise HTTPException(
            status_code=500,
            detail=f"Prompt template not found: {PROMPT_PATH}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load prompt template: {str(e)}"
        )
    
    mistral_client = get_mistral_client()
    
    try:
        insights = await generate_ux_insights(mistral_client, df, prompt_template)
        return insights
    except AnalysisError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Analysis service error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error during analysis: {str(e)}"
        )

