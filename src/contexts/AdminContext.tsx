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

interface AdminContextType {
  orders: Order[];
  currentPIN: PIN | null;
  pinHistory: PIN[];
  notifications: Notification[];
  activityLogs: ActivityLog[];
  generatePIN: (orderId: string) => PIN;
  savePIN: (orderId: string, code: string) => PIN;
  resetPIN: () => void;
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
    { id: '123', customerName: 'Abdul Swabul', description: 'Electronics', status: 'pending' }
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
    { id: '4', action: 'Tamper Alert', timestamp: new Date('2025-08-24T09:15:00'), details: 'Tamper attempt detected and logged' },
    { id: '5', action: 'PIN Reset', orderId: '123', timestamp: new Date('2025-08-24T10:30:00'), details: 'PIN reset for Order #123' },
  ]);

  const generatePIN = (orderId: string): PIN => {
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

    // Persist to localStorage for later upload
    try {
      localStorage.setItem('currentPIN', JSON.stringify({
        ...newPIN,
        expiryTime: newPIN.expiryTime.toISOString(),
        generatedAt: newPIN.generatedAt.toISOString(),
      }));
      const existing = JSON.parse(localStorage.getItem('pinHistory') || '[]');
      const newHistory = [{
        ...newPIN,
        expiryTime: newPIN.expiryTime.toISOString(),
        generatedAt: newPIN.generatedAt.toISOString(),
      }, ...existing];
      localStorage.setItem('pinHistory', JSON.stringify(newHistory));
    } catch (e) {
      // no-op if storage fails
    }

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
    return newPIN;
  };

  const savePIN = (orderId: string, code: string): PIN => {
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + 24);

    const newPIN: PIN = {
      code,
      orderId,
      expiryTime,
      used: false,
      generatedAt: new Date()
    };

    setCurrentPIN(newPIN);
    setPinHistory(prev => [newPIN, ...prev]);

    try {
      localStorage.setItem('currentPIN', JSON.stringify({
        ...newPIN,
        expiryTime: newPIN.expiryTime.toISOString(),
        generatedAt: newPIN.generatedAt.toISOString(),
      }));
      const existing = JSON.parse(localStorage.getItem('pinHistory') || '[]');
      const newHistory = [{
        ...newPIN,
        expiryTime: newPIN.expiryTime.toISOString(),
        generatedAt: newPIN.generatedAt.toISOString(),
      }, ...existing];
      localStorage.setItem('pinHistory', JSON.stringify(newHistory));
    } catch {}

    const logEntry: ActivityLog = {
      id: Date.now().toString(),
      action: 'PIN Generated',
      orderId,
      timestamp: new Date(),
      details: `PIN ${code} generated for Order #${orderId}`
    };
    setActivityLogs(prev => [logEntry, ...prev]);

    return newPIN;
  };

  const resetPIN = () => {
    if (currentPIN) {
      setCurrentPIN(null);
      try {
        localStorage.removeItem('currentPIN');
      } catch {}
      
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

  const value = {
    orders,
    currentPIN,
    pinHistory,
    notifications,
    activityLogs,
    generatePIN,
    savePIN,
    resetPIN,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};