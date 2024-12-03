function scrollLeft(sectionClass) {
    const movieList = document.querySelector(`.${sectionClass} .movie-list`);
    if (movieList) {
        console.log("Before Scroll Left:", movieList.scrollLeft);
        movieList.scrollBy({ left: -300, behavior: 'smooth' });
        console.log("After Scroll Left:", movieList.scrollLeft);
    } else {
        console.error(`Section "${sectionClass}" not found.`);
    }
}

function scrollRight(sectionClass) {
    const movieList = document.querySelector(`.${sectionClass} .movie-list`);
    if (movieList) {
        console.log("Before Scroll Right:", movieList.scrollLeft);
        movieList.scrollBy({ left: 300, behavior: 'smooth' });
        console.log("After Scroll Right:", movieList.scrollLeft);
    } else {
        console.error(`Section "${sectionClass}" not found.`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const leftBtn = document.querySelector('.movie-suggestions .slide-btn.left');
    const rightBtn = document.querySelector('.movie-suggestions .slide-btn.right');
    const movieList = document.querySelector('.movie-suggestions .movie-list');

    // เลื่อนซ้าย
    leftBtn.addEventListener('click', () => {
        movieList.scrollBy({ left: -200, behavior: 'smooth' });
    });

    // เลื่อนขวา
    rightBtn.addEventListener('click', () => {
        movieList.scrollBy({ left: 200, behavior: 'smooth' });
    });
});


document.getElementById('search-button').addEventListener('click', async () => {
    const query = document.getElementById('search-bar').value.trim();
    const category = document.getElementById('search-category').value;

    if (!query) {
        alert('Please enter a search term');
        return;
    }
    
    // บันทึกการค้นหาพร้อม movieId (ถ้ามี)
    try {
        const searchData = { 
            query,
            // เพิ่ม movieId ถ้าเป็นการค้นหาจากหน้าหนัง
            movieId: new URLSearchParams(window.location.search).get('movieId')
        };

        await fetch('http://localhost:5001/api/log-search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(searchData)
        });
        console.log('Search logged:', searchData);
    } catch (error) {
        console.error('Error logging search:', error);
    }

    // ไปยังหน้าผลการค้นหา
    const searchUrl = `/page/main_page/search-results.html?category=${category}&query=${encodeURIComponent(query)}`;
    window.location.href = searchUrl;
});

async function logMovieView(movieId) {
    try {
        await fetch('http://localhost:6001/api/movie-view', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ movieId })
        });
    } catch (error) {
        console.error('Error logging movie view:', error);
    }
}

window.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const query = urlParams.get('query');

    if (!query) {
        document.querySelector('.movie-list').innerHTML = '<p>No search term provided</p>';
        return;
    }

    try {
        const response = await fetch(`http://localhost:5001/api/search?category=${category}&query=${query}`);
        const movies = await response.json();

        const resultsContainer = document.querySelector('.movie-list');
        resultsContainer.innerHTML = '';

        if (!movies.length) {
            resultsContainer.innerHTML = `
                <div style="text-align: center; color: #f4a261;">
                    <h3>No results found</h3>
                    <p>Try searching for something else.</p>
                </div>
            `;
            return;
        }
        

        movies.forEach(movie => {
            const movieItem = document.createElement('div');
            movieItem.className = 'movie-item';
            movieItem.innerHTML = `
                <a href="/page/movie-details/movie-details.html?movieId=${movie._id}">
                    <img src="${movie.Poster_Link}" alt="${movie.Series_Title}">
                </a>
                <p>${movie.Series_Title} (${movie.Released_Year})</p>
            `;
            document.querySelector('.movie-list').appendChild(movieItem);
        });
        
        
    } catch (error) {
        console.error('Error fetching search results:', error);
        alert('An error occurred while fetching search results.');
    }
});


document.addEventListener('DOMContentLoaded', async function () {
    const username = localStorage.getItem('username');
    const adminIcon = document.querySelector('.admin-icon');

    if (!username) {
        alert('You are not logged in!');
        window.location.href = '/page/login_page/index.html';
        return;
    }

    document.getElementById('username-display').textContent = `Welcome, ${username}`;

    try {
        const response = await fetch(`http://localhost:6001/api/check-role?username=${username}`);
        const data = await response.json();

        console.log('API /api/check-role Response:', data); // Log ข้อมูลที่ API ส่งกลับมา

        if (data.role === 1) {
            console.log(`User ${username} is an admin. Showing admin icon.`);
            adminIcon.style.display = 'block'; // แสดงมงกุฏ
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

document.addEventListener('DOMContentLoaded', async function () {
    const username = localStorage.getItem('username');
    
    if (!username) {
        alert('Session expired. Please log in again.');
        window.location.href = '/page/login_page/index.html';
        return;
    }

    document.getElementById('username-display').textContent = `Welcome, ${username}`;
});

document.addEventListener('DOMContentLoaded', function() {
    // กำหนด event listener ให้กับปุ่ม SEE MORE ของ section ต่างๆ

    // กำหนดปุ่ม "See More" ของแต่ละ genre
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

    // เพิ่ม event listener สำหรับแต่ละปุ่ม
    seeMoreButtons.forEach(button => {
        const seeMoreButton = document.getElementById(button.id);
        
        if (seeMoreButton) {
            seeMoreButton.addEventListener('click', function() {
                // เมื่อคลิกที่ปุ่ม, ไปยังหน้าค้นหาพร้อมกับ category และ query ที่กำหนด
                window.location.href = `search-results.html?category=${button.category}&query=${button.query}`;
            });
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



