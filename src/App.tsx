// src/App.tsx
import { useState } from "react";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import Login from "./components/Login";
import { useTransactions } from "./hooks/useTransactions";
import { useBuckets } from "./hooks/useBuckets";
import { Button } from "./components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/card";
import { CreateBucketDialog } from "./components/dashboard/CreateBucketDialog";
import { AddTransactionDrawer } from "./components/dashboard/AddTransactionDrawer";
import { TransferDialog } from "./components/dashboard/TransferDialog";
import { PaydayDialog } from "./components/dashboard/PaydayDialog";
import { SpendingChart } from "./components/dashboard/SpendingChart";
import { EditTransactionDialog } from "./components/dashboard/EditTransactionDialog";
import { ManageBucketsDrawer } from "./components/dashboard/ManageBucketsDrawer";
import { SubscriptionManager } from "./components/dashboard/SubscriptionManager";

// A separated component for the actual protected content
function Dashboard() {
  const { signOut } = useAuth();
  const { data: buckets, isLoading: loadingBuckets } = useBuckets();
  const { data: transactions, isLoading: loadingTx } = useTransactions();
  const [editingTx, setEditingTx] = useState<any>(null);

  // Filter buckets into categories
  const incomeBuckets = buckets?.filter((b: any) => b.type === 'income') || [];
  const envelopes = buckets?.filter((b: any) => b.type === 'envelope') || [];
  const goals = buckets?.filter((b: any) => b.type === 'goal') || [];

  // Helper to get total balance (Works for Income too!)
  const getBalance = (bucketId: string) => {
    if (!transactions) return 0;
    // Sum ALL transactions for this bucket (Deposits + Transfers In - Transfers Out)
    const total = transactions
      .filter((t: any) => t.bucket_id === bucketId)
      .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
    return total;
  };

  // 1. Envelope Math (Limit - Spent)
  const getEnvelopeMetrics = (bucketId: string, limit: number) => {
    if (!transactions) return { balance: limit, percentage: 100 };
    
    // Filter for THIS MONTH only
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const spent = transactions
      .filter((t: any) => t.bucket_id === bucketId && new Date(t.date) >= startOfMonth)
      .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
      
    const balance = limit + spent; // 'spent' is negative
    const percentage = Math.max(0, Math.min(100, (balance / limit) * 100));
    
    return { balance, percentage };
  };

  // 2. Goal Math (Total Saved / Target)
  const getGoalMetrics = (bucketId: string, target: number) => {
    if (!transactions) return { saved: 0, percentage: 0 };

    // Sum ALL time transactions (Goals don't reset monthly)
    const saved = transactions
      .filter((t: any) => t.bucket_id === bucketId)
      .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

    const percentage = Math.max(0, Math.min(100, (saved / target) * 100));

    return { saved, percentage };
  };

  if (loadingBuckets || loadingTx) {
    return <div className="p-4 max-w-md mx-auto">Loading...</div>;
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-8 pb-24">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Guardian Tracker</h1>
        <div className="flex gap-2">
          <ManageBucketsDrawer />
          <Button variant="ghost" size="sm" onClick={signOut}>Sign Out</Button>
        </div>
      </div>

      {/* SECTION 1: MONTHLY SPENDING (Fuel Gauges) */}
      {/* ACTIONS ROW */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <div className="flex-none">
          <PaydayDialog />
        </div>
        <div className="flex-none">
          <TransferDialog />
        </div>
        <div className="flex-none">
          <CreateBucketDialog />
        </div>
      </div>

      {/* FUNDS AVAILABLE SECTION */}
      {incomeBuckets.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-lg">Funds Available</h2>
          <div className="grid grid-cols-2 gap-4">
            {incomeBuckets.map((bucket: any) => {
              const balance = getBalance(bucket.id);
              return (
                <Card key={bucket.id} className="bg-blue-50 border-blue-200">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-900">{bucket.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <span className="text-2xl font-bold text-blue-700">${balance.toFixed(0)}</span>
                    <p className="text-xs text-blue-500 mt-1">Ready to assign</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* CHART SECTION */}
      <div className="mt-6">
        <SpendingChart />
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold text-lg">Monthly Budget</h2>
        
        {envelopes.map((env: any) => {
          const { balance, percentage } = getEnvelopeMetrics(env.id, env.target_amount);
          // Color Logic: Green -> Red
          const color = percentage > 50 ? "bg-green-500" : percentage > 20 ? "bg-yellow-500" : "bg-red-600";
          
          return (
            <Card key={env.id}>
              <CardHeader className="p-4 pb-2 flex flex-row justify-between items-center space-y-0">
                <CardTitle className="text-sm font-medium">{env.name}</CardTitle>
                <span className="text-sm font-bold text-slate-600">${balance.toFixed(0)} left</span>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div 
                    className={`h-full ${color}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* SECTION 1.5: SUBSCRIPTIONS */}
      <SubscriptionManager />

      {/* SECTION 2: GOALS (Vaults) */}
      {goals.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-lg">My Goals</h2>
          {goals.map((goal: any) => {
            const { saved, percentage } = getGoalMetrics(goal.id, goal.target_amount);
            
            return (
              <Card key={goal.id} className="border-yellow-200 bg-yellow-50/50">
                <CardHeader className="p-4 pb-2 flex flex-row justify-between items-center space-y-0">
                  <CardTitle className="text-sm font-medium">{goal.name}</CardTitle>
                  <span className="text-sm font-bold text-yellow-700">${saved.toFixed(0)} / ${goal.target_amount}</span>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  {/* Goal bars are yellow/gold */}
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-yellow-100">
                    <div 
                      className="h-full bg-yellow-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-right mt-1 text-yellow-600">{percentage.toFixed(0)}% saved</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Recent Activity */}
      <div className="space-y-2">
        <h2 className="font-semibold mb-2">Recent Activity</h2>
        {transactions?.slice(0, 5).map((tx: any) => (
          <Card 
            key={tx.id}
            onClick={() => setEditingTx(tx)}
            className="p-3 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors"
          >
            <span className="font-medium text-sm">{tx.note}</span>
            <span className={`${tx.amount < 0 ? "text-red-500" : "text-green-500"} font-bold text-sm`}>
              ${Math.abs(tx.amount)}
            </span>
          </Card>
        ))}
      </div>

      {/* Edit Transaction Dialog */}
      {editingTx && (
        <EditTransactionDialog 
          open={!!editingTx}
          transaction={editingTx}
          onClose={() => setEditingTx(null)}
        />
      )}

      {/* The Floating Action Button */}
      <AddTransactionDrawer />
    </div>
  );
}

// The Main Wrapper
function App() {
  return (
    <AuthProvider>
      <AuthWrapper />
    </AuthProvider>
  );
}

// The Logic Switcher
function AuthWrapper() {
  const { session, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  
  if (!session) return <Login />;

  return <Dashboard />;
}

export default App;