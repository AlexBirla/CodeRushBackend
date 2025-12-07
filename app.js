const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Load recipes.json once at startup
const recipes = JSON.parse(fs.readFileSync('./recipes.json', 'utf8'));

// Middleware to handle JSON requests
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

// Random recipe route
app.get('/recipe', (req, res) => {
  const randomIndex = Math.floor(Math.random() * recipes.length);
  const randomRecipe = recipes[randomIndex];
  res.json(randomRecipe);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
