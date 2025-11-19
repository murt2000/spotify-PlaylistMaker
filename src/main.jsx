import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

/* see this as an intermediary between App and index */

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
