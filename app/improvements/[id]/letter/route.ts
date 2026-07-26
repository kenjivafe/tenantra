import { improvementLetterFor } from "@/lib/documents";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = improvementLetterFor(id);
  if (!doc) return new Response("Improvement request not found", { status: 404 });

  return new Response(doc.html, {
    headers: {
      "Content-Type": "application/msword; charset=utf-8",
      "Content-Disposition": `attachment; filename="${doc.filename}"`,
    },
  });
}
