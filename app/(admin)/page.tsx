import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: string;
  delta: string;
  deltaVariant?: "success" | "warning" | "danger" | "default";
};

function StatCard({ label, value, delta, deltaVariant = "default" }: StatCardProps) {
  const variant =
    deltaVariant === "default"
      ? "subtle"
      : deltaVariant === "success"
        ? "success"
        : deltaVariant === "warning"
          ? "warning"
          : "danger";

  return (
    <Card className="bg-panel shadow-card" padding="sm">
      <div className="flex gap-3 justify-between items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
            {label}
          </p>
          <p className="mt-4 text-3xl font-semibold font-display text-text-primary">{value}</p>
        </div>
        <Badge variant={variant}>{delta}</Badge>
      </div>
    </Card>
  );
}

export default function AdminDashboardPage() {
  return (
    <>
      <section className="grid gap-8 p-2 px-4 md:grid-cols-2">
        <div className="p-4">
          <h3 className="mb-4 text-2xl font-semibold font-display">Monthly Revenue</h3>
          <div className="flex gap-2 justify-between items-end h-32">
            <div className="flex-1 rounded-t bg-status-success" style={{ height: '75%' }}></div>
            <div className="flex-1 rounded-t bg-status-success" style={{ height: '82%' }}></div>
            <div className="flex-1 rounded-t bg-accent" style={{ height: '65%' }}></div>
            <div className="flex-1 rounded-t bg-status-success" style={{ height: '90%' }}></div>
            <div className="flex-1 rounded-t bg-accent" style={{ height: '70%' }}></div>
            <div className="flex-1 rounded-t bg-status-danger" style={{ height: '45%' }}></div>
            <div className="flex-1 rounded-t bg-status-success" style={{ height: '85%' }}></div>
          </div>
          <div className="flex justify-between mt-3 text-xs text-text-muted">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
          </div>
          <div className="flex gap-6 justify-center mt-4">
            <div className="flex gap-2 items-center">
              <div className="w-3 h-3 rounded bg-status-success"></div>
              <span className="text-xs text-text-muted">Paid</span>
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-3 h-3 rounded bg-accent"></div>
              <span className="text-xs text-text-muted">Due</span>
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-3 h-3 rounded bg-status-danger"></div>
              <span className="text-xs text-text-muted">Overdue</span>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="mb-4 text-2xl font-semibold font-display">Activity Timeline</h3>
          
          <div className="flex gap-2 mb-4">
            <button className="px-3 py-1 text-xs font-medium text-white rounded-full bg-accent">All</button>
            <button className="px-3 py-1 text-xs font-medium rounded-full bg-border/20 text-text-muted hover:bg-border/40">Payments</button>
            <button className="px-3 py-1 text-xs font-medium rounded-full bg-border/20 text-text-muted hover:bg-border/40">Maintenance</button>
            <button className="px-3 py-1 text-xs font-medium rounded-full bg-border/20 text-text-muted hover:bg-border/40">Leasing</button>
          </div>
          
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between items-center">
              <div className="flex gap-3 items-center">
                <div className="w-2 h-2 rounded-full bg-accent"></div>
                <div>
                  <span className="text-text-secondary">New tenant application</span>
                  <span className="ml-2 text-xs text-text-muted">Leasing</span>
                </div>
              </div>
              <span className="text-xs text-text-muted">2m ago</span>
            </li>
            <li className="flex justify-between items-center">
              <div className="flex gap-3 items-center">
                <div className="w-2 h-2 rounded-full bg-status-success"></div>
                <div>
                  <span className="text-text-secondary">Payment received</span>
                  <span className="ml-2 text-xs text-text-muted">Payments</span>
                </div>
              </div>
              <span className="text-xs text-text-muted">15m ago</span>
            </li>
            <li className="flex justify-between items-center">
              <div className="flex gap-3 items-center">
                <div className="w-2 h-2 rounded-full bg-status-warning"></div>
                <div>
                  <span className="text-text-secondary">Maintenance request</span>
                  <span className="ml-2 text-xs text-text-muted">Maintenance</span>
                </div>
              </div>
              <span className="text-xs text-text-muted">1h ago</span>
            </li>
            <li className="flex justify-between items-center">
              <div className="flex gap-3 items-center">
                <div className="w-2 h-2 rounded-full bg-status-success"></div>
                <div>
                  <span className="text-text-secondary">Facility booking</span>
                  <span className="ml-2 text-xs text-text-muted">Maintenance</span>
                </div>
              </div>
              <span className="text-xs text-text-muted">2h ago</span>
            </li>
            <li className="flex justify-between items-center">
              <div className="flex gap-3 items-center">
                <div className="w-2 h-2 rounded-full bg-status-success"></div>
                <div>
                  <span className="text-text-secondary">Announcement sent</span>
                  <span className="ml-2 text-xs text-text-muted">Announcements</span>
                </div>
              </div>
              <span className="text-xs text-text-muted">3h ago</span>
            </li>
          </ul>
        </div>
      </section>

      <div className="px-4">
        <Card className="bg-[#e9f5f3] shadow-inner" padding="md">
          <div className="grid gap-6">
            <section className="grid gap-4 md:grid-cols-3">
              <StatCard label="Rent Collected (This Month)" value="₱4.2M" delta="+8.3%" deltaVariant="success" />
              <StatCard label="Overdue Amount" value="₱156K" delta="+12.4%" deltaVariant="danger" />
              <StatCard label="Collection Rate %" value="94.2%" delta="+2.1%" deltaVariant="success" />
            </section>
            
            <section className="grid gap-4 md:grid-cols-4">
              <StatCard label="Total Units" value="5,000" delta="+3.2%" deltaVariant="success" />
              <StatCard label="Occupied Units" value="4,600" delta="+2.8%" deltaVariant="success" />
              <StatCard label="Open Maintenance Requests" value="28" delta="-5" deltaVariant="warning" />
              <StatCard label="Active Leases" value="4,587" delta="+1.2%" deltaVariant="success" />
            </section>

        <section className="grid gap-4 lg:grid-cols-2">
        <Card className="bg-panel" padding="md">
          <div className="flex gap-4 justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold font-display text-text-primary">Unit Status Overview</h2>
              <p className="mt-1 text-sm text-text-muted">Current unit distribution across all properties</p>
            </div>
            <Badge variant="subtle">Live</Badge>
          </div>
          <div className="flex gap-8 items-center mt-6">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="16" fill="none" className="text-border/20"></circle>
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="16" fill="none" className="text-status-success" strokeDasharray={`${2 * Math.PI * 56 * 0.82} ${2 * Math.PI * 56}`}></circle>
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="16" fill="none" className="text-accent" strokeDasharray={`${2 * Math.PI * 56 * 0.08} ${2 * Math.PI * 56}`} strokeDashoffset={`${-2 * Math.PI * 56 * 0.82}`}></circle>
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="16" fill="none" className="text-status-warning" strokeDasharray={`${2 * Math.PI * 56 * 0.06} ${2 * Math.PI * 56}`} strokeDashoffset={`${-2 * Math.PI * 56 * 0.9}`}></circle>
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="16" fill="none" className="text-status-danger" strokeDasharray={`${2 * Math.PI * 56 * 0.04} ${2 * Math.PI * 56}`} strokeDashoffset={`${-2 * Math.PI * 56 * 0.96}`}></circle>
              </svg>
              <div className="flex absolute inset-0 justify-center items-center">
                <div className="text-center">
                  <p className="text-2xl font-semibold font-display text-text-primary">5,000</p>
                  <p className="text-xs text-text-muted">Total Units</p>
                </div>
              </div>
            </div>
            <div className="grid flex-1 gap-3">
              <div className="flex gap-3 items-center">
                <div className="w-3 h-3 rounded bg-status-success"></div>
                <span className="text-sm text-text-secondary">Occupied Units</span>
                <span className="ml-auto text-sm font-semibold text-text-primary">4,100 (82%)</span>
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-3 h-3 rounded bg-accent"></div>
                <span className="text-sm text-text-secondary">Vacant Units</span>
                <span className="ml-auto text-sm font-semibold text-text-primary">400 (8%)</span>
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-3 h-3 rounded bg-status-warning"></div>
                <span className="text-sm text-text-secondary">Reserved Units</span>
                <span className="ml-auto text-sm font-semibold text-text-primary">300 (6%)</span>
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-3 h-3 rounded bg-status-danger"></div>
                <span className="text-sm text-text-secondary">Under Maintenance</span>
                <span className="ml-auto text-sm font-semibold text-text-primary">200 (4%)</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-panel" padding="md">
          <div className="flex gap-4 justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold font-display text-text-primary">Occupancy Trend</h2>
              <p className="mt-1 text-sm text-text-muted">6-month occupancy performance</p>
            </div>
            <Badge variant="subtle">Live</Badge>
          </div>
          <div className="mt-6">
            <div className="relative h-32">
              <svg className="w-full h-full">
                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-accent"
                  points="10,90 50,75 90,80 130,60 170,65 210,50 250,55 290,40 330,45 370,35 410,40 450,30 490,35 530,25"
                />
                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                  className="text-border/40"
                  points="10,100 530,100"
                />
              </svg>
              <div className="flex absolute right-0 bottom-0 left-0 justify-between text-xs text-text-muted">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <div className="flex gap-2 items-center">
                <div className="w-3 h-3 rounded bg-accent"></div>
                <span className="text-xs text-text-muted">Occupancy Rate</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-text-primary">92% → 95%</p>
                <p className="text-xs text-text-muted">+3% improvement</p>
              </div>
            </div>
          </div>
        </Card>
        </section>
        </div>
      </Card>
      </div>
    </>
  );
}
