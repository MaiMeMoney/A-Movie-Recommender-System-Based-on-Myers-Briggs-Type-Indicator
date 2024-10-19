const express = require('express');
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');

// ข้อมูลการเชื่อมต่อ MongoDB
const uri = 'mongodb+srv://bankweerpt:ohMpYPUHkNoz0Ba3@movie-mbti.k3yt3.mongodb.net/?retryWrites=true&w=majority';

// สร้างแอป Express
const app = express();
app.use(express.json());  // ใช้ในการแปลง request body เป็น JSON

// ฟังก์ชันสำหรับตรวจสอบการล็อกอิน
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB successfully for login!');

        const database = client.db('user');
        const collection = database.collection('users');

        // ค้นหาผู้ใช้จากฐานข้อมูล
        const user = await collection.findOne({ username: username });

        if (!user) {
            console.log('❌ No user found with this username');
            return res.status(401).send('❌ Invalid username or password');
        }

        console.log('🔍 User found:', user);

        // เปรียบเทียบรหัสผ่าน
        const passwordMatch = await bcrypt.compare(password, user.password);
        console.log('🔑 Password match:', passwordMatch);

        if (passwordMatch) {
            res.status(200).send('✅ Login successful!');
        } else {
            res.status(401).send('❌ Invalid username or password');
        }
    } catch (error) {
        console.error('❌ Error during login:', error);
        res.status(500).send('❌ Internal server error');
    } finally {
        await client.close();
        console.log('🔌 Connection closed.');
    }
});

// เริ่มเซิร์ฟเวอร์
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});