import httpx
from typing import Optional

from app.core.config import settings


class MistralClientError(Exception):
    """Raised when Mistral API returns an error or network issue occurs."""
    pass


class MistralClient:
    """
    Client for interacting with Mistral AI chat completion API.
    
    Handles HTTP communication, error management, and response parsing.
    Does not contain business logic or prompt engineering.
    """
    
    def __init__(
        self,
        api_key: str,
        model_id: str,
        base_url: str = "https://api.mistral.ai/v1"
    ):
        self.api_key = api_key
        self.model_id = model_id
        self.base_url = base_url.rstrip("/")
        self.endpoint = f"{self.base_url}/chat/completions"
        
    async def generate_completion(
        self,
        prompt: str,
        temperature: float = 0.2,
        max_tokens: int = 800
    ) -> str:
        """
        Generate a text completion from Mistral AI.
        
        Args:
            prompt: User or system message to send to the model
            temperature: Controls randomness (0.0 = deterministic, 1.0 = creative)
            max_tokens: Maximum tokens in the response
            
        Returns:
            The generated text content from the model
            
        Raises:
            MistralClientError: If the API returns an error or network fails
        """
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model_id,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.endpoint,
                    headers=headers,
                    json=payload
                )
                
                if response.status_code != 200:
                    error_detail = response.text
                    raise MistralClientError(
                        f"Mistral API error (status {response.status_code}): {error_detail}"
                    )
                
                data = response.json()
                return self._extract_content(data)
                
        except httpx.RequestError as e:
            raise MistralClientError(f"Network error while calling Mistral API: {str(e)}")
        except KeyError as e:
            raise MistralClientError(f"Unexpected response structure from Mistral API: missing {str(e)}")
    
    def _extract_content(self, response_data: dict) -> str:
        """
        Extract text content from Mistral API response structure.
        
        Expects: response_data["choices"][0]["message"]["content"]
        """
        return response_data["choices"][0]["message"]["content"]


def get_mistral_client() -> MistralClient:
    """
    Factory function to create a configured MistralClient instance.
    
    Uses application settings from environment variables.
    """
    return MistralClient(
        api_key=settings.mistral_api_key,
        model_id=settings.mistral_model_id,
        base_url=settings.mistral_base_url
    )

