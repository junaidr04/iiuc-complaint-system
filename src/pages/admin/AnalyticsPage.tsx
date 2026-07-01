import React, { useEffect, useState } from 'react';
import { getAnalyticsData } from '@/services/api';
import AppLayout from '@/components/layouts/AppLayout';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyAnalytics } from '@/components/common/EmptyStates';

const CHART_COLORS = ['hsl(243,75%,59%)', 'hsl(199,89%,48%)', 'hsl(142,71%,45%)', 'hsl(38,92%,50%)', 'hsl(0,72%,51%)'];

interface AnalyticsData {
  byStatus: { name: string; value: number }[];
  byDepartment: { name: string; count: number }[];
  byMonth: { month: string; complaints: number; resolved: number }[];
}

const ChartCard: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <div className="rounded-lg border border-border bg-card p-5 card-shadow">
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
);

const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalyticsData().then(d => { setData(d); setLoading(false); });
  }, []);

  const totalComplaints = data?.byStatus.reduce((s, i) => s + i.value, 0) ?? 0;

  return (
    <AppLayout>
      <div className="max-w-5xl space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Analytics</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? 'Loading...' : `${totalComplaints} total complaints analyzed`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={`rounded-lg border border-border bg-card p-5 ${i === 2 ? 'md:col-span-2' : ''}`}>
                <Skeleton className="h-4 w-1/3 mb-4" />
                <Skeleton className="h-[240px] w-full" />
              </div>
            ))}
          </div>
        ) : totalComplaints === 0 ? (
          <div className="rounded-lg border border-border bg-card"><EmptyAnalytics /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Pie */}
            <ChartCard title="Complaint Status Distribution" subtitle="Breakdown by current status">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={data?.byStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                    {data?.byStatus.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '12px', backgroundColor: 'hsl(var(--card))' }}
                    formatter={(value: number, name: string) => [`${value} complaints`, name]}
                  />
                  <Legend layout="horizontal" wrapperStyle={{ paddingTop: 8, fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Department Bar */}
            <ChartCard title="Complaints by Department" subtitle="Top departments by complaint volume">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data?.byDepartment} layout="vertical" margin={{ left: 0, right: 16 }}>
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    width={110}
                    tickFormatter={v => v.length > 14 ? v.slice(0, 14) + '…' : v}
                  />
                  <Tooltip
                    contentStyle={{ border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '12px', backgroundColor: 'hsl(var(--card))' }}
                  />
                  <Bar dataKey="count" name="Complaints" fill="hsl(243,75%,59%)" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Monthly Line - full width */}
            <div className="md:col-span-2">
              <ChartCard title="Monthly Complaint Trends" subtitle="Complaints submitted and resolved per month (last 6 months)">
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={data?.byMonth} margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={32} />
                    <Tooltip
                      contentStyle={{ border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '12px', backgroundColor: 'hsl(var(--card))' }}
                    />
                    <Legend layout="horizontal" wrapperStyle={{ paddingTop: 8, fontSize: '12px' }} />
                    <Line type="monotone" dataKey="complaints" name="Submitted" stroke="hsl(243,75%,59%)" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="resolved" name="Resolved" stroke="hsl(142,71%,45%)" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AnalyticsPage;
