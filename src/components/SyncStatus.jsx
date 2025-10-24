import React, { useState, useEffect } from 'react';
import { useLocalSync } from '../services/localSyncService.jsx';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Wifi,
  Zap,
  Clock
} from 'lucide-react';

const SyncStatus = () => {
  const { syncStatus } = useLocalSync(); // Usar o status do contexto
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getStatusInfo = (currentStatus) => {
    switch (currentStatus) {
      case 'synced':
        return {
          label: 'Sincronizado',
          variant: 'default',
          icon: <CheckCircle className="h-4 w-4" />,
          description: 'Dados locais sincronizados entre abas.',
        };
      case 'syncing':
        return {
          label: 'Sincronizando...',
          variant: 'default',
          icon: <RefreshCw className="h-4 w-4 animate-spin" />,
          description: 'Aguardando sincronização de dados.',
        };
      case 'error':
        return {
          label: 'Erro de Sincronização',
          variant: 'destructive',
          icon: <AlertCircle className="h-4 w-4" />,
          description: 'Houve um erro na sincronização de dados.',
        };
      case 'idle':
      default:
        return {
          label: 'Pronto',
          variant: 'outline',
          icon: <Clock className="h-4 w-4" />,
          description: 'Sistema pronto para uso.',
        };
    }
  };

  const statusInfo = getStatusInfo(syncStatus);

  return (
    <div className="flex items-center gap-2">
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        {statusInfo.icon}
        {statusInfo.label}
      </Badge>
      <Badge variant={isOnline ? 'default' : 'destructive'} className="flex items-center gap-1">
        {isOnline ? <Wifi className="h-4 w-4" /> : <CloudOff className="h-4 w-4" />}
        {isOnline ? 'Online' : 'Offline'}
      </Badge>
    </div>
  );
};

export default SyncStatus;
