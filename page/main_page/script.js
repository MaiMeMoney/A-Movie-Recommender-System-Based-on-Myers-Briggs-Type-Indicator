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

// สำหรับปุ่มค้นหา
document.getElementById('search-button').addEventListener('click', () => {
    const category = document.getElementById('search-category').value;
    const query = document.getElementById('search-bar').value.trim();

    console.log(`Category: ${category}, Query: ${query}`); // ตรวจสอบค่าใน Console

    if (!query) {
        alert('Please enter a search term');
        return;
    }

    const searchUrl = `/main_page/search-results.html?category=${category}&query=${encodeURIComponent(query)}`;
    console.log(`Redirecting to: ${searchUrl}`); // ตรวจสอบ URL ที่จะเปลี่ยนไป

    // เปลี่ยนเส้นทางไปที่ search-results.html
    window.location.href = searchUrl;
});
document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    const query = params.get('query');

    console.log(`Category: ${category}, Query: ${query}`);

    if (!category || !query) {
        alert('Invalid search parameters');
        return;
    }

    try {
        const response = await fetch(`http://localhost:5001/api/search?category=${category}&query=${query}`);
        const movies = await response.json();

        const resultsContainer = document.querySelector('.movie-list');

        if (!movies.length) {
            resultsContainer.innerHTML = '<p>No results found</p>';
            return;
        }

        // แสดงผลภาพยนตร์ที่ค้นพบ
        movies.forEach(movie => {
            const movieItem = document.createElement('div');
            movieItem.className = 'movie-item';
            movieItem.innerHTML = `
                <a href="https://www.youtube.com/watch?v=${movie.link_movies}" target="_blank">
                    <img src="${movie.Poster_Link}" alt="${movie.Series_Title}">
                    <p><strong>${movie.Series_Title}</strong> (${movie.Released_Year})</p>
                    <p>IMDB Rating: ${movie.IMDB_Rating}</p>
                </a>
            `;
            resultsContainer.appendChild(movieItem);
        });
    } catch (error) {
        console.error('Error fetching search results:', error);
        alert('An error occurred while fetching search results.');
    }
});
