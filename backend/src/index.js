const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/users', require('./routes/users'));

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});