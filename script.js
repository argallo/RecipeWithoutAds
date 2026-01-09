// Sample recipes data (for non-authenticated users)
const sampleRecipes = [
    {
        id: 1,
        name: "Classic Spaghetti Carbonara",
        author: "Marco Rossi",
        image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&h=600&fit=crop",
        source: {
            type: "youtube",
            youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        ingredients: [
            "400g spaghetti",
            "200g pancetta or guanciale, diced",
            "4 large eggs",
            "100g Pecorino Romano cheese, grated",
            "Black pepper to taste",
            "Salt for pasta water"
        ],
        instructions: [
            "Bring a large pot of salted water to boil and cook spaghetti according to package directions.",
            "While pasta cooks, fry pancetta in a large skillet over medium heat until crispy, about 5-7 minutes.",
            "In a bowl, whisk together eggs, grated cheese, and a generous amount of black pepper.",
            "Reserve 1 cup of pasta water, then drain the spaghetti.",
            "Remove skillet from heat, add hot pasta to the pancetta and toss to combine.",
            "Quickly add the egg mixture and toss vigorously, adding pasta water as needed to create a creamy sauce.",
            "Serve immediately with extra cheese and black pepper."
        ]
    },
    {
        id: 2,
        name: "Chicken Tikka Masala",
        author: "Priya Sharma",
        image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&h=600&fit=crop",
        source: {
            type: "cookbook",
            bookName: "The Complete Indian Cooking",
            amazonLink: "https://www.amazon.com/dp/EXAMPLE123"
        },
        ingredients: [
            "800g boneless chicken thighs, cubed",
            "1 cup plain yogurt",
            "2 tbsp tikka masala spice blend",
            "3 tbsp butter",
            "1 large onion, diced",
            "4 cloves garlic, minced",
            "1 tbsp ginger, grated",
            "400g crushed tomatoes",
            "1 cup heavy cream",
            "Fresh cilantro for garnish",
            "Salt to taste"
        ],
        instructions: [
            "Marinate chicken in yogurt and half the spice blend for at least 30 minutes.",
            "Heat butter in a large pan over medium-high heat and cook chicken until browned. Set aside.",
            "In the same pan, sauté onion until soft, about 5 minutes.",
            "Add garlic, ginger, and remaining spices. Cook for 1 minute until fragrant.",
            "Add crushed tomatoes and simmer for 10 minutes.",
            "Stir in heavy cream and return chicken to the pan.",
            "Simmer for 15-20 minutes until chicken is cooked through and sauce is thickened.",
            "Garnish with fresh cilantro and serve with rice or naan."
        ]
    },
    {
        id: 3,
        name: "Chocolate Chip Cookies",
        author: "Betty Johnson",
        image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&h=600&fit=crop",
        source: {
            type: "manual"
        },
        ingredients: [
            "2¼ cups all-purpose flour",
            "1 tsp baking soda",
            "1 tsp salt",
            "1 cup butter, softened",
            "¾ cup granulated sugar",
            "¾ cup brown sugar",
            "2 large eggs",
            "2 tsp vanilla extract",
            "2 cups chocolate chips"
        ],
        instructions: [
            "Preheat oven to 375°F (190°C).",
            "In a bowl, whisk together flour, baking soda, and salt.",
            "In a large bowl, beat butter and both sugars until creamy.",
            "Add eggs and vanilla to butter mixture and beat until combined.",
            "Gradually stir in flour mixture until just combined.",
            "Fold in chocolate chips.",
            "Drop rounded tablespoons of dough onto ungreased baking sheets.",
            "Bake for 9-11 minutes or until golden brown.",
            "Cool on baking sheet for 2 minutes, then transfer to wire rack."
        ]
    },
    {
        id: 4,
        name: "Greek Salad",
        author: "Nikos Papadopoulos",
        image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop",
        source: {
            type: "youtube",
            youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        ingredients: [
            "4 large tomatoes, cut into wedges",
            "1 cucumber, sliced",
            "1 red onion, thinly sliced",
            "1 green bell pepper, sliced",
            "200g feta cheese, cubed",
            "½ cup Kalamata olives",
            "¼ cup olive oil",
            "2 tbsp red wine vinegar",
            "1 tsp dried oregano",
            "Salt and pepper to taste"
        ],
        instructions: [
            "In a large bowl, combine tomatoes, cucumber, onion, and bell pepper.",
            "Add feta cheese and olives.",
            "In a small bowl, whisk together olive oil, vinegar, oregano, salt, and pepper.",
            "Pour dressing over salad and toss gently to combine.",
            "Let sit for 10 minutes before serving to allow flavors to meld.",
            "Serve at room temperature."
        ]
    }
];

// User recipes (for authenticated users)
let recipes = [];

let currentRecipeId = null;

// Track checkbox state for each recipe
let recipeState = {};

// Search state
let searchQuery = '';
let filteredRecipes = [];
let selectedAutocompleteIndex = -1;

// Rating state
let userRatings = {}; // Track which recipes user has rated
let selectedRating = 0; // Currently selected rating in modal
let currentRatingRecipeId = null; // Recipe being rated

// DOM Elements
const recipeList = document.getElementById('recipeList');
const recipeContent = document.getElementById('recipeContent');
const recipeDisplay = document.getElementById('recipeDisplay');
const addRecipeBtn = document.getElementById('addRecipeBtn');
const addRecipeModal = document.getElementById('addRecipeModal');
const addRecipeForm = document.getElementById('addRecipeForm');
const cancelBtn = document.getElementById('cancelBtn');
const resetBtn = document.getElementById('resetBtn');
const menuToggleBtn = document.getElementById('menuToggleBtn');
const sidebar = document.getElementById('recipeList-sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const searchInput = document.getElementById('recipeSearch');
const autocompleteDropdown = document.getElementById('autocompleteDropdown');
const searchClearBtn = document.getElementById('searchClearBtn');
const landingSearch = document.getElementById('landingSearch');
const landingAutocompleteDropdown = document.getElementById('landingAutocompleteDropdown');
const landingSearchClearBtn = document.getElementById('landingSearchClearBtn');
const randomRecipesGrid = document.getElementById('randomRecipesGrid');
const landingPage = document.querySelector('.landing-page');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const cancelLoginBtn = document.getElementById('cancelLoginBtn');
const cancelSignupBtn = document.getElementById('cancelSignupBtn');
const showSignupBtn = document.getElementById('showSignupBtn');
const showLoginBtn = document.getElementById('showLoginBtn');
const userDropdown = document.getElementById('userDropdown');
const usernameDisplay = document.getElementById('usernameDisplay');
const loginError = document.getElementById('loginError');
const signupError = document.getElementById('signupError');
const siteLogo = document.getElementById('siteLogo');

// Rating DOM elements
const ratingModal = document.getElementById('ratingModal');
const starRatingInput = document.getElementById('starRatingInput');
const selectedRatingText = document.getElementById('selectedRatingText');
const submitRatingBtn = document.getElementById('submitRatingBtn');
const cancelRatingBtn = document.getElementById('cancelRatingBtn');
const recipeStars = document.getElementById('recipeStars');
const ratingText = document.getElementById('ratingText');

// Authentication state
let currentUser = null;
let isAuthenticated = false;

// Get current recipes based on authentication status
function getCurrentRecipes() {
    // If authenticated but no recipes yet, show sample recipes
    if (isAuthenticated && recipes.length === 0) {
        return sampleRecipes;
    }
    // If authenticated with recipes, show user recipes
    if (isAuthenticated) {
        return recipes;
    }
    // If not authenticated, show sample recipes
    return sampleRecipes;
}

// Helper function to extract YouTube video ID from URL
function getYouTubeVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Toggle sidebar for mobile
function toggleSidebar() {
    sidebar.classList.toggle('active');
    sidebarOverlay.classList.toggle('active');
    menuToggleBtn.classList.toggle('active');
}

// Close sidebar
function closeSidebar() {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
    menuToggleBtn.classList.remove('active');
}

// Search and filter recipes
function filterRecipes(query) {
    const currentRecipes = getCurrentRecipes();
    if (!query || query.trim() === '') {
        return currentRecipes;
    }

    const lowerQuery = query.toLowerCase();
    return currentRecipes.filter(recipe => {
        const nameMatch = recipe.name.toLowerCase().includes(lowerQuery);
        const authorMatch = recipe.author.toLowerCase().includes(lowerQuery);
        return nameMatch || authorMatch;
    });
}

// Render autocomplete suggestions
function renderAutocomplete(suggestions) {
    autocompleteDropdown.innerHTML = '';

    if (suggestions.length === 0) {
        autocompleteDropdown.classList.remove('active');
        return;
    }

    suggestions.forEach((recipe, index) => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        if (index === selectedAutocompleteIndex) {
            item.classList.add('selected');
        }

        const nameSpan = document.createElement('div');
        nameSpan.className = 'recipe-name';
        nameSpan.textContent = recipe.name;

        const authorSpan = document.createElement('div');
        authorSpan.className = 'recipe-author';
        authorSpan.textContent = `by ${recipe.author}`;

        item.appendChild(nameSpan);
        item.appendChild(authorSpan);

        item.addEventListener('click', () => {
            selectAutocompleteItem(recipe);
        });

        autocompleteDropdown.appendChild(item);
    });

    autocompleteDropdown.classList.add('active');
}

// Select an autocomplete item
function selectAutocompleteItem(recipe) {
    searchInput.value = recipe.name;
    searchQuery = recipe.name;
    autocompleteDropdown.classList.remove('active');
    selectedAutocompleteIndex = -1;
    toggleClearButton();
    updateSearch();
    showRecipe(recipe.id);
}

// Toggle clear button visibility
function toggleClearButton() {
    if (searchInput.value.trim() !== '') {
        searchClearBtn.classList.add('visible');
    } else {
        searchClearBtn.classList.remove('visible');
    }
}

// Clear search
function clearSearch() {
    searchInput.value = '';
    searchQuery = '';
    filteredRecipes = [];
    autocompleteDropdown.classList.remove('active');
    selectedAutocompleteIndex = -1;
    searchClearBtn.classList.remove('visible');
    renderRecipeList();
    searchInput.focus();
}

// Handle search input
function handleSearchInput(e) {
    searchQuery = e.target.value;
    selectedAutocompleteIndex = -1;
    toggleClearButton();

    if (searchQuery.trim() === '') {
        autocompleteDropdown.classList.remove('active');
        filteredRecipes = [];
        renderRecipeList();
        return;
    }

    filteredRecipes = filterRecipes(searchQuery);
    renderAutocomplete(filteredRecipes.slice(0, 5)); // Show max 5 suggestions
    renderRecipeList();
}

// Handle search keyboard navigation
function handleSearchKeydown(e) {
    const suggestions = filteredRecipes.slice(0, 5);

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedAutocompleteIndex = Math.min(selectedAutocompleteIndex + 1, suggestions.length - 1);
        renderAutocomplete(suggestions);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedAutocompleteIndex = Math.max(selectedAutocompleteIndex - 1, -1);
        renderAutocomplete(suggestions);
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedAutocompleteIndex >= 0 && selectedAutocompleteIndex < suggestions.length) {
            selectAutocompleteItem(suggestions[selectedAutocompleteIndex]);
        }
    } else if (e.key === 'Escape') {
        autocompleteDropdown.classList.remove('active');
        selectedAutocompleteIndex = -1;
    }
}

// Update search results
function updateSearch() {
    filteredRecipes = filterRecipes(searchQuery);
    renderRecipeList();
}

// Get random recipes
function getRandomRecipes(count) {
    const currentRecipes = getCurrentRecipes();
    const shuffled = [...currentRecipes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, currentRecipes.length));
}

// Render random recipe cards
function renderRandomRecipes() {
    const randomRecipes = getRandomRecipes(3);
    randomRecipesGrid.innerHTML = '';

    randomRecipes.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.addEventListener('click', () => {
            showRecipe(recipe.id);
        });

        if (recipe.image) {
            const img = document.createElement('img');
            img.src = recipe.image;
            img.alt = recipe.name;
            img.className = 'recipe-card-image';
            card.appendChild(img);
        }

        const content = document.createElement('div');
        content.className = 'recipe-card-content';

        const title = document.createElement('div');
        title.className = 'recipe-card-title';
        title.textContent = recipe.name;

        const author = document.createElement('div');
        author.className = 'recipe-card-author';
        author.textContent = `by ${recipe.author}`;

        content.appendChild(title);
        content.appendChild(author);

        // Add rating display
        const ratingDiv = document.createElement('div');
        ratingDiv.innerHTML = createCardRatingHTML(recipe.averageRating || 0, recipe.ratingCount || 0);
        content.appendChild(ratingDiv.firstChild);

        card.appendChild(content);

        randomRecipesGrid.appendChild(card);
    });
}

// Landing search handlers
function toggleLandingClearButton() {
    if (landingSearch.value.trim() !== '') {
        landingSearchClearBtn.classList.add('visible');
    } else {
        landingSearchClearBtn.classList.remove('visible');
    }
}

function clearLandingSearch() {
    landingSearch.value = '';
    landingAutocompleteDropdown.classList.remove('active');
    landingSearchClearBtn.classList.remove('visible');
    selectedLandingAutocompleteIndex = -1;

    // Restore the random recipes view
    const randomRecipesSection = document.querySelector('.random-recipes-section');
    const heading = randomRecipesSection.querySelector('h2');
    heading.textContent = 'Try These Recipes';
    renderRandomRecipes();

    landingSearch.focus();
}

let selectedLandingAutocompleteIndex = -1;

function handleLandingSearchInput(e) {
    const query = e.target.value;
    toggleLandingClearButton();
    selectedLandingAutocompleteIndex = -1;

    if (query.trim() === '') {
        landingAutocompleteDropdown.classList.remove('active');

        // Restore the random recipes view
        const randomRecipesSection = document.querySelector('.random-recipes-section');
        const heading = randomRecipesSection.querySelector('h2');
        heading.textContent = 'Try These Recipes';
        renderRandomRecipes();
        return;
    }

    const filtered = filterRecipes(query);
    renderLandingAutocomplete(filtered);
}

function handleLandingSearchKeydown(e) {
    const query = landingSearch.value.trim();

    if (query === '') return;

    const filtered = filterRecipes(query);
    const suggestions = filtered.slice(0, 5);

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedLandingAutocompleteIndex = Math.min(selectedLandingAutocompleteIndex + 1, suggestions.length - 1);
        renderLandingAutocomplete(filtered);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedLandingAutocompleteIndex = Math.max(selectedLandingAutocompleteIndex - 1, -1);
        renderLandingAutocomplete(filtered);
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedLandingAutocompleteIndex >= 0 && selectedLandingAutocompleteIndex < suggestions.length) {
            // Select the highlighted suggestion
            const selectedRecipe = suggestions[selectedLandingAutocompleteIndex];
            selectLandingAutocompleteItem(selectedRecipe);
        } else {
            // Show results page with all matching recipes
            showLandingSearchResults(query, filtered);
        }
    } else if (e.key === 'Escape') {
        landingAutocompleteDropdown.classList.remove('active');
        selectedLandingAutocompleteIndex = -1;
    }
}

function showLandingSearchResults(query, results) {
    // Close autocomplete
    landingAutocompleteDropdown.classList.remove('active');
    selectedLandingAutocompleteIndex = -1;

    // Update the heading
    const randomRecipesSection = document.querySelector('.random-recipes-section');
    const heading = randomRecipesSection.querySelector('h2');

    if (results.length === 0) {
        heading.textContent = `No results found for "${query}"`;
        randomRecipesGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">Try a different search term</p>';
    } else {
        heading.textContent = `Search results for "${query}" (${results.length})`;
        renderSearchResults(results);
    }
}

function renderSearchResults(results) {
    randomRecipesGrid.innerHTML = '';

    results.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.addEventListener('click', () => {
            showRecipe(recipe.id);
        });

        if (recipe.image) {
            const img = document.createElement('img');
            img.src = recipe.image;
            img.alt = recipe.name;
            img.className = 'recipe-card-image';
            card.appendChild(img);
        }

        const content = document.createElement('div');
        content.className = 'recipe-card-content';

        const title = document.createElement('div');
        title.className = 'recipe-card-title';
        title.textContent = recipe.name;

        const author = document.createElement('div');
        author.className = 'recipe-card-author';
        author.textContent = `by ${recipe.author}`;

        content.appendChild(title);
        content.appendChild(author);

        // Add rating display
        const ratingDiv = document.createElement('div');
        ratingDiv.innerHTML = createCardRatingHTML(recipe.averageRating || 0, recipe.ratingCount || 0);
        content.appendChild(ratingDiv.firstChild);

        card.appendChild(content);

        randomRecipesGrid.appendChild(card);
    });
}

function selectLandingAutocompleteItem(recipe) {
    landingSearch.value = '';
    landingSearchClearBtn.classList.remove('visible');
    landingAutocompleteDropdown.classList.remove('active');
    selectedLandingAutocompleteIndex = -1;
    showRecipe(recipe.id);
}

function renderLandingAutocomplete(suggestions) {
    landingAutocompleteDropdown.innerHTML = '';

    if (suggestions.length === 0) {
        landingAutocompleteDropdown.classList.remove('active');
        return;
    }

    const displaySuggestions = suggestions.slice(0, 5);

    displaySuggestions.forEach((recipe, index) => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';

        if (index === selectedLandingAutocompleteIndex) {
            item.classList.add('selected');
        }

        const nameSpan = document.createElement('div');
        nameSpan.className = 'recipe-name';
        nameSpan.textContent = recipe.name;

        const authorSpan = document.createElement('div');
        authorSpan.className = 'recipe-author';
        authorSpan.textContent = `by ${recipe.author}`;

        item.appendChild(nameSpan);
        item.appendChild(authorSpan);

        item.addEventListener('click', () => {
            selectLandingAutocompleteItem(recipe);
        });

        landingAutocompleteDropdown.appendChild(item);
    });

    landingAutocompleteDropdown.classList.add('active');
}

// Authentication functions
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/user');
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            isAuthenticated = true;
            updateAuthUI();
            await loadRecipes();
        } else {
            isAuthenticated = false;
            currentUser = null;
            updateAuthUI();
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        isAuthenticated = false;
        updateAuthUI();
    }
}

function updateAuthUI() {
    if (isAuthenticated && currentUser) {
        loginBtn.classList.add('hidden');
        userDropdown.classList.remove('hidden');
        usernameDisplay.textContent = currentUser.username;
    } else {
        loginBtn.classList.remove('hidden');
        userDropdown.classList.add('hidden');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    loginError.textContent = '';

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.user;
            isAuthenticated = true;
            updateAuthUI();
            loginModal.classList.add('hidden');
            loginForm.reset();
            await loadRecipes();
        } else {
            loginError.textContent = data.error || 'Login failed';
        }
    } catch (error) {
        console.error('Login error:', error);
        loginError.textContent = 'An error occurred. Please try again.';
    }
}

async function handleSignup(e) {
    e.preventDefault();
    signupError.textContent = '';

    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.user;
            isAuthenticated = true;
            updateAuthUI();
            signupModal.classList.add('hidden');
            signupForm.reset();
            await loadRecipes();
        } else {
            signupError.textContent = data.error || 'Signup failed';
        }
    } catch (error) {
        console.error('Signup error:', error);
        signupError.textContent = 'An error occurred. Please try again.';
    }
}

async function handleLogout() {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST'
        });

        if (response.ok) {
            currentUser = null;
            isAuthenticated = false;
            recipes = [];
            currentRecipeId = null;
            searchQuery = '';
            searchInput.value = '';
            filteredRecipes = [];
            updateAuthUI();
            renderRecipeList();
            renderRandomRecipes();

            // Hide recipe display and show landing page
            recipeDisplay.classList.add('hidden');
            landingPage.style.display = 'block';
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
}

async function loadRecipes() {
    if (!isAuthenticated) {
        recipes = [];
        filteredRecipes = [];
        renderRecipeList();
        renderRandomRecipes();
        return;
    }

    try {
        const response = await fetch('/api/recipes');
        if (response.ok) {
            const data = await response.json();
            recipes = data.recipes;
            filteredRecipes = [];
            searchQuery = '';
            searchInput.value = '';
            renderRecipeList();
            renderRandomRecipes();
        }
    } catch (error) {
        console.error('Error loading recipes:', error);
    }
}

function showLoginModal() {
    loginModal.classList.remove('hidden');
    loginError.textContent = '';
}

function showSignupModal() {
    signupModal.classList.remove('hidden');
    signupError.textContent = '';
}

function switchToSignup() {
    loginModal.classList.add('hidden');
    loginForm.reset();
    loginError.textContent = '';
    showSignupModal();
}

function switchToLogin() {
    signupModal.classList.add('hidden');
    signupForm.reset();
    signupError.textContent = '';
    showLoginModal();
}

// Initialize
async function init() {
    filteredRecipes = [];
    renderRecipeList();
    renderRandomRecipes();
    setupEventListeners();
    setupRatingEventListeners();
    await checkAuthStatus();
}

// Render recipe list
function renderRecipeList() {
    recipeList.innerHTML = '';
    const currentRecipes = getCurrentRecipes();
    const recipesToShow = searchQuery.trim() === '' ? currentRecipes : filteredRecipes;

    if (recipesToShow.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No recipes found';
        li.style.textAlign = 'center';
        li.style.color = '#999';
        li.style.cursor = 'default';
        recipeList.appendChild(li);
        return;
    }

    recipesToShow.forEach(recipe => {
        const li = document.createElement('li');
        li.textContent = recipe.name;
        li.dataset.id = recipe.id;
        if (recipe.id === currentRecipeId) {
            li.classList.add('active');
        }
        li.addEventListener('click', () => showRecipe(recipe.id));
        recipeList.appendChild(li);
    });
}

// Show recipe details
function showRecipe(recipeId) {
    const currentRecipes = getCurrentRecipes();
    const recipe = currentRecipes.find(r => r.id === recipeId);
    if (!recipe) return;

    currentRecipeId = recipeId;

    // Initialize state for this recipe if it doesn't exist
    if (!recipeState[recipeId]) {
        recipeState[recipeId] = {
            ingredients: new Array(recipe.ingredients.length).fill(false),
            instructions: new Array(recipe.instructions.length).fill(false)
        };
    }

    document.getElementById('recipeTitle').textContent = recipe.name;
    document.getElementById('recipeAuthor').textContent = recipe.author;

    // Display source information
    const recipeSourceElement = document.getElementById('recipeSource');
    if (recipe.source) {
        if (recipe.source.type === 'youtube') {
            recipeSourceElement.innerHTML = 'Source: YouTube';
        } else if (recipe.source.type === 'cookbook') {
            recipeSourceElement.innerHTML = `Source: <a href="${recipe.source.amazonLink}" target="_blank" rel="noopener">${recipe.source.bookName}</a>`;
        } else if (recipe.source.type === 'manual') {
            recipeSourceElement.textContent = 'Source: Manually Entered';
        }
    } else {
        recipeSourceElement.textContent = '';
    }

    // Display image
    const recipeImage = document.getElementById('recipeImage');
    if (recipe.image) {
        recipeImage.src = recipe.image;
        recipeImage.classList.add('visible');
    } else {
        recipeImage.classList.remove('visible');
    }

    // Display YouTube video if source is YouTube
    const recipeVideo = document.getElementById('recipeVideo');
    if (recipe.source && recipe.source.type === 'youtube' && recipe.source.youtubeUrl) {
        const videoId = getYouTubeVideoId(recipe.source.youtubeUrl);
        if (videoId) {
            recipeVideo.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}" allowfullscreen></iframe>`;
            recipeVideo.classList.remove('hidden');
        } else {
            recipeVideo.classList.add('hidden');
        }
    } else {
        recipeVideo.innerHTML = '';
        recipeVideo.classList.add('hidden');
    }

    renderIngredients(recipe, recipeId);
    renderInstructions(recipe, recipeId);

    // Fetch and display rating
    fetchRatingData(recipeId).then(ratingData => {
        displayRecipeRating(ratingData.averageRating, ratingData.ratingCount, ratingData.userRating);
    });

    // Hide landing page and show recipe display
    landingPage.style.display = 'none';
    recipeDisplay.classList.remove('hidden');

    renderRecipeList();

    // Close sidebar on mobile when recipe is selected
    closeSidebar();
}

// Render ingredients with checkboxes
function renderIngredients(recipe, recipeId) {
    const ingredientsList = document.getElementById('ingredientsList');
    ingredientsList.innerHTML = '';

    recipe.ingredients.forEach((ingredient, index) => {
        const li = document.createElement('li');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = recipeState[recipeId].ingredients[index];
        checkbox.addEventListener('change', (e) => {
            recipeState[recipeId].ingredients[index] = e.target.checked;
            if (e.target.checked) {
                li.classList.add('checked');
            } else {
                li.classList.remove('checked');
            }
        });

        const span = document.createElement('span');
        span.textContent = ingredient;

        li.appendChild(checkbox);
        li.appendChild(span);

        if (recipeState[recipeId].ingredients[index]) {
            li.classList.add('checked');
        }

        // Allow clicking the entire row to toggle
        li.addEventListener('click', (e) => {
            if (e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event('change'));
            }
        });

        ingredientsList.appendChild(li);
    });
}

// Render instructions with checkboxes (sequential)
function renderInstructions(recipe, recipeId) {
    const instructionsList = document.getElementById('instructionsList');
    instructionsList.innerHTML = '';

    const state = recipeState[recipeId].instructions;
    const nextUncheckedIndex = state.findIndex(checked => !checked);

    recipe.instructions.forEach((instruction, index) => {
        const li = document.createElement('li');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = state[index];

        const span = document.createElement('span');
        span.textContent = instruction;

        // Determine if this checkbox should be enabled
        const canCheck = index === 0 || state[index - 1];

        if (!canCheck && !state[index]) {
            checkbox.disabled = true;
            li.classList.add('disabled');
        }

        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                state[index] = true;
                li.classList.add('checked');
                li.classList.remove('next-step');

                // Check if this was the last step
                if (index === recipe.instructions.length - 1) {
                    checkRecipeCompletion(recipeId);
                }
            } else {
                state[index] = false;
                li.classList.remove('checked');
            }
            // Re-render to update disabled states and next step highlighting
            renderInstructions(recipe, recipeId);
        });

        li.appendChild(checkbox);
        li.appendChild(span);

        if (state[index]) {
            li.classList.add('checked');
        }

        // Highlight the next step to complete
        if (index === nextUncheckedIndex) {
            li.classList.add('next-step');
        }

        // Allow clicking the entire row to toggle (if enabled)
        if (canCheck || state[index]) {
            li.addEventListener('click', (e) => {
                if (e.target !== checkbox && !checkbox.disabled) {
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change'));
                }
            });
        }

        instructionsList.appendChild(li);
    });
}

// Reset recipe progress
function resetRecipe() {
    if (!currentRecipeId) return;

    const currentRecipes = getCurrentRecipes();
    const recipe = currentRecipes.find(r => r.id === currentRecipeId);
    if (!recipe) return;

    // Reset all checkboxes to unchecked
    recipeState[currentRecipeId] = {
        ingredients: new Array(recipe.ingredients.length).fill(false),
        instructions: new Array(recipe.instructions.length).fill(false)
    };

    // Re-render the ingredients and instructions
    renderIngredients(recipe, currentRecipeId);
    renderInstructions(recipe, currentRecipeId);
}

// Return to home page
function goToHome(e) {
    e.preventDefault();

    // Hide recipe display and show landing page
    recipeDisplay.classList.add('hidden');
    landingPage.style.display = 'block';

    // Clear current recipe
    currentRecipeId = null;

    // Clear searches
    searchQuery = '';
    searchInput.value = '';
    searchClearBtn.classList.remove('visible');
    filteredRecipes = [];

    landingSearch.value = '';
    landingSearchClearBtn.classList.remove('visible');
    selectedLandingAutocompleteIndex = -1;
    landingAutocompleteDropdown.classList.remove('active');

    // Restore random recipes
    const randomRecipesSection = document.querySelector('.random-recipes-section');
    const heading = randomRecipesSection.querySelector('h2');
    heading.textContent = 'Try These Recipes';
    renderRandomRecipes();

    // Close mobile sidebar if open
    closeSidebar();
}

// Setup event listeners
function setupEventListeners() {
    // Site logo home link
    siteLogo.addEventListener('click', goToHome);

    // Mobile menu toggle
    menuToggleBtn.addEventListener('click', toggleSidebar);

    // Close sidebar when clicking overlay
    sidebarOverlay.addEventListener('click', closeSidebar);

    // Search functionality (sidebar)
    searchInput.addEventListener('input', handleSearchInput);
    searchInput.addEventListener('keydown', handleSearchKeydown);
    searchClearBtn.addEventListener('click', clearSearch);

    // Landing search functionality
    landingSearch.addEventListener('input', handleLandingSearchInput);
    landingSearch.addEventListener('keydown', handleLandingSearchKeydown);
    landingSearchClearBtn.addEventListener('click', clearLandingSearch);

    // Close autocomplete when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !autocompleteDropdown.contains(e.target)) {
            autocompleteDropdown.classList.remove('active');
            selectedAutocompleteIndex = -1;
        }
        if (!landingSearch.contains(e.target) && !landingAutocompleteDropdown.contains(e.target)) {
            landingAutocompleteDropdown.classList.remove('active');
        }
    });

    addRecipeBtn.addEventListener('click', () => {
        if (!isAuthenticated) {
            showLoginModal();
            return;
        }
        addRecipeModal.classList.remove('hidden');
    });

    resetBtn.addEventListener('click', resetRecipe);

    cancelBtn.addEventListener('click', () => {
        addRecipeModal.classList.add('hidden');
        addRecipeForm.reset();
        hideAllConditionalFields();
    });

    addRecipeModal.addEventListener('click', (e) => {
        if (e.target === addRecipeModal) {
            addRecipeModal.classList.add('hidden');
            addRecipeForm.reset();
            hideAllConditionalFields();
        }
    });

    // Handle source dropdown change
    const sourceDropdown = document.getElementById('recipeSource');
    sourceDropdown.addEventListener('change', (e) => {
        const sourceType = e.target.value;
        hideAllConditionalFields();

        if (sourceType === 'youtube') {
            document.getElementById('youtubeFields').classList.remove('hidden');
            document.getElementById('youtubeUrl').required = true;
        } else if (sourceType === 'cookbook') {
            document.getElementById('cookbookFields').classList.remove('hidden');
            document.getElementById('bookName').required = true;
            document.getElementById('amazonLink').required = true;
        }
    });

    addRecipeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addNewRecipe();
    });

    // Authentication event listeners
    loginBtn.addEventListener('click', showLoginModal);
    logoutBtn.addEventListener('click', handleLogout);
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);

    cancelLoginBtn.addEventListener('click', () => {
        loginModal.classList.add('hidden');
        loginForm.reset();
        loginError.textContent = '';
    });

    cancelSignupBtn.addEventListener('click', () => {
        signupModal.classList.add('hidden');
        signupForm.reset();
        signupError.textContent = '';
    });

    showSignupBtn.addEventListener('click', switchToSignup);
    showLoginBtn.addEventListener('click', switchToLogin);

    // Close modals when clicking outside
    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.classList.add('hidden');
            loginForm.reset();
            loginError.textContent = '';
        }
    });

    signupModal.addEventListener('click', (e) => {
        if (e.target === signupModal) {
            signupModal.classList.add('hidden');
            signupForm.reset();
            signupError.textContent = '';
        }
    });
}

// Helper to hide all conditional fields
function hideAllConditionalFields() {
    document.getElementById('youtubeFields').classList.add('hidden');
    document.getElementById('cookbookFields').classList.add('hidden');
    document.getElementById('youtubeUrl').required = false;
    document.getElementById('bookName').required = false;
    document.getElementById('amazonLink').required = false;
}

// Add new recipe
async function addNewRecipe() {
    if (!isAuthenticated) {
        alert('Please login to add recipes');
        return;
    }

    const name = document.getElementById('recipeName').value;
    const author = document.getElementById('recipeAuthor').value;
    const imageUrl = document.getElementById('recipeImageUrl').value;
    const sourceType = document.getElementById('recipeSource').value;
    const ingredientsText = document.getElementById('recipeIngredients').value;
    const instructionsText = document.getElementById('recipeInstructions').value;

    const ingredients = ingredientsText
        .split('\n')
        .map(i => i.trim())
        .filter(i => i.length > 0);

    const instructions = instructionsText
        .split('\n')
        .map(i => i.trim())
        .filter(i => i.length > 0);

    // Build source object based on type
    let source = { type: sourceType };
    if (sourceType === 'youtube') {
        source.youtubeUrl = document.getElementById('youtubeUrl').value;
    } else if (sourceType === 'cookbook') {
        source.bookName = document.getElementById('bookName').value;
        source.amazonLink = document.getElementById('amazonLink').value;
    }

    const recipeData = {
        name: name,
        author: author,
        image: imageUrl || null,
        source: source,
        ingredients: ingredients,
        instructions: instructions
    };

    try {
        const response = await fetch('/api/recipes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(recipeData)
        });

        const data = await response.json();

        if (response.ok) {
            // Add the new recipe to local array
            recipes.push(data.recipe);

            // Clear search and update filtered list
            searchInput.value = '';
            searchQuery = '';
            filteredRecipes = [];
            searchClearBtn.classList.remove('visible');

            renderRecipeList();
            renderRandomRecipes();
            showRecipe(data.recipe.id);

            addRecipeModal.classList.add('hidden');
            addRecipeForm.reset();
            hideAllConditionalFields();
        } else {
            alert(data.error || 'Failed to add recipe');
        }
    } catch (error) {
        console.error('Error adding recipe:', error);
        alert('An error occurred while adding the recipe');
    }
}

// ===========================================
// RATING FUNCTIONS
// ===========================================

// Render star icons for display (read-only)
function renderStarsDisplay(container, rating, count) {
    container.innerHTML = '';
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.className = 'star';
        star.textContent = '★';
        if (i <= fullStars) {
            star.classList.add('filled');
        } else if (i === fullStars + 1 && hasHalf) {
            star.classList.add('half-filled');
        }
        container.appendChild(star);
    }
}

// Create stars HTML for recipe cards
function createCardRatingHTML(averageRating, ratingCount) {
    if (!ratingCount || ratingCount === 0) {
        return '<div class="recipe-card-rating"><span class="rating-count">No ratings yet</span></div>';
    }

    let starsHTML = '<div class="stars">';
    const fullStars = Math.floor(averageRating);

    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            starsHTML += '<span class="star filled">★</span>';
        } else {
            starsHTML += '<span class="star">★</span>';
        }
    }
    starsHTML += '</div>';

    return `<div class="recipe-card-rating">${starsHTML}<span class="rating-count">${averageRating} (${ratingCount})</span></div>`;
}

// Fetch rating data for a recipe
async function fetchRatingData(recipeId) {
    try {
        const response = await fetch(`/api/recipes/${recipeId}/rating`);
        if (response.ok) {
            const data = await response.json();
            userRatings[recipeId] = data.hasRated;
            return data;
        }
    } catch (error) {
        console.error('Error fetching rating:', error);
    }
    return { averageRating: 0, ratingCount: 0, userRating: null, hasRated: false };
}

// Display rating in recipe detail view
function displayRecipeRating(averageRating, ratingCount, userRating) {
    renderStarsDisplay(recipeStars, averageRating, ratingCount);

    if (ratingCount === 0) {
        ratingText.textContent = 'No ratings yet';
    } else {
        let text = `${averageRating} out of 5 (${ratingCount} ${ratingCount === 1 ? 'rating' : 'ratings'})`;
        if (userRating) {
            text += ` • Your rating: ${userRating}★`;
        }
        ratingText.textContent = text;
    }
}

// Show rating modal
function showRatingModal(recipeId) {
    currentRatingRecipeId = recipeId;
    selectedRating = 0;

    // Reset star states
    const stars = starRatingInput.querySelectorAll('.star');
    stars.forEach(star => {
        star.classList.remove('selected', 'hovered');
    });

    selectedRatingText.textContent = 'Select a rating';
    submitRatingBtn.disabled = true;
    ratingModal.classList.remove('hidden');
}

// Hide rating modal
function hideRatingModal() {
    ratingModal.classList.add('hidden');
    currentRatingRecipeId = null;
    selectedRating = 0;
}

// Submit rating
async function submitRating() {
    if (!currentRatingRecipeId || selectedRating === 0) return;

    try {
        const response = await fetch(`/api/recipes/${currentRatingRecipeId}/rating`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ rating: selectedRating })
        });

        const data = await response.json();

        if (response.ok) {
            // Update local tracking
            userRatings[currentRatingRecipeId] = true;

            // Update display
            displayRecipeRating(data.averageRating, data.ratingCount, data.userRating);

            // Update recipe in local array if exists
            const recipeIndex = recipes.findIndex(r => r.id === currentRatingRecipeId);
            if (recipeIndex !== -1) {
                recipes[recipeIndex].averageRating = data.averageRating;
                recipes[recipeIndex].ratingCount = data.ratingCount;
            }

            hideRatingModal();
        } else {
            alert(data.error || 'Failed to submit rating');
        }
    } catch (error) {
        console.error('Error submitting rating:', error);
        alert('An error occurred while submitting your rating');
    }
}

// Get rating label based on number
function getRatingLabel(rating) {
    const labels = {
        1: 'Poor',
        2: 'Fair',
        3: 'Good',
        4: 'Very Good',
        5: 'Excellent'
    };
    return labels[rating] || '';
}

// Setup rating event listeners
function setupRatingEventListeners() {
    const stars = starRatingInput.querySelectorAll('.star');

    stars.forEach(star => {
        // Hover effects
        star.addEventListener('mouseenter', () => {
            const rating = parseInt(star.dataset.rating);
            stars.forEach(s => {
                if (parseInt(s.dataset.rating) <= rating) {
                    s.classList.add('hovered');
                } else {
                    s.classList.remove('hovered');
                }
            });
            selectedRatingText.textContent = getRatingLabel(rating);
        });

        star.addEventListener('mouseleave', () => {
            stars.forEach(s => s.classList.remove('hovered'));
            if (selectedRating > 0) {
                selectedRatingText.textContent = getRatingLabel(selectedRating);
            } else {
                selectedRatingText.textContent = 'Select a rating';
            }
        });

        // Click to select
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.dataset.rating);
            stars.forEach(s => {
                if (parseInt(s.dataset.rating) <= selectedRating) {
                    s.classList.add('selected');
                } else {
                    s.classList.remove('selected');
                }
            });
            selectedRatingText.textContent = getRatingLabel(selectedRating);
            submitRatingBtn.disabled = false;
        });
    });

    // Submit button
    submitRatingBtn.addEventListener('click', submitRating);

    // Cancel button
    cancelRatingBtn.addEventListener('click', hideRatingModal);

    // Close on background click
    ratingModal.addEventListener('click', (e) => {
        if (e.target === ratingModal) {
            hideRatingModal();
        }
    });
}

// Check if all instructions are complete and trigger rating modal if needed
function checkRecipeCompletion(recipeId) {
    if (!isAuthenticated) return;

    const state = recipeState[recipeId];
    if (!state) return;

    // Check if all instructions are checked
    const allComplete = state.instructions.every(checked => checked);

    if (allComplete && !userRatings[recipeId]) {
        // Show rating modal after a brief delay
        setTimeout(() => {
            showRatingModal(recipeId);
        }, 500);
    }
}

// Start the app
init();
