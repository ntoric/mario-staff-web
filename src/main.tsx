import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { PwaRoot } from './components/PwaRoot'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PwaRoot>
      <App />
    </PwaRoot>
  </React.StrictMode>,
)
