import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      {/* Billing Overview Cards */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="bg-panel" padding="md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Total Billed</p>
              <p className="mt-4 text-3xl font-semibold font-display text-text-primary">₱2,350,000</p>
              <p className="mt-2 text-sm text-text-muted">+4.2% vs last month</p>
            </div>
            <Badge variant="success">+4.2%</Badge>
          </div>
        </Card>
        
        <Card className="bg-panel" padding="md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Collected</p>
              <p className="mt-4 text-3xl font-semibold font-display text-text-primary">₱1,920,000</p>
              <p className="mt-2 text-sm text-text-muted">81% Collection Rate</p>
            </div>
            <Badge variant="success">81%</Badge>
          </div>
        </Card>
        
        <Card className="bg-panel" padding="md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Outstanding</p>
              <p className="mt-4 text-3xl font-semibold font-display text-text-primary">₱430,000</p>
              <p className="mt-2 text-sm text-text-muted">🔴 18 overdue invoices</p>
            </div>
            <Badge variant="danger">18</Badge>
          </div>
        </Card>
        
        <Card className="bg-panel" padding="md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Upcoming Due</p>
              <p className="mt-4 text-3xl font-semibold font-display text-text-primary">₱220,000</p>
              <p className="mt-2 text-sm text-text-muted">12 tenants</p>
            </div>
            <Badge variant="subtle">7 days</Badge>
          </div>
        </Card>
      </section>

      {/* Collections Chart */}
      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-panel" padding="md">
          <h3 className="text-lg font-semibold font-display text-text-primary mb-4">Collections Overview</h3>
          <div className="h-48 flex items-end justify-between gap-2">
            <div className="flex-1 bg-border/20 rounded-t" style={{ height: '60%' }}></div>
            <div className="flex-1 bg-border/20 rounded-t" style={{ height: '80%' }}></div>
            <div className="flex-1 bg-status-success rounded-t" style={{ height: '45%' }}></div>
            <div className="flex-1 bg-status-success rounded-t" style={{ height: '90%' }}></div>
            <div className="flex-1 bg-status-success rounded-t" style={{ height: '70%' }}></div>
            <div className="flex-1 bg-status-danger rounded-t" style={{ height: '85%' }}></div>
          </div>
          <div className="flex justify-between mt-3 text-xs text-text-muted">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
          </div>
          <div className="flex gap-6 mt-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-border/20"></div>
              <span className="text-xs text-text-muted">Total Billed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-status-success"></div>
              <span className="text-xs text-text-muted">Paid</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-status-danger"></div>
              <span className="text-xs text-text-muted">Overdue</span>
            </div>
          </div>
        </Card>
        
        <Card className="bg-panel" padding="md">
          <h3 className="text-lg font-semibold font-display text-text-primary mb-4">Collection Rate</h3>
          <div className="flex flex-col items-center justify-center h-48">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="16" fill="none" className="text-border/20"></circle>
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="16" fill="none" className="text-status-success" strokeDasharray={`${2 * Math.PI * 56 * 0.81} ${2 * Math.PI * 56}`}></circle>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-semibold font-display text-text-primary">81%</p>
                  <p className="text-xs text-text-muted">Collected</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Invoice Filters */}
      <Card className="bg-panel" padding="md">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs font-medium rounded-full bg-accent text-white">All</button>
            <button className="px-3 py-1 text-xs font-medium rounded-full bg-border/20 text-text-muted hover:bg-border/40">Paid</button>
            <button className="px-3 py-1 text-xs font-medium rounded-full bg-border/20 text-text-muted hover:bg-border/40">Pending</button>
            <button className="px-3 py-1 text-xs font-medium rounded-full bg-border/20 text-text-muted hover:bg-border/40">Overdue</button>
          </div>
          <select className="px-3 py-1 text-sm border border-border/60 rounded-control bg-panel text-text-primary">
            <option>All Properties</option>
            <option>Tower 1</option>
            <option>Tower 2</option>
          </select>
          <select className="px-3 py-1 text-sm border border-border/60 rounded-control bg-panel text-text-primary">
            <option>All Units</option>
            <option>12B</option>
            <option>14A</option>
          </select>
          <input type="text" placeholder="Tenant search..." className="px-3 py-1 text-sm border border-border/60 rounded-control bg-panel text-text-primary" />
        </div>
      </Card>

      {/* Invoice Table */}
      <Card className="bg-panel" padding="md">
        <h3 className="text-lg font-semibold font-display text-text-primary mb-4">Invoices</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40">
                <th className="text-left py-3 px-4 font-medium text-text-muted">Invoice #</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Tenant</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Unit</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Due Date</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Status</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/20">
                <td className="py-3 px-4 text-text-primary">INV-2026-001</td>
                <td className="py-3 px-4 text-text-primary">Juan Dela Cruz</td>
                <td className="py-3 px-4 text-text-primary">12B</td>
                <td className="py-3 px-4 text-text-primary">₱15,000</td>
                <td className="py-3 px-4 text-text-primary">May 5</td>
                <td className="py-3 px-4">
                  <Badge variant="success">Paid</Badge>
                </td>
                <td className="py-3 px-4">
                  <button className="text-accent hover:underline text-sm">View</button>
                </td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-3 px-4 text-text-primary">INV-2026-002</td>
                <td className="py-3 px-4 text-text-primary">Maria Santos</td>
                <td className="py-3 px-4 text-text-primary">14A</td>
                <td className="py-3 px-4 text-text-primary">₱12,000</td>
                <td className="py-3 px-4 text-text-primary">May 5</td>
                <td className="py-3 px-4">
                  <Badge variant="danger">Overdue</Badge>
                </td>
                <td className="py-3 px-4">
                  <button className="text-accent hover:underline text-sm">Remind</button>
                </td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-3 px-4 text-text-primary">INV-2026-003</td>
                <td className="py-3 px-4 text-text-primary">Alex Tan</td>
                <td className="py-3 px-4 text-text-primary">8C</td>
                <td className="py-3 px-4 text-text-primary">₱10,000</td>
                <td className="py-3 px-4 text-text-primary">May 10</td>
                <td className="py-3 px-4">
                  <Badge variant="warning">Pending</Badge>
                </td>
                <td className="py-3 px-4">
                  <button className="text-accent hover:underline text-sm">Record Payment</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Overdue Section */}
      <Card className="bg-status-danger/10 border border-status-danger/30" padding="md">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold font-display text-text-primary">🚨 18 Overdue Invoices</h3>
            <p className="mt-1 text-sm text-text-muted">Total: ₱430,000</p>
          </div>
          <Button>Send Bulk Reminder</Button>
        </div>
      </Card>
    </div>
  );
}
