# ProductInsightChat Backend API

FastAPI backend for InsightChat, a Mistral AI-powered UX analytics assistant.

## Architecture

```
backend/
├─ app/
│  ├─ main.py                    # FastAPI app entry point
│  ├─ core/
│  │  └─ config.py               # Settings & environment variables
│  ├─ api/
│  │  └─ v1/
│  │     ├─ routes_analyze.py    # GET /api/v1/analyze
│  │     └─ routes_chat.py       # POST /api/v1/chat
│  ├─ services/
│  │  ├─ mistral_client.py       # Mistral API wrapper
│  │  └─ analysis_service.py     # UX metrics & LLM orchestration
│  └─ schemas/
│     ├─ analysis.py             # Pydantic models for analysis
│     └─ chat.py                 # Pydantic models for chat
```

---

## Prerequisites

- Python 3.11+
- Mistral API key ([get one here](https://console.mistral.ai/))

---

## Setup

### 1. Install dependencies

```bash
pip install fastapi uvicorn httpx pydantic pydantic-settings python-dotenv pandas
```

### 2. Configure environment

Create a `.env` file **at the project root** (not inside `backend/`):

```bash
MISTRAL_API_KEY=your_api_key_here
MISTRAL_MODEL_ID=open-mixtral-8x7b
MISTRAL_BASE_URL=https://api.mistral.ai/v1
```

**Notes:**
- The backend will look for `.env` in the **parent directory** (project root).
- Default model is `open-mixtral-8x7b` (free tier).
- Other models: `mistral-small-latest`, `mistral-large-latest`, etc.

### 3. Run the server

From the `backend/` directory:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## API Endpoints

### Health Check

```http
GET /health
```

Returns:
```json
{
  "status": "healthy",
  "mistral_configured": true
}
```

---

### Generate UX Insights

```http
GET /api/v1/analyze
```

**Description:**  
Analyzes the e-commerce dataset (`datasets/online_shoppers_intention.csv`) and generates structured UX insights using Mistral AI.

**Response (200):**
```json
{
  "summary": "Executive summary of main UX opportunities...",
  "insights": [
    {
      "id": "insight_1",
      "title": "New visitors convert at nearly double the rate",
      "severity": "high",
      "metric_evidence": "New_Visitor: 24.91% vs Returning_Visitor: 13.93%",
      "hypothesized_cause": "Returning visitors may face friction...",
      "recommendation": "Implement a loyalty program...",
      "target_segment": "Returning_Visitor"
    }
  ],
  "metrics": {
    "total_sessions": 12330,
    "conversion_rate": 15.47,
    "avg_bounce_rate": 0.0222,
    "weekend_conversion_rate": 17.4,
    "weekday_conversion_rate": 14.89,
    "visitor_type_breakdown": { ... },
    "top_converting_months": [ ... ]
  }
}
```

**Errors:**
- `500`: Dataset or prompt file not found
- `502`: Mistral API error or invalid response

---

### Chat with UX Assistant

```http
POST /api/v1/chat
```

**Description:**  
Ask questions about the UX insights. The assistant will respond based on the analysis context.

**Request Body:**
```json
{
  "question": "Why do new visitors convert better than returning visitors?"
}
```

**Response (200):**
```json
{
  "answer": "New visitors convert at 24.91% compared to 13.93% for returning visitors because...",
  "used_insights": null
}
```

**Errors:**
- `500`: Dataset or prompt file not found
- `502`: Mistral API error or analysis generation failed

---

## Services

### `mistral_client.py`

Wrapper for Mistral AI API calls.

**Key features:**
- Async HTTP client (httpx)
- Error handling with `MistralClientError`
- Configurable temperature and max_tokens
- 30-second timeout

**Usage:**
```python
from app.services.mistral_client import get_mistral_client

client = get_mistral_client()
response = await client.generate_completion(
    prompt="Analyze this data...",
    temperature=0.2,
    max_tokens=800
)
```

---

### `analysis_service.py`

Core UX analytics logic.

**Functions:**
- `load_dataset(path)` → Loads and validates CSV
- `compute_basic_metrics(df)` → Calculates 12+ KPIs
- `build_llm_context(df, metrics)` → Formats data for LLM
- `generate_ux_insights(client, df, prompt)` → Full orchestration

**Metrics computed:**
- Conversion rates (overall, weekend vs weekday, by visitor type)
- Bounce & exit rates
- Average page value
- Top converting months
- Visitor segmentation breakdown

---

## Prompts

Prompts are stored in `/prompts/` at the project root for transparency and version control.

### `ux_analysis_prompt.md`

Instructs Mistral to generate structured JSON insights from analytics context.

**Output format:**
```json
{
  "summary": "3-5 sentence executive summary",
  "insights": [
    {
      "id": "insight_X",
      "title": "Clear, actionable title",
      "severity": "low | medium | high",
      "metric_evidence": "Specific numbers from data",
      "hypothesized_cause": "Probable UX cause",
      "recommendation": "Concrete UI/UX action",
      "target_segment": "Affected user group"
    }
  ]
}
```

### `ux_chat_prompt.md`

Guides the conversational assistant to answer questions based on generated insights.

**Guidelines:**
- Evidence-based responses only
- No hallucination or external benchmarks
- Cite specific metrics from insights
- Actionable, product-focused tone

---

## Configuration

### `core/config.py`

Uses Pydantic Settings to load environment variables.

**Required variables:**
- `MISTRAL_API_KEY` (str)
- `MISTRAL_MODEL_ID` (str, default: `open-mixtral-8x7b`)
- `MISTRAL_BASE_URL` (str, default: `https://api.mistral.ai/v1`)

**Path resolution:**
- The `.env` file is loaded from the **project root** (4 levels up from `config.py`)
- This allows running `uvicorn` from the `backend/` directory while reading `.env` from the root

---

## Dataset

**Default dataset:** `datasets/online_shoppers_intention.csv`

**Source:** Kaggle - Online Shoppers Purchasing Intention Dataset

**Stats:**
- 12,330 sessions
- 18 columns (Administrative, Informational, ProductRelated, BounceRates, ExitRates, PageValues, Month, OperatingSystems, Region, TrafficType, VisitorType, Weekend, Revenue, etc.)

**Required columns:**
- `Revenue` (boolean)
- `BounceRates` (float)
- `ExitRates` (float)
- `PageValues` (float)
- `Weekend` (boolean)
- `Month` (string)
- `VisitorType` (string)

---

## Error Handling

All errors return JSON with a `detail` field:

```json
{
  "detail": "Descriptive error message"
}
```

**HTTP status codes:**
- `500`: Internal server error (dataset, config, or prompt issues)
- `502`: Bad Gateway (Mistral API failure or invalid LLM response)

**Custom exceptions:**
- `DatasetError`: Raised when CSV is missing or invalid
- `AnalysisError`: Raised when metrics computation or LLM call fails
- `MistralClientError`: Raised on Mistral API errors

---

## Development

### Run with auto-reload

```bash
uvicorn app.main:app --reload
```

### Test endpoints

Use the interactive Swagger UI at `http://localhost:8000/docs` or:

```bash
# Test analyze endpoint
curl http://localhost:8000/api/v1/analyze

# Test chat endpoint
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "What are the top UX issues?"}'
```

---

## Testing

Unit tests are located in `app/tests/` (to be implemented).

Run tests with:
```bash
pytest
```

---

## Troubleshooting

### `Module not found: app.core.config`

Make sure you're running from the `backend/` directory:
```bash
cd backend
uvicorn app.main:app --reload
```

### `Mistral API error (status 429)`

The free tier has usage limits. Try:
- Using `open-mixtral-8x7b` (free tier model)
- Waiting a few minutes between requests
- Upgrading to a paid Mistral plan

### `Dataset file not found`

The dataset path is hardcoded in `routes_analyze.py`. Ensure:
- `datasets/online_shoppers_intention.csv` exists in the project root
- The path calculation in `routes_analyze.py` is correct

---

## Production Considerations

Before deploying to production:

1. **Add rate limiting** (e.g., slowapi)
2. **Add authentication** (API keys, JWT)
3. **Cache insights** (Redis, in-memory) to avoid regenerating on every chat request
4. **Add logging** (structured logs with Python's logging module)
5. **Add monitoring** (Sentry, DataDog, etc.)
6. **Use Gunicorn** with Uvicorn workers for better performance
7. **Containerize** with Docker
8. **Add tests** (pytest, coverage)

---

## License

This project is a demo/prototype. See main project LICENSE for details.

