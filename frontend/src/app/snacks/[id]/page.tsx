import { notFound } from "next/navigation";

interface Snack {
  id: number;
  name: string;
  company: { name: string };
}

export async function generateStaticParams() {
  try {
    const res = await fetch("http://localhost:3000/snacks");
    if (!res.ok) {
      throw new Error("Failed to fetch snacks for static path generation");
    }
    const snacks = await res.json();

    return snacks.map((snack: Snack) => ({
      id: String(snack.id),
    }));
  } catch (error) {
    console.error("Error in generateStaticParams:", error);
    return [];
  }
}

async function getSnack(id: string) {
  const res = await fetch(`http://localhost:3000/snacks/${id}`);
  if (!res.ok) {
    notFound();
  }
  return res.json();
}

export default async function SnackPage({ params }: { params: { id: string } }) {
  const snack = await getSnack(params.id);

  return (
    <div>
      <h1>{snack.name} </h1>
    </div>
  );
}
