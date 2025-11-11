from typing import List, Optional
from pydantic import BaseModel, Field


class UXChatRequest(BaseModel):
    """
    Request model for UX chat endpoint.
    
    User sends a question about generated UX insights.
    """
    
    question: str = Field(
        ...,
        min_length=3,
        max_length=500,
        description="User question about UX insights or metrics"
    )


class UXChatResponse(BaseModel):
    """
    Response model for UX chat endpoint.
    
    Contains AI-generated answer based on insights and metrics.
    """
    
    answer: str = Field(
        ...,
        description="AI response to user question"
    )
    used_insights: Optional[List[str]] = Field(
        default=None,
        description="IDs of insights referenced in the answer"
    )

