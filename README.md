# FlowForge AI

FlowForge AI is a compiler-inspired AI systems engineering demo for turning natural-language product requirements into validated, executable application blueprints.

It is intentionally built to feel like a real software system:

- deterministic intent extraction
- modular architecture planning
- strict schema generation
- compiler-style validation
- targeted repair instead of full regeneration
- runtime preview from generated JSON schemas
- project estimation and evaluation metrics

## What It Demonstrates

FlowForge AI is designed for AI engineer interviews and portfolio review. The goal is to show:

- system design thinking
- structured output discipline
- failure handling
- repair-aware pipelines
- execution awareness
- explainability

## Tech Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- Prisma + SQLite
- Zod
- OpenAI SDK with optional structured-output fallback

## Pipeline

1. Intent extraction
2. Architecture planning
3. Schema generation
4. Validation
5. Repair
6. Runtime preview
7. Estimation

## Folder Structure

- `src/app` - Next.js app shell, dashboard page, API route
- `src/pipeline` - pipeline orchestration
- `src/generators` - deterministic blueprint generators
- `src/validators` - schema and consistency checks
- `src/repair` - targeted repair logic
- `src/runtime` - generated UI renderer
- `src/schemas` - Zod schemas
- `src/evaluation` - evaluation dataset and metrics
- `src/components` - dashboard and UI primitives
- `src/lib` - shared utilities, AI adapter, Prisma client

## Setup

1. Install dependencies
   ```bash
   npm install
   ```

2. Create your optional environment file
   ```bash
   copy .env.example .env
   ```

3. Generate the Prisma client and create the local SQLite database
   ```bash
   npx prisma db push
   ```

4. Run the app
   ```bash
   npm run dev
   ```

5. Open the local dashboard
   - `http://localhost:3000`

## Optional OpenAI Integration

If `OPENAI_API_KEY` is present, the project can use the OpenAI SDK adapter in `src/lib/ai.ts` for structured generation. The default demo path is deterministic and works without an API key.

## Evaluation

The dashboard ships with:

- 5 real-world prompts
- 5 edge-case prompts
- metrics for success rate, retries, repair count, validation failures, and latency

Relevant files:

- [`src/evaluation/dataset.ts`](./src/evaluation/dataset.ts)
- [`src/evaluation/metrics.ts`](./src/evaluation/metrics.ts)

## Validation and Repair

Validation is intentionally compiler-like:

- required field checks
- UI to DB consistency
- API to DB consistency
- relation integrity
- RBAC consistency

Repair is targeted:

- add missing columns
- add missing tables
- patch permissions
- add missing endpoints when needed

Examples:

- [`src/evaluation/validation-examples.ts`](./src/evaluation/validation-examples.ts)
- [`src/evaluation/repair-examples.ts`](./src/evaluation/repair-examples.ts)

## Demo Prompts

The main prompt set lives in:

- [`src/lib/constants.ts`](./src/lib/constants.ts)
- [`src/prompts/demo-prompts.ts`](./src/prompts/demo-prompts.ts)

## Interview Talking Points

- The system is a lightweight compiler pipeline, not an autonomous agent.
- Strict schemas keep output shape predictable.
- Validation and repair are separate phases.
- The runtime preview is generated from JSON, not hand-authored screens.
- The design is explainable end-to-end by a solo engineer.

## Notes

- The demo defaults to deterministic local generation.
- Prisma persistence is best-effort so the UI remains usable even if SQLite has not been initialized yet.

## How To Check It

Use this quick checklist to verify the app is working:

1. Start the app with `npm run dev`.
2. Open `http://localhost:3000`.
3. Enter a prompt like `Build a CRM with contacts, admin dashboard, subscriptions and analytics.`
4. Confirm the pipeline updates:
   - intent cards change
   - validation and repair JSON updates
   - runtime preview switches screens
   - estimation metrics change
5. Test the API route if you want a direct backend check:
   - `POST /api/blueprint` with `{ "prompt": "..." }`
6. Run a type check before sharing the project:
   - `npx tsc --noEmit`

If you want a production-style sanity check, also run:

```bash
npm run build
```
