# Backend-Frontend Integration Setup

This document explains how to integrate the NestJS backend with the Next.js frontend for the Snack Index application.

## Overview

The integration uses:
- **Backend**: NestJS API running on port 3001
- **Frontend**: Next.js with static generation and revalidation
- **Data Flow**: Python collector → Supabase → Backend API → Frontend
- **Update Frequency**: Daily (24-hour revalidation)

## Setup Instructions

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your Supabase connection in the backend environment variables

4. Start the backend in development mode:
   ```bash
   npm run start:dev
   ```

   The backend will run on `http://localhost:3001`

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env.local
   ```

4. Update the API URL in `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

5. Start the frontend in development mode:
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:3000`

### 3. Production Build

For production deployment:

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   npm start
   ```

2. The static generation will:
   - Fetch data at build time
   - Revalidate every 24 hours
   - Serve cached pages for better performance

## API Endpoints

The backend provides these endpoints:

- `GET /snacks` - Get all snacks
- `GET /snacks/all` - Get all snacks with metrics
- `GET /snacks/trending` - Get trending snacks
- `GET /snacks/search?q=query` - Search snacks
- `GET /snacks/:id` - Get specific snack
- `GET /snacks/:id/metrics` - Get snack metrics
- `GET /snacks/:id/detail` - Get detailed snack data

## Static Generation

The frontend uses Next.js static generation with:

- **Home page**: Fetches trending snacks at build time
- **Snack detail pages**: Pre-generated for all snacks
- **Revalidation**: Every 24 hours (86400 seconds)
- **Fallback**: Graceful handling of API failures

## Data Flow

1. **Python Collector** runs daily and updates Supabase
2. **Backend API** serves data from Supabase
3. **Frontend** fetches data at build time and revalidates daily
4. **Users** see fast, cached pages with daily updates

## Environment Variables

### Backend
- Supabase URL and keys (configured in backend)

### Frontend
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:3001)

## Troubleshooting

1. **Backend not starting**: Check Supabase configuration
2. **Frontend API errors**: Verify backend is running on correct port
3. **Build failures**: Ensure backend is accessible during build
4. **Data not updating**: Check revalidation settings and backend data

## Development vs Production

### Development
- Backend runs on port 3001
- Frontend runs on port 3000
- Hot reloading enabled
- API calls made at runtime

### Production
- Static generation at build time
- 24-hour revalidation
- Cached pages for performance
- Fallback to mock data if API fails