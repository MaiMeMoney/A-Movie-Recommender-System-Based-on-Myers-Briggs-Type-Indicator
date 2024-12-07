document.addEventListener("DOMContentLoaded", function () {
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("token");
    const mbtiElement = document.querySelector(".mbti-type");
    const movieGrid = document.querySelector(".movie-grid");

    if (!username || !token) {
        alert("You need to log in first!");
        window.location.href = "/page/login_page/index.html";
        return;
    }
    // Load MBTI Type
    async function loadUserMBTI() {
        try {
            const response = await fetch(`http://localhost:5001/api/user-mbti/${username}`);
            if (response.ok) {
                const { mbti } = await response.json();
                mbtiElement.textContent = mbti || "Unknown";
            } else {
                mbtiElement.textContent = "Error fetching MBTI";
            }
        } catch (error) {
            console.error("Error fetching MBTI:", error);
            mbtiElement.textContent = "Error";
        }
    }

    // Fetch Recommendations
    async function fetchRecommendations() {
        try {
            const response = await fetch("http://localhost:5001/recommend", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username })
            });
    
            if (response.ok) {
                const data = await response.json();
                console.log("Recommendations Data:", data); // ตรวจสอบข้อมูลที่ได้รับ
                const uniqueMovies = new Map();
    
                // กรองหนังซ้ำ
                data.recommendations.forEach(movie => {
                    if (!uniqueMovies.has(movie.movieName)) {
                        uniqueMovies.set(movie.movieName, movie);
                    }
                });
    
                const moviesArray = Array.from(uniqueMovies.values());
            
            // บันทึกข้อมูลใน localStorage
            localStorage.setItem("recommendedMovies", JSON.stringify(moviesArray));

            renderMovies(Array.from(uniqueMovies.values()));

            } else {
                console.error("Failed to fetch recommendations");
            }
        } catch (error) {
            console.error("Error fetching recommendations:", error);
        }
    }
    
    // Render Movies
function renderMovies(movies) {
    const movieGrid = document.querySelector('.movie-grid');
    movieGrid.innerHTML = ''; // ล้างข้อมูลเก่า

    movies.forEach((movie) => {
        const movieItem = document.createElement('div');
        movieItem.classList.add('movie-item');

        // HTML ของแต่ละหนัง พร้อมลิงก์ไปหน้า movie_details
        movieItem.innerHTML = `
            <a href="/page/movie-details/movie-details.html?movieId=${movie.movieId}" style="text-decoration: none; color: inherit;">
                <img src="${movie.Poster_Link || 'placeholder.png'}" alt="Movie Poster" style="width: 100%; height: auto; object-fit: cover; border-radius: 10px;">
            </a>
        `;

        movieGrid.appendChild(movieItem);
    });
}


    // Add Event Listeners
    document.querySelector(".recommend-me").addEventListener("click", fetchRecommendations);
    document.querySelector(".change-mbti").addEventListener("click", function () {
        window.location.href = "/page/mbti_selection/mbti_selection.html";
    });

    loadUserMBTI();
});
