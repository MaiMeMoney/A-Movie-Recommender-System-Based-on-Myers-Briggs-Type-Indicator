const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // ประกาศที่นี่เพียงครั้งเดียว
require('dotenv').config();


const app = express();
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());

// MongoDB connection using environment variable
mongoose.connect('mongodb+srv://bankweerpt:ohMpYPUHkNoz0Ba3@movie-mbti.k3yt3.mongodb.net/movies_list?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
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



// ให้ Express ให้บริการไฟล์ static จากโฟลเดอร์ public
app.use(express.static(path.join(__dirname, 'public')));

// เส้นทาง fallback สำหรับส่งไฟล์ movie-details.html หากไม่มี API ที่ตรงกับ URL
app.get('/movie-details.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'movie-details.html'));
});

const watchlistSchema = new mongoose.Schema({
    username: { type: String, required: true },
    listName: { type: String, default: 'Favorite' }, // ตั้งชื่อ Watchlist
    movies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'movies_list' }]
});

app.post('/watchlist/init', async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ message: "Username is required!" });
    }

    try {
        let favoriteList = await Watchlist.findOne({ username, listName: 'Favorite' });
        if (!favoriteList) {
            favoriteList = new Watchlist({ username, listName: 'Favorite', movies: [] });
            await favoriteList.save();
        }

        res.status(201).json({ message: "Default Favorite Watchlist created or already exists!" });
    } catch (error) {
        console.error("Error initializing Favorite Watchlist:", error);
        res.status(500).json({ message: "Failed to initialize Favorite Watchlist." });
    }
});

app.get('/watchlist/all/:username', async (req, res) => {
    const { username } = req.params;

    try {
        const watchlists = await Watchlist.find({ username }); // ดึงข้อมูลจากฐานข้อมูล
        res.status(200).json(watchlists); // ส่งข้อมูล JSON กลับไป
    } catch (error) {
        console.error("Error fetching Watchlists:", error);
        res.status(500).json({ message: "Failed to fetch Watchlists." });
    }
});


const Watchlist = mongoose.model('Watchlist', watchlistSchema);

// API สำหรับเพิ่มหนังใน Watchlist "Favorite"
app.post('/watchlist/add', async (req, res) => {
    const { username, movieId } = req.body;

    if (!username || !movieId) {
        return res.status(400).json({ message: 'Username and Movie ID are required' });
    }

    try {
        let favoriteList = await Watchlist.findOne({ username, listName: 'Favorite' });
        if (!favoriteList) {
            favoriteList = new Watchlist({ username, listName: 'Favorite', movies: [] });
            await favoriteList.save();
        }

        if (favoriteList.movies.includes(movieId)) {
            return res.status(400).json({ message: 'Movie already in Favorite Watchlist' });
        }

        favoriteList.movies.push(movieId);
        await favoriteList.save();

        res.status(201).json({ message: 'Movie added to Favorite Watchlist' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add movie to Watchlist' });
    }
});

app.post('/watchlist/delete-movie', async (req, res) => {
    const { username, listName, movieId } = req.body;

    try {
        const watchlist = await Watchlist.findOne({ username, listName });
        if (!watchlist) {
            return res.status(404).json({ message: "Watchlist not found" });
        }

        // ลบหนังที่มี movieId ตรงกันออกจาก watchlist.movies
        watchlist.movies = watchlist.movies.filter(
            (movie) => movie.toString() !== movieId
        );

        await watchlist.save(); // บันทึกการเปลี่ยนแปลง
        res.json({ message: "Movie deleted successfully" });
    } catch (error) {
        console.error("Error deleting movie:", error);
        res.status(500).json({ message: "An error occurred while deleting the movie" });
    }
});



app.get('/watchlist/:username', async (req, res) => {
    const { username } = req.params;

    try {
        const watchlist = await Watchlist.find({ username }).populate({
            path: 'movieId',
            model: 'Movie', // ใช้ model ของ movies
        });
        res.status(200).json(watchlist);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch Watchlist' });
    }
});

app.get('/watchlist/:username/:listName', async (req, res) => {
    const { username, listName } = req.params;

    try {
        const watchlist = await Watchlist.findOne({ username, listName }).populate({
            path: 'movies',
            model: 'movies_list',
        });

        if (!watchlist) {
            return res.status(404).json({ message: `Watchlist "${listName}" not found.` });
        }

        res.status(200).json(watchlist.movies);
    } catch (error) {
        console.error("Error fetching Watchlist:", error);
        res.status(500).json({ message: 'Failed to fetch Watchlist.' });
    }
});

app.post('/watchlist/create', async (req, res) => {
    const { username, listName } = req.body;

    if (!username || !listName) {
        return res.status(400).json({ message: "Username and list name are required!" });
    }

    try {
        const existingList = await Watchlist.findOne({ username, listName });
        if (existingList) {
            return res.status(400).json({ message: "This Watchlist already exists." });
        }

        const newList = new Watchlist({ username, listName, movies: [] });
        await newList.save();

        res.status(201).json({ message: "Watchlist created successfully!", list: newList });
    } catch (error) {
        console.error("Error creating Watchlist:", error);
        res.status(500).json({ message: "Failed to create Watchlist." });
    }
});


app.delete('/watchlist/delete/:listName', async (req, res) => {
    const { username } = req.body; // รับ username
    const { listName } = req.params;

    try {
        await Watchlist.deleteOne({ username, listName });
        res.status(200).send({ message: "Watchlist deleted successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Error deleting Watchlist." });
    }
});

// สร้าง Schema สำหรับเก็บคะแนน
const movieScoreSchema = new mongoose.Schema({
    movieId: { type: mongoose.Schema.Types.ObjectId, required: true },
    movieName: { type: String, required: true },
    username: { type: String, required: true },
    score: { type: Number, required: true, min: 1, max: 10 }
    
});

// สร้าง Model
const MovieScore = mongoose.model('movies_scores', movieScoreSchema);

// API Endpoint เพื่อให้ผู้ใช้ให้คะแนนหนัง
app.post('/movies_list/movies/:movieId/rate', async (req, res) => {
    const { movieId } = req.params;
    const { username, score, movieName } = req.body;

    console.log('Received Data:', { username, score, movieName }); // Debugging

    if (!username || !score || !movieName) {
        return res.status(400).json({ message: 'Username, score, and movieName are required.' });
    }

    try {
        const movieScore = await MovieScore.findOneAndUpdate(
            { movieId: new mongoose.Types.ObjectId(movieId), username },
            { score, movieName }, // รวม movieName ที่นี่
            { new: true, upsert: true }
        );

        console.log('Saved to DB:', movieScore); // Debugging
        res.status(200).json({ message: 'Score submitted successfully', data: movieScore });
    } catch (error) {
        console.error('Error while saving:', error);
        res.status(500).json({ message: 'Failed to submit score' });
    }
});

app.get('/api/search', async (req, res) => {
    const { category, query } = req.query;

    if (!category || !query) {
        return res.status(400).json({ message: 'Category and query are required' });
    }

    try {
        let filter = {};
        if (category === 'title') {
            filter.Series_Title = { $regex: query, $options: 'i' };
        } else if (category === 'director') {
            filter.Director = { $regex: query, $options: 'i' };
        } else if (category === 'actor') {
            filter.$or = [
                { Star1: { $regex: query, $options: 'i' } },
                { Star2: { $regex: query, $options: 'i' } },
                { Star3: { $regex: query, $options: 'i' } },
                { Star4: { $regex: query, $options: 'i' } },
            ];
        }

        const movies = await Movie.find(filter);
        res.json(movies);
    } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// เสิร์ฟไฟล์ static ทั้งหมดจากโฟลเดอร์ page
app.use(express.static(path.join(__dirname, 'page')));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});