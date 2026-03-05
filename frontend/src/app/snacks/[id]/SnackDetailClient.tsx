"use client";

import { useRouter } from "next/navigation";
import { SnackDetail } from "@/components/SnackDetail";
import { SnackDetailData } from "@/types";

export function SnackDetailClient({ data }: { data: SnackDetailData }) {
  const router = useRouter();
  return <SnackDetail data={data} onBack={() => router.back()} />;
}
