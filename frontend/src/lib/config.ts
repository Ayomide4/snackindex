// Configuration for the frontend application
export const config = {
  // Backend API URL - update this for production
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  
  // Revalidation settings
  revalidate: {
    // 24 hours in seconds
    daily: 86400,
    // 1 hour in seconds (for development)
    hourly: 3600,
  },
  
  // Feature flags
  features: {
    enableSearch: true,
    enableTrending: true,
    enableDetailPages: true,
  }
};

