require('dotenv').config();

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Initialize Firebase Admin
// When running locally, connect to emulators if FIRESTORE_EMULATOR_HOST is set
if (process.env.FUNCTIONS_EMULATOR === 'true' || process.env.FIRESTORE_EMULATOR_HOST) {
    admin.initializeApp({ projectId: 'gitdish' });
} else {
    admin.initializeApp();
}
const db = admin.firestore();

const app = express();

// Trust proxy for secure cookies behind Firebase hosting
app.set('trust proxy', 1);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Email transporter configuration
let emailTransporter;

if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    emailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });
    console.log('Email configured with Gmail:', process.env.GMAIL_USER);
} else {
    emailTransporter = {
        sendMail: async (mailOptions) => {
            console.log('\n=== EMAIL WOULD BE SENT ===');
            console.log('To:', mailOptions.to);
            console.log('Subject:', mailOptions.subject);
            console.log('===========================\n');
            return { messageId: 'dev-' + Date.now() };
        }
    };
    console.log('⚠️  No Gmail credentials. Emails will be logged.');
}

// ============================================
// FIRESTORE COLLECTIONS
// ============================================
// Collections: users, recipes, folders, folder_recipes, folder_collaborators, invitations, ratings

// ============================================
// MIDDLEWARE
// ============================================

// Verify Firebase ID token and attach user info to request
async function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        // Verify the ID token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken;
        req.userId = decodedToken.uid;
        next();
    } catch (error) {
        console.error('Error verifying ID token:', error);
        return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
}

// ============================================
// INITIALIZATION - SEED SAMPLE RECIPES
// ============================================

const sampleRecipes = [
    {
        id: 'recipe_1',
        user_id: 'system',
        name: "Classic Spaghetti Carbonara",
        author: "Marco Rossi",
        image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&h=600&fit=crop",
        source_type: "youtube",
        source_data: {
            type: "youtube",
            youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        ingredients: [
            "400g spaghetti",
            "200g guanciale or pancetta",
            "4 large eggs",
            "100g Pecorino Romano cheese, grated",
            "Black pepper to taste",
            "Salt for pasta water"
        ],
        instructions: [
            "Bring a large pot of salted water to boil and cook spaghetti according to package directions",
            "While pasta cooks, cut guanciale into small strips and cook in a large pan until crispy",
            "In a bowl, whisk together eggs, grated Pecorino, and plenty of black pepper",
            "Reserve 1 cup of pasta water, then drain the spaghetti",
            "Remove pan from heat, add pasta to the guanciale",
            "Quickly stir in the egg mixture, adding pasta water as needed to create a creamy sauce",
            "Serve immediately with extra Pecorino and black pepper"
        ],
        created_at: null
    },
    {
        id: 'recipe_2',
        user_id: 'system',
        name: "Chicken Tikka Masala",
        author: "Priya Sharma",
        image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&h=600&fit=crop",
        source_type: "cookbook",
        source_data: {
            type: "cookbook",
            bookName: "Indian Cuisine Masterclass",
            amazonLink: "https://www.amazon.com/dp/example"
        },
        ingredients: [
            "500g chicken breast, cubed",
            "1 cup yogurt",
            "2 tbsp tikka masala spice blend",
            "3 tbsp butter",
            "1 onion, diced",
            "3 cloves garlic, minced",
            "1 tbsp ginger, grated",
            "400ml tomato sauce",
            "200ml heavy cream",
            "Fresh cilantro for garnish"
        ],
        instructions: [
            "Marinate chicken in yogurt and half the tikka masala spices for at least 1 hour",
            "Grill or pan-fry the marinated chicken until cooked through, set aside",
            "In a large pan, melt butter and sauté onion until softened",
            "Add garlic and ginger, cook for 1 minute until fragrant",
            "Stir in remaining spices and cook for 30 seconds",
            "Add tomato sauce and simmer for 10 minutes",
            "Stir in cream and cooked chicken, simmer for another 5 minutes",
            "Garnish with fresh cilantro and serve with rice or naan"
        ],
        created_at: null
    },
    {
        id: 'recipe_3',
        user_id: 'system',
        name: "Chocolate Chip Cookies",
        author: "Betty Johnson",
        image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&h=600&fit=crop",
        source_type: "manual",
        source_data: {
            type: "manual"
        },
        ingredients: [
            "2 1/4 cups all-purpose flour",
            "1 tsp baking soda",
            "1 tsp salt",
            "1 cup butter, softened",
            "3/4 cup granulated sugar",
            "3/4 cup brown sugar",
            "2 large eggs",
            "2 tsp vanilla extract",
            "2 cups chocolate chips"
        ],
        instructions: [
            "Preheat oven to 375°F (190°C)",
            "Mix flour, baking soda, and salt in a bowl",
            "In another bowl, cream together butter and both sugars until fluffy",
            "Beat in eggs and vanilla",
            "Gradually blend in the dry ingredients",
            "Stir in chocolate chips",
            "Drop rounded tablespoons of dough onto ungreased cookie sheets",
            "Bake for 9-11 minutes or until golden brown",
            "Cool on baking sheet for 2 minutes, then transfer to wire rack"
        ],
        created_at: null
    },
    {
        id: 'recipe_4',
        user_id: 'system',
        name: "Greek Salad",
        author: "Nikos Papadopoulos",
        image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop",
        source_type: "manual",
        source_data: {
            type: "manual"
        },
        ingredients: [
            "4 large tomatoes, cut into wedges",
            "1 cucumber, sliced",
            "1 red onion, thinly sliced",
            "1 green bell pepper, sliced",
            "200g feta cheese, cubed",
            "1/2 cup Kalamata olives",
            "3 tbsp olive oil",
            "1 tbsp red wine vinegar",
            "1 tsp dried oregano",
            "Salt and pepper to taste"
        ],
        instructions: [
            "Combine tomatoes, cucumber, onion, and bell pepper in a large bowl",
            "Add feta cheese and olives",
            "Drizzle with olive oil and vinegar",
            "Sprinkle with oregano, salt, and pepper",
            "Toss gently to combine",
            "Serve immediately or chill for 30 minutes before serving"
        ],
        created_at: null
    }
];

// Seed sample recipes on first deploy
async function seedSampleRecipes() {
    try {
        const recipesRef = db.collection('recipes');
        for (const recipe of sampleRecipes) {
            const recipeDoc = await recipesRef.doc(recipe.id).get();
            if (!recipeDoc.exists) {
                // Add timestamp when actually inserting
                const recipeWithTimestamp = {
                    ...recipe,
                    created_at: admin.firestore.FieldValue.serverTimestamp()
                };
                await recipesRef.doc(recipe.id).set(recipeWithTimestamp);
                console.log(`Seeded recipe: ${recipe.name}`);
            }
        }
    } catch (error) {
        console.error('Error seeding recipes:', error);
    }
}

// Seed on first request (not at module load to avoid deployment errors)
let seeded = false;
app.use(async (req, res, next) => {
    if (!seeded) {
        seeded = true;
        seedSampleRecipes().catch(err => console.error('Seed error:', err));
    }
    next();
});

// ============================================
// AUTHENTICATION ROUTES (Firebase Auth)
// ============================================

// Create user document in Firestore (called after Firebase Auth signup)
app.post('/api/user/create', requireAuth, async (req, res) => {
    try {
        const { email, username } = req.body;
        const userId = req.userId; // Firebase Auth UID

        // Check if user document already exists
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            return res.json({
                success: true,
                user: { id: userId, username: userData.username, email: userData.email }
            });
        }

        // Validate username
        if (!username || username.trim().length === 0) {
            return res.status(400).json({ error: 'Username is required' });
        }

        const trimmedUsername = username.trim();

        // Check if username is taken by another user
        const usernameQuery = await db.collection('users').where('username', '==', trimmedUsername).get();
        if (!usernameQuery.empty) {
            return res.status(400).json({ error: 'Username already taken' });
        }

        // Create user document with the exact username provided
        await db.collection('users').doc(userId).set({
            username: trimmedUsername,
            email: email.toLowerCase(),
            created_at: admin.firestore.FieldValue.serverTimestamp()
        });

        // Create default folders
        await ensureDefaultFolders(userId);

        res.json({
            success: true,
            user: { id: userId, username: trimmedUsername, email: email.toLowerCase() }
        });
    } catch (error) {
        console.error('User creation error:', error);
        res.status(500).json({ error: 'Error creating user' });
    }
});

// Helper to ensure default folders exist for a user
async function ensureDefaultFolders(userId) {
    const foldersRef = db.collection('folders');

    // Get all folders for this user
    const userFolders = await foldersRef.where('user_id', '==', userId).get();
    const folderNames = userFolders.docs.map(doc => doc.data().name);

    console.log(`User ${userId} has folders: ${folderNames.join(', ') || 'none'}`);

    // Check for Favorites
    if (!folderNames.includes('Favorites')) {
        await foldersRef.add({
            user_id: userId,
            name: 'Favorites',
            is_system: true,
            created_at: new Date().toISOString()
        });
        console.log(`Created Favorites folder for user ${userId}`);
    }

    // Check for History
    if (!folderNames.includes('History')) {
        await foldersRef.add({
            user_id: userId,
            name: 'History',
            is_system: true,
            created_at: new Date().toISOString()
        });
        console.log(`Created History folder for user ${userId}`);
    }
}

// Repair endpoint to fix accounts created during migration
app.post('/api/user/repair', requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const firebaseUser = await admin.auth().getUser(userId);

        // Get the display name from Firebase Auth
        const correctUsername = firebaseUser.displayName || firebaseUser.email.split('@')[0];

        // Update the Firestore user document with correct username
        const userDoc = await db.collection('users').doc(userId).get();

        if (userDoc.exists) {
            await db.collection('users').doc(userId).update({
                username: correctUsername
            });
        } else {
            // Create user doc if it doesn't exist
            await db.collection('users').doc(userId).set({
                username: correctUsername,
                email: firebaseUser.email.toLowerCase(),
                created_at: admin.firestore.FieldValue.serverTimestamp()
            });
        }

        // Ensure folders exist
        await ensureDefaultFolders(userId);

        res.json({
            success: true,
            user: { id: userId, username: correctUsername, email: firebaseUser.email }
        });
    } catch (error) {
        console.error('Repair error:', error);
        res.status(500).json({ error: 'Error repairing account' });
    }
});

app.get('/api/user', requireAuth, async (req, res) => {
    try {
        const userDoc = await db.collection('users').doc(req.userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = userDoc.data();
        res.json({
            user: {
                id: userDoc.id,
                username: userData.username,
                email: userData.email
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Error fetching user' });
    }
});

// ============================================
// RECIPE ROUTES
// ============================================

app.get('/api/recipes', requireAuth, async (req, res) => {
    try {
        const userId = req.userId;

        // Fetch all recipes (user's recipes + system recipes)
        const recipesSnapshot = await db.collection('recipes')
            .where('user_id', 'in', [userId, 'system'])
            .orderBy('created_at', 'desc')
            .get();

        const recipeIds = recipesSnapshot.docs.map(doc => doc.id);

        // Batch fetch all ratings at once (instead of N separate queries)
        let ratingsMap = {};
        if (recipeIds.length > 0) {
            // Firestore 'in' queries limited to 30 items, so batch them
            const batchSize = 30;
            for (let i = 0; i < recipeIds.length; i += batchSize) {
                const batch = recipeIds.slice(i, i + batchSize);
                const ratingsSnapshot = await db.collection('ratings')
                    .where('recipe_id', 'in', batch)
                    .get();

                ratingsSnapshot.forEach(ratingDoc => {
                    const data = ratingDoc.data();
                    if (!ratingsMap[data.recipe_id]) {
                        ratingsMap[data.recipe_id] = { total: 0, count: 0 };
                    }
                    ratingsMap[data.recipe_id].total += data.rating;
                    ratingsMap[data.recipe_id].count++;
                });
            }
        }

        // Build recipe list with pre-fetched ratings
        const recipes = recipesSnapshot.docs.map(doc => {
            const recipe = { id: doc.id, ...doc.data() };
            const ratingData = ratingsMap[doc.id] || { total: 0, count: 0 };
            recipe.averageRating = ratingData.count > 0
                ? Math.round((ratingData.total / ratingData.count) * 10) / 10
                : 0;
            recipe.ratingCount = ratingData.count;
            return recipe;
        });

        res.json({ recipes });
    } catch (error) {
        console.error('Error fetching recipes:', error);
        res.status(500).json({ error: 'Error fetching recipes' });
    }
});

app.post('/api/recipes', requireAuth, async (req, res) => {
    try {
        const { name, author, image, source, ingredients, instructions } = req.body;
        const userId = req.userId;

        // Validate required fields
        if (!name || !ingredients || !instructions) {
            return res.status(400).json({ error: 'Missing required fields: name, ingredients, or instructions' });
        }

        if (!source || !source.type) {
            return res.status(400).json({ error: 'Missing source type' });
        }

        const recipeData = {
            user_id: userId,
            name,
            author: author || '',
            image: image || null,
            source_type: source.type,
            source_data: source,
            ingredients: Array.isArray(ingredients) ? ingredients : [],
            instructions: Array.isArray(instructions) ? instructions : [],
            created_at: admin.firestore.FieldValue.serverTimestamp()
        };

        const recipeRef = await db.collection('recipes').add(recipeData);

        res.json({
            success: true,
            recipe: {
                id: recipeRef.id,
                ...recipeData,
                created_at: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error saving recipe:', error.message, error.stack);
        res.status(500).json({ error: 'Error saving recipe: ' + error.message });
    }
});

// Get single recipe by ID (public - for shared links)
app.get('/api/recipes/:id', async (req, res) => {
    try {
        const recipeId = req.params.id;

        const recipeDoc = await db.collection('recipes').doc(recipeId).get();

        if (!recipeDoc.exists) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        const recipeData = recipeDoc.data();

        // Get ratings for this recipe
        const ratingsSnapshot = await db.collection('ratings')
            .where('recipe_id', '==', recipeId)
            .get();

        let totalRating = 0;
        let ratingCount = 0;

        ratingsSnapshot.forEach(ratingDoc => {
            totalRating += ratingDoc.data().rating;
            ratingCount++;
        });

        const recipe = {
            id: recipeDoc.id,
            ...recipeData,
            averageRating: ratingCount > 0 ? Math.round((totalRating / ratingCount) * 10) / 10 : 0,
            ratingCount
        };

        res.json({ recipe });
    } catch (error) {
        console.error('Error fetching recipe:', error);
        res.status(500).json({ error: 'Error fetching recipe' });
    }
});

// ============================================
// RATING ROUTES
// ============================================

app.get('/api/recipes/:id/rating', async (req, res) => {
    try {
        const recipeId = req.params.id;
        const userId = req.userId;

        // Get all ratings for this recipe
        const ratingsSnapshot = await db.collection('ratings')
            .where('recipe_id', '==', recipeId)
            .get();

        let totalRating = 0;
        let ratingCount = 0;
        let userRating = null;

        ratingsSnapshot.forEach(doc => {
            const rating = doc.data();
            totalRating += rating.rating;
            ratingCount++;

            if (userId && rating.user_id === userId) {
                userRating = rating.rating;
            }
        });

        res.json({
            averageRating: ratingCount > 0 ? Math.round((totalRating / ratingCount) * 10) / 10 : 0,
            ratingCount,
            userRating,
            hasRated: userRating !== null
        });
    } catch (error) {
        console.error('Error fetching rating:', error);
        res.status(500).json({ error: 'Error fetching rating' });
    }
});

app.post('/api/recipes/:id/rating', requireAuth, async (req, res) => {
    try {
        const recipeId = req.params.id;
        const userId = req.userId;
        const { rating } = req.body;

        // Validate rating
        if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
            return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
        }

        // Check if user already rated this recipe
        const existingRatingSnapshot = await db.collection('ratings')
            .where('user_id', '==', userId)
            .where('recipe_id', '==', recipeId)
            .get();

        if (!existingRatingSnapshot.empty) {
            // Update existing rating
            const ratingDoc = existingRatingSnapshot.docs[0];
            await ratingDoc.ref.update({ rating });
        } else {
            // Create new rating
            await db.collection('ratings').add({
                user_id: userId,
                recipe_id: recipeId,
                rating,
                created_at: null
            });
        }

        // Fetch updated average
        const ratingsSnapshot = await db.collection('ratings')
            .where('recipe_id', '==', recipeId)
            .get();

        let totalRating = 0;
        let ratingCount = 0;

        ratingsSnapshot.forEach(doc => {
            totalRating += doc.data().rating;
            ratingCount++;
        });

        res.json({
            success: true,
            userRating: rating,
            averageRating: Math.round((totalRating / ratingCount) * 10) / 10,
            ratingCount
        });
    } catch (error) {
        console.error('Error saving rating:', error);
        res.status(500).json({ error: 'Error saving rating' });
    }
});

// ============================================
// FOLDER ROUTES
// ============================================

app.get('/api/folders', requireAuth, async (req, res) => {
    try {
        const userId = req.userId;

        // Parallel fetch: owned folders and collaborator relationships
        const [ownedFoldersSnapshot, collaboratorSnapshot] = await Promise.all([
            db.collection('folders').where('user_id', '==', userId).get(),
            db.collection('folder_collaborators').where('user_id', '==', userId).get()
        ]);

        const collaboratorFolderIds = collaboratorSnapshot.docs.map(doc => doc.data().folder_id);

        // Fetch collaborated folders in parallel (if any)
        let collaboratedFolders = [];
        if (collaboratorFolderIds.length > 0) {
            const collaboratedFoldersPromises = collaboratorFolderIds.map(id =>
                db.collection('folders').doc(id).get()
            );
            collaboratedFolders = await Promise.all(collaboratedFoldersPromises);
        }

        // Collect all folder IDs we need counts for
        const allFolderIds = [
            ...ownedFoldersSnapshot.docs.map(doc => doc.id),
            ...collaboratorFolderIds
        ];

        // Batch fetch recipe counts for all folders at once
        const recipeCounts = {};
        if (allFolderIds.length > 0) {
            const batchSize = 30;
            for (let i = 0; i < allFolderIds.length; i += batchSize) {
                const batch = allFolderIds.slice(i, i + batchSize);
                const folderRecipesSnapshot = await db.collection('folder_recipes')
                    .where('folder_id', 'in', batch)
                    .get();

                folderRecipesSnapshot.forEach(doc => {
                    const folderId = doc.data().folder_id;
                    recipeCounts[folderId] = (recipeCounts[folderId] || 0) + 1;
                });
            }
        }

        const folders = [];

        // Process owned folders
        ownedFoldersSnapshot.docs.forEach(doc => {
            folders.push({
                id: doc.id,
                ...doc.data(),
                recipe_count: recipeCounts[doc.id] || 0,
                is_owner: 1
            });
        });

        // Process collaborated folders
        collaboratedFolders.forEach(folderDoc => {
            if (folderDoc.exists) {
                folders.push({
                    id: folderDoc.id,
                    ...folderDoc.data(),
                    recipe_count: recipeCounts[folderDoc.id] || 0,
                    is_owner: 0
                });
            }
        });

        // Sort: system folders first, then by name
        folders.sort((a, b) => {
            if (a.is_system && !b.is_system) return -1;
            if (!a.is_system && b.is_system) return 1;
            return a.name.localeCompare(b.name);
        });

        res.json({ folders });
    } catch (error) {
        console.error('Error fetching folders:', error);
        res.status(500).json({ error: 'Error fetching folders' });
    }
});

app.post('/api/folders', requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Folder name is required' });
        }

        const trimmedName = name.trim();

        if (trimmedName.length > 50) {
            return res.status(400).json({ error: 'Folder name must be 50 characters or less' });
        }

        // Prevent creating system folder names
        if (trimmedName === 'Favorites' || trimmedName === 'History') {
            return res.status(400).json({ error: 'Cannot create folder with reserved name' });
        }

        // Check if folder name already exists for this user
        const existingFolder = await db.collection('folders')
            .where('user_id', '==', userId)
            .where('name', '==', trimmedName)
            .get();

        if (!existingFolder.empty) {
            return res.status(400).json({ error: 'Folder name already exists' });
        }

        // Create folder
        const folderRef = await db.collection('folders').add({
            user_id: userId,
            name: trimmedName,
            is_system: false,
            created_at: null
        });

        res.json({
            success: true,
            folder: {
                id: folderRef.id,
                name: trimmedName,
                is_system: 0
            }
        });
    } catch (error) {
        console.error('Error creating folder:', error);
        res.status(500).json({ error: 'Error creating folder' });
    }
});

app.delete('/api/folders/:id', requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const folderId = req.params.id;

        // Get folder
        const folderDoc = await db.collection('folders').doc(folderId).get();

        if (!folderDoc.exists) {
            return res.status(404).json({ error: 'Folder not found' });
        }

        const folderData = folderDoc.data();

        // Check ownership
        if (folderData.user_id !== userId) {
            return res.status(403).json({ error: 'You do not have permission to delete this folder' });
        }

        // Check if system folder
        if (folderData.is_system === true || folderData.is_system === 1) {
            return res.status(403).json({ error: 'Cannot delete system folder' });
        }

        // Delete folder and its associations (manually since Firestore doesn't have CASCADE)
        await folderDoc.ref.delete();

        // Delete folder_recipes associations
        const folderRecipesSnapshot = await db.collection('folder_recipes')
            .where('folder_id', '==', folderId)
            .get();

        const deleteBatch = db.batch();
        folderRecipesSnapshot.forEach(doc => {
            deleteBatch.delete(doc.ref);
        });

        // Delete folder_collaborators associations
        const collaboratorsSnapshot = await db.collection('folder_collaborators')
            .where('folder_id', '==', folderId)
            .get();

        collaboratorsSnapshot.forEach(doc => {
            deleteBatch.delete(doc.ref);
        });

        // Delete invitations
        const invitationsSnapshot = await db.collection('invitations')
            .where('folder_id', '==', folderId)
            .get();

        invitationsSnapshot.forEach(doc => {
            deleteBatch.delete(doc.ref);
        });

        await deleteBatch.commit();

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting folder:', error);
        res.status(500).json({ error: 'Error deleting folder' });
    }
});

// ============================================
// FOLDER RECIPES ROUTES
// ============================================

app.get('/api/folders/:id/recipes', requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const folderId = req.params.id;

        // Check if user has access (owner or collaborator)
        const folderDoc = await db.collection('folders').doc(folderId).get();

        if (!folderDoc.exists) {
            return res.status(404).json({ error: 'Folder not found' });
        }

        const folderData = folderDoc.data();
        let hasAccess = folderData.user_id === userId;

        if (!hasAccess) {
            // Check if user is a collaborator
            const collaboratorSnapshot = await db.collection('folder_collaborators')
                .where('folder_id', '==', folderId)
                .where('user_id', '==', userId)
                .get();

            hasAccess = !collaboratorSnapshot.empty;
        }

        if (!hasAccess) {
            return res.status(404).json({ error: 'Folder not found or access denied' });
        }

        // Get recipes in folder
        const folderRecipesSnapshot = await db.collection('folder_recipes')
            .where('folder_id', '==', folderId)
            .get();

        if (folderRecipesSnapshot.empty) {
            return res.json({ recipes: [] });
        }

        // Build map of recipe_id -> created_at for folder ordering
        const recipeMetadata = {};
        const recipeIds = [];
        folderRecipesSnapshot.docs.forEach(doc => {
            const data = doc.data();
            recipeIds.push(data.recipe_id);
            recipeMetadata[data.recipe_id] = { created_at: data.created_at };
        });

        // Batch fetch all recipes at once
        const recipeDocs = await Promise.all(
            recipeIds.map(id => db.collection('recipes').doc(id).get())
        );

        // Batch fetch all ratings at once
        const ratingsMap = {};
        const batchSize = 30;
        for (let i = 0; i < recipeIds.length; i += batchSize) {
            const batch = recipeIds.slice(i, i + batchSize);
            const ratingsSnapshot = await db.collection('ratings')
                .where('recipe_id', 'in', batch)
                .get();

            ratingsSnapshot.forEach(ratingDoc => {
                const data = ratingDoc.data();
                if (!ratingsMap[data.recipe_id]) {
                    ratingsMap[data.recipe_id] = { total: 0, count: 0 };
                }
                ratingsMap[data.recipe_id].total += data.rating;
                ratingsMap[data.recipe_id].count++;
            });
        }

        // Build recipe list
        const recipes = [];
        recipeDocs.forEach(recipeDoc => {
            if (recipeDoc.exists) {
                const recipe = { id: recipeDoc.id, ...recipeDoc.data() };
                const ratingData = ratingsMap[recipeDoc.id] || { total: 0, count: 0 };
                recipe.averageRating = ratingData.count > 0
                    ? Math.round((ratingData.total / ratingData.count) * 10) / 10
                    : 0;
                recipe.ratingCount = ratingData.count;
                recipe.folder_created_at = recipeMetadata[recipeDoc.id]?.created_at;
                recipes.push(recipe);
            }
        });

        // Sort: History folder by created_at DESC, others by name ASC
        if (folderData.name === 'History') {
            recipes.sort((a, b) => {
                const aTime = a.folder_created_at?._seconds || 0;
                const bTime = b.folder_created_at?._seconds || 0;
                return bTime - aTime;
            });
        } else {
            recipes.sort((a, b) => a.name.localeCompare(b.name));
        }

        res.json({ recipes });
    } catch (error) {
        console.error('Error fetching folder recipes:', error);
        res.status(500).json({ error: 'Error fetching recipes' });
    }
});

app.post('/api/folders/:id/recipes', requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const folderId = req.params.id;
        const { recipeId } = req.body;

        if (!recipeId) {
            return res.status(400).json({ error: 'Recipe ID is required' });
        }

        // Check if user has access (owner or collaborator)
        const folderDoc = await db.collection('folders').doc(folderId).get();

        if (!folderDoc.exists) {
            return res.status(404).json({ error: 'Folder not found' });
        }

        const folderData = folderDoc.data();
        let hasAccess = folderData.user_id === userId;

        if (!hasAccess) {
            // Check if user is a collaborator
            const collaboratorSnapshot = await db.collection('folder_collaborators')
                .where('folder_id', '==', folderId)
                .where('user_id', '==', userId)
                .get();

            hasAccess = !collaboratorSnapshot.empty;
        }

        if (!hasAccess) {
            return res.status(404).json({ error: 'Folder not found or access denied' });
        }

        // Check if recipe exists
        const recipeDoc = await db.collection('recipes').doc(recipeId).get();

        if (!recipeDoc.exists) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        // Check if recipe is already in folder
        const existingLink = await db.collection('folder_recipes')
            .where('folder_id', '==', folderId)
            .where('recipe_id', '==', recipeId)
            .get();

        if (!existingLink.empty) {
            return res.json({ success: true, message: 'Recipe already in folder' });
        }

        // Add recipe to folder
        await db.collection('folder_recipes').add({
            folder_id: folderId,
            recipe_id: recipeId,
            created_at: null
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error adding recipe to folder:', error);
        res.status(500).json({ error: 'Error adding recipe to folder' });
    }
});

app.delete('/api/folders/:id/recipes/:recipeId', requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const folderId = req.params.id;
        const recipeId = req.params.recipeId;

        // Check if user has access (owner or collaborator)
        const folderDoc = await db.collection('folders').doc(folderId).get();

        if (!folderDoc.exists) {
            return res.status(404).json({ error: 'Folder not found' });
        }

        const folderData = folderDoc.data();
        let hasAccess = folderData.user_id === userId;

        if (!hasAccess) {
            // Check if user is a collaborator
            const collaboratorSnapshot = await db.collection('folder_collaborators')
                .where('folder_id', '==', folderId)
                .where('user_id', '==', userId)
                .get();

            hasAccess = !collaboratorSnapshot.empty;
        }

        if (!hasAccess) {
            return res.status(404).json({ error: 'Folder not found or access denied' });
        }

        // Remove recipe from folder
        const linkSnapshot = await db.collection('folder_recipes')
            .where('folder_id', '==', folderId)
            .where('recipe_id', '==', recipeId)
            .get();

        const batch = db.batch();
        linkSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();

        res.json({ success: true });
    } catch (error) {
        console.error('Error removing recipe from folder:', error);
        res.status(500).json({ error: 'Error removing recipe from folder' });
    }
});

// ============================================
// GET FOLDERS CONTAINING A RECIPE
// ============================================

app.get('/api/recipes/:id/folders', requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const recipeId = req.params.id;

        // Get all folder_recipes entries for this recipe
        const folderRecipesSnapshot = await db.collection('folder_recipes')
            .where('recipe_id', '==', recipeId)
            .get();

        const folderIds = folderRecipesSnapshot.docs.map(doc => doc.data().folder_id);

        // Filter to only folders the user has access to
        const accessibleFolderIds = [];
        for (const folderId of folderIds) {
            const folderDoc = await db.collection('folders').doc(folderId).get();
            if (folderDoc.exists) {
                const folderData = folderDoc.data();
                if (folderData.user_id === userId) {
                    accessibleFolderIds.push(folderId);
                } else {
                    // Check collaborator access
                    const collabSnapshot = await db.collection('folder_collaborators')
                        .where('folder_id', '==', folderId)
                        .where('user_id', '==', userId)
                        .get();
                    if (!collabSnapshot.empty) {
                        accessibleFolderIds.push(folderId);
                    }
                }
            }
        }

        res.json({ folderIds: accessibleFolderIds });
    } catch (error) {
        console.error('Error getting recipe folders:', error);
        res.status(500).json({ error: 'Error getting recipe folders' });
    }
});

// ============================================
// HISTORY TRANSFER ROUTE
// ============================================

app.post('/api/history/transfer', requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { recipeIds } = req.body;

        if (!recipeIds || !Array.isArray(recipeIds)) {
            return res.status(400).json({ error: 'Recipe IDs array is required' });
        }

        // Get user's History folder (check by name only, not is_system type)
        const historySnapshot = await db.collection('folders')
            .where('user_id', '==', userId)
            .where('name', '==', 'History')
            .get();

        if (historySnapshot.empty) {
            return res.status(404).json({ error: 'History folder not found' });
        }

        const historyFolderId = historySnapshot.docs[0].id;
        let transferred = 0;

        // Add each recipe to History folder (max 20)
        for (const recipeId of recipeIds.slice(0, 20)) {
            // Skip empty or invalid recipe IDs
            if (!recipeId || typeof recipeId !== 'string') {
                console.log('Skipping invalid recipeId:', recipeId);
                continue;
            }
            try {
                // Check if recipe exists
                const recipeDoc = await db.collection('recipes').doc(recipeId).get();

                if (recipeDoc.exists) {
                    // Check if already in history
                    const existingLink = await db.collection('folder_recipes')
                        .where('folder_id', '==', historyFolderId)
                        .where('recipe_id', '==', recipeId)
                        .get();

                    if (existingLink.empty) {
                        await db.collection('folder_recipes').add({
                            folder_id: historyFolderId,
                            recipe_id: recipeId,
                            created_at: null
                        });
                        transferred++;
                    }
                }
            } catch (err) {
                console.error('Error transferring recipe:', recipeId, err);
            }
        }

        res.json({ success: true, transferred });
    } catch (error) {
        console.error('Error transferring history:', error);
        res.status(500).json({ error: 'Error transferring history' });
    }
});

// ============================================
// COLLABORATION ROUTES
// ============================================

app.post('/api/folders/:id/invite', requireAuth, async (req, res) => {
    try {
        const folderId = req.params.id;
        const userId = req.userId;
        const { email } = req.body;

        if (!email || !email.trim()) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const trimmedEmail = email.trim().toLowerCase();

        // Get folder
        const folderDoc = await db.collection('folders').doc(folderId).get();

        if (!folderDoc.exists) {
            return res.status(404).json({ error: 'Folder not found' });
        }

        const folderData = folderDoc.data();

        // Check ownership
        if (folderData.user_id !== userId) {
            return res.status(404).json({ error: 'Folder not found or you do not have permission' });
        }

        // Cannot share system folders
        if (folderData.is_system === true || folderData.is_system === 1) {
            return res.status(400).json({ error: 'System folders cannot be shared' });
        }

        // Check if user is inviting themselves
        const inviterDoc = await db.collection('users').doc(userId).get();
        const inviterData = inviterDoc.data();

        if (inviterData.email.toLowerCase() === trimmedEmail) {
            return res.status(400).json({ error: 'You cannot invite yourself' });
        }

        // Count existing collaborators
        const collaboratorsSnapshot = await db.collection('folder_collaborators')
            .where('folder_id', '==', folderId)
            .get();

        if (collaboratorsSnapshot.size >= 5) {
            return res.status(400).json({ error: 'Maximum 5 collaborators allowed per folder' });
        }

        // Check if already a collaborator
        const usersSnapshot = await db.collection('users')
            .where('email', '==', trimmedEmail)
            .get();

        if (!usersSnapshot.empty) {
            const existingUserId = usersSnapshot.docs[0].id;
            const existingCollaborator = await db.collection('folder_collaborators')
                .where('folder_id', '==', folderId)
                .where('user_id', '==', existingUserId)
                .get();

            if (!existingCollaborator.empty) {
                return res.status(400).json({ error: 'User is already a collaborator' });
            }
        }

        // Check for pending invitation
        const pendingInviteSnapshot = await db.collection('invitations')
            .where('folder_id', '==', folderId)
            .where('email', '==', trimmedEmail)
            .where('accepted', '==', 0)
            .get();

        // Filter for non-expired invitations
        const now = new Date();
        const validPendingInvites = pendingInviteSnapshot.docs.filter(doc => {
            const expiresAt = doc.data().expires_at;
            return new Date(expiresAt) > now;
        });

        if (validPendingInvites.length > 0) {
            return res.status(400).json({ error: 'Invitation already sent to this email' });
        }

        // Generate invitation token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        // Create invitation
        await db.collection('invitations').add({
            folder_id: folderId,
            email: trimmedEmail,
            token,
            invited_by: userId,
            created_at: null,
            expires_at: expiresAt.toISOString(),
            accepted: 0
        });

        // Send invitation email
        const appUrl = process.env.APP_URL || 'http://localhost:8000';
        const inviteUrl = `${appUrl}/home?invite=${token}`;

        const mailOptions = {
            from: process.env.GMAIL_USER || 'Recipe App <noreply@recipeapp.com>',
            to: trimmedEmail,
            subject: `You've been invited to collaborate on "${folderData.name}"`,
            html: `
                <h2>Folder Collaboration Invitation</h2>
                <p>You've been invited to collaborate on the folder "${folderData.name}".</p>
                <p>Click the link below to accept the invitation:</p>
                <p><a href="${inviteUrl}">${inviteUrl}</a></p>
                <p>This invitation expires in 7 days.</p>
                <p>If you don't have an account, you'll be able to sign up with this email address.</p>
            `
        };

        try {
            await emailTransporter.sendMail(mailOptions);
            res.json({
                success: true,
                message: 'Invitation sent successfully',
                inviteUrl
            });
        } catch (emailError) {
            console.error('Email error:', emailError);
            res.status(500).json({ error: 'Error sending invitation email' });
        }
    } catch (error) {
        console.error('Error creating invitation:', error);
        res.status(500).json({ error: 'Error creating invitation' });
    }
});

app.get('/api/invitations/pending', requireAuth, async (req, res) => {
    try {
        const userId = req.userId;

        // Get user's email
        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userEmail = userDoc.data().email.toLowerCase();

        // Get pending invitations
        const invitationsSnapshot = await db.collection('invitations')
            .where('email', '==', userEmail)
            .where('accepted', '==', 0)
            .get();

        const invitations = [];
        const now = new Date();

        for (const doc of invitationsSnapshot.docs) {
            const invitation = doc.data();

            // Check if expired
            if (new Date(invitation.expires_at) <= now) {
                continue;
            }

            // Get folder name
            const folderDoc = await db.collection('folders').doc(invitation.folder_id).get();

            if (folderDoc.exists) {
                // Get inviter username
                const inviterDoc = await db.collection('users').doc(invitation.invited_by).get();

                invitations.push({
                    id: doc.id,
                    token: invitation.token,
                    created_at: invitation.created_at,
                    folder_name: folderDoc.data().name,
                    invited_by: inviterDoc.exists ? inviterDoc.data().username : 'Unknown'
                });
            }
        }

        res.json({ invitations });
    } catch (error) {
        console.error('Error fetching invitations:', error);
        res.status(500).json({ error: 'Error fetching invitations' });
    }
});

app.post('/api/invitations/:token/accept', requireAuth, async (req, res) => {
    try {
        const token = req.params.token;
        const userId = req.userId;

        // Get user's email
        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userEmail = userDoc.data().email.toLowerCase();

        // Get invitation
        const invitationsSnapshot = await db.collection('invitations')
            .where('token', '==', token)
            .get();

        if (invitationsSnapshot.empty) {
            return res.status(404).json({ error: 'Invitation not found' });
        }

        const invitationDoc = invitationsSnapshot.docs[0];
        const invitation = invitationDoc.data();

        // Check if already accepted
        if (invitation.accepted === 1) {
            return res.status(400).json({ error: 'Invitation already accepted' });
        }

        // Check if expired
        if (new Date(invitation.expires_at) <= new Date()) {
            return res.status(400).json({ error: 'Invitation has expired' });
        }

        // Check if email matches
        if (invitation.email.toLowerCase() !== userEmail) {
            return res.status(400).json({
                error: `This invitation was sent to ${invitation.email}. You are logged in as ${userEmail}. Please log in with the correct account.`
            });
        }

        // Add user as collaborator
        await db.collection('folder_collaborators').add({
            folder_id: invitation.folder_id,
            user_id: userId,
            added_at: admin.firestore.FieldValue.serverTimestamp()
        });

        // Mark invitation as accepted
        await invitationDoc.ref.update({ accepted: 1 });

        res.json({ success: true, folderId: invitation.folder_id });
    } catch (error) {
        console.error('Error accepting invitation:', error);
        res.status(500).json({ error: 'Error accepting invitation' });
    }
});

app.get('/api/folders/:id/collaborators', requireAuth, async (req, res) => {
    try {
        const folderId = req.params.id;
        const userId = req.userId;

        // Check if user has access to this folder
        const folderDoc = await db.collection('folders').doc(folderId).get();

        if (!folderDoc.exists) {
            return res.status(404).json({ error: 'Folder not found' });
        }

        const folderData = folderDoc.data();
        let hasAccess = folderData.user_id === userId;

        if (!hasAccess) {
            // Check if user is a collaborator
            const collaboratorSnapshot = await db.collection('folder_collaborators')
                .where('folder_id', '==', folderId)
                .where('user_id', '==', userId)
                .get();

            hasAccess = !collaboratorSnapshot.empty;
        }

        if (!hasAccess) {
            return res.status(404).json({ error: 'Folder not found or access denied' });
        }

        // Get owner
        const ownerDoc = await db.collection('users').doc(folderData.user_id).get();
        const owner = {
            id: ownerDoc.id,
            ...ownerDoc.data(),
            role: 'owner'
        };
        delete owner.password;

        // Get collaborators
        const collaboratorsSnapshot = await db.collection('folder_collaborators')
            .where('folder_id', '==', folderId)
            .get();

        const collaborators = [];

        for (const doc of collaboratorsSnapshot.docs) {
            const collabData = doc.data();
            const userDoc = await db.collection('users').doc(collabData.user_id).get();

            if (userDoc.exists) {
                const userData = userDoc.data();
                collaborators.push({
                    id: userDoc.id,
                    username: userData.username,
                    email: userData.email,
                    added_at: collabData.added_at,
                    role: 'collaborator'
                });
            }
        }

        res.json({ owner, collaborators });
    } catch (error) {
        console.error('Error fetching collaborators:', error);
        res.status(500).json({ error: 'Error fetching collaborators' });
    }
});

app.delete('/api/folders/:id/collaborators/:userId', requireAuth, async (req, res) => {
    try {
        const folderId = req.params.id;
        const collaboratorId = req.params.userId;
        const userId = req.userId;

        // Check if user is the owner
        const folderDoc = await db.collection('folders').doc(folderId).get();

        if (!folderDoc.exists) {
            return res.status(404).json({ error: 'Folder not found' });
        }

        const folderData = folderDoc.data();

        if (folderData.user_id !== userId) {
            return res.status(404).json({ error: 'Folder not found or you do not have permission' });
        }

        // Remove collaborator
        const collaboratorSnapshot = await db.collection('folder_collaborators')
            .where('folder_id', '==', folderId)
            .where('user_id', '==', collaboratorId)
            .get();

        if (collaboratorSnapshot.empty) {
            return res.status(404).json({ error: 'Collaborator not found' });
        }

        const batch = db.batch();
        collaboratorSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();

        res.json({ success: true });
    } catch (error) {
        console.error('Error removing collaborator:', error);
        res.status(500).json({ error: 'Error removing collaborator' });
    }
});

// ============================================
// User Profile & Settings
// ============================================

app.get('/api/user/profile', requireAuth, async (req, res) => {
    try {
        const userId = req.userId;

        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = userDoc.data();

        res.json({
            username: userData.username,
            email: userData.email
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Error fetching user profile' });
    }
});

// Note: Password changes are handled by Firebase Auth on the client side

// ============================================
// Cooking Activity Tracking
// ============================================

app.post('/api/cooking-activity', requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { recipeId, recipeName } = req.body;

        if (!recipeId) {
            return res.status(400).json({ error: 'Recipe ID is required' });
        }

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];

        // Check if already cooked this recipe today (prevent duplicates)
        const existingSnapshot = await db.collection('cooking_activity')
            .where('user_id', '==', userId)
            .where('recipe_id', '==', recipeId)
            .where('date', '==', today)
            .get();

        if (!existingSnapshot.empty) {
            return res.json({ success: true, message: 'Already recorded today' });
        }

        // Record the cooking activity
        await db.collection('cooking_activity').add({
            user_id: userId,
            recipe_id: recipeId,
            recipe_name: recipeName || 'Unknown Recipe',
            date: today,
            created_at: new Date().toISOString()
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error recording cooking activity:', error);
        res.status(500).json({ error: 'Error recording cooking activity' });
    }
});

app.get('/api/cooking-activity', requireAuth, async (req, res) => {
    try {
        const userId = req.userId;

        // Get date range for past year
        const endDate = new Date();
        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);

        const startDateStr = startDate.toISOString().split('T')[0];

        // Fetch all cooking activity for the user in the past year
        const activitySnapshot = await db.collection('cooking_activity')
            .where('user_id', '==', userId)
            .where('date', '>=', startDateStr)
            .orderBy('date', 'desc')
            .get();

        // Group by date and count
        const activityByDate = {};
        let totalCooked = 0;

        activitySnapshot.forEach(doc => {
            const data = doc.data();
            const date = data.date;

            if (!activityByDate[date]) {
                activityByDate[date] = 0;
            }
            activityByDate[date]++;
            totalCooked++;
        });

        // Calculate streaks
        const dates = Object.keys(activityByDate).sort().reverse();
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        // Check if streak includes today or yesterday
        if (activityByDate[today] || activityByDate[yesterday]) {
            let checkDate = activityByDate[today] ? new Date() : new Date(Date.now() - 86400000);

            while (true) {
                const dateStr = checkDate.toISOString().split('T')[0];
                if (activityByDate[dateStr]) {
                    currentStreak++;
                    checkDate = new Date(checkDate.getTime() - 86400000);
                } else {
                    break;
                }
            }
        }

        // Calculate longest streak
        for (let i = 0; i < dates.length; i++) {
            const currentDate = new Date(dates[i]);
            const nextDate = i < dates.length - 1 ? new Date(dates[i + 1]) : null;

            tempStreak++;

            if (nextDate) {
                const diffDays = Math.round((currentDate - nextDate) / 86400000);
                if (diffDays !== 1) {
                    longestStreak = Math.max(longestStreak, tempStreak);
                    tempStreak = 0;
                }
            } else {
                longestStreak = Math.max(longestStreak, tempStreak);
            }
        }

        res.json({
            activityByDate,
            totalCooked,
            currentStreak,
            longestStreak
        });
    } catch (error) {
        console.error('Error fetching cooking activity:', error);
        res.status(500).json({ error: 'Error fetching cooking activity' });
    }
});

// Export the Express app as a Firebase Function
exports.app = functions.https.onRequest(app);
