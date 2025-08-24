import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  RefreshCw,
  Key,
  Unlock
} from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { useToast } from '@/hooks/use-toast';
import Navigation from './Navigation';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { lockerStatus, activityLogs, orders } = useAdmin();
  const { toast } = useToast();

  const getStatusIcon = () => {
    switch (lockerStatus.status) {
      case 'occupied':
        return <CheckCircle className="h-6 w-6 text-success" />;
      case 'empty':
        return <CheckCircle className="h-6 w-6 text-success" />;
      case 'tampered':
        return <AlertTriangle className="h-6 w-6 text-destructive" />;
      default:
        return <CheckCircle className="h-6 w-6 text-success" />;
    }
  };

  const getStatusText = () => {
    switch (lockerStatus.status) {
      case 'occupied':
        return 'Occupied';
      case 'empty':
        return 'Empty';
      case 'tampered':
        return 'Tampered';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = () => {
    switch (lockerStatus.status) {
      case 'occupied':
        return 'bg-success';
      case 'empty':
        return 'bg-success';
      case 'tampered':
        return 'bg-destructive';
      default:
        return 'bg-muted';
    }
  };

  const recentActivities = activityLogs.slice(0, 3);

  const handleQuickAction = (action: string) => {
    if (action === 'generate-pin') {
      onNavigate('pin-management');
    } else if (action === 'open-locker') {
      toast({
        title: "Locker Opened",
        description: "Locker has been opened successfully.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center justify-between">
          <Navigation currentPage="dashboard" onNavigate={onNavigate} />
          <h1 className="text-xl font-semibold">Admin Panel</h1>
          <div></div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Locker Status Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Locker Status</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast({ title: "Status refreshed" })}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <div>
                <Badge className={getStatusColor()}>
                  {getStatusText()}
                </Badge>
                {lockerStatus.assignedOrderId && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Assigned to Order #{lockerStatus.assignedOrderId}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-2 rounded-lg bg-muted/50">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.details}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full"
              onClick={() => handleQuickAction('generate-pin')}
            >
              <Key className="mr-2 h-4 w-4" />
              Generate PIN
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => handleQuickAction('open-locker')}
            >
              <Unlock className="mr-2 h-4 w-4" />
              Open Locker
            </Button>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{orders.length}</div>
              <div className="text-sm text-muted-foreground">Total Orders</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-success">
                {orders.filter(o => o.status === 'delivered').length}
              </div>
              <div className="text-sm text-muted-foreground">Delivered</div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;