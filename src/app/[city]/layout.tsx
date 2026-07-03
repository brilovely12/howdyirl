import { notFound } from "next/navigation";
import { VALID_CITIES } from "@/lib/cities";

export default async function CityLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  if (!VALID_CITIES.includes(city)) notFound();
  return <>{children}</>;
}
