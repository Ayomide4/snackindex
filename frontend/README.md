# The Snack Index - Next.js Frontend

A modern Next.js application for tracking and analyzing snack food popularity using real-time data from Google Trends, Reddit, and news sources.

## 🚀 Features

- **Interactive Dashboard**: View trending snacks and comprehensive rankings
- **Search Functionality**: Find specific snacks by name or brand
- **Detailed Analytics**: Dive deep into individual snack performance with charts and metrics
- **Real-time Data**: Integration with backend data collection system
- **Responsive Design**: Optimized for desktop and mobile devices
- **Modern UI**: Built with Tailwind CSS and custom components

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom design system
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **TypeScript**: Full type safety
- **Components**: Custom UI component library

## 📦 Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file with:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── SnackCard.tsx     # Individual snack cards
│   ├── SnackList.tsx     # Snack listings
│   ├── SnackDetail.tsx   # Detailed snack view
│   └── SnackIndexDashboard.tsx # Main dashboard
├── lib/                  # Utility functions
│   ├── api.ts           # API integration
│   └── utils.ts         # General utilities
└── types/               # TypeScript definitions
    └── index.ts         # Data type definitions
```

## 🔧 Key Components

### Dashboard (`SnackIndexDashboard`)
The main dashboard featuring:
- Header with search functionality
- Trending snacks section (cards view)
- All snacks section (list view)
- Navigation between views

### Snack Card (`SnackCard`)
Interactive cards displaying:
- Snack name and brand
- Current score with progress bar
- Trending status and percentage change
- Hover effects and animations

### Snack Detail (`SnackDetail`)
Comprehensive snack analysis including:
- Score timeline chart
- Sentiment analysis breakdown
- Recent news and social media mentions
- Navigation back to main dashboard

## 🔌 API Integration

The frontend connects to the backend data collection system through:

- **Trending Snacks**: `/api/snacks/trending`
- **All Snacks**: `/api/snacks/all`
- **Snack Details**: `/api/snacks/{id}/metrics`
- **Search**: `/api/snacks/search?q={query}`

### Mock Data
Currently uses mock data for demonstration. To connect to real data:

1. Update API endpoints in `src/lib/api.ts`
2. Configure database connection in API routes
3. Set proper environment variables

## 🚀 Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🚀 Deployment

The easiest way to deploy is using [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme):

```bash
npm install -g vercel
vercel --prod
```

## 📊 Code Conversion Notes

This Next.js application was converted from the original "The Snack Index Design" with the following improvements:

- ✅ Converted from Vite/React to Next.js 15 with App Router
- ✅ Updated component architecture for server/client separation
- ✅ Added comprehensive TypeScript definitions
- ✅ Integrated API routes for backend connectivity
- ✅ Preserved all original UI design and functionality
- ✅ Enhanced with proper SEO metadata and layout structure
- ✅ Added search functionality with real-time filtering
- ✅ Maintained responsive design and animations
- ✅ Created reusable UI component library

The core functionality and visual design remain identical to the original, now optimized for production deployment with Next.js best practices.
