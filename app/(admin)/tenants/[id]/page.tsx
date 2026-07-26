import { notFound } from "next/navigation";

import { TenantProfileView } from "@/components/tenants/tenant-profile-view";
import { getTenantProfile } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function TenantProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = getTenantProfile(id);
  if (!profile) notFound();

  return <TenantProfileView profile={profile} />;
}
