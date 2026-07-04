import { redirect } from "next/navigation";

// Events are locked as "coming soon" — no new events for now.
export default async function NewEventPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  redirect(`/${city}/events`);
}
