# Cozy Chat

Cozy Chat is a full-stack real-time messaging platform built for high-concurrency environments. It supports dynamic room creation, per-channel user management, and seamless cross-platform communication via WebSockets.

## Core Features

- **Real-Time Messaging**: Implemented sub-100ms message delivery using STOMP over WebSockets.
- **Dynamic Channels**: Supports on-the-fly creation and joining of isolated chat rooms.
- **Presence Tracking**: Real-time monitoring of online users and typing indicators per channel.
- **Responsive Interface**: Mobile-first design built with React, Tailwind CSS, and Framer Motion for high-fidelity animations.
- **Zero-Auth Access**: Rapid onboarding via session-based unique usernames.

## Technical Architecture

### Backend (Spring Boot)
- **Messaging Engine**: Leverages Spring WebSocket and STOMP for asynchronous message brokering.
- **Thread Safety**: Uses `ConcurrentHashMap` and synchronized sets to manage room-state across multiple threads.
- **In-Memory Cache**: Implements a lightweight message cache for optimistic delivery tracking (Sent/Read receipts).
- **ISO-8601 Compliance**: Standardized timestamping for accurate message sequencing across timezones.

### Frontend (React)
- **State Management**: Optimized UI updates through custom hooks and efficient re-rendering strategies.
- **WebSocket Lifecycle**: Managed connection persistence and automatic reconnection logic.
- **Design System**: Custom CSS variables and Tailwind utility classes for a consistent, accessible dark/light mode experience.

## Technology Stack

- **Languages**: Java (OpenJDK 17), TypeScript, HTML/CSS.
- **Frameworks**: Spring Boot 3, React 18.
- **Build Tools**: Apache Maven, Vite.
- **Communication**: SockJS, STOMP.

## Development Setup

### Backend Prerequisites
- JDK 17+
- Maven 3.8+

```bash
cd backend/springboot-chat-server
mvn spring-boot:run
```

### Frontend Prerequisites
- Node.js 18+

1. Create a `frontend/react-chat-ui/.env` file:
   ```env
   VITE_API_URL=http://localhost:8080
   ```
2. Install dependencies and start:
   ```bash
   cd frontend/react-chat-ui
   npm install
   npm run dev
   ```

## Deployment

The application is architected for easy containerization and deployment:
- **Frontend**: Optimized for Vercel/Netlify with environment variable injection.
- **Backend**: Designed for Render/Heroku with built-in support for handling cloud instance "cold starts" during initialization.
