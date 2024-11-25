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

