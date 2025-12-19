// src/components/dashboard/CreateBucketDialog.tsx
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useCreateBucket } from "@/hooks/useBuckets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CreateBucketDialog() {
  const { user } = useAuth();
  const createBucket = useCreateBucket();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"envelope" | "goal" | "income">("envelope");
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Determine color based on type
    let color = '#10b981'; // Green (Envelope)
    if (type === 'goal') color = '#fbbf24'; // Gold (Goal)
    if (type === 'income') color = '#3b82f6'; // Blue (Income)

    await createBucket.mutateAsync({
      user_id: user.id,
      name: name,
      type: type, 
      target_amount: Number(amount),
      color: color, 
    });

    // Reset
    setName("");
    setAmount("");
    setType("envelope");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-blue-600 hover:bg-blue-700">
          + New Bucket
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Bucket</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. The Type Selector */}
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(val: any) => setType(val as "envelope" | "goal" | "income")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="envelope">Monthly Envelope (Spending)</SelectItem>
                <SelectItem value="goal">Savings Goal (Vault)</SelectItem>
                <SelectItem value="income">Income Source (Salary/Freelance)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                type === 'envelope' ? "Groceries" :
                type === 'goal' ? "New Laptop" :
                "Salary"
              }
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">
              {type === 'envelope' ? "Monthly Limit ($)" : 
               type === 'goal' ? "Target Goal Amount ($)" : 
               "Estimated Monthly Income ($)"}
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={type === 'income' ? '3000' : '300'}
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={createBucket.isPending}>
            {createBucket.isPending ? "Creating..." : `Create ${
              type === 'envelope' ? 'Envelope' : 
              type === 'goal' ? 'Goal' : 'Income Source'
            }`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}