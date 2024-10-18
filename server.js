const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection (replace <username>, <password>, <cluster-url>, and <dbname>)
mongoose.connect('mongodb+srv://bankweeprt:ohMpYPUHkNoz0Ba3@movie-mbti.k3yt3.mongodb.net/movies_list?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.log('MongoDB connection error:', err));

// Define Movie Schema and Model
const movieSchema = new mongoose.Schema({
    Poster_Link: String,
    Series_Title: String,
    Released_Year: String,
    Certificate: String,
    Runtime: String,
    Genre: String,
    IMDB_Rating: String,
    Overview: String,
    Director: String,
    Star1: String,
    Star2: String,
    Star3: String,
    Star4: String,
    No_of_Votes: String,
    Gross: String
});

const Movie = mongoose.model('Movie', movieSchema);

// API to fetch all movies
app.get('/api/movies', async (req, res) => {
    try {
        const movies = await Movie.find(); // Fetch all movies from the 'movies' collection
        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching movies' });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));