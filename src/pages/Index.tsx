import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginScreen from '@/components/LoginScreen';
import Dashboard from '@/components/Dashboard';
import PINManagement from '@/components/PINManagement';
import Notifications from '@/components/Notifications';
import LockerManagement from '@/components/LockerManagement';
import ActivityLogs from '@/components/ActivityLogs';

const Index = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!user) {
    return <LoginScreen />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'pin-management':
        return <PINManagement onNavigate={setCurrentPage} />;
      case 'notifications':
        return <Notifications onNavigate={setCurrentPage} />;
      case 'locker-management':
        return <LockerManagement onNavigate={setCurrentPage} />;
      case 'activity-logs':
        return <ActivityLogs onNavigate={setCurrentPage} />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return renderPage();
};

export default Index;
