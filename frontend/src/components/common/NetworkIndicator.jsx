// src/components/common/NetworkIndicator.jsx
import React, { useState, useEffect } from 'react';
import { Badge } from 'react-bootstrap';
import blockchainService from '../../services/BlockchainService';
import config from '../../config/blockchain';

function NetworkIndicator() {
    const [network, setNetwork] = useState(null);
    const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

    useEffect(() => {
        const checkNetwork = async () => {
            try {
                if (window.ethereum) {
                    // Get current chain ID
                    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                    const networkId = parseInt(chainId, 16);

                    // Listen for chain changes
                    window.ethereum.on('chainChanged', () => window.location.reload());

                    // Set network info
                    if (networkId === config.networkId) {
                        setNetwork(config.chainName);
                        setIsCorrectNetwork(true);
                    } else if (networkId === 1337 || networkId === 5777) {
                        setNetwork('Local Network');
                        setIsCorrectNetwork(false);
                    } else if (networkId === 1) {
                        setNetwork('Ethereum Mainnet');
                        setIsCorrectNetwork(false);
                    } else {
                        setNetwork(`Network ID: ${networkId}`);
                        setIsCorrectNetwork(false);
                    }
                }
            } catch (error) {
                console.error('Error checking network:', error);
                setNetwork('Unknown');
                setIsCorrectNetwork(false);
            }
        };

        checkNetwork();
    }, []);

    return (
        <div className="network-indicator">
            <Badge bg={isCorrectNetwork ? 'success' : 'warning'}>
                {network || 'Checking...'}
            </Badge>
        </div>
    );
}

export default NetworkIndicator;