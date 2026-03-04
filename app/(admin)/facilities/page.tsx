import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function FacilitiesPage() {
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="bg-panel" padding="md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Total Facilities</p>
              <p className="mt-4 text-3xl font-semibold font-display text-text-primary">12</p>
              <p className="mt-2 text-sm text-text-muted">Across all properties</p>
            </div>
            <Badge variant="subtle">12</Badge>
          </div>
        </Card>
        
        <Card className="bg-panel" padding="md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Upcoming Bookings</p>
              <p className="mt-4 text-3xl font-semibold font-display text-text-primary">28</p>
              <p className="mt-2 text-sm text-text-muted">Next 7 days</p>
            </div>
            <Badge variant="success">28</Badge>
          </div>
        </Card>
        
        <Card className="bg-panel" padding="md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Pending Approvals</p>
              <p className="mt-4 text-3xl font-semibold font-display text-text-primary">7</p>
              <p className="mt-2 text-sm text-text-muted">Require review</p>
            </div>
            <Badge variant="warning">7</Badge>
          </div>
        </Card>
      </section>

      {/* Facilities List */}
      <Card className="bg-panel" padding="md">
        <h3 className="text-lg font-semibold font-display text-text-primary mb-4">Facilities Inventory</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40">
                <th className="text-left py-3 px-4 font-medium text-text-muted">Facility</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Capacity</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Rate</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Availability</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Status</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/20">
                <td className="py-3 px-4 text-text-primary font-medium">Function Room</td>
                <td className="py-3 px-4 text-text-primary">50 people</td>
                <td className="py-3 px-4 text-text-primary">₱2,000/hr</td>
                <td className="py-3 px-4 text-text-primary">Available</td>
                <td className="py-3 px-4">
                  <Badge variant="success">Active</Badge>
                </td>
                <td className="py-3 px-4">
                  <button className="text-accent hover:underline text-sm mr-3">View</button>
                  <button className="text-accent hover:underline text-sm">Book</button>
                </td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-3 px-4 text-text-primary font-medium">Swimming Pool</td>
                <td className="py-3 px-4 text-text-primary">30 people</td>
                <td className="py-3 px-4 text-text-primary">Free</td>
                <td className="py-3 px-4 text-text-primary">Limited</td>
                <td className="py-3 px-4">
                  <Badge variant="success">Active</Badge>
                </td>
                <td className="py-3 px-4">
                  <button className="text-accent hover:underline text-sm mr-3">View</button>
                  <button className="text-accent hover:underline text-sm">Schedule</button>
                </td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-3 px-4 text-text-primary font-medium">Gym</td>
                <td className="py-3 px-4 text-text-primary">20 people</td>
                <td className="py-3 px-4 text-text-primary">₱500/month</td>
                <td className="py-3 px-4 text-text-primary">Available</td>
                <td className="py-3 px-4">
                  <Badge variant="success">Active</Badge>
                </td>
                <td className="py-3 px-4">
                  <button className="text-accent hover:underline text-sm mr-3">View</button>
                  <button className="text-accent hover:underline text-sm">Manage</button>
                </td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-3 px-4 text-text-primary font-medium">Basketball Court</td>
                <td className="py-3 px-4 text-text-primary">10 people</td>
                <td className="py-3 px-4 text-text-primary">₱300/hr</td>
                <td className="py-3 px-4 text-text-primary">Available</td>
                <td className="py-3 px-4">
                  <Badge variant="success">Active</Badge>
                </td>
                <td className="py-3 px-4">
                  <button className="text-accent hover:underline text-sm mr-3">View</button>
                  <button className="text-accent hover:underline text-sm">Book</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bookings Section */}
      <Card className="bg-panel" padding="md">
        <h3 className="text-lg font-semibold font-display text-text-primary mb-4">Recent Bookings</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40">
                <th className="text-left py-3 px-4 font-medium text-text-muted">Resident</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Facility</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Date</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Time</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Status</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/20">
                <td className="py-3 px-4 text-text-primary font-medium">Juan Dela Cruz</td>
                <td className="py-3 px-4 text-text-primary">Function Room</td>
                <td className="py-3 px-4 text-text-primary">May 10, 2025</td>
                <td className="py-3 px-4 text-text-primary">7:00 PM - 10:00 PM</td>
                <td className="py-3 px-4">
                  <Badge variant="success">Approved</Badge>
                </td>
                <td className="py-3 px-4">
                  <button className="text-accent hover:underline text-sm mr-3">View</button>
                  <button className="text-accent hover:underline text-sm">Cancel</button>
                </td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-3 px-4 text-text-primary font-medium">Maria Santos</td>
                <td className="py-3 px-4 text-text-primary">Basketball Court</td>
                <td className="py-3 px-4 text-text-primary">May 11, 2025</td>
                <td className="py-3 px-4 text-text-primary">3:00 PM - 5:00 PM</td>
                <td className="py-3 px-4">
                  <Badge variant="warning">Pending</Badge>
                </td>
                <td className="py-3 px-4">
                  <button className="text-accent hover:underline text-sm mr-3">Approve</button>
                  <button className="text-accent hover:underline text-sm">Reject</button>
                </td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-3 px-4 text-text-primary font-medium">Alex Tan</td>
                <td className="py-3 px-4 text-text-primary">Gym</td>
                <td className="py-3 px-4 text-text-primary">May 9, 2025</td>
                <td className="py-3 px-4 text-text-primary">6:00 AM - 7:00 AM</td>
                <td className="py-3 px-4">
                  <Badge variant="success">Completed</Badge>
                </td>
                <td className="py-3 px-4">
                  <button className="text-accent hover:underline text-sm mr-3">View</button>
                  <button className="text-accent hover:underline text-sm">Feedback</button>
                </td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-3 px-4 text-text-primary font-medium">Sarah Lee</td>
                <td className="py-3 px-4 text-text-primary">Swimming Pool</td>
                <td className="py-3 px-4 text-text-primary">May 12, 2025</td>
                <td className="py-3 px-4 text-text-primary">2:00 PM - 4:00 PM</td>
                <td className="py-3 px-4">
                  <Badge variant="danger">Rejected</Badge>
                </td>
                <td className="py-3 px-4">
                  <button className="text-accent hover:underline text-sm mr-3">View</button>
                  <button className="text-accent hover:underline text-sm">Reschedule</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
