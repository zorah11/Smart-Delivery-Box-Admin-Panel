import React from 'react';

interface LockerManagementProps {
  onNavigate: (page: string) => void;
}

const LockerManagement: React.FC<LockerManagementProps> = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-4">
        <h1 className="text-xl font-semibold">Locker Management</h1>
      </header>

      <main className="p-4 space-y-4">
        <div className="p-4 rounded-md border border-border bg-card text-foreground">
          <p className="font-medium">Feature Removed</p>
          <p className="text-sm text-muted-foreground mt-1">
            Locker status and controls have been removed from this application.
          </p>
        </div>
      </main>
    </div>
  );
};

export default LockerManagement;