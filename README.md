# T-n-T - Inventory Management System

A full-stack web application for managing inventory with user authentication, item categorization, statistics tracking, and notifications.

## System Architecture

![System Architecture Diagram](./Diagrama_C3_Web.png)

## Technology Stack

### Frontend

- **HTML/CSS** - User interface markup and styling
- **TypeScript** - Type-safe frontend logic

### Backend

- **Node.js** - Runtime environment
- **TypeScript** - Type-safe server code
- **Express.js** - API routing and HTTP handling
- **PostgreSQL** - Primary database

### Infrastructure

- **Docker** - Containerization for Frontend and Backend

## Project Structure

```
T-n-T/
├── frontend/                    # Web UI
│   ├── index.html              # Home page
│   ├── login.html              # Login/Register page
│   ├── dashboard.html          # Main dashboard
│   └── public/css/             # Stylesheets
│
├── backend/                    # Node.js API server
│   ├── src/
│   │   ├── server.ts           # Application entry point
│   │   ├── config/             # Configuration files
│   │   │   ├── database.ts     # Database setup
│   │   │   └── env.ts          # Environment variables
│   │   ├── controllers/        # Route handlers
│   │   ├── routes/             # API route definitions
│   │   ├── services/           # Business logic
│   │   │   ├── emailService.ts # Email functionality
│   │   │   └── notificationService.ts
│   │   └── utils/              # Utility functions
│   ├── data/                   # Database files
│   ├── public/                 # Static assets
│   └── package.json            # Dependencies
│
├── docker-compose.yaml         # Docker configuration
├── package.json                # Root dependencies
└── README.md                   # This file
```

## Key Features

- **User Management** - Registration, authentication, and user administration
- **Inventory Management** - Create, update, and delete items with categories
- **Dashboard** - Visual overview of inventory and statistics
- **Statistics** - Import/export functionality with data visualization
- **Notifications** - Email notifications and in-app alerts
- **Admin Panel** - User and category management
- **CSV/PDF Support** - Data import/export capabilities

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (v20+) and npm
- PostgreSQL (or use Docker)

### Installation & Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd T-n-T
   ```

2. **Install dependencies**

   ```bash
   npm install
   cd backend && npm install && cd ..
   ```

3. **Configure environment variables**
   - Create `.env` file in the backend directory with required variables

4. **Start with Docker Compose**

   ```bash
   docker-compose up --build
   ```

   Or run locally:

   ```bash
   cd backend
   npm run dev
   ```

### Running the Application

- **Development Mode**: `npm run dev` in the backend directory
- **Production Build**: `npm run build && npm run start` in the backend directory
- **Access the Application**: Open http://localhost:3000 (or configured port) in your browser

## API Endpoints

The backend provides REST API endpoints for:

- **Users**: Authentication and management
- **Items**: CRUD operations on inventory items
- **Categories**: Category management
- **Statistics**: Data analytics and reporting
- **Notifications**: Alert and notification management

## Development

- Run backend in development mode: `npm run dev`
- The application includes hot-reload with Nodemon
- TypeScript compilation: `npm run build`

## License

ISC"
