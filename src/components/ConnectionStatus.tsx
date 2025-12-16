import { useState, useEffect } from 'react';
import { Server, Database, RefreshCw } from 'lucide-react';

interface ConnectionStatusProps {
  checkConnection: () => Promise<boolean>;
}

export function ConnectionStatus({ checkConnection }: ConnectionStatusProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    checkStatus();
    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const connected = await checkConnection();
      setIsConnected(connected);
    } catch (error) {
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleManualCheck = async () => {
    await checkStatus();
  };

  if (isConnected === null) {
    return null; // Don't show anything until first check
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all ${
          isConnected
            ? 'bg-[var(--sage-green)] text-white'
            : 'bg-[var(--warm-sand)] text-white'
        }`}
      >
        {isConnected ? (
          <>
            <Server className="w-4 h-4" />
            <span className="text-sm">Supabase Connected</span>
          </>
        ) : (
          <>
            <Database className="w-4 h-4" />
            <span className="text-sm">Local Storage Mode</span>
          </>
        )}
        <button
          onClick={handleManualCheck}
          disabled={isChecking}
          className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
          title="Retry connection"
        >
          <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
}