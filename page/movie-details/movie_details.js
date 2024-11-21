// movie_details
document.addEventListener('DOMContentLoaded', async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('movieId');

    if (!movieId) {
        alert("Movie not found.");
        console.error("Movie ID is missing in the URL");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5001/movies_list/movies/${movieId}`);
        if (!response.ok) throw new Error('Movie not found');
        const movie = await response.json();

        console.log("Fetched movie details:", movie);

        // ตั้งค่าข้อมูลทั่วไป
        document.getElementById('movie-name').textContent = movie.Series_Title;
        document.getElementById('movie-info').textContent = `${movie.Released_Year} · ${movie.Certificate} · ${movie.Runtime}`;
        document.getElementById('movie-rating').textContent = `⭐ IMDB Rating ${movie.IMDB_Rating}/10`;
        document.getElementById('movie-poster').src = movie.Poster_Link;
        document.getElementById('movie-description').textContent = movie.Overview;
        document.getElementById('movie-director').textContent = `Director: ${movie.Director}`;
        document.getElementById('movie-actors').textContent = `Stars: ${movie.Star1}, ${movie.Star2}, ${movie.Star3}, ${movie.Star4}`;
        document.getElementById('meta-score').textContent = `Metascore: ${movie.Meta_score}`;
        document.getElementById('gross-amount').textContent = movie.Gross;
        document.getElementById('genre').textContent = movie.Genre;
        
        // แสดง Video Trailer
        if (movie.link_movies) {
            const videoEmbed = `
                <iframe 
                    src="https://www.youtube.com/embed/${movie.link_movies}" 
                    title="YouTube video player" 
                    frameborder="0" 
                    allowfullscreen>
                </iframe>`;
            document.getElementById('movie-video').innerHTML = videoEmbed;
        } else {
            document.getElementById('movie-video').textContent = "No trailer available";
        }
    } catch (error) {
        console.error("Error fetching movie data:", error);
        alert("Failed to load movie details.");
    }
});

document.getElementById('add-to-watchlist').addEventListener('click', async function () {
    const username = localStorage.getItem('username'); // ใช้ username ที่ล็อกอิน
    if (!username) {
        alert("Please login first!");
        return;
    }

    const movieId = new URLSearchParams(window.location.search).get('movieId');
    if (!movieId) {
        alert("Movie ID is missing.");
        return;
    }

    try {
        const response = await fetch('http://localhost:5001/watchlist/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, movieId }),
        });

        const result = await response.json();
        if (response.ok) {
            alert("Added to Watchlist!");
            location.reload(); // รีโหลดหน้าหลังเพิ่ม
        } else {
            alert(result.message || "Failed to add to Watchlist.");
        }
    } catch (error) {
        console.error("Error adding to Watchlist:", error);
    }
});
