import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, ArrowUpDown, Check, Clock, LayoutGrid, List, Package, RefreshCw, Settings, AlertTriangle } from "lucide-react";
import { InventoryUpdateDialog } from "@/components/inventory/inventory-update-dialog";
import { Product } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function InventoryTrackingPage() {
  // State for inventory update dialog
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterMode, setFilterMode] = useState<"all" | "low-stock">("all");
  
  const queryClient = useQueryClient();

  // Get all products with inventory information
  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/inventory-tracking/products'],
    refetchInterval: 60000, // Refresh every minute
  });

  // Get low stock products (below threshold)
  const { data: lowStockProducts } = useQuery({
    queryKey: ['/api/inventory-tracking/low-stock'],
    refetchInterval: 30000, // Refresh more frequently for low stock alerts
  });

  // Get inventory summary data
  const { data: inventorySummary } = useQuery({
    queryKey: ['/api/inventory-tracking/summary'],
    refetchInterval: 60000,
  });

  // Show history for selected product
  const { data: inventoryHistory, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['/api/inventory-tracking/history', selectedProduct?.id],
    enabled: !!selectedProduct,
  });

  // Toggle inventory tracking for a product
  const toggleTrackingMutation = useMutation({
    mutationFn: async ({ productId, enabled }: { productId: number, enabled: boolean }) => {
      return apiRequest('POST', `/api/inventory-tracking/tracking/${productId}`, { enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-tracking/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-tracking/low-stock'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-tracking/summary'] });
    }
  });

  // Set inventory threshold for a product
  const setThresholdMutation = useMutation({
    mutationFn: async ({ productId, threshold }: { productId: number, threshold: number }) => {
      return apiRequest('POST', `/api/inventory-tracking/threshold/${productId}`, { threshold });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-tracking/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-tracking/low-stock'] });
    }
  });

  // Handler for opening inventory update dialog
  const handleUpdateInventory = (product: Product) => {
    setSelectedProduct(product);
    setIsUpdateDialogOpen(true);
  };

  // Calculate inventory stats
  const totalProducts = products?.length || 0;
  const lowStockCount = lowStockProducts?.length || 0;
  const lowStockPercentage = totalProducts > 0 ? (lowStockCount / totalProducts) * 100 : 0;
  
  // Calculate total inventory value
  const totalValue = products?.reduce((total, product) => {
    const inventory = product.inventory || 0;
    const price = parseFloat(product.price?.toString() || '0');
    return total + (inventory * price);
  }, 0) || 0;

  // Filter products based on selected mode
  const filteredProducts = filterMode === "low-stock" ? lowStockProducts : products;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Track and manage your product inventory</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['/api/inventory-tracking/products'] });
              queryClient.invalidateQueries({ queryKey: ['/api/inventory-tracking/low-stock'] });
              queryClient.invalidateQueries({ queryKey: ['/api/inventory-tracking/summary'] });
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setFilterMode(filterMode === "all" ? "low-stock" : "all")}
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            {filterMode === "all" ? "Show Low Stock Only" : "Show All Items"}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          >
            {viewMode === "grid" ? 
              <><List className="h-4 w-4 mr-2" /> List View</> : 
              <><LayoutGrid className="h-4 w-4 mr-2" /> Grid View</>
            }
          </Button>
        </div>
      </div>

      {/* Inventory Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {inventorySummary?.totalProducts || 0} SKUs tracked in inventory
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockCount}</div>
            <div className="flex items-center">
              <p className="text-xs text-muted-foreground mr-2">
                {lowStockPercentage.toFixed(1)}% of inventory
              </p>
              {lowStockPercentage > 20 && (
                <Badge variant="destructive" className="text-xs">
                  High
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Inventory Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Based on current product prices
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Last Inventory Update
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Clock className="h-5 w-5 inline mr-1" />
              {products && products.length > 0 ? 
                new Date(Math.max(...products
                  .filter(p => p.lastStockUpdate)
                  .map(p => new Date(p.lastStockUpdate!).getTime())
                )).toLocaleDateString() : 
                'No updates'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {products && products.length > 0 ? 
                `${products.filter(p => p.lastStockUpdate).length} products updated` : 
                'No recent inventory changes'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Product Inventory List/Grid */}
      <Tabs defaultValue="inventory" className="mb-8">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          {selectedProduct && <TabsTrigger value="history">History</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="inventory">
          {viewMode === "list" ? (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Threshold</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts && filteredProducts.length > 0 ? filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.inventory !== null ? product.inventory : 'N/A'}</TableCell>
                      <TableCell>{product.inventoryThreshold !== null ? product.inventoryThreshold : 'N/A'}</TableCell>
                      <TableCell>
                        {product.inventory !== null && product.inventoryThreshold !== null && 
                         product.inventory < product.inventoryThreshold ? (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Low Stock
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 text-green-500 border-green-200 bg-green-50">
                            <Check className="h-3 w-3" />
                            In Stock
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {product.lastStockUpdate ? 
                          new Date(product.lastStockUpdate).toLocaleDateString() : 
                          'Never'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleUpdateInventory(product)}
                          >
                            <ArrowUpDown className="h-4 w-4 mr-1" />
                            Update
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedProduct(product);
                              document.querySelector('button[value="history"]')?.click();
                            }}
                          >
                            <Clock className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedProduct(product);
                              document.querySelector('button[value="settings"]')?.click();
                            }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No products found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts && filteredProducts.length > 0 ? filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      {product.inventory !== null && product.inventoryThreshold !== null && 
                      product.inventory < product.inventoryThreshold ? (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Low Stock
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 text-green-500 border-green-200 bg-green-50">
                          <Check className="h-3 w-3" />
                          In Stock
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      {product.category || 'Uncategorized'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Current Stock:</span>
                      <span className="font-bold">{product.inventory !== null ? product.inventory : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Threshold:</span>
                      <span>{product.inventoryThreshold !== null ? product.inventoryThreshold : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Last Updated:</span>
                      <span className="text-sm">
                        {product.lastStockUpdate ? 
                          new Date(product.lastStockUpdate).toLocaleDateString() : 
                          'Never'
                        }
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleUpdateInventory(product)}
                    >
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      Update Stock
                    </Button>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedProduct(product);
                          document.querySelector('button[value="history"]')?.click();
                        }}
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedProduct(product);
                          document.querySelector('button[value="settings"]')?.click();
                        }}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              )) : (
                <div className="col-span-full text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                  <h3 className="text-lg font-medium">No products found</h3>
                  <p className="text-muted-foreground mb-4">
                    {filterMode === "low-stock" ? 
                      "There are no products below their stock threshold." : 
                      "No products are available for inventory tracking."}
                  </p>
                  {filterMode === "low-stock" && (
                    <Button variant="outline" onClick={() => setFilterMode("all")}>
                      View All Products
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Settings</CardTitle>
              <CardDescription>
                Configure inventory tracking preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedProduct ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">{selectedProduct.name}</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="font-medium">Inventory Tracking</div>
                      <div className="flex items-center">
                        <Button
                          variant={selectedProduct.inventoryTracking ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleTrackingMutation.mutate({ 
                            productId: selectedProduct.id, 
                            enabled: true 
                          })}
                          className="rounded-r-none"
                        >
                          Enabled
                        </Button>
                        <Button
                          variant={!selectedProduct.inventoryTracking ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleTrackingMutation.mutate({ 
                            productId: selectedProduct.id, 
                            enabled: false 
                          })}
                          className="rounded-l-none"
                        >
                          Disabled
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {selectedProduct.inventoryTracking ? 
                          "Inventory will be automatically tracked with every order." : 
                          "Inventory tracking is disabled for this product."}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="font-medium">Stock Threshold</div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="number" 
                          className="h-10 px-3 py-2 text-sm rounded-md border border-input w-24"
                          defaultValue={selectedProduct.inventoryThreshold?.toString() || "5"}
                          min="0"
                          id="threshold-input"
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            const input = document.getElementById("threshold-input") as HTMLInputElement;
                            const threshold = parseInt(input.value);
                            if (!isNaN(threshold) && threshold >= 0) {
                              setThresholdMutation.mutate({ 
                                productId: selectedProduct.id, 
                                threshold 
                              });
                            }
                          }}
                        >
                          Set Threshold
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        You will be alerted when stock falls below this threshold.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                  <h3 className="text-lg font-medium">Select a product</h3>
                  <p className="text-muted-foreground">
                    Select a product to configure its inventory settings.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Inventory History</CardTitle>
              <CardDescription>
                {selectedProduct ? `Tracking history for ${selectedProduct.name}` : 'Select a product to view its history'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedProduct ? (
                isHistoryLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  inventoryHistory && inventoryHistory.length > 0 ? (
                    <div className="space-y-4">
                      {inventoryHistory.map((record) => (
                        <div key={record.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                          <div className={`p-2 rounded-full ${
                            record.newStock > (record.previousStock || 0) 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-orange-100 text-orange-600'
                          }`}>
                            {record.newStock > (record.previousStock || 0) 
                            ? <ArrowUpDown className="h-4 w-4" /> 
                            : <ArrowUpDown className="h-4 w-4" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h4 className="font-medium">
                                {record.newStock > (record.previousStock || 0) 
                                  ? 'Stock Increased' 
                                  : 'Stock Decreased'}
                              </h4>
                              <span className="text-sm text-muted-foreground">
                                {new Date(record.timestamp!).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm my-1">
                              {record.changeReason}
                            </p>
                            <div className="flex items-center text-sm font-medium">
                              <span>{record.previousStock || 0}</span>
                              <span className="mx-2">→</span>
                              <span>{record.newStock}</span>
                              <span className="ml-2 text-sm font-normal text-muted-foreground">
                                ({record.newStock > (record.previousStock || 0) 
                                  ? `+${record.newStock - (record.previousStock || 0)}` 
                                  : `${record.newStock - (record.previousStock || 0)}`})
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                      <h3 className="text-lg font-medium">No history available</h3>
                      <p className="text-muted-foreground">
                        There are no inventory changes recorded for this product.
                      </p>
                    </div>
                  )
                )
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                  <h3 className="text-lg font-medium">Select a product</h3>
                  <p className="text-muted-foreground">
                    Select a product to view its inventory history.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Inventory Update Dialog */}
      {selectedProduct && (
        <InventoryUpdateDialog
          productId={selectedProduct.id}
          productName={selectedProduct.name}
          currentStock={selectedProduct.inventory || 0}
          isOpen={isUpdateDialogOpen}
          onClose={() => setIsUpdateDialogOpen(false)}
        />
      )}
    </div>
  );
}