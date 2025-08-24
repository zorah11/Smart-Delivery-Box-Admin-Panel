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
  Unlock,
  Package,
  Shield,
  Activity,
  TrendingUp
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
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <Navigation currentPage="dashboard" onNavigate={onNavigate} />
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast({ title: "Status refreshed" })}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="p-6">
        {/* Stats Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-3xl font-bold text-foreground">{orders.length}</p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-success">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                  <p className="text-3xl font-bold text-foreground">
                    {orders.filter(o => o.status === 'delivered').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-warning">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Locker Status</p>
                  <p className="text-lg font-semibold text-foreground capitalize">{lockerStatus.status}</p>
                </div>
                {getStatusIcon()}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-accent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active PINs</p>
                  <p className="text-3xl font-bold text-foreground">3</p>
                </div>
                <Shield className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Locker Status Card */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon()}
                  <div>
                    <p className="font-medium">Locker #1</p>
                    <Badge variant="outline" className={getStatusColor()}>
                      {getStatusText()}
                    </Badge>
                  </div>
                </div>
                {lockerStatus.assignedOrderId && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Assigned Order</p>
                    <p className="font-medium">#{lockerStatus.assignedOrderId}</p>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  className="w-full h-12"
                  onClick={() => handleQuickAction('generate-pin')}
                >
                  <Key className="mr-2 h-4 w-4" />
                  Generate PIN
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full h-12"
                  onClick={() => handleQuickAction('open-locker')}
                >
                  <Unlock className="mr-2 h-4 w-4" />
                  Open Locker
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Card */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground leading-tight">
                      {activity.details}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;