import { useTransactions } from "@/hooks/useTransactions";
import { useBuckets } from "@/hooks/useBuckets";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Flame } from "lucide-react";

export function BurnRateAlert() {
  const { data: transactions } = useTransactions();
  const { data: buckets } = useBuckets();

  if (!transactions || !buckets) return null;

  // 1. Calculate Totals
  const now = new Date();
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  
  // Total Budget (Sum of all Envelope Targets)
  const totalBudget = buckets
    .filter((b: any) => b.type === 'envelope')
    .reduce((acc: number, b: any) => acc + Number(b.target_amount), 0);

  // Total Spent This Month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const totalSpent = Math.abs(transactions
    .filter((t: any) => t.amount < 0 && new Date(t.date) >= startOfMonth)
    .reduce((acc: number, t: any) => acc + Number(t.amount), 0));

  // 2. The Math
  const dailyBudget = totalBudget / daysInMonth;
  const actualDailySpend = totalSpent / dayOfMonth;
  
  // If we are spending faster than allowed (with buffer)
  const isBurningFast = actualDailySpend > (dailyBudget * 1.1); 

  if (!isBurningFast) return null; // Don't show if they are safe

  return (
    <Alert variant="destructive" className="mb-4 bg-red-50 border-red-200 text-red-800">
      <Flame className="h-4 w-4" />
      <AlertTitle>High Burn Rate!</AlertTitle>
      <AlertDescription>
        You are spending <strong>${actualDailySpend.toFixed(0)}/day</strong>. 
        To last the month, try to stick to <strong>${dailyBudget.toFixed(0)}/day</strong>.
      </AlertDescription>
    </Alert>
  );
}