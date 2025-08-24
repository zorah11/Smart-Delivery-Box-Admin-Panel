import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, Clock } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';

interface ActivityLogsProps {
  onNavigate: (page: string) => void;
}

const ActivityLogs: React.FC<ActivityLogsProps> = ({ onNavigate }) => {
  const { activityLogs } = useAdmin();

  const getActionIcon = (action: string) => {
    return <Clock className="h-4 w-4 text-muted-foreground" />;
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
            <h1 className="text-xl font-semibold">Activity Logs</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary-foreground hover:bg-primary/20"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="p-4">
        <div className="space-y-3">
          {activityLogs.map((log) => (
            <Card key={log.id} className="border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{log.action}</h3>
                      <span className="text-xs text-muted-foreground">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {log.details}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                      <span>{log.timestamp.toLocaleDateString()}</span>
                      {log.orderId && <span>Order #{log.orderId}</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {activityLogs.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                No activity logs
              </h3>
              <p className="text-muted-foreground">
                System activity will be recorded here.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default ActivityLogs;