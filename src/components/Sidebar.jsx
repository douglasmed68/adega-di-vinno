import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Package, 
  Warehouse, 
  ShoppingCart, 
  ShoppingBag, 
  Users, 
  Building2, 
  DollarSign, 
  BarChart3,
  X,
  ChevronDown,
  Wine
} from 'lucide-react'
import logoAdega from '../assets/logo-adega.png'

const Sidebar = ({ onClose, currentUser }) => {
  const location = useLocation()
  const [expandedMenus, setExpandedMenus] = useState({})

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      color: 'text-blue-500'
    },
    {
      title: 'Produtos',
      icon: Package,
      path: '/produtos',
      color: 'text-green-500'
    },
    {
      title: 'Estoque',
      icon: Warehouse,
      path: '/estoque',
      color: 'text-orange-500'
    },
    {
      title: 'Vendas',
      icon: ShoppingCart,
      path: '/vendas',
      color: 'text-purple-500'
    },
    {
      title: 'Compras',
      icon: ShoppingBag,
      path: '/compras',
      color: 'text-indigo-500'
    },
    {
      title: 'Clientes',
      icon: Users,
      path: '/clientes',
      color: 'text-pink-500'
    },
    {
      title: 'Fornecedores',
      icon: Building2,
      path: '/fornecedores',
      color: 'text-cyan-500'
    },
    {
      title: 'Financeiro',
      icon: DollarSign,
      path: '/financeiro',
      color: 'text-emerald-500'
    },
    {
      title: 'Relatórios',
      icon: BarChart3,
      path: '/relatorios',
      color: 'text-red-500'
    }
  ]

  const toggleMenu = (menuTitle) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuTitle]: !prev[menuTitle]
    }))
  }

  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-xl h-full flex flex-col border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src={logoAdega} 
              alt="Adega Di Vinno" 
              className="h-10 w-auto object-contain"
            />
            <div className="hidden sm:block">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                Di Vinno
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Sistema de Gestão
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
            <Wine className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
              {currentUser?.name || 'Usuário'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {currentUser?.role === 'admin' ? 'Administrador' : 'Vendedor'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon

            return (
              <motion.div
                key={item.title}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  to={item.path}
                  onClick={() => window.innerWidth < 1024 && onClose()}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-r-2 border-red-600' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                >
                  <Icon 
                    className={`
                      mr-3 h-5 w-5 transition-colors duration-200
                      ${isActive ? item.color : 'text-gray-400 group-hover:text-gray-500'}
                    `} 
                  />
                  <span className="truncate">{item.title}</span>
                  
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-2 h-2 bg-red-600 rounded-full"
                      initial={false}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </Link>
              </motion.div>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Adega Di Vinno © 2024
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Sistema de Gestão v2.0
          </p>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
