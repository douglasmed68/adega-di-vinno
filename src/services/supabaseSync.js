// Serviço de sincronização usando Supabase
import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = 'https://iqbxbhxvxjcxwcnvqnzj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxYnhiaHh2eGpjeHdjbnZxbnpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU1NTQ0NTgsImV4cCI6MjAzMTEzMDQ1OH0.aCiDJELgwREyaM9lrXBDzXkjjDT-dO5qiVr7fEyJUJY'
const supabase = createClient(supabaseUrl, supabaseKey)

class SupabaseSync {
  constructor() {
    this.syncInterval = null
    this.lastSync = localStorage.getItem('adega-last-sync') || 0
    this.isOnline = navigator.onLine
    this.deviceId = this.getDeviceId()
    this.syncListeners = []
    this.syncInProgress = false
  }

  // Inicializar sincronização
  async initialize() {
    try {
      // Configurar listeners para eventos de atualização
      this.setupEventListeners()
      
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

  // Configurar listeners para eventos de atualização
  setupEventListeners() {
    // Listener para produtos atualizados
    window.addEventListener('adega-products-updated', (event) => {
      if (event.detail?.products) {
        this.updateLastModified()
        this.syncData()
      }
    })
    
    // Listener para vendas atualizadas
    window.addEventListener('adega-vendas-updated', (event) => {
      if (event.detail?.vendas) {
        this.updateLastModified()
        this.syncData()
      }
    })
    
    // Listener para clientes atualizados
    window.addEventListener('adega-clientes-updated', (event) => {
      if (event.detail?.clientes) {
        this.updateLastModified()
        this.syncData()
      }
    })
    
    // Listener para compras atualizadas
    window.addEventListener('adega-compras-updated', (event) => {
      if (event.detail?.compras) {
        this.updateLastModified()
        this.syncData()
      }
    })
  }

  // Atualizar timestamp de última modificação
  updateLastModified() {
    const timestamp = Date.now()
    localStorage.setItem('adega-last-modified', timestamp.toString())
    
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
        lastModified: parseInt(localStorage.getItem('adega-last-modified') || Date.now()),
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
      
      localStorage.setItem('adega-last-sync', Date.now().toString())
      
      // Disparar evento para atualizar interface
      window.dispatchEvent(new CustomEvent('adega-data-synced', { detail: data }))
      
      console.log('Dados locais atualizados da nuvem')
    } catch (error) {
      console.error('Erro ao salvar dados locais:', error)
    }
  }

  // Enviar dados para o Supabase
  async uploadToSupabase(data) {
    try {
      this.notifySyncListeners({
        status: 'syncing',
        message: 'Enviando dados para a nuvem...'
      })
      
      const { error } = await supabase
        .from('adega_data')
        .upsert({ 
          id: 1, 
          data: data,
          updated_at: new Date().toISOString()
        })
      
      if (error) throw error
      
      localStorage.setItem('adega-last-sync', Date.now().toString())
      
      this.notifySyncListeners({
        status: 'synced',
        message: 'Dados enviados para a nuvem',
        timestamp: Date.now()
      })
      
      console.log('Dados enviados para Supabase')
      return true
    } catch (error) {
      console.error('Erro ao enviar para Supabase:', error)
      
      this.notifySyncListeners({
        status: 'error',
        message: 'Erro ao enviar dados: ' + error.message
      })
      
      return false
    }
  }

  // Baixar dados do Supabase
  async downloadFromSupabase() {
    try {
      this.notifySyncListeners({
        status: 'syncing',
        message: 'Baixando dados da nuvem...'
      })
      
      const { data, error } = await supabase
        .from('adega_data')
        .select('*')
        .eq('id', 1)
        .single()
      
      if (error) throw error
      
      if (!data) {
        return null
      }
      
      localStorage.setItem('adega-last-sync', Date.now().toString())
      
      this.notifySyncListeners({
        status: 'synced',
        message: 'Dados baixados da nuvem',
        timestamp: Date.now()
      })
      
      console.log('Dados baixados do Supabase')
      return data.data
    } catch (error) {
      console.error('Erro ao baixar do Supabase:', error)
      
      this.notifySyncListeners({
        status: 'error',
        message: 'Erro ao baixar dados: ' + error.message
      })
      
      return null
    }
  }

  // Sincronizar dados
  async syncData() {
    // Evitar sincronizações simultâneas
    if (this.syncInProgress) return
    
    this.syncInProgress = true
    
    try {
      // Verificar se está online
      if (!navigator.onLine) {
        this.notifySyncListeners({
          status: 'offline',
          message: 'Dispositivo está offline'
        })
        this.syncInProgress = false
        return
      }
      
      const localData = this.getLocalData()
      const cloudData = await this.downloadFromSupabase()
      
      if (!cloudData) {
        // Primeira sincronização - enviar dados locais
        await this.uploadToSupabase(localData)
        this.syncInProgress = false
        return { status: 'uploaded', message: 'Dados enviados para nuvem' }
      }
      
      // Verificar qual versão é mais recente
      if (cloudData.lastModified > localData.lastModified) {
        // Dados da nuvem são mais recentes - baixar
        this.saveLocalData(cloudData)
        this.syncInProgress = false
        return { status: 'downloaded', message: 'Dados atualizados da nuvem' }
      } else if (localData.lastModified > cloudData.lastModified) {
        // Dados locais são mais recentes - enviar
        await this.uploadToSupabase(localData)
        this.syncInProgress = false
        return { status: 'uploaded', message: 'Dados enviados para nuvem' }
      } else {
        // Dados estão sincronizados
        this.notifySyncListeners({
          status: 'synced',
          message: 'Dados já sincronizados',
          timestamp: Date.now()
        })
        this.syncInProgress = false
        return { status: 'synced', message: 'Dados já sincronizados' }
      }
    } catch (error) {
      console.error('Erro na sincronização:', error)
      
      this.notifySyncListeners({
        status: 'error',
        message: 'Erro na sincronização: ' + error.message
      })
      
      this.syncInProgress = false
      return { status: 'error', message: 'Erro na sincronização: ' + error.message }
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
      this.notifySyncListeners({
        status: 'offline',
        message: 'Dispositivo está offline'
      })
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
    return this.syncData()
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
const supabaseSync = new SupabaseSync()

export default supabaseSync
