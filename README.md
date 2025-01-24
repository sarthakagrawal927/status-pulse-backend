# Service Status Tracker API

A robust backend API for managing service status tracking, incident reporting, and team collaboration.

## Features

- Multi-tenant architecture with organization support
- User authentication and role-based access control
- Service status management
- Incident tracking and real-time updates
- Team management with role-based permissions
- Real-time updates using WebSocket

## Prerequisites

- Node.js >= 18.18.0
- PostgreSQL
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/service_tracker?schema=public"
   PORT=3000
   FRONTEND_URL="http://localhost:3000"
   ```

4. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new organization and admin user
- POST `/api/auth/login` - Login user

### Services
- GET `/api/services` - Get all services for the organization
- GET `/api/services/:id` - Get a specific service
- POST `/api/services` - Create a new service (Admin only)
- PATCH `/api/services/:id` - Update a service (Admin only)
- DELETE `/api/services/:id` - Delete a service (Admin only)

### Incidents
- GET `/api/incidents` - Get all incidents
- GET `/api/incidents/:id` - Get a specific incident
- POST `/api/incidents` - Create a new incident (Admin only)
- PATCH `/api/incidents/:id` - Update an incident (Admin only)
- DELETE `/api/incidents/:id` - Delete an incident (Admin only)
- POST `/api/incidents/:id/updates` - Add a status update to an incident (Admin only)

### Team Management
- GET `/api/teams` - Get all team members
- POST `/api/teams/invite` - Invite a new team member (Admin only)
- PATCH `/api/teams/:id` - Update team member role (Admin only)
- DELETE `/api/teams/:id` - Remove a team member (Admin only)

## Development

The project uses the following technologies:
- Express.js for the API server
- Prisma as the ORM
- PostgreSQL for the database
- Socket.IO for real-time updates
- TypeScript for type safety

## Scripts

- `npm run dev` - Start development server with hot-reload
- `npm run build` - Build the project
- `npm start` - Start the production server
