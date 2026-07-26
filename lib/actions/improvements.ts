"use server";

import { fail, ok, readNumber, readString, withAudit } from "@/lib/actions/common";
import { formatMoney } from "@/lib/format";
import type { ActionResult, ImprovementRequest, ImprovementStatus } from "@/lib/types";

const DECISIONS: ImprovementStatus[] = ["approved", "rejected", "completed"];

export async function createImprovementAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const tenantId = readString(formData, "tenantId");
  const title = readString(formData, "title");
  const description = readString(formData, "description");
  const estimatedCost = readNumber(formData, "estimatedCost");

  if (title.length < 3) return fail("Give the request a short title.");
  if (description.length < 10) return fail("Describe the improvement in a little more detail.");
  if (estimatedCost < 0) return fail("Estimated cost cannot be negative.");

  try {
    return withAudit("create", "Improvements", (db) => {
      const tenant = db.tenants.find((item) => item.id === tenantId);
      if (!tenant || !tenant.unitId) throw new Error("Tenant has no assigned unit.");

      const request: ImprovementRequest = {
        id: `imp-${String(db.improvements.length + 1).padStart(4, "0")}-${Date.now().toString(36)}`,
        tenantId: tenant.id,
        unitId: tenant.unitId,
        title,
        description,
        estimatedCost,
        status: "pending",
        createdAt: new Date().toISOString(),
        decidedAt: null,
        ownerResponse: null,
      };
      db.improvements.push(request);

      return {
        result: { ...ok(`Request "${title}" submitted for owner review.`), id: request.id },
        description: `Improvement request "${title}" submitted for ${tenant.name} (${formatMoney(estimatedCost)})`,
      };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not submit the request.");
  }
}

export async function decideImprovementAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const id = readString(formData, "improvementId");
  const decision = readString(formData, "decision") as ImprovementStatus;
  const response = readString(formData, "ownerResponse");

  if (!DECISIONS.includes(decision)) return fail("Unknown decision.");

  try {
    return withAudit("update", "Improvements", (db) => {
      const request = db.improvements.find((item) => item.id === id);
      if (!request) throw new Error("Request not found.");
      const tenant = db.tenants.find((item) => item.id === request.tenantId);

      request.status = decision;
      request.decidedAt = new Date().toISOString();
      if (response) request.ownerResponse = response;

      return {
        result: ok(`Request "${request.title}" marked ${decision}.`),
        description: `Improvement request "${request.title}" ${decision} for ${tenant?.name ?? "tenant"}`,
      };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not update the request.");
  }
}
