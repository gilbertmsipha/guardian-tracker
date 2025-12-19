// src/components/dashboard/AddTransactionDrawer.tsx
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useBuckets } from "@/hooks/useBuckets";
import { useAddTransaction } from "@/hooks/useAddTransaction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AddTransactionDrawer() {
  const { user } = useAuth();
  const { data: buckets } = useBuckets();
  const addTransaction = useAddTransaction();
  
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [bucketId, setBucketId] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    if (!user || !amount || !bucketId) return;

    await addTransaction.mutateAsync({
      user_id: user.id,
      bucket_id: bucketId,
      amount: -Math.abs(Number(amount)), // Ensure it's negative for spending
      note: note || "Cash Expense",
    });

    // Reset and close
    setAmount("");
    setNote("");
    setBucketId("");
    setOpen(false);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button size="lg" className="rounded-full h-14 w-14 fixed bottom-6 right-6 shadow-lg text-2xl bg-red-600 hover:bg-red-700 z-50">
          -
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Log Expense</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 space-y-4">
            
            {/* 1. The Amount */}
            <div className="space-y-2">
              <Label className="text-center block text-muted-foreground">Amount Spent</Label>
              <Input
                type="number"
                placeholder="0.00"
                className="text-center text-3xl h-16 border-none bg-slate-50"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
              />
            </div>

            {/* 2. The Envelope */}
            <div className="space-y-2">
              <Label>From Envelope</Label>
              <Select onValueChange={setBucketId} value={bucketId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Envelope" />
                </SelectTrigger>
                <SelectContent>
                  {buckets?.map((bucket: any) => (
                    <SelectItem key={bucket.id} value={bucket.id}>
                      {bucket.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 3. The Note */}
            <div className="space-y-2">
              <Label>Note (Optional)</Label>
              <Input 
                placeholder="Burger, Taxi, etc." 
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <Button onClick={handleSubmit} className="w-full h-12 text-lg" disabled={addTransaction.isPending}>
              {addTransaction.isPending ? "Logging..." : "Confirm Spend"}
            </Button>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}