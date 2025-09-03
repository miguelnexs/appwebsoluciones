import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeAPIs } from './services/apiInitializer'

// Inicializar las APIs antes de renderizar la aplicación
initializeAPIs();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
