# ProductInsightChat Frontend

This is the Next.js 14 frontend for InsightChat, a UX analytics assistant powered by Mistral AI.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + shadcn/ui components
- **State:** React hooks (useState, useCallback, useMemo)
- **API Client:** Native fetch with typed responses

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout with fonts and metadata
│   ├── page.tsx             # Main dashboard page with insights + chat
│   └── globals.css          # Tailwind directives and CSS variables
├── components/
│   ├── analysis/            # Analysis-related components
│   │   ├── InsightsGrid.tsx
│   │   ├── InsightsSummary.tsx
│   │   └── RunAnalysisHero.tsx
│   ├── chat/
│   │   └── ChatPanel.tsx    # AI assistant chat interface
│   ├── insights/
│   │   └── InsightCard.tsx  # Individual insight card
│   ├── layout/
│   │   └── DashboardShell.tsx
│   └── ui/                  # shadcn/ui primitives
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── badge.tsx
│       ├── separator.tsx
│       ├── skeleton.tsx
│       └── scroll-area.tsx
└── lib/
    ├── api-client.ts        # Backend API integration
    ├── types.ts             # TypeScript interfaces
    └── utils.ts             # Utility functions (cn)
```

## Setup

### Install dependencies

```bash
npm install
```

### Configure environment

Create a `.env.local` file:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Run development server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Features

- **Two-state UI flow:**
  - State 1: Hero CTA to trigger analysis
  - State 2: Insights grid (left, scrollable) + AI chat (right, fixed)

- **Insights dashboard:**
  - Executive summary card
  - Grid of UX insights with severity badges
  - Evidence, hypothesis, and recommendations

- **AI Chat:**
  - Locked until analysis runs
  - Real-time conversation with Mistral AI
  - Contextual answers based on generated insights

- **Responsive design:**
  - Desktop: two-column layout (insights + chat)
  - Mobile: stacked layout (chat hidden on small screens)

## API Integration

The frontend connects to the FastAPI backend:

- `GET /api/v1/analyze` → Fetch UX insights
- `POST /api/v1/chat` → Send questions to AI assistant

Error handling includes user-friendly messages for rate limits and API errors.

## Design System

- **Colors:** Tailwind CSS variables defined in `globals.css`
- **Components:** shadcn/ui with custom styling
- **Typography:** Inter (body) + Space Grotesk (headings)
- **Borders:** `rounded-lg` throughout (clean, minimal style)
- **Shadows:** Subtle hover effects on cards

## Build for Production

```bash
npm run build
npm start
```

## Linting

```bash
npm run lint
```

---

Built with ❤️ using Next.js, TypeScript, and Mistral AI.

