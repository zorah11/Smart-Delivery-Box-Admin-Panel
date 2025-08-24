import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Bell, AlertTriangle, CheckCircle, Filter } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';

interface NotificationsProps {
  onNavigate: (page: string) => void;
}

const Notifications: React.FC<NotificationsProps> = ({ onNavigate }) => {
  const { notifications } = useAdmin();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'delivery':
        return <Bell className="h-5 w-5 text-primary" />;
      case 'tamper':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'pin_failure':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getNotificationColor = (type: string, critical: boolean) => {
    if (critical) return 'border-destructive bg-destructive/5';
    switch (type) {
      case 'delivery':
        return 'border-success bg-success/5';
      case 'tamper':
        return 'border-destructive bg-destructive/5';
      case 'pin_failure':
        return 'border-warning bg-warning/5';
      default:
        return '';
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
            <h1 className="text-xl font-semibold">Notifications</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary-foreground hover:bg-primary/20"
          >
            <Filter className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="p-4">
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`border-l-4 ${getNotificationColor(notification.type, notification.critical)}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{notification.message}</p>
                      {notification.critical && (
                        <Badge variant="destructive" className="ml-2">
                          Critical
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.timestamp.toLocaleDateString()} {notification.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {notifications.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                No notifications
              </h3>
              <p className="text-muted-foreground">
                All caught up! New notifications will appear here.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Notifications;