"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteDealer } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

type DeleteDealerDialogProps = {
  dealerId: string;
};

export function DeleteDealerDialog({ dealerId }: DeleteDealerDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  async function handleDelete() {
    setIsSubmitting(true);
    try {
      await deleteDealer(dealerId);
      toast({
        title: "Success",
        description: "Dealer and all associated bills have been deleted.",
      });
      setOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete dealer. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            dealer and all of their associated bills.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Yes, delete dealer"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
