const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 8000;

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
        else console.log('Recipes table ready');
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
            function(err) {
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

                res.json({
                    success: true,
                    user: { id: this.lastID, username, email }
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
    db.all('SELECT * FROM recipes WHERE user_id = ? ORDER BY created_at DESC', [req.session.userId], (err, recipes) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching recipes' });
        }

        const formattedRecipes = recipes.map(recipe => ({
            ...recipe,
            source: recipe.source_data ? JSON.parse(recipe.source_data) : { type: recipe.source_type },
            ingredients: JSON.parse(recipe.ingredients),
            instructions: JSON.parse(recipe.instructions)
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
        function(err) {
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

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
