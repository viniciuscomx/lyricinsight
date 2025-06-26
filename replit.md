# LyricAI - Intelligent Music Lyrics Analysis

## Overview

LyricAI is a full-stack web application that provides intelligent analysis of music lyrics using AI. The application allows users to input song lyrics and receive detailed analysis including cultural references, interesting facts, and insights into the artist's intentions. Built with a modern TypeScript stack, it features a React frontend with shadcn/ui components and an Express.js backend powered by OpenAI's GPT-4 model.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom configuration for development and production
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Hookform Resolvers for validation

### Backend Architecture
- **Runtime**: Node.js 20 with TypeScript
- **Framework**: Express.js with custom middleware for logging and error handling
- **AI Integration**: OpenAI API using GPT-4 model for lyrics analysis
- **Data Storage**: In-memory storage with Drizzle ORM schema definitions for future database integration
- **Session Management**: Express sessions with PostgreSQL session store configuration
- **Build Process**: ESBuild for server-side bundling

### Key Design Decisions

**Monorepo Structure**: The application uses a monorepo structure with separate `client/`, `server/`, and `shared/` directories to enable code sharing between frontend and backend while maintaining clear separation of concerns.

**Type Safety**: End-to-end TypeScript implementation with shared schemas using Drizzle-Zod for runtime validation and type inference.

**AI-First Approach**: The core functionality revolves around OpenAI's GPT-4 model, chosen for its superior language understanding capabilities for analyzing lyrical content.

**Component-Based UI**: Leverages shadcn/ui for consistent, accessible, and customizable components built on proven Radix UI primitives.

## Key Components

### Data Models
- **Users**: Basic user management with username/password authentication
- **Lyrics Analyses**: Stores analysis results with structured data for references, curiosities, and author intentions
- **Shared Validation**: Zod schemas for request/response validation

### API Endpoints
- `POST /api/analyze`: Accepts lyrics input and returns AI-generated analysis
- `GET /api/analysis/:id`: Retrieves stored analysis by ID
- Session-based endpoints for user management (configured but not fully implemented)

### Frontend Components
- **Home Page**: Main interface for lyrics input and analysis display
- **UI Components**: Complete shadcn/ui component library including forms, cards, dialogs, and data display components
- **Error Handling**: Custom error pages and toast notifications

## Data Flow

1. **User Input**: User enters lyrics through the textarea component on the home page
2. **Validation**: Client-side validation ensures minimum character requirements
3. **API Request**: React Query mutation sends lyrics to the `/api/analyze` endpoint
4. **AI Processing**: Server forwards lyrics to OpenAI API with structured prompt for analysis
5. **Data Storage**: Analysis results are stored in memory using the storage abstraction layer
6. **Response**: Client receives structured analysis data including references, curiosities, and author intentions
7. **UI Update**: Results are displayed in organized sections with icons and formatted text

## External Dependencies

### Core Dependencies
- **OpenAI API**: Primary AI service for lyrics analysis using GPT-4 model
- **Neon Database**: PostgreSQL-compatible serverless database (configured via @neondatabase/serverless)
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect
- **Radix UI**: Headless UI components for accessibility and functionality
- **TanStack Query**: Server state management and caching

### Development Tools
- **Vite**: Fast development server and build tool
- **Replit Integration**: Custom plugins for development environment
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS & Autoprefixer**: CSS processing pipeline

## Deployment Strategy

### Development Environment
- **Runtime**: Replit environment with Node.js 20, PostgreSQL 16, and web modules
- **Process**: `npm run dev` starts the development server with hot reloading
- **Port Configuration**: Development server runs on port 5000 with external port 80 mapping

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: ESBuild bundles server code as ESM module to `dist/index.js`
- **Deployment**: Replit autoscale deployment target with build and run commands configured
- **Environment**: Production mode with NODE_ENV=production

### Database Strategy
The application is designed with database flexibility in mind. Currently using in-memory storage for development, but includes complete Drizzle ORM configuration for PostgreSQL. The schema supports future migration to persistent storage without code changes to the business logic.

## Changelog
- June 25, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.