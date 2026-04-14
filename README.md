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

## 📋 Features

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

## Testing

**Run unit tests:**

```bash
npx nx test nestApi
npx nx test angularApi
```

**Run e2e tests:**

```bash
npx nx e2e nestApi-e2e
```

