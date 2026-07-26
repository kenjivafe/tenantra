import { contractFor } from "@/lib/documents";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const doc = contractFor(tenantId);
  if (!doc) return new Response("Contract not found", { status: 404 });

  return new Response(doc.html, {
    headers: {
      "Content-Type": "application/msword; charset=utf-8",
      "Content-Disposition": `attachment; filename="${doc.filename}"`,
    },
  });
}
