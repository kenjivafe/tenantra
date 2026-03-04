import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CustomSelect } from "@/components/ui/select";

export default function UnitsPage() {
  return (
    <div className="space-y-6">
      {/* Top Actions */}
      <div className="flex flex-wrap gap-3 justify-between">
        <div className="flex flex-wrap gap-3">
          <Button>Add Unit</Button>
          <Button variant="secondary">Import Units (CSV)</Button>
          <CustomSelect>
            <option>All Properties</option>
            <option>Tower 1</option>
            <option>Tower 2</option>
          </CustomSelect>
        </div>
      </div>

      {/* Overview Cards */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card className="bg-panel" padding="md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Total Units</p>
              <p className="mt-4 text-3xl font-semibold font-display text-text-primary">5,000</p>
              <p className="mt-2 text-sm text-text-muted">Across all properties</p>
            </div>
            <Badge variant="subtle">Total</Badge>
          </div>
        </Card>
        
        <Card className="bg-panel" padding="md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Occupied</p>
              <p className="mt-4 text-3xl font-semibold font-display text-text-primary">4,100</p>
              <p className="mt-2 text-sm text-text-muted">82% occupancy</p>
            </div>
            <Badge variant="success">82%</Badge>
          </div>
        </Card>
        
        <Card className="bg-panel" padding="md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Vacant</p>
              <p className="mt-4 text-3xl font-semibold font-display text-text-primary">400</p>
              <p className="mt-2 text-sm text-text-muted">Available for lease</p>
            </div>
            <Badge variant="warning">400</Badge>
          </div>
        </Card>
        
        <Card className="bg-panel" padding="md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Under Maintenance</p>
              <p className="mt-4 text-3xl font-semibold font-display text-text-primary">200</p>
              <p className="mt-2 text-sm text-text-muted">Temporarily unavailable</p>
            </div>
            <Badge variant="danger">200</Badge>
          </div>
        </Card>
        
        <Card className="bg-panel" padding="md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Reserved</p>
              <p className="mt-4 text-3xl font-semibold font-display text-text-primary">300</p>
              <p className="mt-2 text-sm text-text-muted">Pending move-in</p>
            </div>
            <Badge variant="subtle">300</Badge>
          </div>
        </Card>
      </section>

      {/* Units Table */}
      <Card className="bg-panel" padding="md">
        <h3 className="text-lg font-semibold font-display text-text-primary mb-4">Units Inventory</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40">
                <th className="text-left py-3 px-4 font-medium text-text-muted">Unit</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Property</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Type</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Floor</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Rent</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Status</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Tenant</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/20">
                <td className="py-3 px-4 text-text-primary font-medium">12B</td>
                <td className="py-3 px-4 text-text-primary">Tower 1</td>
                <td className="py-3 px-4 text-text-primary">2BR</td>
                <td className="py-3 px-4 text-text-primary">12</td>
                <td className="py-3 px-4 text-text-primary">₱15,000</td>
                <td className="py-3 px-4">
                  <Badge variant="success">Occupied</Badge>
                </td>
                <td className="py-3 px-4 text-text-primary">Juan Dela Cruz</td>
                <td className="py-3 px-4">
                  <button className="text-accent hover:underline text-sm">View</button>
                </td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-3 px-4 text-text-primary font-medium">14A</td>
                <td className="py-3 px-4 text-text-primary">Tower 1</td>
                <td className="py-3 px-4 text-text-primary">1BR</td>
                <td className="py-3 px-4 text-text-primary">14</td>
                <td className="py-3 px-4 text-text-primary">₱12,000</td>
                <td className="py-3 px-4">
                  <Badge variant="warning">Vacant</Badge>
                </td>
                <td className="py-3 px-4 text-text-muted">—</td>
                <td className="py-3 px-4">
                  <button className="text-accent hover:underline text-sm">View</button>
                </td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-3 px-4 text-text-primary font-medium">8C</td>
                <td className="py-3 px-4 text-text-primary">Tower 2</td>
                <td className="py-3 px-4 text-text-primary">Studio</td>
                <td className="py-3 px-4 text-text-primary">8</td>
                <td className="py-3 px-4 text-text-primary">₱10,000</td>
                <td className="py-3 px-4">
                  <Badge variant="danger">Maintenance</Badge>
                </td>
                <td className="py-3 px-4 text-text-muted">—</td>
                <td className="py-3 px-4">
                  <button className="text-accent hover:underline text-sm">View</button>
                </td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-3 px-4 text-text-primary font-medium">15D</td>
                <td className="py-3 px-4 text-text-primary">Tower 2</td>
                <td className="py-3 px-4 text-text-primary">3BR</td>
                <td className="py-3 px-4 text-text-primary">15</td>
                <td className="py-3 px-4 text-text-primary">₱20,000</td>
                <td className="py-3 px-4">
                  <Badge variant="subtle">Reserved</Badge>
                </td>
                <td className="py-3 px-4 text-text-primary">Maria Santos</td>
                <td className="py-3 px-4">
                  <button className="text-accent hover:underline text-sm">View</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
