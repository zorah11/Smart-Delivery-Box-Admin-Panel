import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Key, RotateCcw, Clock, Loader2 } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { useToast } from '@/hooks/use-toast';

interface PINManagementProps {
  onNavigate: (page: string) => void;
}

const PINManagement: React.FC<PINManagementProps> = ({ onNavigate }) => {
  const { orders, currentPIN, pinHistory, savePIN, resetPIN } = useAdmin();
  const { toast } = useToast();
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [phone, setPhone] = useState<string>('0774331899');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastError, setLastError] = useState<string>('');

  const pendingOrders = orders.filter(order => order.status === 'pending' || order.status === 'assigned');

  const handleGeneratePIN = async () => {
    if (!selectedOrderId) {
      toast({
        title: "No Order Selected",
        description: "Please select an order to generate a PIN.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setLastError('');
    try {
      const cleanedPhone = phone.replace(/\D/g, '');
      if (!cleanedPhone) {
        throw new Error('Phone number is required and must contain digits only (e.g., 0774331899).');
      }

      // Generate a temporary 4-digit PIN locally (do not persist yet)
      const pinCode = Math.floor(1000 + Math.random() * 9000).toString();
      const order = orders.find(o => o.id === selectedOrderId);

      // Call Netlify function to handle ThingSpeak and SMS
      const functionUrl = '/.netlify/functions/sendPin';
      const serverRes = await fetch(functionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrderId,
          pin: pinCode,
          phone: cleanedPhone,
        }),
      });
      const serverJson = await serverRes.json().catch(() => null);
      if (!serverRes.ok || !serverJson?.success) {
        throw new Error(serverJson?.message || `Server failed (${serverRes.status})`);
      }
      const tsBody = serverJson.thingspeakEntry;
      console.debug('Server response:', serverJson);
      console.info('ThingSpeak updated and SMS handled by server (if configured).');

      // Only now persist the PIN so it's displayed in Current PIN section
      savePIN(selectedOrderId, pinCode);

      toast({
        title: 'PIN Created & Sent',
        description: `PIN sent to ThingSpeak (entry: ${tsBody.trim()}) and SMS sent to ${cleanedPhone}.`,
      });
    } catch (err: any) {
      const name = err?.name || 'Error';
      const msg = err?.message || 'Unknown error';
      const details = `${name}: ${msg}`;
      setLastError(details);
      console.error('PIN flow failed:', err);
      toast({
        title: `Action Failed: ${name}`,
        description: `${msg}. This might be CORS/network related or an API error.`,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Do not auto-generate on select to avoid confusion; only generate on button click

  const handleResetPIN = () => {
    resetPIN();
    toast({
      title: "PIN Reset",
      description: "Current PIN has been reset successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary-foreground hover:bg-primary/20"
            onClick={() => onNavigate('dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">PIN Management</h1>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Order Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Select Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an order to generate PIN" />
              </SelectTrigger>
              <SelectContent>
                {pendingOrders.map((order) => (
                  <SelectItem key={order.id} value={order.id}>
                    Order #{order.id}: {order.customerName} - {order.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (digits only)</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g., 0774331899"
              />
            </div>
          </CardContent>
        </Card>

      {/* Current PIN */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Current PIN</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            {currentPIN ? (
              <div className="space-y-3">
                <div className="p-4 bg-primary/10 rounded-lg">
                  <div className="text-2xl font-bold text-primary text-center">
                    PIN: {currentPIN.code}
                  </div>
                  <div className="text-sm text-muted-foreground text-center mt-2">
                    Order #{currentPIN.orderId}
                  </div>
                  <div className="text-sm text-muted-foreground text-center">
                    Valid until {currentPIN.expiryTime.toLocaleDateString()} {currentPIN.expiryTime.toLocaleTimeString()}
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="h-4 w-4 text-success" />
                  <Badge variant="outline" className="bg-success/10 text-success border-success">
                    Active
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Key className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No PIN generated</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button 
            className="w-full"
            onClick={handleGeneratePIN}
            disabled={!selectedOrderId || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating & Sending...
              </>
            ) : (
              <>
                <Key className="mr-2 h-4 w-4" />
                Regenerate PIN
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleResetPIN}
            disabled={!currentPIN}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset PIN
          </Button>
        </div>

        {lastError && (
          <div className="p-3 mt-2 rounded bg-destructive/10 text-destructive text-sm">
            <strong>Error:</strong> {lastError}
          </div>
        )}

        {/* PIN History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">PIN History</CardTitle>
          </CardHeader>
          <CardContent>
            {pinHistory.length > 0 ? (
              <div className="space-y-3">
                {pinHistory.slice(0, 5).map((pin, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <div className="font-medium">PIN: {pin.code}</div>
                      <div className="text-sm text-muted-foreground">
                        Order #{pin.orderId}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Generated: {pin.generatedAt.toLocaleDateString()} {pin.generatedAt.toLocaleTimeString()}
                      </div>
                    </div>
                    <Badge variant={pin.used ? "secondary" : "default"}>
                      {pin.used ? "Used" : "Active"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No PIN history available
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PINManagement;