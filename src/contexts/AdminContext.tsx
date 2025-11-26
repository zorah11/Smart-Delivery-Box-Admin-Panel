import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Order {
  id: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  description: string;
  trackingNumber?: string;
  status: 'pending' | 'assigned' | 'delivered';
  createdAt?: Date;
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
  addOrder: (orderData: Omit<Order, 'id' | 'createdAt'>) => void;
  updateOrder: (orderId: string, orderData: Partial<Order>) => void;
  deleteOrder: (orderId: string) => void;
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
  // Load orders from localStorage or use default
  const loadOrders = (): Order[] => {
    try {
      const stored = localStorage.getItem('orders');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((order: any) => ({
          ...order,
          createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
        }));
      }
    } catch (e) {
      console.error('Failed to load orders from localStorage:', e);
    }
    return [
      { 
        id: '123', 
        customerName: 'Abdul Swabul', 
        customerPhone: '0774331899',
        description: 'Electronics', 
        status: 'pending',
        createdAt: new Date()
      }
    ];
  };

  const [orders, setOrders] = useState<Order[]>(loadOrders());

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

  const addOrder = (orderData: Omit<Order, 'id' | 'createdAt'>) => {
    const newOrder: Order = {
      ...orderData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    const updatedOrders = [...orders, newOrder];
    setOrders(updatedOrders);

    // Save to localStorage
    try {
      localStorage.setItem('orders', JSON.stringify(updatedOrders.map(order => ({
        ...order,
        createdAt: order.createdAt?.toISOString(),
      }))));
    } catch (e) {
      console.error('Failed to save orders to localStorage:', e);
    }

    // Add activity log
    const logEntry: ActivityLog = {
      id: Date.now().toString(),
      action: 'Order Created',
      orderId: newOrder.id,
      timestamp: new Date(),
      details: `Order #${newOrder.id} created for ${newOrder.customerName} - ${newOrder.description}`,
    };
    setActivityLogs(prev => [logEntry, ...prev]);

    // Add notification
    const notification: Notification = {
      id: Date.now().toString(),
      type: 'delivery',
      message: `New order created for ${newOrder.customerName}`,
      timestamp: new Date(),
      critical: false,
    };
    setNotifications(prev => [notification, ...prev]);
  };

  const updateOrder = (orderId: string, orderData: Partial<Order>) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, ...orderData } : order
    );
    setOrders(updatedOrders);

    // Save to localStorage
    try {
      localStorage.setItem('orders', JSON.stringify(updatedOrders.map(order => ({
        ...order,
        createdAt: order.createdAt?.toISOString(),
      }))));
    } catch (e) {
      console.error('Failed to save orders to localStorage:', e);
    }

    // Add activity log
    const order = updatedOrders.find(o => o.id === orderId);
    if (order) {
      const logEntry: ActivityLog = {
        id: Date.now().toString(),
        action: 'Order Updated',
        orderId: order.id,
        timestamp: new Date(),
        details: `Order #${order.id} updated for ${order.customerName}`,
      };
      setActivityLogs(prev => [logEntry, ...prev]);
    }
  };

  const deleteOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    const updatedOrders = orders.filter(o => o.id !== orderId);
    setOrders(updatedOrders);

    // Save to localStorage
    try {
      localStorage.setItem('orders', JSON.stringify(updatedOrders.map(order => ({
        ...order,
        createdAt: order.createdAt?.toISOString(),
      }))));
    } catch (e) {
      console.error('Failed to save orders to localStorage:', e);
    }

    // Add activity log
    if (order) {
      const logEntry: ActivityLog = {
        id: Date.now().toString(),
        action: 'Order Deleted',
        orderId: orderId,
        timestamp: new Date(),
        details: `Order #${orderId} for ${order.customerName} was deleted`,
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
    addOrder,
    updateOrder,
    deleteOrder,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};