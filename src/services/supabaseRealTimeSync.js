// Serviço de sincronização em tempo real usando Supabase
import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = 'https://iqbxbhxvxjcxwcnvqnzj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxYnhiaHh2eGpjeHdjbnZxbnpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU1NTQ0NTgsImV4cCI6MjAzMTEzMDQ1OH0.aCiDJELgwREyaM9lrXBDzXkjjDT-dO5qiVr7fEyJUJY'

class SupabaseRealTimeSync {
  constructor() {
    this.supabase = createClient(supabaseUrl, supabaseKey)
    this.deviceId = this.getDeviceId()
    this.syncListeners = []
    this.isInitialized = false
    this.subscriptions = []
    this.offlineQueue = []
    this.lastSyncTimestamp = this.getLastSyncTimestamp()
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

  // Obter timestamp da última sincronização
  getLastSyncTimestamp() {
    const timestamp = localStorage.getItem('adega-last-sync-timestamp')
    return timestamp ? new Date(timestamp) : new Date(0)
  }

  // Atualizar timestamp da última sincronização
  updateLastSyncTimestamp() {
    const timestamp = new Date().toISOString()
    localStorage.setItem('adega-last-sync-timestamp', timestamp)
    this.lastSyncTimestamp = new Date(timestamp)
  }

  // Inicializar o serviço de sincronização
  async initialize() {
    try {
      this.notifyListeners({
        status: 'initializing',
        message: 'Inicializando sincronização...'
      })

      // Configurar estrutura das tabelas se necessário
      await this.ensureTablesExist()

      // Sincronizar dados existentes
      await this.performInitialSync()

      // Configurar listeners em tempo real
      this.setupRealtimeListeners()

      // Configurar listeners para eventos offline/online
      this.setupNetworkListeners()

      this.isInitialized = true

      this.notifyListeners({
        status: 'initialized',
        message: 'Sincronização inicializada com sucesso'
      })

      return true
    } catch (error) {
      console.error('Erro ao inicializar sincronização:', error)
      this.notifyListeners({
        status: 'error',
        message: 'Erro ao inicializar: ' + error.message
      })
      return false
    }
  }

  // Garantir que as tabelas existam
  async ensureTablesExist() {
    try {
      // Verificar se as tabelas existem
      const { data: tables, error } = await this.supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .in('table_name', ['adega_products', 'adega_clientes', 'adega_vendas', 'adega_compras'])

      if (error) {
        console.log('Tabelas não existem, usando estrutura de dados simples')
        return
      }

      console.log('Tabelas encontradas:', tables)
    } catch (error) {
      console.log('Usando estrutura de dados simples:', error.message)
    }
  }

  // Realizar sincronização inicial
  async performInitialSync() {
    try {
      this.notifyListeners({
        status: 'syncing',
        message: 'Sincronizando dados iniciais...'
      })

      // Obter dados locais
      const localData = this.getLocalData()

      // Tentar obter dados da nuvem
      const { data: cloudData, error } = await this.supabase
        .from('adega_sync_data')
        .select('*')
        .eq('id', 1)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (!cloudData) {
        // Primeira sincronização - enviar dados locais
        await this.uploadData(localData)
        this.updateLastSyncTimestamp()
        
        this.notifyListeners({
          status: 'synced',
          message: 'Dados iniciais enviados para a nuvem'
        })
      } else {
        // Verificar qual versão é mais recente
        const cloudTimestamp = new Date(cloudData.last_modified)
        const localTimestamp = new Date(localData.lastModified || 0)

        if (cloudTimestamp > localTimestamp) {
          // Dados da nuvem são mais recentes
          this.saveLocalData(cloudData.data)
          this.updateLastSyncTimestamp()
          
          this.notifyListeners({
            status: 'synced',
            message: 'Dados atualizados da nuvem'
          })
        } else if (localTimestamp > cloudTimestamp) {
          // Dados locais são mais recentes
          await this.uploadData(localData)
          this.updateLastSyncTimestamp()
          
          this.notifyListeners({
            status: 'synced',
            message: 'Dados locais enviados para a nuvem'
          })
        } else {
          this.notifyListeners({
            status: 'synced',
            message: 'Dados já sincronizados'
          })
        }
      }

      // Processar fila offline se houver
      await this.processOfflineQueue()

    } catch (error) {
      console.error('Erro na sincronização inicial:', error)
      this.notifyListeners({
        status: 'error',
        message: 'Erro na sincronização: ' + error.message
      })
    }
  }

  // Configurar listeners em tempo real
  setupRealtimeListeners() {
    // Listener para mudanças na tabela de dados
    const subscription = this.supabase
      .channel('adega_sync_data_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'adega_sync_data'
      }, (payload) => {
        this.handleRealtimeChange(payload)
      })
      .subscribe()

    this.subscriptions.push(subscription)
  }

  // Lidar com mudanças em tempo real
  handleRealtimeChange(payload) {
    try {
      console.log('Mudança em tempo real recebida:', payload)

      if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
        const newData = payload.new
        
        // Verificar se a mudança não veio deste dispositivo
        if (newData.device_id !== this.deviceId) {
          // Atualizar dados locais
          this.saveLocalData(newData.data)
          
          this.notifyListeners({
            status: 'synced',
            message: 'Dados atualizados em tempo real',
            source: 'realtime'
          })

          // Disparar evento para atualizar a interface
          window.dispatchEvent(new CustomEvent('adega-realtime-update', {
            detail: newData.data
          }))
        }
      }
    } catch (error) {
      console.error('Erro ao processar mudança em tempo real:', error)
    }
  }

  // Configurar listeners de rede
  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.notifyListeners({
        status: 'online',
        message: 'Conexão restaurada'
      })
      
      // Processar fila offline
      this.processOfflineQueue()
    })

    window.addEventListener('offline', () => {
      this.notifyListeners({
        status: 'offline',
        message: 'Dispositivo offline'
      })
    })
  }

  // Obter dados locais
  getLocalData() {
    try {
      const products = JSON.parse(localStorage.getItem('adega-di-vinno-products') || '[]')
      const clientes = JSON.parse(localStorage.getItem('adega-di-vinno-clientes') || '[]')
      const vendas = JSON.parse(localStorage.getItem('adega-di-vinno-vendas') || '[]')
      const compras = JSON.parse(localStorage.getItem('adega-di-vinno-compras') || '[]')
      const lastModified = localStorage.getItem('adega-last-modified') || Date.now()

      return {
        products,
        clientes,
        vendas,
        compras,
        lastModified: parseInt(lastModified),
        deviceId: this.deviceId
      }
    } catch (error) {
      console.error('Erro ao obter dados locais:', error)
      return {
        products: [],
        clientes: [],
        vendas: [],
        compras: [],
        lastModified: Date.now(),
        deviceId: this.deviceId
      }
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

      // Atualizar timestamp local
      localStorage.setItem('adega-last-modified', Date.now().toString())

      // Disparar evento para atualizar interface
      window.dispatchEvent(new CustomEvent('adega-data-updated', { detail: data }))

    } catch (error) {
      console.error('Erro ao salvar dados locais:', error)
    }
  }

  // Enviar dados para a nuvem
  async uploadData(data) {
    try {
      const payload = {
        id: 1,
        data: data,
        last_modified: new Date().toISOString(),
        device_id: this.deviceId,
        version: Date.now()
      }

      const { error } = await this.supabase
        .from('adega_sync_data')
        .upsert(payload)

      if (error) throw error

      console.log('Dados enviados para a nuvem')
      return true
    } catch (error) {
      console.error('Erro ao enviar dados:', error)
      
      // Adicionar à fila offline se não estiver online
      if (!navigator.onLine) {
        this.addToOfflineQueue('upload', data)
      }
      
      throw error
    }
  }

  // Adicionar operação à fila offline
  addToOfflineQueue(operation, data) {
    this.offlineQueue.push({
      operation,
      data,
      timestamp: Date.now()
    })
    
    // Limitar tamanho da fila
    if (this.offlineQueue.length > 100) {
      this.offlineQueue = this.offlineQueue.slice(-50)
    }
  }

  // Processar fila offline
  async processOfflineQueue() {
    if (!navigator.onLine || this.offlineQueue.length === 0) {
      return
    }

    this.notifyListeners({
      status: 'syncing',
      message: `Processando ${this.offlineQueue.length} operações offline...`
    })

    const queue = [...this.offlineQueue]
    this.offlineQueue = []

    for (const item of queue) {
      try {
        if (item.operation === 'upload') {
          await this.uploadData(item.data)
        }
      } catch (error) {
        console.error('Erro ao processar item da fila offline:', error)
        // Readicionar à fila em caso de erro
        this.offlineQueue.push(item)
      }
    }

    if (this.offlineQueue.length === 0) {
      this.notifyListeners({
        status: 'synced',
        message: 'Fila offline processada com sucesso'
      })
    }
  }

  // Sincronizar dados manualmente
  async syncNow() {
    try {
      this.notifyListeners({
        status: 'syncing',
        message: 'Sincronizando dados...'
      })

      const localData = this.getLocalData()
      await this.uploadData(localData)
      this.updateLastSyncTimestamp()

      this.notifyListeners({
        status: 'synced',
        message: 'Sincronização manual concluída'
      })

      return true
    } catch (error) {
      this.notifyListeners({
        status: 'error',
        message: 'Erro na sincronização: ' + error.message
      })
      return false
    }
  }

  // Adicionar listener para eventos de sincronização
  addSyncListener(listener) {
    this.syncListeners.push(listener)
  }

  // Remover listener
  removeSyncListener(listener) {
    this.syncListeners = this.syncListeners.filter(l => l !== listener)
  }

  // Notificar listeners
  notifyListeners(data) {
    this.syncListeners.forEach(listener => {
      try {
        listener({
          ...data,
          timestamp: new Date(),
          deviceId: this.deviceId
        })
      } catch (error) {
        console.error('Erro ao notificar listener:', error)
      }
    })
  }

  // Obter status da sincronização
  getSyncStatus() {
    return {
      isInitialized: this.isInitialized,
      isOnline: navigator.onLine,
      lastSync: this.lastSyncTimestamp,
      deviceId: this.deviceId,
      offlineQueueSize: this.offlineQueue.length
    }
  }

  // Limpar dados e reinicializar
  async reset() {
    try {
      // Cancelar subscriptions
      this.subscriptions.forEach(sub => {
        this.supabase.removeChannel(sub)
      })
      this.subscriptions = []

      // Limpar dados locais
      localStorage.removeItem('adega-last-sync-timestamp')
      localStorage.removeItem('adega-last-modified')
      
      // Reinicializar
      this.isInitialized = false
      this.offlineQueue = []
      this.lastSyncTimestamp = new Date(0)

      await this.initialize()
      
      return true
    } catch (error) {
      console.error('Erro ao resetar sincronização:', error)
      return false
    }
  }

  // Destruir o serviço
  destroy() {
    // Cancelar todas as subscriptions
    this.subscriptions.forEach(sub => {
      this.supabase.removeChannel(sub)
    })
    
    this.subscriptions = []
    this.syncListeners = []
    this.isInitialized = false
  }
}

// Instância global do serviço
const supabaseRealTimeSync = new SupabaseRealTimeSync()

export default supabaseRealTimeSync
