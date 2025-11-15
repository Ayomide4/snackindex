import { SnackIndexDashboard } from "@/components/SnackIndexDashboard";
import { api } from "@/lib/api";
import { config } from "@/lib/config";

// This function runs at build time and revalidates every 24 hours
// export const revalidate = config.revalidate.daily;

export const revalidate = 86400 //daily

export default async function Home() {
  try {
    // Fetch trending snacks data at build time
    const trendingSnacks = await api.getTrendingSnacks();

    return <SnackIndexDashboard initialData={trendingSnacks} />;
  } catch (error) {
    console.error("Failed to fetch initial data:", error);
    // Return the component without initial data - it will handle loading states
    return <SnackIndexDashboard />;
  }
}
