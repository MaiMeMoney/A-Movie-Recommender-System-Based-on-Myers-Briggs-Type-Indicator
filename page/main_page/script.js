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


// document.addEventListener('DOMContentLoaded', () => {
//     fetch('http://127.0.0.1:5001/movies/suggestions')
//         .then(response => response.json())
//         .then(data => {
//             const movieListContainer = document.querySelector('.movie-suggestions .slider-container');
            
//             data.forEach(movie => {
//                 const movieElement = document.createElement('div');
//                 movieElement.classList.add('movie-item');
                
//                 // สร้างลิงก์ที่เชื่อมไปยังหน้า movie-details
//                 const movieLink = document.createElement('a');
//                 movieLink.href = `/page/movie-details/movie-details.html?movieId=${movie._id}`;  // ใช้ _id ของ MongoDB เป็น movieId
//                 movieLink.target = '_blank';  // เปิดในแท็บใหม่

//                 // สร้างโพสเตอร์
//                 const posterImg = document.createElement('img');
//                 posterImg.src = movie.Poster_Link;
//                 posterImg.alt = movie.Series_Title;

//                 // เพิ่มภาพโพสเตอร์ไปยังลิงก์
//                 movieLink.appendChild(posterImg);
                
//                 // เพิ่มลิงก์ของหนังไปยัง container
//                 movieElement.appendChild(movieLink);
//                 movieListContainer.appendChild(movieElement);
//             });
//         })
//         .catch(error => {
//             console.error('Error fetching movies:', error);
//         });
// });

document.addEventListener('DOMContentLoaded', () => {
    fetch('http://127.0.0.1:5001/movies/suggestions')
    .then(response => response.json())
    .then(data => {
        const movieList = document.querySelector('.movie-suggestions .slider-container');
        data.forEach(movie => {
            const movieElement = document.createElement('div');
            movieElement.classList.add('movie-item');
            
            // สร้างโพสเตอร์และใส่คลาสให้เหมาะสม
            const poster = document.createElement('img');
            poster.src = movie.Poster_Link;
            poster.alt = movie.Series_Title;
            
            // ใส่ event listener ให้คลิกที่โพสเตอร์
            poster.addEventListener('click', () => {
                // นำทางไปยังหน้ารายละเอียดของหนัง
                window.location.href = `/page/movie-details/movie-details.html?movieId=${movie._id}`;
            });
            
            movieElement.appendChild(poster);
            movieList.appendChild(movieElement);
        });
    })
    .catch(error => console.error('Error fetching movies:', error));
});






// Route สำหรับ mainpage.html พร้อม session validation
app.get('/mainpage.html', validateSession, (req, res) => {
    res.sendFile(path.join(__dirname, 'page/main_page/mainpage.html'));
});



