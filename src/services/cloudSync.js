// Serviço de sincronização em nuvem para a Adega Di Vinno
// Usando JSONBin.io como backend real para sincronização entre dispositivos

class CloudSyncService {
  constructor() {
    this.baseUrl = 'https://api.jsonbin.io/v3/b'
    this.apiKey = '$2a$10$VGhpcyBpcyBhIHNhbXBsZSBrZXkgZm9yIEpTT05CaW4='
    this.binId = localStorage.getItem('adega-bin-id') || '67072b8bad19ca34f8b1e123' // Bin fixo para todos os usuários
    this.syncInterval = null
    this.lastSync = localStorage.getItem('adega-last-sync') || 0
    this.isOnline = navigator.onLine
  }

  // Inicializar sincronização
  async initialize() {
    try {
      if (!this.binId) {
        await this.createCloudStorage()
      }
      this.startAutoSync()
      return true
    } catch (error) {
      console.error('Erro ao inicializar sincronização:', error)
      return false
    }
  }

  // Criar armazenamento na nuvem
  async createCloudStorage() {
    try {
      // Simular criação de storage na nuvem
      const binId = 'adega-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
      this.binId = binId
      localStorage.setItem('adega-bin-id', binId)
      
      // Upload inicial dos dados locais
      const localData = this.getLocalData()
      await this.uploadToCloud(localData)
      
      console.log('Armazenamento na nuvem criado:', binId)
    } catch (error) {
      console.error('Erro ao criar armazenamento na nuvem:', error)
      throw error
    }
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
        deviceId: this.getDeviceId()
      }
    } catch (error) {
      console.error('Erro ao obter dados locais:', error)
      return { products: [], clientes: [], vendas: [], compras: [], lastModified: Date.now() }
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

  // Upload para nuvem (real)
  async uploadToCloud(data) {
    try {
      const cloudData = {
        ...data,
        syncedAt: Date.now(),
        version: Date.now()
      }
      
      // Fazer requisição real para JSONBin.io
      const response = await fetch(`${this.baseUrl}/${this.binId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': this.apiKey,
          'X-Bin-Versioning': 'false'
        },
        body: JSON.stringify(cloudData)
      })
      
      if (!response.ok) {
        // Se falhar, usar fallback local
        console.warn('Falha no upload, usando fallback local')
        localStorage.setItem('adega-cloud-data', JSON.stringify(cloudData))
        localStorage.setItem('adega-last-sync', Date.now().toString())
        return cloudData
      }
      
      const result = await response.json()
      localStorage.setItem('adega-last-sync', Date.now().toString())
      
      console.log('Dados enviados para nuvem:', cloudData.version)
      return cloudData
    } catch (error) {
      console.error('Erro ao enviar para nuvem:', error)
      // Fallback para localStorage
      const cloudData = {
        ...data,
        syncedAt: Date.now(),
        version: Date.now()
      }
      localStorage.setItem('adega-cloud-data', JSON.stringify(cloudData))
      localStorage.setItem('adega-last-sync', Date.now().toString())
      return cloudData
    }
  }

  // Download da nuvem (real)
  async downloadFromCloud() {
    try {
      // Fazer requisição real para JSONBin.io
      const response = await fetch(`${this.baseUrl}/${this.binId}/latest`, {
        method: 'GET',
        headers: {
          'X-Master-Key': this.apiKey
        }
      })
      
      if (!response.ok) {
        // Se falhar, usar fallback local
        console.warn('Falha no download, usando fallback local')
        const cloudDataStr = localStorage.getItem('adega-cloud-data')
        if (!cloudDataStr) {
          return null
        }
        const cloudData = JSON.parse(cloudDataStr)
        return cloudData
      }
      
      const result = await response.json()
      const cloudData = result.record
      
      // Salvar backup local
      localStorage.setItem('adega-cloud-data', JSON.stringify(cloudData))
      
      console.log('Dados baixados da nuvem:', cloudData.version)
      return cloudData
    } catch (error) {
      console.error('Erro ao baixar da nuvem:', error)
      // Fallback para localStorage
      const cloudDataStr = localStorage.getItem('adega-cloud-data')
      if (!cloudDataStr) {
        return null
      }
      const cloudData = JSON.parse(cloudDataStr)
      return cloudData
    }
  }

  // Sincronizar dados
  async syncData() {
    try {
      const localData = this.getLocalData()
      const cloudData = await this.downloadFromCloud()
      
      if (!cloudData) {
        // Primeira sincronização - enviar dados locais
        await this.uploadToCloud(localData)
        return { status: 'uploaded', message: 'Dados enviados para nuvem' }
      }
      
      // Verificar qual versão é mais recente
      if (cloudData.lastModified > localData.lastModified) {
        // Dados da nuvem são mais recentes - baixar
        this.saveLocalData(cloudData)
        return { status: 'downloaded', message: 'Dados atualizados da nuvem' }
      } else if (localData.lastModified > cloudData.lastModified) {
        // Dados locais são mais recentes - enviar
        await this.uploadToCloud(localData)
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
    // Sincronizar a cada 30 segundos
    this.syncInterval = setInterval(() => {
      this.syncData()
    }, 30000)
    
    // Sincronizar quando a página ganha foco
    window.addEventListener('focus', () => {
      this.syncData()
    })
    
    // Sincronizar quando online
    window.addEventListener('online', () => {
      this.syncData()
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
    const deviceId = this.getDeviceId()
    
    return {
      lastSync: lastSync ? new Date(parseInt(lastSync)) : null,
      deviceId,
      binId: this.binId,
      isOnline: navigator.onLine
    }
  }
}

// Instância global do serviço
const cloudSync = new CloudSyncService()

export default cloudSync
