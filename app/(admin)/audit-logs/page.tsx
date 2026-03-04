import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CustomSelectSmall } from "@/components/ui/select";

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-panel" padding="md">
        <div className="flex flex-wrap gap-4 items-center">
          <CustomSelectSmall>
            <option>All Users</option>
            <option>Admin User</option>
            <option>Property Manager</option>
            <option>Staff</option>
          </CustomSelectSmall>
          <input type="date" className="pl-3 pr-3 py-1 text-sm border border-border/60 rounded-control bg-panel text-text-primary" />
          <input type="date" className="pl-3 pr-3 py-1 text-sm border border-border/60 rounded-control bg-panel text-text-primary" />
          <CustomSelectSmall>
            <option>All Actions</option>
            <option>Create</option>
            <option>Update</option>
            <option>Delete</option>
            <option>Login</option>
          </CustomSelectSmall>
          <Button variant="secondary">Export Logs</Button>
        </div>
      </Card>

      {/* Audit Logs Table */}
      <Card className="bg-panel" padding="md">
        <h3 className="text-lg font-semibold font-display text-text-primary mb-4">System Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40">
                <th className="text-left py-3 px-4 font-medium text-text-muted">Date</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">User</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Action</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Module</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Description</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">IP Address</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/20">
                <td className="py-3 px-4 text-text-primary">May 10, 2025 10:30 AM</td>
                <td className="py-3 px-4 text-text-primary">Admin User</td>
                <td className="py-3 px-4">
                  <Badge variant="success">Update</Badge>
                </td>
                <td className="py-3 px-4 text-text-primary">Billing</td>
                <td className="py-3 px-4 text-text-primary">Updated rent for Unit 12B from ₱15,000 to ₱16,000</td>
                <td className="py-3 px-4 text-text-primary">192.168.1.100</td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-3 px-4 text-text-primary">May 10, 2025 9:15 AM</td>
                <td className="py-3 px-4 text-text-primary">Admin User</td>
                <td className="py-3 px-4">
                  <Badge variant="success">Create</Badge>
                </td>
                <td className="py-3 px-4 text-text-primary">Billing</td>
                <td className="py-3 px-4 text-text-primary">Billing cycle generated for May 2026</td>
                <td className="py-3 px-4 text-text-primary">192.168.1.100</td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-3 px-4 text-text-primary">May 9, 2025 3:45 PM</td>
                <td className="py-3 px-4 text-text-primary">Admin User</td>
                <td className="py-3 px-4">
                  <Badge variant="success">Create</Badge>
                </td>
                <td className="py-3 px-4 text-text-primary">Announcements</td>
                <td className="py-3 px-4 text-text-primary">Announcement sent to Tower A residents</td>
                <td className="py-3 px-4 text-text-primary">192.168.1.100</td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-3 px-4 text-text-primary">May 9, 2025 2:20 PM</td>
                <td className="py-3 px-4 text-text-primary">Property Manager</td>
                <td className="py-3 px-4">
                  <Badge variant="warning">Update</Badge>
                </td>
                <td className="py-3 px-4 text-text-primary">Units</td>
                <td className="py-3 px-4 text-text-primary">Changed status of Unit 8C from Occupied to Maintenance</td>
                <td className="py-3 px-4 text-text-primary">192.168.1.101</td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-3 px-4 text-text-primary">May 9, 2025 11:30 AM</td>
                <td className="py-3 px-4 text-text-primary">Admin User</td>
                <td className="py-3 px-4">
                  <Badge variant="success">Create</Badge>
                </td>
                <td className="py-3 px-4 text-text-primary">Residents</td>
                <td className="py-3 px-4 text-text-primary">Added new resident: Alex Tan to Unit 8C</td>
                <td className="py-3 px-4 text-text-primary">192.168.1.100</td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-3 px-4 text-text-primary">May 8, 2025 4:15 PM</td>
                <td className="py-3 px-4 text-text-primary">Staff</td>
                <td className="py-3 px-4">
                  <Badge variant="success">Update</Badge>
                </td>
                <td className="py-3 px-4 text-text-primary">Facilities</td>
                <td className="py-3 px-4 text-text-primary">Approved booking for Function Room by Juan Dela Cruz</td>
                <td className="py-3 px-4 text-text-primary">192.168.1.102</td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-3 px-4 text-text-primary">May 8, 2025 10:00 AM</td>
                <td className="py-3 px-4 text-text-primary">Admin User</td>
                <td className="py-3 px-4">
                  <Badge variant="subtle">Login</Badge>
                </td>
                <td className="py-3 px-4 text-text-primary">System</td>
                <td className="py-3 px-4 text-text-primary">User logged in successfully</td>
                <td className="py-3 px-4 text-text-primary">192.168.1.100</td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-3 px-4 text-text-primary">May 7, 2025 3:30 PM</td>
                <td className="py-3 px-4 text-text-primary">Property Manager</td>
                <td className="py-3 px-4">
                  <Badge variant="danger">Delete</Badge>
                </td>
                <td className="py-3 px-4 text-text-primary">Announcements</td>
                <td className="py-3 px-4 text-text-primary">Deleted draft announcement: "Pool Maintenance"</td>
                <td className="py-3 px-4 text-text-primary">192.168.1.101</td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-3 px-4 text-text-primary">May 7, 2025 1:15 PM</td>
                <td className="py-3 px-4 text-text-primary">Admin User</td>
                <td className="py-3 px-4">
                  <Badge variant="success">Create</Badge>
                </td>
                <td className="py-3 px-4 text-text-primary">Billing</td>
                <td className="py-3 px-4 text-text-primary">Created manual invoice INV-2026-M001 for Maria Santos</td>
                <td className="py-3 px-4 text-text-primary">192.168.1.100</td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-3 px-4 text-text-primary">May 6, 2025 5:45 PM</td>
                <td className="py-3 px-4 text-text-primary">Property Manager</td>
                <td className="py-3 px-4">
                  <Badge variant="warning">Update</Badge>
                </td>
                <td className="py-3 px-4 text-text-primary">Residents</td>
                <td className="py-3 px-4 text-text-primary">Updated contact information for Sarah Lee</td>
                <td className="py-3 px-4 text-text-primary">192.168.1.101</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-panel" padding="md">
          <div className="text-center">
            <p className="text-2xl font-semibold font-display text-text-primary">1,247</p>
            <p className="text-sm text-text-muted">Total Activities (30 days)</p>
          </div>
        </Card>
        <Card className="bg-panel" padding="md">
          <div className="text-center">
            <p className="text-2xl font-semibold font-display text-text-primary">892</p>
            <p className="text-sm text-text-muted">Successful Actions</p>
          </div>
        </Card>
        <Card className="bg-panel" padding="md">
          <div className="text-center">
            <p className="text-2xl font-semibold font-display text-text-primary">23</p>
            <p className="text-sm text-text-muted">Failed Attempts</p>
          </div>
        </Card>
        <Card className="bg-panel" padding="md">
          <div className="text-center">
            <p className="text-2xl font-semibold font-display text-text-primary">12</p>
            <p className="text-sm text-text-muted">Active Users</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
