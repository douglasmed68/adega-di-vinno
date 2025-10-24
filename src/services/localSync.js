// Serviço de sincronização local para a Adega Di Vinno
// Implementação simplificada usando apenas localStorage

class LocalSyncService {
  constructor() {
    this.syncInterval = null
    this.lastSync = localStorage.getItem('adega-last-sync') || 0
    this.isOnline = navigator.onLine
    this.deviceId = this.getDeviceId()
    this.syncListeners = []
  }

  // Inicializar sincronização
  async initialize() {
    try {
      // Configurar listeners para eventos de atualização
      this.setupEventListeners()
      
      // Iniciar sincronização automática
      this.startAutoSync()
      
      return true
    } catch (error) {
      console.error('Erro ao inicializar sincronização:', error)
      return false
    }
  }

  // Configurar listeners para eventos de atualização
  setupEventListeners() {
    // Listener para produtos atualizados
    window.addEventListener('adega-products-updated', (event) => {
      if (event.detail?.products) {
        this.updateLastModified()
      }
    })
    
    // Listener para vendas atualizadas
    window.addEventListener('adega-vendas-updated', (event) => {
      if (event.detail?.vendas) {
        this.updateLastModified()
      }
    })
    
    // Listener para clientes atualizados
    window.addEventListener('adega-clientes-updated', (event) => {
      if (event.detail?.clientes) {
        this.updateLastModified()
      }
    })
    
    // Listener para compras atualizadas
    window.addEventListener('adega-compras-updated', (event) => {
      if (event.detail?.compras) {
        this.updateLastModified()
      }
    })
  }

  // Atualizar timestamp de última modificação
  updateLastModified() {
    const timestamp = Date.now()
    localStorage.setItem('adega-last-modified', timestamp.toString())
    localStorage.setItem('adega-last-sync', timestamp.toString())
    
    // Notificar listeners
    this.notifySyncListeners({
      status: 'updated',
      message: 'Dados atualizados localmente',
      timestamp
    })
  }

  // Obter ID único do dispositivo
  getDeviceId() {
    let deviceId = localStorage.getItem('adega-device-id')
    if (!deviceId) {
      deviceId = 'device-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('adega-device-id', deviceId)
    }
    return deviceId
  }

  // Adicionar listener para sincronização
  addSyncListener(listener) {
    this.syncListeners.push(listener)
  }

  // Remover listener para sincronização
  removeSyncListener(listener) {
    this.syncListeners = this.syncListeners.filter(l => l !== listener)
  }

  // Notificar listeners
  notifySyncListeners(data) {
    this.syncListeners.forEach(listener => {
      try {
        listener(data)
      } catch (error) {
        console.error('Erro ao notificar listener:', error)
      }
    })
  }

  // Iniciar sincronização automática
  startAutoSync() {
    // Simular sincronização a cada 15 segundos
    this.syncInterval = setInterval(() => {
      this.simulateSync()
    }, 15000)
    
    // Sincronizar quando a página ganha foco
    window.addEventListener('focus', () => {
      this.simulateSync()
    })
    
    // Sincronizar quando online
    window.addEventListener('online', () => {
      this.isOnline = true
      this.simulateSync()
    })
    
    // Marcar como offline
    window.addEventListener('offline', () => {
      this.isOnline = false
      this.notifySyncListeners({
        status: 'offline',
        message: 'Dispositivo está offline'
      })
    })
  }

  // Simular sincronização
  async simulateSync() {
    try {
      // Verificar se está online
      if (!navigator.onLine) {
        return {
          status: 'offline',
          message: 'Dispositivo está offline'
        }
      }
      
      // Simular sincronização bem-sucedida
      const result = {
        status: 'synced',
        message: 'Dados sincronizados com sucesso',
        timestamp: Date.now()
      }
      
      // Atualizar timestamp de última sincronização
      localStorage.setItem('adega-last-sync', result.timestamp.toString())
      
      // Notificar listeners
      this.notifySyncListeners(result)
      
      return result
    } catch (error) {
      console.error('Erro na sincronização:', error)
      const result = {
        status: 'error',
        message: 'Erro na sincronização: ' + error.message
      }
      
      // Notificar listeners
      this.notifySyncListeners(result)
      
      return result
    }
  }

  // Parar sincronização automática
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  // Forçar sincronização manual
  async forcSync() {
    return this.simulateSync()
  }

  // Verificar status da sincronização
  getSyncStatus() {
    const lastSync = localStorage.getItem('adega-last-sync')
    const lastModified = localStorage.getItem('adega-last-modified')
    
    return {
      lastSync: lastSync ? new Date(parseInt(lastSync)) : null,
      lastModified: lastModified ? new Date(parseInt(lastModified)) : null,
      deviceId: this.deviceId,
      isOnline: navigator.onLine
    }
  }
}

// Instância global do serviço
const localSync = new LocalSyncService()

export default localSync
