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
        await fetch(`http://localhost:5001/movies_list/movies/${movieId}/view`, { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('View recorded successfully for movie:', movieId);
    } catch (error) {
        console.error('Error recording view:', error);
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

async function logMovieView(movieId) {
    try {
        const response = await fetch('http://localhost:6001/api/movie-view', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ movieId })
        });
        
        if (!response.ok) {
            throw new Error('Failed to log movie view');
        }
    } catch (error) {
        console.error('Error logging movie view:', error);
    }
}

function showToast(message, type) {
    const toast = document.getElementById('toast');
    toast.textContent = message;

    // กำหนดสีพื้นหลังตามประเภท (success หรือ error)
    if (type === "success") {
        toast.style.backgroundColor = "green";
    } else if (type === "error") {
        toast.style.backgroundColor = "red";
    } else {
        toast.style.backgroundColor = "#333"; // Default สีเทา
    }

    toast.className = "toast show";

    // ซ่อน Toast หลังจาก 3 วินาที
    setTimeout(() => {
        toast.className = toast.className.replace("show", "");
    }, 3000);
}

function getMovieIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('movieid');
}

// โหลดข้อมูลหนังจาก Backend
function loadMovieDetails(movieId) {
    fetch(`http://127.0.0.1:5001/movies_list/movies/${movieId}`)
        .then(response => response.json())
        .then(movie => {
            if (!movie) {
                showToast("ไม่พบข้อมูลหนัง!", "error");
                return;
            }

            // อัปเดตข้อมูลหนังในหน้า
            document.getElementById('movie-name').textContent = movie.Series_Title || "Unknown Title";
            document.getElementById('movie-info').textContent = `${movie.Release_Year || "N/A"} · ${movie.Certificate || "N/A"} · ${movie.Runtime || "N/A"}`;
            document.getElementById('movie-rating').textContent = `⭐ IMDB Rating ${movie.IMDB_Rating || "N/A"}/10`;
            document.getElementById('movie-description').textContent = movie.Overview || "No description available.";
            document.getElementById('movie-director').textContent = `Director: ${movie.Director || "N/A"}`;
            document.getElementById('movie-actors').textContent = `Stars: ${movie.Star1 || ""}, ${movie.Star2 || ""}, ${movie.Star3 || ""}, ${movie.Star4 || ""}`;
            document.getElementById('movie-genre').textContent = movie.Genre || "N/A";
            document.getElementById('movie-gross').textContent = `$${movie.Gross || "N/A"}`;
            document.getElementById('meta-score').textContent = `Metascore: ${movie.Meta_Score || "N/A"}`;
            document.getElementById('movie-poster').src = movie.Poster_Link || "placeholder.jpg";
        })
        .catch(error => {
            console.error("Error loading movie details:", error);
            showToast("เกิดข้อผิดพลาดในการโหลดข้อมูลหนัง", "error");
        });
}

async function addToWatchlist() {
    const username = localStorage.getItem("username"); // ดึง username จาก LocalStorage
    const movieId = new URLSearchParams(window.location.search).get("movieId"); // ดึง movieId จาก URL
    const listName = "Favorite"; // Watchlist เป้าหมาย

    // ตรวจสอบว่าพารามิเตอร์ครบถ้วนหรือไม่
    if (!username || !movieId) {
        showToast("กรุณาระบุ Username และ Movie ID!", "error");
        console.error("พารามิเตอร์หาย:", { username, movieId });
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:5001/watchlist/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, listName, movieId }),
        });

        const result = await response.json();
        if (response.ok) {
            showToast(result.message, "success"); // แจ้งเตือนเมื่อสำเร็จ
            console.log(`เพิ่มหนังใน Watchlist "${listName}" สำเร็จ:`, result);
        } else {
            showToast(result.message || "ไม่สามารถเพิ่มหนังได้!", "error");
            console.error("ข้อผิดพลาดจาก API:", result);
        }
    } catch (error) {
        console.error("เกิดข้อผิดพลาดระหว่างเรียก API:", error);
        showToast("เกิดข้อผิดพลาดขณะเพิ่มหนัง!", "error");
    }
}


function getMovieIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('movieid'); // คืนค่าค่า movieid จาก URL
}

document.getElementById('add-to-watchlist').addEventListener('click', async () => {
    const username = localStorage.getItem('username') || "default_user";
    const movieId = getMovieIdFromURL();

    if (!username || !movieId) {
        showToast("Missing username or movie ID!", "error");
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:5001/watchlist/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, movieId }),
        });

        const result = await response.json();
        if (response.ok) {
            showToast(result.message, "success");
        } else {
            showToast(result.message || "Failed to add movie.", "error");
        }
    } catch (error) {
        console.error("Error adding movie to watchlist:", error);
        showToast("An error occurred while adding movie.", "error");
    }
});



document.addEventListener('DOMContentLoaded', function () {
    const openPopupBtn = document.getElementById('open-rating-popup');
    const ratingPopup = document.getElementById('rating-popup');
    const closePopupBtn = document.getElementById('close-rating-popup');
    const ratingStarsContainer = document.getElementById('popup-rating-stars');
    const toast = document.getElementById('toast');
    let selectedRating = 0;

    // เปิดป๊อปอัป
    openPopupBtn.addEventListener('click', function () {
        console.log("Open popup button clicked!");
        ratingPopup.classList.add('fade-in');
        ratingPopup.classList.remove('hidden');
    });

    // ปิดป๊อปอัป
    closePopupBtn.addEventListener('click', function () {
        console.log("Close popup button clicked!");
        closePopupWithAnimation();
    });

    // ฟังก์ชันสำหรับปิดป๊อปอัป
    function closePopupWithAnimation() {
        ratingPopup.classList.add('fade-out');
        setTimeout(() => {
            ratingPopup.classList.add('hidden');
            ratingPopup.classList.remove('fade-in', 'fade-out');
        }, 500);
    }

    // เพิ่มฟังก์ชันให้กับการกดให้คะแนนดาว
    const stars = Array.from({ length: 10 }, (_, index) => {
        const star = document.createElement('span');
        star.textContent = '★';
        star.dataset.value = index + 1;
        star.classList.add('star');
        star.setAttribute('title', `Rating: ${index + 1} star${index > 0 ? 's' : ''}`); // เพิ่มข้อความ tooltip

        // เพิ่มเหตุการณ์ mouseover เพื่อแสดงจำนวนดาว
        star.addEventListener('mouseover', function () {
            console.log(`Hovering over: ${star.dataset.value} star(s)`); // Debugging
        });

        star.addEventListener('click', function () {
            selectedRating = parseInt(star.dataset.value);
            // แสดงการเลือกดาว
            stars.forEach((s, idx) => {
                s.classList.toggle('selected', idx < selectedRating);
            });
            console.log(`Selected Rating: ${selectedRating}`);
            submitRating(selectedRating);
        });
        return star;
    });

    stars.forEach(star => ratingStarsContainer.appendChild(star));

    // ส่งคะแนนและปิดป๊อปอัปพร้อมแจ้งเตือน
    async function submitRating(rating) {
        const username = localStorage.getItem('username'); // ใช้ username จาก localStorage
        const movieId = new URLSearchParams(window.location.search).get('movieId');
        const movieNameElement = document.getElementById('movie-name');
        const movieName = movieNameElement ? movieNameElement.textContent : "Unknown Movie";

        console.log('Sending Data:', { username, score: rating, movieName });

        if (!username || !movieId || !movieName) {
            showToast('Please login, select a movie, and try again.', 'error');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5001/movies_list/movies/${movieId}/rate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, score: rating, movieName }),
            });

            const result = await response.json();

            if (response.ok) {
                showToast(`You have rated ${rating} star${rating > 1 ? 's' : ''}!`, 'success');
                closePopupWithAnimation(); // ปิดป๊อปอัปหลังให้คะแนนสำเร็จ
            } else {
                console.error('API Error:', result);
                showToast(result.message || 'Failed to submit rating.', 'error');
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
            showToast('An error occurred while submitting the rating.', 'error');
        }
    }


    // ฟังก์ชันสำหรับแสดง Toast แจ้งเตือนที่มุมขวาบนใต้ navbar
    function showToast(message, type) {
        toast.textContent = message;
        toast.className = "toast show"; // แสดง Toast

        if (type === "success") {
            toast.style.backgroundColor = "green";
        } else if (type === "error") {
            toast.style.backgroundColor = "red";
        } else {
            toast.style.backgroundColor = "#333";
        }

        // ซ่อน Toast หลังจาก 3 วินาที พร้อมเอฟเฟกต์
        setTimeout(() => {
            toast.className = toast.className.replace("show", "fade-out");
            setTimeout(() => {
                toast.className = "toast"; // ลบคลาส fade-out เมื่อแอนิเมชันจบ
            }, 500);
        }, 3000);
    }
});


