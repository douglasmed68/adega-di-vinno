import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users,
  AlertTriangle,
  Eye,
  Calendar,
  BarChart3
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [dashboardData, setDashboardData] = useState({
    metrics: {
      totalSales: 45280.50,
      salesGrowth: 12.5,
      totalOrders: 156,
      ordersGrowth: 8.3,
      totalProducts: 89,
      lowStock: 12,
      totalCustomers: 234,
      customersGrowth: 15.2
    },
    salesData: [
      { name: 'Jan', vendas: 12000, meta: 15000 },
      { name: 'Fev', vendas: 19000, meta: 15000 },
      { name: 'Mar', vendas: 15000, meta: 15000 },
      { name: 'Abr', vendas: 22000, meta: 18000 },
      { name: 'Mai', vendas: 18000, meta: 18000 },
      { name: 'Jun', vendas: 25000, meta: 20000 },
    ],
    topProducts: [
      { name: 'Cabernet Sauvignon', value: 35, color: '#8B0000' },
      { name: 'Chardonnay', value: 25, color: '#DC143C' },
      { name: 'Malbec', value: 20, color: '#B22222' },
      { name: 'Espumante', value: 15, color: '#CD5C5C' },
      { name: 'Outros', value: 5, color: '#F08080' }
    ],
    recentSales: [
      { id: 1, customer: 'João Silva', product: 'Vinho Tinto Premium', amount: 450.00, time: '2 min atrás' },
      { id: 2, customer: 'Maria Santos', product: 'Espumante Brut', amount: 280.00, time: '15 min atrás' },
      { id: 3, customer: 'Pedro Costa', product: 'Chardonnay 2021', amount: 320.00, time: '1h atrás' },
      { id: 4, customer: 'Ana Oliveira', product: 'Malbec Reserva', amount: 520.00, time: '2h atrás' }
    ],
    lowStockProducts: [
      { name: 'Cabernet Sauvignon 2020', stock: 3, min: 10 },
      { name: 'Espumante Rosé', stock: 5, min: 15 },
      { name: 'Chardonnay Premium', stock: 2, min: 8 },
      { name: 'Malbec Reserva', stock: 7, min: 12 }
    ]
  })

  const MetricCard = ({ title, value, growth, icon: Icon, color, prefix = '', suffix = '' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {title}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {prefix}{typeof value === 'number' ? value.toLocaleString('pt-BR') : value}{suffix}
              </p>
              {growth !== undefined && (
                <div className="flex items-center mt-1">
                  {growth >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    growth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Math.abs(growth)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs mês anterior</span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-full ${color}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Visão geral do desempenho da Adega Di Vinno
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Button
            variant={selectedPeriod === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('7d')}
          >
            7 dias
          </Button>
          <Button
            variant={selectedPeriod === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('30d')}
          >
            30 dias
          </Button>
          <Button
            variant={selectedPeriod === '90d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('90d')}
          >
            90 dias
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Vendas Totais"
          value={dashboardData.metrics.totalSales}
          growth={dashboardData.metrics.salesGrowth}
          icon={DollarSign}
          color="bg-green-500"
          prefix="R$ "
        />
        <MetricCard
          title="Pedidos"
          value={dashboardData.metrics.totalOrders}
          growth={dashboardData.metrics.ordersGrowth}
          icon={ShoppingCart}
          color="bg-blue-500"
        />
        <MetricCard
          title="Produtos"
          value={dashboardData.metrics.totalProducts}
          icon={Package}
          color="bg-purple-500"
        />
        <MetricCard
          title="Clientes"
          value={dashboardData.metrics.totalCustomers}
          growth={dashboardData.metrics.customersGrowth}
          icon={Users}
          color="bg-orange-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Vendas vs Meta
              </CardTitle>
              <CardDescription>
                Comparativo de vendas realizadas com metas estabelecidas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData.salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
                  />
                  <Legend />
                  <Bar dataKey="vendas" fill="#8B0000" name="Vendas" />
                  <Bar dataKey="meta" fill="#DC143C" name="Meta" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Products Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Produtos Mais Vendidos</CardTitle>
              <CardDescription>
                Distribuição de vendas por categoria de produto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData.topProducts}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dashboardData.topProducts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Vendas Recentes</span>
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Todas
                </Button>
              </CardTitle>
              <CardDescription>
                Últimas transações realizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {sale.customer}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {sale.product}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        R$ {sale.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {sale.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Low Stock Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-orange-600">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Estoque Baixo
              </CardTitle>
              <CardDescription>
                Produtos que precisam de reposição
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.lowStockProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Mínimo: {product.min} unidades
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-orange-600">
                        {product.stock} restantes
                      </p>
                      <Button size="sm" variant="outline" className="mt-1">
                        Repor
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard
