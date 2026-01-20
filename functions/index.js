require('dotenv').config();

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { YoutubeTranscript } = require('youtube-transcript');

// Initialize Firebase Admin
// When running locally, connect to emulators if FIRESTORE_EMULATOR_HOST is set
if (process.env.FUNCTIONS_EMULATOR === 'true' || process.env.FIRESTORE_EMULATOR_HOST) {
    admin.initializeApp({ projectId: 'gitdish' });
} else {
    admin.initializeApp();
}

// Use the 'recipedb' named database
const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore('recipedb');

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

// Initialize Google Gemini AI
let genAI = null;
if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('Gemini AI initialized');
} else {
    console.log('⚠️  No Gemini API key. YouTube extraction will not work.');
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

// Optional auth middleware - parses token if present but doesn't require it
async function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const idToken = authHeader.split('Bearer ')[1];
        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            req.user = decodedToken;
            req.userId = decodedToken.uid;
        } catch (error) {
            // Token invalid, but that's okay - just continue without user info
            console.log('Optional auth: invalid token');
        }
    }
    next();
}

// Admin middleware - check if user is in admin email whitelist
async function requireAdmin(req, res, next) {
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(e => e);

    if (adminEmails.length === 0) {
        return res.status(403).json({ error: 'No admin emails configured' });
    }

    const userEmail = req.user.email?.toLowerCase();

    if (!userEmail || !adminEmails.includes(userEmail)) {
        return res.status(403).json({ error: 'Admin access required' });
    }

    next();
}

// Helper to check if a user is admin
function isUserAdmin(email) {
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(e => e);
    return adminEmails.includes(email?.toLowerCase());
}

// Helper to check if a user is trusted (can post globally without approval)
async function isUserTrusted(userId) {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) return false;
    const userData = userDoc.data();
    // Admins are always trusted
    if (isUserAdmin(userData.email)) return true;
    // Check trusted flag
    return userData.is_trusted === true;
}

// Helper to update user trust status based on recipe approvals
async function updateUserTrustStatus(userId) {
    try {
        // Count approved and declined recipes for this user
        const recipesSnapshot = await db.collection('recipes')
            .where('user_id', '==', userId)
            .get();

        let approvedCount = 0;
        let declinedCount = 0;

        recipesSnapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.status === 'approved') approvedCount++;
            if (data.status === 'declined') declinedCount++;
        });

        // User becomes trusted if they have 2+ approved and 0 declined
        const shouldBeTrusted = approvedCount >= 2 && declinedCount === 0;

        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            // Don't downgrade admins
            if (!isUserAdmin(userData.email)) {
                await db.collection('users').doc(userId).update({
                    is_trusted: shouldBeTrusted,
                    approved_recipes_count: approvedCount,
                    declined_recipes_count: declinedCount
                });
            }
        }

        return shouldBeTrusted;
    } catch (error) {
        console.error('Error updating user trust status:', error);
        return false;
    }
}

// ============================================
// PUBLIC ROUTES (No auth required)
// ============================================

// Get recent public recipes for landing page (no auth required)
// Only returns approved recipes that are globally visible
app.get('/api/public/recipes', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 12;

        // Get approved recipes only
        const snapshot = await db.collection('recipes')
            .where('status', '==', 'approved')
            .orderBy('created_at', 'desc')
            .limit(limit * 2) // Fetch more to filter for images
            .get();

        const recipes = [];
        for (const doc of snapshot.docs) {
            const data = doc.data();
            // Only include recipes with images for the landing page
            if (data.image && recipes.length < limit) {
                recipes.push({
                    id: doc.id,
                    name: data.name,
                    author: data.author || 'Unknown',
                    image: data.image,
                    source: data.source_data || { type: data.source_type }
                });
            }
        }

        res.json({ recipes });
    } catch (error) {
        console.error('Error fetching public recipes:', error);
        res.status(500).json({ error: 'Error fetching recipes' });
    }
});

// Search approved public recipes (no auth required)
app.get('/api/public/search', async (req, res) => {
    try {
        const query = (req.query.q || '').toLowerCase().trim();
        const limit = parseInt(req.query.limit) || 20;

        if (!query) {
            return res.json({ recipes: [] });
        }

        // Get all approved recipes (Firestore doesn't support full-text search)
        const snapshot = await db.collection('recipes')
            .where('status', '==', 'approved')
            .orderBy('created_at', 'desc')
            .limit(100) // Limit to prevent excessive reads
            .get();

        // Filter by search query on name and author
        const recipes = [];
        for (const doc of snapshot.docs) {
            if (recipes.length >= limit) break;

            const data = doc.data();
            const nameMatch = data.name?.toLowerCase().includes(query);
            const authorMatch = data.author?.toLowerCase().includes(query);

            if (nameMatch || authorMatch) {
                recipes.push({
                    id: doc.id,
                    name: data.name,
                    author: data.author || 'Unknown',
                    image: data.image,
                    source: data.source_data || { type: data.source_type }
                });
            }
        }

        res.json({ recipes });
    } catch (error) {
        console.error('Error searching public recipes:', error);
        res.status(500).json({ error: 'Error searching recipes' });
    }
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
                user: {
                    id: userId,
                    username: userData.username,
                    email: userData.email,
                    isAdmin: isUserAdmin(userData.email)
                }
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

        const userEmail = email.toLowerCase();
        res.json({
            success: true,
            user: {
                id: userId,
                username: trimmedUsername,
                email: userEmail,
                isAdmin: isUserAdmin(userEmail)
            }
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
            user: {
                id: userId,
                username: correctUsername,
                email: firebaseUser.email,
                isAdmin: isUserAdmin(firebaseUser.email)
            }
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
                email: userData.email,
                isAdmin: isUserAdmin(userData.email)
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

// Helper function to check for URLs in text (spam prevention)
function containsUrl(text) {
    if (!text) return false;
    // Match common URL patterns
    const urlPattern = /(?:https?:\/\/|www\.)[^\s]+|[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}(?:\/[^\s]*)?/gi;
    return urlPattern.test(text);
}

// Helper function to validate ingredients and instructions for spam
function validateRecipeContent(ingredients, instructions) {
    // Check ingredients for URLs
    for (const ingredient of ingredients) {
        if (containsUrl(ingredient)) {
            return { valid: false, error: 'URLs are not allowed in ingredients' };
        }
    }
    // Check instructions for URLs
    for (const instruction of instructions) {
        if (containsUrl(instruction)) {
            return { valid: false, error: 'URLs are not allowed in instructions' };
        }
    }
    return { valid: true };
}

// Helper function to extract YouTube video ID from URL
function getYouTubeVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// ============================================
// YOUTUBE RECIPE EXTRACTION
// ============================================

// Helper function to fetch YouTube video description
async function fetchYouTubeDescription(videoId) {
    try {
        console.log('Fetching YouTube page for video:', videoId);
        const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });

        if (!response.ok) {
            console.error('YouTube fetch failed with status:', response.status);
            return null;
        }

        const html = await response.text();
        console.log('YouTube page fetched, length:', html.length);

        // Try to extract description from the page's JSON data
        // YouTube embeds video data in a script tag as ytInitialPlayerResponse
        const playerResponseMatch = html.match(/var ytInitialPlayerResponse\s*=\s*({.+?});/s);
        if (playerResponseMatch) {
            try {
                const playerData = JSON.parse(playerResponseMatch[1]);
                const description = playerData?.videoDetails?.shortDescription;
                const title = playerData?.videoDetails?.title;
                const channelName = playerData?.videoDetails?.author;
                console.log('Found description via ytInitialPlayerResponse, length:', description?.length || 0);
                console.log('Channel name:', channelName);
                if (description) {
                    return { title, description, channelName };
                }
            } catch (parseError) {
                console.error('Error parsing ytInitialPlayerResponse:', parseError.message);
            }
        }

        // Fallback: try ytInitialData
        const initialDataMatch = html.match(/var ytInitialData\s*=\s*({.+?});/s);
        if (initialDataMatch) {
            try {
                const initialData = JSON.parse(initialDataMatch[1]);
                // Navigate to find description in the data structure
                const contents = initialData?.contents?.twoColumnWatchNextResults?.results?.results?.contents;
                if (contents) {
                    for (const content of contents) {
                        const description = content?.videoSecondaryInfoRenderer?.attributedDescription?.content;
                        if (description) {
                            console.log('Found description via ytInitialData, length:', description.length);
                            return { title: null, description };
                        }
                    }
                }
            } catch (parseError) {
                console.error('Error parsing ytInitialData:', parseError.message);
            }
        }

        console.log('Could not find description in YouTube page');
        return null;
    } catch (e) {
        console.error('Error fetching YouTube description:', e.message, e.stack);
        return null;
    }
}

// Extract recipe from YouTube video using Gemini AI
app.post('/api/youtube/extract', requireAuth, async (req, res) => {
    try {
        const { youtubeUrl } = req.body;

        if (!youtubeUrl) {
            return res.status(400).json({ error: 'YouTube URL is required' });
        }

        if (!genAI) {
            return res.status(500).json({ error: 'AI service not configured. Please contact administrator.' });
        }

        // Extract video ID
        const videoId = getYouTubeVideoId(youtubeUrl);
        if (!videoId) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }

        // Fetch transcript - try multiple language options
        let transcript = '';
        let transcriptError = null;
        let contentSource = 'transcript';

        // Try to fetch transcript with different language preferences
        const languageOptions = [
            undefined,  // Default (auto-detect)
            { lang: 'en' },
            { lang: 'en-US' },
            { lang: 'en-GB' },
        ];

        for (const langOption of languageOptions) {
            try {
                const transcriptData = await YoutubeTranscript.fetchTranscript(videoId, langOption);
                if (transcriptData && transcriptData.length > 0) {
                    transcript = transcriptData.map(item => item.text).join(' ');
                    break;
                }
            } catch (e) {
                transcriptError = e;
                console.log(`Transcript fetch failed with option ${JSON.stringify(langOption)}: ${e.message}`);
                continue;
            }
        }

        // Fetch video info (title, description, channel name)
        let videoTitle = '';
        let channelName = '';
        const videoInfo = await fetchYouTubeDescription(videoId);
        if (videoInfo) {
            videoTitle = videoInfo.title || '';
            channelName = videoInfo.channelName || '';

            // If no transcript, try to use video description
            if (!transcript || transcript.trim().length < 100) {
                console.log('No transcript available, trying video description...');
                if (videoInfo.description && videoInfo.description.length > 50) {
                    transcript = videoInfo.description;
                    contentSource = 'description';
                    console.log('Using video description instead of transcript');
                }
            }
        }

        if (!transcript || transcript.trim().length < 50) {
            return res.status(400).json({
                error: 'Could not extract content from this video. The video has no captions and the description does not contain recipe information.'
            });
        }

        // Call Gemini AI to extract recipe
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const contextType = contentSource === 'description' ? 'video description' : 'video transcript';
        const prompt = `Analyze this cooking ${contextType} and extract the recipe information.

${contentSource === 'description' && videoTitle ? `Video Title: ${videoTitle}\n\n` : ''}${contextType.charAt(0).toUpperCase() + contextType.slice(1)}:
${transcript.substring(0, 30000)}

Extract and return ONLY a JSON object with this exact structure (no markdown, no explanation, no code blocks):
{
    "title": "Recipe name",
    "ingredients": ["1 cup flour", "2 eggs", ...],
    "instructions": ["Preheat oven to 350°F", "Mix dry ingredients", ...]
}

Rules:
- Ingredients should include quantities and units when mentioned
- Instructions should be clear, actionable steps
- If the content doesn't contain a clear recipe, return {"error": "No recipe found in this video"}`;

        console.log(`Sending ${transcript.length} chars to Gemini (source: ${contentSource})`);

        let result;
        try {
            result = await model.generateContent(prompt);
        } catch (aiError) {
            console.error('Gemini API error:', aiError.message);
            return res.status(500).json({ error: 'AI service error: ' + aiError.message });
        }

        const responseText = result.response.text();
        console.log('Gemini response:', responseText.substring(0, 500));

        // Parse JSON from response
        let recipeData;
        try {
            // Handle potential markdown code blocks in response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            recipeData = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
        } catch (e) {
            console.error('JSON parse error:', e.message, 'Response:', responseText.substring(0, 500));
            return res.status(500).json({ error: 'Failed to parse AI response. Please try again.' });
        }

        if (recipeData.error) {
            return res.status(400).json({ error: recipeData.error });
        }

        // Generate YouTube thumbnail URL
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

        res.json({
            success: true,
            recipe: {
                title: recipeData.title || videoTitle || '',
                author: channelName || '',
                ingredients: recipeData.ingredients || [],
                instructions: recipeData.instructions || [],
                youtubeUrl: youtubeUrl,
                thumbnailUrl: thumbnailUrl,
                videoId: videoId
            }
        });
    } catch (error) {
        console.error('YouTube extraction error:', error.message, error.stack);
        res.status(500).json({ error: 'Failed to extract recipe from video. Please try again.' });
    }
});

// ============================================
// ADMIN: YOUTUBE CHANNEL BULK IMPORT
// ============================================

// Helper function to search YouTube for channels
async function searchYouTubeChannels(query) {
    try {
        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAg%3D%3D`;
        const response = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });

        if (!response.ok) {
            console.error('YouTube search failed with status:', response.status);
            return [];
        }

        const html = await response.text();

        // Extract ytInitialData from the page
        const initialDataMatch = html.match(/var ytInitialData\s*=\s*({.+?});/s);
        if (!initialDataMatch) {
            console.error('Could not find ytInitialData in search results');
            return [];
        }

        const initialData = JSON.parse(initialDataMatch[1]);
        const contents = initialData?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;

        if (!contents) {
            console.error('Could not find search contents in ytInitialData');
            return [];
        }

        const channels = [];

        for (const section of contents) {
            const items = section?.itemSectionRenderer?.contents;
            if (!items) continue;

            for (const item of items) {
                const channelRenderer = item?.channelRenderer;
                if (!channelRenderer) continue;

                const channelId = channelRenderer.channelId;
                const title = channelRenderer.title?.simpleText || '';
                const thumbnail = channelRenderer.thumbnail?.thumbnails?.[0]?.url || '';
                const subscriberCount = channelRenderer.subscriberCountText?.simpleText || '';
                const videoCount = channelRenderer.videoCountText?.simpleText || '';

                if (channelId && title) {
                    channels.push({
                        channelId,
                        title,
                        thumbnail: thumbnail.startsWith('//') ? 'https:' + thumbnail : thumbnail,
                        subscriberCount,
                        videoCount
                    });
                }
            }
        }

        return channels;
    } catch (error) {
        console.error('Error searching YouTube channels:', error);
        return [];
    }
}

// Helper function to get videos from a YouTube channel
async function getChannelVideos(channelId, maxResults = 30) {
    try {
        // Fetch channel's videos page
        const channelUrl = `https://www.youtube.com/channel/${channelId}/videos`;
        const response = await fetch(channelUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });

        if (!response.ok) {
            console.error('YouTube channel fetch failed with status:', response.status);
            return [];
        }

        const html = await response.text();

        // Extract ytInitialData from the page
        const initialDataMatch = html.match(/var ytInitialData\s*=\s*({.+?});/s);
        if (!initialDataMatch) {
            console.error('Could not find ytInitialData in channel page');
            return [];
        }

        const initialData = JSON.parse(initialDataMatch[1]);

        // Navigate to the videos tab content
        const tabs = initialData?.contents?.twoColumnBrowseResultsRenderer?.tabs;
        if (!tabs) {
            console.error('Could not find tabs in channel data');
            return [];
        }

        let videosContent = null;
        for (const tab of tabs) {
            if (tab?.tabRenderer?.title === 'Videos') {
                videosContent = tab?.tabRenderer?.content?.richGridRenderer?.contents;
                break;
            }
        }

        if (!videosContent) {
            console.error('Could not find videos tab content');
            return [];
        }

        const videos = [];

        for (const item of videosContent) {
            if (videos.length >= maxResults) break;

            const videoRenderer = item?.richItemRenderer?.content?.videoRenderer;
            if (!videoRenderer) continue;

            const videoId = videoRenderer.videoId;
            const title = videoRenderer.title?.runs?.[0]?.text || '';
            const thumbnail = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
            const duration = videoRenderer.lengthText?.simpleText || '';
            const viewCount = videoRenderer.viewCountText?.simpleText || '';
            const publishedTime = videoRenderer.publishedTimeText?.simpleText || '';

            if (videoId && title) {
                videos.push({
                    videoId,
                    title,
                    thumbnail,
                    duration,
                    viewCount,
                    publishedTime
                });
            }
        }

        return videos;
    } catch (error) {
        console.error('Error fetching channel videos:', error);
        return [];
    }
}

// Search YouTube channels (admin only)
app.get('/api/admin/youtube/search-channel', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({ error: 'Search query must be at least 2 characters' });
        }

        const channels = await searchYouTubeChannels(q.trim());

        res.json({ channels });
    } catch (error) {
        console.error('Error searching channels:', error);
        res.status(500).json({ error: 'Error searching YouTube channels' });
    }
});

// Get videos from a YouTube channel (admin only)
app.get('/api/admin/youtube/channel-videos', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { channelId } = req.query;

        if (!channelId) {
            return res.status(400).json({ error: 'Channel ID is required' });
        }

        const videos = await getChannelVideos(channelId, 50);

        res.json({ videos });
    } catch (error) {
        console.error('Error fetching channel videos:', error);
        res.status(500).json({ error: 'Error fetching channel videos' });
    }
});

// Bulk extract recipes from YouTube videos (admin only)
app.post('/api/admin/youtube/bulk-extract', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { videos, channelName } = req.body;

        if (!videos || !Array.isArray(videos) || videos.length === 0) {
            return res.status(400).json({ error: 'Videos array is required' });
        }

        if (videos.length > 20) {
            return res.status(400).json({ error: 'Maximum 20 videos per batch' });
        }

        if (!genAI) {
            return res.status(500).json({ error: 'AI service not configured' });
        }

        const results = {
            success: [],
            failed: []
        };

        // Process videos sequentially with delays to avoid rate limiting
        for (const video of videos) {
            try {
                const { videoId, title } = video;

                if (!videoId) {
                    results.failed.push({ videoId: 'unknown', title: title || 'Unknown', error: 'Missing video ID' });
                    continue;
                }

                // Fetch transcript or description
                let transcript = '';
                let contentSource = 'transcript';

                // Try transcript first
                const languageOptions = [undefined, { lang: 'en' }, { lang: 'en-US' }];
                for (const langOption of languageOptions) {
                    try {
                        const transcriptData = await YoutubeTranscript.fetchTranscript(videoId, langOption);
                        if (transcriptData && transcriptData.length > 0) {
                            transcript = transcriptData.map(item => item.text).join(' ');
                            break;
                        }
                    } catch (e) {
                        continue;
                    }
                }

                // Fallback to description
                let videoTitle = title;
                let videoChannelName = channelName || '';

                if (!transcript || transcript.trim().length < 100) {
                    const videoInfo = await fetchYouTubeDescription(videoId);
                    if (videoInfo) {
                        videoTitle = videoInfo.title || title;
                        videoChannelName = videoInfo.channelName || channelName || '';
                        if (videoInfo.description && videoInfo.description.length > 50) {
                            transcript = videoInfo.description;
                            contentSource = 'description';
                        }
                    }
                }

                if (!transcript || transcript.trim().length < 50) {
                    results.failed.push({ videoId, title: videoTitle, error: 'No captions or recipe in description' });
                    continue;
                }

                // Call Gemini AI
                const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
                const contextType = contentSource === 'description' ? 'video description' : 'video transcript';
                const prompt = `Analyze this cooking ${contextType} and extract the recipe information.

${contentSource === 'description' && videoTitle ? `Video Title: ${videoTitle}\n\n` : ''}${contextType.charAt(0).toUpperCase() + contextType.slice(1)}:
${transcript.substring(0, 30000)}

Extract and return ONLY a JSON object with this exact structure (no markdown, no explanation, no code blocks):
{
    "title": "Recipe name",
    "ingredients": ["1 cup flour", "2 eggs", ...],
    "instructions": ["Preheat oven to 350°F", "Mix dry ingredients", ...]
}

Rules:
- Ingredients should include quantities and units when mentioned
- Instructions should be clear, actionable steps
- If the content doesn't contain a clear recipe, return {"error": "No recipe found in this video"}`;

                const result = await model.generateContent(prompt);
                const responseText = result.response.text();

                // Parse JSON
                let recipeData;
                try {
                    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                    recipeData = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
                } catch (e) {
                    results.failed.push({ videoId, title: videoTitle, error: 'Failed to parse AI response' });
                    continue;
                }

                if (recipeData.error) {
                    results.failed.push({ videoId, title: videoTitle, error: recipeData.error });
                    continue;
                }

                // Save recipe to database
                const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

                const recipeDoc = {
                    user_id: req.userId,
                    name: recipeData.title || videoTitle || 'Untitled Recipe',
                    author: videoChannelName,
                    image: thumbnailUrl,
                    source_type: 'youtube',
                    source_data: {
                        type: 'youtube',
                        url: youtubeUrl,
                        videoId: videoId
                    },
                    ingredients: recipeData.ingredients || [],
                    instructions: recipeData.instructions || [],
                    status: 'approved', // Admin-imported recipes are auto-approved
                    created_at: admin.firestore.FieldValue.serverTimestamp()
                };

                const recipeRef = await db.collection('recipes').add(recipeDoc);

                results.success.push({
                    videoId,
                    title: recipeData.title || videoTitle,
                    recipeId: recipeRef.id
                });

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1500));

            } catch (videoError) {
                console.error('Error processing video:', video.videoId, videoError);
                results.failed.push({
                    videoId: video.videoId,
                    title: video.title || 'Unknown',
                    error: videoError.message || 'Processing failed'
                });
            }
        }

        res.json({
            success: true,
            results,
            summary: {
                total: videos.length,
                successful: results.success.length,
                failed: results.failed.length
            }
        });
    } catch (error) {
        console.error('Bulk extraction error:', error);
        res.status(500).json({ error: 'Bulk extraction failed: ' + error.message });
    }
});

// ============================================
// RECIPE CRUD OPERATIONS
// ============================================

app.post('/api/recipes', requireAuth, async (req, res) => {
    try {
        const { name, author, image, source, ingredients, instructions, forked_from } = req.body;
        const userId = req.userId;

        // Validate required fields
        if (!name || !ingredients || !instructions) {
            return res.status(400).json({ error: 'Missing required fields: name, ingredients, or instructions' });
        }

        if (!source || !source.type) {
            return res.status(400).json({ error: 'Missing source type' });
        }

        // Validate content for spam (URLs in ingredients/instructions)
        const contentValidation = validateRecipeContent(
            Array.isArray(ingredients) ? ingredients : [],
            Array.isArray(instructions) ? instructions : []
        );
        if (!contentValidation.valid) {
            return res.status(400).json({ error: contentValidation.error });
        }

        // If forking, validate the source recipe exists and is approved
        let forkedFromData = null;
        if (forked_from) {
            const sourceRecipe = await db.collection('recipes').doc(forked_from).get();
            if (!sourceRecipe.exists) {
                return res.status(400).json({ error: 'Source recipe not found' });
            }
            const sourceData = sourceRecipe.data();
            if (sourceData.status !== 'approved') {
                return res.status(400).json({ error: 'Can only fork approved recipes' });
            }
            forkedFromData = {
                recipe_id: forked_from,
                recipe_name: sourceData.name
            };
        }

        // Determine recipe status based on user type
        // Admins and trusted users get auto-approved, others are pending
        const isTrusted = await isUserTrusted(userId);
        const status = isTrusted ? 'approved' : 'pending';

        const recipeData = {
            user_id: userId,
            name,
            author: author || '',
            image: image || null,
            source_type: source.type,
            source_data: source,
            ingredients: Array.isArray(ingredients) ? ingredients : [],
            instructions: Array.isArray(instructions) ? instructions : [],
            status: status, // 'pending', 'approved', or 'declined'
            created_at: admin.firestore.FieldValue.serverTimestamp()
        };

        // Add forked_from data if this is a fork
        if (forkedFromData) {
            recipeData.forked_from = forkedFromData;
        }

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

// Update recipe (admin only)
app.put('/api/admin/recipes/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const recipeId = req.params.id;
        const { name, author, image, source, ingredients, instructions, status } = req.body;

        // Validate required fields
        if (!name || !ingredients || !instructions) {
            return res.status(400).json({ error: 'Missing required fields: name, ingredients, or instructions' });
        }

        const recipeDoc = await db.collection('recipes').doc(recipeId).get();
        if (!recipeDoc.exists) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        const updateData = {
            name,
            author: author || '',
            image: image || null,
            source_type: source?.type || 'manual',
            source_data: source || { type: 'manual' },
            ingredients: Array.isArray(ingredients) ? ingredients : [],
            instructions: Array.isArray(instructions) ? instructions : [],
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_by: req.userId
        };

        // Allow admin to update status if provided
        if (status && ['pending', 'approved', 'declined'].includes(status)) {
            updateData.status = status;
        }

        await db.collection('recipes').doc(recipeId).update(updateData);

        res.json({
            success: true,
            recipe: {
                id: recipeId,
                ...updateData,
                updated_at: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error updating recipe:', error);
        res.status(500).json({ error: 'Error updating recipe' });
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

app.get('/api/recipes/:id/rating', optionalAuth, async (req, res) => {
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

        // Build recipe list and track orphaned entries for cleanup
        const recipes = [];
        const orphanedRecipeIds = [];
        recipeDocs.forEach((recipeDoc, index) => {
            if (recipeDoc.exists) {
                const recipe = { id: recipeDoc.id, ...recipeDoc.data() };
                const ratingData = ratingsMap[recipeDoc.id] || { total: 0, count: 0 };
                recipe.averageRating = ratingData.count > 0
                    ? Math.round((ratingData.total / ratingData.count) * 10) / 10
                    : 0;
                recipe.ratingCount = ratingData.count;
                recipe.folder_created_at = recipeMetadata[recipeDoc.id]?.created_at;
                recipes.push(recipe);
            } else {
                // Recipe was deleted - track for cleanup
                orphanedRecipeIds.push(recipeIds[index]);
            }
        });

        // Clean up orphaned folder_recipes entries (async, don't wait)
        if (orphanedRecipeIds.length > 0) {
            (async () => {
                try {
                    const cleanupBatch = db.batch();
                    for (const orphanId of orphanedRecipeIds) {
                        const orphanSnapshot = await db.collection('folder_recipes')
                            .where('folder_id', '==', folderId)
                            .where('recipe_id', '==', orphanId)
                            .get();
                        orphanSnapshot.docs.forEach(doc => cleanupBatch.delete(doc.ref));
                    }
                    await cleanupBatch.commit();
                    console.log(`Cleaned up ${orphanedRecipeIds.length} orphaned folder_recipes entries`);
                } catch (e) {
                    console.error('Error cleaning up orphaned entries:', e);
                }
            })();
        }

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
        const appUrl = process.env.APP_URL || 'https://gitdish.com';
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

// ============================================
// ADMIN ROUTES
// ============================================

// Get all recipes (admin only) with pagination
app.get('/api/admin/recipes', requireAuth, requireAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const search = req.query.search || '';

        // Get all recipes (we'll sort and paginate in memory)
        const snapshot = await db.collection('recipes').get();
        let allRecipes = [];

        for (const doc of snapshot.docs) {
            const data = doc.data();
            // Skip system recipes
            if (data.user_id === 'system') continue;

            // Get user info for each recipe
            let username = 'Unknown';
            let userEmail = '';
            if (data.user_id) {
                const userDoc = await db.collection('users').doc(data.user_id).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    username = userData.username || 'Unknown';
                    userEmail = userData.email || '';
                }
            }

            allRecipes.push({
                id: doc.id,
                name: data.name,
                author: data.author,
                image: data.image,
                source_type: data.source_type,
                user_id: data.user_id,
                status: data.status || 'pending', // Default to pending for legacy recipes
                createdByUsername: username,
                userEmail: userEmail,
                createdAt: data.created_at ? { _seconds: Math.floor(data.created_at.toDate().getTime() / 1000) } : null,
                ingredientCount: data.ingredients?.length || 0,
                instructionCount: data.instructions?.length || 0
            });
        }

        // Sort by creation date (newest first)
        allRecipes.sort((a, b) => {
            const aTime = a.createdAt?._seconds || 0;
            const bTime = b.createdAt?._seconds || 0;
            return bTime - aTime;
        });

        // Filter by search if provided
        if (search) {
            const searchLower = search.toLowerCase();
            allRecipes = allRecipes.filter(r =>
                r.name?.toLowerCase().includes(searchLower) ||
                r.author?.toLowerCase().includes(searchLower) ||
                r.createdByUsername?.toLowerCase().includes(searchLower) ||
                r.userEmail?.toLowerCase().includes(searchLower)
            );
        }

        // Paginate
        const total = allRecipes.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const paginatedRecipes = allRecipes.slice(startIndex, startIndex + limit);

        res.json({
            recipes: paginatedRecipes,
            page,
            limit,
            total,
            totalPages
        });
    } catch (error) {
        console.error('Error fetching admin recipes:', error);
        res.status(500).json({ error: 'Error fetching recipes' });
    }
});

// Delete recipe (admin only) - also deletes storage image and folder references
app.delete('/api/admin/recipes/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const recipeId = req.params.id;

        // Get the recipe first
        const recipeDoc = await db.collection('recipes').doc(recipeId).get();

        if (!recipeDoc.exists) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        const recipeData = recipeDoc.data();

        // Don't allow deleting system recipes
        if (recipeData.user_id === 'system') {
            return res.status(403).json({ error: 'Cannot delete system recipes' });
        }

        // Delete image from Firebase Storage if it exists
        if (recipeData.image && recipeData.image.includes('firebasestorage.googleapis.com')) {
            try {
                // Extract the path from the URL
                // URL format: https://firebasestorage.googleapis.com/v0/b/BUCKET/o/PATH?token=...
                const urlParts = new URL(recipeData.image);
                const pathMatch = urlParts.pathname.match(/\/o\/(.+)$/);
                if (pathMatch) {
                    const filePath = decodeURIComponent(pathMatch[1]);
                    const bucket = admin.storage().bucket();
                    await bucket.file(filePath).delete();
                    console.log('Deleted storage file:', filePath);
                }
            } catch (storageError) {
                console.error('Error deleting storage file:', storageError);
                // Continue with recipe deletion even if storage deletion fails
            }
        }

        // Delete all folder_recipes references to this recipe
        const folderRecipesSnapshot = await db.collection('folder_recipes')
            .where('recipe_id', '==', recipeId)
            .get();

        const batch = db.batch();
        folderRecipesSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        // Delete all ratings for this recipe
        const ratingsSnapshot = await db.collection('ratings')
            .where('recipe_id', '==', recipeId)
            .get();

        ratingsSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        // Delete the recipe document
        batch.delete(db.collection('recipes').doc(recipeId));

        await batch.commit();

        res.json({
            success: true,
            message: 'Recipe deleted successfully',
            deletedFolderLinks: folderRecipesSnapshot.size,
            deletedRatings: ratingsSnapshot.size
        });
    } catch (error) {
        console.error('Error deleting recipe:', error);
        res.status(500).json({ error: 'Error deleting recipe' });
    }
});

// Approve a recipe (admin only)
app.post('/api/admin/recipes/:id/approve', requireAuth, requireAdmin, async (req, res) => {
    try {
        const recipeId = req.params.id;

        const recipeDoc = await db.collection('recipes').doc(recipeId).get();

        if (!recipeDoc.exists) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        const recipeData = recipeDoc.data();

        // Update recipe status to approved
        await db.collection('recipes').doc(recipeId).update({
            status: 'approved',
            approved_at: admin.firestore.FieldValue.serverTimestamp(),
            approved_by: req.userId
        });

        // Update user trust status based on new approval counts
        if (recipeData.user_id && recipeData.user_id !== 'system') {
            await updateUserTrustStatus(recipeData.user_id);
        }

        res.json({
            success: true,
            message: 'Recipe approved successfully'
        });
    } catch (error) {
        console.error('Error approving recipe:', error);
        res.status(500).json({ error: 'Error approving recipe' });
    }
});

// Decline a recipe (admin only)
app.post('/api/admin/recipes/:id/decline', requireAuth, requireAdmin, async (req, res) => {
    try {
        const recipeId = req.params.id;
        const { reason } = req.body;

        const recipeDoc = await db.collection('recipes').doc(recipeId).get();

        if (!recipeDoc.exists) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        const recipeData = recipeDoc.data();

        // Update recipe status to declined
        await db.collection('recipes').doc(recipeId).update({
            status: 'declined',
            declined_at: admin.firestore.FieldValue.serverTimestamp(),
            declined_by: req.userId,
            decline_reason: reason || null
        });

        // Update user trust status based on new decline counts
        if (recipeData.user_id && recipeData.user_id !== 'system') {
            await updateUserTrustStatus(recipeData.user_id);
        }

        res.json({
            success: true,
            message: 'Recipe declined'
        });
    } catch (error) {
        console.error('Error declining recipe:', error);
        res.status(500).json({ error: 'Error declining recipe' });
    }
});

// Get admin stats
app.get('/api/admin/stats', requireAuth, requireAdmin, async (req, res) => {
    try {
        // Count all recipes and filter out system ones manually (avoids index requirement)
        const recipesSnapshot = await db.collection('recipes').get();
        let recipeCount = 0;
        let pendingCount = 0;
        let approvedCount = 0;
        let declinedCount = 0;

        recipesSnapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.user_id !== 'system') {
                recipeCount++;
                const status = data.status || 'pending';
                if (status === 'pending') pendingCount++;
                else if (status === 'approved') approvedCount++;
                else if (status === 'declined') declinedCount++;
            }
        });

        // Count users
        const usersSnapshot = await db.collection('users').get();

        // Count trusted users
        let trustedCount = 0;
        usersSnapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.is_trusted === true) trustedCount++;
        });

        res.json({
            totalRecipes: recipeCount,
            totalUsers: usersSnapshot.size,
            pendingRecipes: pendingCount,
            approvedRecipes: approvedCount,
            declinedRecipes: declinedCount,
            trustedUsers: trustedCount
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ error: 'Error fetching stats' });
    }
});

// Export the Express app as a Firebase Function
exports.app = functions.https.onRequest(app);
