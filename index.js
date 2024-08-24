require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios'); // Add this line

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Could not connect to MongoDB', err);
    process.exit(1);
  });

// Define schema and model
const evaluationSchema = new mongoose.Schema({
  name: String,
  evaluations: [{
    title: String,
    location: String,
    nyfRequest: Number,
    selected: Boolean,
    criteriaEvaluations: mongoose.Schema.Types.Mixed
  }]
});
const Evaluation = mongoose.model('Evaluation', evaluationSchema);

// API endpoints
app.post('/api/evaluations', async (req, res) => {
  console.log('Received POST request to /api/evaluations');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  try {
    const evaluation = new Evaluation(req.body);
    await evaluation.save();
    console.log('Evaluation saved successfully');
    res.status(201).send({ message: 'Evaluation saved successfully' });
  } catch (error) {
    console.error('Error saving evaluation:', error);
    res.status(400).send({ message: 'Error saving evaluation', error: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Project Evaluation Backend is running');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('MongoDB URI:', process.env.MONGODB_URI.replace(/mongodb\+srv:\/\/.*:(.*)@/, 'mongodb+srv://user:****@'));

  // Start the ping mechanism after the server has started
  startPingMechanism();
});

function startPingMechanism() {
  const url = `https://survey-backend-cwrv.onrender.com/`; // Replace with your Render URL
  const interval = 840000; // 14 minutes

  function reloadWebsite() {
    axios.get(url)
      .then(response => {
        console.log(`Pinged at ${new Date().toISOString()}: Status Code ${response.status}`);
      })
      .catch(error => {
        console.error(`Error pinging at ${new Date().toISOString()}:`, error.message);
      });
  }

  setInterval(reloadWebsite, interval);
  console.log('Ping mechanism started');
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});