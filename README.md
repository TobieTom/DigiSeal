# DigiSeal - Fake Product Identification System Using Blockchain

![DigiSeal Logo](https://img.shields.io/badge/DigiSeal-Blockchain--Based-blue?style=for-the-badge&logo=ethereum)

A comprehensive blockchain-based solution for identifying and preventing counterfeit products using smart contracts, QR codes, and decentralized verification systems.

## 🚀 Overview

DigiSeal is an innovative anti-counterfeiting system that leverages blockchain technology to ensure product authenticity throughout the entire supply chain. By combining the immutable nature of blockchain with smart contracts and QR code verification, DigiSeal provides manufacturers, retailers, and consumers with a reliable method to verify product authenticity and track ownership history.

### Key Features

- **🔐 Blockchain-Based Verification**: Immutable product records on the blockchain
- **📱 QR Code Integration**: Easy scanning for instant product verification
- **👥 Multi-Role Access Control**: Different permissions for manufacturers, retailers, consumers, and administrators
- **📊 Supply Chain Tracking**: Complete chain of custody from manufacturing to end consumer
- **⚡ Smart Contract Automation**: Automated verification rules and processes
- **🔍 Counterfeit Reporting**: Built-in system for reporting suspected fake products
- **📈 Analytics Dashboard**: Real-time insights into product authenticity trends

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Blockchain    │
│   (React/Web)   │◄──►│   (Node.js)     │◄──►│   (Ethereum)    │
│                 │    │                 │    │                 │
│ • User Interface│    │ • API Gateway   │    │ • Smart         │
│ • QR Scanner    │    │ • Authentication│    │   Contracts     │
│ • Dashboard     │    │ • Database      │    │ • Product       │
│                 │    │                 │    │   Records       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                │
                    ┌─────────────────┐
                    │   Database      │
                    │   (PostgreSQL)  │
                    │                 │
                    │ • User Data     │
                    │ • Reports       │
                    │ • Logs          │
                    └─────────────────┘
```

## 🛠️ Technology Stack

### Frontend
- **React.js**: User interface framework
- **Web3.js/Ethers.js**: Blockchain interaction
- **QR Code Scanner**: Camera-based QR code reading
- **Bootstrap/Material-UI**: UI components

### Backend
- **Node.js**: Server runtime
- **Express.js**: Web framework
- **PostgreSQL**: Database for off-chain data
- **JWT**: Authentication tokens
- **Multer**: File upload handling

### Blockchain
- **Ethereum**: Primary blockchain network
- **Solidity**: Smart contract development
- **Truffle/Hardhat**: Development framework
- **Ganache**: Local blockchain for testing
- **MetaMask**: Wallet integration

### Development Tools
- **Git**: Version control
- **Docker**: Containerization
- **Jest**: Testing framework
- **ESLint**: Code linting

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:
- Node.js (v14.0 or higher)
- npm or yarn
- Git
- MetaMask browser extension
- Ganache CLI or Ganache GUI

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TobieTom/DigiSeal.git
   cd DigiSeal
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install

   # Install smart contract dependencies
   cd ../contracts
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env file with your configurations
   nano .env
   ```

4. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb digiseal_db
   
   # Run database migrations
   npm run migrate
   ```

5. **Deploy Smart Contracts**
   ```bash
   # Start local blockchain
   ganache-cli

   # Deploy contracts
   cd contracts
   truffle migrate --reset
   ```

6. **Start the Application**
   ```bash
   # Start backend server
   cd backend
   npm start

   # Start frontend (in another terminal)
   cd frontend
   npm start
   ```

7. **Access the Application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000`
   - Ganache GUI: `http://localhost:7545`

## 📋 Functional Requirements

### User Management
- **FR-1**: Secure user registration with email verification
- **FR-2**: Multi-factor authentication support
- **FR-3**: Role-based access control (Consumers, Manufacturers, Retailers, Administrators)

### Product Verification
- **FR-4**: QR code scanning through mobile cameras
- **FR-5**: Manual alphanumeric product identifier entry
- **FR-6**: Blockchain-based product identifier validation
- **FR-7**: Manufacturer genesis information queries
- **FR-8**: Complete chain of custody validation
- **FR-9**: Verification attempt logging with timestamps

### Smart Contract Operations
- **FR-10**: Smart contract execution for verification rules
- **FR-11**: Manufacturing information display (date, location, batch)
- **FR-12**: Complete ownership history with transfer timestamps
- **FR-13**: Visual authenticity status confirmation
- **FR-14**: Product specifications and details presentation
- **FR-15**: Warranty information display

### Reporting System
- **FR-16**: Photographic evidence submission for counterfeit reports
- **FR-17**: Detailed authenticity concern descriptions
- **FR-18**: Location data collection for suspected counterfeits
- **FR-19**: Case tracking for submitted reports

### Manufacturer Features
- **FR-20**: New product registration with digital signatures
- **FR-21**: Product specification uploads
- **FR-22**: Unique product identifier generation
- **FR-23**: Product verification parameter establishment

### Supply Chain Management
- **FR-24**: Custody change recording on blockchain
- **FR-25**: Digital confirmation requirements for transfers
- **FR-26**: Transfer condition logging (temperature, handling)
- **FR-27**: Manufacturer circulation dashboard

### Analytics & Notifications
- **FR-28**: Counterfeit report summaries and trends
- **FR-29**: Supply chain efficiency metrics
- **FR-30**: In-app authentication alerts
- **FR-31**: Email notifications for pending actions
- **FR-32**: Batch report generation
- **FR-33**: Searchable verification history
- **FR-34**: Product authenticity trend analysis

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=digiseal_db
DB_USER=your_username
DB_PASSWORD=your_password

# Blockchain Configuration
ETHEREUM_NETWORK=development
ETHEREUM_RPC_URL=http://localhost:8545
PRIVATE_KEY=your_private_key
CONTRACT_ADDRESS=deployed_contract_address

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=24h

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5MB

# Application Configuration
PORT=8000
NODE_ENV=development
```

## 🔧 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "consumer"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

### Product Verification Endpoints

#### Verify Product by QR Code
```http
POST /api/products/verify
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "productId": "QR_CODE_DATA",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

#### Get Product Details
```http
GET /api/products/:productId
Authorization: Bearer <jwt_token>
```

### Manufacturer Endpoints

#### Register New Product
```http
POST /api/manufacturer/products
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Product description",
  "batchNumber": "BATCH001",
  "manufacturingDate": "2024-01-15",
  "specifications": {
    "weight": "500g",
    "dimensions": "10x10x5cm"
  }
}
```

### Reporting Endpoints

#### Report Counterfeit Product
```http
POST /api/reports/counterfeit
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

productId: SUSPECTED_PRODUCT_ID
description: "Detailed description of concerns"
location: "Store address where found"
evidence: [uploaded_image_files]
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:blockchain

# Run tests with coverage
npm run test:coverage
```

### Test Structure

```
tests/
├── unit/
│   ├── controllers/
│   ├── models/
│   └── utils/
├── integration/
│   ├── api/
│   └── database/
└── blockchain/
    ├── contracts/
    └── deployment/
```

## 🚀 Deployment

### Production Deployment

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Deploy Smart Contracts to Mainnet**
   ```bash
   truffle migrate --network mainnet
   ```

3. **Set Production Environment Variables**
   ```bash
   export NODE_ENV=production
   export ETHEREUM_NETWORK=mainnet
   # Set other production variables
   ```

4. **Start Production Server**
   ```bash
   npm run start:prod
   ```

### Docker Deployment

```bash
# Build Docker image
docker build -t digiseal:latest .

# Run with Docker Compose
docker-compose up -d
```

## 📊 Performance Specifications

### Non-Functional Requirements

- **Security**: Encryption standards for all user and product data (NF-1)
- **Scalability**: Support for 1,000+ concurrent users (NF-2)
- **Performance**: <15 second verification under normal conditions (NF-3)
- **Usability**: Intuitive interface requiring no specialized training (NF-4)
- **Compatibility**: Support for all major browsers and mobile OS (NF-5)
- **Compliance**: Adherence to data protection regulations (NF-6)
- **Security**: Enforced strong password requirements (NFR-7)
- **Reliability**: Graceful degradation with intermittent connectivity (NFR-8)
- **Architecture**: RESTful API design principles (NFR-9)

## 🔐 Security Considerations

### Smart Contract Security
- Input validation on all contract functions
- Reentrancy protection using OpenZeppelin libraries
- Access control modifiers for restricted functions
- Emergency pause functionality for critical situations

### Application Security
- JWT-based authentication with secure token storage
- Input sanitization to prevent injection attacks
- Rate limiting on API endpoints
- HTTPS enforcement in production
- Secure file upload with type validation

### Blockchain Security
- Private key management best practices
- Transaction signing verification
- Network-specific contract deployment
- Gas optimization to prevent DoS attacks

## 🤝 Contributing

We welcome contributions to DigiSeal! Please follow these steps:

1. **Fork the Repository**
   ```bash
   git fork https://github.com/TobieTom/DigiSeal.git
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Commit Changes**
   ```bash
   git commit -m "Add amazing feature"
   ```

4. **Push to Branch**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **Open Pull Request**

### Development Guidelines

- Follow existing code style and formatting
- Write comprehensive tests for new features
- Update documentation for any API changes
- Ensure all tests pass before submitting PR
- Use meaningful commit messages


## 🙏 Acknowledgments

- Ethereum Foundation for blockchain technology
- OpenZeppelin for secure smart contract libraries
- React community for frontend framework
- Contributors and testers who helped improve the system



**Built with ❤️ by [TobieTom](https://github.com/TobieTom)**

*Making authenticity verification accessible to everyone through blockchain technology.*
