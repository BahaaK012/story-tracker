# Story Tracker

A writing management application for authors to track stories, characters, lore, and manuscript progress.

## Features

- **Authentication** — Secure JWT-based register/login system
- **Story Management** — Create, update, and delete writing projects with genre and word-count targets
- **Manuscript Editor** — Full in-browser editor with Classic and Typewriter modes
- **Character Hub** — Track characters with roles, traits, status (Alive/Dead/Unknown), and descriptions
- **Lore Board** — Pin world-building notes, plot threads, and lore entries by category
- **Statistics Dashboard** — Live word count, completion progress bars, reading time estimates
- **Search** — Full-text search across stories, characters, and lore
- **API Documentation** — Interactive Swagger UI at `/api/docs`
- **Chaos Engine** — AI-style random plot twist generator for writer's block
- **Dark/Light Theme** — Vintage parchment aesthetic with theme toggle

## Tech Stack

| Layer    | Technology |
|----------|-----------|
| Backend  | Node.js + Express |
| Database | SQLite (via sqlite3) |
| Auth     | bcrypt + JWT |
| Frontend | Vanilla JavaScript (hash-based SPA) |
| Docs     | OpenAPI 3.0 (Swagger UI via CDN) |
| Tests    | Node.js built-in test runner |

## Setup

### Prerequisites

- Node.js v18+
- npm

### Installation

```bash
# 1. Clone or unzip the project
cd story-tracker

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env and set your JWT_SECRET

# 4. Start the server
npm start
```

The app will be available at `http://localhost:3000`.  
The database and all tables are created automatically on first run.

### Environment Variables

| Variable     | Required | Default | Description |
|--------------|----------|---------|-------------|
| `JWT_SECRET` | **Yes**  | —       | Secret key for signing JWT tokens. Use a long random string in production. |
| `PORT`       | No       | `3000`  | Port the server listens on. |

Example `.env`:

```
JWT_SECRET=some_long_random_string_at_least_32_chars
PORT=3000
```

## Running the App

```bash
# Development (auto-runs, no hot-reload)
npm start

# Or directly
node server.js
```

Then open `http://localhost:3000` in your browser. Register an account and start writing.

## Running Tests

Tests use Node.js's built-in runner — no extra packages needed:

```bash
npm test
```

This runs 4 test suites (41 tests total):

| Suite | What it tests |
|-------|--------------|
| `stats.test.js` | Word count, reading time, completion % calculations |
| `auth.test.js` | Registration and login input validation |
| `search.test.js` | Full-text search filter logic |
| `story.test.js` | Story creation validation and word count |

## API Overview

All protected routes require `Authorization: Bearer <token>` header.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login, receive JWT |
| GET | `/api/stories` | Yes | List all stories |
| POST | `/api/stories` | Yes | Create story |
| GET | `/api/stories/:id` | Yes | Get single story |
| PUT | `/api/stories/:id` | Yes | Update story |
| DELETE | `/api/stories/:id` | Yes | Delete story |
| GET | `/api/stories/:id/stats` | Yes | Story statistics |
| GET | `/api/stories/:id/hub/characters` | Yes | List characters |
| POST | `/api/stories/:id/hub/characters` | Yes | Add character |
| DELETE | `/api/stories/:id/hub/characters/:charId` | Yes | Delete character |
| GET | `/api/stories/:id/hub/lore` | Yes | List lore entries |
| POST | `/api/stories/:id/hub/lore` | Yes | Add lore entry |
| DELETE | `/api/stories/:id/hub/lore/:loreId` | Yes | Delete lore entry |
| GET | `/api/search?q=` | Yes | Search everything |
| GET | `/api/docs` | No | Swagger UI |
| GET | `/api/docs/json` | No | OpenAPI JSON spec |

## Swagger Documentation

Interactive API docs are available at:

```
http://localhost:3000/api/docs
```

The raw OpenAPI 3.0 spec (JSON) is at `/api/docs/json`.

## Folder Structure

```
story-tracker/
├── backend/
│   ├── controllers/       # Thin request handlers
│   │   ├── authController.js
│   │   ├── hubController.js
│   │   ├── searchController.js
│   │   └── statsController.js
│   ├── database/
│   │   ├── db.js          # SQLite connection + auto-schema
│   │   └── schema.sql     # Table definitions
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── docsRoutes.js  # Swagger + OpenAPI spec
│   │   ├── searchRoutes.js
│   │   └── storyRoutes.js
│   └── services/          # Business logic
│       ├── searchService.js
│       ├── statsService.js
│       └── storyService.js
├── public/
│   ├── app.js             # Vanilla JS SPA
│   ├── index.html
│   └── vintage.css
├── tests/
│   ├── auth.test.js
│   ├── run-all.js         # Test runner
│   ├── search.test.js
│   ├── stats.test.js
│   └── story.test.js
├── .env                   # Environment variables (not committed)
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## License

MIT
