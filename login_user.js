const express = require('express');
const cors = require('cors');  // เปิดใช้งาน CORS
const helmet = require('helmet');  // ใช้ Helmet เพื่อความปลอดภัย
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');
const { body, validationResult } = require('express-validator');  // ใช้ express-validator
const multer = require('multer');  // ใช้สำหรับจัดการการอัปโหลดไฟล์
const path = require('path');  // ใช้สำหรับจัดการเส้นทางไฟล์

// ข้อมูลการเชื่อมต่อ MongoDB
const uri = 'mongodb+srv://bankweerpt:ohMpYPUHkNoz0Ba3@movie-mbti.k3yt3.mongodb.net/?retryWrites=true&w=majority';

// สร้างแอป Express
const app = express();
app.use(express.json({ limit: '10mb' }));  // เพิ่ม limit ของ body parser เป็น 10MB
app.use(cors());  // เปิดใช้งาน CORS
app.use(helmet());  // เปิดใช้งาน Helmet
app.use('/uploads', express.static('uploads'));  // ทำให้โฟลเดอร์ uploads สามารถเข้าถึงได้จากภายนอก

// ตั้งค่า Multer สำหรับการจัดเก็บไฟล์รูปภาพ
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');  // โฟลเดอร์สำหรับจัดเก็บรูปภาพ
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));  // ตั้งชื่อไฟล์ใหม่
    }
});
const upload = multer({ storage: storage });

// ฟังก์ชันสำหรับการสมัครสมาชิก (แก้ไขเพิ่มเติม)
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
            console.log('✅ Connected to MongoDB for registration!');

            const database = client.db('user');
            const collection = database.collection('users');

            // ตรวจสอบว่ามีผู้ใช้ที่มี username นี้อยู่แล้วหรือไม่
            const existingUser = await collection.findOne({ username: username });
            if (existingUser) {
                return res.status(400).send('❌ Username already exists');
            }

            // แฮชรหัสผ่านก่อนบันทึกลงฐานข้อมูล
            const hashedPassword = await bcrypt.hash(password, 10);
            await collection.insertOne({
                username, 
                firstname, 
                lastname, 
                email, 
                password: hashedPassword 
            });

            console.log('✅ User registered successfully!');
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
app.post('/login',
    [
        body('username').trim().escape(),
        body('password').trim().escape()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;
        const client = new MongoClient(uri);

        try {
            await client.connect();
            console.log('✅ Connected to MongoDB successfully for login!');

            const database = client.db('user');
            const collection = database.collection('users');

            const user = await collection.findOne({ username: username });

            if (!user) {
                return res.status(401).send('❌ Invalid username or password');
            }

            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                res.status(200).json({ message: '✅ Login successful!', username: user.username });
            } else {
                res.status(401).send('❌ Invalid username or password');
            }
        } catch (error) {
            console.error('❌ Error during login:', error);
            res.status(500).send('❌ Internal server error');
        } finally {
            await client.close();
        }
    }
);

// ฟังก์ชันสำหรับการดึงข้อมูลผู้ใช้
app.get('/user/:username', async (req, res) => {
    const { username } = req.params;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log(`✅ Connected to MongoDB to fetch user: ${username}`);

        const database = client.db('user');
        const collection = database.collection('users');

        const user = await collection.findOne({ username });

        if (user) {
            res.status(200).json({
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                profileImage: user.profileImage || null  // เพิ่มการส่งข้อมูลรูปภาพ
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
app.post('/upload', upload.single('image'), async (req, res) => {
    const username = req.body.username;
    const imageUrl = `/uploads/${req.file.filename}`;  // URL ของรูปภาพที่อัปโหลด

    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log(`✅ Connected to MongoDB for image upload: ${username}`);

        const database = client.db('user');
        const collection = database.collection('users');

        // อัปเดตรูปภาพในฐานข้อมูล
        const result = await collection.updateOne(
            { username: username },
            { $set: { profileImage: imageUrl } }
        );

        if (result.modifiedCount > 0) {
            res.status(200).json({ imageUrl });  // ส่ง URL ของรูปภาพกลับไป
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

// ฟังก์ชันสำหรับการอัปโหลดรูปโปรไฟล์
app.post('/upload', upload.single('image'), async (req, res) => {
    const username = req.body.username;
    const imageUrl = `/uploads/${req.file.filename}`;  // URL ของรูปภาพที่อัปโหลด

    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log(`✅ Connected to MongoDB for image upload: ${username}`);

        const database = client.db('user');
        const collection = database.collection('users');

        // อัปเดตรูปภาพในฐานข้อมูล
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

// เริ่มเซิร์ฟเวอร์
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});