import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Smartphone,
  Monitor,
  Wifi,
  WifiOff,
  Zap
} from 'lucide-react'
import supabaseRealTimeSync from '../services/supabaseRealTimeSync'

const SyncStatus = () => {
  const [syncStatus, setSyncStatus] = useState(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [lastSyncResult, setLastSyncResult] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isRealTimeActive, setIsRealTimeActive] = useState(false)

  // Atualizar status da sincronização
  const updateSyncStatus = () => {
    const status = supabaseRealTimeSync.getSyncStatus()
    setSyncStatus(status)
    setIsRealTimeActive(status.isInitialized)
  }

  // Inicializar componente
  useEffect(() => {
    // Inicializar serviço de sincronização
    const initializeSync = async () => {
      const success = await supabaseRealTimeSync.initialize()
      if (success) {
        updateSyncStatus()
      }
    }
    
    initializeSync()

    // Listeners para eventos de rede
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Adicionar listener para atualizações de sincronização
    const syncListener = (result) => {
      setLastSyncResult(result)
      updateSyncStatus()
      
      if (result.status === 'syncing' || result.status === 'initializing') {
        setIsSyncing(true)
      } else {
        setIsSyncing(false)
      }
    }
    
    supabaseRealTimeSync.addSyncListener(syncListener)
    
    // Listener para atualizações em tempo real
    const handleRealtimeUpdate = (event) => {
      updateSyncStatus()
      setLastSyncResult({ 
        status: 'realtime', 
        message: 'Dados atualizados em tempo real',
        source: 'realtime'
      })
    }
    
    window.addEventListener('adega-realtime-update', handleRealtimeUpdate)
    
    // Listener para atualizações de dados
    const handleDataUpdated = (event) => {
      updateSyncStatus()
    }
    
    window.addEventListener('adega-data-updated', handleDataUpdated)

    // Atualizar status periodicamente
    const interval = setInterval(updateSyncStatus, 5000) // A cada 5 segundos

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('adega-realtime-update', handleRealtimeUpdate)
      window.removeEventListener('adega-data-updated', handleDataUpdated)
      supabaseRealTimeSync.removeSyncListener(syncListener)
      clearInterval(interval)
    }
  }, [])

  // Forçar sincronização manual
  const handleManualSync = async () => {
    setIsSyncing(true)
    try {
      const success = await supabaseRealTimeSync.syncNow()
      if (success) {
        setLastSyncResult({ 
          status: 'synced', 
          message: 'Sincronização manual concluída' 
        })
      }
      updateSyncStatus()
    } catch (error) {
      setLastSyncResult({ 
        status: 'error', 
        message: 'Erro na sincronização: ' + error.message 
      })
    } finally {
      setIsSyncing(false)
    }
  }

  // Resetar sincronização
  const handleResetSync = async () => {
    setIsSyncing(true)
    try {
      const success = await supabaseRealTimeSync.reset()
      if (success) {
        setLastSyncResult({ 
          status: 'reset', 
          message: 'Sincronização reinicializada' 
        })
      }
      updateSyncStatus()
    } catch (error) {
      setLastSyncResult({ 
        status: 'error', 
        message: 'Erro ao resetar: ' + error.message 
      })
    } finally {
      setIsSyncing(false)
    }
  }

  // Obter ícone do status
  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-4 w-4 text-gray-400" />
    if (isSyncing) return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
    if (lastSyncResult?.status === 'error') return <AlertCircle className="h-4 w-4 text-red-500" />
    if (lastSyncResult?.source === 'realtime') return <Zap className="h-4 w-4 text-yellow-500" />
    if (isRealTimeActive) return <CheckCircle className="h-4 w-4 text-green-500" />
    return <Cloud className="h-4 w-4 text-gray-400" />
  }

  // Obter cor do badge
  const getBadgeVariant = () => {
    if (!isOnline) return 'secondary'
    if (isSyncing) return 'default'
    if (lastSyncResult?.status === 'error') return 'destructive'
    if (lastSyncResult?.source === 'realtime') return 'default'
    if (isRealTimeActive) return 'default'
    return 'secondary'
  }

  // Obter texto do status
  const getStatusText = () => {
    if (!isOnline) return 'Offline'
    if (isSyncing) return 'Sincronizando...'
    if (lastSyncResult?.status === 'error') return 'Erro'
    if (lastSyncResult?.source === 'realtime') return 'Tempo Real'
    if (isRealTimeActive) return 'Ativo'
    return 'Aguardando'
  }

  // Formatar data da última sincronização
  const formatLastSync = (date) => {
    if (!date) return 'Nunca'
    
    const now = new Date()
    const syncDate = new Date(date)
    const diff = now - syncDate
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Agora'
    if (minutes < 60) return `${minutes}m atrás`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h atrás`
    
    const days = Math.floor(hours / 24)
    return `${days}d atrás`
  }

  if (!syncStatus) return null

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">Sincronização</span>
                <Badge variant={getBadgeVariant()} className="text-xs">
                  {getStatusText()}
                </Badge>
                {isRealTimeActive && (
                  <Badge variant="outline" className="text-xs">
                    <Zap className="h-3 w-3 mr-1" />
                    Real-time
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                  {isOnline ? 'Online' : 'Offline'}
                </span>
                <span>
                  Última sync: {formatLastSync(syncStatus.lastSync)}
                </span>
                {syncStatus.offlineQueueSize > 0 && (
                  <span className="text-orange-600">
                    Fila: {syncStatus.offlineQueueSize}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualSync}
              disabled={!isOnline || isSyncing}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
              Sync
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetSync}
              disabled={isSyncing}
              title="Reinicializar sincronização"
            >
              <AlertCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Informações detalhadas */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-500">Dispositivo:</span>
              <div className="flex items-center gap-1 mt-1">
                {/Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 
                  <Smartphone className="h-3 w-3" /> : 
                  <Monitor className="h-3 w-3" />
                }
                <span className="font-mono text-xs">
                  {syncStatus.deviceId?.slice(-8) || 'N/A'}
                </span>
              </div>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <div className="flex items-center gap-1 mt-1">
                {isRealTimeActive ? (
                  <>
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-green-600">Inicializado</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 text-orange-500" />
                    <span className="text-orange-600">Aguardando</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Resultado da última sincronização */}
        {lastSyncResult && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className={`text-xs p-2 rounded flex items-center gap-2 ${
              lastSyncResult.status === 'error' 
                ? 'bg-red-50 text-red-700' 
                : lastSyncResult.status === 'syncing' || lastSyncResult.status === 'initializing'
                ? 'bg-blue-50 text-blue-700'
                : lastSyncResult.source === 'realtime'
                ? 'bg-yellow-50 text-yellow-700'
                : 'bg-green-50 text-green-700'
            }`}>
              {lastSyncResult.source === 'realtime' && <Zap className="h-3 w-3" />}
              {lastSyncResult.status === 'error' && <AlertCircle className="h-3 w-3" />}
              {(lastSyncResult.status === 'synced' || lastSyncResult.status === 'initialized') && <CheckCircle className="h-3 w-3" />}
              {(lastSyncResult.status === 'syncing' || lastSyncResult.status === 'initializing') && <RefreshCw className="h-3 w-3 animate-spin" />}
              <span>{lastSyncResult.message}</span>
            </div>
          </div>
        )}

        {/* Informações sobre sincronização em tempo real */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            <div className="flex items-center gap-1 mb-1">
              <Zap className="h-3 w-3" />
              <span className="font-medium">Sincronização em Tempo Real</span>
            </div>
            <p>
              {isRealTimeActive ? (
                'Conectado! Alterações são sincronizadas automaticamente entre todos os dispositivos.'
              ) : (
                'Aguardando conexão. Alterações serão sincronizadas quando a conexão for estabelecida.'
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SyncStatus
