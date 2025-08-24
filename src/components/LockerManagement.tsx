import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Lock, Unlock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { useToast } from '@/hooks/use-toast';

interface LockerManagementProps {
  onNavigate: (page: string) => void;
}

const LockerManagement: React.FC<LockerManagementProps> = ({ onNavigate }) => {
  const { orders, lockerStatus, assignLocker, openLocker, closeLocker } = useAdmin();
  const { toast } = useToast();
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');

  const pendingOrders = orders.filter(order => order.status === 'pending');

  const getStatusIcon = () => {
    switch (lockerStatus.status) {
      case 'occupied':
        return <CheckCircle className="h-6 w-6 text-success" />;
      case 'empty':
        return <CheckCircle className="h-6 w-6 text-success" />;
      case 'tampered':
        return <AlertTriangle className="h-6 w-6 text-destructive" />;
      default:
        return <CheckCircle className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (lockerStatus.status) {
      case 'occupied':
        return 'bg-primary text-primary-foreground';
      case 'empty':
        return 'bg-success text-success-foreground';
      case 'tampered':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleAssignLocker = () => {
    if (!selectedOrderId) {
      toast({
        title: "No Order Selected",
        description: "Please select an order to assign to the locker.",
        variant: "destructive"
      });
      return;
    }

    assignLocker(selectedOrderId);
    const order = orders.find(o => o.id === selectedOrderId);
    toast({
      title: "Locker Assigned",
      description: `Locker assigned to Order #${selectedOrderId} - ${order?.customerName}`,
    });
    setSelectedOrderId('');
  };

  const handleOpenLocker = () => {
    openLocker();
    toast({
      title: "Locker Opened",
      description: "Locker has been opened successfully.",
    });
  };

  const handleCloseLocker = () => {
    closeLocker();
    toast({
      title: "Locker Closed",
      description: "Locker has been closed and cleared.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary-foreground hover:bg-primary/20"
            onClick={() => onNavigate('dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Locker Management</h1>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Locker Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Locker Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              {getStatusIcon()}
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium">Locker #1</h3>
                  <Badge className={getStatusColor()}>
                    {lockerStatus.status.charAt(0).toUpperCase() + lockerStatus.status.slice(1)}
                  </Badge>
                </div>
                {lockerStatus.assignedOrderId && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Assigned to Order #{lockerStatus.assignedOrderId}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Assign Order to Locker</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an order to assign" />
              </SelectTrigger>
              <SelectContent>
                {pendingOrders.map((order) => (
                  <SelectItem key={order.id} value={order.id}>
                    Order #{order.id}: {order.customerName} - {order.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              className="w-full"
              onClick={handleAssignLocker}
              disabled={!selectedOrderId || lockerStatus.status === 'occupied'}
            >
              <Lock className="mr-2 h-4 w-4" />
              Assign Locker
            </Button>
          </CardContent>
        </Card>

        {/* Locker Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Locker Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full"
              onClick={handleOpenLocker}
            >
              <Unlock className="mr-2 h-4 w-4" />
              Open Locker
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleCloseLocker}
              disabled={lockerStatus.status === 'empty'}
            >
              <Lock className="mr-2 h-4 w-4" />
              Close Locker
            </Button>
          </CardContent>
        </Card>

        {/* Status Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Status Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Locker ID:</span>
                <span className="font-medium">{lockerStatus.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Status:</span>
                <span className="font-medium capitalize">{lockerStatus.status}</span>
              </div>
              {lockerStatus.assignedOrderId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assigned Order:</span>
                  <span className="font-medium">#{lockerStatus.assignedOrderId}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default LockerManagement;