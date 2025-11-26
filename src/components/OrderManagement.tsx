import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Plus, Edit, Trash2, Package, Search } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { useToast } from '@/hooks/use-toast';

interface OrderManagementProps {
  onNavigate: (page: string) => void;
}

const OrderManagement: React.FC<OrderManagementProps> = ({ onNavigate }) => {
  const { orders, addOrder, updateOrder, deleteOrder } = useAdmin();
  const { toast } = useToast();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Form state
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    description: '',
    trackingNumber: '',
    status: 'pending' as 'pending',
  });

  const resetForm = () => {
    setFormData({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      description: '',
      trackingNumber: generateTrackingNumber(),
      status: 'pending',
    });
  };

  const generateTrackingNumber = () => {
    const prefix = 'TRK';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  };

  const handleAddOrder = () => {
    if (!formData.customerName || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Customer name and product description are required.",
        variant: "destructive",
      });
      return;
    }

    // Ensure tracking number is generated
    const orderData = {
      ...formData,
      trackingNumber: formData.trackingNumber || generateTrackingNumber(),
    };

    addOrder(orderData);
    toast({
      title: "Order Added",
      description: `Order for ${formData.customerName} has been created successfully.`,
    });
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditOrder = () => {
    if (!selectedOrder) return;

    if (!formData.customerName || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Customer name and product description are required.",
        variant: "destructive",
      });
      return;
    }

    updateOrder(selectedOrder.id, formData);
    toast({
      title: "Order Updated",
      description: `Order #${selectedOrder.id} has been updated successfully.`,
    });
    setIsEditDialogOpen(false);
    setSelectedOrder(null);
    resetForm();
  };

  const handleDeleteOrder = () => {
    if (!selectedOrder) return;

    deleteOrder(selectedOrder.id);
    toast({
      title: "Order Deleted",
      description: `Order #${selectedOrder.id} has been removed.`,
    });
    setIsDeleteDialogOpen(false);
    setSelectedOrder(null);
  };

  const openEditDialog = (order: any) => {
    setSelectedOrder(order);
    setFormData({
      customerName: order.customerName,
      customerPhone: order.customerPhone || '',
      customerEmail: order.customerEmail || '',
      description: order.description,
      trackingNumber: order.trackingNumber || '',
      status: order.status,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (order: any) => {
    setSelectedOrder(order);
    setIsDeleteDialogOpen(true);
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-primary/20"
              onClick={() => onNavigate('dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Order Management</h1>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Order
          </Button>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by customer name, product, or order ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Package className="h-5 w-5" />
              Orders ({filteredOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredOrders.length > 0 ? (
              <div className="space-y-3">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg">{order.customerName}</h3>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>Product:</strong> {order.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <strong>Order ID:</strong> {order.id}
                      </p>
                      {order.customerPhone && (
                        <p className="text-xs text-muted-foreground">
                          <strong>Phone:</strong> {order.customerPhone}
                        </p>
                      )}
                      {order.customerEmail && (
                        <p className="text-xs text-muted-foreground">
                          <strong>Email:</strong> {order.customerEmail}
                        </p>
                      )}
                      {order.trackingNumber && (
                        <p className="text-xs text-muted-foreground">
                          <strong>Tracking:</strong> {order.trackingNumber}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 mt-3 md:mt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(order)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteDialog(order)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No orders found</p>
                <p className="text-sm">Add your first order to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Add Order Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open);
        if (open && !formData.trackingNumber) {
          setFormData({ ...formData, trackingNumber: generateTrackingNumber() });
        }
      }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Order</DialogTitle>
            <DialogDescription>
              Create a new delivery order for a customer
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                placeholder="John Doe"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone Number</Label>
              <Input
                id="customerPhone"
                placeholder="0774331899"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email Address</Label>
              <Input
                id="customerEmail"
                type="email"
                placeholder="customer@example.com"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Product Description *</Label>
              <Input
                id="description"
                placeholder="Electronics, Shoes, Books, etc."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trackingNumber">Tracking Number (Auto-generated)</Label>
              <Input
                id="trackingNumber"
                value={formData.trackingNumber}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddOrder}>Create Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
            <DialogDescription>
              Update order information for #{selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-customerName">Customer Name *</Label>
              <Input
                id="edit-customerName"
                placeholder="John Doe"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-customerPhone">Phone Number</Label>
              <Input
                id="edit-customerPhone"
                placeholder="0774331899"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-customerEmail">Email Address</Label>
              <Input
                id="edit-customerEmail"
                type="email"
                placeholder="customer@example.com"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Product Description *</Label>
              <Input
                id="edit-description"
                placeholder="Electronics, Shoes, Books, etc."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-trackingNumber">Tracking Number</Label>
              <Input
                id="edit-trackingNumber"
                value={formData.trackingNumber}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              setSelectedOrder(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleEditOrder}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete order #{selectedOrder?.id} for {selectedOrder?.customerName}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsDeleteDialogOpen(false);
              setSelectedOrder(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOrder} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrderManagement;
