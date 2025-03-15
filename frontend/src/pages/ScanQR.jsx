// src/pages/ScanQR.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import * as atoms from '../store/atoms';
import { Button } from 'react-bootstrap';
import QrScanner from '../components/common/QrScanner';
import '../styles/scanner.css';

function ScanQR() {
    const [scanError, setScanError] = useState('');
    const [navigating, setNavigating] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Get the state key from location state or use a fallback
    const returnTo = location.state?.returnTo || '/';
    const stateKey = location.state?.stateKey || 'fallbackState';

    // Get the setState function for the target state
    const setScannedValue = useSetRecoilState(atoms[stateKey] || atoms.fallbackState);

    /**
     * Handle successful QR scan
     * @param {string} data - Scanned QR code data
     */
    const handleScanSuccess = (data) => {
        if (data && !navigating) {
            console.log("QR code scanned successfully:", data);
            setScannedValue(data);
            setNavigating(true);
            
            // Use setTimeout to ensure state is updated before navigation
            setTimeout(() => {
                console.log("Navigating to:", returnTo);
                navigate(returnTo);
            }, 1200);
        }
    };

    /**
     * Handle QR scan errors
     * @param {Error} error - Scan error
     */
    const handleScanError = (error) => {
        if (error) {
            console.error('QR Scan error:', error);
            setScanError(`Error scanning QR code: ${error.message || 'Unknown error'}`);
        }
    };

    /**
     * Handle cancel button click
     */
    const handleCancel = () => {
        navigate(returnTo);
    };

    return (
        <div className="scan-page">
            <div className="scanner-header">
                <h2>Scan QR Code</h2>
                <p>Position the QR code within the scanner area</p>
            </div>

            <QrScanner
                onScan={handleScanSuccess}
                onError={handleScanError}
                onCancel={handleCancel}
                facingMode="environment"
                delay={300}
            />

            {scanError && (
                <div className="scan-error mt-3">
                    <p>{scanError}</p>
                    <Button
                        variant="secondary"
                        onClick={() => navigate(returnTo)}
                    >
                        Go Back
                    </Button>
                </div>
            )}
        </div>
    );
}

export default ScanQR;