import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Particles stay bright behind the hero, then fade as you scroll into the reading part of the page
const dim = () => document.documentElement.style.setProperty("--dim", Math.min(window.scrollY / 700, 1).toFixed(3));
window.addEventListener("scroll", dim, { passive: true });
dim();
