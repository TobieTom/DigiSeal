// src/components/common/BlockchainStatus.jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import blockchainService from '../../services/BlockchainService';
import config from '../../config/blockchain';

function BlockchainStatus() {
    const [status, setStatus] = useState('Checking...');
    const [isConnected, setIsConnected] = useState(false);
    const [contractAddress, setContractAddress] = useState('');
    const [error, setError] = useState('');

    const checkConnection = async () => {
        try {
            setStatus('Initializing...');
            await blockchainService.init();

            setContractAddress(config.contractAddress);
            setIsConnected(true);
            setStatus('Connected');
            setError('');
        } catch (error) {
            console.error('Connection error:', error);
            setIsConnected(false);
            setStatus('Failed');
            setError(error.message);
        }
    };

    useEffect(() => {
        checkConnection();
    }, []);

    return (
        <Card className="mb-4">
            <Card.Header>Blockchain Connection Status</Card.Header>
            <Card.Body>
                <div className="mb-3">
                    <strong>Status:</strong>{' '}
                    <span className={isConnected ? 'text-success' : 'text-danger'}>
                        {status}
                    </span>
                </div>

                {contractAddress && (
                    <div className="mb-3">
                        <strong>Contract Address:</strong>{' '}
                        <a
                            href={`${config.explorerUrl}/address/${contractAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {contractAddress.substring(0, 6)}...{contractAddress.substring(38)}
                        </a>
                    </div>
                )}

                {error && (
                    <Alert variant="danger" className="mb-3">
                        {error}
                    </Alert>
                )}

                <Button variant="primary" onClick={checkConnection}>
                    Refresh Connection
                </Button>
            </Card.Body>
        </Card>
    );
}

export default BlockchainStatus;