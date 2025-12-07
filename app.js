const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Load recipes.json once at startup
let recipes = [];

try {
  recipes = JSON.parse(fs.readFileSync('./recipes.json', 'utf8'));
  if (!Array.isArray(recipes)) {
    throw new Error("Fișierul recipes.json nu conține un array valid.");
  }
} catch (error) {
  console.error("Eroare la încărcarea fișierului recipes.json:", error.message);
  process.exit(1);
}

// Middleware
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('Serverul de rețete secrete este activ!');
});

// Random recipe route cu blacklist
app.get('/recipe', (req, res) => {
  const userId = req.query.userId; // ex: /recipe?userId=agent007

  // Dacă nu avem userId, dăm o rețetă random din toate
  if (!userId) {
    const randomIndex = Math.floor(Math.random() * recipes.length);
    return res.json(recipes[randomIndex]);
  }

  // Filtrăm rețetele la care userul NU este în blacklist
  const allowedRecipes = recipes.filter(recipe => {
    const blacklist = Array.isArray(recipe.blacklist) ? recipe.blacklist : [];
    return !blacklist.includes(userId);
  });

  if (allowedRecipes.length === 0) {
    return res.status(403).json({
      message: "Toate rețetele sunt interzise pentru acest agent. Acces refuzat."
    });
  }

  const randomIndex = Math.floor(Math.random() * allowedRecipes.length);
  const randomRecipe = allowedRecipes[randomIndex];

  res.json(randomRecipe);
});

// Start server
app.listen(PORT, () => {
  console.log(`Serverul rulează la http://localhost:${PORT}`);
});
