const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const session = require('express-session');

const app = express();
app.use(express.json());

app.use(session({
    secret: 'yourSecretKey', // เปลี่ยน secret ให้เป็นค่าเฉพาะของคุณ
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // เปลี่ยน secure: true หากใช้ HTTPS
}));

// เพิ่ม middleware CORS
app.use(cors({
    origin: 'http://127.0.0.1:5500', // ระบุ origin ที่ต้องการอนุญาต
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

// เสิร์ฟไฟล์ Static สำหรับ Main Page และ Admin Dashboard
app.use('/page/admin_dashboard/dashboard_statistics', express.static(path.join(__dirname, 'page/admin_dashboard/dashboard_statistics')));
app.use('/mainpage.html', express.static(path.join(__dirname, 'page/main_page')));
app.use('/page/login_page', express.static(path.join(__dirname, 'page/login_page')));

// MongoDB Connections
const userDB = mongoose.createConnection('mongodb+srv://bankweerpt:ohMpYPUHkNoz0Ba3@movie-mbti.k3yt3.mongodb.net/user?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const moviesListDB = mongoose.createConnection('mongodb+srv://bankweerpt:ohMpYPUHkNoz0Ba3@movie-mbti.k3yt3.mongodb.net/movies_list?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Define User Schema and Model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    role: { type: Number, required: true }, // Role: 1 = Admin, 0 = User
    firstname: { type: String },
    lastname: { type: String },
    email: { type: String },
    profileImage: { type: String },
});
const User = userDB.model('User', userSchema, 'users');

// Define MBTI Schema and Model
const mbtiSchema = new mongoose.Schema({
    username: { type: String, required: true },
    mbti_type: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});
const MBTI = moviesListDB.model('MBTI', mbtiSchema, 'mbti_list');

// Middleware: ตรวจสอบ Role Admin
function adminAuth(req, res, next) {
    const { username } = req.query;
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    User.findOne({ username }).then(user => {
        if (!user || user.role !== 1) {
            return res.status(403).json({ message: 'Access Denied: Admins Only' });
        }
        req.user = user;
        next();
    }).catch(err => {
        res.status(500).json({ message: 'Internal server error' });
    });
}

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // ค้นหาผู้ใช้ในฐานข้อมูล
        const user = await User.findOne({ username });

        // ตรวจสอบว่า username มีอยู่และ password ตรงกัน
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // บันทึกข้อมูลของผู้ใช้ลงใน session
        req.session.username = user.username;
        req.session.role = user.role;

        // ตอบกลับสถานะการล็อกอินสำเร็จ
        res.status(200).json({
            message: 'Login successful',
            username: user.username,
            role: user.role, // ระบุ role ของผู้ใช้
        });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});



// API: ตรวจสอบ Role
app.get('/api/check-role', (req, res) => {
    const username = req.query.username || req.session.username; // ใช้ session ถ้า query string ไม่มีค่า

    if (!username) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    User.findOne({ username }).then(user => {
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // เก็บค่าใน session
        req.session.username = user.username;
        res.status(200).json({
            username: user.username,
            role: user.role,
            firstname: user.firstname,
            lastname: user.lastname,
            profileImage: user.profileImage || '/default-image.png',
        });
    }).catch(err => {
        console.error("Error:", err);
        res.status(500).json({ message: 'Failed to check role.' });
    });
});

app.get('/get-session-user', (req, res) => {
    if (req.session && req.session.username) {
        res.status(200).json({ username: req.session.username });
    } else {
        res.status(401).json({ message: 'Session not found' });
    }
});


app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.status(500).json({ message: "Failed to log out." });
        }
        res.status(200).json({ message: "Logout successful." });
    });
});


// API: ดึงข้อมูลผู้ใช้ทั้งหมด
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users.' });
    }
});

// API: แสดงข้อมูลใน Admin Dashboard
app.get('/admin/dashboard-info', adminAuth, (req, res) => {
    const user = req.user;
    res.status(200).json({
        message: 'Welcome to Admin Dashboard',
        admin: {
            username: user.username,
            role: user.role,
            firstname: user.firstname,
            lastname: user.lastname,
        },
    });
});

// API: MBTI Statistics
app.get('/api/mbti-stats', async (req, res) => {
    try {
        const allMBTITypes = [
            "INTJ", "INTP", "ENTJ", "ENTP",
            "INFJ", "INFP", "ENFJ", "ENFP",
            "ISTJ", "ISFJ", "ESTJ", "ESFJ",
            "ISTP", "ISFP", "ESTP", "ESFP"
        ];

        const mbtiStats = await MBTI.aggregate([
            { $group: { _id: "$mbti_type", count: { $sum: 1 } } }
        ]);

        const statsFromDB = {};
        mbtiStats.forEach(stat => {
            statsFromDB[stat._id] = stat.count;
        });

        const formattedStats = {};
        allMBTITypes.forEach(type => {
            formattedStats[type] = statsFromDB[type] || 0;
        });

        res.status(200).json(formattedStats);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch MBTI statistics.' });
    }
});

// Route: Admin Dashboard
app.get('/admin/dashboard', adminAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'page/admin_dashboard/dashboard_statistics/admin_dashboard.html'));
});

function validateSession(req, res, next) {
    if (req.session && req.session.username) {
        console.log('Session Active:', req.session.username);
        return next();
    }
    console.log('Session Expired or Missing');
    res.redirect('/page/login_page/index.html');
}
app.get('/mainpage.html', (req, res) => {
    res.redirect('http://127.0.0.1:5500/page/main_page/mainpage.html');
});

app.get('/main-page/mainpage.html', (req, res) => {
    if (!req.session.username) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'page/main_page/mainpage.html'));
});

// Start Server
const PORT = process.env.ADMIN_PORT || 6001;
app.listen(PORT, () => {
    console.log(`Admin backend running on http://localhost:${PORT}`);
});
