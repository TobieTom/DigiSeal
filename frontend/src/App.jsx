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
    // Initialize the application
    const initializeApp = async () => {
      try {
        console.log('Initializing application...')
        
        // Simulate initialization process
        setTimeout(() => {
          console.log('Application initialized')
          setLoaded(true)
        }, 1000)
      } catch (error) {
        console.error('Error initializing application:', error)
        // Even on error, we should allow the app to load
        setLoaded(true)
      }
    }

    initializeApp()
  }, [])

  return (
    <div className="app-container">
      <ErrorBoundary>
        {loaded ? (
          <AppRoutes />
        ) : (
          <div className="loading-container">
            <div className="loading-content">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading application...</p>
            </div>
          </div>
        )}
      </ErrorBoundary>
      <Toast />
    </div>
  )
}

export default App