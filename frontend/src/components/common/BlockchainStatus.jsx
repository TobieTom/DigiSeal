// src/components/common/BlockchainStatus.jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Badge, Row, Col } from 'react-bootstrap';
import blockchainService from '../../services/BlockchainService';
import config from '../../config/blockchain';

/**
 * Component that displays the current blockchain connection status
 */
function BlockchainStatus() {
    const [status, setStatus] = useState('Initializing...');
    const [isConnected, setIsConnected] = useState(false);
    const [contractAddress, setContractAddress] = useState('');
    const [network, setNetwork] = useState('');
    const [error, setError] = useState('');
    const [checking, setChecking] = useState(false);
    const [networkId, setNetworkId] = useState(null);

    const checkConnection = async () => {
        try {
            setStatus('Initializing...');
            setChecking(true);
            setError('');
            
            await blockchainService.init();
            
            // Check network connection
            if (window.ethereum) {
                const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                const currentNetworkId = parseInt(chainId, 16);
                setNetworkId(currentNetworkId);
                
                if (currentNetworkId === config.networkId) {
                    setNetwork(config.chainName);
                } else if (currentNetworkId === 1) {
                    setNetwork('Ethereum Mainnet');
                } else if (currentNetworkId === 5) {
                    setNetwork('Goerli Testnet');
                } else if (currentNetworkId === 11155111) {
                    setNetwork('Sepolia Testnet');
                } else if (currentNetworkId === 1337 || currentNetworkId === 5777) {
                    setNetwork('Local Network');
                } else {
                    setNetwork(`Network ID: ${currentNetworkId}`);
                }
            }

            setContractAddress(config.contractAddress);
            setIsConnected(true);
            setStatus('Connected');
            setChecking(false);
        } catch (error) {
            console.error('Connection error:', error);
            setIsConnected(false);
            setStatus('Failed');
            setError(error.message);
            setChecking(false);
        }
    };

    const handleNetworkSwitch = async () => {
        if (!window.ethereum) {
            setError('No Ethereum wallet detected');
            return;
        }
        
        try {
            setChecking(true);
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x' + config.networkId.toString(16) }],
            });
            
            // Re-check connection after switching
            setTimeout(() => {
                checkConnection();
            }, 1000);
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0x' + config.networkId.toString(16),
                            chainName: config.chainName,
                            rpcUrls: [config.rpcUrl],
                            blockExplorerUrls: [config.explorerUrl]
                        }],
                    });
                    
                    // Re-check connection after adding
                    setTimeout(() => {
                        checkConnection();
                    }, 1000);
                } catch (addError) {
                    setError('Failed to add network: ' + addError.message);
                    setChecking(false);
                }
            } else {
                setError('Failed to switch network: ' + switchError.message);
                setChecking(false);
            }
        }
    };

    useEffect(() => {
        checkConnection();
        
        // Add event listener for chain changes
        if (window.ethereum) {
            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
            
            window.ethereum.on('accountsChanged', () => {
                checkConnection();
            });
        }
        
        return () => {
            // Clean up event listeners
            if (window.ethereum) {
                window.ethereum.removeListener('chainChanged', () => {});
                window.ethereum.removeListener('accountsChanged', () => {});
            }
        };
    }, []);

    return (
        <Card className="blockchain-status-card">
            <Card.Header>Blockchain Connection Status</Card.Header>
            <Card.Body>
                <Row>
                    <Col md={8}>
                        <div className="status-item mb-3">
                            <div className="status-label">Connection Status:</div>
                            <div className="status-value">
                                <div className="connection-status">
                                    <div className={`status-dot ${isConnected ? 'connected' : 'failed'}`}></div>
                                    <span className={isConnected ? 'text-success' : 'text-danger'}>
                                        {status}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="status-item mb-3">
                            <div className="status-label">Current Network:</div>
                            <div className="status-value">
                                <Badge 
                                    bg={networkId === config.networkId ? 'success' : 'warning'}
                                    className="network-badge"
                                >
                                    {network || 'Unknown'}
                                </Badge>
                                
                                {networkId !== config.networkId && (
                                    <Button 
                                        variant="outline-primary" 
                                        size="sm" 
                                        className="ms-2"
                                        onClick={handleNetworkSwitch}
                                        disabled={checking}
                                    >
                                        Switch to {config.chainName}
                                    </Button>
                                )}
                            </div>
                        </div>
                        
                        {contractAddress && (
                            <div className="status-item mb-3">
                                <div className="status-label">Contract Address:</div>
                                <div className="status-value">
                                    <div className="contract-address">
                                        <a
                                            href={`${config.explorerUrl}/address/${contractAddress}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {contractAddress}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <Alert variant="danger" className="mt-3 mb-3">
                                {error}
                            </Alert>
                        )}
                    </Col>
                    
                    <Col md={4} className="text-center d-flex flex-column justify-content-center">
                        <div className="blockchain-info-graphic mb-3">
                            {isConnected ? (
                                <i className="bi bi-hdd-network-fill text-success blockchain-icon"></i>
                            ) : (
                                <i className="bi bi-hdd-network text-danger blockchain-icon"></i>
                            )}
                        </div>
                        
                        <Button 
                            variant={isConnected ? "outline-primary" : "primary"} 
                            onClick={checkConnection}
                            disabled={checking}
                            className="refresh-button"
                        >
                            {checking ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Checking...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-arrow-repeat me-2"></i>
                                    Refresh Connection
                                </>
                            )}
                        </Button>
                    </Col>
                </Row>
                
                <div className="blockchain-info mt-3 pt-3 border-top">
                    <h6>What is this?</h6>
                    <p className="small text-muted mb-0">
                        DigiSeal uses blockchain technology to securely verify product authenticity. 
                        This panel shows your connection status to the Ethereum blockchain where 
                        product information is stored. A successful connection ensures you can verify 
                        products and view their complete history.
                    </p>
                </div>
            </Card.Body>
        </Card>
    );
}

export default BlockchainStatus;