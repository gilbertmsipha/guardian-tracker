import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useSubscriptions, useCreateSubscription, useUpdateSubscription, useDeleteSubscription } from "@/hooks/useSubscriptions";
import { useBuckets } from "@/hooks/useBuckets";
import { addTransaction } from "@/api/transactions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, CheckCircle2 } from "lucide-react";

export function SubscriptionManager() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: subs } = useSubscriptions();
  const { data: buckets } = useBuckets();
  
  const createSub = useCreateSubscription();
  const updateSub = useUpdateSubscription();
  const deleteSub = useDeleteSubscription();

  // Add State
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newBucketId, setNewBucketId] = useState<string | undefined>(undefined);
  const [newDay, setNewDay] = useState("1");

  // Edit State
  const [editingSub, setEditingSub] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editBucketId, setEditBucketId] = useState<string | undefined>(undefined);
  const [editDay, setEditDay] = useState("");

  // Delete State
  const [deletingSub, setDeletingSub] = useState<any>(null);

  // Mutation to Pay a Bill
  const payBill = useMutation({
    mutationFn: async (sub: any) => {
      await addTransaction({
        user_id: user!.id,
        bucket_id: sub.bucket_id,
        amount: -Math.abs(sub.amount),
        note: `Bill: ${sub.name}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      // Optional: Show toast
    }
  });

  const handleAdd = async () => {
    if(!user || !newName || !newAmount || !newBucketId) return;
    
    await createSub.mutateAsync({
      user_id: user.id,
      name: newName,
      amount: Number(newAmount),
      day_of_month: Number(newDay),
      bucket_id: newBucketId
    });
    
    setNewName("");
    setNewAmount("");
    setNewBucketId(undefined);
    setNewDay("1");
    setIsAddDialogOpen(false);
  };

  const handleEditClick = (sub: any) => {
    setEditingSub(sub);
    setEditName(sub.name);
    setEditAmount(String(sub.amount));
    setEditBucketId(sub.bucket_id || undefined);
    setEditDay(String(sub.day_of_month));
  };

  const handleSaveEdit = async () => {
    if (!editingSub) return;
    
    await updateSub.mutateAsync({
      id: editingSub.id,
      updates: {
        name: editName,
        amount: Number(editAmount),
        bucket_id: editBucketId,
        day_of_month: Number(editDay)
      }
    });
    setEditingSub(null);
  };

  const handleDeleteClick = (sub: any) => {
    setDeletingSub(sub);
  };

  const handleConfirmDelete = async () => {
    if (!deletingSub) return;
    await deleteSub.mutateAsync(deletingSub.id);
    setDeletingSub(null);
  };

  // Filter for envelope buckets only, as subscriptions usually come from envelopes
  const envelopeBuckets = buckets?.filter(b => b.type === 'envelope') || [];

  return (
    <Card className="mt-6 border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold text-slate-900">Subscriptions</CardTitle>
          <CardDescription>Manage fixed monthly bills</CardDescription>
        </div>
        <Button size="sm" onClick={() => setIsAddDialogOpen(true)} className="gap-1">
          <Plus className="h-4 w-4" /> Add Bill
        </Button>
      </CardHeader>
      <CardContent className="pt-2">
        {/* List Bills */}
        <div className="space-y-3">
          {subs?.length === 0 && (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No subscriptions added yet.
            </div>
          )}
          {subs?.map((sub: any) => (
            <div key={sub.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-50/50 rounded-lg border border-slate-100 hover:border-slate-200 transition-all">
              <div className="mb-3 sm:mb-0 space-y-1">
                <p className="font-semibold text-slate-900">{sub.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="bg-slate-200/50 px-1.5 py-0.5 rounded">Day {sub.day_of_month}</span>
                  <span>•</span>
                  <span>{buckets?.find(b => b.id === sub.bucket_id)?.name || 'No Envelope Assigned'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <span className="font-bold text-slate-700 text-lg">-${sub.amount}</span>
                <div className="flex items-center gap-1">
                   <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full"
                    title="Pay Bill"
                    onClick={() => payBill.mutate(sub)}
                    disabled={payBill.isPending}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full"
                    onClick={() => handleEditClick(sub)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                    onClick={() => handleDeleteClick(sub)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Subscription</DialogTitle>
              <DialogDescription>
                Track a new fixed monthly expense.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Netflix" 
                  value={newName} 
                  onChange={e => setNewName(e.target.value)} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    placeholder="15.99" 
                    value={newAmount} 
                    onChange={e => setNewAmount(e.target.value)} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="day">Day of Month</Label>
                  <Input 
                    id="day" 
                    type="number" 
                    min={1} 
                    max={31} 
                    placeholder="1" 
                    value={newDay} 
                    onChange={e => setNewDay(e.target.value)} 
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bucket">Funding Envelope</Label>
                <Select value={newBucketId} onValueChange={setNewBucketId}>
                  <SelectTrigger id="bucket">
                    <SelectValue placeholder="Select an envelope" />
                  </SelectTrigger>
                  <SelectContent>
                    {envelopeBuckets.map(b => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[0.8rem] text-muted-foreground">
                  The envelope this bill is paid from.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd} disabled={!newName || !newAmount || !newBucketId || createSub.isPending}>
                {createSub.isPending ? "Adding..." : "Add Subscription"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={!!editingSub} onOpenChange={(open) => !open && setEditingSub(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Subscription</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input 
                  id="edit-name" 
                  value={editName} 
                  onChange={e => setEditName(e.target.value)} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-amount">Amount</Label>
                  <Input 
                    id="edit-amount" 
                    type="number" 
                    value={editAmount} 
                    onChange={e => setEditAmount(e.target.value)} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-day">Day of Month</Label>
                  <Input 
                    id="edit-day" 
                    type="number" 
                    min={1} 
                    max={31} 
                    value={editDay} 
                    onChange={e => setEditDay(e.target.value)} 
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-bucket">Funding Envelope</Label>
                <Select value={editBucketId} onValueChange={setEditBucketId}>
                  <SelectTrigger id="edit-bucket">
                    <SelectValue placeholder="Select Envelope" />
                  </SelectTrigger>
                  <SelectContent>
                    {envelopeBuckets.map(b => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingSub(null)}>Cancel</Button>
              <Button onClick={handleSaveEdit} disabled={updateSub.isPending}>
                {updateSub.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Alert */}
        <AlertDialog open={!!deletingSub} onOpenChange={(open) => !open && setDeletingSub(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Subscription?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deletingSub?.name}"? This will stop future tracking but won't delete past transactions.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </CardContent>
    </Card>
  );
}