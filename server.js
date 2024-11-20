const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());

// MongoDB connection using environment variable
mongoose.connect('mongodb+srv://bankweerpt:ohMpYPUHkNoz0Ba3@movie-mbti.k3yt3.mongodb.net/movies_list?retryWrites=true&w=majority')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.log('MongoDB connection error:', err));

const { ObjectId } = mongoose.Types;

// Define Movie Schema and Model
const movieSchema = new mongoose.Schema({
    Poster_Link: String,
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
    link_movies: String
});

const Movie = mongoose.model('movies_list', movieSchema, 'movies');

// API to fetch a movie by movieId
app.get('/movies_list/movies/:movieId', async (req, res) => {
    try {
        const movieId = req.params.movieId;

        // ตรวจสอบว่า movieId มีรูปแบบที่ถูกต้อง
        if (!ObjectId.isValid(movieId)) {
            return res.status(400).json({ message: 'Invalid movie ID format' });
        }

        // ค้นหาใน MongoDB
        const movie = await Movie.findOne({ _id: new ObjectId(movieId) });

        if (!movie) {
            console.log("Movie not found");
            return res.status(404).json({ message: 'Movie not found' });
        }

        // Log ข้อมูลหนังเพื่อตรวจสอบว่ามี link_movies หรือไม่
        console.log("Fetched movie data:", movie);

        res.json(movie);
    } catch (error) {
        console.error("Error fetching movie data:", error);
        res.status(500).json({ message: 'Error fetching movie details' });
    }
});

// Define MBTI Schema and Model
const mbtiSchema = new mongoose.Schema({
    username: { type: String, required: true },
    mbti_type: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const MBTI = mongoose.model('mbti_list', mbtiSchema, 'mbti_list');

// API Endpoint เพื่อเพิ่มข้อมูล MBTI
app.post('/api/saveMBTI', async (req, res) => {
    try {
        const { mbtiType, username } = req.body;

        if (!mbtiType || !username) {
            return res.status(400).json({ message: 'MBTI type and username are required' });
        }

        // อัปเดต mbti_type ของผู้ใช้ถ้ามีอยู่แล้วในฐานข้อมูล มิฉะนั้นให้สร้างใหม่
        const result = await MBTI.findOneAndUpdate(
            { username },
            { mbti_type: mbtiType },
            { new: true, upsert: true }
        );

        console.log(`MBTI for username ${username} updated/inserted with mbti_type: ${mbtiType}`);
        res.status(200).json({ message: 'MBTI updated successfully', data: result });
    } catch (error) {
        console.error("Error updating/inserting MBTI:", error);
        res.status(500).json({ message: 'Failed to update MBTI' });
    }
});

// API เพื่อเช็ค MBTI ของผู้ใช้
app.post('/api/check-mbti', async (req, res) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ message: 'Username is required' });
        }

        // ค้นหาในฐานข้อมูล
        const user = await MBTI.findOne({ username });
        console.log('User data found:', user);

        if (user && user.mbti_type) {
            res.json({ hasMBTI: true });
        } else {
            res.json({ hasMBTI: false });
        }
    } catch (error) {
        console.error("Error checking MBTI:", error);
        res.status(500).json({ message: 'Failed to check MBTI', error: error.message });
    }
});
//ดึงค่า MBTI ของผู้ใช้จาก mbti_list
app.get('/api/mbti/:username', async (req, res) => {
    try {
        const username = req.params.username;
        await client.connect();
        const db = client.db(dbName);

        // ค้นหาข้อมูลผู้ใช้ใน collection movies_list
        const userMovieData = await db.collection('movies_list').findOne({ username });
        if (!userMovieData) {
            return res.status(404).json({ message: 'User not found in movies_list' });
        }

        // ค้นหา MBTI ที่เกี่ยวข้องใน mbti_list
        const mbtiData = await db.collection('mbti_list').findOne({ mbti_id: userMovieData.mbti_id });
        if (!mbtiData) {
            return res.status(404).json({ message: 'MBTI not found in mbti_list' });
        }

        res.json({ mbti: mbtiData.mbti });
    } catch (error) {
        console.error('Error fetching MBTI:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Example API: Other existing APIs
app.get('/api/example', (req, res) => {
    res.json({ message: 'This is an example API.' });
});

app.post('/api/update-mbti', async (req, res) => {
    try {
        const { username, mbti } = req.body;

        if (!username || !mbti) {
            return res.status(400).json({ message: 'Username and MBTI are required' });
        }

        const updatedUser = await MBTI.findOneAndUpdate(
            { username },
            { mbti_type: mbti },
            { new: true, upsert: true } // อัปเดตหรือเพิ่มข้อมูลใหม่ถ้าไม่พบ
        );

        if (updatedUser) {
            res.json({ message: 'MBTI updated successfully', mbti: updatedUser.mbti_type });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating MBTI:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/user-mbti/:username', async (req, res) => {
    try {
        const username = req.params.username;

        if (!username) {
            return res.status(400).json({ message: 'Username is required' });
        }

        const userMbti = await MBTI.findOne({ username });
        if (!userMbti) {
            return res.status(404).json({ message: 'MBTI not found' });
        }

        res.json({ mbti: userMbti.mbti_type });
    } catch (error) {
        console.error('Error fetching user MBTI:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// API to fetch video details from link_movies
app.get('/movies_list/movies/:movieId/video', async (req, res) => {
    try {
        const movieId = req.params.movieId;

        if (!ObjectId.isValid(movieId)) {
            return res.status(400).json({ message: 'Invalid movie ID format' });
        }

        const movie = await Movie.findOne({ _id: new ObjectId(movieId) });
        
        if (!movie || !movie.link_movies) {
            return res.status(404).json({ message: 'Video link not found' });
        }

        // Extract Video ID if link_movies is a full URL
        let videoId = movie.link_movies;
        const youtubeRegex = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=))([\w-]+)/;
        const match = videoId.match(youtubeRegex);

        if (match) {
            videoId = match[1]; // Extract Video ID
        }

        res.json({ link: videoId });
    } catch (error) {
        console.error("Error fetching video data:", error);
        res.status(500).json({ message: 'Error fetching video details' });
    }
});

const path = require('path'); // เพิ่มโมดูล path สำหรับจัดการเส้นทาง

// ให้ Express ให้บริการไฟล์ static จากโฟลเดอร์ public
app.use(express.static(path.join(__dirname, 'public')));

// เส้นทาง fallback สำหรับส่งไฟล์ movie-details.html หากไม่มี API ที่ตรงกับ URL
app.get('/movie-details.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'movie-details.html'));
});


// Start the server on port 5001
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
