import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Financial Section */}
      <section>
        <h2 className="text-2xl font-semibold font-display text-text-primary mb-4">Financial Insights</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-panel" padding="md">
            <h3 className="text-lg font-semibold font-display text-text-primary mb-4">Monthly Revenue Trend</h3>
            <div className="h-48 flex items-end justify-between gap-2">
              <div className="flex-1 bg-border/20 rounded-t" style={{ height: '60%' }}></div>
              <div className="flex-1 bg-border/20 rounded-t" style={{ height: '75%' }}></div>
              <div className="flex-1 bg-status-success rounded-t" style={{ height: '82%' }}></div>
              <div className="flex-1 bg-status-success rounded-t" style={{ height: '90%' }}></div>
              <div className="flex-1 bg-status-success rounded-t" style={{ height: '85%' }}></div>
              <div className="flex-1 bg-accent rounded-t" style={{ height: '95%' }}></div>
            </div>
            <div className="flex justify-between mt-3 text-xs text-text-muted">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm font-semibold text-text-primary">₱2.35M (June)</p>
              <p className="text-xs text-text-muted">+12% vs last month</p>
            </div>
          </Card>
          
          <Card className="bg-panel" padding="md">
            <h3 className="text-lg font-semibold font-display text-text-primary mb-4">Collection Rate</h3>
            <div className="flex flex-col items-center justify-center h-48">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="16" fill="none" className="text-border/20"></circle>
                  <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="16" fill="none" className="text-status-success" strokeDasharray={`${2 * Math.PI * 56 * 0.94} ${2 * Math.PI * 56}`}></circle>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-semibold font-display text-text-primary">94%</p>
                    <p className="text-xs text-text-muted">Collected</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-text-muted">Above industry average (85%)</p>
            </div>
          </Card>
        </div>
        
        <Card className="bg-panel mt-6" padding="md">
          <h3 className="text-lg font-semibold font-display text-text-primary mb-4">Outstanding Trend</h3>
          <div className="h-32 flex items-end justify-between gap-2">
            <div className="flex-1 bg-status-danger rounded-t" style={{ height: '70%' }}></div>
            <div className="flex-1 bg-status-danger rounded-t" style={{ height: '65%' }}></div>
            <div className="flex-1 bg-status-danger rounded-t" style={{ height: '60%' }}></div>
            <div className="flex-1 bg-status-danger rounded-t" style={{ height: '55%' }}></div>
            <div className="flex-1 bg-status-danger rounded-t" style={{ height: '45%' }}></div>
            <div className="flex-1 bg-status-danger rounded-t" style={{ height: '40%' }}></div>
          </div>
          <div className="flex justify-between mt-3 text-xs text-text-muted">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm font-semibold text-status-danger">₱156K Outstanding</p>
            <p className="text-xs text-text-muted">-43% improvement over 6 months</p>
          </div>
        </Card>
      </section>

      {/* Operational Section */}
      <section>
        <h2 className="text-2xl font-semibold font-display text-text-primary mb-4">Operational Insights</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-panel" padding="md">
            <h3 className="text-lg font-semibold font-display text-text-primary mb-4">Occupancy Trend</h3>
            <div className="h-32 relative">
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
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-text-muted">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm font-semibold text-text-primary">95% Occupancy</p>
              <p className="text-xs text-text-muted">+3% improvement over 6 months</p>
            </div>
          </Card>
          
          <Card className="bg-panel" padding="md">
            <h3 className="text-lg font-semibold font-display text-text-primary mb-4">Maintenance Volume</h3>
            <div className="h-32 flex items-end justify-between gap-2">
              <div className="flex-1 bg-accent rounded-t" style={{ height: '45%' }}></div>
              <div className="flex-1 bg-accent rounded-t" style={{ height: '60%' }}></div>
              <div className="flex-1 bg-accent rounded-t" style={{ height: '55%' }}></div>
              <div className="flex-1 bg-accent rounded-t" style={{ height: '70%' }}></div>
              <div className="flex-1 bg-accent rounded-t" style={{ height: '65%' }}></div>
              <div className="flex-1 bg-accent rounded-t" style={{ height: '50%' }}></div>
            </div>
            <div className="flex justify-between mt-3 text-xs text-text-muted">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm font-semibold text-text-primary">28 Requests (June)</p>
              <p className="text-xs text-text-muted">Stable maintenance volume</p>
            </div>
          </Card>
        </div>
        
        <Card className="bg-panel mt-6" padding="md">
          <h3 className="text-lg font-semibold font-display text-text-primary mb-4">Lease Expiry Forecast</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-status-danger/10 rounded-control border border-status-danger/30">
              <p className="text-2xl font-semibold font-display text-status-danger">47</p>
              <p className="text-sm text-text-muted">Expiring in 30 days</p>
              <p className="text-xs text-text-muted mt-2">Action required for renewals</p>
            </div>
            <div className="text-center p-4 bg-status-warning/10 rounded-control border border-status-warning/30">
              <p className="text-2xl font-semibold font-display text-status-warning">89</p>
              <p className="text-sm text-text-muted">Expiring in 60 days</p>
              <p className="text-xs text-text-muted mt-2">Begin renewal outreach</p>
            </div>
            <div className="text-center p-4 bg-accent/10 rounded-control border border-accent/30">
              <p className="text-2xl font-semibold font-display text-accent">156</p>
              <p className="text-sm text-text-muted">Expiring in 90 days</p>
              <p className="text-xs text-text-muted mt-2">Plan for turnover</p>
            </div>
          </div>
        </Card>
      </section>

      {/* Resident Insights */}
      <section>
        <h2 className="text-2xl font-semibold font-display text-text-primary mb-4">Resident Insights</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="bg-panel" padding="md">
            <h3 className="text-lg font-semibold font-display text-text-primary mb-4">Average Stay Duration</h3>
            <div className="text-center">
              <p className="text-3xl font-semibold font-display text-text-primary">2.8</p>
              <p className="text-sm text-text-muted">Years</p>
              <p className="text-xs text-text-muted mt-2">Above industry average (2.2 years)</p>
            </div>
          </Card>
          
          <Card className="bg-panel" padding="md">
            <h3 className="text-lg font-semibold font-display text-text-primary mb-4">Turnover Rate</h3>
            <div className="text-center">
              <p className="text-3xl font-semibold font-display text-text-primary">18%</p>
              <p className="text-sm text-text-muted">Annual</p>
              <p className="text-xs text-text-muted mt-2">Healthy turnover rate</p>
            </div>
          </Card>
          
          <Card className="bg-panel" padding="md">
            <h3 className="text-lg font-semibold font-display text-text-primary mb-4">Late Payment Patterns</h3>
            <div className="text-center">
              <p className="text-3xl font-semibold font-display text-text-primary">12%</p>
              <p className="text-sm text-text-muted">Late payments</p>
              <p className="text-xs text-text-muted mt-2">Improving trend (-3% vs last quarter)</p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
