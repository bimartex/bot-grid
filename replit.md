# Infinity Grid Bot Web Application

## Overview

This project is a web application for managing cryptocurrency grid trading bots. It features a React frontend with Tailwind CSS and shadcn/ui components, and a Node.js Express backend. The application uses Drizzle ORM for database operations and is set up to work with PostgreSQL. Users can create, monitor, and manage grid trading bots that execute trades on cryptocurrency exchanges using the Bitget API.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with React and uses a component-based architecture with the following key characteristics:

1. **Component Structure**: Uses a mix of page components and reusable UI components
2. **State Management**: Uses React Query for server state and local React state for UI state
3. **Routing**: Uses Wouter for lightweight client-side routing
4. **Styling**: Uses Tailwind CSS with a custom theme configuration and shadcn/ui components
5. **API Integration**: Communicates with the backend through a custom API client

The frontend is organized into:
- Pages (Dashboard, Assets, History, Settings)
- Layout components (Layout, Sidebar)
- Feature components (ActiveBotCard, BotsList, etc.)
- UI components (shadcn/ui components)

### Backend Architecture

The backend uses Express.js and follows these architectural principles:

1. **API-first**: Exposes RESTful endpoints for all bot operations
2. **Modular design**: Separate modules for routes, storage, and exchange API integration
3. **Database abstraction**: Uses Drizzle ORM for database operations
4. **Service layer**: Bitget client for exchange API communication

### Data Layer

The application uses a PostgreSQL database with Drizzle ORM for:
1. **User management**: Storing user credentials and preferences
2. **Bot configuration**: Storing grid bot settings and parameters
3. **Transactions**: Recording trading history
4. **API configuration**: Storing exchange API credentials

## Key Components

### Frontend Components

1. **Dashboard** - Main interface showing active bots and summary statistics
2. **Assets** - Overview of user investments and portfolio allocation
3. **History** - Transaction history and trading performance
4. **Settings** - User preferences and API configuration
5. **CreateBotModal** - Interface for setting up new grid trading bots
6. **ActiveBotCard** - Detailed view of a running bot with performance metrics
7. **GridConfiguration** - Component for configuring grid parameters

### Backend Components

1. **Express Server** - Handles HTTP requests and API routing
2. **Storage Interface** - Abstraction for database operations
3. **Bitget Client** - Integration with Bitget cryptocurrency exchange
4. **Route Handlers** - API endpoint implementations

### Database Schema

1. **Users** - User authentication and profile information
2. **Bots** - Grid bot configurations and parameters
3. **Transactions** - Trading history and performance metrics
4. **API Configs** - Exchange API credentials storage

## Data Flow

1. **Bot Creation Flow**
   - User inputs grid parameters in the CreateBotModal
   - Frontend validates the input and sends to backend API
   - Backend creates bot records and initializes the trading strategy
   - Real-time updates are sent back to the frontend

2. **Trading Flow**
   - Backend monitors price movements using exchange API
   - Grid strategy executes buy/sell orders at predetermined price levels
   - Transactions are recorded in the database
   - Dashboard displays real-time performance metrics

3. **Authentication Flow**
   - User logs in through the frontend
   - Backend validates credentials and issues a session
   - Session is used for all subsequent API requests

## External Dependencies

### Frontend Dependencies
- React for UI building
- Tailwind CSS for styling
- shadcn/ui for UI components
- React Query for data fetching
- Wouter for routing
- Recharts for data visualization

### Backend Dependencies
- Express.js for API server
- Drizzle ORM for database operations
- @neondatabase/serverless for database connectivity
- Crypto library for signing API requests

### External Services
- Bitget API for cryptocurrency trading

## Deployment Strategy

The application is configured for deployment on Replit with:

1. **Development Environment**
   - `npm run dev` runs the development server
   - Vite provides hot module replacement

2. **Production Build**
   - `npm run build` creates optimized production build
   - Frontend assets are bundled with Vite
   - Backend is bundled with esbuild

3. **Database Setup**
   - PostgreSQL module is included in Replit configuration
   - Database schema is managed through Drizzle ORM
   - Migrations can be run with `npm run db:push`

4. **Runtime Environment**
   - Node.js server serves both API and static assets
   - Environment variables control database connection and API keys

## Getting Started

1. Set up environment variables:
   - `DATABASE_URL` - PostgreSQL connection string
   - Exchange API credentials (for production)

2. Initialize the database:
   ```
   npm run db:push
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Access the application at http://localhost:5000

## Future Development

Areas for potential enhancement:
1. Adding more exchange integrations beyond Bitget
2. Implementing more sophisticated trading strategies
3. Adding authentication with JWT or OAuth
4. Expanding portfolio analytics and reporting features
5. Adding real-time notifications for trade events