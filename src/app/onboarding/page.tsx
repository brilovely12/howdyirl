import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import OnboardingForm from "@/components/OnboardingForm";

export const dynamic = "force-dynamic";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ taken?: string }>;
}) {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  if (session.member) redirect("/groups");
  const sp = await searchParams;
  return <OnboardingForm taken={!!sp.taken} />;
}
