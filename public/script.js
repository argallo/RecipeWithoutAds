// User recipes (for authenticated users)
let recipes = [];

// All recipes from database (for home page search)
let allRecipes = [];

let currentRecipeId = null;
let currentRecipe = null; // Store the full recipe object for the currently displayed recipe

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
const editRecipeBtn = document.getElementById('editRecipeBtn');
const forkRecipeBtn = document.getElementById('forkRecipeBtn');
const recipeForkedFrom = document.getElementById('recipeForkedFrom');
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
const adminLink = document.getElementById('adminLink');
const loginError = document.getElementById('loginError');
const signupError = document.getElementById('signupError');
const siteLogo = document.getElementById('siteLogo');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const googleSignupBtn = document.getElementById('googleSignupBtn');

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

// Admin Dashboard DOM elements
const adminPage = document.getElementById('adminPage');
const adminTotalRecipes = document.getElementById('adminTotalRecipes');
const adminTotalUsers = document.getElementById('adminTotalUsers');
const adminPendingRecipes = document.getElementById('adminPendingRecipes');
const adminApprovedRecipes = document.getElementById('adminApprovedRecipes');
const adminSearchInput = document.getElementById('adminSearchInput');
const adminSearchBtn = document.getElementById('adminSearchBtn');
const adminRecipesTableBody = document.getElementById('adminRecipesTableBody');
const adminPaginationInfo = document.getElementById('adminPaginationInfo');
const adminPrevPage = document.getElementById('adminPrevPage');
const adminNextPage = document.getElementById('adminNextPage');
const adminPageInfo = document.getElementById('adminPageInfo');
const adminDeleteModal = document.getElementById('adminDeleteModal');
const deleteRecipeName = document.getElementById('deleteRecipeName');
const deleteRecipeAuthor = document.getElementById('deleteRecipeAuthor');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

// Authentication state
let currentUser = null;
let isAuthenticated = false;
let isSigningUp = false; // Flag to prevent race condition during signup

// Admin dashboard state
let adminRecipes = [];
let adminCurrentPage = 1;
let adminTotalPages = 1;
let adminSearchQuery = '';
let adminRecipeToDelete = null;

// Firebase Auth reference
const auth = firebase.auth();
const storage = firebase.storage();

// Image upload state
let selectedImageFile = null;
let uploadedImageUrl = null;

// Edit mode state
let isEditMode = false;
let editingRecipeId = null;

// Fork mode state
let isForkMode = false;
let forkingFromRecipe = null;

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

// Utility function to escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
    // If requesting all recipes for search/landing page
    if (useAllRecipes && allRecipes.length > 0) {
        return allRecipes;
    }
    // If authenticated with recipes, show user recipes
    if (isAuthenticated && recipes.length > 0) {
        return recipes;
    }
    // Fall back to all public recipes
    return allRecipes;
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
    } else if (pathParts[0] === 'admin') {
        // Admin dashboard - check if user is admin
        if (isAuthenticated && currentUser && currentUser.isAdmin) {
            showAdminPage();
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
    adminPage.classList.add('hidden');
    landingPage.style.display = 'block';

    // Clear current recipe
    currentRecipeId = null;
    currentRecipe = null;

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

    // If not found locally OR missing full data (ingredients/instructions), fetch from API
    if (!recipe || !recipe.ingredients || !recipe.instructions) {
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

    // Ensure source_data is transformed to source for all recipes
    if (recipe.source_data && !recipe.source) {
        recipe.source = recipe.source_data;
    }

    if (pushState) {
        const recipeUrl = getRecipeUrl(recipe);
        navigateTo(recipeUrl, { recipeId });
        // navigateTo will call handleRoute which calls showRecipeById again with pushState=false
        // So we return here to avoid duplicate work
        return;
    }

    currentRecipeId = recipeId;
    currentRecipe = recipe; // Store full recipe for reset functionality

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

    // Show "Edit Recipe" button for admins
    if (isAuthenticated && currentUser && currentUser.isAdmin) {
        editRecipeBtn.classList.remove('hidden');
    } else {
        editRecipeBtn.classList.add('hidden');
    }

    // Show "Fork Recipe" button for approved recipes when user is authenticated
    if (isAuthenticated && recipe.status === 'approved') {
        forkRecipeBtn.classList.remove('hidden');
    } else {
        forkRecipeBtn.classList.add('hidden');
    }

    // Display "Forked from" link if recipe has forked_from field
    if (recipe.forked_from && recipe.forked_from.recipe_id) {
        recipeForkedFrom.innerHTML = `Forked from: <a href="/recipe/${recipe.forked_from.recipe_id}" onclick="event.preventDefault(); showRecipeById('${recipe.forked_from.recipe_id}', true);">${recipe.forked_from.recipe_name || 'Original Recipe'}</a>`;
        recipeForkedFrom.classList.remove('hidden');
    } else {
        recipeForkedFrom.classList.add('hidden');
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
let landingSearchDebounceTimer = null;
let landingSearchResults = [];

async function searchPublicRecipes(query) {
    try {
        const response = await fetch(`/api/public/search?q=${encodeURIComponent(query)}&limit=20`);
        if (response.ok) {
            const data = await response.json();
            return data.recipes || [];
        }
    } catch (error) {
        console.error('Error searching public recipes:', error);
    }
    return [];
}

function handleLandingSearchInput(e) {
    const query = e.target.value;
    toggleLandingClearButton();
    selectedLandingAutocompleteIndex = -1;

    if (query.trim() === '') {
        landingAutocompleteDropdown.classList.remove('active');
        landingSearchResults = [];

        // Restore the random recipes view
        const randomRecipesSection = document.querySelector('.random-recipes-section');
        const heading = randomRecipesSection.querySelector('h2');
        heading.textContent = 'Try These Recipes';
        renderRandomRecipes();
        return;
    }

    // First show local results immediately for responsiveness
    const localFiltered = filterAllRecipes(query);
    landingSearchResults = localFiltered;
    renderLandingAutocomplete(localFiltered);

    // Then debounce the API call for more complete results
    clearTimeout(landingSearchDebounceTimer);
    landingSearchDebounceTimer = setTimeout(async () => {
        const apiResults = await searchPublicRecipes(query);
        if (apiResults.length > 0 && landingSearch.value.trim() === query.trim()) {
            // Merge with local results, avoiding duplicates
            const mergedResults = [...localFiltered];
            apiResults.forEach(apiRecipe => {
                if (!mergedResults.find(r => r.id === apiRecipe.id)) {
                    mergedResults.push(apiRecipe);
                }
            });
            landingSearchResults = mergedResults;
            renderLandingAutocomplete(mergedResults);
        }
    }, 300);
}

function handleLandingSearchKeydown(e) {
    const query = landingSearch.value.trim();

    if (query === '') return;

    const suggestions = landingSearchResults.slice(0, 5);

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedLandingAutocompleteIndex = Math.min(selectedLandingAutocompleteIndex + 1, suggestions.length - 1);
        renderLandingAutocomplete(landingSearchResults);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedLandingAutocompleteIndex = Math.max(selectedLandingAutocompleteIndex - 1, -1);
        renderLandingAutocomplete(landingSearchResults);
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedLandingAutocompleteIndex >= 0 && selectedLandingAutocompleteIndex < suggestions.length) {
            // Select the highlighted suggestion
            const selectedRecipe = suggestions[selectedLandingAutocompleteIndex];
            selectLandingAutocompleteItem(selectedRecipe);
        } else {
            // Show results page with all matching recipes
            showLandingSearchResults(query, landingSearchResults);
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
        // Show add recipe button for logged in users
        addRecipeBtn.classList.remove('hidden');
        // Show admin link if user is admin
        if (currentUser.isAdmin) {
            adminLink.classList.remove('hidden');
        } else {
            adminLink.classList.add('hidden');
        }
    } else {
        loginBtn.classList.remove('hidden');
        userDropdown.classList.add('hidden');
        adminLink.classList.add('hidden');
        addRecipeBtn.classList.add('hidden');
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

async function handleGoogleSignIn() {
    // Clear any previous errors
    loginError.textContent = '';
    signupError.textContent = '';

    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        const user = result.user;

        // Close modals
        loginModal.classList.add('hidden');
        signupModal.classList.add('hidden');
        loginForm.reset();
        signupForm.reset();

        // Create/update user document via repair endpoint
        // This handles both new and existing users
        const repairResponse = await apiFetch('/api/user/repair', { method: 'POST' });
        if (repairResponse.ok) {
            const data = await repairResponse.json();
            currentUser = data.user;
            isAuthenticated = true;
            updateAuthUI();
            await loadFolders();

            // Sync any guest history
            await syncHistoryToBackend();
        }
    } catch (error) {
        console.error('Google sign-in error:', error.code, error.message);

        // Map error codes to user-friendly messages
        let errorMessage;
        switch (error.code) {
            case 'auth/popup-closed-by-user':
                errorMessage = 'Sign-in cancelled';
                break;
            case 'auth/popup-blocked':
                errorMessage = 'Popup was blocked. Please allow popups for this site.';
                break;
            case 'auth/cancelled-popup-request':
                errorMessage = 'Sign-in cancelled';
                break;
            case 'auth/unauthorized-domain':
                errorMessage = 'This domain is not authorized for Google sign-in.';
                break;
            case 'auth/operation-not-allowed':
                errorMessage = 'Google sign-in is not enabled. Please contact support.';
                break;
            default:
                errorMessage = `Sign-in failed: ${error.message || error.code || 'Unknown error'}`;
        }

        if (!loginModal.classList.contains('hidden')) {
            loginError.textContent = errorMessage;
        } else if (!signupModal.classList.contains('hidden')) {
            signupError.textContent = errorMessage;
        }
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
        currentRecipe = null;
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

// ═══════════════════════════════════════════════════════════════════════════
// Admin Dashboard Functions
// ═══════════════════════════════════════════════════════════════════════════

async function showAdminPage() {
    if (!isAuthenticated || !currentUser || !currentUser.isAdmin) {
        navigateTo('/home', {}, true);
        return;
    }

    // Hide other views
    recipeDisplay.classList.add('hidden');
    userSettingsPage.classList.add('hidden');
    landingPage.style.display = 'none';

    // Show admin page
    adminPage.classList.remove('hidden');

    // Load admin stats and recipes
    await loadAdminStats();
    await loadAdminRecipes();
}

async function loadAdminStats() {
    try {
        const response = await apiFetch('/api/admin/stats');
        if (response.ok) {
            const data = await response.json();
            adminTotalRecipes.textContent = data.totalRecipes;
            adminTotalUsers.textContent = data.totalUsers;
            adminPendingRecipes.textContent = data.pendingRecipes || 0;
            adminApprovedRecipes.textContent = data.approvedRecipes || 0;
        }
    } catch (error) {
        console.error('Error loading admin stats:', error);
    }
}

async function loadAdminRecipes(page = 1, search = '') {
    try {
        adminCurrentPage = page;
        adminSearchQuery = search;

        const params = new URLSearchParams({
            page: page.toString(),
            limit: '20'
        });
        if (search) {
            params.append('search', search);
        }

        const response = await apiFetch(`/api/admin/recipes?${params}`);
        if (response.ok) {
            const data = await response.json();
            adminRecipes = data.recipes;
            adminTotalPages = data.totalPages;

            renderAdminRecipes();
            updateAdminPagination(data.total, data.page, data.totalPages);
        }
    } catch (error) {
        console.error('Error loading admin recipes:', error);
    }
}

function renderAdminRecipes() {
    adminRecipesTableBody.innerHTML = '';

    if (adminRecipes.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="7" class="admin-empty-message">No recipes found</td>';
        adminRecipesTableBody.appendChild(tr);
        return;
    }

    adminRecipes.forEach(recipe => {
        const tr = document.createElement('tr');
        const createdDate = recipe.createdAt ?
            new Date(recipe.createdAt._seconds * 1000).toLocaleDateString() :
            'N/A';
        const status = recipe.status || 'pending';
        const statusBadgeClass = status === 'approved' ? 'status-approved' :
                                  status === 'declined' ? 'status-declined' : 'status-pending';

        tr.innerHTML = `
            <td>
                <div class="admin-recipe-image">
                    ${recipe.image ? `<img src="${recipe.image}" alt="${recipe.name}">` : '<span class="no-image">No image</span>'}
                </div>
            </td>
            <td>
                <a href="/recipe/${generateSlug(recipe.name)}-${recipe.id}" class="admin-recipe-name">${escapeHtml(recipe.name)}</a>
            </td>
            <td>${escapeHtml(recipe.author || 'Unknown')}</td>
            <td>
                <span class="admin-user-badge">${escapeHtml(recipe.createdByUsername || 'Unknown')}</span>
            </td>
            <td>
                <span class="admin-status-badge ${statusBadgeClass}">${status}</span>
            </td>
            <td>${createdDate}</td>
            <td>
                <div class="admin-actions">
                    ${status !== 'approved' ? `<button class="admin-approve-btn" data-recipe-id="${recipe.id}" title="Approve">✓</button>` : ''}
                    ${status !== 'declined' ? `<button class="admin-decline-btn" data-recipe-id="${recipe.id}" title="Decline">✕</button>` : ''}
                    <button class="admin-delete-btn" data-recipe-id="${recipe.id}" data-recipe-name="${escapeHtml(recipe.name)}" data-recipe-author="${escapeHtml(recipe.author || 'Unknown')}" title="Delete">🗑</button>
                </div>
            </td>
        `;
        adminRecipesTableBody.appendChild(tr);
    });

    // Add event listeners to action buttons
    adminRecipesTableBody.querySelectorAll('.admin-approve-btn').forEach(btn => {
        btn.addEventListener('click', () => approveRecipe(btn.dataset.recipeId));
    });

    adminRecipesTableBody.querySelectorAll('.admin-decline-btn').forEach(btn => {
        btn.addEventListener('click', () => declineRecipe(btn.dataset.recipeId));
    });

    adminRecipesTableBody.querySelectorAll('.admin-delete-btn').forEach(btn => {
        btn.addEventListener('click', () => showDeleteConfirmation(
            btn.dataset.recipeId,
            btn.dataset.recipeName,
            btn.dataset.recipeAuthor
        ));
    });
}

function updateAdminPagination(total, page, totalPages) {
    adminPaginationInfo.textContent = `Showing ${adminRecipes.length} of ${total} recipes`;
    adminPageInfo.textContent = `Page ${page} of ${totalPages}`;

    adminPrevPage.disabled = page <= 1;
    adminNextPage.disabled = page >= totalPages;
}

function showDeleteConfirmation(recipeId, recipeName, recipeAuthor) {
    adminRecipeToDelete = recipeId;
    deleteRecipeName.textContent = recipeName;
    deleteRecipeAuthor.textContent = `by ${recipeAuthor}`;
    adminDeleteModal.classList.remove('hidden');
}

function hideDeleteConfirmation() {
    adminDeleteModal.classList.add('hidden');
    adminRecipeToDelete = null;
}

async function deleteAdminRecipe() {
    if (!adminRecipeToDelete) return;

    try {
        confirmDeleteBtn.disabled = true;
        confirmDeleteBtn.textContent = 'Deleting...';

        const response = await apiFetch(`/api/admin/recipes/${adminRecipeToDelete}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            hideDeleteConfirmation();
            // Clear all caches so deleted recipe doesn't appear in history/folders
            clearCache();
            // Reload the current page of recipes
            await loadAdminRecipes(adminCurrentPage, adminSearchQuery);
            // Update stats
            await loadAdminStats();
        } else {
            const data = await response.json();
            alert(`Error deleting recipe: ${data.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error deleting recipe:', error);
        alert('Error deleting recipe. Please try again.');
    } finally {
        confirmDeleteBtn.disabled = false;
        confirmDeleteBtn.textContent = 'Delete Recipe';
    }
}

async function approveRecipe(recipeId) {
    try {
        const response = await apiFetch(`/api/admin/recipes/${recipeId}/approve`, {
            method: 'POST'
        });

        if (response.ok) {
            // Update the recipe in the local array
            const recipe = adminRecipes.find(r => r.id === recipeId);
            if (recipe) {
                recipe.status = 'approved';
            }
            renderAdminRecipes();
            await loadAdminStats();
        } else {
            const data = await response.json();
            alert(`Error approving recipe: ${data.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error approving recipe:', error);
        alert('Error approving recipe. Please try again.');
    }
}

async function declineRecipe(recipeId) {
    const reason = prompt('Optional: Enter a reason for declining this recipe (or leave blank):');

    try {
        const response = await apiFetch(`/api/admin/recipes/${recipeId}/decline`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason: reason || null })
        });

        if (response.ok) {
            // Update the recipe in the local array
            const recipe = adminRecipes.find(r => r.id === recipeId);
            if (recipe) {
                recipe.status = 'declined';
            }
            renderAdminRecipes();
            await loadAdminStats();
        } else {
            const data = await response.json();
            alert(`Error declining recipe: ${data.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error declining recipe:', error);
        alert('Error declining recipe. Please try again.');
    }
}

function handleAdminSearch() {
    const query = adminSearchInput.value.trim();
    loadAdminRecipes(1, query);
}

function setupAdminEventListeners() {
    // Search
    adminSearchBtn.addEventListener('click', handleAdminSearch);
    adminSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdminSearch();
        }
    });

    // Pagination
    adminPrevPage.addEventListener('click', () => {
        if (adminCurrentPage > 1) {
            loadAdminRecipes(adminCurrentPage - 1, adminSearchQuery);
        }
    });

    adminNextPage.addEventListener('click', () => {
        if (adminCurrentPage < adminTotalPages) {
            loadAdminRecipes(adminCurrentPage + 1, adminSearchQuery);
        }
    });

    // Delete confirmation modal
    confirmDeleteBtn.addEventListener('click', deleteAdminRecipe);
    cancelDeleteBtn.addEventListener('click', hideDeleteConfirmation);

    // Admin link click handler
    adminLink.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('/admin', {});
    });

    // Close modal when clicking outside
    adminDeleteModal.addEventListener('click', (e) => {
        if (e.target === adminDeleteModal) {
            hideDeleteConfirmation();
        }
    });

    // Bulk upload event listeners
    setupBulkUploadEventListeners();
}

// ═══════════════════════════════════════════════════════════════════════════
// Bulk Upload Functions
// ═══════════════════════════════════════════════════════════════════════════

let parsedCsvData = [];
let selectedImageFiles = {};

function setupBulkUploadEventListeners() {
    const toggleBtn = document.getElementById('toggleBulkUpload');
    const bulkContent = document.getElementById('bulkUploadContent');
    const csvFileInput = document.getElementById('csvFileInput');
    const imageFilesInput = document.getElementById('imageFilesInput');
    const previewBtn = document.getElementById('previewCsvBtn');
    const startUploadBtn = document.getElementById('startBulkUploadBtn');
    const downloadTemplateBtn = document.getElementById('downloadCsvTemplate');

    // Toggle bulk upload section
    toggleBtn.addEventListener('click', () => {
        bulkContent.classList.toggle('hidden');
        toggleBtn.textContent = bulkContent.classList.contains('hidden') ? 'Show Upload' : 'Hide Upload';
    });

    // Handle image files selection
    imageFilesInput.addEventListener('change', (e) => {
        selectedImageFiles = {};
        for (const file of e.target.files) {
            // Store by filename (without path)
            selectedImageFiles[file.name] = file;
        }
        console.log('Selected images:', Object.keys(selectedImageFiles));
        // Re-render preview if CSV is already parsed
        if (parsedCsvData.length > 0) {
            renderCsvPreview();
        }
    });

    // Preview CSV button
    previewBtn.addEventListener('click', () => {
        const file = csvFileInput.files[0];
        if (!file) {
            alert('Please select a CSV file first');
            return;
        }
        parseCsvFile(file);
    });

    // Start upload button
    startUploadBtn.addEventListener('click', startBulkUpload);

    // Download template button
    downloadTemplateBtn.addEventListener('click', downloadCsvTemplate);
}

function downloadCsvTemplate() {
    const template = `name,author,image,source_type,youtube_url,book_name,amazon_link,ingredients,instructions
"Classic Pancakes","Home Chef","pancakes.jpg","manual","","","","2 cups flour|2 eggs|1 cup milk|2 tbsp sugar|1 tsp baking powder|pinch of salt","Mix dry ingredients|Add wet ingredients and whisk|Heat pan with butter|Pour batter and cook until bubbles form|Flip and cook other side"
"Pasta Carbonara","Italian Kitchen","carbonara.jpg","youtube","https://youtube.com/watch?v=example","","","400g spaghetti|200g pancetta|4 eggs|100g parmesan|black pepper","Cook pasta|Fry pancetta|Mix eggs with cheese|Combine all off heat|Serve immediately"`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recipe_template.csv';
    a.click();
    URL.revokeObjectURL(url);
}

function parseCsvFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target.result;
        parsedCsvData = parseCsv(text);
        renderCsvPreview();
    };
    reader.readAsText(file);
}

function parseCsv(text) {
    const lines = text.split('\n');
    const headers = parseCsvLine(lines[0]);
    const recipes = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = parseCsvLine(line);
        const recipe = {};

        headers.forEach((header, index) => {
            recipe[header.trim().toLowerCase()] = values[index] || '';
        });

        // Only include if name exists
        if (recipe.name) {
            recipes.push(recipe);
        }
    }

    return recipes;
}

function parseCsvLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());

    return result;
}

function renderCsvPreview() {
    const previewSection = document.getElementById('csvPreview');
    const previewBody = document.getElementById('csvPreviewBody');
    const previewCount = document.getElementById('csvPreviewCount');
    const startUploadBtn = document.getElementById('startBulkUploadBtn');

    previewSection.classList.remove('hidden');
    previewCount.textContent = parsedCsvData.length;
    previewBody.innerHTML = '';

    parsedCsvData.forEach((recipe, index) => {
        const tr = document.createElement('tr');

        // Check if image file is available
        let imageStatus = '';
        if (recipe.image) {
            const filename = recipe.image.split(/[\\/]/).pop(); // Get filename from path
            if (selectedImageFiles[filename]) {
                imageStatus = `<span class="image-status image-found">Found: ${filename}</span>`;
            } else {
                imageStatus = `<span class="image-status image-missing">Missing: ${filename}</span>`;
            }
        } else {
            imageStatus = `<span class="image-status image-none">No image</span>`;
        }

        // Format source
        let sourceDisplay = recipe.source_type || 'manual';
        if (recipe.source_type === 'youtube' && recipe.youtube_url) {
            sourceDisplay = 'YouTube';
        } else if (recipe.source_type === 'cookbook' && recipe.book_name) {
            sourceDisplay = `Book: ${recipe.book_name}`;
        }

        // Count ingredients and instructions
        const ingredientCount = recipe.ingredients ? recipe.ingredients.split('|').length : 0;
        const instructionCount = recipe.instructions ? recipe.instructions.split('|').length : 0;

        tr.innerHTML = `
            <td>${index + 1}</td>
            <td title="${escapeHtml(recipe.name)}">${escapeHtml(recipe.name)}</td>
            <td title="${escapeHtml(recipe.author || '')}">${escapeHtml(recipe.author || 'Unknown')}</td>
            <td>${imageStatus}</td>
            <td>${escapeHtml(sourceDisplay)}</td>
            <td>${ingredientCount} items</td>
            <td>${instructionCount} steps</td>
        `;
        previewBody.appendChild(tr);
    });

    // Enable upload button if we have recipes
    startUploadBtn.disabled = parsedCsvData.length === 0;
}

async function startBulkUpload() {
    if (parsedCsvData.length === 0) {
        alert('No recipes to upload');
        return;
    }

    const progressSection = document.getElementById('bulkUploadProgress');
    const progressBar = document.getElementById('bulkProgressBar');
    const progressText = document.getElementById('bulkProgressText');
    const uploadLog = document.getElementById('bulkUploadLog');
    const startUploadBtn = document.getElementById('startBulkUploadBtn');

    // Show progress section
    progressSection.classList.remove('hidden');
    uploadLog.innerHTML = '';
    startUploadBtn.disabled = true;

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < parsedCsvData.length; i++) {
        const recipe = parsedCsvData[i];
        const progress = ((i + 1) / parsedCsvData.length) * 100;
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${i + 1} of ${parsedCsvData.length} recipes processed`;

        try {
            await uploadSingleRecipe(recipe, i + 1, uploadLog);
            successCount++;
        } catch (error) {
            errorCount++;
            addLogEntry(uploadLog, `Error uploading "${recipe.name}": ${error.message}`, 'error');
        }
    }

    // Final summary
    addLogEntry(uploadLog, `Upload complete: ${successCount} succeeded, ${errorCount} failed`, 'info');
    startUploadBtn.disabled = false;

    // Refresh admin recipes list
    await loadAdminRecipes();
    await loadAdminStats();
}

async function uploadSingleRecipe(recipeData, index, uploadLog) {
    addLogEntry(uploadLog, `[${index}] Uploading "${recipeData.name}"...`, 'info');

    // Handle image upload if specified
    let imageUrl = null;
    if (recipeData.image) {
        const filename = recipeData.image.split(/[\\/]/).pop();
        const imageFile = selectedImageFiles[filename];

        if (imageFile) {
            try {
                imageUrl = await uploadRecipeImage(imageFile);
                addLogEntry(uploadLog, `[${index}] Image uploaded: ${filename}`, 'success');
            } catch (error) {
                addLogEntry(uploadLog, `[${index}] Image upload failed: ${error.message}`, 'error');
            }
        } else {
            addLogEntry(uploadLog, `[${index}] Image file not found: ${filename}`, 'error');
        }
    }

    // Build source object
    let source = { type: recipeData.source_type || 'manual' };
    if (recipeData.source_type === 'youtube' && recipeData.youtube_url) {
        source.youtubeUrl = recipeData.youtube_url;
    } else if (recipeData.source_type === 'cookbook') {
        source.bookName = recipeData.book_name || '';
        source.amazonLink = recipeData.amazon_link || '';
    }

    // Parse ingredients and instructions (pipe-separated)
    const ingredients = recipeData.ingredients
        ? recipeData.ingredients.split('|').map(s => s.trim()).filter(s => s)
        : [];
    const instructions = recipeData.instructions
        ? recipeData.instructions.split('|').map(s => s.trim()).filter(s => s)
        : [];

    // Create recipe via API
    const payload = {
        name: recipeData.name,
        author: recipeData.author || 'Unknown',
        image: imageUrl,
        source: source,
        ingredients: ingredients,
        instructions: instructions
    };

    const response = await apiFetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create recipe');
    }

    addLogEntry(uploadLog, `[${index}] Recipe created: "${recipeData.name}"`, 'success');
    return await response.json();
}

function addLogEntry(logContainer, message, type) {
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

// ═══════════════════════════════════════════════════════════════════════════
// YouTube Channel Import Functions
// ═══════════════════════════════════════════════════════════════════════════

let youtubeChannels = [];
let youtubeVideos = [];
let selectedChannelName = '';
let selectedVideos = new Set();

function setupYoutubeImportEventListeners() {
    const toggleBtn = document.getElementById('toggleYoutubeImport');
    const importContent = document.getElementById('youtubeImportContent');
    const searchBtn = document.getElementById('searchChannelBtn');
    const searchInput = document.getElementById('channelSearchInput');
    const backBtn = document.getElementById('backToChannelsBtn');
    const selectAllCheckbox = document.getElementById('selectAllVideos');
    const extractBtn = document.getElementById('extractSelectedBtn');

    if (!toggleBtn) return; // Not on admin page

    // Toggle import section
    toggleBtn.addEventListener('click', () => {
        importContent.classList.toggle('hidden');
        toggleBtn.textContent = importContent.classList.contains('hidden') ? 'Show Import' : 'Hide Import';
    });

    // Search channels
    searchBtn.addEventListener('click', searchYouTubeChannels);
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchYouTubeChannels();
        }
    });

    // Back to channels button
    backBtn.addEventListener('click', showChannelResults);

    // Select all checkbox
    selectAllCheckbox.addEventListener('change', toggleSelectAllVideos);

    // Extract selected videos
    extractBtn.addEventListener('click', extractSelectedVideos);
}

async function searchYouTubeChannels() {
    const searchInput = document.getElementById('channelSearchInput');
    const channelResults = document.getElementById('channelResults');
    const channelCards = document.getElementById('channelCards');
    const channelVideos = document.getElementById('channelVideos');
    const searchBtn = document.getElementById('searchChannelBtn');

    const query = searchInput.value.trim();
    if (!query || query.length < 2) {
        alert('Please enter at least 2 characters to search');
        return;
    }

    // Show loading state
    searchBtn.disabled = true;
    searchBtn.textContent = 'Searching...';
    channelResults.classList.add('hidden');
    channelVideos.classList.add('hidden');

    try {
        const response = await apiFetch(`/api/admin/youtube/search-channel?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Search failed');
        }

        const data = await response.json();
        youtubeChannels = data.channels || [];

        if (youtubeChannels.length === 0) {
            channelCards.innerHTML = '<p class="no-results">No channels found. Try a different search.</p>';
        } else {
            renderChannelCards();
        }

        channelResults.classList.remove('hidden');
    } catch (error) {
        console.error('Error searching channels:', error);
        alert('Error searching channels: ' + error.message);
    } finally {
        searchBtn.disabled = false;
        searchBtn.textContent = 'Search';
    }
}

function renderChannelCards() {
    const channelCards = document.getElementById('channelCards');
    channelCards.innerHTML = '';

    youtubeChannels.forEach(channel => {
        const card = document.createElement('div');
        card.className = 'channel-card';
        card.innerHTML = `
            <img src="${channel.thumbnail}" alt="${escapeHtml(channel.title)}" class="channel-thumbnail">
            <div class="channel-info">
                <h4 class="channel-title">${escapeHtml(channel.title)}</h4>
                <p class="channel-meta">${escapeHtml(channel.subscriberCount || '')} ${channel.videoCount ? `• ${channel.videoCount}` : ''}</p>
            </div>
        `;
        card.addEventListener('click', () => loadChannelVideos(channel.channelId, channel.title));
        channelCards.appendChild(card);
    });
}

async function loadChannelVideos(channelId, channelName) {
    const channelResults = document.getElementById('channelResults');
    const channelVideos = document.getElementById('channelVideos');
    const selectedChannelNameEl = document.getElementById('selectedChannelName');
    const videoGrid = document.getElementById('videoGrid');
    const selectAllCheckbox = document.getElementById('selectAllVideos');

    selectedChannelName = channelName;
    selectedChannelNameEl.textContent = channelName;
    selectedVideos.clear();
    selectAllCheckbox.checked = false;
    updateSelectedCount();

    // Show loading state
    channelResults.classList.add('hidden');
    channelVideos.classList.remove('hidden');
    videoGrid.innerHTML = '<p class="loading-text">Loading videos...</p>';

    try {
        const response = await apiFetch(`/api/admin/youtube/channel-videos?channelId=${encodeURIComponent(channelId)}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to load videos');
        }

        const data = await response.json();
        youtubeVideos = data.videos || [];

        if (youtubeVideos.length === 0) {
            videoGrid.innerHTML = '<p class="no-results">No videos found for this channel.</p>';
        } else {
            renderVideoGrid();
        }
    } catch (error) {
        console.error('Error loading channel videos:', error);
        videoGrid.innerHTML = `<p class="error-text">Error: ${error.message}</p>`;
    }
}

function renderVideoGrid() {
    const videoGrid = document.getElementById('videoGrid');
    videoGrid.innerHTML = '';

    youtubeVideos.forEach(video => {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.dataset.videoId = video.videoId;

        if (selectedVideos.has(video.videoId)) {
            card.classList.add('selected');
        }

        card.innerHTML = `
            <div class="video-checkbox-wrapper">
                <input type="checkbox" class="video-checkbox" data-video-id="${video.videoId}" ${selectedVideos.has(video.videoId) ? 'checked' : ''}>
            </div>
            <img src="${video.thumbnail}" alt="${escapeHtml(video.title)}" class="video-thumbnail">
            <div class="video-info">
                <h5 class="video-title" title="${escapeHtml(video.title)}">${escapeHtml(video.title)}</h5>
                <p class="video-meta">${escapeHtml(video.duration || '')} ${video.viewCount ? `• ${video.viewCount}` : ''}</p>
                ${video.publishedTime ? `<p class="video-published">${escapeHtml(video.publishedTime)}</p>` : ''}
            </div>
        `;

        // Click on card (not checkbox) toggles selection
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('video-checkbox')) return;
            toggleVideoSelection(video.videoId);
        });

        // Checkbox click
        const checkbox = card.querySelector('.video-checkbox');
        checkbox.addEventListener('change', () => {
            toggleVideoSelection(video.videoId);
        });

        videoGrid.appendChild(card);
    });
}

function toggleVideoSelection(videoId) {
    if (selectedVideos.has(videoId)) {
        selectedVideos.delete(videoId);
    } else {
        if (selectedVideos.size >= 20) {
            alert('Maximum 20 videos can be selected at once');
            return;
        }
        selectedVideos.add(videoId);
    }

    // Update UI
    const card = document.querySelector(`.video-card[data-video-id="${videoId}"]`);
    const checkbox = card?.querySelector('.video-checkbox');
    if (card) {
        card.classList.toggle('selected', selectedVideos.has(videoId));
    }
    if (checkbox) {
        checkbox.checked = selectedVideos.has(videoId);
    }

    updateSelectedCount();
    updateSelectAllState();
}

function toggleSelectAllVideos() {
    const selectAllCheckbox = document.getElementById('selectAllVideos');
    const isChecked = selectAllCheckbox.checked;

    if (isChecked) {
        // Select all (up to 20)
        selectedVideos.clear();
        youtubeVideos.slice(0, 20).forEach(video => {
            selectedVideos.add(video.videoId);
        });
    } else {
        // Deselect all
        selectedVideos.clear();
    }

    renderVideoGrid();
    updateSelectedCount();
}

function updateSelectAllState() {
    const selectAllCheckbox = document.getElementById('selectAllVideos');
    const maxSelectable = Math.min(youtubeVideos.length, 20);
    selectAllCheckbox.checked = selectedVideos.size === maxSelectable;
    selectAllCheckbox.indeterminate = selectedVideos.size > 0 && selectedVideos.size < maxSelectable;
}

function updateSelectedCount() {
    const countEl = document.getElementById('selectedCount');
    const extractBtn = document.getElementById('extractSelectedBtn');
    countEl.textContent = selectedVideos.size;
    extractBtn.disabled = selectedVideos.size === 0;
}

function showChannelResults() {
    const channelResults = document.getElementById('channelResults');
    const channelVideos = document.getElementById('channelVideos');
    const extractionProgress = document.getElementById('extractionProgress');

    channelVideos.classList.add('hidden');
    extractionProgress.classList.add('hidden');
    channelResults.classList.remove('hidden');
}

async function extractSelectedVideos() {
    if (selectedVideos.size === 0) {
        alert('Please select at least one video');
        return;
    }

    const channelVideos = document.getElementById('channelVideos');
    const extractionProgress = document.getElementById('extractionProgress');
    const progressFill = document.getElementById('extractionProgressFill');
    const progressText = document.getElementById('extractionProgressText');
    const resultsContainer = document.getElementById('extractionResults');
    const extractBtn = document.getElementById('extractSelectedBtn');

    // Prepare videos array with details
    const videosToExtract = youtubeVideos
        .filter(v => selectedVideos.has(v.videoId))
        .map(v => ({ videoId: v.videoId, title: v.title }));

    // Show progress UI
    channelVideos.classList.add('hidden');
    extractionProgress.classList.remove('hidden');
    progressFill.style.width = '0%';
    progressText.textContent = `Extracting 0 of ${videosToExtract.length}...`;
    resultsContainer.innerHTML = '';
    extractBtn.disabled = true;

    try {
        const response = await apiFetch('/api/admin/youtube/bulk-extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                videos: videosToExtract,
                channelName: selectedChannelName
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Extraction failed');
        }

        // Update progress to complete
        progressFill.style.width = '100%';
        progressText.textContent = `Extraction complete!`;

        // Show results
        renderExtractionResults(data.results, data.summary);

        // Refresh admin stats
        await loadAdminStats();

    } catch (error) {
        console.error('Extraction error:', error);
        progressText.textContent = 'Extraction failed';
        resultsContainer.innerHTML = `<div class="extraction-error">Error: ${error.message}</div>`;
    } finally {
        extractBtn.disabled = false;
    }
}

function renderExtractionResults(results, summary) {
    const resultsContainer = document.getElementById('extractionResults');

    let html = `
        <div class="extraction-summary">
            <span class="summary-success">${summary.successful} succeeded</span>
            <span class="summary-failed">${summary.failed} failed</span>
        </div>
    `;

    if (results.success.length > 0) {
        html += '<div class="extraction-success-list"><h4>Successfully Extracted:</h4><ul>';
        results.success.forEach(item => {
            html += `<li><a href="/recipe/${generateSlug(item.title)}-${item.recipeId}" target="_blank">${escapeHtml(item.title)}</a></li>`;
        });
        html += '</ul></div>';
    }

    if (results.failed.length > 0) {
        html += '<div class="extraction-failed-list"><h4>Failed:</h4><ul>';
        results.failed.forEach(item => {
            html += `<li><strong>${escapeHtml(item.title || item.videoId)}</strong>: ${escapeHtml(item.error)}</li>`;
        });
        html += '</ul></div>';
    }

    html += `<button type="button" class="btn-secondary" onclick="showChannelResults()">Back to Videos</button>`;

    resultsContainer.innerHTML = html;
}

// ═══════════════════════════════════════════════════════════════════════════

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

// Load public recipes for landing page (no auth required)
async function loadPublicRecipes() {
    try {
        const response = await fetch('/api/public/recipes?limit=12');
        if (response.ok) {
            const data = await response.json();
            allRecipes = data.recipes;
            renderRandomRecipes();
        }
    } catch (error) {
        console.error('Error loading public recipes:', error);
    }
}

// Initialize
async function init() {
    filteredRecipes = [];
    setupEventListeners();
    setupRatingEventListeners();
    setupAdminEventListeners();
    setupYoutubeImportEventListeners();
    initAddRecipeForm();
    initImageUpload();

    // Load public recipes for landing page (before auth check)
    await loadPublicRecipes();

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
        // Find recipe in allRecipes
        const recipe = allRecipes.find(r => r.id === recipeId);
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
    if (!currentRecipeId || !currentRecipe) {
        console.error('Cannot reset: no current recipe', { currentRecipeId, currentRecipe });
        return;
    }

    if (!currentRecipe.ingredients || !currentRecipe.instructions) {
        console.error('Cannot reset: recipe missing data', currentRecipe);
        return;
    }

    // Reset all checkboxes to unchecked
    recipeState[currentRecipeId] = {
        ingredients: new Array(currentRecipe.ingredients.length).fill(false),
        instructions: new Array(currentRecipe.instructions.length).fill(false)
    };

    // Re-render the ingredients and instructions
    renderIngredients(currentRecipe, currentRecipeId);
    renderInstructions(currentRecipe, currentRecipeId);
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
        // Ensure form is initialized
        if (!formIngredientsList || !formInstructionsList) {
            initAddRecipeForm();
        }
        // Reset edit mode, fork mode, and title
        isEditMode = false;
        editingRecipeId = null;
        isForkMode = false;
        forkingFromRecipe = null;
        const modalTitle = addRecipeModal.querySelector('h2');
        if (modalTitle) {
            modalTitle.textContent = 'Add Recipe';
        }
        addRecipeModal.classList.remove('hidden');
    });

    resetBtn.addEventListener('click', resetRecipe);

    editRecipeBtn.addEventListener('click', () => {
        if (!isAuthenticated || !currentUser?.isAdmin || !currentRecipe) {
            return;
        }
        openEditRecipeModal(currentRecipe);
    });

    forkRecipeBtn.addEventListener('click', () => {
        if (!isAuthenticated || !currentRecipe) {
            showLoginModal();
            return;
        }
        if (currentRecipe.status !== 'approved') {
            alert('Only approved recipes can be forked');
            return;
        }
        openForkRecipeModal(currentRecipe);
    });

    cancelBtn.addEventListener('click', () => {
        addRecipeModal.classList.add('hidden');
        resetAddRecipeForm();
        hideAllConditionalFields();
        isEditMode = false;
        editingRecipeId = null;
        isForkMode = false;
        forkingFromRecipe = null;
    });

    addRecipeModal.addEventListener('click', (e) => {
        if (e.target === addRecipeModal) {
            addRecipeModal.classList.add('hidden');
            resetAddRecipeForm();
            hideAllConditionalFields();
            isEditMode = false;
            editingRecipeId = null;
            isForkMode = false;
            forkingFromRecipe = null;
        }
    });

    // Handle source dropdown change
    const sourceDropdown = document.getElementById('recipeSourceSelect');
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

    // Handle YouTube recipe extraction
    const extractYoutubeBtn = document.getElementById('extractYoutubeBtn');
    if (extractYoutubeBtn) {
        extractYoutubeBtn.addEventListener('click', extractRecipeFromYoutube);
    }

    addRecipeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addNewRecipe();
    });

    // Authentication event listeners
    loginBtn.addEventListener('click', showLoginModal);
    logoutBtn.addEventListener('click', handleLogout);
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    googleLoginBtn.addEventListener('click', handleGoogleSignIn);
    googleSignupBtn.addEventListener('click', handleGoogleSignIn);

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

// ═══════════════════════════════════════════════════════════════════════════
// ADD RECIPE FORM - Dynamic Ingredients & Instructions
// ═══════════════════════════════════════════════════════════════════════════

// Common cooking ingredients for autocomplete
const commonIngredients = [
    // Proteins
    'chicken breast', 'chicken thighs', 'ground beef', 'ground turkey', 'bacon', 'sausage',
    'salmon', 'shrimp', 'tuna', 'cod', 'tilapia', 'pork chops', 'pork tenderloin',
    'beef steak', 'lamb', 'tofu', 'tempeh', 'eggs',
    // Dairy
    'butter', 'milk', 'heavy cream', 'half and half', 'sour cream', 'cream cheese',
    'cheddar cheese', 'mozzarella cheese', 'parmesan cheese', 'feta cheese', 'goat cheese',
    'greek yogurt', 'yogurt', 'ricotta cheese', 'swiss cheese', 'provolone',
    // Vegetables
    'onion', 'garlic', 'tomatoes', 'bell pepper', 'jalapeño', 'carrot', 'celery',
    'potato', 'sweet potato', 'broccoli', 'cauliflower', 'spinach', 'kale', 'lettuce',
    'cabbage', 'zucchini', 'squash', 'mushrooms', 'corn', 'green beans', 'peas',
    'asparagus', 'cucumber', 'avocado', 'eggplant', 'brussels sprouts', 'leek', 'shallot',
    'green onion', 'ginger', 'beets', 'radish', 'artichoke',
    // Fruits
    'lemon', 'lime', 'orange', 'apple', 'banana', 'strawberries', 'blueberries',
    'raspberries', 'mango', 'pineapple', 'peach', 'pear', 'grapes', 'watermelon',
    // Grains & Pasta
    'rice', 'brown rice', 'quinoa', 'pasta', 'spaghetti', 'penne', 'fettuccine',
    'bread', 'bread crumbs', 'flour', 'all-purpose flour', 'whole wheat flour',
    'oats', 'couscous', 'tortillas', 'pita bread', 'noodles', 'ramen',
    // Canned & Jarred
    'tomato sauce', 'tomato paste', 'diced tomatoes', 'crushed tomatoes',
    'coconut milk', 'chicken broth', 'beef broth', 'vegetable broth',
    'black beans', 'kidney beans', 'chickpeas', 'lentils', 'olives',
    // Oils & Vinegars
    'olive oil', 'vegetable oil', 'coconut oil', 'sesame oil', 'avocado oil',
    'balsamic vinegar', 'red wine vinegar', 'apple cider vinegar', 'rice vinegar',
    // Seasonings & Spices
    'salt', 'black pepper', 'paprika', 'cumin', 'chili powder', 'cayenne pepper',
    'oregano', 'basil', 'thyme', 'rosemary', 'parsley', 'cilantro', 'dill',
    'cinnamon', 'nutmeg', 'ginger powder', 'turmeric', 'curry powder', 'bay leaves',
    'red pepper flakes', 'italian seasoning', 'garlic powder', 'onion powder',
    // Condiments & Sauces
    'soy sauce', 'worcestershire sauce', 'hot sauce', 'honey', 'maple syrup',
    'mustard', 'dijon mustard', 'mayonnaise', 'ketchup', 'salsa', 'pesto',
    'bbq sauce', 'teriyaki sauce', 'fish sauce', 'oyster sauce', 'hoisin sauce',
    // Baking
    'sugar', 'brown sugar', 'powdered sugar', 'vanilla extract', 'baking powder',
    'baking soda', 'yeast', 'cocoa powder', 'chocolate chips', 'cornstarch',
    // Nuts & Seeds
    'almonds', 'walnuts', 'pecans', 'peanuts', 'cashews', 'pine nuts',
    'sesame seeds', 'sunflower seeds', 'chia seeds', 'flax seeds', 'peanut butter'
];

// Measurement units
const measurementUnits = [
    { value: '', label: '—' },
    { value: 'tsp', label: 'tsp' },
    { value: 'tbsp', label: 'tbsp' },
    { value: 'cup', label: 'cup' },
    { value: 'oz', label: 'oz' },
    { value: 'lb', label: 'lb' },
    { value: 'g', label: 'g' },
    { value: 'kg', label: 'kg' },
    { value: 'ml', label: 'ml' },
    { value: 'L', label: 'L' },
    { value: 'pinch', label: 'pinch' },
    { value: 'dash', label: 'dash' },
    { value: 'clove', label: 'clove' },
    { value: 'slice', label: 'slice' },
    { value: 'piece', label: 'piece' },
    { value: 'can', label: 'can' },
    { value: 'bunch', label: 'bunch' },
    { value: 'sprig', label: 'sprig' }
];

// ═══════════════════════════════════════════════════════════════════════════
//    IMAGE UPLOAD FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function initImageUpload() {
    const imageInput = document.getElementById('recipeImageInput');
    const imagePreview = document.getElementById('imagePreview');
    const imagePreviewImg = document.getElementById('imagePreviewImg');
    const removeImageBtn = document.getElementById('removeImageBtn');

    if (!imageInput || !imagePreview) {
        console.error('Image upload elements not found');
        return;
    }

    // Click on preview to open file picker
    imagePreview.addEventListener('click', (e) => {
        // Don't trigger if clicking the remove button
        if (e.target === removeImageBtn || e.target.closest('.remove-image-btn')) {
            return;
        }
        imageInput.click();
    });

    // File input change
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImageSelect(file);
        }
    });

    // Drag and drop
    imagePreview.addEventListener('dragover', (e) => {
        e.preventDefault();
        imagePreview.classList.add('dragging');
    });

    imagePreview.addEventListener('dragleave', (e) => {
        e.preventDefault();
        imagePreview.classList.remove('dragging');
    });

    imagePreview.addEventListener('drop', (e) => {
        e.preventDefault();
        imagePreview.classList.remove('dragging');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageSelect(file);
            // Update the file input
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            imageInput.files = dataTransfer.files;
        }
    });

    // Remove image button
    removeImageBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        clearImagePreview();
    });
}

function handleImageSelect(file) {
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        alert('Image is too large. Please select an image under 5MB.');
        return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
    }

    selectedImageFile = file;
    uploadedImageUrl = null;

    // Show preview
    const imagePreview = document.getElementById('imagePreview');
    const imagePreviewImg = document.getElementById('imagePreviewImg');

    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreviewImg.src = e.target.result;
        imagePreview.classList.add('has-image');
    };
    reader.readAsDataURL(file);
}

function clearImagePreview() {
    const imageInput = document.getElementById('recipeImageInput');
    const imagePreview = document.getElementById('imagePreview');
    const imagePreviewImg = document.getElementById('imagePreviewImg');

    selectedImageFile = null;
    uploadedImageUrl = null;
    imageInput.value = '';
    imagePreviewImg.src = '';
    imagePreview.classList.remove('has-image');
}

async function uploadRecipeImage(file) {
    if (!file || !currentUser) return null;

    const progressContainer = document.getElementById('uploadProgress');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');

    try {
        progressContainer.classList.add('active');
        progressText.textContent = 'Uploading...';

        // Create unique filename
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const path = `recipes/${currentUser.id}/${timestamp}_${safeName}`;

        const storageRef = storage.ref(path);
        const uploadTask = storageRef.put(file);

        return new Promise((resolve, reject) => {
            uploadTask.on('state_changed',
                (snapshot) => {
                    // Progress
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    progressBar.style.setProperty('--progress', progress + '%');
                    progressText.textContent = `Uploading... ${Math.round(progress)}%`;
                },
                (error) => {
                    // Error
                    console.error('Upload error:', error);
                    progressContainer.classList.remove('active');
                    reject(error);
                },
                async () => {
                    // Complete
                    progressText.textContent = 'Upload complete!';
                    const downloadUrl = await uploadTask.snapshot.ref.getDownloadURL();
                    setTimeout(() => {
                        progressContainer.classList.remove('active');
                    }, 1000);
                    resolve(downloadUrl);
                }
            );
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        progressContainer.classList.remove('active');
        return null;
    }
}

// DOM elements for add recipe form (initialized in initAddRecipeForm)
let formIngredientsList = null;
let formInstructionsList = null;
let addIngredientBtn = null;
let addInstructionBtn = null;

let ingredientRowCount = 0;
let instructionStepCount = 0;

// Initialize the add recipe form
function initAddRecipeForm() {
    // Get DOM elements
    formIngredientsList = document.getElementById('formIngredientsList');
    formInstructionsList = document.getElementById('formInstructionsList');
    addIngredientBtn = document.getElementById('addIngredientBtn');
    addInstructionBtn = document.getElementById('addInstructionBtn');

    if (!formIngredientsList || !formInstructionsList || !addIngredientBtn || !addInstructionBtn) {
        console.error('Add recipe form elements not found');
        return;
    }

    // Add initial rows
    addIngredientRow();
    addIngredientRow();
    addIngredientRow();
    addInstructionStep();

    // Event listeners for add buttons (use arrow functions to avoid passing click event as initialValue)
    addIngredientBtn.addEventListener('click', () => addIngredientRow());
    addInstructionBtn.addEventListener('click', () => addInstructionStep());
}

// Add a new ingredient row
function addIngredientRow(initialValue = '') {
    if (!formIngredientsList) {
        console.error('formIngredientsList not initialized');
        return;
    }
    ingredientRowCount++;
    const row = document.createElement('div');
    row.className = 'ingredient-row';
    row.dataset.id = ingredientRowCount;

    // Parse initial value - try to extract quantity and unit
    let qty = '';
    let unit = '';
    let name = initialValue;

    if (initialValue) {
        // Try to match pattern: "2 cups flour", "1/2 tsp salt", "½ cup sugar", or "1-2 tbsp syrup" (ranges)
        // Include Unicode fractions: ½ ¼ ¾ ⅓ ⅔ ⅛ ⅜ ⅝ ⅞
        const match = initialValue.match(/^([\d½¼¾⅓⅔⅛⅜⅝⅞\/\.\s\-–]+)?\s*(cups?|tablespoons?|teaspoons?|tbsp|tsp|ounces?|oz|pounds?|lbs?|grams?|g|kg|kilograms?|ml|milliliters?|liters?|l|pinch|dash|cloves?|cans?|pkg|packages?|slices?|pieces?|bunch|head|stalks?)?\s*(.*)$/i);
        if (match) {
            qty = (match[1] || '').trim();
            unit = (match[2] || '').toLowerCase();
            name = (match[3] || initialValue).trim();

            // Normalize unit names to match dropdown values
            const unitMap = {
                'tablespoon': 'tbsp', 'tablespoons': 'tbsp',
                'teaspoon': 'tsp', 'teaspoons': 'tsp',
                'ounce': 'oz', 'ounces': 'oz',
                'pound': 'lb', 'pounds': 'lb', 'lbs': 'lb',
                'gram': 'g', 'grams': 'g',
                'kilogram': 'kg', 'kilograms': 'kg',
                'milliliter': 'ml', 'milliliters': 'ml',
                'liter': 'l', 'liters': 'l',
                'clove': 'cloves', 'can': 'cans',
                'package': 'pkg', 'packages': 'pkg',
                'slice': 'slices', 'piece': 'pieces',
                'stalk': 'stalks'
            };
            if (unitMap[unit]) {
                unit = unitMap[unit];
            }
            // Handle plural cups -> cup
            if (unit === 'cups') unit = 'cup';
        }
    }

    // Build unit options
    const unitOptions = measurementUnits.map(u =>
        `<option value="${u.value}" ${u.value.toLowerCase() === unit ? 'selected' : ''}>${u.label}</option>`
    ).join('');

    row.innerHTML = `
        <input type="text" class="quantity-input" placeholder="Qty" inputmode="decimal" value="${qty}">
        <select class="unit-select">
            ${unitOptions}
        </select>
        <div class="ingredient-input">
            <input type="text" class="ingredient-name" placeholder="Ingredient name" autocomplete="off" value="${name.replace(/"/g, '&quot;')}">
        </div>
        <button type="button" class="btn-remove-row" title="Remove ingredient">&times;</button>
    `;

    // Add event listeners
    const removeBtn = row.querySelector('.btn-remove-row');
    removeBtn.addEventListener('click', () => removeIngredientRow(row));

    const ingredientInput = row.querySelector('.ingredient-name');
    ingredientInput.addEventListener('input', (e) => showIngredientAutocomplete(e.target, row));
    ingredientInput.addEventListener('blur', () => {
        // Delay to allow click on autocomplete item
        setTimeout(() => hideIngredientAutocomplete(row), 150);
    });
    ingredientInput.addEventListener('keydown', (e) => handleAutocompleteKeydown(e, row));

    formIngredientsList.appendChild(row);
    updateEmptyState();
}

// Remove an ingredient row
function removeIngredientRow(row) {
    row.style.animation = 'ingredientSlideIn 0.2s var(--ease-out) reverse';
    setTimeout(() => {
        row.remove();
        updateEmptyState();
    }, 200);
}

// Show ingredient autocomplete
function showIngredientAutocomplete(input, row) {
    const value = input.value.toLowerCase().trim();
    hideIngredientAutocomplete(row);

    if (value.length < 2) return;

    const matches = commonIngredients.filter(ing =>
        ing.toLowerCase().includes(value)
    ).slice(0, 8);

    if (matches.length === 0) return;

    const dropdown = document.createElement('div');
    dropdown.className = 'ingredient-autocomplete';

    matches.forEach((match, index) => {
        const item = document.createElement('div');
        item.className = 'ingredient-autocomplete-item';
        item.textContent = match;
        item.dataset.index = index;
        item.addEventListener('mousedown', (e) => {
            e.preventDefault();
            input.value = match;
            hideIngredientAutocomplete(row);
        });
        dropdown.appendChild(item);
    });

    const inputWrapper = row.querySelector('.ingredient-input');
    inputWrapper.appendChild(dropdown);
}

// Hide ingredient autocomplete
function hideIngredientAutocomplete(row) {
    const existing = row.querySelector('.ingredient-autocomplete');
    if (existing) existing.remove();
}

// Handle keyboard navigation in autocomplete
function handleAutocompleteKeydown(e, row) {
    const dropdown = row.querySelector('.ingredient-autocomplete');
    if (!dropdown) return;

    const items = dropdown.querySelectorAll('.ingredient-autocomplete-item');
    const selected = dropdown.querySelector('.ingredient-autocomplete-item.selected');
    let selectedIndex = selected ? parseInt(selected.dataset.index) : -1;

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
        items.forEach((item, i) => item.classList.toggle('selected', i === selectedIndex));
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        items.forEach((item, i) => item.classList.toggle('selected', i === selectedIndex));
    } else if (e.key === 'Enter' && selected) {
        e.preventDefault();
        e.target.value = selected.textContent;
        hideIngredientAutocomplete(row);
    } else if (e.key === 'Escape') {
        hideIngredientAutocomplete(row);
    }
}

// Add a new instruction step
function addInstructionStep(initialValue = '') {
    if (!formInstructionsList) {
        console.error('formInstructionsList not initialized');
        return;
    }
    instructionStepCount++;
    const stepNumber = formInstructionsList.children.length + 1;

    const step = document.createElement('div');
    step.className = 'instruction-step';
    step.dataset.id = instructionStepCount;

    step.innerHTML = `
        <div class="step-number">${stepNumber}</div>
        <div class="step-content">
            <textarea placeholder="Describe this step..." rows="2">${initialValue.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
            <button type="button" class="btn-remove-row" title="Remove step">&times;</button>
        </div>
    `;

    const removeBtn = step.querySelector('.btn-remove-row');
    removeBtn.addEventListener('click', () => removeInstructionStep(step));

    formInstructionsList.appendChild(step);
    updateEmptyState();
}

// Remove an instruction step
function removeInstructionStep(step) {
    step.style.animation = 'stepSlideIn 0.2s var(--ease-out) reverse';
    setTimeout(() => {
        step.remove();
        renumberInstructionSteps();
        updateEmptyState();
    }, 200);
}

// Renumber instruction steps after removal
function renumberInstructionSteps() {
    if (!formInstructionsList) return;
    const steps = formInstructionsList.querySelectorAll('.instruction-step');
    steps.forEach((step, index) => {
        step.querySelector('.step-number').textContent = index + 1;
    });
}

// Update empty state messages
function updateEmptyState() {
    if (!formIngredientsList || !formInstructionsList) return;

    // Check ingredients
    if (formIngredientsList.children.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'empty-list-message';
        emptyMsg.innerHTML = '<span>🥗</span>Click "+ Add Ingredient" to start adding ingredients';
        formIngredientsList.appendChild(emptyMsg);
    } else {
        const emptyMsg = formIngredientsList.querySelector('.empty-list-message');
        if (emptyMsg) emptyMsg.remove();
    }

    // Check instructions
    if (formInstructionsList.children.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'empty-list-message';
        emptyMsg.innerHTML = '<span>📝</span>Click "+ Add Step" to start adding instructions';
        formInstructionsList.appendChild(emptyMsg);
    } else {
        const emptyMsg = formInstructionsList.querySelector('.empty-list-message');
        if (emptyMsg) emptyMsg.remove();
    }
}

// Get ingredients from the dynamic form
function getIngredientsFromForm() {
    const ingredients = [];
    if (!formIngredientsList) return ingredients;
    const rows = formIngredientsList.querySelectorAll('.ingredient-row');

    rows.forEach(row => {
        const qty = row.querySelector('.quantity-input').value.trim();
        const unit = row.querySelector('.unit-select').value;
        const name = row.querySelector('.ingredient-name').value.trim();

        if (name) {
            let ingredientText = '';
            if (qty) ingredientText += qty + ' ';
            if (unit) ingredientText += unit + ' ';
            ingredientText += name;
            ingredients.push(ingredientText.trim());
        }
    });

    return ingredients;
}

// Get instructions from the dynamic form
function getInstructionsFromForm() {
    const instructions = [];
    if (!formInstructionsList) return instructions;
    const steps = formInstructionsList.querySelectorAll('.instruction-step');

    steps.forEach(step => {
        const text = step.querySelector('textarea').value.trim();
        if (text) {
            instructions.push(text);
        }
    });

    return instructions;
}

// Reset the add recipe form
function resetAddRecipeForm() {
    addRecipeForm.reset();

    // Clear image preview
    clearImagePreview();

    // Ensure form is initialized
    if (!formIngredientsList || !formInstructionsList) {
        initAddRecipeForm();
        return;
    }

    // Clear dynamic lists
    formIngredientsList.innerHTML = '';
    formInstructionsList.innerHTML = '';
    ingredientRowCount = 0;
    instructionStepCount = 0;

    // Add initial rows
    addIngredientRow();
    addIngredientRow();
    addIngredientRow();
    addInstructionStep();

    hideAllConditionalFields();
}

// Extract recipe from YouTube video using AI
async function extractRecipeFromYoutube() {
    const youtubeUrl = document.getElementById('youtubeUrl').value.trim();

    if (!youtubeUrl) {
        alert('Please enter a YouTube URL first');
        return;
    }

    // Show loading state
    const btn = document.getElementById('extractYoutubeBtn');
    const textSpan = btn.querySelector('.extract-text');
    const loadingSpan = btn.querySelector('.extract-loading');

    btn.disabled = true;
    textSpan.classList.add('hidden');
    loadingSpan.classList.remove('hidden');

    try {
        const response = await apiFetch('/api/youtube/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ youtubeUrl })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to extract recipe');
        }

        // Ensure form is initialized
        if (!formIngredientsList || !formInstructionsList) {
            initAddRecipeForm();
        }

        // Populate recipe name
        if (data.recipe.title) {
            document.getElementById('recipeName').value = data.recipe.title;
        }

        // Populate author (channel name)
        if (data.recipe.author) {
            document.getElementById('recipeAuthorInput').value = data.recipe.author;
        }

        // Clear and populate ingredients
        formIngredientsList.innerHTML = '';
        ingredientRowCount = 0;
        if (data.recipe.ingredients && data.recipe.ingredients.length > 0) {
            data.recipe.ingredients.forEach(ingredient => {
                addIngredientRow(ingredient);
            });
        } else {
            addIngredientRow();
        }

        // Clear and populate instructions
        formInstructionsList.innerHTML = '';
        instructionStepCount = 0;
        if (data.recipe.instructions && data.recipe.instructions.length > 0) {
            data.recipe.instructions.forEach(instruction => {
                addInstructionStep(instruction);
            });
        } else {
            addInstructionStep();
        }

        // Set YouTube thumbnail as recipe image
        if (data.recipe.thumbnailUrl) {
            uploadedImageUrl = data.recipe.thumbnailUrl;
            const imagePreview = document.getElementById('imagePreview');
            const previewImg = document.getElementById('previewImg');
            if (imagePreview && previewImg) {
                previewImg.src = data.recipe.thumbnailUrl;
                imagePreview.classList.remove('hidden');
            }
        }

        alert('Recipe extracted! Please review and edit the details before saving.');

    } catch (error) {
        console.error('Extract error:', error);
        alert(error.message || 'Failed to extract recipe from video');
    } finally {
        // Reset button state
        btn.disabled = false;
        textSpan.classList.remove('hidden');
        loadingSpan.classList.add('hidden');
    }
}

// Open edit recipe modal with pre-populated data
function openEditRecipeModal(recipe) {
    // Ensure form is initialized
    if (!formIngredientsList || !formInstructionsList) {
        initAddRecipeForm();
    }

    // Set edit mode
    isEditMode = true;
    editingRecipeId = recipe.id;

    // Update modal title
    const modalTitle = addRecipeModal.querySelector('h2');
    if (modalTitle) {
        modalTitle.textContent = 'Edit Recipe';
    }

    // Populate basic fields
    document.getElementById('recipeName').value = recipe.name || '';
    document.getElementById('recipeAuthorInput').value = recipe.author || '';

    // Set source type and show relevant fields
    const sourceType = recipe.source?.type || recipe.source_type || 'manual';
    document.getElementById('recipeSourceSelect').value = sourceType;
    hideAllConditionalFields();

    if (sourceType === 'youtube') {
        document.getElementById('youtubeFields').classList.remove('hidden');
        document.getElementById('youtubeUrl').value = recipe.source?.youtubeUrl || '';
    } else if (sourceType === 'cookbook') {
        document.getElementById('cookbookFields').classList.remove('hidden');
        document.getElementById('bookName').value = recipe.source?.bookName || '';
        document.getElementById('amazonLink').value = recipe.source?.amazonLink || '';
    }

    // Clear and populate ingredients
    formIngredientsList.innerHTML = '';
    ingredientRowCount = 0;
    const ingredients = recipe.ingredients || [];
    if (ingredients.length > 0) {
        ingredients.forEach(ingredient => {
            addIngredientRow(ingredient);
        });
    } else {
        addIngredientRow();
        addIngredientRow();
    }

    // Clear and populate instructions
    formInstructionsList.innerHTML = '';
    instructionStepCount = 0;
    const instructions = recipe.instructions || [];
    if (instructions.length > 0) {
        instructions.forEach(instruction => {
            addInstructionStep(instruction);
        });
    } else {
        addInstructionStep();
    }

    // Set image preview if exists
    if (recipe.image) {
        uploadedImageUrl = recipe.image;
        const imagePreview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
        if (imagePreview && previewImg) {
            previewImg.src = recipe.image;
            imagePreview.classList.remove('hidden');
        }
    }

    // Show modal
    addRecipeModal.classList.remove('hidden');
}

// Open modal to fork a recipe
function openForkRecipeModal(recipe) {
    // Ensure form is initialized
    if (!formIngredientsList || !formInstructionsList) {
        initAddRecipeForm();
    }

    // Set fork mode (not edit mode - this creates a new recipe)
    isEditMode = false;
    editingRecipeId = null;
    isForkMode = true;
    forkingFromRecipe = recipe;

    // Update modal title
    const modalTitle = addRecipeModal.querySelector('h2');
    if (modalTitle) {
        modalTitle.textContent = 'Fork Recipe';
    }

    // Populate basic fields - start with original recipe data
    document.getElementById('recipeName').value = recipe.name ? `${recipe.name} (Fork)` : '';
    document.getElementById('recipeAuthorInput').value = currentUser?.displayName || '';

    // Set source type - default to manual for forked recipes
    document.getElementById('recipeSourceSelect').value = 'manual';
    hideAllConditionalFields();

    // Clear and populate ingredients from original recipe
    formIngredientsList.innerHTML = '';
    ingredientRowCount = 0;
    const ingredients = recipe.ingredients || [];
    if (ingredients.length > 0) {
        ingredients.forEach(ingredient => {
            addIngredientRow(ingredient);
        });
    } else {
        addIngredientRow();
        addIngredientRow();
    }

    // Clear and populate instructions from original recipe
    formInstructionsList.innerHTML = '';
    instructionStepCount = 0;
    const instructions = recipe.instructions || [];
    if (instructions.length > 0) {
        instructions.forEach(instruction => {
            addInstructionStep(instruction);
        });
    } else {
        addInstructionStep();
    }

    // Clear image - user should add their own for the fork
    uploadedImageUrl = null;
    selectedImageFile = null;
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) {
        imagePreview.classList.add('hidden');
    }
    const imageInput = document.getElementById('recipeImage');
    if (imageInput) {
        imageInput.value = '';
    }

    // Show modal
    addRecipeModal.classList.remove('hidden');
}

// Add new recipe or update existing
async function addNewRecipe() {
    if (!isAuthenticated) {
        alert('Please login to add recipes');
        return;
    }

    const name = document.getElementById('recipeName').value.trim();
    const author = document.getElementById('recipeAuthorInput').value.trim();
    const sourceType = document.getElementById('recipeSourceSelect').value;

    const ingredients = getIngredientsFromForm();
    const instructions = getInstructionsFromForm();

    if (!name) {
        alert('Please enter a recipe name');
        return;
    }

    if (!author) {
        alert('Please enter an author name');
        return;
    }

    if (ingredients.length === 0) {
        alert('Please add at least one ingredient');
        return;
    }

    if (instructions.length === 0) {
        alert('Please add at least one instruction step');
        return;
    }

    if (!sourceType) {
        alert('Please select a recipe source');
        return;
    }

    // Build source object based on type
    let source = { type: sourceType };
    if (sourceType === 'youtube') {
        source.youtubeUrl = document.getElementById('youtubeUrl').value;
    } else if (sourceType === 'cookbook') {
        source.bookName = document.getElementById('bookName').value;
        source.amazonLink = document.getElementById('amazonLink').value;
    }

    // Upload image if selected, or use existing uploadedImageUrl (from edit mode or YouTube thumbnail)
    let imageUrl = uploadedImageUrl || null;
    if (selectedImageFile) {
        try {
            imageUrl = await uploadRecipeImage(selectedImageFile);
            if (!imageUrl) {
                alert('Failed to upload image. Please try again.');
                return;
            }
        } catch (error) {
            console.error('Image upload failed:', error);
            alert('Failed to upload image. Please try again.');
            return;
        }
    }

    const recipeData = {
        name: name,
        author: author,
        image: imageUrl,
        source: source,
        ingredients: ingredients,
        instructions: instructions
    };

    // Add forked_from field if forking a recipe (just the recipe ID - backend will lookup the name)
    if (isForkMode && forkingFromRecipe) {
        recipeData.forked_from = forkingFromRecipe.id;
    }

    console.log(isEditMode ? 'Updating recipe:' : 'Submitting recipe:', recipeData);

    try {
        const url = isEditMode ? `/api/admin/recipes/${editingRecipeId}` : '/api/recipes';
        const method = isEditMode ? 'PUT' : 'POST';

        const response = await apiFetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(recipeData)
        });

        const data = await response.json();

        if (response.ok) {
            const recipeId = isEditMode ? editingRecipeId : data.recipe.id;

            if (isEditMode) {
                // Clear all caches to ensure fresh data is fetched
                clearCache();

                // Update the recipe in local arrays with full data from response
                const updatedRecipe = { ...recipeData, id: editingRecipeId, source: source };
                const recipeIndex = recipes.findIndex(r => r.id === editingRecipeId);
                if (recipeIndex !== -1) {
                    recipes[recipeIndex] = { ...recipes[recipeIndex], ...updatedRecipe };
                }
                const allRecipeIndex = allRecipes.findIndex(r => r.id === editingRecipeId);
                if (allRecipeIndex !== -1) {
                    allRecipes[allRecipeIndex] = { ...allRecipes[allRecipeIndex], ...updatedRecipe };
                }
                // Clear currentRecipe so it will be refetched
                currentRecipe = null;
            } else {
                // Add the new recipe to local array
                // Transform source_data to source for frontend compatibility
                const newRecipe = { ...data.recipe };
                if (newRecipe.source_data) {
                    newRecipe.source = newRecipe.source_data;
                }
                recipes.push(newRecipe);
            }

            // Clear search and update filtered list
            searchInput.value = '';
            searchQuery = '';
            filteredRecipes = [];
            searchClearBtn.classList.remove('visible');

            // Reset edit mode and fork mode before rendering
            const wasEditMode = isEditMode;
            isEditMode = false;
            editingRecipeId = null;
            isForkMode = false;
            forkingFromRecipe = null;

            addRecipeModal.classList.add('hidden');
            resetAddRecipeForm();
            hideAllConditionalFields();

            renderRecipeList();
            renderRandomRecipes();

            // Force fetch fresh recipe data from API
            if (wasEditMode) {
                // Fetch fresh data directly from API
                try {
                    const freshResponse = await fetch(`/api/recipes/${recipeId}`);
                    if (freshResponse.ok) {
                        const freshData = await freshResponse.json();
                        currentRecipe = freshData.recipe;
                        if (currentRecipe.source_data) {
                            currentRecipe.source = currentRecipe.source_data;
                        }
                    }
                } catch (e) {
                    console.error('Error fetching fresh recipe:', e);
                }
            }

            // Show the recipe
            showRecipeById(recipeId, false);
        } else {
            alert(data.error || (isEditMode ? 'Failed to update recipe' : 'Failed to add recipe'));
        }
    } catch (error) {
        console.error(isEditMode ? 'Error updating recipe:' : 'Error adding recipe:', error);
        alert(isEditMode ? 'An error occurred while updating the recipe' : 'An error occurred while adding the recipe');
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
