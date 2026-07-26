import { getDb } from "@/lib/store";
import { formatDate, formatMoney } from "@/lib/format";
import type { ImprovementRequest, Tenant, Unit } from "@/lib/types";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Wraps document body HTML so it downloads as a Word-openable .doc file. */
function wrapDocument(title: string, body: string) {
  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>
  @page { size: A4; margin: 2.2cm; }
  body { font-family: "Times New Roman", Georgia, serif; color: #1a1a1a; font-size: 12pt; line-height: 1.55; }
  h1 { text-align: center; font-size: 16pt; margin: 0 0 2pt; letter-spacing: 0.5px; }
  h2 { font-size: 12pt; margin: 18pt 0 6pt; border-bottom: 1px solid #999; padding-bottom: 2pt; }
  .sub { text-align: center; color: #555; margin: 0 0 18pt; font-size: 10pt; }
  table { width: 100%; border-collapse: collapse; margin: 6pt 0; }
  td { padding: 3pt 6pt; vertical-align: top; }
  td.k { width: 38%; color: #444; }
  td.v { font-weight: bold; }
  ul { margin: 4pt 0; padding-left: 18pt; }
  ol { margin: 4pt 0; padding-left: 20pt; }
  li { margin: 3pt 0; }
  .sign { margin-top: 42pt; width: 100%; }
  .sign td { width: 50%; text-align: center; padding-top: 26pt; }
  .line { border-top: 1px solid #333; padding-top: 3pt; font-size: 10pt; }
  .muted { color: #666; font-size: 10pt; }
</style>
</head>
<body>${body}</body>
</html>`;
}

export function buildContractDocument(tenant: Tenant, unit: Unit | null, locationName: string): string {
  const isResidential = tenant.contractType === "residential";
  const heading = isResidential ? "RESIDENTIAL LEASE CONTRACT" : "ACCOMMODATION AGREEMENT";
  const total = tenant.depositAmount + tenant.advanceAmount;

  const inventory = tenant.inventory.length
    ? `<ul>${tenant.inventory.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
    : `<p class="muted">No fixtures or appliances included (bare unit).</p>`;

  const body = `
    <h1>${heading}</h1>
    <p class="sub">${escapeHtml(unit ? `Unit ${unit.code}, ${locationName}` : locationName)} &middot; Generated ${formatDate(
      new Date().toISOString().slice(0, 10),
    )}</p>

    <p>This ${isResidential ? "Lease Contract" : "Accommodation Agreement"} is entered into by and between
    <b>${escapeHtml(tenant.lessor)}</b> (the "Lessor") and <b>${escapeHtml(tenant.name)}</b> (the "${
      isResidential ? "Lessee" : "Occupant"
    }"), under the following terms and conditions:</p>

    <h2>1. Premises</h2>
    <table>
      <tr><td class="k">Unit</td><td class="v">${escapeHtml(unit ? `${unit.code} — ${locationName}` : "To be assigned")}</td></tr>
      <tr><td class="k">Classification</td><td class="v">${escapeHtml(unit ? unit.category : "—")} / ${escapeHtml(
        tenant.contractType === "residential" ? "Long-term" : "Short-term",
      )}</td></tr>
      <tr><td class="k">Electric Meter No.</td><td class="v">${escapeHtml(unit?.electricMeterNo ?? "—")}</td></tr>
      <tr><td class="k">Water Meter No.</td><td class="v">${escapeHtml(unit?.waterMeterNo ?? "—")}</td></tr>
    </table>

    <h2>2. Term</h2>
    <table>
      <tr><td class="k">Lease Start</td><td class="v">${formatDate(tenant.leaseStart)}</td></tr>
      <tr><td class="k">Lease End</td><td class="v">${formatDate(tenant.leaseEnd)}</td></tr>
      <tr><td class="k">Term</td><td class="v">${tenant.termMonths} month(s)</td></tr>
    </table>

    <h2>3. Rent</h2>
    <table>
      <tr><td class="k">Monthly Rent</td><td class="v">${formatMoney(tenant.monthlyRent)}</td></tr>
      <tr><td class="k">Due Date</td><td class="v">Every ${tenant.dueDay}th of the month</td></tr>
      <tr><td class="k">Mode of Payment</td><td class="v">${escapeHtml(tenant.paymentMode.toUpperCase())}</td></tr>
    </table>
    <p class="muted">Electricity, water, and other utilities are billed separately based on actual usage.</p>

    <h2>4. Deposit and Advance</h2>
    <table>
      <tr><td class="k">Advance Rental (1 month)</td><td class="v">${formatMoney(tenant.advanceAmount)}</td></tr>
      <tr><td class="k">Security Deposit (1 month)</td><td class="v">${formatMoney(tenant.depositAmount)}</td></tr>
      <tr><td class="k">Total Paid Before Move-in</td><td class="v">${formatMoney(total)}</td></tr>
    </table>

    <h2>5. Leased Premises &amp; Inventory</h2>
    ${inventory}

    <h2>6. General Conditions</h2>
    <ol>
      <li>The ${isResidential ? "Lessee" : "Occupant"} shall pay rent on or before the due date. A ${
        "10%"
      } penalty applies to payments delayed by more than one (1) month.</li>
      <li>The ${isResidential ? "Lessee" : "Occupant"} is responsible for all utilities: electricity, water, internet, cable, and other charges.</li>
      <li>No subleasing, no short-stay hosting, and no alterations without prior written consent of the Lessor.</li>
      <li>Any improvement or upgrade to the premises requires an approved Request for Improvement prior to any work.</li>
      <li>The premises shall be maintained in good condition and returned as such at the end of the term.</li>
    </ol>

    <table class="sign">
      <tr>
        <td><div class="line">${escapeHtml(tenant.lessor)}<br/>Lessor / Owner</div></td>
        <td><div class="line">${escapeHtml(tenant.name)}<br/>${isResidential ? "Lessee" : "Occupant"}</div></td>
      </tr>
    </table>
  `;

  return wrapDocument(`${heading} — ${tenant.name}`, body);
}

export function buildImprovementLetter(
  improvement: ImprovementRequest,
  tenant: Tenant,
  unit: Unit | null,
  locationName: string,
): string {
  const body = `
    <h1>REQUEST FOR IMPROVEMENT</h1>
    <p class="sub">${escapeHtml(unit ? `Unit ${unit.code}, ${locationName}` : locationName)} &middot; ${formatDate(
      improvement.createdAt.slice(0, 10),
    )}</p>

    <p>To: <b>${escapeHtml(tenant.lessor)}</b> (Lessor / Owner)</p>
    <p>From: <b>${escapeHtml(tenant.name)}</b>${unit ? ` — Unit ${escapeHtml(unit.code)}, ${escapeHtml(locationName)}` : ""}</p>

    <p>Dear ${escapeHtml(tenant.lessor)},</p>

    <p>I am writing to formally request your approval for the following improvement to the leased premises:</p>

    <h2>${escapeHtml(improvement.title)}</h2>
    <p>${escapeHtml(improvement.description)}</p>

    <table>
      <tr><td class="k">Estimated Cost</td><td class="v">${formatMoney(improvement.estimatedCost)}</td></tr>
      <tr><td class="k">Status</td><td class="v">${escapeHtml(improvement.status.toUpperCase())}</td></tr>
    </table>

    <p>I understand that no work will commence until written approval is granted, and I commit to restoring the premises
    to its original condition at the end of the lease should this be required.</p>

    ${
      improvement.ownerResponse
        ? `<h2>Owner's Response</h2><p>${escapeHtml(improvement.ownerResponse)}</p>`
        : `<p class="muted">Awaiting the owner's response.</p>`
    }

    <table class="sign">
      <tr>
        <td><div class="line">${escapeHtml(tenant.name)}<br/>Requesting Tenant</div></td>
        <td><div class="line">${escapeHtml(tenant.lessor)}<br/>Approved by (Owner)</div></td>
      </tr>
    </table>
  `;

  return wrapDocument(`Improvement Request — ${tenant.name}`, body);
}

export function contractFor(tenantId: string) {
  const db = getDb();
  const tenant = db.tenants.find((item) => item.id === tenantId);
  if (!tenant) return null;
  const unit = tenant.unitId ? (db.units.find((item) => item.id === tenant.unitId) ?? null) : null;
  const locationName = unit ? (db.locations.find((loc) => loc.id === unit.locationId)?.name ?? "—") : "—";
  const filename = `Contract-${tenant.name.replace(/[^a-z0-9]+/gi, "-")}.doc`;
  return { html: buildContractDocument(tenant, unit, locationName), filename };
}

export function improvementLetterFor(improvementId: string) {
  const db = getDb();
  const improvement = db.improvements.find((item) => item.id === improvementId);
  if (!improvement) return null;
  const tenant = db.tenants.find((item) => item.id === improvement.tenantId);
  if (!tenant) return null;
  const unit = db.units.find((item) => item.id === improvement.unitId) ?? null;
  const locationName = unit ? (db.locations.find((loc) => loc.id === unit.locationId)?.name ?? "—") : "—";
  const filename = `Improvement-${tenant.name.replace(/[^a-z0-9]+/gi, "-")}.doc`;
  return { html: buildImprovementLetter(improvement, tenant, unit, locationName), filename };
}
