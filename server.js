const express = require("express");
const path = require("path");
const methodOverride = require("method-override");

const app = express();
const PORT = process.env.PORT || 4000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); 

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const categories = ["snacks", "desserts", "beverages", "breakfast", "lunch", "dinner"];
const categoryImageMap = {
  snacks: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1400&q=80",
  desserts: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1400&q=80",
  beverages: "https://images.unsplash.com/photo-1464306076886-da185f6a9d05?auto=format&fit=crop&w=1400&q=80",
  breakfast: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1400&q=80",
  lunch: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1400&q=80",
  dinner: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1400&q=80",
};

const defaultRecipeImage = (category) => categoryImageMap[category] || categoryImageMap.snacks;

let recipes = [
  {
    id: "1",
    title: "Mango Yogurt Smoothie",
    category: "beverages",
    ingredients: "Mango, Yogurt, Honey, Ice",
    instructions: "Blend all ingredients until smooth and serve chilled.",
    prepTime: "10",
    imageUrl: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "2",
    title: "Choco Oat Bites",
    category: "snacks",
    ingredients: "Oats, Peanut Butter, Cocoa Powder, Dates",
    instructions: "Mix everything, roll into balls, and chill for 30 minutes.",
    prepTime: "15",
    imageUrl: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "3",
    title: "Berry Parfait",
    category: "desserts",
    ingredients: "Greek Yogurt, Granola, Mixed Berries",
    instructions: "Layer yogurt, berries, and granola in a glass and enjoy.",
    prepTime: "8",
    imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "4",
    title: "Avocado Toast Supreme",
    category: "breakfast",
    ingredients: "Sourdough Bread, Avocado, Lemon Juice, Chili Flakes, Salt",
    instructions: "Toast bread, mash avocado with lemon and salt, spread, then finish with chili flakes.",
    prepTime: "12",
    imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "5",
    title: "Garlic Butter Pasta",
    category: "lunch",
    ingredients: "Spaghetti, Garlic, Butter, Parsley, Parmesan, Black Pepper",
    instructions: "Cook pasta, saute garlic in butter, toss with pasta water, parsley, and parmesan until glossy.",
    prepTime: "20",
    imageUrl: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "6",
    title: "Herb Grilled Chicken Bowl",
    category: "dinner",
    ingredients: "Chicken Breast, Olive Oil, Mixed Herbs, Rice, Cucumber, Tomato",
    instructions: "Marinate and grill chicken, slice, and serve over rice with fresh chopped vegetables.",
    prepTime: "35",
    imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "7",
    title: "Iced Peach Green Tea",
    category: "beverages",
    ingredients: "Green Tea, Peach Slices, Honey, Ice, Mint",
    instructions: "Brew tea, cool completely, stir in peach and honey, then pour over ice with mint.",
    prepTime: "10",
    imageUrl: "https://images.unsplash.com/photo-1499638673689-79a0b5115d87?auto=format&fit=crop&w=1400&q=80",
  },
];

const findRecipeById = (id) => recipes.find((recipe) => recipe.id === id);

app.get("/", (req, res) => {
  const q = (req.query.q || "").trim().toLowerCase();
  const category = (req.query.category || "all").toLowerCase();

  let filteredRecipes = recipes;

  if (q) {
    filteredRecipes = filteredRecipes.filter((recipe) => {
      const searchable = `${recipe.title} ${recipe.ingredients} ${recipe.instructions}`.toLowerCase();
      return searchable.includes(q);
    });
  }

  if (category !== "all") {
    filteredRecipes = filteredRecipes.filter((recipe) => recipe.category === category);
  }

  res.render("index", {
    pageTitle: "Recipe Hub",
    recipes: filteredRecipes,
    categories,
    query: q,
    selectedCategory: category,
  });
});

app.get("/recipes/new", (req, res) => {
  res.render("new", {
    pageTitle: "Create Recipe",
    recipe: {},
    categories,
  });
});

app.post("/recipes", (req, res) => {
  const { title, category, ingredients, instructions, prepTime, imageUrl } = req.body;
  const safeCategory = categories.includes(category) ? category : "snacks";

  const nextId = String(Date.now());

  recipes.unshift({
    id: nextId,
    title: title?.trim() || "Untitled Recipe",
    category: safeCategory,
    ingredients: ingredients?.trim() || "",
    instructions: instructions?.trim() || "",
    prepTime: prepTime?.trim() || "0",
    imageUrl: imageUrl?.trim() || defaultRecipeImage(safeCategory),
  });

  res.redirect("/");
});

app.get("/recipes/:id", (req, res) => {
  const recipe = findRecipeById(req.params.id);
  if (!recipe) {
    return res.status(404).render("404", { pageTitle: "Recipe Not Found" });
  }

  res.render("show", {
    pageTitle: recipe.title,
    recipe,
  });
});

app.get("/recipes/:id/edit", (req, res) => {
  const recipe = findRecipeById(req.params.id);
  if (!recipe) {
    return res.status(404).render("404", { pageTitle: "Recipe Not Found" });
  }

  res.render("edit", {
    pageTitle: `Edit ${recipe.title}`,
    recipe,
    categories,
  });
});

app.put("/recipes/:id", (req, res) => {
  const recipe = findRecipeById(req.params.id);
  if (!recipe) {
    return res.status(404).render("404", { pageTitle: "Recipe Not Found" });
  }

  const { title, category, ingredients, instructions, prepTime, imageUrl } = req.body;
  const safeCategory = categories.includes(category) ? category : recipe.category;
  recipe.title = title?.trim() || recipe.title;
  recipe.category = safeCategory;
  recipe.ingredients = ingredients?.trim() || recipe.ingredients;
  recipe.instructions = instructions?.trim() || recipe.instructions;
  recipe.prepTime = prepTime?.trim() || recipe.prepTime;
  recipe.imageUrl = imageUrl?.trim() || defaultRecipeImage(safeCategory);

  res.redirect(`/recipes/${recipe.id}`);
});

app.delete("/recipes/:id", (req, res) => {
  recipes = recipes.filter((recipe) => recipe.id !== req.params.id);
  res.redirect("/");
});

app.use((req, res) => {
  res.status(404).render("404", { pageTitle: "Page Not Found" });
});

app.listen(PORT, () => {
  console.log(`Recipe website running on http://localhost:${PORT}`);
});
