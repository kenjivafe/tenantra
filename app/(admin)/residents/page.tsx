import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ResidentsPage() {
  return (
    <div className="space-y-6">
      {/* Top Actions */}
      <div className="flex flex-wrap gap-3">
        <Button>Add Resident</Button>
        <Button variant="secondary">Send Bulk Message</Button>
      </div>

      {/* Overview Cards */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="bg-panel" padding="md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Active Tenants</p>
              <p className="mt-4 text-3xl font-semibold font-display text-text-primary">4,100</p>
              <p className="mt-2 text-sm text-text-muted">Currently leased</p>
            </div>
            <Badge variant="success">4,100</Badge>
          </div>
        </Card>
        
        <Card className="bg-panel" padding="md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Pending Applications</p>
              <p className="mt-4 text-3xl font-semibold font-display text-text-primary">28</p>
              <p className="mt-2 text-sm text-text-muted">Awaiting approval</p>
            </div>
            <Badge variant="warning">28</Badge>
          </div>
        </Card>
        
        <Card className="bg-panel" padding="md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Expiring Leases</p>
              <p className="mt-4 text-3xl font-semibold font-display text-text-primary">47</p>
              <p className="mt-2 text-sm text-text-muted">Within 30 days</p>
            </div>
            <Badge variant="danger">47</Badge>
          </div>
        </Card>
        
        <Card className="bg-panel" padding="md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Blacklisted</p>
              <p className="mt-4 text-3xl font-semibold font-display text-text-primary">12</p>
              <p className="mt-2 text-sm text-text-muted">Not eligible</p>
            </div>
            <Badge variant="subtle">12</Badge>
          </div>
        </Card>
      </section>

      {/* Residents Table */}
      <Card className="bg-panel" padding="md">
        <h3 className="text-lg font-semibold font-display text-text-primary mb-4">Tenant Management</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40">
                <th className="text-left py-3 px-4 font-medium text-text-muted">Name</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Unit</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Lease Start</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Lease End</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Balance</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Status</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/20">
                <td className="py-3 px-4 text-text-primary font-medium">Juan Dela Cruz</td>
                <td className="py-3 px-4 text-text-primary">12B</td>
                <td className="py-3 px-4 text-text-primary">Jan 1, 2024</td>
                <td className="py-3 px-4 text-text-primary">Dec 31, 2024</td>
                <td className="py-3 px-4 text-text-primary">₱0</td>
                <td className="py-3 px-4">
                  <Badge variant="success">Active</Badge>
                </td>
                <td className="py-3 px-4">
                  <button className="text-accent hover:underline text-sm mr-3">View</button>
                  <button className="text-accent hover:underline text-sm">Message</button>
                </td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-3 px-4 text-text-primary font-medium">Maria Santos</td>
                <td className="py-3 px-4 text-text-primary">14A</td>
                <td className="py-3 px-4 text-text-primary">Feb 15, 2024</td>
                <td className="py-3 px-4 text-text-primary">Jun 14, 2025</td>
                <td className="py-3 px-4 text-text-primary">₱5,000</td>
                <td className="py-3 px-4">
                  <Badge variant="success">Active</Badge>
                </td>
                <td className="py-3 px-4">
                  <button className="text-accent hover:underline text-sm mr-3">View</button>
                  <button className="text-accent hover:underline text-sm">Message</button>
                </td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-3 px-4 text-text-primary font-medium">Alex Tan</td>
                <td className="py-3 px-4 text-text-primary">8C</td>
                <td className="py-3 px-4 text-text-primary">Mar 1, 2024</td>
                <td className="py-3 px-4 text-text-primary">May 31, 2025</td>
                <td className="py-3 px-4 text-text-primary">₱12,000</td>
                <td className="py-3 px-4">
                  <Badge variant="warning">Pending</Badge>
                </td>
                <td className="py-3 px-4">
                  <button className="text-accent hover:underline text-sm mr-3">Review</button>
                  <button className="text-accent hover:underline text-sm">Message</button>
                </td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-3 px-4 text-text-primary font-medium">Sarah Lee</td>
                <td className="py-3 px-4 text-text-primary">15D</td>
                <td className="py-3 px-4 text-text-primary">Apr 1, 2023</td>
                <td className="py-3 px-4 text-text-primary">May 15, 2025</td>
                <td className="py-3 px-4 text-text-primary">₱0</td>
                <td className="py-3 px-4">
                  <Badge variant="danger">Expiring</Badge>
                </td>
                <td className="py-3 px-4">
                  <button className="text-accent hover:underline text-sm mr-3">Renew</button>
                  <button className="text-accent hover:underline text-sm">Message</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
