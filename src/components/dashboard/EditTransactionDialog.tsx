// src/components/dashboard/EditTransactionDialog.tsx
import { useState } from "react";
import { useEditTransaction } from "@/hooks/useEditTransaction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

interface EditTransactionProps {
  transaction: any;
  open: boolean;
  onClose: () => void;
}

export function EditTransactionDialog({ transaction, open, onClose }: EditTransactionProps) {
  const { editMutation, deleteMutation } = useEditTransaction();
  const [amount, setAmount] = useState(String(Math.abs(transaction?.amount || 0)));
  const [note, setNote] = useState(transaction?.note || "");
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const handleSave = async () => {
    // Keep the sign! If it was negative (spending), keep it negative.
    const isNegative = transaction.amount < 0;
    const finalAmount = Number(amount) * (isNegative ? -1 : 1);

    await editMutation.mutateAsync({
      id: transaction.id,
      updates: { amount: finalAmount, note: note }
    });
    onClose();
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(transaction.id);
    setShowDeleteAlert(false);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              <Input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Note</label>
              <Input 
                value={note} 
                onChange={(e) => setNote(e.target.value)} 
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                variant="destructive" 
                className="flex-none"
                onClick={() => setShowDeleteAlert(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button className="flex-1" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}