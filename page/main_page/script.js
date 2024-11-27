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

document.getElementById('search-button').addEventListener('click', () => {
    const query = document.getElementById('search-bar').value.trim();
    const category = document.getElementById('search-category').value;

    if (!query) {
        alert('Please enter a search term');
        return;
    }

    const searchUrl = `/page/main_page/search-results.html?category=${category}&query=${encodeURIComponent(query)}`;
    window.location.href = searchUrl;

});




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



// Route สำหรับ mainpage.html พร้อม session validation
app.get('/mainpage.html', validateSession, (req, res) => {
    res.sendFile(path.join(__dirname, 'page/main_page/mainpage.html'));
});



