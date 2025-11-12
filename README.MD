# ProductInsightChat – Mistral-powered UX Analytics Assistant

ProductInsightChat is a full-stack demo application built with Mistral AI models.

It ingests user behavior datasets (e.g. clickstream, sessions, conversions), generates UX insights, and lets users **chat with an AI** to explore issues, hypotheses, and recommended UI/UX improvements.

This project is designed as:
- A **practical showcase** of how to use Mistral models in a real product.
- A **developer-friendly codebase**: clear structure, typed API, simple setup.
- A **foundation** that can be extended into a production-grade UX optimization tool.

---

## Features

- Upload or use a sample dataset of user behavior.
- Backend service (FastAPI) to:
  - Parse and validate the dataset.
  - Build a structured analytical context.
  - Call Mistral AI to generate UX insights.
- Frontend (Next.js + TypeScript + shadcn/ui) to:
  - Display insight cards (issues, metrics, impact).
  - Provide a **chat interface** to ask questions like:
    - _"Why is conversion lower on mobile?"_
    - _"What are the top 3 friction points by step?"_
- Clean separation between:
  - Data processing
  - LLM prompts
  - API client
  - UI components

---

## Tech Stack

**Backend**

- Python
- FastAPI
- Pydantic
- HTTP client for Mistral AI API

**Frontend**

- Next.js (App Router)
- TypeScript
- shadcn/ui
- Minimal API client for the backend

**Other**

- Docker / docker-compose (optional, for unified local run)
- Sample datasets (CSV)
- Versioned prompts (`/prompts`) for transparency

---

## Project Structure

```bash
insightchat-mistral/
├─ README.md
├─ .gitignore
├─ .env.example
│
├─ backend/
│  ├─ pyproject.toml or requirements.txt
│  └─ app/
│     ├─ main.py
│     ├─ core/
│     │  └─ config.py
│     ├─ api/
│     │  └─ v1/
│     │     ├─ routes_analyze.py
│     │     └─ routes_chat.py
│     ├─ services/
│     │  ├─ mistral_client.py
│     │  ├─ analysis_service.py
│     │  └─ dataset_loader.py
│     ├─ schemas/
│     │  ├─ analysis.py
│     │  └─ chat.py
│     └─ tests/
│        └─ test_analyze.py
│
├─ frontend/
│  ├─ package.json
│  ├─ next.config.mjs
│  ├─ tsconfig.json
│  ├─ tailwind.config.ts
│  ├─ postcss.config.js
│  ├─ app/
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │  └─ globals.css
│  ├─ components/
│  │  ├─ analysis/
│  │  │  ├─ InsightsGrid.tsx
│  │  │  ├─ InsightsSummary.tsx
│  │  │  └─ RunAnalysisHero.tsx
│  │  ├─ chat/
│  │  │  └─ ChatPanel.tsx
│  │  ├─ insights/
│  │  │  └─ InsightCard.tsx
│  │  ├─ layout/
│  │  │  └─ DashboardShell.tsx
│  │  └─ ui/
│  │     ├─ button.tsx
│  │     ├─ card.tsx
│  │     ├─ input.tsx
│  │     ├─ badge.tsx
│  │     ├─ separator.tsx
│  │     ├─ skeleton.tsx
│  │     └─ scroll-area.tsx
│  └─ lib/
│     ├─ api-client.ts
│     ├─ types.ts
│     └─ utils.ts
│
├─ prompts/
│  ├─ ux_analysis_prompt.md
│  └─ ux_chat_prompt.md
│
└─ datasets/
   └─ sample_clickstream.csv
````

---

## Setup

### 1. Environment variables

Create a `.env` file at the project root:

```bash
MISTRAL_API_KEY=your_api_key_here
MISTRAL_MODEL_ID=open-mixtral-8x7b
```

**Note:**
- Do **not** commit your real API key.
- You can change the Mistral model by updating `MISTRAL_MODEL_ID` (e.g., `mistral-small-latest`, `mistral-large-latest`).
- The default dataset is `datasets/online_shoppers_intention.csv` (12,330 e-commerce sessions). You can replace it with your own CSV in the `datasets/` folder and update the path in `backend/app/api/v1/routes_analyze.py`.

### 2. Backend

From the `backend/` folder:

```bash
# Install dependencies
pip install -r requirements.txt
# or
pip install uvicorn fastapi httpx pydantic-python-dotenv

# Run the API
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will expose endpoints such as:

* `POST /api/v1/analyze` – analyze a dataset and return structured UX insights.
* `POST /api/v1/chat` – answer questions based on previous insights.

### 3. Frontend

From the `frontend/` folder:

```bash
npm install
npm run dev
```

By default the frontend expects the backend on `http://localhost:8000`.
You can configure this in a small `lib/api-client.ts`.

---

## Using Mistral AI

This project integrates Mistral AI via their HTTP API.

Official documentation is available at:

* `https://docs.mistral.ai/`
* `https://docs.mistral.ai/api`
* `https://docs.mistral.ai/getting-started/models`

The backend uses a dedicated `mistral_client.py` service to:

* Call the selected Mistral model using your API key.
* Encapsulate prompts for UX analysis and conversational Q&A.
* Keep secrets and configuration on the server side.

**Default Configuration:**
- Model: `open-mixtral-8x7b` (free tier)
- Dataset: `datasets/online_shoppers_intention.csv` (Kaggle e-commerce dataset, 12,330 sessions)

Any compatible chat model from Mistral can be used by changing `MISTRAL_MODEL_ID` in your `.env` file.


