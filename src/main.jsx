import React from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import SchoolSystem from '../school-system.jsx'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SchoolSystem />
  </React.StrictMode>
)
