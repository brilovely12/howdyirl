import { redirect } from "next/navigation";

export default async function CityHome({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  redirect(`/${city}/groups`);
}
