// src/components/common/QrScanner.jsx
import React, { useState, useEffect } from 'react';
import QrReader from 'react-qr-scanner';
import { Button, Spinner } from 'react-bootstrap';
import '../../styles/scanner.css';

/**
 * QR Code Scanner Component
 * 
 * @param {Object} props
 * @param {Function} props.onScan - Callback function when QR is successfully scanned
 * @param {Function} props.onError - Callback function for errors
 * @param {Function} props.onCancel - Callback function when scanning is canceled
 * @param {string} props.facingMode - Camera facing mode ('environment' or 'user')
 * @param {number} props.delay - Delay between scans in milliseconds
 */
function QrScanner({ 
    onScan, 
    onError, 
    onCancel,
    facingMode = 'environment',
    delay = 300
}) {
    const [scanning, setScanning] = useState(true);
    const [scannedData, setScannedData] = useState(null);
    const [scanError, setScanError] = useState('');
    const [cameraPermission, setCameraPermission] = useState('pending');
    const [deviceError, setDeviceError] = useState(false);
    const [currentFacingMode, setCurrentFacingMode] = useState(facingMode);

    // Check for camera permission when component mounts
    useEffect(() => {
        const checkCameraPermission = async () => {
            try {
                await navigator.mediaDevices.getUserMedia({ video: true });
                setCameraPermission('granted');
            } catch (error) {
                console.error('Camera permission error:', error);
                setCameraPermission('denied');
                setDeviceError(true);
                if (onError) {
                    onError(new Error('Camera permission denied or device not available'));
                }
            }
        };

        checkCameraPermission();

        // Cleanup function to stop camera streams when component unmounts
        return () => {
            // Get all video elements
            const videoElements = document.getElementsByTagName('video');
            for (let i = 0; i < videoElements.length; i++) {
                const video = videoElements[i];
                // Get the MediaStream from the video element
                const stream = video.srcObject;
                if (stream) {
                    // Stop all tracks
                    const tracks = stream.getTracks();
                    tracks.forEach(track => track.stop());
                    video.srcObject = null;
                }
            }
        };
    }, [onError]);

    // Handle QR scan errors
    const handleScanError = (error) => {
        if (error) {
            console.error('QR Scan error:', error);
            setScanError(`Error scanning QR code: ${error.message || 'Unknown error'}`);
            if (onError) {
                onError(error);
            }
        }
    };

    // Handle successful QR scan
    const handleScanSuccess = (data) => {
        if (data && data.text && scanning) {
            setScanning(false);
            setScannedData(data.text);
            
            // Send scanned data to parent component after a short delay
            setTimeout(() => {
                if (onScan) {
                    onScan(data.text);
                }
            }, 1000);
        }
    };

    // Handle cancel button click
    const handleCancel = () => {
        setScanning(false);
        if (onCancel) {
            onCancel();
        }
    };

    // Try again after error
    const handleTryAgain = () => {
        setDeviceError(false);
        setCameraPermission('pending');
        setScanError('');
        
        // Re-check camera permission
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(() => {
                setCameraPermission('granted');
            })
            .catch(error => {
                console.error('Camera retry error:', error);
                setCameraPermission('denied');
                setDeviceError(true);
                if (onError) {
                    onError(error);
                }
            });
    };

    // Switch camera (front/back)
    const switchCamera = () => {
        setScanning(true);
        setScanError('');
        setCurrentFacingMode(currentFacingMode === 'environment' ? 'user' : 'environment');
    };

    // Render based on permission and scanning state
    if (cameraPermission === 'pending') {
        return (
            <div className="scanner-loading">
                <Spinner animation="border" role="status" variant="primary" />
                <p>Requesting camera permission...</p>
            </div>
        );
    }

    if (deviceError || cameraPermission === 'denied') {
        return (
            <div className="scanner-error">
                <i className="bi bi-camera-video-off"></i>
                <h3>Camera Access Denied</h3>
                <p>Please allow camera access to scan QR codes.</p>
                <div className="scanner-actions">
                    <Button variant="primary" onClick={handleTryAgain}>
                        Try Again
                    </Button>
                    <Button variant="secondary" onClick={handleCancel} className="ms-2">
                        Cancel
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="scanner-container">
            <div className="scanner-wrapper">
                {scanning ? (
                    <QrReader
                        delay={delay}
                        onError={handleScanError}
                        onScan={handleScanSuccess}
                        style={{ width: '100%' }}
                        constraints={{
                            video: { facingMode: currentFacingMode }
                        }}
                    />
                ) : (
                    <div className="scan-success">
                        <div className="success-message">
                            <i className="bi bi-check-circle-fill"></i>
                            <p>QR Code Scanned Successfully!</p>
                            {scannedData && (
                                <p className="scanned-code">{scannedData}</p>
                            )}
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
                    <Button
                        variant="primary"
                        onClick={handleTryAgain}
                        size="sm"
                    >
                        Try Again
                    </Button>
                </div>
            )}
            
            <div className="scanner-actions mt-4">
                <Button 
                    variant="secondary"
                    onClick={handleCancel}
                    className="cancel-button"
                >
                    {scanning ? 'Cancel' : 'Close'}
                </Button>
                
                {scanning && (
                    <Button
                        variant="outline-primary"
                        onClick={switchCamera}
                        className="ms-2"
                    >
                        <i className="bi bi-camera"></i> Switch Camera
                    </Button>
                )}
            </div>

            <div className="scanner-tip mt-3">
                <p><i className="bi bi-info-circle"></i> Make sure the QR code is well-lit and centered in the frame</p>
            </div>
        </div>
    );
}

export default QrScanner;