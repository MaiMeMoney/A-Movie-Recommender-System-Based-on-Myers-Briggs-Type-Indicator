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

const movieScoreSchema = new mongoose.Schema({
    movieId: { type: mongoose.Schema.Types.ObjectId, required: true },
    username: { type: String, required: true },
    score: { type: Number, required: true, min: 1, max: 10 }
});

const searchLogSchema = new mongoose.Schema({
    query: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});
const SearchLog = moviesListDB.model('SearchLog', searchLogSchema, 'searchlogs');  // เปลี่ยนจาก mongoose.model เป็น moviesListDB.model


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

app.get('/api/search-stats', async (req, res) => {
    try {
        const stats = await SearchLog.aggregate([
            { $group: { _id: "$query", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);
        res.status(200).json(stats);
    } catch (error) {
        console.error("Error fetching search stats:", error);
        res.status(500).json({ message: "Failed to fetch search stats" });
    }
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

app.post('/api/movie-view', async (req, res) => {
    const { movieId } = req.body;
    console.log('Received view count request for movie:', movieId);

    if (!movieId) {
        console.error('Missing movieId in request');
        return res.status(400).json({ message: "Movie ID is required" });
    }

    try {
        const movie = await Movie.findById(movieId);
        if (!movie) {
            console.error('Movie not found:', movieId);
            return res.status(404).json({ message: "Movie not found" });
        }

        const result = await Movie.findByIdAndUpdate(movieId, 
            { $inc: { viewCount: 1 } },
            { new: true }
        );
        console.log('Updated view count for movie:', movieId, 'New count:', result.viewCount);
        
        res.status(200).json({ 
            message: "View count updated",
            viewCount: result.viewCount
        });
    } catch (error) {
        console.error("Error updating view count:", error);
        res.status(500).json({ message: "Failed to update view count" });
    }
});

app.get('/api/popular-movies', async (req, res) => {
    try {
        // ใช้ connection ที่มีอยู่เพื่อดึงข้อมูลจาก main database
        const popularMovies = await Movie.find()
            .sort({ viewCount: -1 })
            .limit(10)
            .select('Series_Title viewCount');
            
        res.json(popularMovies);
    } catch (error) {
        console.error('Error fetching popular movies:', error);
        res.status(500).json({ message: 'Failed to fetch popular movies' });
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

// Schemas
const movieSchema = new mongoose.Schema({
    Series_Title: String,
    Released_Year: String,
    Certificate: String,
    Runtime: String,
    Genre: String,
    IMDB_Rating: Number,
    Overview: String,
    Meta_score: Number,
    Director: String,
    Star1: String,
    Star2: String,
    Star3: String,
    Star4: String,
    No_of_Votes: Number,
    Gross: String,
    link_movies: String,
    viewCount: { type: Number, default: 0 },
    searchCount: { type: Number, default: 0 }
});

const Movie = moviesListDB.model('movies_list', movieSchema, 'movies');



const MovieScore = moviesListDB.model('MovieScore', movieScoreSchema, 'movies_scores');

// เพิ่มต่อจาก Schema อื่นๆ ที่มีอยู่แล้ว
const userMovieInteractionSchema = new mongoose.Schema({
    userId: String,
    movieId: mongoose.Schema.Types.ObjectId,
    interactions: {
        viewed: { type: Boolean, default: false },
        rating: { type: Number, min: 1, max: 10 },
        addedToWatchlist: { type: Boolean, default: false },
        mbtiType: String,
        timestamp: { type: Date, default: Date.now }
    }
});

const UserMovieInteraction = moviesListDB.model('UserMovieInteraction', userMovieInteractionSchema);

const watchlistSchema = new mongoose.Schema({
    username: { type: String, required: true },
    listName: { type: String, default: 'Favorite' },
    movies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'movies_list' }]
});
const Watchlist = moviesListDB.model('Watchlist', watchlistSchema, 'watchlists');


// เพิ่มต่อจาก API อื่นๆ
app.get('/api/analytics/dashboard', adminAuth, async (req, res) => {
    const { username } = req.query;
    console.log('Received request for analytics with username:', username);

    if (!username) {
        return res.status(400).json({ message: 'Username is required' });
    }
    try {
        // 1. Top Rated Movies with Details
        const topRatedMovies = await MovieScore.aggregate([
            {
                $group: {
                    _id: "$movieId",
                    movieName: { $first: "$movieName" },
                    averageRating: { $avg: "$score" },
                    totalRatings: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "movies",
                    localField: "_id",
                    foreignField: "_id",
                    as: "movieDetails"
                }
            },
            { $unwind: "$movieDetails" },
            { $sort: { averageRating: -1, totalRatings: -1 } },
            { $limit: 10 },
            {
                $project: {
                    movieName: 1,
                    averageRating: 1,
                    totalRatings: 1,
                    title: "$movieDetails.Series_Title",
                    genre: "$movieDetails.Genre"
                }
            }
        ]);

        // 2. Most Popular Movies in Watchlists
        const popularWatchlistMovies = await Watchlist.aggregate([
            { $unwind: "$movies" },
            {
                $group: {
                    _id: "$movies",
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "movies",
                    localField: "_id",
                    foreignField: "_id",
                    as: "movieDetails"
                }
            },
            { $unwind: "$movieDetails" },
            { $sort: { count: -1 } },
            { $limit: 10 },
            {
                $project: {
                    movieTitle: "$movieDetails.Series_Title",
                    count: 1,
                    genre: "$movieDetails.Genre"
                }
            }
        ]);

        // 3. MBTI Distribution
        const mbtiStats = await MBTI.aggregate([
            {
                $group: {
                    _id: "$mbti_type",
                    count: { $sum: 1 }
                }
            }
        ]);

        // 4. Genre Popularity
        const genrePopularity = await Movie.aggregate([
            {
                $group: {
                    _id: "$Genre",
                    count: { $sum: 1 },
                    averageRating: { $avg: "$IMDB_Rating" }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // 5. Recent Activity
        const recentActivity = await MovieScore.aggregate([
            { $sort: { createdAt: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "movies",
                    localField: "movieId",
                    foreignField: "_id",
                    as: "movieDetails"
                }
            },
            { $unwind: "$movieDetails" },
            {
                $project: {
                    username: 1,
                    score: 1,
                    createdAt: 1,
                    movieTitle: "$movieDetails.Series_Title"
                }
            }
        ]);

        // 6. Popular Movies by View Count
        const popularMoviesByViewCount = await Movie.find()
            .sort({ viewCount: -1 })
            .limit(10)
            .select("Series_Title viewCount");

        res.json({
            topRatedMovies,
            popularWatchlistMovies,
            mbtiStats,
            genrePopularity,
            recentActivity,
            popularMoviesByViewCount // เพิ่มส่วนนี้กลับไป
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({
            message: 'Failed to fetch analytics',
            error: error.message
        });
    }
});

app.post('/api/movie/view', async (req, res) => {
    try {
        const { movieId } = req.body;
        if (!movieId) {
            return res.status(400).json({ message: 'Movie ID is required' });
        }

        // อัพเดท viewCount
        await Movie.findByIdAndUpdate(movieId, { $inc: { viewCount: 1 } });
        
        res.json({ message: 'View count updated successfully' });
    } catch (error) {
        console.error('Error updating view count:', error);
        res.status(500).json({ message: 'Failed to update view count' });
    }
});

app.post('/api/log-search', async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const searchLog = new SearchLog({ 
            query,
            timestamp: new Date()
        });
        await searchLog.save();
        
        res.status(201).json({ message: 'Search logged successfully' });
    } catch (error) {
        console.error('Error logging search:', error);
        res.status(500).json({ message: 'Failed to log search' });
    }
});

// Start Server
const PORT = process.env.ADMIN_PORT || 6001;
app.listen(PORT, () => {
    console.log(`Admin backend running on http://localhost:${PORT}`);
});
