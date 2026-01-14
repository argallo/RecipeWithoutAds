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

// All recipes from database (for home page search)
let allRecipes = [];

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

// Folder DOM elements
const addToFolderBtn = document.getElementById('addToFolderBtn');
const addToFolderModal = document.getElementById('addToFolderModal');
const folderCheckboxList = document.getElementById('folderCheckboxList');
const saveFoldersBtn = document.getElementById('saveFoldersBtn');
const cancelFoldersBtn = document.getElementById('cancelFoldersBtn');
const createFolderModal = document.getElementById('createFolderModal');
const createFolderForm = document.getElementById('createFolderForm');
const folderNameInput = document.getElementById('folderName');
const folderError = document.getElementById('folderError');
const cancelCreateFolderBtn = document.getElementById('cancelCreateFolderBtn');

// Collaboration DOM elements
const collaboratorsModal = document.getElementById('collaboratorsModal');
const collaboratorsModalTitle = document.getElementById('collaboratorsModalTitle');
const folderOwner = document.getElementById('folderOwner');
const collaboratorsList = document.getElementById('collaboratorsList');
const collaboratorCount = document.getElementById('collaboratorCount');
const inviteCollaboratorForm = document.getElementById('inviteCollaboratorForm');
const collaboratorEmail = document.getElementById('collaboratorEmail');
const inviteError = document.getElementById('inviteError');
const inviteSuccess = document.getElementById('inviteSuccess');
const closeCollaboratorsBtn = document.getElementById('closeCollaboratorsBtn');
const invitationsBanner = document.getElementById('invitationsBanner');
const invitationsText = document.getElementById('invitationsText');
const viewInvitationsBtn = document.getElementById('viewInvitationsBtn');
const dismissBannerBtn = document.getElementById('dismissBannerBtn');
const invitationsModal = document.getElementById('invitationsModal');
const invitationsList = document.getElementById('invitationsList');
const closeInvitationsBtn = document.getElementById('closeInvitationsBtn');

// User Settings DOM elements
const userSettingsPage = document.getElementById('userSettingsPage');
const settingsUsername = document.getElementById('settingsUsername');
const settingsEmail = document.getElementById('settingsEmail');
const userAvatar = document.getElementById('userAvatar');
const changePasswordForm = document.getElementById('changePasswordForm');
const currentPasswordInput = document.getElementById('currentPassword');
const newPasswordInput = document.getElementById('newPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');
const passwordError = document.getElementById('passwordError');
const passwordSuccess = document.getElementById('passwordSuccess');
const contributionGraph = document.getElementById('contributionGraph');
const contributionMonths = document.getElementById('contributionMonths');
const totalCookedEl = document.getElementById('totalCooked');
const currentStreakEl = document.getElementById('currentStreak');
const longestStreakEl = document.getElementById('longestStreak');

// Authentication state
let currentUser = null;
let isAuthenticated = false;
let isSigningUp = false; // Flag to prevent race condition during signup

// Firebase Auth reference
const auth = firebase.auth();

// Folder state
let folders = [];
let currentFolderId = null;
let currentFolderName = '';

// Collaboration state
let currentCollabFolderId = null;

// Guest history (localStorage)
let localHistory = [];
const HISTORY_KEY = 'recipe_history';
const MAX_HISTORY = 20;

// ============================================
// CLIENT-SIDE CACHE (Stale-While-Revalidate)
// ============================================
const CACHE_KEY = 'recipe_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const dataCache = {
    recipes: null,
    folders: null,
    folderRecipes: {}, // keyed by folderId
    lastFetch: {}
};

function getCachedData(key) {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;
        const data = JSON.parse(cached);
        return data[key] || null;
    } catch (e) {
        return null;
    }
}

function setCachedData(key, value) {
    try {
        const cached = localStorage.getItem(CACHE_KEY) || '{}';
        const data = JSON.parse(cached);
        data[key] = { value, timestamp: Date.now() };
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Cache write error:', e);
    }
}

function isCacheValid(key) {
    const cached = getCachedData(key);
    if (!cached) return false;
    return (Date.now() - cached.timestamp) < CACHE_DURATION;
}

function clearCache() {
    localStorage.removeItem(CACHE_KEY);
    dataCache.recipes = null;
    dataCache.folders = null;
    dataCache.folderRecipes = {};
}

function invalidateFolderCache(folderId) {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return;
        const data = JSON.parse(cached);
        delete data[`folder_${folderId}`];
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Cache invalidation error:', e);
    }
}

function invalidateFoldersListCache() {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return;
        const data = JSON.parse(cached);
        delete data['folders'];
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Cache invalidation error:', e);
    }
}

// Reload just the folders list (with counts) without changing current view
async function reloadFoldersList() {
    try {
        const response = await apiFetch('/api/folders');
        if (response.ok) {
            const data = await response.json();
            folders = data.folders;
            setCachedData('folders', folders);
            renderRecipeList();
        }
    } catch (error) {
        console.error('Error reloading folders:', error);
    }
}

// ============================================
// LOADING STATES
// ============================================
let isLoadingFolders = false;
let isLoadingRecipes = false;

function showFolderSkeletons() {
    recipeList.innerHTML = `
        <div class="skeleton-loader">
            <div class="skeleton skeleton-btn"></div>
            <div class="skeleton skeleton-folder"></div>
            <div class="skeleton skeleton-folder"></div>
            <div class="skeleton skeleton-folder"></div>
        </div>
    `;
}

function showRecipeSkeletons() {
    randomRecipesGrid.innerHTML = `
        <div class="recipe-card skeleton-card">
            <div class="skeleton skeleton-image"></div>
            <div class="skeleton-content">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text"></div>
            </div>
        </div>
        <div class="recipe-card skeleton-card">
            <div class="skeleton skeleton-image"></div>
            <div class="skeleton-content">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text"></div>
            </div>
        </div>
        <div class="recipe-card skeleton-card">
            <div class="skeleton skeleton-image"></div>
            <div class="skeleton-content">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text"></div>
            </div>
        </div>
    `;
}

// API fetch helper - includes Firebase ID token for authentication
async function apiFetch(url, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    // Add Firebase ID token if user is authenticated
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
        try {
            const idToken = await firebaseUser.getIdToken();
            headers['Authorization'] = `Bearer ${idToken}`;
        } catch (error) {
            console.error('Error getting ID token:', error);
        }
    }

    return fetch(url, { ...options, headers });
}

// localStorage history helper functions
function getLocalHistory() {
    try {
        const stored = localStorage.getItem(HISTORY_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error reading history from localStorage:', error);
        return [];
    }
}

function addToLocalHistory(recipeId) {
    try {
        let history = getLocalHistory();

        // Remove if already exists to move to front
        history = history.filter(id => id !== recipeId);

        // Add to front
        history.unshift(recipeId);

        // Keep only max 20
        if (history.length > MAX_HISTORY) {
            history = history.slice(0, MAX_HISTORY);
        }

        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        localHistory = history;
    } catch (error) {
        console.error('Error saving history to localStorage:', error);
    }
}

function clearLocalHistory() {
    try {
        localStorage.removeItem(HISTORY_KEY);
        localHistory = [];
    } catch (error) {
        console.error('Error clearing history from localStorage:', error);
    }
}

// Get current recipes based on authentication status
// If useAllRecipes is true, returns all recipes from database for searching
function getCurrentRecipes(useAllRecipes = false) {
    // If requesting all recipes for search
    if (useAllRecipes && isAuthenticated && allRecipes.length > 0) {
        return allRecipes;
    }
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

// ============================================
// ROUTING FUNCTIONS
// ============================================

// Generate URL slug from recipe name
function generateSlug(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with dashes
        .replace(/^-+|-+$/g, '');      // Remove leading/trailing dashes
}

// Get recipe URL path
function getRecipeUrl(recipe) {
    const slug = generateSlug(recipe.name);
    return `/recipe/${slug}-${recipe.id}`;
}

// Extract recipe ID from URL path
function extractRecipeId(path) {
    // Match pattern: /recipe/{slug}-{id} where id can be alphanumeric (Firestore IDs)
    const match = path.match(/\/recipe\/.*-([a-zA-Z0-9]+)$/);
    return match ? match[1] : null;
}

// Navigate to a route and update browser history
function navigateTo(path, state = {}, replaceState = false) {
    if (replaceState) {
        window.history.replaceState(state, '', path);
    } else {
        window.history.pushState(state, '', path);
    }
    handleRoute(path);
}

// Handle route changes
async function handleRoute(path) {
    // Parse the path
    const pathParts = path.split('/').filter(p => p);

    if (pathParts.length === 0 || pathParts[0] === 'home') {
        // Home page
        showHomePage();
    } else if (pathParts[0] === 'settings') {
        // Settings page
        if (isAuthenticated) {
            showUserSettingsPage();
        } else {
            navigateTo('/home', {}, true);
        }
    } else if (pathParts[0] === 'recipe') {
        // Recipe page - extract ID from slug
        const recipeId = extractRecipeId(path);
        if (recipeId) {
            await showRecipeById(recipeId, false); // false = don't push state again
        } else {
            // Invalid recipe URL, redirect to home
            navigateTo('/home', {}, true);
        }
    } else {
        // Unknown route, redirect to home
        navigateTo('/home', {}, true);
    }
}

// Show home page without changing URL
function showHomePage() {
    // Hide other views and show landing page
    recipeDisplay.classList.add('hidden');
    userSettingsPage.classList.add('hidden');
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
    if (randomRecipesSection) {
        const heading = randomRecipesSection.querySelector('h2');
        heading.textContent = 'Try These Recipes';
        renderRandomRecipes();
    }

    // Update recipe list highlighting
    renderRecipeList();

    // Close mobile sidebar if open
    closeSidebar();
}

// Show recipe by ID without changing URL (for popstate)
async function showRecipeById(recipeId, pushState = true) {
    // First try to find in current recipes, then in all recipes
    let recipe = getCurrentRecipes().find(r => r.id === recipeId);
    if (!recipe) {
        recipe = getCurrentRecipes(true).find(r => r.id === recipeId);
    }

    // If not found locally, fetch from API (for shared links)
    if (!recipe) {
        try {
            const response = await fetch(`/api/recipes/${recipeId}`);
            if (response.ok) {
                const data = await response.json();
                recipe = data.recipe;
                // Transform the recipe data to match expected format
                if (recipe.source_data) {
                    recipe.source = recipe.source_data;
                }
            }
        } catch (error) {
            console.error('Error fetching recipe:', error);
        }
    }

    if (!recipe) {
        console.error('Recipe not found:', recipeId);
        navigateTo('/home', {}, true);
        return;
    }

    if (pushState) {
        const recipeUrl = getRecipeUrl(recipe);
        navigateTo(recipeUrl, { recipeId });
    }

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

    // Hide other views and show recipe display
    landingPage.style.display = 'none';
    userSettingsPage.classList.add('hidden');
    recipeDisplay.classList.remove('hidden');

    renderRecipeList();

    // Close sidebar on mobile when recipe is selected
    closeSidebar();

    // Track in history
    addToHistory(recipe);

    // Show "Add to Folder" button for authenticated users
    if (isAuthenticated) {
        addToFolderBtn.classList.remove('hidden');
    } else {
        addToFolderBtn.classList.add('hidden');
    }
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

// Folder Management Functions

async function loadFolders() {
    const cachedFolders = getCachedData('folders');
    const cachedRecipes = getCachedData('recipes');
    const foldersValid = isCacheValid('folders');
    const recipesValid = isCacheValid('recipes');

    // If all cache is valid, use it and don't fetch
    if (cachedFolders?.value && cachedRecipes?.value && foldersValid && recipesValid) {
        folders = cachedFolders.value;
        allRecipes = cachedRecipes.value;

        const historyFolder = folders.find(f => f.name === 'History' && f.is_system);
        if (historyFolder) {
            // This will use cache and not fetch since cache is valid
            await showFolder(historyFolder.id, 'History');
        } else {
            renderRecipeList();
        }
        renderRandomRecipes();
        return;
    }

    // Show loading state only if no cached data
    if (isAuthenticated && !cachedFolders?.value) {
        showFolderSkeletons();
        showRecipeSkeletons();
    }

    // Show stale cached data while fetching (if available)
    if (cachedFolders?.value && cachedRecipes?.value) {
        folders = cachedFolders.value;
        allRecipes = cachedRecipes.value;

        const historyFolder = folders.find(f => f.name === 'History' && f.is_system);
        if (historyFolder) {
            const cachedHistoryRecipes = getCachedData(`folder_${historyFolder.id}`);
            if (cachedHistoryRecipes?.value) {
                recipes = cachedHistoryRecipes.value;
                currentFolderId = historyFolder.id;
                currentFolderName = 'History';
                renderRecipeList();
                renderRandomRecipes();
            }
        }
    }

    // Fetch fresh data
    try {
        const [recipesResponse, foldersResponse] = await Promise.all([
            apiFetch('/api/recipes'),
            apiFetch('/api/folders')
        ]);

        if (recipesResponse.ok) {
            const recipesData = await recipesResponse.json();
            allRecipes = recipesData.recipes;
            setCachedData('recipes', allRecipes);
        }

        if (foldersResponse.ok) {
            const data = await foldersResponse.json();
            folders = data.folders;
            setCachedData('folders', folders);

            // Find History folder and load its recipes
            const historyFolder = folders.find(f => f.name === 'History' && f.is_system);
            if (historyFolder) {
                await showFolder(historyFolder.id, 'History', true);
            } else {
                renderRecipeList();
                renderRandomRecipes();
            }
        }
    } catch (error) {
        console.error('Error loading folders:', error);
        // If we have cached data, keep showing it
        if (!cachedFolders?.value) {
            renderRecipeList();
        }
    }
}

async function showFolder(folderId, folderName, forceRefresh = false) {
    const cacheKey = `folder_${folderId}`;
    const cachedFolderRecipes = getCachedData(cacheKey);
    const cacheIsValid = isCacheValid(cacheKey);

    // If clicking on the same folder and cache is valid, just re-render (no fetch)
    if (currentFolderId === folderId && cacheIsValid && !forceRefresh) {
        renderRecipeList();
        return;
    }

    currentFolderId = folderId;
    currentFolderName = folderName;

    // Show cached data immediately if available
    if (cachedFolderRecipes?.value) {
        recipes = cachedFolderRecipes.value;
        renderRecipeList();

        // If cache is still valid, don't fetch
        if (cacheIsValid && !forceRefresh) {
            return;
        }
    }

    // Fetch fresh data (only if cache is stale/missing or force refresh)
    const fetchPromise = apiFetch(`/api/folders/${folderId}/recipes`).then(async response => {
        if (response.ok) {
            const data = await response.json();
            recipes = data.recipes;
            setCachedData(cacheKey, recipes);

            // Only re-render if we're still on this folder
            if (currentFolderId === folderId) {
                renderRecipeList();
            }
        }
    }).catch(error => {
        console.error('Error loading folder recipes:', error);
    });

    // If no cache, wait for the fetch
    if (!cachedFolderRecipes?.value) {
        await fetchPromise;
    }
}

async function createFolder(name) {
    // Optimistic UI: Add folder immediately with temp ID
    const tempFolder = {
        id: `temp_${Date.now()}`,
        name: name,
        is_system: false,
        recipe_count: 0,
        is_owner: 1
    };
    folders.push(tempFolder);
    renderRecipeList();

    try {
        const response = await apiFetch('/api/folders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name })
        });

        const data = await response.json();

        if (response.ok) {
            // Replace temp folder with real one
            const tempIndex = folders.findIndex(f => f.id === tempFolder.id);
            if (tempIndex !== -1) {
                folders[tempIndex] = { ...data.folder, recipe_count: 0, is_owner: 1 };
            }
            setCachedData('folders', folders);
            renderRecipeList();
            return true;
        } else {
            // Rollback on failure
            folders = folders.filter(f => f.id !== tempFolder.id);
            renderRecipeList();
            alert(data.error || 'Error creating folder');
            return false;
        }
    } catch (error) {
        // Rollback on error
        folders = folders.filter(f => f.id !== tempFolder.id);
        renderRecipeList();
        console.error('Error creating folder:', error);
        alert('Error creating folder');
        return false;
    }
}

async function deleteFolder(folderId) {
    if (!confirm('Are you sure you want to delete this folder? All recipes will remain, but this folder will be removed.')) {
        return;
    }

    try {
        const response = await apiFetch(`/api/folders/${folderId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            folders = folders.filter(f => f.id !== folderId);

            // If current folder was deleted, switch to History
            if (currentFolderId === folderId) {
                const historyFolder = folders.find(f => f.name === 'History');
                if (historyFolder) {
                    showFolder(historyFolder.id, 'History');
                } else {
                    currentFolderId = null;
                    renderRecipeList();
                }
            } else {
                renderRecipeList();
            }
        } else {
            const data = await response.json();
            alert(data.error || 'Error deleting folder');
        }
    } catch (error) {
        console.error('Error deleting folder:', error);
        alert('Error deleting folder');
    }
}

async function handleAddToFolder(folderId) {
    if (!currentRecipeId) return;

    try {
        const response = await apiFetch(`/api/folders/${folderId}/recipes`, {
            method: 'POST',
            body: JSON.stringify({ recipeId: String(currentRecipeId) })
        });

        if (response.ok) {
            // Invalidate caches
            invalidateFolderCache(folderId);
            invalidateFoldersListCache();

            // Reload folders to get accurate counts
            await reloadFoldersList();

            // If currently viewing this folder, refresh it
            if (currentFolderId === folderId) {
                const folder = folders.find(f => f.id === folderId);
                const folderName = folder ? folder.name : '';
                showFolder(folderId, folderName, true);
            }

            return true;
        } else {
            const data = await response.json();
            console.error('Error adding to folder:', data.error);
            return false;
        }
    } catch (error) {
        console.error('Error adding to folder:', error);
        return false;
    }
}

async function removeFromFolder(folderId, recipeId) {
    try {
        const response = await apiFetch(`/api/folders/${folderId}/recipes/${recipeId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Invalidate caches
            invalidateFolderCache(folderId);
            invalidateFoldersListCache();

            // Reload folders to get accurate counts
            await reloadFoldersList();

            // If currently viewing this folder, refresh
            if (currentFolderId === folderId) {
                showFolder(folderId, currentFolderName, true);
            }
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error removing from folder:', error);
        return false;
    }
}

async function addToHistory(recipe) {
    if (!isAuthenticated) {
        addToLocalHistory(recipe.id);
        return;
    }

    // Find History folder
    const historyFolder = folders.find(f => f.name === 'History' && f.is_system);
    if (!historyFolder) {
        console.error('History folder not found');
        return;
    }

    // Silently add to history folder
    try {
        const response = await apiFetch(`/api/folders/${historyFolder.id}/recipes`, {
            method: 'POST',
            body: JSON.stringify({ recipeId: String(recipe.id) })
        });

        if (response.ok) {
            const data = await response.json();

            // Only refresh if recipe was actually added (not already in folder)
            if (!data.message || !data.message.includes('already')) {
                // Invalidate caches
                invalidateFolderCache(historyFolder.id);
                invalidateFoldersListCache();

                // Reload folders to get accurate counts
                await reloadFoldersList();

                // If currently viewing History, refresh it
                if (currentFolderId === historyFolder.id) {
                    showFolder(historyFolder.id, 'History', true);
                }
            }
        }
    } catch (error) {
        console.error('Error adding to history:', error);
    }
}

async function syncHistoryToBackend() {
    const history = getLocalHistory();
    if (history.length === 0) {
        return;
    }

    try {
        // Ensure all IDs are strings
        const stringIds = history.map(id => String(id)).filter(id => id && id !== 'undefined');
        if (stringIds.length === 0) {
            return;
        }

        const response = await apiFetch('/api/history/transfer', {
            method: 'POST',
            body: JSON.stringify({ recipeIds: stringIds })
        });

        if (response.ok) {
            clearLocalHistory();
        }
    } catch (error) {
        console.error('Error syncing history to backend:', error);
    }
}

// ============================================
// COLLABORATION FUNCTIONS
// ============================================

// Show collaborators modal
async function showCollaboratorsModal(folderId, folderName) {
    currentCollabFolderId = folderId;
    collaboratorsModalTitle.textContent = `Manage Collaborators - ${folderName}`;
    inviteError.textContent = '';
    inviteSuccess.textContent = '';
    collaboratorEmail.value = '';

    await loadCollaborators(folderId);
    collaboratorsModal.classList.remove('hidden');
}

// Load collaborators for a folder
async function loadCollaborators(folderId) {
    try {
        const response = await apiFetch(`/api/folders/${folderId}/collaborators`);
        if (response.ok) {
            const data = await response.json();

            // Display owner
            folderOwner.innerHTML = `
                <div class="collaborator-info">
                    <span class="collaborator-name">${data.owner.username}</span>
                    <span class="collaborator-email">${data.owner.email}</span>
                </div>
                <span class="collaborator-role">Owner</span>
            `;

            // Display collaborators
            const collabs = data.collaborators || [];
            collaboratorCount.textContent = `(${collabs.length}/5)`;

            if (collabs.length === 0) {
                collaboratorsList.innerHTML = '<p class="no-collaborators">No collaborators yet</p>';
            } else {
                collaboratorsList.innerHTML = '';
                collabs.forEach(collab => {
                    const collabItem = document.createElement('div');
                    collabItem.className = 'collaborator-item';
                    collabItem.innerHTML = `
                        <div class="collaborator-info">
                            <span class="collaborator-name">${collab.username}</span>
                            <span class="collaborator-email">${collab.email}</span>
                        </div>
                        <button class="remove-collab-btn" data-user-id="${collab.id}" title="Remove collaborator">&times;</button>
                    `;

                    // Add remove handler
                    const removeBtn = collabItem.querySelector('.remove-collab-btn');
                    removeBtn.addEventListener('click', () => removeCollaborator(folderId, collab.id));

                    collaboratorsList.appendChild(collabItem);
                });
            }
        }
    } catch (error) {
        console.error('Error loading collaborators:', error);
    }
}

// Invite a collaborator
async function inviteCollaborator(e) {
    e.preventDefault();
    inviteError.textContent = '';
    inviteSuccess.textContent = '';

    const email = collaboratorEmail.value.trim();
    if (!email) return;

    try {
        const response = await apiFetch(`/api/folders/${currentCollabFolderId}/invite`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
            inviteSuccess.textContent = `Invitation sent to ${email}!`;
            collaboratorEmail.value = '';

            // Show invite URL in console for development
            if (data.inviteUrl) {
                console.log('Invitation URL:', data.inviteUrl);
            }
        } else {
            inviteError.textContent = data.error || 'Error sending invitation';
        }
    } catch (error) {
        console.error('Error inviting collaborator:', error);
        inviteError.textContent = 'Error sending invitation';
    }
}

// Remove a collaborator
async function removeCollaborator(folderId, userId) {
    if (!confirm('Are you sure you want to remove this collaborator?')) {
        return;
    }

    try {
        const response = await apiFetch(`/api/folders/${folderId}/collaborators/${userId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            await loadCollaborators(folderId);
        } else {
            const data = await response.json();
            alert(data.error || 'Error removing collaborator');
        }
    } catch (error) {
        console.error('Error removing collaborator:', error);
        alert('Error removing collaborator');
    }
}

// Check for pending invitations
async function checkPendingInvitations() {
    if (!isAuthenticated) return;

    try {
        const response = await apiFetch('/api/invitations/pending');
        if (response.ok) {
            const data = await response.json();
            if (data.invitations && data.invitations.length > 0) {
                const count = data.invitations.length;
                invitationsText.textContent = `You have ${count} pending folder invitation${count > 1 ? 's' : ''}`;
                invitationsBanner.classList.remove('hidden');
            }
        }
    } catch (error) {
        console.error('Error checking invitations:', error);
    }
}

// Show invitations modal
async function showInvitationsModal() {
    try {
        const response = await apiFetch('/api/invitations/pending');
        if (response.ok) {
            const data = await response.json();

            if (data.invitations && data.invitations.length > 0) {
                invitationsList.innerHTML = '';
                data.invitations.forEach(inv => {
                    const invItem = document.createElement('div');
                    invItem.className = 'invitation-item';
                    invItem.innerHTML = `
                        <div class="invitation-info">
                            <strong>${inv.folder_name}</strong>
                            <span>Invited by ${inv.invited_by}</span>
                            <span class="invitation-date">${new Date(inv.created_at).toLocaleDateString()}</span>
                        </div>
                        <button class="btn-primary accept-invite-btn" data-token="${inv.token}">Accept</button>
                    `;

                    const acceptBtn = invItem.querySelector('.accept-invite-btn');
                    acceptBtn.addEventListener('click', () => acceptInvitation(inv.token));

                    invitationsList.appendChild(invItem);
                });
            } else {
                invitationsList.innerHTML = '<p class="no-invitations">No pending invitations</p>';
            }

            invitationsModal.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error loading invitations:', error);
    }
}

// Accept an invitation
async function acceptInvitation(token) {
    try {
        const response = await apiFetch(`/api/invitations/${token}/accept`, {
            method: 'POST'
        });

        if (response.ok) {
            const data = await response.json();
            invitationsModal.classList.add('hidden');
            invitationsBanner.classList.add('hidden');

            // Reload folders to show the new shared folder
            await loadFolders();

            alert('Invitation accepted! The folder is now in your sidebar.');
        } else {
            const data = await response.json();
            alert(data.error || 'Error accepting invitation');
        }
    } catch (error) {
        console.error('Error accepting invitation:', error);
        alert('Error accepting invitation');
    }
}

// Handle invitation from URL parameter
async function handleInvitationFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteToken = urlParams.get('invite');

    if (inviteToken) {
        if (isAuthenticated) {
            // User is logged in, accept invitation
            await acceptInvitation(inviteToken);
            // Remove invite parameter from URL
            window.history.replaceState({}, '', '/home');
        } else {
            // User not logged in, show login modal with message
            alert('Please log in or sign up to accept this folder invitation');
            showLoginModal();
        }
    }
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

// Search and filter ALL recipes (for landing page search)
function filterAllRecipes(query) {
    const allRecipesToSearch = getCurrentRecipes(true);
    if (!query || query.trim() === '') {
        return allRecipesToSearch;
    }

    const lowerQuery = query.toLowerCase();
    return allRecipesToSearch.filter(recipe => {
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
// Set useAllRecipes to true for landing page to search all recipes regardless of selected folder
function getRandomRecipes(count, useAllRecipes = false) {
    const currentRecipes = getCurrentRecipes(useAllRecipes);
    const shuffled = [...currentRecipes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, currentRecipes.length));
}

// Render random recipe cards
function renderRandomRecipes() {
    // Always use all recipes for landing page, not just current folder
    const randomRecipes = getRandomRecipes(3, true);
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

    const filtered = filterAllRecipes(query);
    renderLandingAutocomplete(filtered);
}

function handleLandingSearchKeydown(e) {
    const query = landingSearch.value.trim();

    if (query === '') return;

    const filtered = filterAllRecipes(query);
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
    return new Promise((resolve) => {
        // Use Firebase Auth state observer
        auth.onAuthStateChanged(async (firebaseUser) => {
            // Skip if signup is in progress - handleSignup will manage state
            if (isSigningUp) {
                resolve();
                return;
            }

            if (firebaseUser) {
                // User is signed in - fetch their profile
                try {
                    const response = await apiFetch('/api/user');
                    if (response.ok) {
                        const data = await response.json();
                        currentUser = data.user;
                        isAuthenticated = true;
                        updateAuthUI();
                        await loadFolders();
                    } else {
                        // User exists in Firebase Auth but not in Firestore
                        // Try to repair the account (create/fix user doc and folders)
                        console.log('User profile not found, attempting repair...');
                        const repairResponse = await apiFetch('/api/user/repair', {
                            method: 'POST'
                        });
                        if (repairResponse.ok) {
                            const data = await repairResponse.json();
                            currentUser = data.user;
                            isAuthenticated = true;
                            updateAuthUI();
                            await loadFolders();
                        } else {
                            console.error('Failed to repair account');
                            isAuthenticated = false;
                            currentUser = null;
                            updateAuthUI();
                        }
                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                    isAuthenticated = false;
                    currentUser = null;
                    updateAuthUI();
                }
            } else {
                // User is signed out
                isAuthenticated = false;
                currentUser = null;
                updateAuthUI();
            }
            resolve();
        });
    });
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
        // Sign in with Firebase Auth
        const userCredential = await auth.signInWithEmailAndPassword(email, password);

        // Firebase Auth will trigger onAuthStateChanged which handles the rest
        loginModal.classList.add('hidden');
        loginForm.reset();

        // Sync history after login
        await syncHistoryToBackend();
    } catch (error) {
        console.error('Login error:', error);
        // Map Firebase error codes to user-friendly messages
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                loginError.textContent = 'Invalid email or password';
                break;
            case 'auth/invalid-email':
                loginError.textContent = 'Invalid email address';
                break;
            case 'auth/too-many-requests':
                loginError.textContent = 'Too many failed attempts. Please try again later.';
                break;
            default:
                loginError.textContent = 'Login failed. Please try again.';
        }
    }
}

async function handleSignup(e) {
    e.preventDefault();
    signupError.textContent = '';

    const username = document.getElementById('signupUsername').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;

    // Set flag to prevent onAuthStateChanged from interfering
    isSigningUp = true;

    try {
        // Create user with Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);

        // Update display name in Firebase Auth
        await userCredential.user.updateProfile({
            displayName: username
        });

        // Create user document in Firestore via API
        const response = await apiFetch('/api/user/create', {
            method: 'POST',
            body: JSON.stringify({ email, username })
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            isAuthenticated = true;
            updateAuthUI();
            signupModal.classList.add('hidden');
            signupForm.reset();

            // Load folders (which were just created)
            await loadFolders();

            // Sync any guest history
            await syncHistoryToBackend();
        } else {
            const data = await response.json();
            signupError.textContent = data.error || 'Error creating account';
        }
    } catch (error) {
        console.error('Signup error:', error);
        // Map Firebase error codes to user-friendly messages
        switch (error.code) {
            case 'auth/email-already-in-use':
                signupError.textContent = 'Email already registered';
                break;
            case 'auth/invalid-email':
                signupError.textContent = 'Invalid email address';
                break;
            case 'auth/weak-password':
                signupError.textContent = 'Password must be at least 6 characters';
                break;
            default:
                signupError.textContent = 'Signup failed. Please try again.';
        }
    } finally {
        // Clear the flag
        isSigningUp = false;
    }
}

async function handleLogout() {
    try {
        // Sign out from Firebase Auth
        await auth.signOut();

        // Clear local state
        currentUser = null;
        isAuthenticated = false;
        recipes = [];
        allRecipes = [];
        currentRecipeId = null;
        searchQuery = '';
        searchInput.value = '';
        filteredRecipes = [];
        folders = [];
        currentFolderId = null;
        currentFolderName = '';

        // Clear cache on logout
        clearCache();

        updateAuthUI();
        renderRecipeList();
        renderRandomRecipes();

        // Hide other views and show landing page
        recipeDisplay.classList.add('hidden');
        userSettingsPage.classList.add('hidden');
        landingPage.style.display = 'block';

        // Navigate to home
        navigateTo('/home', {}, true);
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// ============================================
// User Settings Functions
// ============================================

function showUserSettings() {
    if (!isAuthenticated) return;
    navigateTo('/settings');
}

async function showUserSettingsPage() {
    if (!isAuthenticated) return;

    // Hide other views
    recipeDisplay.classList.add('hidden');
    landingPage.style.display = 'none';

    // Show settings page
    userSettingsPage.classList.remove('hidden');

    // Repair account to sync username from Firebase Auth and ensure folders exist
    try {
        const repairResponse = await apiFetch('/api/user/repair', { method: 'POST' });
        if (repairResponse.ok) {
            const data = await repairResponse.json();
            // Update current user with repaired data
            currentUser = data.user;
            updateAuthUI();
            settingsUsername.textContent = data.user.username;
            settingsEmail.textContent = data.user.email;
            userAvatar.textContent = data.user.username.charAt(0).toUpperCase();
        }
    } catch (error) {
        console.error('Error repairing/loading user profile:', error);
        // Fallback to just loading profile
        try {
            const response = await apiFetch('/api/user/profile');
            if (response.ok) {
                const data = await response.json();
                settingsUsername.textContent = data.username;
                settingsEmail.textContent = data.email;
                userAvatar.textContent = data.username.charAt(0).toUpperCase();
            }
        } catch (e) {
            console.error('Error loading user profile:', e);
        }
    }

    // Load cooking activity
    loadCookingActivity();

    // Reload folders in case they were just created by repair
    await loadFolders();
}

function hideUserSettings() {
    userSettingsPage.classList.add('hidden');
    recipeDisplay.classList.add('hidden');
    landingPage.style.display = 'block';

    // Reset password form
    changePasswordForm.reset();
    passwordError.textContent = '';
    passwordSuccess.textContent = '';
}

async function handleChangePassword(e) {
    e.preventDefault();

    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    passwordError.textContent = '';
    passwordSuccess.textContent = '';

    if (newPassword !== confirmPassword) {
        passwordError.textContent = 'New passwords do not match';
        return;
    }

    if (newPassword.length < 6) {
        passwordError.textContent = 'Password must be at least 6 characters';
        return;
    }

    try {
        const user = auth.currentUser;
        if (!user) {
            passwordError.textContent = 'You must be logged in to change password';
            return;
        }

        // Re-authenticate user before changing password
        const credential = firebase.auth.EmailAuthProvider.credential(
            user.email,
            currentPassword
        );
        await user.reauthenticateWithCredential(credential);

        // Update password
        await user.updatePassword(newPassword);

        passwordSuccess.textContent = 'Password updated successfully!';
        changePasswordForm.reset();
    } catch (error) {
        console.error('Error changing password:', error);
        switch (error.code) {
            case 'auth/wrong-password':
                passwordError.textContent = 'Current password is incorrect';
                break;
            case 'auth/weak-password':
                passwordError.textContent = 'New password is too weak';
                break;
            case 'auth/requires-recent-login':
                passwordError.textContent = 'Please log out and log in again before changing password';
                break;
            default:
                passwordError.textContent = 'Error changing password';
        }
    }
}

async function loadCookingActivity() {
    try {
        const response = await apiFetch('/api/cooking-activity');
        if (response.ok) {
            const data = await response.json();

            // Update stats
            totalCookedEl.textContent = data.totalCooked;
            currentStreakEl.textContent = data.currentStreak;
            longestStreakEl.textContent = data.longestStreak;

            // Build contribution graph
            buildContributionGraph(data.activityByDate);
        }
    } catch (error) {
        console.error('Error loading cooking activity:', error);
    }
}

function buildContributionGraph(activityByDate) {
    // Clear existing graph
    contributionGraph.innerHTML = '';
    contributionMonths.innerHTML = '';

    // Generate 52 weeks x 7 days going back from today
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    const monthLabels = [];

    // Start from 52 weeks ago, adjusted to start on Sunday
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (52 * 7));
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);
    startDate.setHours(0, 0, 0, 0);

    let currentMonth = -1;

    // Generate all 52 columns × 7 rows = 364 cells
    for (let week = 0; week < 52; week++) {
        for (let day = 0; day < 7; day++) {
            const cellDate = new Date(startDate);
            cellDate.setDate(startDate.getDate() + (week * 7) + day);

            const cell = document.createElement('div');
            cell.className = 'contribution-cell';

            // Check if this is a future date
            const isFuture = cellDate > today;

            if (isFuture) {
                // Future dates: show as empty/transparent
                cell.classList.add('level-empty');
                cell.title = '';
            } else {
                // Past/current dates: show activity level
                const dateStr = cellDate.toISOString().split('T')[0];
                const count = activityByDate[dateStr] || 0;

                // Determine level (0-4)
                let level = 0;
                if (count >= 4) level = 4;
                else if (count >= 3) level = 3;
                else if (count >= 2) level = 2;
                else if (count >= 1) level = 1;

                cell.classList.add(`level-${level}`);
                cell.dataset.date = dateStr;
                cell.dataset.count = count;
                cell.title = `${count} recipe${count !== 1 ? 's' : ''} on ${formatDate(cellDate)}`;
            }

            contributionGraph.appendChild(cell);

            // Track month labels (on first day of week)
            const month = cellDate.getMonth();
            if (day === 0 && month !== currentMonth) {
                currentMonth = month;
                monthLabels.push({ week, month: cellDate.toLocaleString('default', { month: 'short' }) });
            }
        }
    }

    // Add month labels with proper spacing
    monthLabels.forEach((label, index) => {
        const span = document.createElement('span');
        span.textContent = label.month;
        contributionMonths.appendChild(span);
    });
}

function formatDate(date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

async function recordCookingActivity(recipeId, recipeName) {
    if (!isAuthenticated) return;

    try {
        await apiFetch('/api/cooking-activity', {
            method: 'POST',
            body: JSON.stringify({ recipeId, recipeName })
        });
    } catch (error) {
        console.error('Error recording cooking activity:', error);
    }
}

async function loadRecipes() {
    if (!isAuthenticated) {
        recipes = [];
        allRecipes = [];
        filteredRecipes = [];
        renderRecipeList();
        renderRandomRecipes();
        return;
    }

    try {
        const response = await apiFetch('/api/recipes');
        if (response.ok) {
            const data = await response.json();
            recipes = data.recipes;
            allRecipes = data.recipes; // Store all recipes for home search
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
    setupEventListeners();
    setupRatingEventListeners();
    await checkAuthStatus();

    // Handle invitation from URL
    await handleInvitationFromUrl();

    // Check for pending invitations
    await checkPendingInvitations();

    // Handle initial route
    const path = window.location.pathname;
    if (path === '/' || path === '') {
        // Redirect to /home
        navigateTo('/home', {}, true);
    } else {
        // Load the current route
        handleRoute(path);
    }

    // Listen for back/forward button
    window.addEventListener('popstate', (e) => {
        handleRoute(window.location.pathname);
    });
}

// Render recipe list
// Sidebar rendering (routes to folder or guest history view)
function renderRecipeList() {
    if (isAuthenticated) {
        renderFolderList();
    } else {
        renderGuestHistory();
    }
}

// Render folder list for logged-in users
function renderFolderList() {
    recipeList.innerHTML = '';

    // Add "New Folder" button
    const newFolderBtn = document.createElement('button');
    newFolderBtn.className = 'new-folder-btn';
    newFolderBtn.textContent = '+ New Folder';
    newFolderBtn.addEventListener('click', showCreateFolderModal);
    recipeList.appendChild(newFolderBtn);

    // Render each folder
    folders.forEach(folder => {
        const folderItem = document.createElement('div');
        folderItem.className = 'folder-section';

        // Folder header
        const folderHeader = document.createElement('div');
        folderHeader.className = 'folder-header';
        if (folder.id === currentFolderId) {
            folderHeader.classList.add('active');
        }

        // Folder info
        const folderInfo = document.createElement('div');
        folderInfo.className = 'folder-info';

        const folderName = document.createElement('span');
        folderName.className = 'folder-name';
        folderName.textContent = folder.name;

        const folderCount = document.createElement('span');
        folderCount.className = 'folder-count';
        folderCount.textContent = `(${folder.recipe_count})`;

        folderInfo.appendChild(folderName);
        folderInfo.appendChild(folderCount);

        folderHeader.appendChild(folderInfo);

        // Action buttons for custom folders
        if (!folder.is_system) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'folder-actions';

            // Collaborators button (only for owners)
            if (folder.is_owner === 1) {
                const collabBtn = document.createElement('button');
                collabBtn.className = 'folder-collab-btn';
                collabBtn.innerHTML = '👥';
                collabBtn.title = 'Manage collaborators';
                collabBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showCollaboratorsModal(folder.id, folder.name);
                });
                actionsDiv.appendChild(collabBtn);
            }

            // Delete button (only for owners)
            if (folder.is_owner === 1) {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'folder-delete-btn';
                deleteBtn.innerHTML = '&times;';
                deleteBtn.title = 'Delete folder';
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteFolder(folder.id);
                });
                actionsDiv.appendChild(deleteBtn);
            }

            folderHeader.appendChild(actionsDiv);
        }

        // Click to show folder
        folderHeader.addEventListener('click', () => {
            showFolder(folder.id, folder.name);
        });

        folderItem.appendChild(folderHeader);

        // If this is the current folder, show recipes
        if (folder.id === currentFolderId && recipes.length > 0) {
            const folderRecipes = document.createElement('div');
            folderRecipes.className = 'folder-recipes';

            const ul = document.createElement('ul');
            ul.className = 'recipe-list';

            recipes.forEach(recipe => {
                const li = document.createElement('li');
                li.textContent = recipe.name;
                li.dataset.id = recipe.id;
                if (recipe.id === currentRecipeId) {
                    li.classList.add('active');
                }
                li.addEventListener('click', () => showRecipe(recipe.id));
                ul.appendChild(li);
            });

            folderRecipes.appendChild(ul);
            folderItem.appendChild(folderRecipes);
        }

        recipeList.appendChild(folderItem);
    });

    // Show empty state if current folder has no recipes
    if (currentFolderId && recipes.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.className = 'history-empty';
        emptyMsg.textContent = currentFolderName === 'History'
            ? 'No recipes in history yet. Click a recipe to add it!'
            : currentFolderName === 'Favorites'
                ? 'No favorites yet. Use "Add to Folder" to add recipes!'
                : 'No recipes in this folder yet.';
        recipeList.appendChild(emptyMsg);
    }
}

// Render guest history from localStorage
function renderGuestHistory() {
    recipeList.innerHTML = '';

    const header = document.createElement('h3');
    header.className = 'history-header';
    header.textContent = 'History';
    recipeList.appendChild(header);

    const history = getLocalHistory();

    if (history.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.className = 'history-empty';
        emptyMsg.textContent = 'No history yet. Click a recipe to get started!';
        recipeList.appendChild(emptyMsg);
        return;
    }

    const ul = document.createElement('ul');
    ul.className = 'recipe-list';

    history.forEach(recipeId => {
        // Find recipe in sampleRecipes
        const recipe = sampleRecipes.find(r => r.id === recipeId);
        if (recipe) {
            const li = document.createElement('li');
            li.textContent = recipe.name;
            li.dataset.id = recipe.id;
            if (recipe.id === currentRecipeId) {
                li.classList.add('active');
            }
            li.addEventListener('click', () => showRecipe(recipe.id));
            ul.appendChild(li);
        }
    });

    recipeList.appendChild(ul);
}

// Show recipe details
// Show recipe details (wrapper for routing)
function showRecipe(recipeId) {
    showRecipeById(recipeId, true);
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
// Return to home page
function goToHome(e) {
    e.preventDefault();
    navigateTo('/home');
}

// Setup event listeners
// Folder Modal Functions

function showCreateFolderModal() {
    folderError.textContent = '';
    createFolderForm.reset();
    createFolderModal.classList.remove('hidden');
}

async function handleCreateFolder(e) {
    e.preventDefault();
    const name = folderNameInput.value.trim();

    if (!name) {
        folderError.textContent = 'Folder name is required';
        return;
    }

    if (name === 'Favorites' || name === 'History') {
        folderError.textContent = 'Cannot use reserved folder names';
        return;
    }

    const success = await createFolder(name);
    if (success) {
        createFolderModal.classList.add('hidden');
        createFolderForm.reset();
        folderError.textContent = '';
    }
}

async function showAddToFolderModal() {
    if (!currentRecipeId) return;

    // Get which folders currently contain this recipe
    const recipeFolderIds = await getRecipeFolders(currentRecipeId);

    // Populate checkbox list (exclude History folder - it's automatic)
    folderCheckboxList.innerHTML = '';

    folders.filter(folder => folder.name !== 'History').forEach(folder => {
        const item = document.createElement('div');
        item.className = 'folder-checkbox-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `folder-${folder.id}`;
        checkbox.value = folder.id;
        checkbox.checked = recipeFolderIds.includes(folder.id);
        checkbox.dataset.initiallyChecked = checkbox.checked;

        const label = document.createElement('label');
        label.htmlFor = `folder-${folder.id}`;
        label.className = 'folder-checkbox-label';
        label.textContent = folder.name;

        item.appendChild(checkbox);
        item.appendChild(label);
        folderCheckboxList.appendChild(item);
    });

    addToFolderModal.classList.remove('hidden');
}

async function getRecipeFolders(recipeId) {
    // Return array of folder IDs that contain this recipe (single API call)
    try {
        const response = await apiFetch(`/api/recipes/${recipeId}/folders`);
        if (response.ok) {
            const data = await response.json();
            return data.folderIds || [];
        }
    } catch (error) {
        console.error('Error checking recipe folders:', error);
    }
    return [];
}

async function handleSaveFolders() {
    const checkboxes = folderCheckboxList.querySelectorAll('input[type="checkbox"]');
    let changes = [];

    for (const checkbox of checkboxes) {
        const folderId = checkbox.value; // Keep as string - Firestore IDs are strings
        const isChecked = checkbox.checked;
        const wasChecked = checkbox.dataset.initiallyChecked === 'true';

        if (isChecked && !wasChecked) {
            // Add to folder
            changes.push(handleAddToFolder(folderId));
        } else if (!isChecked && wasChecked) {
            // Remove from folder
            changes.push(removeFromFolder(folderId, currentRecipeId));
        }
    }

    await Promise.all(changes);
    addToFolderModal.classList.add('hidden');

    // Reload folders to update recipe counts
    await loadFolders();

    // Show "Add to Folder" button if authenticated
    if (isAuthenticated) {
        addToFolderBtn.classList.remove('hidden');
    }
}

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

    // User Settings event listeners
    usernameDisplay.addEventListener('click', showUserSettings);
    changePasswordForm.addEventListener('submit', handleChangePassword);

    // Folder event listeners
    addToFolderBtn.addEventListener('click', () => {
        if (!isAuthenticated) {
            showLoginModal();
            return;
        }
        showAddToFolderModal();
    });

    saveFoldersBtn.addEventListener('click', handleSaveFolders);
    cancelFoldersBtn.addEventListener('click', () => {
        addToFolderModal.classList.add('hidden');
    });

    createFolderForm.addEventListener('submit', handleCreateFolder);
    cancelCreateFolderBtn.addEventListener('click', () => {
        createFolderModal.classList.add('hidden');
        createFolderForm.reset();
        folderError.textContent = '';
    });

    // Collaboration event listeners
    inviteCollaboratorForm.addEventListener('submit', inviteCollaborator);
    closeCollaboratorsBtn.addEventListener('click', () => {
        collaboratorsModal.classList.add('hidden');
    });

    viewInvitationsBtn.addEventListener('click', () => {
        showInvitationsModal();
    });

    dismissBannerBtn.addEventListener('click', () => {
        invitationsBanner.classList.add('hidden');
    });

    closeInvitationsBtn.addEventListener('click', () => {
        invitationsModal.classList.add('hidden');
    });

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

    addToFolderModal.addEventListener('click', (e) => {
        if (e.target === addToFolderModal) {
            addToFolderModal.classList.add('hidden');
        }
    });

    createFolderModal.addEventListener('click', (e) => {
        if (e.target === createFolderModal) {
            createFolderModal.classList.add('hidden');
            createFolderForm.reset();
            folderError.textContent = '';
        }
    });

    collaboratorsModal.addEventListener('click', (e) => {
        if (e.target === collaboratorsModal) {
            collaboratorsModal.classList.add('hidden');
        }
    });

    invitationsModal.addEventListener('click', (e) => {
        if (e.target === invitationsModal) {
            invitationsModal.classList.add('hidden');
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
        const response = await apiFetch('/api/recipes', {
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
        const response = await apiFetch(`/api/recipes/${recipeId}/rating`);
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
        const response = await apiFetch(`/api/recipes/${currentRatingRecipeId}/rating`, {
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

    if (allComplete) {
        // Record cooking activity
        const currentRecipes = getCurrentRecipes();
        const recipe = currentRecipes.find(r => r.id === recipeId);
        if (recipe) {
            recordCookingActivity(recipeId, recipe.name);
        }

        // Show rating modal if not rated yet
        if (!userRatings[recipeId]) {
            setTimeout(() => {
                showRatingModal(recipeId);
            }, 500);
        }
    }
}

// Start the app
init();
