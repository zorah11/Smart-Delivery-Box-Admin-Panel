import React from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu, 
  Home, 
  Lock, 
  Bell, 
  FileText, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate }) => {
  const { logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'pin-management', label: 'PIN Management', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'activity-logs', label: 'Activity Logs', icon: FileText },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="bg-primary text-primary-foreground p-6">
          <SheetTitle className="text-primary-foreground text-xl font-bold">
            Smart Delivery Box
          </SheetTitle>
          <p className="text-primary-foreground/80 text-sm mt-1">Admin Panel</p>
        </div>
        
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start h-12 ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => onNavigate(item.id)}
              >
                <Icon className="mr-3 h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Button>
            );
          })}
          
          <div className="pt-6 border-t border-border mt-6">
            <Button
              variant="ghost"
              className="w-full justify-start h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={logout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              <span className="font-medium">Logout</span>
            </Button>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default Navigation;