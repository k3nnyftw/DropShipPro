import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUpDown, Loader2 } from "lucide-react";

// Form validation schema
const updateInventorySchema = z.object({
  newStock: z.coerce.number().int().min(0, {
    message: "Stock level cannot be negative",
  }),
  changeReason: z.string().min(1, {
    message: "Please provide a reason for this inventory update",
  }),
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
  const [isUpdating, setIsUpdating] = useState(false);

  // Setup react-hook-form
  const form = useForm<UpdateInventoryFormValues>({
    resolver: zodResolver(updateInventorySchema),
    defaultValues: {
      newStock: currentStock,
      changeReason: "",
    },
  });

  // Handle inventory update via API
  const updateInventoryMutation = useMutation({
    mutationFn: async (data: UpdateInventoryFormValues) => {
      return apiRequest('POST', `/api/inventory-tracking/update/${productId}`, data);
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-tracking/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-tracking/low-stock'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-tracking/summary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-tracking/history', productId] });
      
      // Show success message
      toast({
        title: "Inventory updated",
        description: `Stock level for ${productName} has been updated successfully.`,
      });
      
      // Close dialog
      onClose();
    },
    onError: (error) => {
      console.error("Error updating inventory:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating the inventory. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateInventoryFormValues) => {
    setIsUpdating(true);
    updateInventoryMutation.mutate(data);
  };

  // Set stock to 0 shortcut
  const handleZeroStock = () => {
    form.setValue("newStock", 0);
    form.setValue("changeReason", "Manual adjustment - Zeroed inventory");
  };

  // Add to current stock
  const handleIncrease = (amount: number) => {
    const currentValue = form.getValues("newStock") || 0;
    form.setValue("newStock", currentValue + amount);
    
    if (!form.getValues("changeReason")) {
      form.setValue("changeReason", `Manual adjustment - Added ${amount} units`);
    }
  };

  // Decrease from current stock
  const handleDecrease = (amount: number) => {
    const currentValue = form.getValues("newStock") || 0;
    const newValue = Math.max(0, currentValue - amount);
    form.setValue("newStock", newValue);
    
    if (!form.getValues("changeReason")) {
      form.setValue("changeReason", `Manual adjustment - Removed ${amount} units`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ArrowUpDown className="h-5 w-5 mr-2" />
            Update Inventory
          </DialogTitle>
          <DialogDescription>
            Update stock levels for <span className="font-medium">{productName}</span>
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="newStock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Level</FormLabel>
                  <div className="flex items-center space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDecrease(1)}
                    >
                      -
                    </Button>
                    <FormControl>
                      <Input {...field} type="number" min="0" />
                    </FormControl>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleIncrease(1)}
                    >
                      +
                    </Button>
                  </div>
                  <FormDescription>
                    Current stock: {currentStock}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between mb-4">
              <div className="space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleIncrease(5)}
                >
                  +5
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleIncrease(10)}
                >
                  +10
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleIncrease(50)}
                >
                  +50
                </Button>
              </div>
              <Button 
                type="button" 
                variant="destructive" 
                size="sm"
                onClick={handleZeroStock}
              >
                Set to 0
              </Button>
            </div>

            <FormField
              control={form.control}
              name="changeReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Change</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., 'New shipment received', 'Stock count adjustment', 'Defective items removed'"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This will be recorded in the inventory history.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}