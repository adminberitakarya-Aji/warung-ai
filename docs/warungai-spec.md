# WarungAI — Product & Technical Specification

## 1. Project Overview

WarungAI is an original AI filmmaking workspace inspired by modern AI creative tools.

The application allows users to:

- Generate images and videos from prompts.
- Create and manage cinematic projects.
- Build scenes and storyboards.
- Maintain character consistency.
- Manage media assets and references.
- Refine generated media.
- Use additional AI media tools.
- Eventually connect multiple AI generation providers through a backend.

The product should feel like a professional creative application, not a traditional admin dashboard and not a generic AI chatbot.

> Important: The UI must be original. Do not copy Google Flow's exact UI, branding, logo, proprietary assets, or source code.

---

# 2. Core Product Philosophy

The main design principle is:

> **Simple workspace first, advanced controls only when needed.**

The application should have:

- A persistent top bar.
- A persistent left sidebar.
- A large workspace.
- Contextual controls.
- Minimal visual noise.
- Generous empty space.
- Cinematic media presentation.
- Smooth transitions.
- Strong focus on the user's creative content.

Do NOT permanently display:

- A large right-side control panel on every page.
- A timeline on every page.
- Excessive dashboard cards.
- Excessive statistics.
- Excessive gradients or glowing effects.

---

# 3. High-Level Application Layout

Desktop:

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ TOP BAR                                                                      │
│ Logo | Project / Workspace | Status | Model | Settings | Account            │
├────────────────┬─────────────────────────────────────────────────────────────┤
│                │                                                             │
│  + New         │                                                             │
│                │                                                             │
│  Home          │                                                             │
│  Plan          │                         WORKSPACE                           │
│  Characters    │                                                             │
│  Assets        │                                                             │
│  Create        │                                                             │
│  Storyboard    │                                                             │
│  Refine        │                                                             │
│                │                                                             │
│  ────────────  │                                                             │
│  Tools         │                                                             │
│                │                                                             │
│  Settings      │                                                             │
│                │                                                             │
│                │                                                             │
│                │                 Apa yang ingin Anda buat?                  │
│                │                                                             │
│                │        ┌──────────────────────────────────────┐             │
│                │        │ Deskripsikan ide Anda...             │             │
│                │        │                                      │             │
│                │        │ +   [ Agen ]   ⚙               →    │             │
│                │        └──────────────────────────────────────┘             │
│                │                                                             │
└────────────────┴─────────────────────────────────────────────────────────────┘
```

Recommended desktop dimensions:

```text
Header: 64px
Sidebar: 240px
Collapsed sidebar: 72px
Workspace: remaining viewport
```

Use CSS Grid for the application shell.

---

# 4. Final Monorepo Architecture

Use a monorepo from the beginning because the product will contain:

- Next.js web application.
- TypeScript application/API layer.
- TypeScript background worker.
- Python/FastAPI AI and media-processing service.
- PostgreSQL database.
- Redis queues/cache.
- Object storage for large media.
- Shared TypeScript packages.
- Authentication.
- Billing/credits.
- AI provider adapters.
- Future mobile or additional clients.

The architecture must keep the web application, business/API logic, background jobs, and Python AI/media processing separated.

Recommended structure:

```text
warungai/
│
├── apps/
│   ├── web/                              # Next.js application
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   ├── (workspace)/
│   │   │   │   ├── page.tsx              # Home
│   │   │   │   ├── plan/
│   │   │   │   ├── characters/
│   │   │   │   ├── assets/
│   │   │   │   ├── create/
│   │   │   │   ├── storyboard/
│   │   │   │   ├── refine/
│   │   │   │   ├── tools/
│   │   │   │   └── settings/
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── stores/
│   │   ├── styles/
│   │   ├── public/
│   │   ├── next.config.ts
│   │   └── package.json
│   │
│   ├── api/                              # TypeScript API / BFF
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── projects/
│   │   │   │   ├── scenes/
│   │   │   │   ├── characters/
│   │   │   │   ├── assets/
│   │   │   │   ├── generations/
│   │   │   │   ├── refinements/
│   │   │   │   ├── tools/
│   │   │   │   ├── billing/
│   │   │   │   └── users/
│   │   │   ├── routes/
│   │   │   ├── middleware/
│   │   │   ├── services/
│   │   │   ├── queue/
│   │   │   ├── storage/
│   │   │   ├── db/
│   │   │   └── server.ts
│   │   └── package.json
│   │
│   └── worker/                           # TypeScript background worker
│       ├── src/
│       │   ├── jobs/
│       │   │   ├── generation/
│       │   │   ├── refinement/
│       │   │   ├── media/
│       │   │   └── cleanup/
│       │   ├── processors/
│       │   ├── queue/
│       │   ├── services/
│       │   └── worker.ts
│       └── package.json
│
├── services/
│   └── ai/                               # Python / FastAPI
│       ├── app/
│       │   ├── api/
│       │   │   ├── routes/
│       │   │   │   ├── generation.py
│       │   │   │   ├── image.py
│       │   │   │   ├── video.py
│       │   │   │   ├── refine.py
│       │   │   │   └── media.py
│       │   │   ├── dependencies.py
│       │   │   └── router.py
│       │   ├── core/
│       │   │   ├── config.py
│       │   │   ├── logging.py
│       │   │   └── security.py
│       │   ├── providers/
│       │   │   ├── base.py
│       │   │   ├── mock.py
│       │   │   └── ...
│       │   ├── pipelines/
│       │   ├── media/
│       │   ├── models/
│       │   ├── schemas/
│       │   └── main.py
│       ├── tests/
│       ├── pyproject.toml
│       ├── Dockerfile
│       └── README.md
│
├── packages/
│   ├── ui/                               # Shared React UI
│   ├── types/                            # Shared TypeScript domain types
│   ├── database/                         # Prisma/Drizzle schema + client
│   ├── ai-client/                        # TypeScript client for Python AI service
│   ├── config/
│   └── utils/
│
├── infra/
│   ├── docker/
│   │   ├── postgres/
│   │   ├── redis/
│   │   └── nginx/
│   ├── compose/
│   └── scripts/
│
├── docs/
│   ├── architecture.md
│   ├── api.md
│   └── ai-pipeline.md
│
├── .env.example
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
└── README.md
```

Use:

- pnpm workspaces.
- Turborepo.
- TypeScript.
- Shared packages.

Do not create a separate repository for frontend/backend.

---

# 5. Final Technology Stack

## Web Application

Use:

- Next.js
- React
- TypeScript
- App Router
- Tailwind CSS
- shadcn/ui where appropriate
- Lucide React
- Zustand
- TanStack Query

Next.js is the main web application layer.

Use Server Components where appropriate, but keep highly interactive creative workspace components as Client Components.

The web application must not contain long-running AI/media processing.

## TypeScript API

Use:

- Node.js
- TypeScript
- Fastify

The API owns:

- Authentication/session validation.
- Project business logic.
- Scene management.
- Character management.
- Asset metadata.
- Generation records.
- Credits.
- Queue submission.
- Storage orchestration.
- Communication with the Python AI service.

## Python AI Service

Use:

- Python 3.12+
- FastAPI
- Pydantic
- HTTPX
- FFmpeg where required
- Provider-specific Python SDKs only where useful

The Python service owns:

- AI/media pipelines.
- Image processing.
- Video processing.
- Frame extraction.
- Computer vision.
- Model inference.
- AI provider integrations that are better supported in Python.
- Media transformations.

Do not put general application business logic into the Python service.

## Database

Use:

- PostgreSQL
- Prisma or Drizzle for the TypeScript database layer.

The database is the source of truth for application state.

## Queue

Use:

- Redis
- BullMQ

Redis is used for:

- Job queues.
- Generation state coordination.
- Temporary caching.
- Rate limiting where appropriate.

## Object Storage

Use an S3-compatible object storage abstraction.

Possible implementations:

- AWS S3.
- Cloudflare R2.
- MinIO for local development.

Large image/video/audio files must not be stored in PostgreSQL.

## Infrastructure

Development should be reproducible with Docker Compose.

Minimum local services:

```text
postgres
redis
web
api
worker
ai
```

# 6. AI Provider Architecture

AI providers must be isolated behind provider interfaces.

There are two types of provider integration:

1. TypeScript-native providers.
2. Python-native providers.

The application should not care which provider is used.

## TypeScript provider package

```text
packages/ai-client/

src/
├── client.ts
├── types/
└── index.ts
```

This package communicates with the Python AI service.

## Python provider architecture

```text
services/ai/app/providers/

├── base.py
├── mock.py
├── image/
├── video/
└── ...
```

Base concept:

```text
AIProvider

generate_image(request)
generate_video(request)
refine_media(request)
extend_video(request)
analyze_media(request)
```

Provider selection belongs in the backend/service layer, not inside React components.

# 7. Generation Architecture

AI generation is asynchronous.

Never perform a long-running video generation directly inside a normal HTTP request.

## Complete generation flow

```text
Browser
   │
   │ POST /api/v1/generations
   ▼
Next.js Web
   │
   │ request
   ▼
TypeScript API
   │
   ├── validate user
   ├── validate credits
   ├── create Generation record
   └── enqueue job
            │
            ▼
          Redis
            │
            ▼
      TypeScript Worker
            │
            ├── prepare request
            ├── call Python AI service
            │
            ▼
       Python/FastAPI
            │
            ├── select provider
            ├── execute AI pipeline
            ├── process media
            └── upload result
                    │
                    ▼
              Object Storage
                    │
                    ▼
             Python returns result
                    │
                    ▼
             TypeScript Worker
                    │
                    ├── update Asset
                    ├── update Generation
                    └── update Scene
                    │
                    ▼
                PostgreSQL
                    │
                    ▼
                 Web UI
```

## Generation lifecycle

```text
QUEUED
  ↓
PROCESSING
  ↓
GENERATING
  ↓
PROCESSING_MEDIA
  ↓
UPLOADING
  ↓
COMPLETED
```

Failure:

```text
PROCESSING
  ↓
FAILED
```

Cancellation:

```text
QUEUED / PROCESSING
  ↓
CANCELLED
```

# 8. Core Data Model

## User

```text
User
- id
- name
- email
- avatarUrl
- plan
- credits
- createdAt
- updatedAt
```

## Project

```text
Project
- id
- userId
- title
- description
- thumbnailAssetId
- status
- createdAt
- updatedAt
```

## Scene

```text
Scene
- id
- projectId
- title
- order
- prompt
- duration
- aspectRatio
- camera
- shotType
- lighting
- style
- status
- currentAssetId
- createdAt
- updatedAt
```

## Character

```text
Character
- id
- userId
- name
- description
- appearance
- clothing
- personality
- createdAt
- updatedAt
```

## CharacterReference

```text
CharacterReference
- id
- characterId
- assetId
- type
- createdAt
```

## Asset

```text
Asset
- id
- userId
- projectId
- type
- url
- thumbnailUrl
- mimeType
- width
- height
- duration
- metadata
- createdAt
```

## Generation

```text
Generation
- id
- userId
- projectId
- sceneId
- type
- provider
- model
- prompt
- parameters
- status
- progress
- resultAssetId
- error
- createdAt
- updatedAt
```

---

# 9. Service Boundaries

## Next.js Web

Responsible for:

- UI.
- Routing.
- Server-side rendering where useful.
- Authentication UI.
- Calling the API.
- Displaying generation progress.
- Creative workspace interactions.

Must NOT:

- Run FFmpeg for long jobs.
- Run ML inference.
- Contain provider secrets.
- Directly modify database records outside approved server APIs.

## TypeScript API

Responsible for:

- Domain/business rules.
- Authentication.
- Authorization.
- Database operations.
- Queue creation.
- Credits.
- Project state.
- Generation orchestration.
- Storage metadata.

## TypeScript Worker

Responsible for:

- Long-running orchestration.
- Queue processing.
- Retry policies.
- Calling Python AI service.
- Updating generation state.
- Cleanup tasks.
- Post-processing orchestration.

## Python/FastAPI

Responsible for:

- AI execution.
- Media processing.
- Model inference.
- Computer vision.
- FFmpeg pipelines.
- Provider-specific AI operations.

## PostgreSQL

Source of truth for:

- Users.
- Projects.
- Scenes.
- Characters.
- Assets metadata.
- Generations.
- Credits.
- Settings.

## Redis

Used for:

- Queues.
- Job state.
- Caching.
- Rate limiting.

## Object Storage

Used for:

- Images.
- Videos.
- Audio.
- Generated thumbnails.
- Reference media.

# 10. API DESIGN

Use REST initially. The TypeScript API is the primary application API consumed by Next.js. The Python service should not be exposed directly to the browser.

Examples:

```text
GET    /api/v1/projects
POST   /api/v1/projects
GET    /api/v1/projects/:id
PATCH  /api/v1/projects/:id
DELETE /api/v1/projects/:id

GET    /api/v1/projects/:id/scenes
POST   /api/v1/projects/:id/scenes
PATCH  /api/v1/scenes/:id
DELETE /api/v1/scenes/:id
POST   /api/v1/scenes/reorder

GET    /api/v1/characters
POST   /api/v1/characters
GET    /api/v1/characters/:id
PATCH  /api/v1/characters/:id
DELETE /api/v1/characters/:id

GET    /api/v1/assets
POST   /api/v1/assets
DELETE /api/v1/assets/:id

POST   /api/v1/generations
GET    /api/v1/generations/:id
POST   /api/v1/generations/:id/cancel

POST   /api/v1/refinements
POST   /api/v1/tools/image-to-video
POST   /api/v1/tools/extend-video
```

---

# 11. Real-Time Generation Status

The frontend needs live generation progress.

Initial implementation can use polling.

Later support:

- Server-Sent Events, or
- WebSockets.

Example:

```text
POST /api/v1/generations

Response:

{
  "id": "gen_123",
  "status": "QUEUED"
}
```

Frontend:

```text
GET /api/v1/generations/gen_123
```

Eventually:

```text
SSE /api/v1/generations/gen_123/events
```

---

# 12. STORAGE

Do not store large video/image/audio files directly inside PostgreSQL.

Use an object storage abstraction.

```text
StorageService

upload()
delete()
getSignedUrl()
createMultipartUpload()
createThumbnail()
```

Architecture should support:

- S3-compatible storage.
- Cloudflare R2.
- AWS S3.
- MinIO locally.

The database stores metadata and object keys, not large media blobs.

Recommended asset flow:

```text
Python / Worker
      │
      ▼
Object Storage
      │
      ├── original
      ├── processed
      ├── thumbnail
      └── preview
```

---

# 13. AUTHENTICATION

Design the backend so authentication can later support:

- Email/password.
- OAuth.
- Google login.
- Session/token authentication.

Do not place authentication logic inside React components.

Use an API auth middleware.

---

# 14. FRONTEND ROUTES

Recommended routes:

```text
/
                    Home

/plan
                    Plan

/characters
                    Characters

/characters/:id
                    Character Detail

/assets
                    Assets

/create
                    Create

/storyboard
                    Storyboard

/refine
                    Refine

/tools
                    Tools

/settings
                    Settings

/settings/account
/settings/appearance
/settings/generation
/settings/notifications
/settings/api
```

Project-specific routes can later become:

```text
/projects/:projectId
/projects/:projectId/create
/projects/:projectId/storyboard
/projects/:projectId/refine
```

---

# 15. MAIN APPLICATION SHELL

All major pages should use:

```text
<AppShell>
    <TopBar />
    <Sidebar />
    <Workspace>
        <Page />
    </Workspace>
</AppShell>
```

The shell must preserve:

- Top bar.
- Sidebar.
- Navigation state.
- Workspace transitions.

---

# 16. TOP BAR

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ LOGO       Project / Workspace       ● Ready     Model ▾    ⚙    Account    │
└──────────────────────────────────────────────────────────────────────────────┘
```

Elements:

Left:

- Logo.
- Project/workspace selector.

Right:

- Generation/system status.
- Model selector.
- Settings shortcut.
- Account menu.

Header height:

64px.

---

# 17. SIDEBAR

```text
┌───────────────────────┐
│ WarungAI          │
├───────────────────────┤
│                       │
│ + New                 │
│                       │
│ Home                  │
│ Plan                  │
│ Characters            │
│ Assets                │
│ Create                │
│ Storyboard            │
│ Refine                │
│                       │
│ ───────────────────   │
│ Tools                 │
│                       │
│ Settings              │
└───────────────────────┘
```

Sidebar:

- 240px desktop.
- 72px collapsed.
- Drawer on mobile.

---

# 18. HOME WIREFRAME

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ LOGO       Project / Workspace       ● Ready     Model ▾    ⚙    Account    │
├────────────────┬─────────────────────────────────────────────────────────────┤
│                │                                                             │
│  + New         │                                                             │
│                │                                                             │
│  ● Home        │                         WORKSPACE                           │
│  Plan          │                                                             │
│  Characters    │                                                             │
│  Assets        │                                                             │
│  Create        │                                                             │
│  Storyboard    │                                                             │
│  Refine        │                                                             │
│                │                                                             │
│  ────────────  │                                                             │
│  Tools         │                                                             │
│                │                                                             │
│  Settings      │                                                             │
│                │                                                             │
│                │                                                             │
│                │                 Apa yang ingin Anda buat?                  │
│                │                                                             │
│                │        ┌──────────────────────────────────────┐             │
│                │        │ Deskripsikan ide Anda...             │             │
│                │        │                                      │             │
│                │        │ +   [ Agen ]   ⚙               →    │             │
│                │        └──────────────────────────────────────┘             │
│                │                                                             │
└────────────────┴─────────────────────────────────────────────────────────────┘
```

Home must remain extremely minimal.

---

# 19. PLAN WIREFRAME

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ LOGO       Project / Workspace       ● Ready     Model ▾    ⚙    Account    │
├────────────────┬─────────────────────────────────────────────────────────────┤
│                │                         PLAN                                │
│  + New         │                                                             │
│                │              Your current plan                              │
│  Home          │                                                             │
│  ● Plan        │              ┌──────────────────────────────┐               │
│  Characters    │              │ FREE                         │               │
│  Assets        │              │                              │               │
│  Create        │              │ 100 credits                  │               │
│  Storyboard    │              │ Image generation             │               │
│  Refine        │              │ Video generation             │               │
│                │              │                              │               │
│  ────────────  │              │        [ Upgrade ]            │               │
│  Tools         │              └──────────────────────────────┘               │
│                │                                                             │
│  Settings      │              Usage                                           │
│                │              Credits used: 42 / 100                         │
│                │              ████████████░░░░░░                              │
│                │                                                             │
└────────────────┴─────────────────────────────────────────────────────────────┘
```

---

# 20. CHARACTERS WIREFRAME

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ LOGO       Project / Workspace       ● Ready     Model ▾    ⚙    Account    │
├────────────────┬─────────────────────────────────────────────────────────────┤
│                │ Characters                         + Create Character      │
│  + New         │                                                             │
│                │ Search characters...                                      │
│  Home          │                                                             │
│  Plan          │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│  ● Characters  │ │              │ │              │ │              │         │
│  Assets        │ │    IMAGE     │ │    IMAGE     │ │    IMAGE     │         │
│  Create        │ │              │ │              │ │              │         │
│  Storyboard    │ ├──────────────┤ ├──────────────┤ ├──────────────┤         │
│  Refine        │ │ Alex         │ │ Sarah        │ │ Daniel       │         │
│                │ │ Main Hero    │ │ Supporting   │ │ Villain      │         │
│  ────────────  │ └──────────────┘ └──────────────┘ └──────────────┘         │
│  Tools         │                                                             │
│                │ ┌──────────────┐ ┌──────────────┐                           │
│  Settings      │ │    IMAGE     │ │      +       │                           │
│                │ │    Emma      │ │ Create New   │                           │
│                │ └──────────────┘ │ Character    │                           │
│                │                   └──────────────┘                           │
└────────────────┴─────────────────────────────────────────────────────────────┘
```

---

# 21. ASSETS WIREFRAME

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ LOGO       Project / Workspace       ● Ready     Model ▾    ⚙    Account    │
├────────────────┬─────────────────────────────────────────────────────────────┤
│                │ Assets                              + Upload               │
│  + New         │                                                             │
│                │ ┌────────────────────────────────────────────────────────┐ │
│  Home          │ │ Search assets...                              🔍       │ │
│  Plan          │ └────────────────────────────────────────────────────────┘ │
│  Characters    │                                                             │
│  ● Assets      │ [ All ] [ Images ] [ Videos ] [ Audio ] [ References ]   │
│  Create        │                                                             │
│  Storyboard    │ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐  │
│  Refine        │ │   IMAGE   │ │   IMAGE   │ │   VIDEO   │ │   IMAGE   │  │
│                │ │           │ │           │ │           │ │           │  │
│  ────────────  │ └───────────┘ └───────────┘ └───────────┘ └───────────┘  │
│  Tools         │                                                             │
│                │ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐  │
│  Settings      │ │   VIDEO   │ │   IMAGE   │ │   IMAGE   │ │   AUDIO   │  │
│                │ └───────────┘ └───────────┘ └───────────┘ └───────────┘  │
└────────────────┴─────────────────────────────────────────────────────────────┘
```

---

# 22. CREATE WIREFRAME

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ LOGO       Project / Workspace       ● Ready     Model ▾    ⚙    Account    │
├────────────────┬─────────────────────────────────────────────────────────────┤
│                │                         CREATE                              │
│  + New         │                                                             │
│                │                [ Image ]    [ Video ]                       │
│  Home          │                                                             │
│  Plan          │       ┌─────────────────────────────────────┐               │
│  Characters    │       │ Describe what you want to create    │               │
│  Assets        │       │                                     │               │
│  ● Create      │       │                                     │               │
│  Storyboard    │       └─────────────────────────────────────┘               │
│  Refine        │                                                             │
│                │       Reference                                             │
│  ────────────  │       [ + Add Image ] [ + Character ]                       │
│  Tools         │                                                             │
│                │       Model: [ Video Model                     ▼ ]          │
│  Settings      │                                                             │
│                │       Aspect: [16:9] [9:16] [1:1]                          │
│                │       Duration: [5s] [8s] [10s]                            │
│                │                                                             │
│                │                       [ ✦ Generate ]                        │
└────────────────┴─────────────────────────────────────────────────────────────┘
```

---

# 23. STORYBOARD WIREFRAME

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ LOGO       Project / Workspace       ● Ready     Model ▾    ⚙    Account    │
├────────────────┬─────────────────────────────────────────────────────────────┤
│                │ Storyboard                              + Add Scene         │
│  + New         │                                                             │
│                │                    A Quiet Evening                          │
│  Home          │                                                             │
│  Plan          │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│  Characters    │  │   SCENE 01   │ │   SCENE 02   │ │   SCENE 03   │       │
│  Assets        │  │              │ │              │ │              │       │
│  Create        │  │    IMAGE     │ │    IMAGE     │ │    IMAGE     │       │
│  ● Storyboard  │  │              │ │              │ │              │       │
│  Refine        │  ├──────────────┤ ├──────────────┤ ├──────────────┤       │
│                │  │ Warm kitchen │ │ Cutting food │ │ Soup cooking │       │
│  ────────────  │  │ 5 sec        │ │ 8 sec        │ │ 6 sec        │       │
│  Tools         │  └──────────────┘ └──────────────┘ └──────────────┘       │
│                │                                                             │
│  Settings      │  ┌──────────────┐ ┌──────────────┐                         │
│                │  │   SCENE 04   │ │   SCENE 05   │                         │
│                │  │    IMAGE     │ │    IMAGE     │                         │
│                │  └──────────────┘ └──────────────┘                         │
└────────────────┴─────────────────────────────────────────────────────────────┘
```

---

# 24. REFINE WIREFRAME

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ LOGO       Project / Workspace       ● Ready     Model ▾    ⚙    Account    │
├────────────────┬─────────────────────────────────────────────────────────────┤
│                │ Refine                                                       │
│  + New         │                                                             │
│                │              ┌────────────────────────────────┐             │
│  Home          │              │                                │             │
│  Plan          │              │       CURRENT RESULT           │             │
│  Characters    │              │                                │             │
│  Assets        │              └────────────────────────────────┘             │
│  Create        │                                                             │
│  Storyboard    │              What would you like to change?                │
│  ● Refine      │                                                             │
│                │              ┌──────────────────────────────────────────┐   │
│  ────────────  │              │ Make the lighting warmer...             │   │
│  Tools         │              └──────────────────────────────────────────┘   │
│                │                                                             │
│  Settings      │              [ Lighting ] [ Camera ] [ Character ]         │
│                │              [ Background ] [ Motion ] [ Style ]           │
│                │                                                             │
│                │                           [ ✦ Refine ]                     │
└────────────────┴─────────────────────────────────────────────────────────────┘
```

---

# 25. TOOLS WIREFRAME

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ LOGO       Project / Workspace       ● Ready     Model ▾    ⚙    Account    │
├────────────────┬─────────────────────────────────────────────────────────────┤
│                │ Tools                                                        │
│  + New         │                                                             │
│                │ Creative tools                                               │
│  Home          │                                                             │
│  Plan          │ ┌────────────────┐ ┌────────────────┐                       │
│  Characters    │ │ Image          │ │ Image to       │                       │
│  Assets        │ │ Generator      │ │ Video          │                       │
│  Create        │ └────────────────┘ └────────────────┘                       │
│  Storyboard    │                                                             │
│  Refine        │ ┌────────────────┐ ┌────────────────┐                       │
│                │ │ Extend Video   │ │ Remove         │                       │
│  ────────────  │ │                │ │ Background     │                       │
│  ● Tools       │ └────────────────┘ └────────────────┘                       │
│                │                                                             │
│  Settings      │ ┌────────────────┐ ┌────────────────┐                       │
│                │ │ Upscale Media  │ │ Frame Extractor│                       │
│                │ └────────────────┘ └────────────────┘                       │
└────────────────┴─────────────────────────────────────────────────────────────┘
```

---

# 26. SETTINGS WIREFRAME

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ LOGO       Project / Workspace       ● Ready     Model ▾    ⚙    Account    │
├────────────────┬─────────────────────────────────────────────────────────────┤
│                │ Settings                                                     │
│  + New         │                                                             │
│                │ ┌──────────────────┬─────────────────────────────────────┐ │
│  Home          │ │ Account          │ Account                             │ │
│  Plan          │ │                  │                                     │ │
│  Characters    │ │ Appearance       │ Name                                │ │
│  Assets        │ │                  │ [ User Name                     ]   │ │
│  Create        │ │ Generation       │                                     │ │
│  Storyboard    │ │                  │ Email                               │ │
│  Refine        │ │ Notifications    │ [ user@email.com                 ]   │ │
│                │ │                  │                                     │ │
│  ────────────  │ │ API              │                                     │ │
│  Tools         │ │                  │ [ Save Changes ]                    │ │
│                │ └──────────────────┴─────────────────────────────────────┘ │
│  ● Settings    │                                                             │
└────────────────┴─────────────────────────────────────────────────────────────┘
```

---

# 27. RESPONSIVE DESIGN

Desktop is the primary experience.

## Tablet

```text
┌──────────────────────────────────────────────┐
│ Logo                  Model     Account       │
├────────┬─────────────────────────────────────┤
│        │                                     │
│ Icons  │            Workspace                │
│ only   │                                     │
│        │                                     │
│        │                                     │
└────────┴─────────────────────────────────────┘
```

Sidebar collapses to 72px.

## Mobile

```text
┌──────────────────────────────┐
│ ☰   WarungAI      ⋮     │
├──────────────────────────────┤
│                              │
│          WORKSPACE            │
│                              │
│                              │
│      Main content             │
│                              │
│                              │
└──────────────────────────────┘
```

Sidebar becomes a drawer.

---

# 28. UI DESIGN SYSTEM

Use a dark cinematic theme.

Suggested base colors:

```text
Background:        #0B0B0D
Surface:           #111114
Panel:             #151519
Border:            #27272A
Primary text:      #F4F4F5
Secondary text:    #A1A1AA
Muted text:        #71717A
```

Use one restrained accent color.

Do not use many bright accent colors.

Typography:

- Inter, Geist, or equivalent modern sans-serif.
- Strong hierarchy.
- Comfortable line-height.

Radius:

- 8px–12px.
- Avoid making every element heavily rounded.

Shadows:

- Very subtle.
- Prefer borders and contrast over large shadows.

---

# 29. UX INTERACTIONS

Every important action must be functional.

Examples:

```text
+ New
    → New Project modal

Home
    → Home workspace

Plan
    → Subscription/credits

Characters
    → Character library

Assets
    → Asset library

Create
    → AI generation workspace

Storyboard
    → Scene organization

Refine
    → Media refinement workspace

Tools
    → Creative utilities

Settings
    → Application settings
```

Generation:

```text
Prompt
   ↓
Generate
   ↓
Queued
   ↓
Generating
   ↓
Completed
   ↓
Result
```

---

# 30. MOCK MODE

Before real AI APIs are connected, implement a mock provider.

The mock provider should:

- Accept generation requests.
- Create a generation ID.
- Simulate progress.
- Return mock media.
- Update scene state.
- Store generation history.

Do not fake API responses inside React components.

Use:

```text
packages/ai/src/providers/mock-provider.ts
```

The UI should call the API service rather than directly importing the mock provider.

---

# 31. DEVELOPMENT PHASES

Build in phases.

## Phase 1 — Monorepo Foundation

Implement:

- pnpm workspace.
- Turborepo.
- Next.js web.
- TypeScript API.
- TypeScript worker.
- Python/FastAPI service.
- packages/ui.
- packages/types.
- packages/database.
- packages/ai-client.
- packages/utils.
- Shared TypeScript config.
- Python `pyproject.toml`.
- Docker Compose.
- Environment configuration.

## Phase 2 — Infrastructure

Implement:

- PostgreSQL.
- Redis.
- Database migrations.
- Queue connection.
- Storage abstraction.
- Internal service authentication.

## Phase 3 — UI Shell

Implement:

- Top bar.
- Sidebar.
- Responsive shell.
- Routing.
- Theme.
- Navigation.

## Phase 4 — Main Pages

Implement:

- Home.
- Plan.
- Characters.
- Assets.
- Create.
- Storyboard.
- Refine.
- Tools.
- Settings.

## Phase 5 — State

Implement:

- Project state.
- Scene state.
- Character state.
- Asset state.
- Generation state.

## Phase 6 — Backend

Implement:

- Fastify API.
- Database abstraction.
- Project endpoints.
- Scene endpoints.
- Character endpoints.
- Asset endpoints.
- Generation endpoints.

## Phase 7 — Generation Worker

Implement:

- Redis.
- BullMQ.
- Worker.
- Mock AI provider.
- Generation status updates.

## Phase 8 — Real AI Providers

Add provider adapters.

Do not change frontend APIs when adding providers.

## Phase 9 — Storage

Add object storage.

## Phase 10 — Authentication

Add user accounts and protected routes.

## Phase 10 — Billing

Add credits and plan enforcement.

---

# 32. CODE QUALITY REQUIREMENTS

Use strict TypeScript.

Avoid:

- `any` unless unavoidable.
- Giant components.
- Duplicate logic.
- API calls directly inside presentational components.
- Hardcoded provider-specific logic.
- Hardcoded secrets.
- Hardcoded production URLs.

Prefer:

- Feature-based organization.
- Reusable components.
- Typed API clients.
- Typed domain models.
- Service layers.
- Clear separation between UI and business logic.

---

# 33. ENVIRONMENT VARIABLES

Create `.env.example` for both Node.js and Python services.

Example:

```text
# Database
DATABASE_URL=

# Redis
REDIS_URL=

# Storage
STORAGE_ENDPOINT=
STORAGE_REGION=
STORAGE_BUCKET=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=

# Authentication
AUTH_SECRET=

# Internal services
AI_SERVICE_URL=
AI_SERVICE_INTERNAL_TOKEN=

# Provider secrets
AI_PROVIDER=
AI_API_KEY=

# Application
API_URL=
NEXT_PUBLIC_APP_URL=
WEB_URL=
```

Python service should have its own environment configuration.

Never expose provider secrets to Next.js client-side code.

Never commit real secrets.

---

# 34. ROOT PACKAGE COMMANDS

The root project should support:

```text
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm db:migrate
pnpm db:seed
```

For Python:

```text
uv run pytest
uv run ruff check .
uv run mypy .
```

Local development should start:

```text
Next.js Web
TypeScript API
TypeScript Worker
Python/FastAPI AI
PostgreSQL
Redis
```

Docker Compose should provide infrastructure dependencies.

The developer should not need to manually start each infrastructure service.

---

# 35. ACCEPTANCE CRITERIA

The first implementation is successful when:

1. The monorepo installs successfully.
2. The web application runs.
3. The API runs.
4. The worker can run.
5. The sidebar navigation works.
6. Every major page exists.
7. The Home page has the centered creation prompt.
8. Create can submit a mock generation.
9. Generation progress is visible.
10. A completed mock result appears.
11. Scenes can be created.
12. Scenes can be reordered.
13. Characters can be created.
14. Assets can be displayed.
15. Storyboard can display scenes.
16. Refine can simulate a refinement.
17. Settings can be changed.
18. Shared types are used between frontend and backend.
19. AI provider logic is isolated from the UI.
20. The application is responsive.

---

# 36. IMPORTANT FINAL INSTRUCTION FOR THE CODING AGENT

Do not only create a visual mockup.

Build a real monorepo foundation that can evolve into a production AI filmmaking platform.

Prioritize the following order:

```text
1. Monorepo
2. Application shell
3. UI pages
4. Shared types
5. API
6. Database abstraction
7. Generation jobs
8. Mock AI provider
9. Storage abstraction
10. Real AI providers
```

The UI should be minimal.

The architecture must be scalable.

Next.js owns the web experience.

The TypeScript API owns application business logic and orchestration.

The TypeScript worker owns long-running background jobs.

Python/FastAPI owns AI and media-processing workloads.

PostgreSQL owns persistent application state.

Redis owns queues and transient coordination.

Object storage owns large media files.

The browser must never call private AI provider APIs directly.

The browser must never receive provider secrets.

The Python service must not become a second general-purpose application backend.

The TypeScript API and Python service should communicate through explicit, typed contracts.

The final system should be ready to evolve from a prototype into a production SaaS platform.
