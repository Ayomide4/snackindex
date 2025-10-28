import { SnackIndexDashboard } from "@/components/SnackIndexDashboard";
import type { GetStaticPaths, GetStaticProps } from 'next'

interface Snack {
  id: number;
  name: string;
  company: { name: string };
}

// Next.js recognizes and executes this function.
// The console.log output will appear in your terminal.
export const getStaticPaths: GetStaticPaths = async () => {
  try {
    // Correctly point to the /snacks endpoint
    const res = await fetch("http://localhost:3000/snacks");

    // Check if the response is ok before trying to parse JSON
    if (!res.ok) {
      throw new Error(`Failed to fetch snacks: ${res.status}`);
    }

    const snacks = await res.json();
    console.log("Fetched snacks in getStaticPaths:", snacks);

    // Ensure the paths are correctly returned
    const paths = snacks.map((snack: Snack) => ({
      params: { id: String(snack.id) },
    }));

    return {
      paths,
      fallback: 'blocking',
    };
  } catch (error) {
    console.error("Failed to fetch snacks in getStaticPaths:", error);
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
};

export default function Home() {
  return <SnackIndexDashboard />;
}
