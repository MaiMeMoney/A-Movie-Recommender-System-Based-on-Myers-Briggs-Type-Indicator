document.addEventListener('DOMContentLoaded', async function() { 
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('movieId');

    if (!movieId) {
        alert("Movie not found.");
        return;
    }

    try {
        console.log(`Fetching movie details from http://localhost:5000/movies_list/movies/${movieId}`); // ตรวจสอบ URL
        const response = await fetch(`http://localhost:5000/movies_list/movies/${movieId}`);
        if (!response.ok) throw new Error('Movie not found');
        
        const movie = await response.json();
        console.log("Fetched movie data:", movie); // แสดงข้อมูลที่ได้จาก API
        
        // อัพเดตข้อมูลใน HTML
        document.getElementById('movie-name').textContent = movie.Series_Title;
        document.getElementById('movie-info').textContent = `${movie.Released_Year} | ${movie.Runtime}`;
        document.getElementById('movie-rating').textContent = `⭐ IMDB Rating ${movie.IMDB_Rating}/10`;
        document.getElementById('meta-score').textContent = `Metascore: ${movie.Meta_score}`;
        document.getElementById('movie-poster').src = movie.Poster_Link;
        document.getElementById('movie-description').textContent = movie.Overview;
        document.getElementById('movie-director').textContent = movie.Director;
        document.getElementById('movie-actors').textContent = [movie.Star1, movie.Star2, movie.Star3, movie.Star4].join(', ');
        document.getElementById("movie-gross").textContent = movie.Gross; // Replace with actual data

    } catch (error) {
        console.error("Error fetching movie data:", error);
        alert("Failed to load movie details.");
    }
});
