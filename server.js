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

// MongoDB connection
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
    Gross: String
});

const Movie = mongoose.model('movies_list', movieSchema, 'movies');

// API to fetch a movie by movieId
app.get('/movies_list/movies/:movieId', async (req, res) => {
    try {
        const movieId = req.params.movieId;
        console.log(`Fetching movie with movieId: ${movieId}`);

        const movie = await Movie.findOne({ _id: new ObjectId(movieId) });
        
        if (!movie) {
            console.log("Movie not found");
            return res.status(404).json({ message: 'Movie not found' });
        }
        console.log("Fetched movie data:", movie);
        res.json(movie);
    } catch (error) {
        console.error("Error fetching movie data:", error);
        res.status(500).json({ message: 'Error fetching movie details' });
    }
});

// Define MBTI Schema and Model
const mbtiSchema = new mongoose.Schema({
    mbti_type: String,
    createdAt: { type: Date, default: Date.now }
});

const MBTI = mongoose.model('mbti_list', mbtiSchema, 'mbti_list');

// API Endpoint เพื่อเพิ่มข้อมูล MBTI
app.post('/api/saveMBTI', async (req, res) => {
    try {
        const { mbtiType } = req.body;

        // สร้างเอกสารใหม่ใน Collection mbti_list
        const newMBTI = new MBTI({ mbti_type: mbtiType });

        const result = await newMBTI.save();
        console.log(`New MBTI document inserted with _id: ${result._id}`);
        res.status(201).json({ message: 'MBTI added successfully', id: result._id });
    } catch (error) {
        console.error("Error inserting MBTI:", error);
        res.status(500).json({ message: 'Failed to add MBTI' });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
