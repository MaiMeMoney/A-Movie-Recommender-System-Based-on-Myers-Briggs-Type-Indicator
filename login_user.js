const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');

// MongoDB Connection
const uri = 'mongodb+srv://bankweerpt:ohMpYPUHkNoz0Ba3@movie-mbti.k3yt3.mongodb.net/?retryWrites=true&w=majority';

// App Initialization
const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors({ origin: ['http://localhost:3000'], credentials: true })); // Update allowed origins as necessary
app.use(helmet());
app.use('/uploads', express.static('uploads'));

// JWT Configuration
const secretKey = "your_secret_key";
const refreshTokens = [];

// Multer Setup for File Uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only images (jpeg, jpg, png) are allowed!'));
        }
    }
});

// Middleware for Authentication
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: '❌ Token is required' });

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.status(403).json({ message: '❌ Invalid or expired token' });
        req.user = user;
        next();
    });
}

// Routes
// Register Route
app.post('/register', 
    [
        body('username').trim().escape(),
        body('firstname').trim().escape(),
        body('lastname').trim().escape(),
        body('email').isEmail().normalizeEmail(),
        body('password').trim().escape()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { username, firstname, lastname, email, password } = req.body;
        const client = new MongoClient(uri);

        try {
            await client.connect();
            const db = client.db('user');
            const users = db.collection('users');

            const existingUser = await users.findOne({ $or: [{ username }, { email }] });
            if (existingUser) return res.status(400).send('❌ Username or Email already exists');

            const hashedPassword = await bcrypt.hash(password, 10);
            await users.insertOne({
                username,
                firstname,
                lastname,
                email,
                password: hashedPassword,
                profileImage: '',
                role: 0
            });

            res.status(201).send('✅ Registration successful!');
        } catch (error) {
            console.error('❌ Error during registration:', error);
            res.status(500).send('❌ Internal server error');
        } finally {
            await client.close();
        }
    }
);

// Login Route
app.post('/login', 
    [
        body('username').trim().escape(),
        body('password').trim().escape()
    ], 
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { username, password } = req.body;
        const client = new MongoClient(uri);

        try {
            await client.connect();
            const db = client.db('user');
            const users = db.collection('users');
            const user = await users.findOne({ username });
    try {
        await client.connect();
        const database = client.db('user');
        const collection = database.collection('users');

        // ค้นหาผู้ใช้จากฐานข้อมูล
        const user = await collection.findOne({ username });

            // ตรวจสอบว่าผู้ใช้มีอยู่หรือไม่
        if (!user) {
            return res.status(404).json({ message: '❌ User not found' });
        }

        // ตรวจสอบสถานะ banned
        if (user.banned) {
            return res.status(403).json({ message: '❌ Your account has been banned. Please contact support.' });
        }

        // ตรวจสอบรหัสผ่าน
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
                return res.status(401).json({ message: '❌ Invalid username or password' });
            }

            const token = jwt.sign({ id: user._id, username: user.username }, secretKey, { expiresIn: '1h' });
            const refreshToken = jwt.sign({ id: user._id, username: user.username }, secretKey);
            refreshTokens.push(refreshToken);

            res.status(200).json({ message: '✅ Login successful!', token, refreshToken });
        } catch (error) {
            console.error('❌ Error during login:', error);
            res.status(500).json({ message: '❌ Internal server error' });
        } finally {
            await client.close();
        }
    }
);

// Refresh Token Route
app.post('/refresh-token', (req, res) => {
    const { token } = req.body;
    if (!token || !refreshTokens.includes(token)) {
        return res.status(403).json({ message: '❌ Invalid Refresh Token' });
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.status(403).json({ message: '❌ Invalid or expired Refresh Token' });

        const newAccessToken = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '1h' });
        res.json({ token: newAccessToken });
    });
});

// Get User Data
app.get('/user/:username', authenticateToken, async (req, res) => {
    const { username } = req.params;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('user');
        const users = db.collection('users');
        const user = await users.findOne({ username });

        if (!user) return res.status(404).send('❌ User not found');

        res.status(200).json({
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            profileImage: user.profileImage || 'https://www.gravatar.com/avatar/?d=mp&f=y'
        });
    } catch (error) {
        console.error('❌ Error fetching user:', error);
        res.status(500).send('❌ Internal server error');
    } finally {
        await client.close();
    }
});

// Profile Image Upload
app.post('/upload', upload.single('image'), async (req, res) => {
    const username = req.body.username;
    const imageUrl = `/uploads/${req.file.filename}`;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('user');
        const users = db.collection('users');
        const result = await users.updateOne({ username }, { $set: { profileImage: imageUrl } });

        if (result.modifiedCount === 0) return res.status(404).send('❌ User not found or no changes made');

        res.status(200).json({ imageUrl });
    } catch (error) {
        console.error('❌ Error uploading image:', error);
        res.status(500).send('❌ Internal server error');
    } finally {
        await client.close();
    }
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
