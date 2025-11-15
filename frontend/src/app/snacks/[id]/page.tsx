import { notFound } from "next/navigation";
import { SnackDetail } from "@/components/SnackDetail";
import { api } from "@/lib/api";

// This function runs at build time and revalidates every 24 hours
export const revalidate = 86400 //daily

export async function generateStaticParams() {
  try {
    const snacks = await api.getSnacks();
    return snacks.map((snack) => ({
      id: String(snack.id),
    }));
  } catch (error) {
    console.error("Error in generateStaticParams:", error);
    return [];
  }
}

export default async function SnackPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const snackDetailData = await api.getSnackDetailData(parseInt(id));

    return (
      <SnackDetail
        data={snackDetailData}
        onBack={() => window.history.back()}
      />
    );
  } catch (error) {
    console.error("Failed to fetch snack detail:", error);
    notFound();
  }
}
