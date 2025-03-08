import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { RecoilRoot } from 'recoil'
import App from './App.jsx'
import Loader from './components/common/Loader'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/bootstrap-fixes.css'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Suspense fallback={<Loader />}>
      <RecoilRoot>
        <App />
      </RecoilRoot>
    </Suspense>
  </React.StrictMode>,
)