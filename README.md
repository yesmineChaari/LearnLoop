# LearnLoop

> A peer-to-peer skill exchange platform where users can connect, teach, and learn from each other.

## Overview

LearnLoop is a full-stack web application that facilitates knowledge sharing between users. The platform allows users to:

- **Share Skills**: List skills you can teach and skills you want to learn
- **Connect with Peers**: Send and receive friend requests to build your learning network
- **Schedule Study Sessions**: Create collaborative study sessions with matched skill exchanges
- **Real-time Chat**: Communicate with connections via instant messaging
- **Social Feed**: Share posts, engage with content through likes and comments

## Architecture

This project is built as an **Nx monorepo** containing:

| App          | Technology | Description                                |
| ------------ | ---------- | ------------------------------------------ |
| `angularApi` | Angular 21 | Frontend SPA with Material Design          |
| `nestApi`    | NestJS 11  | RESTful API backend with WebSocket support |

### Tech Stack

**Frontend:**

- Angular 21 with standalone components
- Angular Material & Tailwind CSS
- RxJS for reactive programming
- Socket.io for real-time features
- ApexCharts for data visualization

**Backend:**

- NestJS 11 with TypeORM
- PostgreSQL database
- JWT authentication with Passport.js
- WebSocket Gateway for real-time chat
- File upload support

## 📁 Project Structure

```
LearnLoop/
├── apps/
│   ├── angularApi/          # Angular frontend application
│   │   └── src/
│   │       ├── app/
│   │       │   ├── components/    # Reusable UI components
│   │       │   ├── pages/         # Route-based page components
│   │       │   ├── services/      # API & state services
│   │       │   ├── guards/        # Route guards
│   │       │   └── interceptors/  # HTTP interceptors
│   │       └── assets/            # Static assets & styles
│   │
│   ├── nestApi/             # NestJS backend application
│   │   └── src/
│   │       ├── auth/        # Authentication module
│   │       ├── users/       # User management
│   │       ├── skills/      # Skills catalog
│   │       ├── posts/       # Social feed & comments
│   │       ├── chat/        # Real-time messaging
│   │       ├── friend-requests/   # Connection management
│   │       └── study-sessions/    # Session scheduling
│   │
│   └── nestApi-e2e/         # End-to-end tests
│
├── nx.json                  # Nx workspace configuration
├── package.json             # Dependencies & scripts
└── tsconfig.base.json       # TypeScript configuration
```

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x or **yarn**
- **PostgreSQL** >= 14.x
- **Nx CLI**

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yesmineChaari/LearnLoop.git
   cd LearnLoop/LearnLoop
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create or update `apps/nestApi/.env`:

   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=your_username
   DB_PASS=your_password
   DB_NAME=learnloop
   JWT_SECRET=your_jwt_secret
   ```

4. **Set up the database**

   Create a PostgreSQL database named `learnloop`. The application uses TypeORM with `synchronize: true`, so tables will be created automatically on first run.

### Running the Application

**Start the backend (NestJS API):**

```bash
npx nx serve nestApi
```

The API will be available at `http://localhost:3000`

**Start the frontend (Angular):**

```bash
cd apps/angularApi
npm start
```

The app will be available at `http://localhost:4200`

**Run both concurrently:**

```bash
npx nx run-many --target=serve --projects=nestApi,angularApi
```

## Run With Docker (2 Containers)

This repository now includes a Docker Desktop setup with Linux containers:

- `app`: Node container running Nest API (`:3000`) and Angular app (`:4200`)
- `db`: PostgreSQL container (`:5432`)

### Start the stack

```bash
docker compose up --build
```

### Access the app

- Frontend: `http://localhost:4200`
- Backend API: `http://localhost:3000/api`

### Stop the stack

```bash
docker compose down
```

### Database schema and seed scripts

The DB container already ships with:

1. `docker/db/init/01_schema.sql`
2. `docker/db/init/02_seed.sql`

If you want your own dataset, edit these files directly.

These scripts run automatically only on first database initialization.

Demo seeded login users:

- `alice@learnloop.dev` / `Password123!`
- `bob@learnloop.dev` / `Password123!`
- `charlie@learnloop.dev` / `Password123!`

If you change schema/seed later, recreate volumes:

```bash
docker compose down -v
docker compose up --build
```

### Default startup seed

On app startup, default skills are seeded when `SEED_DEFAULT_DATA=true` (enabled by default in `docker-compose.yml`).

## Features

### User Management

- User registration and authentication (JWT)
- Profile management with bio and profile image
- Skills management (skills to teach & learn)

### Social Connections

- Send/receive friend requests
- Accept/decline connection requests
- View and manage your network

### Real-time Chat

- WebSocket-based instant messaging
- Conversation history
- Chat with connections

### Social Feed

- Create posts with optional media
- Like and comment on posts
- View feed from your network

### Study Sessions

- Create study sessions with skill exchange
- Session status tracking (pending/confirmed/canceled)
- Document sharing within sessions
