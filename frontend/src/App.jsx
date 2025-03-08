// src/App.jsx
import { useState, useEffect } from 'react'
import AppRoutes from './AppRoutes'
import './styles/app.css'
import Toast from './components/common/Toast'
import ErrorBoundary from './components/common/ErrorBoundary'
import './styles/error-boundary.css'

function App() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // When we add blockchain integration, we'll initialize it here
    // For now, just set loaded to true after a brief delay to simulate loading
    const timer = setTimeout(() => {
      setLoaded(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="app-container">
      <ErrorBoundary>
        {loaded ? <AppRoutes /> : <div className="loading-container">Loading application...</div>}
      </ErrorBoundary>
      <Toast />
    </div>
  )
}

export default App