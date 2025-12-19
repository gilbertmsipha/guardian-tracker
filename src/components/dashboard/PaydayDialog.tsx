// src/components/dashboard/PaydayDialog.tsx
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useBuckets } from "@/hooks/useBuckets";
import { useAddTransaction } from "@/hooks/useAddTransaction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import confetti from "canvas-confetti"; // The fun part
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
import { Wallet } from "lucide-react";

export function PaydayDialog() {
  const { user } = useAuth();
  const { data: buckets } = useBuckets();
  const addTransaction = useAddTransaction();
  
  const [amount, setAmount] = useState("");
  const [bucketId, setBucketId] = useState("");
  const [open, setOpen] = useState(false);

  const handleDeposit = async () => {
    if (!user || !amount || !bucketId) return;

    // 1. Fire Confetti!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // 2. Add the POSITIVE transaction
    await addTransaction.mutateAsync({
      user_id: user.id,
      bucket_id: bucketId,
      amount: Math.abs(Number(amount)), // Ensure positive
      note: "Payday Deposit 💰",
    });

    // 3. Reset
    setAmount("");
    setBucketId("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 gap-2">
          <Wallet className="h-4 w-4" />
          Deposit Income
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>It's Payday! 🎉</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          
          <div className="space-y-2">
            <Label>Amount Received</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1000"
              className="text-2xl text-green-600 font-bold"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Add to Envelope / Goal</Label>
            <Select value={bucketId} onValueChange={setBucketId}>
              <SelectTrigger>
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                {buckets?.map((b: any) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose which envelope gets this cash initially. You can move it later!
            </p>
          </div>

          <Button 
            onClick={handleDeposit} 
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={addTransaction.isPending}
          >
            {addTransaction.isPending ? "Depositing..." : "Confirm Deposit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}