import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CustomSelectSmall } from "@/components/ui/select";

export default function AnnouncementsPage() {
  return (
    <div className="space-y-6">
      {/* Top Actions */}
      <div className="flex flex-wrap gap-3 justify-between">
        <div className="flex flex-wrap gap-3">
          <Button>New Announcement</Button>
          <Button variant="secondary">Drafts</Button>
          <Button variant="secondary">Templates</Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-panel" padding="md">
        <div className="flex flex-wrap gap-4 items-center">
          <CustomSelectSmall>
            <option>All Properties</option>
            <option>Tower 1</option>
            <option>Tower 2</option>
          </CustomSelectSmall>
          <CustomSelectSmall>
            <option>All Targets</option>
            <option>Specific Building</option>
            <option>Specific Units</option>
          </CustomSelectSmall>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs font-medium rounded-full bg-accent text-white">All</button>
            <button className="px-3 py-1 text-xs font-medium rounded-full bg-border/20 text-text-muted hover:bg-border/40">Draft</button>
            <button className="px-3 py-1 text-xs font-medium rounded-full bg-border/20 text-text-muted hover:bg-border/40">Sent</button>
          </div>
        </div>
      </Card>

      {/* Announcements Table */}
      <Card className="bg-panel" padding="md">
        <h3 className="text-lg font-semibold font-display text-text-primary mb-4">Communications</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40">
                <th className="text-left py-3 px-4 font-medium text-text-muted">Title</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Target</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Sent Date</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Created By</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Status</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Read Receipts</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/20">
                <td className="py-3 px-4 text-text-primary font-medium">Water Maintenance Notice</td>
                <td className="py-3 px-4 text-text-primary">Tower A</td>
                <td className="py-3 px-4 text-text-primary">May 1, 2025</td>
                <td className="py-3 px-4 text-text-primary">Admin User</td>
                <td className="py-3 px-4">
                  <Badge variant="success">Sent</Badge>
                </td>
                <td className="py-3 px-4 text-text-primary">245/250 (98%)</td>
                <td className="py-3 px-4">
                  <button className="text-accent hover:underline text-sm mr-3">View</button>
                  <button className="text-accent hover:underline text-sm">Resend</button>
                </td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-3 px-4 text-text-primary font-medium">Parking Fee Update</td>
                <td className="py-3 px-4 text-text-primary">All Properties</td>
                <td className="py-3 px-4 text-text-primary">Apr 28, 2025</td>
                <td className="py-3 px-4 text-text-primary">Admin User</td>
                <td className="py-3 px-4">
                  <Badge variant="success">Sent</Badge>
                </td>
                <td className="py-3 px-4 text-text-primary">4,850/5,000 (97%)</td>
                <td className="py-3 px-4">
                  <button className="text-accent hover:underline text-sm mr-3">View</button>
                  <button className="text-accent hover:underline text-sm">Resend</button>
                </td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-3 px-4 text-text-primary font-medium">Elevator Maintenance Schedule</td>
                <td className="py-3 px-4 text-text-primary">Tower B Units 10-15</td>
                <td className="py-3 px-4 text-text-primary">Apr 25, 2025</td>
                <td className="py-3 px-4 text-text-primary">Admin User</td>
                <td className="py-3 px-4">
                  <Badge variant="warning">Draft</Badge>
                </td>
                <td className="py-3 px-4 text-text-muted">—</td>
                <td className="py-3 px-4">
                  <button className="text-accent hover:underline text-sm mr-3">Edit</button>
                  <button className="text-accent hover:underline text-sm">Send</button>
                </td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-3 px-4 text-text-primary font-medium">Community Event Invitation</td>
                <td className="py-3 px-4 text-text-primary">All Residents</td>
                <td className="py-3 px-4 text-text-primary">Apr 20, 2025</td>
                <td className="py-3 px-4 text-text-primary">Admin User</td>
                <td className="py-3 px-4">
                  <Badge variant="success">Sent</Badge>
                </td>
                <td className="py-3 px-4 text-text-primary">4,920/5,000 (98%)</td>
                <td className="py-3 px-4">
                  <button className="text-accent hover:underline text-sm mr-3">View</button>
                  <button className="text-accent hover:underline text-sm">Resend</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Optional: Communication Settings */}
      <Card className="bg-panel" padding="md">
        <h3 className="text-lg font-semibold font-display text-text-primary mb-4">Communication Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text-primary">Email Notifications</p>
              <p className="text-sm text-text-muted">Send announcements via email</p>
            </div>
            <div className="w-12 h-6 bg-accent rounded-full relative">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text-primary">Push Notifications</p>
              <p className="text-sm text-text-muted">Send mobile app notifications</p>
            </div>
            <div className="w-12 h-6 bg-accent rounded-full relative">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text-primary">SMS Notifications</p>
              <p className="text-sm text-text-muted">Send text messages for urgent updates</p>
            </div>
            <div className="w-12 h-6 bg-border/40 rounded-full relative">
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
