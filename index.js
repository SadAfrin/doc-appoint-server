const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware configuration
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests



// Root route to verify server status
app.get('/', (req, res) => {
  res.send('Wanderlust Server is Running Smoothly (Without DB)!');
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});