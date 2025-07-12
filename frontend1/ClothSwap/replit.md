# ReWear - Clothing Exchange Platform

## Overview

This is a full-stack clothing exchange application built with React, Express.js, TypeScript, and PostgreSQL. The platform allows users to swap clothing items directly or redeem items using a points-based system. It features an admin panel for content moderation and a modern UI built with shadcn/ui components.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with OpenID Connect integration
- **File Handling**: Multer for image uploads with size and type validation
- **Session Management**: Express sessions with PostgreSQL storage

### Database Design
- **Primary Database**: PostgreSQL via Neon serverless driver
- **Schema Management**: Drizzle migrations in `/migrations` directory
- **Key Tables**:
  - `users`: User profiles with points and admin flags
  - `items`: Clothing items with approval workflow
  - `swaps`: Exchange transactions between users
  - `point_transactions`: Point transfer history
  - `sessions`: Authentication session storage

## Key Components

### Authentication System
- **Provider**: Replit Auth with OAuth 2.0/OpenID Connect flow
- **Session Storage**: PostgreSQL-backed sessions with 7-day expiration
- **Authorization**: Role-based access control (admin vs regular users)
- **Middleware**: Authentication guards for protected routes

### Item Management System
- **Upload Flow**: Multi-image upload with file validation (JPEG, PNG, WebP, 5MB max)
- **Approval Workflow**: Three-state system (pending → approved/rejected)
- **Categories**: Structured clothing categorization (tops, bottoms, etc.)
- **Point System**: Dynamic pricing based on item condition and category

### Exchange System
- **Direct Swaps**: User-to-user item exchanges with messaging
- **Point Redemption**: Purchase items using earned points
- **Transaction History**: Complete audit trail of all exchanges
- **Status Tracking**: Multi-stage swap process (requested → accepted → completed)

### Admin Panel
- **Content Moderation**: Approve/reject pending item submissions
- **Analytics Dashboard**: Key metrics and system statistics
- **User Management**: View user activities and point balances
- **Bulk Operations**: Efficient management of multiple items

## Data Flow

### Item Submission Flow
1. User uploads item with images via `/api/items` POST endpoint
2. Files stored in `/uploads` directory with unique names
3. Item created with "pending" status in database
4. Admin reviews and approves/rejects via admin panel
5. Approved items become available for swapping/redemption

### Exchange Flow
1. User initiates swap request via `/api/swaps` POST endpoint
2. System validates user points and item availability
3. For point redemption: immediate completion with point deduction
4. For direct swaps: owner receives notification to accept/decline
5. Completed swaps update item ownership and user points

### Authentication Flow
1. User redirects to `/api/login` for Replit Auth
2. OAuth flow completes with user profile data
3. Session established and stored in PostgreSQL
4. Protected routes verify session via middleware
5. User profile accessible at `/api/auth/user`

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless driver
- **drizzle-orm**: Type-safe database ORM with schema validation
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **multer**: File upload handling middleware

### Authentication
- **openid-client**: OAuth 2.0/OpenID Connect client implementation
- **passport**: Authentication middleware for Express
- **connect-pg-simple**: PostgreSQL session store adapter

### Development Tools
- **tsx**: TypeScript execution for development server
- **esbuild**: Fast JavaScript bundler for production builds
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay

## Deployment Strategy

### Development Environment
- **Dev Server**: `npm run dev` starts both Vite frontend and Express backend
- **Database**: Drizzle push commands for schema synchronization
- **Hot Reload**: Vite HMR for frontend, tsx watch mode for backend
- **Error Handling**: Runtime error overlays and comprehensive logging

### Production Build
- **Frontend**: Vite builds optimized static assets to `/dist/public`
- **Backend**: esbuild bundles Express server to `/dist/index.js`
- **Static Serving**: Express serves built frontend assets in production
- **Process**: Single Node.js process serves both API and static files

### Database Management
- **Migrations**: Schema changes via Drizzle Kit push commands
- **Connection**: Serverless PostgreSQL with connection pooling
- **Environment**: Database URL required via `DATABASE_URL` environment variable
- **Session Storage**: Automatic session table creation and management

### Security Considerations
- **HTTPS**: Required for authentication cookies in production
- **CORS**: Configured for file serving and API access
- **File Validation**: Strict type and size limits on uploads
- **Session Security**: HTTP-only cookies with secure flags
- **Input Validation**: Zod schemas for all API endpoints