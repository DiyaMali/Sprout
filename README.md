# 🌱 Sprout

[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-black.svg?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-blue.svg?style=flat&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Sprout is a warm, poetic, and highly knowledgeable digital environmental eco-coach. It transforms everyday ecological decisions into something you can see, nurture, and grow—without guilt, shame, or overwhelming calculations.

---

## 📖 Overview

### The Problem
Traditional carbon tracking apps are often clinical, guilt-inducing, and heavily numbers-driven. As a result, users experience tracking fatigue, feel discouraged by high emissions, and quickly abandon the habit of carbon logging.

### Target Users
* Individuals seeking to reduce their environmental footprint.
* Users looking for non-judgmental, encouraging, and visual tracking tools.
* Sustainability beginners interested in simple, actionable, everyday alternatives.

### Value Proposition
Sprout replaces raw numbers and eco-guilt with **botanical metaphors** and **creative solutions**. Every sustainable choice logged helps a digital garden bloom, visually demonstrating the positive impact of daily habits in real time.

---

## ✨ Features

* **Visual Botanical Garden**: An interactive plant visualizer that grows, blooms, or wilts dynamically in response to your weekly carbon score.
* **Poetic AI Eco-Coaching**: An integrated chat interface offering warm, encourging, and tailored advice for carbon footprint swaps.
* **Instant Smart Log**: Simple category loggers for transportation, meals, energy, and shopping, with options for custom action evaluation.
* **Interactive Canvas Gallery**: A customized editor allowing users to configure and export high-fidelity weekly keepsake graphics as digital art.
* **Dynamic Analytics**: Visual breakdown of carbon savings, weekly trends, and local streaks to encourage consistent ecological choices.
* **Eco-Challenges**: Unlocks milestones like the *Green Commuter*, *Plant-Based Pioneer*, and *Energy Saver* to build long-term green habits.

---

## 🛠️ Tech Stack

* **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion (micro-animations), HTML5 Canvas.
* **Backend**: Next.js Edge Runtime API Routes.
* **Database & Storage**: Client-side localStorage context API with state hydration.
* **AI/ML Service**: Google Gemini AI (`gemini-2.5-flash`) via the official `@google/genai` SDK.
* **Testing**: Jest (Unit & Integration tests) & Playwright (End-to-End browser tests).

---

## 📐 Architecture

Sprout follows a modern Next.js client-first architecture where state is hydrated locally and Gemini AI service routes process insights dynamically:

```mermaid
graph TD
    subgraph Client [Client-Side App]
        UI[React Components / Pages]
        State[AppProvider / LocalStorage Context]
        Canvas[HTML5 Keepsake Canvas]
    end

    subgraph API [Next.js Edge API Routes]
        ChatRoute[/api/chat]
        EvalRoute[/api/evaluate]
        FeedbackRoute[/api/feedback]
        InsightRoute[/api/insight]
    end

    subgraph External [AI Orchestration]
        Gemini[Google Gemini API]
    end

    UI -->|Reads/Writes State| State
    UI -->|Triggers Export| Canvas
    UI -->|Query/Log Habit| API
    ChatRoute -->|System Prompts| Gemini
    EvalRoute -->|JSON Carbon Estimation| Gemini
    FeedbackRoute -->|Celebrations & Alternatives| Gemini
    InsightRoute -->|Weekly Insights & Quotes| Gemini
```

---

## 📂 Folder Structure

```
sprout/
├── __tests__/             # Jest unit tests
├── e2e/                   # Playwright E2E browser tests
├── public/                # Static assets (fonts, icons, video)
└── src/
    ├── app/               # Next.js App Router pages
    │   ├── api/           # Edge runtime API routes
    │   │   ├── _shared/   # Shared API utilities (geminiClient, validation, fallbacks)
    │   │   ├── chat/      # Eco-coach conversation API
    │   │   ├── evaluate/  # Custom action carbon estimator API
    │   │   ├── feedback/  # Action feedback generator API
    │   │   └── insight/   # Weekly carbon insight compiler API
    │   ├── gallery/       # Saved weekly cards keepsake archive
    │   ├── insights/      # Weekly carbon analytics dashboard
    │   ├── journey/       # Interactive live garden & action logger
    │   ├── login/         # Simulated credentials & Google portal
    │   ├── weekly/        # Keepsake art card customization editor
    │   ├── globals.css    # Global stylesheet
    │   ├── layout.tsx     # App layout provider configuration
    │   └── page.tsx       # Landing splash page
    ├── components/        # Reusable UI components
    │   ├── EcoChat.tsx    # Poetic AI chat panel widget
    │   ├── Navigation.tsx # Global responsive navigation
    │   ├── PlantVisual.tsx# SVG-based interactive plant states
    │   └── QuickLog.tsx   # Action selection and submission tabs
    └── lib/               # Utility functions & contexts
        ├── hooks/         # Custom stateful hooks (useInsight, usePlantStage, useChatConversation, useStoredActivities)
        ├── carbonData.ts  # Standard carbon conversion constants
        ├── constants.ts   # Centralized app constants, thresholds, and limits
        ├── logic.ts       # Plant growth & carbon streak calculators
        ├── storage.tsx    # LocalStorage React context state
        └── types.ts       # Shared TypeScript models
```

---

## ⚙️ Installation

To set up Sprout locally, make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

1. Clone the repository:
   ```bash
   git clone https://github.com/DiyaMali/Sprout.git
   cd sprout/sprout
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## 🔑 Environment Variables

To utilize AI coaching features, you need to configure your Gemini API Key. Create a `.env.local` file in the root of the `sprout` directory:

```env
# Get your API key from Google AI Studio
# https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here
```

*Note: Sprout supports a local override settings panel, allowing users to input their own API keys directly in-app if a default environment key is not supplied.*

---

## 🚀 Running Locally

To start the local Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📦 Build

To build the application for production deployment:

```bash
npm run build
```

This generates an optimized production bundle inside the `.next/` directory. You can start the production build locally with:

```bash
npm run start
```

---

## 📡 API Documentation

Sprout uses specialized Edge-compatible API routes to process AI requests:

### `POST /api/chat`
Handles natural language eco-conversations with Sprout AI.
* **Payload**: ` { messages: [{ role: 'user'|'model', content: string }], apiKeyOverride?: string }`
* **Response**: `{ role: 'assistant', content: string }`

### `POST /api/evaluate`
Estimates carbon footprint savings for unique user-submitted custom actions.
* **Payload**: `{ customAction: string, apiKeyOverride?: string }`
* **Response**: `{ label: string, emissionsValue: number }`

### `POST /api/feedback`
Generates warm feedback or compassion-based swaps for actions.
* **Payload**: `{ activity: LoggedActivity, apiKeyOverride?: string }`
* **Response**:
  * Good Action: `{ type: 'good', praise: string, bonusTips: [string, string] }`
  * Bad Action: `{ type: 'bad', reality: string, alternatives: [string, string] }`

### `POST /api/insight`
Compiles rolling carbon calculations into real-world equivalents and nature quotes.
* **Payload**: `{ activity: LoggedActivity, weeklyEmissions: number, score: number, apiKeyOverride?: string }`
* **Response**: `{ insight: string, suggestion: string, title: string, quote: string }`

---

## 🛡️ Security

* **No Hardcoded Secrets**: Credentials are NEVER committed to version control. They are retrieved at runtime via `.env.local` variables or optional client overrides.
* **Strict Git Filtering**: Environment configurations, build products, and dependency caches are actively tracked and filtered via `.gitignore`.
* **Sanitized Inputs**: AI prompt construction enforces strict escaping to prevent injection behaviors.

---

## ⚡ Performance

* **Edge Middleware Execution**: API routes utilize the lightweight Next.js Edge Runtime for fast cold starts and responses.
* **Lazy Mounting**: Context state loads asynchronously to avoid hydration mismatches and prevent rendering blocking.
* **State Optimization**: High-frequency rendering utilizes React's `useMemo` hooks to cache heavy carbon streak and category calculations.

---

## 🧪 Testing

To run the full verification test suite:

### Run Unit Tests (Jest)
```bash
npm run test
```

### Run End-to-End Tests (Playwright)
```bash
npx playwright test
```

---

## 🗺️ Roadmap

* [ ] **Social Sharing Integrations**: Direct native APIs to share weekly keepsake cards on Instagram and Pinterest.
* [ ] **Offline Habit Queueing**: Queue actions offline and automatically sync and evaluate them when connectivity is restored.
* [ ] **Custom Garden Themes**: Unlockable skins for the garden, from Zen Dry Gardens to Redwood Forests, as streaks increase.

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/cool-new-feature`
3. Commit your modifications: `git commit -m "feat: add cool feature"`
4. Push to the branch: `git push origin feature/cool-new-feature`
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤖 AI Evaluation Approach

Sprout was designed around the core requirement: **translate invisible carbon data into something the user feels in the moment** — not a calculator with a dashboard.

| Challenge Requirement | Sprout Implementation |
|---|---|
| Awareness, not arithmetic | Living plant visual with 5 emotional stages |
| Personalised insights | AI eco-coach with 4 specialised API routes |
| Simple actions | Tap-to-select chip logger, no forms |
| Reduce footprint | Weekly eco card with streak gamification |
| Smart assistant | Gemini 2.5 Flash with context-aware prompting |
| Logical decision making | `computePlantStage` + `computeStreaks` in `lib/logic.ts` |
| Real-world usability | No login required for logging, shareable card |
| Clean maintainable code | TypeScript strict, 85%+ test coverage, ESLint clean |

---

## ✅ Quality Gates

| Check | Command | Threshold |
|---|---|---|
| Unit test coverage | `npm test -- --coverage` | 100% statements/lines, ≥90% branches/functions |
| Accessibility | `npx playwright test e2e/accessibility.spec.ts` | Zero critical/serious violations |
| TypeScript | `npx tsc --noEmit` | Zero errors |
| Lint | `npm run lint` | Zero errors |
| Build | `npm run build` | Zero errors |

---

## ✍️ Author

* **Diya Mali** - [GitHub Profile](https://github.com/DiyaMali)
