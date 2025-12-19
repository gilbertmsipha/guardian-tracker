// src/components/dashboard/ManageBucketsDrawer.tsx
import { useState } from "react";
import { useBuckets } from "@/hooks/useBuckets";
import { useEditBucket } from "@/hooks/useEditBucket";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Trash2, Settings, Loader2, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Type for the bucket type display names
const BUCKET_TYPE_NAMES: Record<string, string> = {
  'income': 'Income Sources',
  'income_source': 'Income Sources',
  'envelope': 'Monthly Envelopes',
  'goal': 'Savings Goals'
};

export function ManageBucketsDrawer() {
  const { bucketTypes, getBucketsByType } = useBuckets();
  const { deleteBucket, updateBucketMutation } = useEditBucket();
  const [open, setOpen] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [bucketToDelete, setBucketToDelete] = useState<{
    id: string;
    name: string;
    type: string;
  } | null>(null);

  // Edit State
  const [editingBucket, setEditingBucket] = useState<{
    id: string;
    name: string;
    target_amount: number;
    type: string;
  } | null>(null);

  const handleDeleteClick = (id: string, name: string, type: string) => {
    setBucketToDelete({ id, name, type });
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!bucketToDelete) return;

    try {
      setDeletingId(bucketToDelete.id);
      
      await deleteBucket.mutateAsync(bucketToDelete.id);
      
      // Reset state
      setShowDeleteDialog(false);
      setBucketToDelete(null);
    } catch (error) {
      console.error("Error in handleConfirmDelete:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditClick = (bucket: any) => {
    setEditingBucket({
      id: bucket.id,
      name: bucket.name,
      target_amount: bucket.target_amount || 0,
      type: bucket.type
    });
  };

  const handleSaveEdit = async () => {
    if (!editingBucket) return;

    try {
      await updateBucketMutation.mutateAsync({
        id: editingBucket.id,
        updates: {
          name: editingBucket.name,
          target_amount: editingBucket.target_amount
        }
      });
      setEditingBucket(null);
    } catch (error) {
      console.error("Failed to update bucket", error);
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[80vh]"> {/* Tall drawer */}
        <div className="mx-auto w-full max-w-md h-full overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>Manage Wallets</DrawerTitle>
          </DrawerHeader>

          <div className="p-4 space-y-6">
            {/* Group by Type */}
            {bucketTypes.map((type) => {
              const group = getBucketsByType(type);
              if (group.length === 0) return null;

              return (
                <div key={type} className="space-y-2">
                  <h3 className="font-semibold capitalize text-muted-foreground">
                    {BUCKET_TYPE_NAMES[type] || type}
                  </h3>
                  <div className="space-y-2">
                    {group.map((bucket: any) => (
                      <div key={bucket.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border group">
                        <div>
                          <p className="font-medium group-hover:text-primary transition-colors">{bucket.name}</p>
                          <p className="text-xs text-slate-500">
                            Target: ${bucket.target_amount}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-primary"
                            onClick={() => handleEditClick(bucket)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(bucket.id, bucket.name, bucket.type);
                            }}
                            disabled={deleteBucket.isPending && deletingId === bucket.id}
                          >
                            {deleteBucket.isPending && deletingId === bucket.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DrawerContent>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete {bucketToDelete?.type === 'income' || bucketToDelete?.type === 'income_source' 
                ? 'Income Source' 
                : bucketToDelete?.type === 'envelope' 
                  ? 'Envelope' 
                  : 'Goal'}
            </DialogTitle>
            <DialogDescription>
              {bucketToDelete?.type === 'income' || bucketToDelete?.type === 'income_source'
                ? 'This action will remove this income source from future use.'
                : 'This action will permanently delete this item and all associated transactions.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete "{bucketToDelete?.name}"? 
              {bucketToDelete?.type === 'income' || bucketToDelete?.type === 'income_source'
                ? 'This will not affect existing transactions but will remove this income source from future use.' 
                : 'This will delete ALL transactions associated with it!'}
            </p>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleteBucket.isPending}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={deleteBucket.isPending}
              >
                {deleteBucket.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingBucket} onOpenChange={(open) => !open && setEditingBucket(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editingBucket?.type === 'income' ? 'Income' : editingBucket?.type === 'goal' ? 'Goal' : 'Envelope'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input 
                value={editingBucket?.name || ''} 
                onChange={(e) => setEditingBucket(prev => prev ? { ...prev, name: e.target.value } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label>Target Amount</Label>
              <Input 
                type="number"
                value={editingBucket?.target_amount || 0} 
                onChange={(e) => setEditingBucket(prev => prev ? { ...prev, target_amount: Number(e.target.value) } : null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingBucket(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={updateBucketMutation.isPending}>
              {updateBucketMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Drawer>
  );
}
