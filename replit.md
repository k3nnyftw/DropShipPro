# Dropshipify

## Overview

Dropshipify is a comprehensive dropshipping automation platform built with a modern full-stack architecture. The application provides AI-powered product discovery, automated supplier management, order fulfillment, pricing optimization, and social media marketing automation to help users build and scale their dropshipping businesses.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack Architecture
- **Frontend**: React with TypeScript, Vite build system, and Tailwind CSS
- **Backend**: Node.js with Express/TypeScript server and optional Python Flask/FastAPI services
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Caching**: Redis for performance optimization and session management
- **Real-time**: WebSocket support for live updates
- **Authentication**: Session-based authentication with bcrypt password hashing

### Design System
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **Styling**: Tailwind CSS with custom theme configuration
- **Theme System**: JSON-based theme configuration with light/dark mode support
- **Accessibility**: WCAG 2.1 compliance with screen reader support and keyboard navigation

## Key Components

### Core Services
1. **AI Analytics Service** - Analyzes market trends and product performance
2. **Product Discovery** - Automated product research and trend analysis
3. **Supplier Management** - Supplier sourcing, rating, and relationship management
4. **Order Fulfillment** - Automated order processing and tracking
5. **Inventory Management** - Real-time inventory tracking with automated reordering
6. **Price Optimization** - AI-driven pricing strategies based on market data
7. **Email Marketing** - Automated email campaigns with customer segmentation
8. **Social Media Integration** - Multi-platform content generation and posting

### Business Logic
- **Subscription Management**: Tiered pricing with Stripe integration (Free, Pro, Enterprise)
- **Feature Access Control**: Role-based access control for premium features
- **Demand Forecasting**: ML-based inventory and sales predictions
- **Competitor Tracking**: Automated price monitoring and competitive analysis

### Data Models
- Users with subscription plans and Stripe integration
- Products with inventory tracking and supplier relationships
- Orders with automated fulfillment workflows
- Suppliers with rating and performance metrics
- Social media accounts and scheduled posts
- Email campaigns and customer segments

## Data Flow

### User Journey
1. **Authentication**: Session-based login with secure password hashing
2. **Dashboard**: Real-time analytics and business metrics
3. **Product Discovery**: AI-powered product recommendations
4. **Supplier Selection**: Automated supplier matching and vetting
5. **Order Processing**: Automated fulfillment and tracking
6. **Marketing Automation**: Email and social media campaigns

### API Architecture
- RESTful API design with `/api` prefix
- TypeScript-first with Zod schema validation
- Error handling with structured error responses
- Rate limiting and security headers
- Comprehensive logging and monitoring

## External Dependencies

### Payment Processing
- **Stripe**: Subscription billing, payment processing, and webhook handling
- **Payment Intents**: Secure payment collection with SCA compliance

### Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL with connection pooling
- **Redis**: Caching layer for performance optimization
- **AWS Infrastructure**: ECS deployment with containerization

### Development Tools
- **Drizzle Kit**: Database migrations and schema management
- **Jest**: Comprehensive testing framework with React Testing Library
- **TypeScript**: Type safety across the entire codebase
- **ESLint/Prettier**: Code quality and formatting

### AI/ML Services
- Integrated AI services for product description generation
- Market trend analysis and demand forecasting
- Automated content creation for social media

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with HMR
- **Database**: Local PostgreSQL or Neon development database
- **Environment Variables**: `.env` file with development configurations

### Production Deployment
- **Containerization**: Docker with multi-stage builds
- **Container Orchestration**: AWS ECS with Fargate
- **Database**: Neon serverless PostgreSQL
- **CDN**: Static asset delivery optimization
- **Monitoring**: Structured logging with error tracking

### Security Measures
- **Helmet.js**: Security headers and CSRF protection
- **Rate Limiting**: API endpoint protection
- **Input Validation**: Zod schema validation throughout
- **HTTPS**: SSL/TLS encryption in production
- **Session Security**: Secure session configuration

### Performance Optimization
- **Code Splitting**: Lazy loading with React.lazy
- **Caching**: Redis caching for database queries
- **Image Optimization**: Responsive images and lazy loading
- **Mobile Optimization**: Touch-friendly interfaces and responsive design

The application is designed with scalability in mind, using modern development practices and cloud-native architecture to support growth from startup to enterprise level.