const cors = require('cors');
const express = require('express');

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

// Sample recipe data
const recipes = [
  {
    id: 1,
    name: 'Creamy White Pasta',
    category: 'Italian',
    time: '25 min',
    image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800',
    emoji: '🍝',
    description: 'Creamy, comforting pasta for a cozy meal.',
    ingredients: ['Pasta', 'Milk', 'Garlic', 'Cheese'],
  },
  {
    id: 2,
    name: 'Veggie Power Bowl',
    category: 'Healthy',
    time: '15 min',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
    emoji: '🥗',
    description: 'A fresh, colourful bowl packed with goodness.',
    ingredients: ['Lettuce', 'Tomato', 'Corn', 'Paneer'],
  },
  {
    id: 3,
    name: 'Classic Masala Dosa',
    category: 'Indian',
    time: '30 min',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800',
    emoji: '🥞',
    description: 'A crispy South Indian favourite.',
    ingredients: ['Dosa batter', 'Potato', 'Onion', 'Spices'],
  },
  {
    id: 4,
    name: 'Chocolate Pancakes',
    category: 'Dessert',
    time: '20 min',
    image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800',
    emoji: '🥞',
    description: 'Fluffy pancakes for your sweet cravings.',
    ingredients: ['Flour', 'Milk', 'Cocoa', 'Sugar'],
  },
];

// Welcome route
app.get('/', (req, res) => {
  res.send('Welcome to FoodVerse AI Backend! 🍃');
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'FoodVerse AI API is working!',
  });
});

// Get all recipes
app.get('/api/recipes', (req, res) => {
  res.json({
    success: true,
    count: recipes.length,
    recipes: recipes,
  });
});

// Get one recipe by ID
app.get('/api/recipes/:id', (req, res) => {
  const recipeId = Number(req.params.id);

  const recipe = recipes.find((item) => item.id === recipeId);

  if (!recipe) {
    return res.status(404).json({
      success: false,
      message: 'Recipe not found',
    });
  }

  res.json({
    success: true,
    recipe: recipe,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`FoodVerse AI backend running at http://localhost:${PORT}`);
});
