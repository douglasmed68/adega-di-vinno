import { StrictMode } from 'react'
console.log("Aplicação React/Vite iniciada com sucesso.");
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
