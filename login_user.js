// login_user.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ข้อมูลการเชื่อมต่อ MongoDB
const uri = 'mongodb+srv://bankweerpt:ohMpYPUHkNoz0Ba3@movie-mbti.k3yt3.mongodb.net/?retryWrites=true&w=majority';

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors());
app.use(helmet());
app.use('/uploads', express.static('uploads'));

// ตั้งค่า Multer สำหรับการจัดเก็บไฟล์รูปภาพ
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
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

// ฟังก์ชันสำหรับการสมัครสมาชิก
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
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, firstname, lastname, email, password } = req.body;
        const client = new MongoClient(uri);

        try {
            await client.connect();
            const database = client.db('user');
            const collection = database.collection('users');

            const existingUser = await collection.findOne({
                $or: [{ username: username }, { email: email }]
            });
            if (existingUser) {
                return res.status(400).send('❌ Username or Email already exists');
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            await collection.insertOne({
                username, 
                firstname, 
                lastname, 
                email, 
                password: hashedPassword,
                profileImage: ''
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

// ฟังก์ชันสำหรับการล็อกอิน
app.post('/login', [
    body('username').trim().escape(),
    body('password').trim().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const database = client.db('user');
        const collection = database.collection('users');
        const user = await collection.findOne({ username });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: '❌ Invalid username or password' });
        }

        

        res.status(200).json({ message: '✅ Login successful!', username: user.username });
    } catch (error) {
        console.error('❌ Error during login:', error);
        res.status(500).json({ message: '❌ Internal server error' });
    } finally {
        await client.close();
    }
});

// ฟังก์ชันสำหรับการดึงข้อมูลผู้ใช้
app.get('/user/:username', async (req, res) => {
    const { username } = req.params;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const database = client.db('user');
        const collection = database.collection('users');
        const user = await collection.findOne({ username });

        if (user) {
            res.status(200).json({
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                profileImage: user.profileImage || 'https://www.gravatar.com/avatar/?d=mp&f=y'  // URL รูปพื้นฐาน
            });
        } else {
            res.status(404).send('❌ User not found');
        }
    } catch (error) {
        console.error('❌ Error fetching user:', error);
        res.status(500).send('❌ Internal server error');
    } finally {
        await client.close();
    }
});

// ฟังก์ชันสำหรับการอัปโหลดรูปโปรไฟล์
app.post('/upload', (req, res) => {
    upload.single('image')(req, res, async (err) => {
        if (err) {
            return res.status(400).send(`❌ Error: ${err.message}`);
        }

        if (!req.file) {
            return res.status(400).send('❌ No file uploaded or invalid file type!');
        }

        const username = req.body.username;
        const imageUrl = `/uploads/${req.file.filename}`;
        const client = new MongoClient(uri);

        try {
            await client.connect();
            const database = client.db('user');
            const collection = database.collection('users');
            const result = await collection.updateOne(
                { username: username },
                { $set: { profileImage: imageUrl } }
            );

            if (result.modifiedCount > 0) {
                res.status(200).json({ imageUrl });
            } else {
                res.status(404).send('❌ User not found or no changes made');
            }
        } catch (error) {
            console.error('❌ Error uploading image:', error);
            res.status(500).send('❌ Internal server error');
        } finally {
            await client.close();
        }
    });
});

// ฟังก์ชันสำหรับการอัปเดทโปรไฟล์
app.post('/update-profile', async (req, res) => {
    const { username, email, firstName, lastName, password } = req.body;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const database = client.db('user');
        const collection = database.collection('users');

        const updateFields = {
            email: email,
            firstname: firstName,
            lastname: lastName
        };

        // ถ้ามีการเปลี่ยนรหัสผ่าน ให้แฮชและอัปเดตรหัสผ่านใหม่
        if (password) {
            updateFields.password = await bcrypt.hash(password, 10);
        }

        const result = await collection.updateOne(
            { username: username },
            { $set: updateFields }
        );

        if (result.modifiedCount > 0) {
            res.status(200).send('Profile updated successfully');
        } else {
            res.status(404).send('User not found or no changes made');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).send('Internal server error');
    } finally {
        await client.close();
    }
});

// เริ่มเซิร์ฟเวอร์
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});