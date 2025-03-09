// src/pages/ScanQR.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import QrReader from 'react-qr-scanner'
import { useSetRecoilState } from 'recoil'
import * as atoms from '../store/atoms'
import '../styles/scanner.css'

function ScanQR() {
    const [scanError, setScanError] = useState('')
    const [scanning, setScanning] = useState(true)
    const [scannedData, setScannedData] = useState(null)
    const navigate = useNavigate()
    const location = useLocation()

    // Get the state key from location state or use a fallback
    const returnTo = location.state?.returnTo || '/'
    const stateKey = location.state?.stateKey || 'fallbackState'

    // Get the setState function for the target state
    const setScannedValue = useSetRecoilState(atoms[stateKey] || atoms.fallbackState)

    useEffect(() => {
        // If scan already completed, set the value and navigate
        if (scannedData && !scanning) {
            setScannedValue(scannedData)
            
            // Use setTimeout to ensure state is updated before navigation
            const timer = setTimeout(() => {
                navigate(returnTo)
            }, 800)
            
            return () => clearTimeout(timer)
        }
    }, [scannedData, scanning, setScannedValue, navigate, returnTo])

    // Handle QR scan errors
    const handleScanError = (error) => {
        if (error) {
            console.error('QR Scan error:', error)
            setScanError(`Error scanning QR code: ${error.message || 'Unknown error'}`)
        }
    }

    // Handle successful QR scan
    const handleScanSuccess = (data) => {
        if (data && data.text && scanning) {
            setScanning(false) // Prevent multiple scans
            setScannedData(data.text)
        }
    }

    return (
        <div className="scanner-container">
            <div className="scanner-header">
                <h2>Scan QR Code</h2>
                <p>Position the QR code within the scanner area</p>
            </div>

            <div className="scanner-wrapper">
                {scanning ? (
                    <QrReader
                        delay={300}
                        onError={handleScanError}
                        onScan={handleScanSuccess}
                        style={{ width: '100%' }}
                        constraints={{
                            video: { facingMode: 'environment' }
                        }}
                    />
                ) : (
                    <div className="scan-success">
                        <div className="success-message">
                            <i className="bi bi-check-circle-fill"></i>
                            <p>QR Code Scanned Successfully!</p>
                        </div>
                    </div>
                )}
                <div className="scanner-overlay">
                    <div className="scanner-frame">
                        <div className="scanner-line"></div>
                    </div>
                </div>
            </div>

            {scanError && (
                <div className="scan-error">
                    <p>{scanError}</p>
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate(returnTo)}
                    >
                        Go Back
                    </button>
                </div>
            )}
            
            <div className="scanner-actions mt-4">
                <button 
                    className="btn btn-secondary"
                    onClick={() => navigate(returnTo)}
                >
                    Cancel Scanning
                </button>
            </div>
        </div>
    )
}

export default ScanQR