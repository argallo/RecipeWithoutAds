const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 8000;

// Sample recipes to seed into database (user_id = 0 means system/sample recipes)
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

// Database setup
const db = new sqlite3.Database('./recipes.db', (err) => {
    if (err) {
        console.error('Error opening database', err);
    } else {
        console.log('Database connected');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) console.error('Error creating users table:', err);
        else console.log('Users table ready');
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS recipes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            author TEXT NOT NULL,
            image TEXT,
            source_type TEXT,
            source_data TEXT,
            ingredients TEXT NOT NULL,
            instructions TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `, (err) => {
        if (err) console.error('Error creating recipes table:', err);
        else {
            console.log('Recipes table ready');
            seedSampleRecipes();
        }
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS ratings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            recipe_id INTEGER NOT NULL,
            rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, recipe_id),
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (recipe_id) REFERENCES recipes(id)
        )
    `, (err) => {
        if (err) console.error('Error creating ratings table:', err);
        else console.log('Ratings table ready');
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS folders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            is_system INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(user_id, name)
        )
    `, (err) => {
        if (err) console.error('Error creating folders table:', err);
        else {
            console.log('Folders table ready');
            // Run migration to add is_system column if it doesn't exist
            migrateFoldersTable();
        }
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS folder_recipes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            folder_id INTEGER NOT NULL,
            recipe_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE,
            FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
            UNIQUE(folder_id, recipe_id)
        )
    `, (err) => {
        if (err) console.error('Error creating folder_recipes table:', err);
        else console.log('Folder_recipes table ready');
    });
}

// Migration: Add is_system column to existing folders table
function migrateFoldersTable() {
    db.all("PRAGMA table_info(folders)", (err, columns) => {
        if (err) {
            console.error('Error checking folders table schema:', err);
            return;
        }

        const hasIsSystem = columns.some(col => col.name === 'is_system');

        if (!hasIsSystem) {
            db.run('ALTER TABLE folders ADD COLUMN is_system INTEGER DEFAULT 0', (err) => {
                if (err) {
                    console.error('Error adding is_system column:', err);
                } else {
                    console.log('Added is_system column to folders table');
                }
            });
        }
    });
}

// Seed sample recipes into database (user_id = 0 means system/sample recipes)
function seedSampleRecipes() {
    sampleRecipes.forEach(recipe => {
        // Check if recipe already exists
        db.get('SELECT id FROM recipes WHERE id = ?', [recipe.id], (err, existing) => {
            if (err) {
                console.error('Error checking for sample recipe:', err);
                return;
            }

            if (!existing) {
                // Insert sample recipe with user_id = 0
                db.run(
                    `INSERT INTO recipes (id, user_id, name, author, image, source_type, source_data, ingredients, instructions)
                     VALUES (?, 0, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        recipe.id,
                        recipe.name,
                        recipe.author,
                        recipe.image || null,
                        recipe.source.type,
                        JSON.stringify(recipe.source),
                        JSON.stringify(recipe.ingredients),
                        JSON.stringify(recipe.instructions)
                    ],
                    function (err) {
                        if (err) {
                            console.error('Error inserting sample recipe:', recipe.name, err);
                        } else {
                            console.log('Seeded sample recipe:', recipe.name);
                        }
                    }
                );
            }
        });
    });
}

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Session configuration
app.use(session({
    secret: 'recipe-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    }
}));

// Authentication middleware
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    next();
}

// Auth routes
app.post('/api/signup', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.run(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword],
            function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed: users.username')) {
                        return res.status(400).json({ error: 'Username already exists' });
                    }
                    if (err.message.includes('UNIQUE constraint failed: users.email')) {
                        return res.status(400).json({ error: 'Email already exists' });
                    }
                    return res.status(500).json({ error: 'Error creating account' });
                }

                req.session.userId = this.lastID;
                req.session.username = username;

                // Create default "Favorites" and "History" folders
                const userId = this.lastID;

                db.run('INSERT INTO folders (user_id, name, is_system) VALUES (?, ?, ?)',
                    [userId, 'Favorites', 1],
                    (err) => {
                        if (err) console.error('Error creating Favorites folder:', err);
                    }
                );

                db.run('INSERT INTO folders (user_id, name, is_system) VALUES (?, ?, ?)',
                    [userId, 'History', 1],
                    (err) => {
                        if (err) console.error('Error creating History folder:', err);
                    }
                );

                res.json({
                    success: true,
                    user: { id: userId, username, email }
                });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Username/email and password are required' });
    }

    // Allow login with either email or username
    db.get('SELECT * FROM users WHERE email = ? OR username = ?', [email, email], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid username/email or password' });
        }

        try {
            const validPassword = await bcrypt.compare(password, user.password);

            if (!validPassword) {
                return res.status(401).json({ error: 'Invalid username/email or password' });
            }

            req.session.userId = user.id;
            req.session.username = user.username;

            res.json({
                success: true,
                user: { id: user.id, username: user.username, email: user.email }
            });
        } catch (error) {
            res.status(500).json({ error: 'Server error' });
        }
    });
});

app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Error logging out' });
        }
        res.json({ success: true });
    });
});

app.get('/api/user', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    db.get('SELECT id, username, email FROM users WHERE id = ?', [req.session.userId], (err, user) => {
        if (err || !user) {
            return res.status(500).json({ error: 'Server error' });
        }
        res.json({ user });
    });
});

// Recipe routes
app.get('/api/recipes', requireAuth, (req, res) => {
    const query = `
        SELECT r.*,
               COALESCE(AVG(rt.rating), 0) as average_rating,
               COUNT(rt.id) as rating_count
        FROM recipes r
        LEFT JOIN ratings rt ON r.id = rt.recipe_id
        WHERE r.user_id = ? OR r.user_id = 0
        GROUP BY r.id
        ORDER BY r.created_at DESC
    `;

    db.all(query, [req.session.userId], (err, recipes) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching recipes' });
        }

        const formattedRecipes = recipes.map(recipe => ({
            ...recipe,
            source: recipe.source_data ? JSON.parse(recipe.source_data) : { type: recipe.source_type },
            ingredients: JSON.parse(recipe.ingredients),
            instructions: JSON.parse(recipe.instructions),
            averageRating: Math.round(recipe.average_rating * 10) / 10,
            ratingCount: recipe.rating_count
        }));

        res.json({ recipes: formattedRecipes });
    });
});

app.post('/api/recipes', requireAuth, (req, res) => {
    const { name, author, image, source, ingredients, instructions } = req.body;

    db.run(
        `INSERT INTO recipes (user_id, name, author, image, source_type, source_data, ingredients, instructions)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            req.session.userId,
            name,
            author,
            image || null,
            source.type,
            JSON.stringify(source),
            JSON.stringify(ingredients),
            JSON.stringify(instructions)
        ],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Error saving recipe' });
            }

            res.json({
                success: true,
                recipe: {
                    id: this.lastID,
                    name,
                    author,
                    image,
                    source,
                    ingredients,
                    instructions
                }
            });
        }
    );
});

// Rating routes
// Get rating info for a specific recipe
app.get('/api/recipes/:id/rating', (req, res) => {
    const recipeId = req.params.id;
    const userId = req.session.userId;

    // Get average rating and count
    db.get(
        `SELECT COALESCE(AVG(rating), 0) as average_rating, COUNT(*) as rating_count 
         FROM ratings WHERE recipe_id = ?`,
        [recipeId],
        (err, ratingStats) => {
            if (err) {
                return res.status(500).json({ error: 'Error fetching rating' });
            }

            const response = {
                averageRating: Math.round(ratingStats.average_rating * 10) / 10,
                ratingCount: ratingStats.rating_count
            };

            // If user is logged in, check if they've rated this recipe
            if (userId) {
                db.get(
                    'SELECT rating FROM ratings WHERE user_id = ? AND recipe_id = ?',
                    [userId, recipeId],
                    (err, userRating) => {
                        if (err) {
                            return res.status(500).json({ error: 'Error fetching user rating' });
                        }
                        response.userRating = userRating ? userRating.rating : null;
                        response.hasRated = !!userRating;
                        res.json(response);
                    }
                );
            } else {
                response.userRating = null;
                response.hasRated = false;
                res.json(response);
            }
        }
    );
});

// Submit a rating for a recipe
app.post('/api/recipes/:id/rating', requireAuth, (req, res) => {
    const recipeId = req.params.id;
    const userId = req.session.userId;
    const { rating } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
        return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
    }

    // Insert or update rating (UNIQUE constraint handles duplicates)
    db.run(
        `INSERT INTO ratings (user_id, recipe_id, rating) VALUES (?, ?, ?)
         ON CONFLICT(user_id, recipe_id) DO UPDATE SET rating = excluded.rating`,
        [userId, recipeId, rating],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Error saving rating' });
            }

            // Fetch updated average
            db.get(
                `SELECT COALESCE(AVG(rating), 0) as average_rating, COUNT(*) as rating_count 
                 FROM ratings WHERE recipe_id = ?`,
                [recipeId],
                (err, ratingStats) => {
                    if (err) {
                        return res.status(500).json({ error: 'Error fetching updated rating' });
                    }

                    res.json({
                        success: true,
                        userRating: rating,
                        averageRating: Math.round(ratingStats.average_rating * 10) / 10,
                        ratingCount: ratingStats.rating_count
                    });
                }
            );
        }
    );
});

// Folder API endpoints

// Get all folders for logged-in user
app.get('/api/folders', requireAuth, (req, res) => {
    const userId = req.session.userId;

    db.all(
        `SELECT f.id, f.name, f.is_system, f.created_at,
                COUNT(fr.recipe_id) as recipe_count
         FROM folders f
         LEFT JOIN folder_recipes fr ON f.id = fr.folder_id
         WHERE f.user_id = ?
         GROUP BY f.id
         ORDER BY f.is_system DESC, f.name ASC`,
        [userId],
        (err, folders) => {
            if (err) {
                return res.status(500).json({ error: 'Error fetching folders' });
            }

            res.json({ folders });
        }
    );
});

// Create a new custom folder
app.post('/api/folders', requireAuth, (req, res) => {
    const userId = req.session.userId;
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

    db.run(
        'INSERT INTO folders (user_id, name, is_system) VALUES (?, ?, 0)',
        [userId, trimmedName],
        function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'Folder name already exists' });
                }
                return res.status(500).json({ error: 'Error creating folder' });
            }

            res.json({
                success: true,
                folder: {
                    id: this.lastID,
                    name: trimmedName,
                    is_system: 0
                }
            });
        }
    );
});

// Delete a custom folder
app.delete('/api/folders/:id', requireAuth, (req, res) => {
    const userId = req.session.userId;
    const folderId = req.params.id;

    // First check if folder belongs to user and is not a system folder
    db.get(
        'SELECT id, is_system FROM folders WHERE id = ? AND user_id = ?',
        [folderId, userId],
        (err, folder) => {
            if (err) {
                return res.status(500).json({ error: 'Error checking folder' });
            }

            if (!folder) {
                return res.status(404).json({ error: 'Folder not found' });
            }

            if (folder.is_system === 1) {
                return res.status(403).json({ error: 'Cannot delete system folder' });
            }

            // Delete folder (CASCADE will handle folder_recipes)
            db.run('DELETE FROM folders WHERE id = ?', [folderId], function (err) {
                if (err) {
                    return res.status(500).json({ error: 'Error deleting folder' });
                }

                res.json({ success: true });
            });
        }
    );
});

// Get all recipes in a folder
app.get('/api/folders/:id/recipes', requireAuth, (req, res) => {
    const userId = req.session.userId;
    const folderId = req.params.id;

    // First check if folder belongs to user
    db.get(
        'SELECT name FROM folders WHERE id = ? AND user_id = ?',
        [folderId, userId],
        (err, folder) => {
            if (err) {
                return res.status(500).json({ error: 'Error checking folder' });
            }

            if (!folder) {
                return res.status(404).json({ error: 'Folder not found' });
            }

            // Get recipes in folder with ratings
            // Order by created_at DESC for History folder, name ASC for others
            const orderBy = folder.name === 'History' ? 'fr.created_at DESC' : 'r.name ASC';

            db.all(
                `SELECT r.*,
                        COALESCE(AVG(rat.rating), 0) as average_rating,
                        COUNT(rat.id) as rating_count
                 FROM folder_recipes fr
                 JOIN recipes r ON fr.recipe_id = r.id
                 LEFT JOIN ratings rat ON r.id = rat.recipe_id
                 WHERE fr.folder_id = ?
                 GROUP BY r.id
                 ORDER BY ${orderBy}`,
                [folderId],
                (err, recipes) => {
                    if (err) {
                        return res.status(500).json({ error: 'Error fetching recipes' });
                    }

                    // Parse JSON fields
                    recipes = recipes.map(recipe => ({
                        ...recipe,
                        ingredients: JSON.parse(recipe.ingredients),
                        instructions: JSON.parse(recipe.instructions),
                        source: recipe.source_data ? JSON.parse(recipe.source_data) : null,
                        averageRating: Math.round(recipe.average_rating * 10) / 10,
                        ratingCount: recipe.rating_count
                    }));

                    res.json({ recipes });
                }
            );
        }
    );
});

// Add recipe to folder
app.post('/api/folders/:id/recipes', requireAuth, (req, res) => {
    const userId = req.session.userId;
    const folderId = req.params.id;
    const { recipeId } = req.body;

    if (!recipeId) {
        return res.status(400).json({ error: 'Recipe ID is required' });
    }

    // Check folder ownership
    db.get(
        'SELECT id FROM folders WHERE id = ? AND user_id = ?',
        [folderId, userId],
        (err, folder) => {
            if (err || !folder) {
                return res.status(404).json({ error: 'Folder not found' });
            }

            // Check recipe exists
            db.get('SELECT id FROM recipes WHERE id = ?', [recipeId], (err, recipe) => {
                if (err || !recipe) {
                    return res.status(404).json({ error: 'Recipe not found' });
                }

                // Add to folder (UNIQUE constraint handles duplicates)
                db.run(
                    'INSERT INTO folder_recipes (folder_id, recipe_id) VALUES (?, ?)',
                    [folderId, recipeId],
                    function (err) {
                        if (err) {
                            if (err.message.includes('UNIQUE constraint failed')) {
                                // Recipe already in folder, just return success
                                return res.json({ success: true, message: 'Recipe already in folder' });
                            }
                            return res.status(500).json({ error: 'Error adding recipe to folder' });
                        }

                        res.json({ success: true });
                    }
                );
            });
        }
    );
});

// Remove recipe from folder
app.delete('/api/folders/:id/recipes/:recipeId', requireAuth, (req, res) => {
    const userId = req.session.userId;
    const folderId = req.params.id;
    const recipeId = req.params.recipeId;

    // Check folder ownership
    db.get(
        'SELECT id FROM folders WHERE id = ? AND user_id = ?',
        [folderId, userId],
        (err, folder) => {
            if (err || !folder) {
                return res.status(404).json({ error: 'Folder not found' });
            }

            // Remove from folder
            db.run(
                'DELETE FROM folder_recipes WHERE folder_id = ? AND recipe_id = ?',
                [folderId, recipeId],
                function (err) {
                    if (err) {
                        return res.status(500).json({ error: 'Error removing recipe from folder' });
                    }

                    res.json({ success: true });
                }
            );
        }
    );
});

// Transfer guest history to database
app.post('/api/history/transfer', requireAuth, (req, res) => {
    const userId = req.session.userId;
    const { recipeIds } = req.body;

    if (!recipeIds || !Array.isArray(recipeIds)) {
        return res.status(400).json({ error: 'Recipe IDs array is required' });
    }

    // Get user's History folder
    db.get(
        'SELECT id FROM folders WHERE user_id = ? AND name = ? AND is_system = 1',
        [userId, 'History'],
        (err, folder) => {
            if (err || !folder) {
                return res.status(404).json({ error: 'History folder not found' });
            }

            let transferred = 0;
            let processed = 0;

            if (recipeIds.length === 0) {
                return res.json({ success: true, transferred: 0 });
            }

            // Add each recipe to History folder
            recipeIds.slice(0, 20).forEach(recipeId => {
                db.get('SELECT id FROM recipes WHERE id = ?', [recipeId], (err, recipe) => {
                    if (!err && recipe) {
                        db.run(
                            'INSERT INTO folder_recipes (folder_id, recipe_id) VALUES (?, ?)',
                            [folder.id, recipeId],
                            function (err) {
                                if (!err) transferred++;
                                processed++;

                                if (processed === recipeIds.length) {
                                    res.json({ success: true, transferred });
                                }
                            }
                        );
                    } else {
                        processed++;
                        if (processed === recipeIds.length) {
                            res.json({ success: true, transferred });
                        }
                    }
                });
            });
        }
    );
});

// Serve index.html for all non-API routes (client-side routing)
app.get('*', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
