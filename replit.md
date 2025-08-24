# Retro Snake Chase Game

## Overview

This project is a retro-style Snake Chase game built with a full-stack architecture. The game features a classic 3-lane road where the player controls a snake to chase mice while avoiding obstacles. The frontend is built using React with Three.js for 3D graphics, styled with Tailwind CSS and shadcn/ui components. The backend is an Express.js server with PostgreSQL database integration using Drizzle ORM. The game includes Web Audio API for retro sound effects and a comprehensive UI system with game state management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **3D Graphics**: Three.js with React Three Fiber for 3D rendering and game graphics
- **State Management**: Zustand for lightweight global state management (game state and audio state)
- **Styling**: Tailwind CSS for utility-first styling with shadcn/ui component library
- **Build Tool**: Vite for fast development and optimized production builds
- **Canvas Rendering**: HTML5 Canvas with 2D context for the core game mechanics

### Game Engine Design
- **Game Loop**: Traditional game loop with 60 FPS using requestAnimationFrame
- **Game States**: State machine with phases (ready, playing, ended)
- **Audio System**: Web Audio API for procedural retro sound generation with separate channels for music and sound effects
- **Input Handling**: Keyboard controls with lane-switching and boost mechanics
- **Collision Detection**: Basic bounding box collision detection for game objects

### Backend Architecture
- **Server Framework**: Express.js with TypeScript for API endpoints
- **Development Environment**: tsx for TypeScript execution in development
- **Production Build**: esbuild for bundling server code
- **Session Management**: Prepared for connect-pg-simple session store
- **Error Handling**: Centralized error handling middleware

### Data Storage
- **Database**: PostgreSQL with Neon serverless database
- **ORM**: Drizzle ORM for type-safe database operations
- **Migrations**: Drizzle Kit for database schema management
- **Schema**: User authentication schema with username/password fields

### UI/UX Components
- **Component Library**: Comprehensive shadcn/ui components (buttons, cards, dialogs, etc.)
- **Responsive Design**: Mobile-first responsive design with Tailwind CSS
- **Accessibility**: ARIA-compliant components from Radix UI primitives
- **Typography**: Inter font for modern typography

### Development Tools
- **Type Checking**: Comprehensive TypeScript configuration
- **CSS Processing**: PostCSS with Tailwind CSS and Autoprefixer
- **Hot Reload**: Vite HMR for instant development feedback
- **Path Aliases**: TypeScript path mapping for clean imports (@/ and @shared/)

## External Dependencies

### Core Frameworks
- **React Ecosystem**: React 18, React DOM, React Three Fiber for 3D graphics
- **Three.js**: 3D graphics library with React Three Drei for helpers
- **Express.js**: Node.js web application framework

### Database & ORM
- **PostgreSQL**: Primary database via Neon serverless
- **Drizzle ORM**: Type-safe ORM with schema validation using Zod

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Unstyled, accessible component primitives
- **Lucide React**: Icon library for UI components
- **shadcn/ui**: Pre-built component library

### State Management & Utilities
- **Zustand**: Lightweight state management
- **TanStack Query**: Server state management for API calls
- **React Hook Form**: Form handling and validation
- **class-variance-authority**: Component variant styling

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Static type checking
- **esbuild**: Fast JavaScript bundler for production
- **Drizzle Kit**: Database migration and schema tools

### Audio & Graphics
- **Web Audio API**: Browser-native audio processing
- **Canvas API**: 2D graphics rendering for game elements
- **React Three Postprocessing**: Post-processing effects for 3D scenes

### Deployment
- **Vercel**: Static site deployment with serverless functions support
- **Neon Database**: Serverless PostgreSQL hosting