// Scroll functionality for sections
function scrollLeft(sectionClass) {
    const movieList = document.querySelector(`.${sectionClass} .movie-list`);
    if (movieList) {
        movieList.scrollBy({ left: -300, behavior: 'smooth' });
    } else {
        console.error(`Section "${sectionClass}" not found.`);
    }
}

function scrollRight(sectionClass) {
    const movieList = document.querySelector(`.${sectionClass} .movie-list`);
    if (movieList) {
        movieList.scrollBy({ left: 300, behavior: 'smooth' });
    } else {
        console.error(`Section "${sectionClass}" not found.`);
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    const username = localStorage.getItem('username');
    const adminIcon = document.querySelector('.admin-icon');

    if (!username) {
        alert('You are not logged in!');
        window.location.href = '/page/login_page/index.html';
        return;
    }

    // แสดง username บนหน้า
    document.getElementById('username-display').textContent = `Welcome, ${username}`;

    try {
        // เช็ค role ของผู้ใช้ผ่าน API
        const response = await fetch(`http://localhost:6001/api/check-role?username=${username}`);
        const data = await response.json();

        if (data.role === 1) { // role = 1 หมายถึง admin
            console.log(`User ${username} is an admin. Showing admin icon.`);
            adminIcon.style.display = 'block'; // แสดงปุ่มมงกุฏสำหรับ admin
            adminIcon.addEventListener('click', function () {
                window.location.href = `http://localhost:6001/admin/dashboard?username=${username}`;
            });
        } else {
            console.log(`User ${username} is not an admin.`);
        }
    } catch (error) {
        console.error('Error fetching role data:', error);
    }
});

// Display recommended movies from localStorage
document.addEventListener('DOMContentLoaded', function () {
    const recommendedMovies = localStorage.getItem('recommendedMovies'); // Fetch data from localStorage

    if (!recommendedMovies) {
        console.error('No recommended movies found in localStorage.');
        return;
    }

    try {
        const movies = JSON.parse(recommendedMovies); // Parse JSON data

        // Get the container for recommended movies
        const recommendedMoviesContainer = document.querySelector('.mbti-recommend .movie-list');
        if (!recommendedMoviesContainer) {
            console.error('Recommended movies container not found in HTML.');
            return;
        }

        recommendedMoviesContainer.innerHTML = ''; // Clear old content

        // Ensure movies data is valid and populate only recommended movies
        movies.forEach(movie => {
            if (movie.movieId && movie.Poster_Link && movie.movieName) { // Validate data
                const movieItem = document.createElement('div');
                movieItem.classList.add('movie-item');
                movieItem.innerHTML = `
                    <a href="/page/movie-details/movie-details.html?movieId=${movie.movieId}">
                        <img src="${movie.Poster_Link}" alt="${movie.movieName}">
                    </a>
                    <p>${movie.movieName}</p>
                `;
                recommendedMoviesContainer.appendChild(movieItem);
            }
        });

        // Add scrolling functionality
        const leftButton = document.querySelector('.mbti-recommend .slide-btn.left');
        const rightButton = document.querySelector('.mbti-recommend .slide-btn.right');

        if (leftButton && rightButton) {
            leftButton.addEventListener('click', () => {
                recommendedMoviesContainer.scrollBy({ left: -300, behavior: 'smooth' });
            });

            rightButton.addEventListener('click', () => {
                recommendedMoviesContainer.scrollBy({ left: 300, behavior: 'smooth' });
            });
        } else {
            console.error('Slide buttons not found in the recommended movies section.');
        }
    } catch (error) {
        console.error('Error parsing recommended movies:', error);
    }
});


// Search button functionality
document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('search-button');

    if (searchButton) {
        searchButton.addEventListener('click', async () => {
            const query = document.getElementById('search-bar').value.trim();
            const category = document.getElementById('search-category').value;

            if (!query) {
                alert('Please enter a search term');
                return;
            }

            const searchUrl = `/page/main_page/search-results.html?category=${category}&query=${encodeURIComponent(query)}`;
            window.location.href = searchUrl;
        });
    } else {
        console.error('Search button not found in the document.');
    }
});

// See More button functionality
document.addEventListener('DOMContentLoaded', function () {
    const seeMoreButtons = [
        { id: 'see-more-action', category: 'genre', query: 'action' },
        { id: 'see-more-fantasy', category: 'genre', query: 'fantasy' },
        { id: 'see-more-sci-fi', category: 'genre', query: 'sci-fi' },
        { id: 'see-more-romance', category: 'genre', query: 'romance' },
        { id: 'see-more-thriller', category: 'genre', query: 'thriller' },
        { id: 'see-more-drama', category: 'genre', query: 'drama' },
        { id: 'see-more-comedy', category: 'genre', query: 'comedy' },
        { id: 'see-more-mystery', category: 'genre', query: 'mystery' },
        { id: 'see-more-crime', category: 'genre', query: 'crime' },
        { id: 'see-more-adventure', category: 'genre', query: 'adventure' },
        { id: 'see-more-animation', category: 'genre', query: 'animation' },
        { id: 'see-more-biography', category: 'genre', query: 'biography' },
        { id: 'see-more-family', category: 'genre', query: 'family' },
        { id: 'see-more-musical', category: 'genre', query: 'musical' },
        { id: 'see-more-history', category: 'genre', query: 'history' },
        { id: 'see-more-sport', category: 'genre', query: 'sport' },
        { id: 'see-more-horror', category: 'genre', query: 'horror' }
    ];

    seeMoreButtons.forEach(button => {
        const seeMoreButton = document.getElementById(button.id);

        if (seeMoreButton) {
            seeMoreButton.addEventListener('click', function () {
                window.location.href = `search-results.html?category=${button.category}&query=${button.query}`;
            });
        } else {
            console.warn(`See More button with id "${button.id}" not found.`);
        }
    });
});


document.addEventListener('DOMContentLoaded', () => {
    fetch('http://127.0.0.1:5001/movies/suggestions')
    .then(response => response.json())
    .then(data => {
        // จำกัดให้แสดงแค่ 10 รายการ
        const limitedData = data.slice(0, 10);

        limitedData.forEach(movie => {
            // สร้าง HTML สำหรับโพสเตอร์และข้อมูลหนัง
            const movieElement = document.createElement('div');
            movieElement.classList.add('movie-item');
            movieElement.innerHTML = `
                <a href="/page/movie-details/movie-details.html?movieId=${movie._id}">
                    <img src="${movie.Poster_Link}" alt="${movie.Series_Title}" class="movie-poster">
                </a>
            `;
            // เพิ่มเข้าไปใน container
            document.querySelector('.movie-suggestions .slider-container').appendChild(movieElement);
        });
    })
    .catch(error => {
        console.error('Error fetching movies:', error);
    });
});

document.addEventListener('DOMContentLoaded', function() {
    // ฟังก์ชันเพื่อดึงข้อมูลหนังจาก API
fetch('http://localhost:5001/api/crime-movies')
.then(response => {
    if (!response.ok) {
        throw new Error('Failed to fetch crime movies');
    }
    return response.json();
})
.then(movies => {
    // แสดงหนังที่ได้ใน section crime
    const crimeSection = document.querySelector('.crime .movie-list');
    crimeSection.innerHTML = '';  // ลบเนื้อหาที่มีอยู่ก่อน

    movies.forEach(movie => {
        const movieItem = document.createElement('div');
        movieItem.classList.add('movie-item');

        const movieLink = document.createElement('a');
        movieLink.href = `/page/movie-details/movie-details.html?movieId=${movie._id}`;

        const movieImage = document.createElement('img');
        movieImage.src = movie.Poster_Link || 'placeholder.png';
        movieImage.alt = movie.Series_Title;

        movieLink.appendChild(movieImage);
        movieItem.appendChild(movieLink);
        crimeSection.appendChild(movieItem);
    });
})
.catch(error => {
    console.error('Error fetching crime movies:', error);
});

});
// ฟังก์ชั่นในการเลื่อนเลื่อน (สำหรับ slider)
function scrollLeft(section) {
    const container = document.querySelector(`#${section} .crime .movie-list`);
    container.scrollBy({ left: -200, behavior: 'smooth' });
}

function scrollRight(section) {
    const container = document.querySelector(`#${section} .crime .movie-list`);
    container.scrollBy({ left: 200, behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', function () {
    // ฟังก์ชันเพื่อดึงข้อมูลหนังจาก API (sport)
    fetch('http://localhost:5001/api/sport-movies')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch sport movies');
            }
            return response.json(); // แปลงข้อมูลจาก JSON
        })
        .then(movies => {
            const sportMovieList = document.querySelector('.sport .movie-list'); // ใช้ querySelector แทน getElementById
            sportMovieList.innerHTML = '';  // เคลียร์ข้อมูลเก่า

            // สำหรับทุกหนังในข้อมูลที่ได้รับ
            movies.forEach(movie => {
                const movieItem = document.createElement('div');
                movieItem.classList.add('movie-item');
                
                // สร้างลิงก์ไปยังหน้า movie-details.html
                const movieLink = document.createElement('a');
                movieLink.href = `/page/movie-details/movie-details.html?movieId=${movie._id}`;
                
                // สร้างภาพโปสเตอร์หนัง
                const movieImage = document.createElement('img');
                movieImage.src = movie.Poster_Link || 'placeholder.png';  // ใช้ 'placeholder.png' หากไม่มี Poster_Link
                movieImage.alt = movie.Series_Title;
                
                movieLink.appendChild(movieImage);
                movieItem.appendChild(movieLink);
                sportMovieList.appendChild(movieItem);
            });
        })
        .catch(error => {
            console.error('Error fetching sport movies:', error);
            const sportMovieList = document.querySelector('.sport .movie-list'); // ใช้ querySelector แทน getElementById
            sportMovieList.innerHTML = '<p>Error loading movies.</p>';  // แสดงข้อความ error หากดึงข้อมูลไม่ได้
        });
});

document.addEventListener('DOMContentLoaded', function() {
    // ฟังก์ชั่นเพื่อดึงข้อมูลหนังจาก API
    fetch('http://localhost:5001/api/musical-movies')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch musical movies');
            }
            return response.json(); // แปลงข้อมูลจาก JSON
        })
        .then(movies => {
            const musicalSection = document.querySelector('.musical .movie-list');
            musicalSection.innerHTML = '';  // เคลียร์ข้อมูลเก่า

            // สำหรับทุกหนังในข้อมูลที่ได้รับ
            movies.forEach(movie => {
                const movieItem = document.createElement('div');
                movieItem.classList.add('movie-item');
                
                // สร้างลิงก์ไปยังหน้า movie-details.html
                const movieLink = document.createElement('a');
                movieLink.href = `/page/movie-details/movie-details.html?movieId=${movie._id}`;
                
                // สร้างภาพโปสเตอร์หนัง
                const movieImage = document.createElement('img');
                movieImage.src = movie.Poster_Link || 'placeholder.png';  // ใช้ 'placeholder.png' หากไม่มี Poster_Link
                movieImage.alt = movie.Series_Title;
                
                movieLink.appendChild(movieImage);
                movieItem.appendChild(movieLink);
                musicalSection.appendChild(movieItem);
            });
        })
        .catch(error => {
            console.error('Error fetching musical movies:', error);
            const musicalSection = document.querySelector('.musical .movie-list');
            musicalSection.innerHTML = '<p>Error loading movies.</p>';  // แสดงข้อความ error หากดึงข้อมูลไม่ได้
        });
});

document.addEventListener('DOMContentLoaded', function() {
    // ฟังก์ชั่นเพื่อดึงข้อมูลหนังจาก API
    fetch('http://localhost:5001/api/family-movies')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch family movies');
            }
            return response.json(); // แปลงข้อมูลจาก JSON
        })
        .then(movies => {
            const familySection = document.querySelector('.family .movie-list');
            familySection.innerHTML = '';  // เคลียร์ข้อมูลเก่า

            // สำหรับทุกหนังในข้อมูลที่ได้รับ
            movies.forEach(movie => {
                const movieItem = document.createElement('div');
                movieItem.classList.add('movie-item');
                
                // สร้างลิงก์ไปยังหน้า movie-details.html
                const movieLink = document.createElement('a');
                movieLink.href = `/page/movie-details/movie-details.html?movieId=${movie._id}`;
                
                // สร้างภาพโปสเตอร์หนัง
                const movieImage = document.createElement('img');
                movieImage.src = movie.Poster_Link || 'placeholder.png';  // ใช้ 'placeholder.png' หากไม่มี Poster_Link
                movieImage.alt = movie.Series_Title;
                
                movieLink.appendChild(movieImage);
                movieItem.appendChild(movieLink);
                familySection.appendChild(movieItem);
            });
        })
        .catch(error => {
            console.error('Error fetching family movies:', error);
            const familySection = document.querySelector('.family .movie-list');
            familySection.innerHTML = '<p>Error loading movies.</p>';  // แสดงข้อความ error หากดึงข้อมูลไม่ได้
        });
});

document.addEventListener('DOMContentLoaded', function() {
    // ฟังก์ชั่นเพื่อดึงข้อมูลหนังจาก API
    fetch('http://localhost:5001/api/biography-movies')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch biography movies');
            }
            return response.json(); // แปลงข้อมูลจาก JSON
        })
        .then(movies => {
            const biographySection = document.querySelector('.biography .movie-list');
            biographySection.innerHTML = '';  // เคลียร์ข้อมูลเก่า

            // สำหรับทุกหนังในข้อมูลที่ได้รับ
            movies.forEach(movie => {
                const movieItem = document.createElement('div');
                movieItem.classList.add('movie-item');
                
                // สร้างลิงก์ไปยังหน้า movie-details.html
                const movieLink = document.createElement('a');
                movieLink.href = `/page/movie-details/movie-details.html?movieId=${movie._id}`;
                
                // สร้างภาพโปสเตอร์หนัง
                const movieImage = document.createElement('img');
                movieImage.src = movie.Poster_Link || 'placeholder.png';  // ใช้ 'placeholder.png' หากไม่มี Poster_Link
                movieImage.alt = movie.Series_Title;
                
                movieLink.appendChild(movieImage);
                movieItem.appendChild(movieLink);
                biographySection.appendChild(movieItem);
            });
        })
        .catch(error => {
            console.error('Error fetching biography movies:', error);
            const biographySection = document.querySelector('.biography .movie-list');
            biographySection.innerHTML = '<p>Error loading movies.</p>';  // แสดงข้อความ error หากดึงข้อมูลไม่ได้
        });
});

document.addEventListener('DOMContentLoaded', function() {
    // ฟังก์ชั่นเพื่อดึงข้อมูลหนังจาก API
    fetch('http://localhost:5001/api/animation-movies')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch animation movies');
            }
            return response.json(); // แปลงข้อมูลจาก JSON
        })
        .then(movies => {
            const animationSection = document.querySelector('.animation .movie-list');
            animationSection.innerHTML = '';  // เคลียร์ข้อมูลเก่า

            // สำหรับทุกหนังในข้อมูลที่ได้รับ
            movies.forEach(movie => {
                const movieItem = document.createElement('div');
                movieItem.classList.add('movie-item');
                
                // สร้างลิงก์ไปยังหน้า movie-details.html
                const movieLink = document.createElement('a');
                movieLink.href = `/page/movie-details/movie-details.html?movieId=${movie._id}`;
                
                // สร้างภาพโปสเตอร์หนัง
                const movieImage = document.createElement('img');
                movieImage.src = movie.Poster_Link || 'placeholder.png';  // ใช้ 'placeholder.png' หากไม่มี Poster_Link
                movieImage.alt = movie.Series_Title;
                
                movieLink.appendChild(movieImage);
                movieItem.appendChild(movieLink);
                animationSection.appendChild(movieItem);
            });
        })
        .catch(error => {
            console.error('Error fetching animation movies:', error);
            const animationSection = document.querySelector('.animation .movie-list');
            animationSection.innerHTML = '<p>Error loading movies.</p>';  // แสดงข้อความ error หากดึงข้อมูลไม่ได้
        });
});

document.addEventListener('DOMContentLoaded', function() {
    // ฟังก์ชั่นเพื่อดึงข้อมูลหนังจาก API
    fetch('http://localhost:5001/api/adventure-movies')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch adventure movies');
            }
            return response.json(); // แปลงข้อมูลจาก JSON
        })
        .then(movies => {
            const adventureSection = document.querySelector('.adventure .movie-list');
            adventureSection.innerHTML = '';  // เคลียร์ข้อมูลเก่า

            // สำหรับทุกหนังในข้อมูลที่ได้รับ
            movies.forEach(movie => {
                const movieItem = document.createElement('div');
                movieItem.classList.add('movie-item');
                
                // สร้างลิงก์ไปยังหน้า movie-details.html
                const movieLink = document.createElement('a');
                movieLink.href = `/page/movie-details/movie-details.html?movieId=${movie._id}`;
                
                // สร้างภาพโปสเตอร์หนัง
                const movieImage = document.createElement('img');
                movieImage.src = movie.Poster_Link || 'placeholder.png';  // ใช้ 'placeholder.png' หากไม่มี Poster_Link
                movieImage.alt = movie.Series_Title;
                
                movieLink.appendChild(movieImage);
                movieItem.appendChild(movieLink);
                adventureSection.appendChild(movieItem);
            });
        })
        .catch(error => {
            console.error('Error fetching adventure movies:', error);
            const adventureSection = document.querySelector('.adventure .movie-list');
            adventureSection.innerHTML = '<p>Error loading movies.</p>';  // แสดงข้อความ error หากดึงข้อมูลไม่ได้
        });
});

document.addEventListener('DOMContentLoaded', function() {
    // ฟังก์ชั่นเพื่อดึงข้อมูลหนังจาก API
    fetch('http://localhost:5001/api/history-movies')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch history movies');
            }
            return response.json(); // แปลงข้อมูลจาก JSON
        })
        .then(movies => {
            const historySection = document.querySelector('.history .movie-list');
            historySection.innerHTML = '';  // เคลียร์ข้อมูลเก่า

            // สำหรับทุกหนังในข้อมูลที่ได้รับ
            movies.forEach(movie => {
                const movieItem = document.createElement('div');
                movieItem.classList.add('movie-item');
                
                // สร้างลิงก์ไปยังหน้า movie-details.html
                const movieLink = document.createElement('a');
                movieLink.href = `/page/movie-details/movie-details.html?movieId=${movie._id}`;
                
                // สร้างภาพโปสเตอร์หนัง
                const movieImage = document.createElement('img');
                movieImage.src = movie.Poster_Link || 'placeholder.png';  // ใช้ 'placeholder.png' หากไม่มี Poster_Link
                movieImage.alt = movie.Series_Title;
                
                movieLink.appendChild(movieImage);
                movieItem.appendChild(movieLink);
                historySection.appendChild(movieItem);
            });
        })
        .catch(error => {
            console.error('Error fetching history movies:', error);
            const historySection = document.querySelector('.history .movie-list');
            historySection.innerHTML = '<p>Error loading movies.</p>';  // แสดงข้อความ error หากดึงข้อมูลไม่ได้
        });
});

document.addEventListener('DOMContentLoaded', function() {
    // ฟังก์ชั่นเพื่อดึงข้อมูลหนังจาก API
    fetch('http://localhost:5001/api/mystery-movies')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch mystery movies');
            }
            return response.json(); // แปลงข้อมูลจาก JSON
        })
        .then(movies => {
            const mysterySection = document.querySelector('.mystery .movie-list');
            mysterySection.innerHTML = '';  // เคลียร์ข้อมูลเก่า

            // สำหรับทุกหนังในข้อมูลที่ได้รับ
            movies.forEach(movie => {
                const movieItem = document.createElement('div');
                movieItem.classList.add('movie-item');
                
                // สร้างลิงก์ไปยังหน้า movie-details.html
                const movieLink = document.createElement('a');
                movieLink.href = `/page/movie-details/movie-details.html?movieId=${movie._id}`;
                
                // สร้างภาพโปสเตอร์หนัง
                const movieImage = document.createElement('img');
                movieImage.src = movie.Poster_Link || 'placeholder.png';  // ใช้ 'placeholder.png' หากไม่มี Poster_Link
                movieImage.alt = movie.Series_Title;
                
                movieLink.appendChild(movieImage);
                movieItem.appendChild(movieLink);
                mysterySection.appendChild(movieItem);
            });
        })
        .catch(error => {
            console.error('Error fetching mystery movies:', error);
            const mysterySection = document.querySelector('.mystery .movie-list');
            mysterySection.innerHTML = '<p>Error loading movies.</p>';  // แสดงข้อความ error หากดึงข้อมูลไม่ได้
        });
});

document.addEventListener('DOMContentLoaded', function() {
    // ฟังก์ชั่นเพื่อดึงข้อมูลหนังจาก API
    fetch('http://localhost:5001/api/romance-movies')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch romance movies');
            }
            return response.json(); // แปลงข้อมูลจาก JSON
        })
        .then(movies => {
            const romanceSection = document.querySelector('.romance .movie-list');
            romanceSection.innerHTML = '';  // เคลียร์ข้อมูลเก่า

            // สำหรับทุกหนังในข้อมูลที่ได้รับ
            movies.forEach(movie => {
                const movieItem = document.createElement('div');
                movieItem.classList.add('movie-item');
                
                // สร้างลิงก์ไปยังหน้า movie-details.html
                const movieLink = document.createElement('a');
                movieLink.href = `/page/movie-details/movie-details.html?movieId=${movie._id}`;
                
                // สร้างภาพโปสเตอร์หนัง
                const movieImage = document.createElement('img');
                movieImage.src = movie.Poster_Link || 'placeholder.png';  // ใช้ 'placeholder.png' หากไม่มี Poster_Link
                movieImage.alt = movie.Series_Title;
                
                movieLink.appendChild(movieImage);
                movieItem.appendChild(movieLink);
                romanceSection.appendChild(movieItem);
            });
        })
        .catch(error => {
            console.error('Error fetching romance movies:', error);
            const romanceSection = document.querySelector('.romance .movie-list');
            romanceSection.innerHTML = '<p>Error loading movies.</p>';  // แสดงข้อความ error หากดึงข้อมูลไม่ได้
        });
});

document.addEventListener('DOMContentLoaded', function() {
    // ฟังก์ชั่นเพื่อดึงข้อมูลหนังจาก API
    fetch('http://localhost:5001/api/comedy-movies')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch comedy movies');
            }
            return response.json(); // แปลงข้อมูลจาก JSON
        })
        .then(movies => {
            const comedySection = document.querySelector('.comedy .movie-list');
            comedySection.innerHTML = '';  // เคลียร์ข้อมูลเก่า

            // สำหรับทุกหนังในข้อมูลที่ได้รับ
            movies.forEach(movie => {
                const movieItem = document.createElement('div');
                movieItem.classList.add('movie-item');
                
                // สร้างลิงก์ไปยังหน้า movie-details.html
                const movieLink = document.createElement('a');
                movieLink.href = `/page/movie-details/movie-details.html?movieId=${movie._id}`;
                
                // สร้างภาพโปสเตอร์หนัง
                const movieImage = document.createElement('img');
                movieImage.src = movie.Poster_Link || 'placeholder.png';  // ใช้ 'placeholder.png' หากไม่มี Poster_Link
                movieImage.alt = movie.Series_Title;
                
                movieLink.appendChild(movieImage);
                movieItem.appendChild(movieLink);
                comedySection.appendChild(movieItem);
            });
        })
        .catch(error => {
            console.error('Error fetching comedy movies:', error);
            const comedySection = document.querySelector('.comedy .movie-list');
            comedySection.innerHTML = '<p>Error loading movies.</p>';  // แสดงข้อความ error หากดึงข้อมูลไม่ได้
        });
});

document.addEventListener('DOMContentLoaded', function() {
    // ฟังก์ชั่นเพื่อดึงข้อมูลหนังจาก API
    fetch('http://localhost:5001/api/thriller-movies')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch thriller movies');
            }
            return response.json(); // แปลงข้อมูลจาก JSON
        })
        .then(movies => {
            const thrillerSection = document.querySelector('.thriller .movie-list');
            thrillerSection.innerHTML = '';  // เคลียร์ข้อมูลเก่า

            // สำหรับทุกหนังในข้อมูลที่ได้รับ
            movies.forEach(movie => {
                const movieItem = document.createElement('div');
                movieItem.classList.add('movie-item');
                
                // สร้างลิงก์ไปยังหน้า movie-details.html
                const movieLink = document.createElement('a');
                movieLink.href = `/page/movie-details/movie-details.html?movieId=${movie._id}`;
                
                // สร้างภาพโปสเตอร์หนัง
                const movieImage = document.createElement('img');
                movieImage.src = movie.Poster_Link || 'placeholder.png';  // ใช้ 'placeholder.png' หากไม่มี Poster_Link
                movieImage.alt = movie.Series_Title;
                
                movieLink.appendChild(movieImage);
                movieItem.appendChild(movieLink);
                thrillerSection.appendChild(movieItem);
            });
        })
        .catch(error => {
            console.error('Error fetching thriller movies:', error);
            const thrillerSection = document.querySelector('.thriller .movie-list');
            thrillerSection.innerHTML = '<p>Error loading movies.</p>';  // แสดงข้อความ error หากดึงข้อมูลไม่ได้
        });
});

document.addEventListener('DOMContentLoaded', function() {
    // ฟังก์ชั่นเพื่อดึงข้อมูลหนังจาก API
    fetch('http://localhost:5001/api/horror-movies')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch horror movies');
            }
            return response.json(); // แปลงข้อมูลจาก JSON
        })
        .then(movies => {
            const horrorSection = document.querySelector('.horror .movie-list');
            horrorSection.innerHTML = '';  // เคลียร์ข้อมูลเก่า

            // สำหรับทุกหนังในข้อมูลที่ได้รับ
            movies.forEach(movie => {
                const movieItem = document.createElement('div');
                movieItem.classList.add('movie-item');
                
                // สร้างลิงก์ไปยังหน้า movie-details.html
                const movieLink = document.createElement('a');
                movieLink.href = `/page/movie-details/movie-details.html?movieId=${movie._id}`;
                
                // สร้างภาพโปสเตอร์หนัง
                const movieImage = document.createElement('img');
                movieImage.src = movie.Poster_Link || 'placeholder.png';  // ใช้ 'placeholder.png' หากไม่มี Poster_Link
                movieImage.alt = movie.Series_Title;
                
                movieLink.appendChild(movieImage);
                movieItem.appendChild(movieLink);
                horrorSection.appendChild(movieItem);
            });
        })
        .catch(error => {
            console.error('Error fetching horror movies:', error);
            const horrorSection = document.querySelector('.horror .movie-list');
            horrorSection.innerHTML = '<p>Error loading movies.</p>';  // แสดงข้อความ error หากดึงข้อมูลไม่ได้
        });
});

document.addEventListener('DOMContentLoaded', function() {
    // ฟังก์ชั่นเพื่อดึงข้อมูลหนังจาก API
    fetch('http://localhost:5001/api/drama-movies')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch drama movies');
            }
            return response.json(); // แปลงข้อมูลจาก JSON
        })
        .then(movies => {
            const dramaSection = document.querySelector('.drama .movie-list');
            dramaSection.innerHTML = '';  // เคลียร์ข้อมูลเก่า

            // สำหรับทุกหนังในข้อมูลที่ได้รับ
            movies.forEach(movie => {
                const movieItem = document.createElement('div');
                movieItem.classList.add('movie-item');
                
                // สร้างลิงก์ไปยังหน้า movie-details.html
                const movieLink = document.createElement('a');
                movieLink.href = `/page/movie-details/movie-details.html?movieId=${movie._id}`;
                
                // สร้างภาพโปสเตอร์หนัง
                const movieImage = document.createElement('img');
                movieImage.src = movie.Poster_Link || 'placeholder.png';  // ใช้ 'placeholder.png' หากไม่มี Poster_Link
                movieImage.alt = movie.Series_Title;
                
                movieLink.appendChild(movieImage);
                movieItem.appendChild(movieLink);
                dramaSection.appendChild(movieItem);
            });
        })
        .catch(error => {
            console.error('Error fetching drama movies:', error);
            const dramaSection = document.querySelector('.drama .movie-list');
            dramaSection.innerHTML = '<p>Error loading movies.</p>';  // แสดงข้อความ error หากดึงข้อมูลไม่ได้
        });
});

document.addEventListener('DOMContentLoaded', function() {
    // ฟังก์ชั่นเพื่อดึงข้อมูลหนังจาก API
    fetch('http://localhost:5001/api/fantasy-movies')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch fantasy movies');
            }
            return response.json(); // แปลงข้อมูลจาก JSON
        })
        .then(movies => {
            const fantasySection = document.querySelector('.fantasy .movie-list');
            fantasySection.innerHTML = '';  // เคลียร์ข้อมูลเก่า

            // สำหรับทุกหนังในข้อมูลที่ได้รับ
            movies.forEach(movie => {
                const movieItem = document.createElement('div');
                movieItem.classList.add('movie-item');
                
                // สร้างลิงก์ไปยังหน้า movie-details.html
                const movieLink = document.createElement('a');
                movieLink.href = `/page/movie-details/movie-details.html?movieId=${movie._id}`;
                
                // สร้างภาพโปสเตอร์หนัง
                const movieImage = document.createElement('img');
                movieImage.src = movie.Poster_Link || 'placeholder.png';  // ใช้ 'placeholder.png' หากไม่มี Poster_Link
                movieImage.alt = movie.Series_Title;
                
                movieLink.appendChild(movieImage);
                movieItem.appendChild(movieLink);
                fantasySection.appendChild(movieItem);
            });
        })
        .catch(error => {
            console.error('Error fetching fantasy movies:', error);
            const fantasySection = document.querySelector('.fantasy .movie-list');
            fantasySection.innerHTML = '<p>Error loading movies.</p>';  // แสดงข้อความ error หากดึงข้อมูลไม่ได้
        });
});

document.addEventListener('DOMContentLoaded', function() {
    // ฟังก์ชั่นเพื่อดึงข้อมูลหนังจาก API
    fetch('http://localhost:5001/api/action-movies')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch action movies');
            }
            return response.json(); // แปลงข้อมูลจาก JSON
        })
        .then(movies => {
            const actionSection = document.querySelector('.action .movie-list');
            actionSection.innerHTML = '';  // เคลียร์ข้อมูลเก่า

            // สำหรับทุกหนังในข้อมูลที่ได้รับ
            movies.forEach(movie => {
                const movieItem = document.createElement('div');
                movieItem.classList.add('movie-item');
                
                // สร้างลิงก์ไปยังหน้า movie-details.html
                const movieLink = document.createElement('a');
                movieLink.href = `/page/movie-details/movie-details.html?movieId=${movie._id}`;
                
                // สร้างภาพโปสเตอร์หนัง
                const movieImage = document.createElement('img');
                movieImage.src = movie.Poster_Link || 'placeholder.png';  // ใช้ 'placeholder.png' หากไม่มี Poster_Link
                movieImage.alt = movie.Series_Title;
                
                movieLink.appendChild(movieImage);
                movieItem.appendChild(movieLink);
                actionSection.appendChild(movieItem);
            });
        })
        .catch(error => {
            console.error('Error fetching action movies:', error);
            const actionSection = document.querySelector('.action .movie-list');
            actionSection.innerHTML = '<p>Error loading movies.</p>';  // แสดงข้อความ error หากดึงข้อมูลไม่ได้
        });
});

document.addEventListener('DOMContentLoaded', function() {
    // ฟังก์ชั่นเพื่อดึงข้อมูลหนังจาก API
    fetch('http://localhost:5001/api/sci-fi-movies')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch sci-fi movies');
            }
            return response.json(); // แปลงข้อมูลจาก JSON
        })
        .then(movies => {
            const sciFiSection = document.querySelector('.sci-fi .movie-list');
            sciFiSection.innerHTML = '';  // เคลียร์ข้อมูลเก่า

            // สำหรับทุกหนังในข้อมูลที่ได้รับ
            movies.forEach(movie => {
                const movieItem = document.createElement('div');
                movieItem.classList.add('movie-item');
                
                // สร้างลิงก์ไปยังหน้า movie-details.html
                const movieLink = document.createElement('a');
                movieLink.href = `/page/movie-details/movie-details.html?movieId=${movie._id}`;
                
                // สร้างภาพโปสเตอร์หนัง
                const movieImage = document.createElement('img');
                movieImage.src = movie.Poster_Link || 'placeholder.png';  // ใช้ 'placeholder.png' หากไม่มี Poster_Link
                movieImage.alt = movie.Series_Title;
                
                movieLink.appendChild(movieImage);
                movieItem.appendChild(movieLink);
                sciFiSection.appendChild(movieItem);
            });
        })
        .catch(error => {
            console.error('Error fetching sci-fi movies:', error);
            const sciFiSection = document.querySelector('.sci-fi .movie-list');
            sciFiSection.innerHTML = '<p>Error loading movies.</p>';  // แสดงข้อความ error หากดึงข้อมูลไม่ได้
        });
});


function scrollLeft(sectionClass) {
    const movieList = document.querySelector(`.${sectionClass} .movie-list`);
    if (movieList) {
        movieList.scrollBy({ left: -300, behavior: 'smooth' });
    }
}

function scrollRight(sectionClass) {
    const movieList = document.querySelector(`.${sectionClass} .movie-list`);
    if (movieList) {
        movieList.scrollBy({ left: 300, behavior: 'smooth' });
    }
}


// Route สำหรับ mainpage.html พร้อม session validation
app.get('/mainpage.html', validateSession, (req, res) => {
    res.sendFile(path.join(__dirname, 'page/main_page/mainpage.html'));
});



