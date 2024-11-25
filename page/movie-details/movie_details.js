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

document.addEventListener('DOMContentLoaded', function () {
    const openPopupBtn = document.getElementById('open-rating-popup');
    const ratingPopup = document.getElementById('rating-popup');
    const closePopupBtn = document.getElementById('close-rating-popup');
    const ratingStarsContainer = document.getElementById('popup-rating-stars');


    openPopupBtn.addEventListener('click', function () {
        console.log("Open popup button clicked!"); // Debugging
        ratingPopup.classList.remove('hidden');
    });
    closePopupBtn.addEventListener('click', function () {
        console.log("Close popup button clicked!"); // Debugging
        ratingPopup.classList.add('hidden');
    });


    const stars = Array.from({ length: 10 }, (_, index) => {
        const star = document.createElement('span');
        star.textContent = '★';
        star.dataset.value = index + 1;
        star.addEventListener('click', function () {
            selectedRating = parseInt(star.dataset.value);
            stars.forEach((s, idx) => {
                s.classList.toggle('selected', idx < selectedRating);
            });
            console.log(`Selected Rating: ${selectedRating}`);
            submitRating(selectedRating);
        });
        return star;
    });

    stars.forEach(star => ratingStarsContainer.appendChild(star));

    async function submitRating(rating) {
        const username = localStorage.getItem('username'); // ใช้ username จาก LocalStorage
        const movieId = new URLSearchParams(window.location.search).get('movieId'); // รับ movieId จาก URL
    
        console.log('Submit Rating Data:', { username, movieId, rating }); // Debugging
    
        if (!username || !movieId) {
            alert('Please login and select a movie.');
            return;
        }
    
        try {
            const response = await fetch(`http://localhost:5001/movies_list/movies/${movieId}/rate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, score: rating }),
            });
    
            const result = await response.json();
    
            if (response.ok) {
                console.log('API Response:', result); // Debugging
                alert('Thank you for rating!');
                const ratingPopup = document.getElementById('rating-popup'); // ดึง element ของป๊อปอัป
                ratingPopup.classList.add('hidden'); // ซ่อนป๊อปอัป
            } else {
                console.error('API Error:', result); // Debugging
                alert(result.message || 'Failed to submit rating.');
            }
        } catch (error) {
            console.error('Error while submitting:', error);
        }
    }
        
        
});

document.addEventListener('DOMContentLoaded', function () {
    const openPopupBtn = document.getElementById('open-rating-popup');
    const ratingPopup = document.getElementById('rating-popup');
    const closePopupBtn = document.getElementById('close-rating-popup');
    const ratingStarsContainer = document.getElementById('popup-rating-stars');
    const tooltip = document.createElement('div'); // สร้าง tooltip สำหรับบอกคะแนน
    tooltip.classList.add('tooltip');
    document.body.appendChild(tooltip);

    // ซ่อน popup เมื่อโหลดหน้าเว็บ
    ratingPopup.classList.add('hidden');

    // Event listener เมื่อกดปุ่ม "Rate Movie"
    openPopupBtn.addEventListener('click', function () {
        console.log("Open popup button clicked!");
        ratingPopup.classList.remove('hidden'); // แสดง popup
        document.body.classList.add('popup-open'); // ปิดการเลื่อนหน้าเว็บ
        createStars(); // สร้างดาว
    });

    // Event listener เมื่อกดปุ่ม "Close"
    closePopupBtn.addEventListener('click', function () {
        console.log("Close popup button clicked!");
        ratingPopup.classList.add('hidden'); // ซ่อน popup
        document.body.classList.remove('popup-open'); // เปิดการเลื่อนหน้าเว็บ
    });

    function createStars() {
        // ลบดาวเก่าทั้งหมดก่อนเพิ่มใหม่
        while (ratingStarsContainer.firstChild) {
            ratingStarsContainer.removeChild(ratingStarsContainer.firstChild);
        }

        // สร้างดาวใหม่ 10 ดวง
        const stars = Array.from({ length: 10 }, (_, index) => {
            const star = document.createElement('span');
            star.textContent = '★';
            star.dataset.value = index + 1;
            star.classList.add('star');
            
            // เพิ่ม event สำหรับการชี้เมาส์
            star.addEventListener('mouseover', function (event) {
                const starValue = parseInt(star.dataset.value);
                tooltip.textContent = `Star ${starValue}`;
                tooltip.style.left = `${event.pageX}px`;
                tooltip.style.top = `${event.pageY - 30}px`;
                tooltip.classList.add('visible'); // แสดง tooltip
            });

            // ซ่อน tooltip เมื่อเมาส์ออก
            star.addEventListener('mouseout', function () {
                tooltip.classList.remove('visible'); // ซ่อน tooltip
            });

            // Event สำหรับการคลิกดาว
            star.addEventListener('click', function () {
                const selectedRating = parseInt(star.dataset.value);
                submitRating(selectedRating); // ส่งคะแนน
                updateStarSelection(stars, selectedRating); // อัปเดตการเลือก
                alert(`You rated this movie: ${selectedRating} stars`);
            });

            return star;
        });

        // เพิ่มดาวใหม่เข้าไปในคอนเทนเนอร์
        stars.forEach(star => ratingStarsContainer.appendChild(star));
    }

    function updateStarSelection(stars, selectedRating) {
        stars.forEach((star, index) => {
            star.classList.toggle('selected', index < selectedRating); // เพิ่มคลาส selected
        });
    }

    async function submitRating(rating) {
        const username = localStorage.getItem('username');
        const movieId = new URLSearchParams(window.location.search).get('movieId');
        const movieName = document.getElementById('movie-name').textContent;

        console.log('Sending Data:', { username, score: rating, movieName }); // Debugging

        if (!username || !movieId || !movieName) {
            alert('Please login, select a movie, and try again.');
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
                alert('Rating submitted successfully!');
            } else {
                console.error('API Error:', result);
                alert(result.message || 'Failed to submit rating.');
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
        }
    }
});


async function submitRating(rating) {
    const username = localStorage.getItem('username'); // ใช้ username จาก localStorage
    const movieId = new URLSearchParams(window.location.search).get('movieId');

    if (!username || !movieId) {
        alert('Please login and select a movie.');
        return;
    }

    try {
        console.log('Submitting Rating:', { username, movieId, score: rating }); // Debugging

        const response = await fetch(`http://localhost:5001/movies_list/movies/${movieId}/rate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, score: rating }), // ส่งคะแนน
        });

        const result = await response.json();

        if (response.ok) {
            alert('Rating submitted successfully!');
            console.log('Response:', result); // Debugging
        } else {
            alert(result.message || 'Failed to submit rating.');
            console.error('Error Response:', result); // Debugging
        }
    } catch (error) {
        console.error('Error submitting rating:', error);
    }
}
