document.addEventListener('DOMContentLoaded', async function() { 
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('movieId');

    if (!movieId) {
        alert("Movie not found.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5001/movies_list/movies/${movieId}`);
        if (!response.ok) throw new Error('Movie not found');
        
        const movie = await response.json();

        // อัพเดตข้อมูลใน HTML
        document.getElementById('movie-name').textContent = movie.Series_Title;
        document.getElementById('movie-info').textContent = `${movie.Released_Year} | ${movie.Runtime}`;
        document.getElementById('movie-rating').textContent = `⭐ IMDB Rating ${movie.IMDB_Rating}/10`;
        document.getElementById('meta-score').textContent = `Metascore: ${movie.Meta_score}`;
        document.getElementById('movie-poster').src = movie.Poster_Link;
        document.getElementById('movie-description').textContent = movie.Overview;
        document.getElementById('movie-director').textContent = movie.Director;
        document.getElementById('movie-actors').textContent = [movie.Star1, movie.Star2, movie.Star3, movie.Star4].join(', ');
        document.getElementById("movie-gross").textContent = movie.Gross;

        // Event listener for "See more Pictures" button
        document.getElementById('see-more-button').addEventListener('click', async () => {
            const popupOverlay = document.getElementById('popup-overlay');
            const seeMorePosters = document.getElementById('see-more-posters');

            // Fetch additional posters from the database
            const posterResponse = await fetch(`http://localhost:5001/movies_list/movies/${movieId}/posters`);
            const posters = await posterResponse.json();

            // Clear previous content and add new posters
            seeMorePosters.innerHTML = '';
            posters.forEach(poster => {
                const img = document.createElement('img');
                img.src = poster.url;
                img.classList.add('popup-image');
                seeMorePosters.appendChild(img);
            });

            // Show the popup
            popupOverlay.style.display = 'flex';
        });

        // Close popup button
        document.getElementById('close-popup').addEventListener('click', () => {
            document.getElementById('popup-overlay').style.display = 'none';
        });

    } catch (error) {
        console.error("Error fetching movie data:", error);
        alert("Failed to load movie details.");
    }
});
