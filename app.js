const express = require("express");
const cors = require("cors");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000;

// Load recipes.json once at startup
let recipes = [];

try {
  recipes = JSON.parse(fs.readFileSync("./recipes.json", "utf8"));
  if (!Array.isArray(recipes)) {
    throw new Error("Fișierul recipes.json nu conține un array valid.");
  }
} catch (error) {
  console.error("Eroare la încărcarea fișierului recipes.json:", error.message);
  process.exit(1);
}

// CORS configuration: allow localhost and loopback origins
const allowedOriginRegexes = [
  /^http:\/\/localhost(?::\d+)?$/,
  /^https:\/\/localhost(?::\d+)?$/,
  /^http:\/\/127\.0\.0\.1(?::\d+)?$/,
  /^https:\/\/127\.0\.0\.1(?::\d+)?$/,
  /^http:\/\/0\.0\.0\.0(?::\d+)?$/,
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser or same-origin requests
    const allowed = allowedOriginRegexes.some((re) => re.test(origin));
    if (allowed) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
// app.options("*", cors(corsOptions)); // preflight if needed

// Middleware to handle JSON requests
app.use(express.json());

// Basic route
app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

// Random recipe route with blacklist support
// Example: GET /recipe?userId=agent007
app.get("/recipe", (req, res) => {
  const userId = req.query.userId;

  // dacă nu avem userId, alegem orice rețetă la întâmplare
  if (!userId) {
    const randomIndex = Math.floor(Math.random() * recipes.length);
    return res.json(recipes[randomIndex]);
  }

  // filtrăm rețetele la care userul NU este în blacklist
  const allowedRecipes = recipes.filter((recipe) => {
    const blacklist = Array.isArray(recipe.blacklist) ? recipe.blacklist : [];
    return !blacklist.includes(userId);
  });

  if (allowedRecipes.length === 0) {
    return res.status(403).json({
      message: "Toate rețetele sunt interzise pentru acest agent. Acces refuzat.",
    });
  }

  const randomIndex = Math.floor(Math.random() * allowedRecipes.length);
  const randomRecipe = allowedRecipes[randomIndex];

  res.json(randomRecipe);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
