// src/components/dashboard/SpendingChart.tsx
import { useMemo } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { useBuckets } from "@/hooks/useBuckets";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SpendingChart() {
  const { data: transactions } = useTransactions();
  const { data: buckets } = useBuckets();

  const chartData = useMemo(() => {
    if (!transactions || !buckets) return [];

    // 1. Filter: Negative amounts AND NOT transfers
    const spending = transactions.filter((t: any) => {
      return t.amount < 0 && t.is_transfer !== true;
    });

    // 2. Group by Bucket ID
    const totals: Record<string, number> = {};
    spending.forEach((t: any) => {
      // Remove the negative sign for the chart
      const val = Math.abs(t.amount);
      if (totals[t.bucket_id]) {
        totals[t.bucket_id] += val;
      } else {
        totals[t.bucket_id] = val;
      }
    });

    // 3. Transform into Array for Recharts and filter out income buckets
    return Object.keys(totals).map((bucketId) => {
      const bucket = buckets.find((b: any) => b.id === bucketId);
      // Skip income buckets
      if (bucket?.type === 'income') return null;

      return {
        name: bucket?.name || "Unknown",
        value: totals[bucketId],
        color: bucket?.color || "#94a3b8", // Fallback color
      };
    }).filter((item): item is { name: string; value: number; color: string } => item !== null && item.value > 0);

  }, [transactions, buckets]);

  // Colors for the chart segments (You can customize these)
  const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

  if (chartData.length === 0) return null;

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Where is my money going?</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => `$${value.toFixed(2)}`}
              contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
            />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}