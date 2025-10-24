// Serviço de sincronização usando Firebase Realtime Database
// Implementação simplificada para demonstração

class FirebaseSyncService {
  constructor() {
    this.baseUrl = 'https://adega-di-vinno-default-rtdb.firebaseio.com'
    this.syncInterval = null
    this.lastSync = localStorage.getItem('adega-last-sync') || 0
    this.isOnline = navigator.onLine
    this.deviceId = this.getDeviceId()
  }

  // Inicializar sincronização
  async initialize() {
    try {
      // Iniciar sincronização automática
      this.startAutoSync()
      
      // Sincronizar dados imediatamente
      await this.syncData()
      
      return true
    } catch (error) {
      console.error('Erro ao inicializar sincronização:', error)
      return false
    }
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

  // Obter dados locais
  getLocalData() {
    try {
      const products = JSON.parse(localStorage.getItem('adega-di-vinno-products') || '[]')
      const clientes = JSON.parse(localStorage.getItem('adega-di-vinno-clientes') || '[]')
      const vendas = JSON.parse(localStorage.getItem('adega-di-vinno-vendas') || '[]')
      const compras = JSON.parse(localStorage.getItem('adega-di-vinno-compras') || '[]')
      
      return {
        products,
        clientes,
        vendas,
        compras,
        lastModified: Date.now(),
        deviceId: this.deviceId
      }
    } catch (error) {
      console.error('Erro ao obter dados locais:', error)
      return { products: [], clientes: [], vendas: [], compras: [], lastModified: Date.now() }
    }
  }

  // Upload para Firebase
  async uploadToFirebase(data) {
    try {
      const cloudData = {
        ...data,
        syncedAt: Date.now(),
        version: Date.now()
      }
      
      // Fazer requisição para Firebase
      const response = await fetch(`${this.baseUrl}/data.json`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cloudData)
      })
      
      if (!response.ok) {
        throw new Error('Falha ao enviar dados para Firebase')
      }
      
      localStorage.setItem('adega-last-sync', Date.now().toString())
      
      console.log('Dados enviados para Firebase:', cloudData.version)
      return cloudData
    } catch (error) {
      console.error('Erro ao enviar para Firebase:', error)
      throw error
    }
  }

  // Download do Firebase
  async downloadFromFirebase() {
    try {
      // Fazer requisição para Firebase
      const response = await fetch(`${this.baseUrl}/data.json`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Falha ao baixar dados do Firebase')
      }
      
      const cloudData = await response.json()
      
      if (!cloudData) {
        return null
      }
      
      console.log('Dados baixados do Firebase:', cloudData.version)
      return cloudData
    } catch (error) {
      console.error('Erro ao baixar do Firebase:', error)
      return null
    }
  }

  // Sincronizar dados
  async syncData() {
    try {
      const localData = this.getLocalData()
      const cloudData = await this.downloadFromFirebase()
      
      if (!cloudData) {
        // Primeira sincronização - enviar dados locais
        await this.uploadToFirebase(localData)
        return { status: 'uploaded', message: 'Dados enviados para nuvem' }
      }
      
      // Verificar qual versão é mais recente
      if (cloudData.lastModified > localData.lastModified) {
        // Dados da nuvem são mais recentes - baixar
        this.saveLocalData(cloudData)
        return { status: 'downloaded', message: 'Dados atualizados da nuvem' }
      } else if (localData.lastModified > cloudData.lastModified) {
        // Dados locais são mais recentes - enviar
        await this.uploadToFirebase(localData)
        return { status: 'uploaded', message: 'Dados enviados para nuvem' }
      } else {
        // Dados estão sincronizados
        return { status: 'synced', message: 'Dados já sincronizados' }
      }
    } catch (error) {
      console.error('Erro na sincronização:', error)
      return { status: 'error', message: 'Erro na sincronização: ' + error.message }
    }
  }

  // Salvar dados locais
  saveLocalData(data) {
    try {
      if (data.products) {
        localStorage.setItem('adega-di-vinno-products', JSON.stringify(data.products))
      }
      if (data.clientes) {
        localStorage.setItem('adega-di-vinno-clientes', JSON.stringify(data.clientes))
      }
      if (data.vendas) {
        localStorage.setItem('adega-di-vinno-vendas', JSON.stringify(data.vendas))
      }
      if (data.compras) {
        localStorage.setItem('adega-di-vinno-compras', JSON.stringify(data.compras))
      }
      
      localStorage.setItem('adega-last-sync', Date.now().toString())
      
      // Disparar evento para atualizar interface
      window.dispatchEvent(new CustomEvent('adega-data-synced', { detail: data }))
      
      console.log('Dados locais atualizados da nuvem')
    } catch (error) {
      console.error('Erro ao salvar dados locais:', error)
    }
  }

  // Iniciar sincronização automática
  startAutoSync() {
    // Sincronizar a cada 15 segundos
    this.syncInterval = setInterval(() => {
      this.syncData()
    }, 15000)
    
    // Sincronizar quando a página ganha foco
    window.addEventListener('focus', () => {
      this.syncData()
    })
    
    // Sincronizar quando online
    window.addEventListener('online', () => {
      this.isOnline = true
      this.syncData()
    })
    
    // Marcar como offline
    window.addEventListener('offline', () => {
      this.isOnline = false
    })
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
    const result = await this.syncData()
    return result
  }

  // Verificar status da sincronização
  getSyncStatus() {
    const lastSync = localStorage.getItem('adega-last-sync')
    
    return {
      lastSync: lastSync ? new Date(parseInt(lastSync)) : null,
      deviceId: this.deviceId,
      isOnline: navigator.onLine
    }
  }
}

// Instância global do serviço
const firebaseSync = new FirebaseSyncService()

export default firebaseSync
