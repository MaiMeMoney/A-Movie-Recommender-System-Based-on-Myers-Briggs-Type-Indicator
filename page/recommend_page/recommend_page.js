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
    
                renderMovies(Array.from(uniqueMovies.values()));
            } else {
                console.error("Failed to fetch recommendations");
            }
        } catch (error) {
            console.error("Error fetching recommendations:", error);
        }
    }
    


    function renderMovies(movies) {
        movieGrid.innerHTML = ""; // Clear existing movies
        movies.forEach(movie => {
            const posterUrl = movie.Poster_Link && movie.Poster_Link.startsWith("http")
                ? movie.Poster_Link
                : "/path/to/placeholder.png"; // ใช้ placeholder หากไม่มีโปสเตอร์
    
            const movieItem = document.createElement("div");
            movieItem.classList.add("movie-item");
    
            movieItem.innerHTML = `
                <img src="${posterUrl}" alt="${movie.movieName}" style="width: 100%; height: 300px; object-fit: cover; border-radius: 10px;">
                <div class="movie-info">
                    <h3>${movie.movieName}</h3>
                </div>
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
