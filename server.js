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

app.get('/movies', async (req, res) => {
    try {
        const searchQuery = req.query.search || ''; // รับค่าคำค้นหาจาก query string
        const category = req.query.category || 'title'; // รับ category จาก query string

        // สร้างเงื่อนไขการค้นหาจากหลายฟิลด์
        let searchQueryCondition = {};
        if (searchQuery) {
            if (category === 'title') {
                searchQueryCondition = { Series_Title: { $regex: searchQuery, $options: 'i' } };
            } else if (category === 'genre') {
                searchQueryCondition = { Genre: { $regex: searchQuery, $options: 'i' } };
            } else if (category === 'actor') {
                searchQueryCondition = {
                    $or: [
                        { Star1: { $regex: searchQuery, $options: 'i' } },
                        { Star2: { $regex: searchQuery, $options: 'i' } },
                        { Star3: { $regex: searchQuery, $options: 'i' } },
                        { Star4: { $regex: searchQuery, $options: 'i' } }
                    ]
                };
            }
        }

        // ค้นหาจาก MongoDB ด้วยเงื่อนไขที่กำหนด
        const movies = await Movie.find(searchQueryCondition);

        // ส่งผลลัพธ์กลับ
        res.json(movies);
    } catch (error) {
        console.error('Error searching movies:', error);
        res.status(500).json({ message: 'Failed to search movies' });
    }
});

// Serve static files if needed
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client/build')));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

// API to fetch movies with pagination
app.get('/movies_list/movies', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = parseInt(req.query.limit) || 10; // Default to 10 movies per page
        const skip = (page - 1) * limit;

        const movies = await Movie.find()
            .skip(skip)
            .limit(limit)
            .exec();

        if (movies.length === 0) {
            return res.status(404).json({ message: 'No movies found' });
        }

        res.json(movies);
    } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).json({ message: 'Server error' });
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
    const { username, listName, movieId } = req.body;

    console.log('API ได้รับพารามิเตอร์:', { username, listName, movieId });

    // ตรวจสอบว่ามีพารามิเตอร์ที่จำเป็นครบถ้วนหรือไม่
    if (!username || !listName || !movieId) {
        return res.status(400).json({ message: 'กรุณาระบุชื่อผู้ใช้, ชื่อ Watchlist และ Movie ID!' });
    }

    try {
        // ตรวจสอบว่า Watchlist มีอยู่แล้วหรือไม่
        let watchlist = await Watchlist.findOne({ username, listName });

        // ถ้าไม่มี Watchlist ให้สร้างใหม่
        if (!watchlist) {
            console.log(`ไม่พบ Watchlist "${listName}". กำลังสร้าง Watchlist ใหม่...`);
            watchlist = new Watchlist({ username, listName, movies: [] });
            await watchlist.save();
        }

        // ตรวจสอบว่าหนังอยู่ใน Watchlist แล้วหรือไม่
        if (watchlist.movies.includes(movieId)) {
            return res.status(400).json({ message: 'หนังเรื่องนี้มีอยู่ใน Watchlist แล้ว!' });
        }

        // เพิ่มหนังใน Watchlist
        watchlist.movies.push(movieId);
        await watchlist.save();

        res.status(201).json({ message: `เพิ่มหนังใน Watchlist "${listName}" สำเร็จ!` });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการเพิ่มหนังใน Watchlist:', error);
        res.status(500).json({ message: 'ไม่สามารถเพิ่มหนังใน Watchlist ได้.' });
    }
});

// API สำหรับเพิ่มหนังใน Watchlist "Favorite" จากหน้า movie-detail
app.post('/movie-detail/add-to-favorite', async (req, res) => {
    const { username, movieId } = req.body;

    if (!username || !movieId) {
        return res.status(400).json({ message: 'Username and movie ID are required!' });
    }

    try {
        const watchlist = await Watchlist.findOne({ username, listName: 'Favorite' });
        if (!watchlist) {
            return res.status(404).json({ message: 'Favorite Watchlist not found.' });
        }

        if (watchlist.movies.includes(movieId)) {
            return res.status(400).json({ message: 'Movie already exists in Favorite Watchlist.' });
        }

        watchlist.movies.push(movieId);
        await watchlist.save();

        res.status(201).json({ message: 'Movie successfully added to Favorite Watchlist.' });
    } catch (error) {
        console.error("Error adding movie to Favorite Watchlist:", error);
        res.status(500).json({ message: 'Failed to add movie to Favorite Watchlist.' });
    }
});

app.post('/watchlist/delete-movie', async (req, res) => {
    const { username, listName, movieId } = req.body;

    console.log("Received data:", { username, listName, movieId });

    try {
        const watchlist = await Watchlist.findOne({ username, listName });
        if (!watchlist) {
            return res.status(404).json({ message: "Watchlist ไม่พบ" });
        }

        // ลบหนังจาก Watchlist
        watchlist.movies = watchlist.movies.filter(
            (movie) => movie.toString() !== movieId
        );

        await watchlist.save();
        res.json({ message: "ลบหนังสำเร็จ" });
    } catch (error) {
        console.error("Error deleting movie:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดระหว่างการลบหนัง" });
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


app.get('/movies_list/all', async (req, res) => {
    try {
        const movies = await Movie.find();  // ดึงข้อมูลทั้งหมดจากฐานข้อมูล
        res.status(200).json(movies);  // ส่งข้อมูลหนังทั้งหมด
    } catch (error) {
        console.error("Error fetching all movies:", error);
        res.status(500).json({ message: 'Failed to fetch movies.' });
    }
});

// API สำหรับเพิ่มหนัง
app.post('/api/add-movie', async (req, res) => {
    try {
        const movieData = req.body;

        if (!movieData || !movieData.seriesTitle || !movieData.posterLink) {
            return res.status(400).json({ message: "Incomplete movie data!" });
        }

        const newMovie = new Movie({
            Poster_Link: movieData.posterLink,
            Series_Title: movieData.seriesTitle,
            Released_Year: movieData.releasedYear,
            Certificate: movieData.certificate,
            Runtime: movieData.runtime,
            Genre: movieData.genre,
            IMDB_Rating: movieData.imdbRating,
            Overview: movieData.overview,
            Meta_score: movieData.metaScore,
            Director: movieData.director,
            Star1: movieData.star1,
            Star2: movieData.star2,
            Star3: movieData.star3,
            Star4: movieData.star4,
            Gross: movieData.gross,
            link_movies: movieData.linkMovies
        });

        await newMovie.save();  // บันทึกหนังใหม่ลงในฐานข้อมูล

        res.status(201).json({ message: "Movie added successfully!" });
    } catch (error) {
        console.error("Error adding movie:", error);
        res.status(500).json({ message: "Failed to add movie" });
    }
});




// API สำหรับลบหนัง
app.delete('/api/delete-movie/:movieId', async (req, res) => {
    try {
        const { movieId } = req.params;

        const movie = await Movie.findByIdAndDelete(movieId);
        if (!movie) {
            return res.status(404).json({ message: "Movie not found!" });
        }

        res.status(200).json({ message: "Movie deleted successfully!" });
    } catch (error) {
        console.error("Error deleting movie:", error);
        res.status(500).json({ message: "Failed to delete movie" });
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

app.delete('/watchlist/delete/:listName', async (req, res) => {
    const username = req.body.username || "default_user";
    const { listName } = req.params;

    if (listName === 'Favorite') {
        return res.status(403).json({ message: 'ไม่สามารถลบ Favorite ได้' });
    }

    try {
        const result = await Watchlist.deleteOne({ username, listName }); // แก้ WatchlistModel เป็น Watchlist
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Watchlist ไม่พบ' });
        }
        res.status(200).json({ message: `ลบ Watchlist "${listName}" สำเร็จ` });
    } catch (error) {
        console.error("Error deleting Watchlist:", error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบ Watchlist' });
    }
});


app.get('/api/search', async (req, res) => {
    const { category, query } = req.query;

    if (!query) {
        return res.status(400).send({ message: 'Query is required' });
    }

    try {
        let searchField;
        if (category === 'title') {
            searchField = 'Series_Title';
        } else if (category === 'director') {
            searchField = 'Director';
        } else if (category === 'actor') {
            searchField = {
                $or: [
                    { Star1: { $regex: query, $options: 'i' } },
                    { Star2: { $regex: query, $options: 'i' } },
                    { Star3: { $regex: query, $options: 'i' } },
                    { Star4: { $regex: query, $options: 'i' } }
                ]
            };
        } else if (category === 'genre') {
            searchField = 'Genre'; // ค้นหาภาพยนตร์ตาม genre
        } else {
            return res.status(400).send({ message: 'Invalid search category' });
        }

        // ค้นหาข้อมูลในฐานข้อมูล
        const searchQuery = category === 'actor' 
            ? searchField 
            : { [searchField]: { $regex: query, $options: 'i' } };

        // ค้นหาในฐานข้อมูล
        const movies = await Movie.find(searchQuery);

        res.status(200).json(movies);
    } catch (error) {
        console.error('Error searching movies:', error);
        res.status(500).json({ message: 'Failed to search movies' });
    }
});






app.get('/api/predict', async (req, res) => {
    const { category, query } = req.query;

    if (!query || query.length < 3) {
        return res.status(400).json({ message: 'Query must be at least 3 characters long' });
    }

    try {
        const regex = new RegExp(query, 'i');
        const movies = await Movie.find({ [category]: regex }).limit(10).select(category);

        const suggestions = movies.map((movie) => movie[category]);
        res.json(suggestions);
    } catch (error) {
        console.error('Error fetching predictions:', error);
        res.status(500).json({ message: 'Error fetching suggestions' });
    }
});

app.get('/api/debug/movies', async (req, res) => {
    try {
        const movies = await Movie.find();
        res.status(200).json(movies);
    } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).json({ message: 'Failed to fetch movies' });
    }
});

app.put('/api/update-movie/:movieId', async (req, res) => {
    const { movieId } = req.params;
    const movieData = req.body;

    try {
        const movie = await Movie.findById(movieId);
        if (!movie) {
            return res.status(404).json({ message: "Movie not found!" });
        }

        movie.Poster_Link = movieData.posterLink;
        movie.Series_Title = movieData.seriesTitle;
        movie.Released_Year = movieData.releasedYear;
        movie.IMDB_Rating = movieData.imdbRating;
        movie.Genre = movieData.genre;
        movie.Overview = movieData.overview;
        movie.Meta_score = movieData.metaScore;
        movie.Director = movieData.director;
        movie.Star1 = movieData.star1;
        movie.Star2 = movieData.star2;
        movie.Star3 = movieData.star3;
        movie.Star4 = movieData.star4;
        movie.Gross = movieData.gross;
        movie.link_movies = movieData.linkMovies;

        await movie.save();

        res.status(200).json({ message: "Movie updated successfully!" });
    } catch (error) {
        console.error('Error updating movie:', error);
        res.status(500).json({ message: 'Failed to update movie' });
    }
});

// API สำหรับลบหนัง
app.delete('/api/delete-movie/:movieId', async (req, res) => {
    try {
        const { movieId } = req.params;

        const movie = await Movie.findByIdAndDelete(movieId);
        if (!movie) {
            return res.status(404).json({ message: "Movie not found!" });
        }

        res.status(200).json({ message: "Movie deleted successfully!" });
    } catch (error) {
        console.error("Error deleting movie:", error);
        res.status(500).json({ message: "Failed to delete movie" });
    }
});

// กรณีไม่มี API ที่ตรง ให้เสิร์ฟไฟล์ movie-detail.html
app.get('/page/movie-details/movie-details.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'page', 'movie-details', 'movie-detail.html'));
});
app.use(express.static(path.join(__dirname, 'public')));

// กรณีไม่มี API ที่ตรง ให้ส่งไฟล์ search-results.html
app.get('/page/main_page/search-results.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'page', 'main_page', 'search-results.html'));
});
// เสิร์ฟไฟล์ static ทั้งหมดจากโฟลเดอร์ page
app.use(express.static(path.join(__dirname, 'page')));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});