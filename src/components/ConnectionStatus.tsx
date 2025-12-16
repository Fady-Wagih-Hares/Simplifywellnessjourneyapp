import { useState, useEffect } from 'react';
import { Server, Database, RefreshCw, AlertCircle } from 'lucide-react';

interface ConnectionStatusProps {
  checkConnection: () => Promise<boolean>;
}

export function ConnectionStatus({ checkConnection }: ConnectionStatusProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

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
      
      // Auto-hide details if connection is successful
      if (connected && showDetails) {
        setTimeout(() => setShowDetails(false), 3000);
      }
    } catch (error) {
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleManualCheck = async () => {
    await checkStatus();
  };
  
  const toggleDetails = () => {
    setShowDetails(!showDetails);
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
            <button
              onClick={toggleDetails}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
              title="View diagnostics"
            >
              <AlertCircle className="w-3 h-3" />
            </button>
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
      
      {!isConnected && showDetails && (
        <div className="mt-2 bg-white rounded-lg shadow-xl p-4 text-sm max-w-md">
          <div className="flex items-start gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-[var(--warm-sand)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-gray-800 mb-2">
                <strong>Database Connection Issue</strong>
              </p>
              <p className="text-gray-600 text-xs mb-3">
                Check the browser console (F12) for detailed diagnostics. Common issues:
              </p>
              <ul className="text-xs text-gray-600 space-y-1 ml-4 list-disc">
                <li>The <code className="bg-gray-100 px-1 rounded">kv_store_be1ca0a5</code> table may not exist in your Supabase database</li>
                <li>Environment variables may not be configured properly</li>
                <li>Your Supabase project may be paused or inactive</li>
              </ul>
              <p className="text-xs text-gray-500 mt-3">
                💡 Data is being saved locally and will sync when the connection is restored.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}