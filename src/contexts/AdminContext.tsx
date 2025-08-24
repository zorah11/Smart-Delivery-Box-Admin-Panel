import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Order {
  id: string;
  customerName: string;
  description: string;
  status: 'pending' | 'assigned' | 'delivered';
}

interface PIN {
  code: string;
  orderId: string;
  expiryTime: Date;
  used: boolean;
  generatedAt: Date;
}

interface Notification {
  id: string;
  type: 'delivery' | 'tamper' | 'pin_failure';
  message: string;
  timestamp: Date;
  critical: boolean;
}

interface ActivityLog {
  id: string;
  action: string;
  orderId?: string;
  timestamp: Date;
  details: string;
}

interface LockerStatus {
  id: string;
  status: 'empty' | 'occupied' | 'tampered';
  assignedOrderId?: string;
}

interface AdminContextType {
  orders: Order[];
  currentPIN: PIN | null;
  pinHistory: PIN[];
  notifications: Notification[];
  activityLogs: ActivityLog[];
  lockerStatus: LockerStatus;
  generatePIN: (orderId: string) => void;
  resetPIN: () => void;
  assignLocker: (orderId: string) => void;
  openLocker: () => void;
  closeLocker: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  // Mock data
  const [orders] = useState<Order[]>([
    { id: '123', customerName: 'John Doe', description: 'Electronics', status: 'pending' },
    { id: '124', customerName: 'Jane Smith', description: 'Books', status: 'pending' },
    { id: '125', customerName: 'Bob Johnson', description: 'Clothing', status: 'assigned' },
    { id: '126', customerName: 'Alice Brown', description: 'Home Goods', status: 'pending' },
    { id: '127', customerName: 'Charlie Wilson', description: 'Sports Equipment', status: 'delivered' },
  ]);

  const [currentPIN, setCurrentPIN] = useState<PIN | null>(null);
  const [pinHistory, setPinHistory] = useState<PIN[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', type: 'delivery', message: 'Package delivered at 08:30 AM', timestamp: new Date('2025-08-24T08:30:00'), critical: false },
    { id: '2', type: 'tamper', message: 'Tamper attempt detected', timestamp: new Date('2025-08-24T09:15:00'), critical: true },
    { id: '3', type: 'pin_failure', message: 'Invalid PIN attempt', timestamp: new Date('2025-08-24T10:00:00'), critical: true },
    { id: '4', type: 'delivery', message: 'Package delivered at 02:45 PM', timestamp: new Date('2025-08-24T14:45:00'), critical: false },
    { id: '5', type: 'tamper', message: 'Suspicious activity detected', timestamp: new Date('2025-08-24T15:20:00'), critical: true },
  ]);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    { id: '1', action: 'PIN Generated', orderId: '123', timestamp: new Date('2025-08-24T08:00:00'), details: 'PIN 4839 generated for Order #123' },
    { id: '2', action: 'Package Delivered', orderId: '122', timestamp: new Date('2025-08-24T08:30:00'), details: 'Package delivered successfully' },
    { id: '3', action: 'Locker Opened', timestamp: new Date('2025-08-24T09:00:00'), details: 'Locker opened by admin' },
    { id: '4', action: 'Tamper Alert', timestamp: new Date('2025-08-24T09:15:00'), details: 'Tamper attempt detected and logged' },
    { id: '5', action: 'PIN Reset', orderId: '123', timestamp: new Date('2025-08-24T10:30:00'), details: 'PIN reset for Order #123' },
  ]);

  const [lockerStatus, setLockerStatus] = useState<LockerStatus>({
    id: '1',
    status: 'occupied',
    assignedOrderId: '125'
  });

  const generatePIN = (orderId: string) => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + 24);

    const newPIN: PIN = {
      code: pin,
      orderId,
      expiryTime,
      used: false,
      generatedAt: new Date()
    };

    setCurrentPIN(newPIN);
    setPinHistory(prev => [newPIN, ...prev]);

    // Add to activity logs
    const logEntry: ActivityLog = {
      id: Date.now().toString(),
      action: 'PIN Generated',
      orderId,
      timestamp: new Date(),
      details: `PIN ${pin} generated for Order #${orderId}`
    };
    setActivityLogs(prev => [logEntry, ...prev]);

    // Add notification
    const notification: Notification = {
      id: Date.now().toString(),
      type: 'delivery',
      message: `SMS sent: PIN ${pin} for Order #${orderId}`,
      timestamp: new Date(),
      critical: false
    };
    setNotifications(prev => [notification, ...prev]);
  };

  const resetPIN = () => {
    if (currentPIN) {
      setCurrentPIN(null);
      
      const logEntry: ActivityLog = {
        id: Date.now().toString(),
        action: 'PIN Reset',
        orderId: currentPIN.orderId,
        timestamp: new Date(),
        details: `PIN reset for Order #${currentPIN.orderId}`
      };
      setActivityLogs(prev => [logEntry, ...prev]);
    }
  };

  const assignLocker = (orderId: string) => {
    setLockerStatus(prev => ({
      ...prev,
      status: 'occupied',
      assignedOrderId: orderId
    }));

    const logEntry: ActivityLog = {
      id: Date.now().toString(),
      action: 'Locker Assigned',
      orderId,
      timestamp: new Date(),
      details: `Locker assigned to Order #${orderId}`
    };
    setActivityLogs(prev => [logEntry, ...prev]);
  };

  const openLocker = () => {
    const logEntry: ActivityLog = {
      id: Date.now().toString(),
      action: 'Locker Opened',
      timestamp: new Date(),
      details: 'Locker opened by admin'
    };
    setActivityLogs(prev => [logEntry, ...prev]);
  };

  const closeLocker = () => {
    setLockerStatus(prev => ({
      ...prev,
      status: 'empty',
      assignedOrderId: undefined
    }));

    const logEntry: ActivityLog = {
      id: Date.now().toString(),
      action: 'Locker Closed',
      timestamp: new Date(),
      details: 'Locker closed and cleared'
    };
    setActivityLogs(prev => [logEntry, ...prev]);
  };

  const value = {
    orders,
    currentPIN,
    pinHistory,
    notifications,
    activityLogs,
    lockerStatus,
    generatePIN,
    resetPIN,
    assignLocker,
    openLocker,
    closeLocker
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};