
import { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:5000/api/recipes';

const categories = ['All', 'Indian', 'Italian', 'Healthy', 'Dessert'];

function App() {
  const [recipes, setRecipes] = useState([]);
  const [freshnessImage, setFreshnessImage] = useState(null);
  const [freshnessFile, setFreshnessFile] = useState(null);
const [freshnessResult, setFreshnessResult] = useState(null);
const [freshnessLoading, setFreshnessLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [ingredientsInput, setIngredientsInput] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [pythonMatches, setPythonMatches] = useState([]);
const [pythonLoading, setPythonLoading] = useState(false);
const [pythonError, setPythonError] = useState('');

const [foodImage, setFoodImage] = useState(null);
const [foodPreview, setFoodPreview] = useState('');
const [foodPrediction, setFoodPrediction] = useState(null);
const [foodLoading, setFoodLoading] = useState(false);
const [foodError, setFoodError] = useState('');

const [hygieneImage, setHygieneImage] = useState(null);
const [hygienePreview, setHygienePreview] = useState('');
const [hygieneResult, setHygieneResult] = useState(null);
const [hygieneLoading, setHygieneLoading] = useState(false);
const [hygieneError, setHygieneError] = useState('');



const findRecipesWithPython = async () => {
  const ingredients = ingredientsInput
    .split(',')
    .map((ingredient) => ingredient.trim())
    .filter((ingredient) => ingredient !== '');

  if (ingredients.length === 0) {
    setPythonMatches([]);
    setPythonError('');
    return;
  }

  setPythonLoading(true);
  setPythonError('');

  try {
    const response = await fetch('http://127.0.0.1:5001/api/match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ingredients }),
    });

    if (!response.ok) {
      throw new Error('Python API request failed');
    }

    

    


    const data = await response.json();
    setPythonMatches(data.recipes);
  } catch (error) {
    console.error('Python API error:', error);
    setPythonError('Could not connect to Python. Check that its server is running.');
    setPythonMatches([]);
  } finally {
    setPythonLoading(false);
  }
};

const identifyFood = async () => {
  console.log('Identify Food button clicked');
  if (!foodImage) {
    setFoodError('Please choose a food image first.');
    return;
  }

  setFoodLoading(true);
  setFoodError('');
  setFoodPrediction(null);

  try {
    const formData = new FormData();
    formData.append('file', foodImage);

    const response = await fetch('http://127.0.0.1:8000/predict', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Food recognition failed.');
    }

    setFoodPrediction(data);
  } catch (error) {
    console.error('Food recognition error:', error);
    setFoodError(
      error.message || 'Could not connect to the food recognition server.'
    );
  } finally {
    setFoodLoading(false);
  }
};



  // Fetch recipes from our backend
  useEffect(() => {
    fetch(API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Could not fetch recipes');
        }
        return response.json();
      })
      .then((data) => {
  console.log('Recipes received:', data);
  console.log('Recipe count:', data.recipes?.length);

  setRecipes(data.recipes);
  setApiError('');
})
      .catch((error) => {
        console.error('Recipe API error:', error);
        setApiError(
          'Could not load recipes. Please check whether your backend is running.'
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Search and category filters
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      recipe.name.toLowerCase().includes(search.toLowerCase()) ||
      recipe.ingredients.some((item) =>
        item.toLowerCase().includes(search.toLowerCase())
      );

    const matchesCategory =
      category === 'All' || recipe.category === category;

    return matchesSearch && matchesCategory;
  });
  const ingredientList = ingredientsInput
  .split(',')
  .map((ingredient) => ingredient.trim().toLowerCase())
  .filter((ingredient) => ingredient !== '');

const ingredientMatches = recipes.filter((recipe) =>
  ingredientList.length > 0 &&
  ingredientList.every((searchIngredient) =>
    recipe.ingredients.some((recipeIngredient) =>
      recipeIngredient.toLowerCase().includes(searchIngredient)
    )
  )
);

  return (
    <div className="app">
      
<nav className="navbar">
  <a className="logo" href="#home">
    🍃 FoodVerse<span>AI</span>
  </a>

  <div className="nav-links">
    <a className="nav-link" href="#tools">
      AI Tools
    </a>
    <a className="nav-link" href="#recipes">
      Explore Recipes
    </a>
  </div>
</nav>


      <main>
        <section className="hero" id="home">
          <p className="eyebrow">YOUR PERSONAL FOOD COMPANION</p>
          <h1>
            Good food.
            <br />
            <span>Great mood.</span>
          </h1>
          <p className="hero-text">
            Discover delicious recipes made for your taste,
            your ingredients, and your everyday cravings.
          </p>

          <div className="search-box">
            <span>🔎</span>
            <input
              type="text"
              placeholder="Search recipes or ingredients..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          
<button
  className="view-button"
  onClick={findRecipesWithPython}
  disabled={pythonLoading}
>
  {pythonLoading ? 'Finding recipes...' : 'Find Recipes with AI ✨'}
</button>


          <p className="hero-note">
            A little inspiration for your next meal ✨
          </p>
        
</section>

<section className="tools-section" id="tools">
  <div className="tools-heading">
    <p className="section-eyebrow">EXPLORE FOODVERSE</p>
    <h2>Your AI Food Toolkit</h2>
    <p>
      Smart tools to help you explore food, discover recipes,
      and make better kitchen decisions.
    </p>
  </div>

  <div className="tools-grid">
   

<div className="tool-card">
  <div className="tool-icon">📸</div>
  <h3>AI Food Scanner</h3>
  <p>Upload a food image to identify what's on your plate.</p>
  <button
    className="tool-status"
    onClick={() => {
      document.getElementById("food-recognition")?.scrollIntoView({
        behavior: "smooth",
      });
    }}
  >
    Explore feature ↗
  </button>
</div>


    <a className="tool-card" href="#ingredient-finder">
      <div className="tool-icon">🥗</div>
      <h3>Smart Recipe Finder</h3>
      <p>Discover recipes using ingredients you already have.</p>
      <span className="tool-action">Find recipes ↗</span>
    </a>

    <a className="tool-card" href="#recipes">
      <div className="tool-icon">🍲</div>
      <h3>Recipe Explorer</h3>
      <p>Browse dishes and explore their ingredients and details.</p>
      <span className="tool-action">Explore recipes ↗</span>
    </a>

    
<a className="tool-card" href="#freshness">
  <div className="tool-icon">🍎</div>
  <h3>Freshness Detection</h3>
  <p>Explore visible signs of food freshness.</p>
  <span className="tool-action">Explore feature ↗</span>
</a>


    
<div className="tool-card">
  <div className="tool-icon">🥑</div>
  <h3>Nutrition Analysis</h3>
  <p>Explore estimated calories, protein, carbohydrates, and fats for common foods.</p>
  <button
    className="tool-status"
    onClick={() => {
      document.getElementById("nutrition-analysis")?.scrollIntoView({
        behavior: "smooth",
      });
    }}
  >
    Explore feature ↗
  </button>
</div>


    
<div
  className="tool-card"
  role="button"
  tabIndex={0}
  onClick={() =>
    document.getElementById('kitchen-hygiene')?.scrollIntoView({
      behavior: 'smooth',
    })
  }
>
  <div className="tool-icon">🧼</div>
  <h3>Kitchen Hygiene</h3>
  <p>Upload a kitchen photo for basic hygiene guidance.</p>
  <span className="tool-action">Explore feature ↗</span>
</div>

  </div>
</section>


<section className="freshness-section" id="freshness">
  <div className="freshness-heading">
    <p className="section-eyebrow">SMART FOOD INSIGHTS</p>
    <h2>Freshness Check</h2>
    <p>
      Upload a food image to explore visible signs of freshness.
      Image-based observations cannot confirm food safety.
    </p>
  </div>

  <div className="freshness-upload-card">
    <div className="freshness-icon">🍎</div>
    <h3>Check your food</h3>
    <p>Choose a photo of fruit or vegetables to get started.</p>

    <label className="freshness-upload-button" htmlFor="freshness-image">
      Choose an image
    </label>
    

<input
  id="freshness-image"
  type="file"
  accept="image/*"
  hidden
  onChange={(event) => {
    const file = event.target.files?.[0];

    if (file && file.type.startsWith("image/")) {
      setFreshnessFile(file);
      setFreshnessImage(URL.createObjectURL(file));
      setFreshnessResult(null);
    }
  }}
/>


{freshnessImage && (
  <div className="freshness-preview">
    <img
      src={freshnessImage}
      alt="Selected food for freshness inspection"
    />

    <p>Image selected successfully.</p>

   
<button
  type="button"
  className="freshness-check-button"
  disabled={!freshnessFile || freshnessLoading}
  onClick={async () => {
    if (!freshnessFile) return;

    setFreshnessLoading(true);
    setFreshnessResult(null);

    try {
      const formData = new FormData();
      formData.append("file", freshnessFile);

      const response = await fetch(
        "http://127.0.0.1:8001/freshness",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Image upload failed.");
      }
console.log("Freshness API response:", data);
      setFreshnessResult(data);
    } catch (error) {
      setFreshnessResult({
        success: false,
        message: error.message || "Could not connect to the backend.",
      });
    } finally {
      setFreshnessLoading(false);
    }
  }}
>
  {freshnessLoading ? "Checking..." : "Check Image"}
</button>

  </div>
)}


{freshnessResult && (
  <div className="freshness-result">
    <h3>Freshness Analysis Result</h3>

    <p>
      <strong>Predicted Freshness:</strong>{" "}
      {freshnessResult.predicted_freshness}
    </p>

   <p>
  <strong>Confidence:</strong>{" "}
  {freshnessResult.confidence !== undefined &&
  freshnessResult.confidence !== null
    ? freshnessResult.confidence
    : "Not available"}
  {freshnessResult.confidence !== undefined &&
  freshnessResult.confidence !== null
    ? "%"
    : ""}
</p>

    {freshnessResult.image_size && (
      <p>
        <strong>Image Size:</strong>{" "}
        {freshnessResult.image_size.width} ×{" "}
        {freshnessResult.image_size.height} pixels
      </p>
    )}

    <p className="freshness-notice">
      {freshnessResult.notice ||
        "This AI estimate is based on visible appearance and cannot guarantee food safety."}
    </p>
  </div>
)}





    <p className="freshness-note">
      Visual observations only · Not a food-safety test
    </p>
  </div>
</section>


<section className="ingredient-finder smart-recipe-section" id="ingredient-finder">
  <p className="eyebrow">COOK WITH WHAT YOU HAVE</p>
  <h2>What's in your kitchen? 🥑</h2>
  <p>Enter your ingredients, separated by commas.</p>

  <div className="search-box">
    <span>🥕</span>
    <input
      type="text"
      placeholder="e.g. milk, cheese, pasta"
      value={ingredientsInput}
      onChange={(event) => setIngredientsInput(event.target.value)}
    />
  </div>

  
{ingredientsInput.trim() !== '' && (
  <div>
    {pythonError && <p role="alert">{pythonError}</p>}

    {pythonLoading && <p>Finding recipes with Python...</p>}

    {!pythonLoading && !pythonError && pythonMatches.length > 0 && (
      <>
        <h3>Matching recipes</h3>

        
{pythonMatches.map((recipe) => (
  <div key={recipe.id} className="ingredient-match-card">
    <h4>{recipe.name}</h4>

    <p>
      <strong>{recipe.match_percentage ?? 0}% match</strong>
    </p>

    <p>
      <strong>Matched ingredients:</strong>{" "}
      {recipe.matched_ingredients?.join(", ") || "Not available"}
    </p>

    <p>
      <strong>Ingredients in this recipe but not entered:</strong>{" "}
      {recipe.missing_ingredients?.join(", ") || "None"}
    </p>

    <button onClick={() => setSelectedRecipe(recipe)}>
      View recipe
    </button>
  </div>
))}

      </>
    )}

    {!pythonLoading &&
      !pythonError &&
      pythonMatches.length === 0 && (
        <p>
          Click "Find Recipes with AI" to search, or try different ingredients.
        </p>
      )}
  </div>
)}

</section>

<section className="freshness-section food-scanner-section" id="food-recognition">
  <p className="eyebrow">AI FOOD SCANNER</p>
  <h2>What's on your plate? 📸</h2>
  <p>Upload a food photo and let FoodVerse AI identify it.</p>

  <input
    type="file"
    accept="image/*"
    onChange={(event) => {
      const file = event.target.files?.[0];

      setFoodImage(file || null);
      setFoodPrediction(null);
      setFoodError('');

      if (foodPreview) {
        URL.revokeObjectURL(foodPreview);
      }

      setFoodPreview(file ? URL.createObjectURL(file) : '');
    }}
  />

  {foodPreview && (
    <div style={{ marginTop: '20px' }}>
      <img
        src={foodPreview}
        alt="Selected food"
        style={{
          width: '100%',
          maxWidth: '350px',
          maxHeight: '300px',
          objectFit: 'contain',
          borderRadius: '12px',
        }}
      />
    </div>
  )}

  <div style={{ marginTop: '16px' }}>
    <button
      className="view-button"
      onClick={identifyFood}
      disabled={!foodImage || foodLoading}
    >
      {foodLoading ? 'Identifying food...' : 'Identify Food ✨'}
    </button>
  </div>

  {foodError && <p role="alert">{foodError}</p>}

  
{foodPrediction && (
  <div className="food-result-card">
    <div className="food-result-heading">
      <span className="food-result-icon">🍃</span>
      <div>
        <p className="eyebrow">FOODVERSE AI SCAN</p>
        <h3>Recognition Results</h3>
      </div>
      <span className="food-status">✓ Analysed</span>
    </div>

    <div className="food-main-result">
      {foodPreview && (
        <img
          src={foodPreview}
          alt="Your uploaded food"
          className="food-result-image"
        />
      )}

      <div className="food-main-details">
        <p className="food-result-label">Predicted food</p>
        <h2>{foodPrediction.predicted_food}</h2>

        <div className="confidence-row">
          <span>Model confidence</span>
          <strong>{foodPrediction.confidence}%</strong>
        </div>

        <div className="confidence-track">
          <div
            className="confidence-fill"
            style={{
              width: `${Math.min(
                100,
                Math.max(0, Number(foodPrediction.confidence) || 0)
              )}%`,
            }}
          />
        </div>
      </div>
    </div>

    <div className="food-alternatives">
      <h4>Other possible matches</h4>

      <div className="food-alternative-grid">
        {foodPrediction.predictions?.map((item, index) => (
          <div
            className="food-alternative-card"
            key={`${item.food}-${index}`}
          >
            <span className="food-alternative-icon">
              {index === 0 ? '🍽️' : index === 1 ? '🥗' : '🍲'}
            </span>
            <span className="food-alternative-name">{item.food}</span>
            <strong>{item.confidence}%</strong>
          </div>
        ))}
      </div>
    </div>

    <p className="food-result-disclaimer">
      💡 AI predictions can be incorrect. Check the result before relying on it.
    </p>
  </div>
)}

</section>


<section className="freshness-section" id="kitchen-hygiene">
  <div className="freshness-heading">
    <p className="section-eyebrow">SMART KITCHEN INSIGHTS</p>
    <h2>Kitchen Hygiene 🧼</h2>
    <p>
      Upload a kitchen photo to receive basic image checks and practical
      hygiene reminders.
    </p>
  </div>

  <div className="freshness-upload-card">
    <h3>Check your kitchen photo</h3>

    <label
      className="freshness-upload-button"
      htmlFor="hygiene-image"
    >
      Choose a kitchen image
    </label>

    <input
      id="hygiene-image"
      type="file"
      accept="image/*"
      hidden
      onChange={(event) => {
        const file = event.target.files?.[0];

        if (file && file.type.startsWith('image/')) {
          setHygieneImage(file);
          setHygienePreview(URL.createObjectURL(file));
          setHygieneResult(null);
          setHygieneError('');
        }
      }}
    />

    {hygienePreview && (
      <div className="freshness-preview">
        <img
          src={hygienePreview}
          alt="Selected kitchen"
        />

        <button
          type="button"
          className="freshness-check-button"
          disabled={!hygieneImage || hygieneLoading}
          onClick={async () => {
            setHygieneLoading(true);
            setHygieneError('');
            setHygieneResult(null);

            try {
              const formData = new FormData();
              formData.append('image', hygieneImage);

              const response = await fetch(
                'http://127.0.0.1:8001/api/kitchen-hygiene',
                {
                  method: 'POST',
                  body: formData,
                }
              );

              const data = await response.json();

              if (!response.ok) {
                throw new Error(
                  data.detail || 'Kitchen image check failed.'
                );
              }

              setHygieneResult(data);
            } catch (error) {
              setHygieneError(
                error.message || 'Could not connect to the backend.'
              );
            } finally {
              setHygieneLoading(false);
            }
          }}
        >
          {hygieneLoading ? 'Checking...' : 'Check Kitchen Image'}
        </button>
      </div>
    )}

    {hygieneError && <p role="alert">{hygieneError}</p>}

    {hygieneResult && (
      <div className="freshness-result">
        <h3>Kitchen Hygiene Guidance</h3>

        <p>{hygieneResult.assessment}</p>

        {hygieneResult.image_width && (
          <p>
            <strong>Image dimensions:</strong>{' '}
            {hygieneResult.image_width} × {hygieneResult.image_height} pixels
          </p>
        )}

        <h4>Hygiene checklist</h4>
        <ul>
          {hygieneResult.hygiene_checklist?.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>

        <p className="freshness-note">
          {hygieneResult.disclaimer}
        </p>
      </div>
    )}

    <p className="freshness-note">
      Basic image validation and general hygiene advice only.
    </p>
  </div>
</section>


<section className="recipes-section" id="recipes">

          <div className="section-heading">
            <div>
              <p className="eyebrow">FIND YOUR NEXT FAVOURITE</p>
              <h2>Explore recipes</h2>
            </div>
            <span className="recipe-count">
              {loading ? 'Loading...' : `${filteredRecipes.length} recipes`}
            </span>
          </div>

          <div className="categories">
            {categories.map((item) => (
              <button
                key={item}
                className={category === item ? 'category active' : 'category'}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {loading && <p>Loading recipes from FoodVerse AI backend...</p>}

          {apiError && <p role="alert">{apiError}</p>}

          {!loading && !apiError && (
            <>
              <div className="recipe-grid">
                {filteredRecipes.map((recipe) => (
                  <article className="recipe-card" key={recipe.id}>
                    


<div className="recipe-image">
  {recipe.image ? (
    <img
      src={recipe.image}
      alt={recipe.name}
      className="food-photo"
      onError={(event) => {
        event.currentTarget.style.display = 'none';
        event.currentTarget.nextElementSibling.style.display = 'block';
      }}
    />
  ) : null}

  <span
    className="food-emoji"
    style={{ display: recipe.image ? 'none' : 'block' }}
  >
    {recipe.emoji}
  </span>

  <span className="time-badge">◷ {recipe.time}</span>
</div>



                    <div className="recipe-info">
                      <p className="recipe-category">{recipe.category}</p>
                      <h3>{recipe.name}</h3>
                      <p className="recipe-description">
                        {recipe.description}
                      </p>
                      <button
                        className="view-button"
                        onClick={() => setSelectedRecipe(recipe)}
                      >
                        View recipe <span>→</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {filteredRecipes.length === 0 && (
                <div className="empty-state">
                  <span>🍽️</span>
                  <h3>No recipes found</h3>
                  <p>
                    Try another search or choose a different category.
                  </p>
                  <button
                    onClick={() => {
                      setSearch('');
                      setCategory('All');
                    }}
                  >
                    Show all recipes
                  </button>
                </div>
              )}
            </>
          )}
        </section>
        
<section id="nutrition-analysis" className="nutrition-section">
  <h2>🥑 Nutrition Analysis</h2>
  <p>Choose a food to view estimated nutrition per serving.</p>

  <select id="nutrition-food" defaultValue="pasta">
    <option value="pasta">Creamy White Pasta</option>
    <option value="rice">Cooked Rice (1 cup)</option>
    <option value="noodles">Masala Noodles</option>
    <option value="salad">Vegetable Salad</option>
    <option value="pancakes">Chocolate Pancakes</option>
  </select>

  <button
    type="button"
    onClick={() => {
      const food = document.getElementById("nutrition-food").value;
      const data = {
        pasta: { name: "Creamy White Pasta", calories: 350, protein: 12, carbs: 45, fat: 14 },
        rice: { name: "Cooked Rice (1 cup)", calories: 205, protein: 4, carbs: 45, fat: 0.5 },
        noodles: { name: "Masala Noodles", calories: 320, protein: 7, carbs: 48, fat: 11 },
        salad: { name: "Vegetable Salad", calories: 120, protein: 3, carbs: 14, fat: 6 },
        pancakes: { name: "Chocolate Pancakes", calories: 380, protein: 8, carbs: 52, fat: 16 }
      };

      const item = data[food];
      document.getElementById("nutrition-result").innerHTML =
        `<h3>${item.name}</h3>
         <p>Calories: ${item.calories} kcal</p>
         <p>Protein: ${item.protein} g</p>
         <p>Carbohydrates: ${item.carbs} g</p>
         <p>Fat: ${item.fat} g</p>
         <small>Approximate values; actual nutrition varies by recipe and serving size.</small>`;
    }}
  >
    Calculate Nutrition
  </button>

  <div id="nutrition-result" aria-live="polite"></div>
</section>

      </main>

      <footer>
        <a className="logo" href="#home">
          🍃 FoodVerse<span>AI</span>
        </a>
        <p>Made with love and a little food magic. 💚</p>
      </footer>

      {selectedRecipe && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedRecipe(null)}
        >
          <section
            className="recipe-modal"
            role="dialog"
            aria-modal="true"
            aria-label={selectedRecipe.name}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="close-button"
              onClick={() => setSelectedRecipe(null)}
              aria-label="Close recipe"
            >
              ×
            </button>

            <div className="modal-emoji">{selectedRecipe.emoji}</div>
            <p className="eyebrow">
              {selectedRecipe.category} · {selectedRecipe.time}
            </p>
            <h2>{selectedRecipe.name}</h2>
            <p>{selectedRecipe.description}</p>
            <h3>Ingredients</h3>
            <ul>
              {selectedRecipe.ingredients.map((ingredient) => (
                <li key={ingredient}>{ingredient}</li>
              ))}
            </ul>
            <p className="modal-note">
              Recipe details are sample content for our first version.
            </p>
            


          </section>
        </div>
      )}
    </div>
    
  );
  


}

export default App;
