require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Define a schema for our data
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

// API endpoint to save evaluation data
app.post('/api/evaluations', async (req, res) => {
  try {
    const evaluation = new Evaluation(req.body);
    await evaluation.save();
    res.status(201).send({ message: 'Evaluation saved successfully' });
  } catch (error) {
    res.status(400).send({ message: 'Error saving evaluation', error: error.message });
  }
});

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Project Evaluation Backend is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));