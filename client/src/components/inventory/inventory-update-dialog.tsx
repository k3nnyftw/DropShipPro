import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Define validation schema
const updateInventorySchema = z.object({
  newStock: z.coerce.number().int().min(0, {
    message: "Inventory must be a positive number",
  }),
  changeReason: z.string().min(1, {
    message: "Please select a reason for the update",
  }),
  notes: z.string().optional(),
});

type UpdateInventoryFormValues = z.infer<typeof updateInventorySchema>;

interface InventoryUpdateDialogProps {
  productId: number;
  productName: string;
  currentStock: number;
  isOpen: boolean;
  onClose: () => void;
}

export function InventoryUpdateDialog({
  productId,
  productName,
  currentStock,
  isOpen,
  onClose,
}: InventoryUpdateDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create form
  const form = useForm<UpdateInventoryFormValues>({
    resolver: zodResolver(updateInventorySchema),
    defaultValues: {
      newStock: currentStock,
      changeReason: "",
      notes: "",
    },
  });

  // Create mutation
  const updateInventoryMutation = useMutation({
    mutationFn: async (data: UpdateInventoryFormValues) => {
      const response = await apiRequest(
        "POST",
        `/api/inventory-tracking/update/${productId}`,
        {
          newStock: data.newStock,
          changeReason: data.changeReason,
          metadata: data.notes ? { notes: data.notes } : undefined,
        }
      );
      return response.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-tracking/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-tracking/low-stock'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-tracking/history', productId] });
      
      // Show success message
      toast({
        title: "Inventory Updated",
        description: `${productName} inventory has been updated successfully.`,
      });
      
      // Close the dialog
      onClose();
      
      // Reset form
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update inventory. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateInventoryFormValues) => {
    updateInventoryMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Inventory</DialogTitle>
          <DialogDescription>
            Update inventory level for {productName}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newStock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Stock Level</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="Enter new stock level"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Current stock: {currentStock}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="changeReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Update</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="manual_adjustment">Manual Adjustment</SelectItem>
                      <SelectItem value="supplier_restock">Supplier Restock</SelectItem>
                      <SelectItem value="inventory_count">Inventory Count</SelectItem>
                      <SelectItem value="return">Customer Return</SelectItem>
                      <SelectItem value="damaged">Damaged/Lost</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Add any additional notes"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={updateInventoryMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={updateInventoryMutation.isPending}
              >
                {updateInventoryMutation.isPending ? "Updating..." : "Update Inventory"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}