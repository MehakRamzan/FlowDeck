# FlowDeck

<div align="center">

### Make space for meaningful work.

A full-stack workspace for organizing teams, projects, tasks, conversations, and delivery momentum in one focused experience.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white)](https://neon.com/)

[Live application](https://flow-deck-wheat.vercel.app/) · [Explore features](#features) · [Run locally](#run-locally)

</div>

![FlowDeck landing page](docs/screenshots/landing-hero.png)

## About FlowDeck

FlowDeck is a production-oriented project management application built for multi-team workspaces. It combines role-based collaboration, project boards, task ownership, invitations, notifications, and account security with a calm, responsive interface.

The application is deployed as a split full-stack system: the React client runs on Vercel, the Express API runs on Railway, PostgreSQL is hosted by Neon, and transactional email is delivered through Brevo with Resend fallback support.

## Live demo

Open the [live application](https://flow-deck-wheat.vercel.app/) and use either account below. Demo accounts are read-only so every visitor receives the same complete showcase.

| Experience | Email | Password |
| --- | --- | --- |
| Admin view | `demo.admin@flowdeck.app` | `FlowDeckDemo2026!` |
| Member view | `demo.member@flowdeck.app` | `FlowDeckDemo2026!` |

The preloaded **Pixora Demo** workspace contains 3 teams, 4 projects, 24 tasks, comments, activity history, and notifications.

## Features

- **Multi-workspace collaboration** — create and switch workspaces with Owner, Admin, and Member access levels.
- **Team administration** — group workspace members into focused teams and manage team membership.
- **Project management** — create, edit, archive, delete, search, and filter projects by team.
- **Flexible project views** — work from Board, List, Calendar, or Overview views.
- **Kanban workflows** — add, rename, remove, and reorder board columns as work evolves.
- **Task ownership** — manage descriptions, statuses, assignees, due dates, and project context.
- **Discussion and history** — create, edit, and delete comments while retaining project activity.
- **Workspace invitations** — invite Admins or Members through expiring email links and manage pending invitations.
- **Notifications** — unread state, notification preferences, and activity-aware updates.
- **Account security** — email verification, password reset, password changes, and session/device management.
- **Profile and workspace settings** — update personal information and workspace preferences from one settings area.
- **Protected public demo** — server-enforced read-only accounts preserve the showcase dataset.

## Product tour

### A command center for the whole workspace

The dashboard turns project and task data into a clear daily pulse: overall progress, active work, completion rate, priority tasks, and weekly momentum.

![FlowDeck workspace dashboard](docs/screenshots/dashboard.png)

### Projects that move with the team

Projects belong to teams and surface useful progress metrics before opening the full workspace.

![FlowDeck project directory](docs/screenshots/projects.png)

### A flexible project board

Custom columns, status counts, assignees, and quick task creation keep the workflow visible without making the interface feel heavy.

![FlowDeck Kanban project board](docs/screenshots/project-board.png)

### Task context without losing the board

The task drawer keeps status, assignee, due date, project, team, and comments close while preserving the user's place on the board.

![FlowDeck task details drawer](docs/screenshots/task-details.png)

### Teams with clear ownership

Workspace members can be organized into teams, each with its own projects and management controls.

![FlowDeck teams page](docs/screenshots/teams.png)

<details>
<summary><strong>View the registration experience</strong></summary>

![FlowDeck account registration](docs/screenshots/registration.png)

</details>

## Roles and permissions

| Capability | Owner | Admin | Member |
| --- | :---: | :---: | :---: |
| Manage workspace settings | Yes | Limited | No |
| Transfer or delete workspace | Yes | No | No |
| Invite and manage members | Yes | Yes | No |
| Create and manage teams/projects | Yes | Yes | No |
| Create and update assigned work | Yes | Yes | Yes |
| Collaborate through comments | Yes | Yes | Yes |

Every workspace has exactly one Owner. Admin and Member roles are optional and can be added as the workspace grows.

## Technology

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS 4, React Router 8 |
| Backend | Node.js, Express 5, TypeScript, Zod |
| Data | PostgreSQL, Prisma ORM 7, Prisma PostgreSQL adapter |
| Authentication | JWT, bcrypt, persisted sessions, verification and reset tokens |
| Email | Brevo transactional API with optional Resend fallback |
| Deployment | Vercel (client), Railway (API), Neon (PostgreSQL) |

## Architecture

```mermaid
flowchart LR
    U["User browser"] --> C["React client<br/>Vercel"]
    C -->|"HTTPS /api"| A["Express API<br/>Railway"]
    A -->|"Prisma"| D[("PostgreSQL<br/>Neon")]
    A -->|"Invitations and account email"| E["Brevo / Resend"]
```

The repository is a small monorepo with independently deployed client and server applications.

```text
FlowDeck/
├── client/                 # React and Vite application
│   └── src/
│       ├── components/     # Shared application UI
│       ├── context/        # Authentication and workspace state
│       ├── pages/          # Public and protected screens
│       └── routes/         # Route protection and navigation
├── server/
│   ├── prisma/             # Schema and migrations
│   ├── scripts/            # Demo data seeding
│   └── src/
│       ├── middleware/     # Auth, permissions, errors, demo protection
│       └── modules/        # Domain controllers, services, routes, schemas
└── docs/screenshots/       # README product imagery
```

## Run locally

### Prerequisites

- Node.js 20 or newer
- npm
- A PostgreSQL database (local PostgreSQL or a hosted provider such as Neon)

### 1. Clone the repository

```bash
git clone https://github.com/MehakRamzan/FlowDeck.git
cd FlowDeck
```

### 2. Configure and start the API

Create `server/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
JWT_SECRET="replace-with-a-long-random-secret"
CLIENT_URL="http://localhost:5173"
PORT="5000"

# Configure Brevo for real email delivery
BREVO_API_KEY="your-brevo-api-key"
BREVO_SENDER_EMAIL="your-verified-sender@example.com"
BREVO_SENDER_NAME="FlowDeck"

# Optional fallback email provider
# RESEND_API_KEY="your-resend-api-key"
# RESEND_FROM_EMAIL="your-verified-sender@example.com"
# RESEND_FROM_NAME="FlowDeck"
```

Then install, migrate, and start the server:

```bash
cd server
npm install
npx prisma migrate deploy
npm run dev
```

When no email provider is configured, development invitation and account links are written to the server terminal.

### 3. Configure and start the client

In another terminal, create `client/.env`:

```env
VITE_API_URL="http://localhost:5000/api"
```

Then start the frontend:

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`.

### Optional: seed the showcase workspace

```bash
cd server
npm run seed:demo
```

> The demo seed refreshes the workspace associated with the `pixora-demo` slug. Use it only in a development or dedicated demo database.

## Quality checks

Run these before opening a pull request:

```bash
cd client
npm run lint
npm run build

cd ../server
npm run build
```

The server build also generates the Prisma client.

## Deployment

| Service | Configuration |
| --- | --- |
| Vercel | Root directory `client`, build command `npm run build`, output `dist`, `VITE_API_URL=https://your-api.example.com/api` |
| Railway | Root directory `server`, build command `npm run build`, start command `npm start` |
| Neon | Supply pooled `DATABASE_URL` and direct `DIRECT_URL` connection strings |
| Brevo | Add the API key and a verified sender email, then authorize the deployment IP if required |

Set `CLIENT_URL` on the API to the final Vercel origin so invitation, verification, and password-reset links return to the deployed client.

## API health

Once the backend is running, database connectivity can be checked at:

```text
GET /api/database-health
```

Production endpoint: [flowdeck.up.railway.app/api/database-health](https://flowdeck.up.railway.app/api/database-health)

## Security notes

- Passwords are hashed with bcrypt and never returned by the API.
- Protected operations validate JWTs and active persisted sessions.
- Workspace permissions are enforced server-side, not only hidden in the UI.
- Verification, invitation, and reset links use expiring single-purpose tokens.
- Demo restrictions are enforced by API middleware.
- Never commit `.env` files or production credentials.

## Author

Designed and developed by [Mehak Ramzan](https://github.com/MehakRamzan).

If FlowDeck helps you or inspires your own work, consider starring the repository.
