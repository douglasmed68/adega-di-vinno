import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import './styles/print.css';

// Contexto de Sincronização Local
import { LocalSyncProvider } from './services/localSyncService.jsx';

// Componentes
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Produtos from './components/Produtos';
import Estoque from './components/Estoque';
import Vendas from './components/Vendas';
import Compras from './components/Compras';
import Clientes from './components/Clientes';
import Fornecedores from './components/Fornecedores';
import Financeiro from './components/Financeiro';
import Relatorios from './components/Relatorios';
import Login from './components/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Verificar se há usuário logado no localStorage
    const savedUser = localStorage.getItem('adegaUser');
    const savedTheme = localStorage.getItem('adegaTheme');
    
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleLogin = (userData) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('adegaUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('adegaUser');
    // Opcional: limpar todos os dados da adega no logout para segurança
    // Object.keys(localStorage).forEach(key => {
    //   if (key.startsWith('adega_')) {
    //     localStorage.removeItem(key);
    //   }
    // });
  };

  const toggleTheme = () => {
    setDarkMode(prevMode => {
      const newMode = !prevMode;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('adegaTheme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('adegaTheme', 'light');
      }
      return newMode;
    });
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <LocalSyncProvider>
      <Router>
        <div className="flex h-screen bg-background text-foreground">
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="fixed lg:relative z-30 h-full"
              >
                <Sidebar 
                  onClose={() => setSidebarOpen(false)}
                  currentUser={currentUser}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 flex flex-col overflow-hidden">
            <Header 
              onMenuClick={() => setSidebarOpen(!sidebarOpen)}
              onLogout={handleLogout}
              currentUser={currentUser}
              darkMode={darkMode}
              onToggleTheme={toggleTheme}
            />
            
            <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 lg:p-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/produtos" element={<Produtos />} />
                  <Route path="/estoque" element={<Estoque />} />
                  <Route path="/vendas" element={<Vendas />} />
                  <Route path="/compras" element={<Compras />} />
                  <Route path="/clientes" element={<Clientes />} />
                  <Route path="/fornecedores" element={<Fornecedores />} />
                  <Route path="/financeiro" element={<Financeiro />} />
                  <Route path="/relatorios" element={<Relatorios />} />
                </Routes>
              </motion.div>
            </main>
          </div>

          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </div>
      </Router>
    </LocalSyncProvider>
  );
}

export default App;

