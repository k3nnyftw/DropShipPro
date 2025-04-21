import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  AlertCircle, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Edit,
  History, 
  Package, 
  RefreshCw, 
  Search, 
  Settings, 
  Truck
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { InventoryUpdateDialog } from "@/components/inventory/inventory-update-dialog";

export default function InventoryTrackingPage() {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductForUpdate, setSelectedProductForUpdate] = useState<any>(null);
  const queryClient = useQueryClient();

  // Fetch all inventory products
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['/api/inventory-tracking/products'],
    enabled: true,
  });

  // Fetch low stock products
  const { data: lowStockProducts, isLoading: lowStockLoading } = useQuery({
    queryKey: ['/api/inventory-tracking/low-stock'],
    enabled: true,
  });

  // Fetch inventory history for selected product
  const { data: inventoryHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['/api/inventory-tracking/history', selectedProductId],
    enabled: !!selectedProductId,
  });

  // Filter products based on search query
  const filteredProducts = products?.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Inventory Tracking</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Products Tracked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-muted-foreground" />
              <div className="text-2xl font-bold">{productsLoading ? '—' : products?.length || 0}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-8 w-8 text-amber-500" />
              <div className="text-2xl font-bold">{lowStockLoading ? '—' : lowStockProducts?.length || 0}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Truck className="h-8 w-8 text-muted-foreground" />
              <div className="text-2xl font-bold">
                {productsLoading 
                  ? '—' 
                  : '$' + products?.reduce((total, product) => {
                      const inventory = product.inventory || 0;
                      const price = parseFloat(product.price) || 0;
                      return total + (inventory * price);
                    }, 0).toFixed(2) || '0.00'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts && lowStockProducts.length > 0 && (
        <Alert className="mb-6 border-amber-500">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertTitle>Low Stock Alert</AlertTitle>
          <AlertDescription>
            You have {lowStockProducts.length} products below their inventory threshold that need attention.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Products</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
          {selectedProductId && <TabsTrigger value="history">History</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <div className="flex justify-between mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Inventory Status</CardTitle>
              <CardDescription>
                Track inventory levels and set thresholds for all products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Current Stock</TableHead>
                    <TableHead className="text-right">Threshold</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                    <TableHead className="text-right">Last Updated</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">Loading products...</TableCell>
                    </TableRow>
                  ) : filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">No products found</TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => {
                      const isLowStock = product.inventory < product.inventoryThreshold;
                      return (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell className="text-right">{product.inventory || 0}</TableCell>
                          <TableCell className="text-right">{product.inventoryThreshold || 5}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={isLowStock ? "destructive" : "outline"}>
                              {isLowStock ? "Low Stock" : "In Stock"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {product.lastStockUpdate 
                              ? formatDistanceToNow(new Date(product.lastStockUpdate), { addSuffix: true }) 
                              : 'Never'}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSelectedProductId(product.id)}
                              >
                                <History className="h-4 w-4 mr-1" />
                                History
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSelectedProductForUpdate(product)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Update
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="low-stock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Items</CardTitle>
              <CardDescription>
                Products that are below their inventory threshold
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Current Stock</TableHead>
                    <TableHead className="text-right">Threshold</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">Loading low stock products...</TableCell>
                    </TableRow>
                  ) : !lowStockProducts || lowStockProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">No low stock products</TableCell>
                    </TableRow>
                  ) : (
                    lowStockProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-right">{product.inventory || 0}</TableCell>
                        <TableCell className="text-right">{product.inventoryThreshold || 5}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="destructive">Low Stock</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedProductForUpdate(product)}
                            >
                              <ArrowUpCircle className="h-4 w-4 mr-1" />
                              Restock
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedProductId(product.id)}
                            >
                              <History className="h-4 w-4 mr-1" />
                              History
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {selectedProductId && (
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between">
                  <div>
                    <CardTitle>Inventory History</CardTitle>
                    <CardDescription>
                      {products?.find(p => p.id === selectedProductId)?.name || 'Product'} inventory changes over time
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={() => setSelectedProductId(null)}
                  >
                    Back to Products
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Stock Level History Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Change</TableHead>
                      <TableHead>Prev. Stock</TableHead>
                      <TableHead>New Stock</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">Loading history...</TableCell>
                      </TableRow>
                    ) : !inventoryHistory || inventoryHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">No history records found</TableCell>
                      </TableRow>
                    ) : (
                      inventoryHistory.map((record) => {
                        const change = record.newStock - (record.previousStock || 0);
                        return (
                          <TableRow key={record.id}>
                            <TableCell>
                              {new Date(record.timestamp).toLocaleDateString()} 
                              {" "}
                              {new Date(record.timestamp).toLocaleTimeString()}
                            </TableCell>
                            <TableCell>
                              <span className={`flex items-center ${change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : ''}`}>
                                {change > 0 ? (
                                  <ArrowUpCircle className="h-4 w-4 mr-1" />
                                ) : change < 0 ? (
                                  <ArrowDownCircle className="h-4 w-4 mr-1" />
                                ) : null}
                                {change > 0 ? '+' : ''}{change}
                              </span>
                            </TableCell>
                            <TableCell>{record.previousStock || 0}</TableCell>
                            <TableCell>{record.newStock}</TableCell>
                            <TableCell>{record.changeReason}</TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Inventory Update Dialog */}
      {selectedProductForUpdate && (
        <InventoryUpdateDialog
          productId={selectedProductForUpdate.id}
          productName={selectedProductForUpdate.name}
          currentStock={selectedProductForUpdate.inventory || 0}
          isOpen={!!selectedProductForUpdate}
          onClose={() => setSelectedProductForUpdate(null)}
        />
      )}
    </div>
  );
}