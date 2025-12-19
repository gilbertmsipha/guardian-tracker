// src/components/dashboard/TransferDialog.tsx
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useBuckets } from "@/hooks/useBuckets";
import { useTransfer } from "@/hooks/useTransfer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRightLeft } from "lucide-react"; // Icon for the button
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

export function TransferDialog() {
  const { user } = useAuth();
  const { data: buckets } = useBuckets();
  const transfer = useTransfer();

  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [amount, setAmount] = useState("");
  const [open, setOpen] = useState(false);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !fromId || !toId || !amount) return;

    // Find names for the note
    const toBucketName = buckets?.find((b: any) => b.id === toId)?.name || "Goal";

    await transfer.mutateAsync({
      user_id: user.id,
      from_bucket_id: fromId,
      to_bucket_id: toId,
      amount: Number(amount),
      note: `${toBucketName}`, // Keeps the transaction note clean
    });

    // Reset
    setAmount("");
    setFromId("");
    setToId("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <ArrowRightLeft className="h-4 w-4" />
          Move Money
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer Funds</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleTransfer} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            {/* FROM */}
            <div className="space-y-2">
              <Label>From</Label>
              <Select value={fromId} onValueChange={setFromId}>
                <SelectTrigger>
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  {buckets?.map((b: any) => (
                    <SelectItem key={b.id} value={b.id} disabled={b.id === toId}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* TO */}
            <div className="space-y-2">
              <Label>To</Label>
              <Select value={toId} onValueChange={setToId}>
                <SelectTrigger>
                  <SelectValue placeholder="Dest." />
                </SelectTrigger>
                <SelectContent>
                  {buckets?.map((b: any) => (
                    <SelectItem key={b.id} value={b.id} disabled={b.id === fromId}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Amount ($)</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="50"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={transfer.isPending}>
            {transfer.isPending ? "Moving..." : "Transfer"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}