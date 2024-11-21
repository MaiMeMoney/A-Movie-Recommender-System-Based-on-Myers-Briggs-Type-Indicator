let movieData = {}; // เก็บข้อมูลหนังสำหรับแต่ละลิสต์
let selectedMovie = null; // หนังที่ถูกเลือกในลิสต์ปัจจุบัน
let currentList = 'Favorite'; // ค่าเริ่มต้น
let watchlists = { Favorite: [] }; // เก็บข้อมูล Watchlist

// สร้าง Watchlist ใหม่แบบ Dynamic
async function createList() {
    const listNameInput = document.getElementById("new-list-name");
    const listName = listNameInput.value.trim();
    const username = localStorage.getItem("username") || "default_user"; // ใช้ username จาก localStorage หรือค่า default

    if (!listName) {
        alert("Please enter a name for the list!");
        return;
    }

    try {
        const response = await fetch('/watchlist/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, listName }),
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            const newList = document.createElement("button");
            newList.className = "list-item";
            newList.textContent = listName;
            newList.addEventListener("click", () => switchList(listName));
            document.getElementById("list-container").appendChild(newList);
            listNameInput.value = ''; // ล้าง input
        } else {
            alert(result.message || "Failed to create Watchlist.");
        }
    } catch (error) {
        console.error("Error creating Watchlist:", error);
    }
}


// เพิ่ม Watchlist ใน Sidebar
function addWatchlistToSidebar(listName) {
    const listContainer = document.getElementById("list-container");
    const newListItem = document.createElement("button");
    newListItem.className = "list-item";
    newListItem.textContent = listName;

    // ผูก Event สำหรับการสลับ Watchlist
    newListItem.addEventListener("click", () => switchList(listName));

    // เพิ่ม Context Menu (คลิกขวา) เพื่อลบ Watchlist
    newListItem.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        const confirmDelete = confirm(`Do you want to delete the Watchlist "${listName}"?`);
        if (confirmDelete) deleteWatchlist(listName, newListItem);
    });

    listContainer.appendChild(newListItem);
}

// ลบ Watchlist เมื่อคลิกขวา
async function deleteWatchlist(listName) {
    if (confirm(`Are you sure you want to delete the Watchlist "${listName}"?`)) {
        try {
            const response = await fetch(`/watchlist/delete/${listName}`, { method: 'DELETE' });
            if (response.ok) {
                document.querySelector(`.list-item[data-list="${listName}"]`).remove();
                alert(`Watchlist "${listName}" deleted successfully.`);
                if (currentList === listName) {
                    currentList = 'Favorite'; // เปลี่ยนกลับไป Favorite
                    loadMovies(currentList);
                }
            } else {
                alert("Failed to delete the Watchlist.");
            }
        } catch (error) {
            console.error("Error deleting Watchlist:", error);
        }
    }
}

// แสดง Modal เพื่อเลือก Watchlist เมื่อเพิ่มหนัง
function showAddMovieModal(movie) {
    const modal = document.getElementById("add-movie-modal");
    const dropdown = document.getElementById("watchlist-dropdown");
    dropdown.innerHTML = Object.keys(watchlists).map(
        (listName) => `<option value="${listName}">${listName}</option>`
    ).join('');
    modal.style.display = "block";

    document.getElementById("confirm-add-movie").onclick = async () => {
        const selectedList = dropdown.value;
        await addToWatchlist(selectedList, movie);
        modal.style.display = "none";
    };
}




async function loadMovies(listName = 'Favorite') {
    try {
        const response = await fetch(`/watchlist/current_user/${listName}`);
        if (response.ok) {
            const movies = await response.json();
            const movieList = document.getElementById("movie-list");
            movieList.innerHTML = ''; // ลบเนื้อหาเก่าออก

            movies.forEach(movie => {
                const movieDiv = document.createElement("div");
                movieDiv.className = "movie-item";

                movieDiv.innerHTML = `
                    <img src="${movie.Poster_Link}" alt="${movie.Series_Title}">
                    <p>${movie.Series_Title}</p>
                `;
                movieList.appendChild(movieDiv);
            });
        } else {
            console.error("Failed to fetch movies.");
        }
    } catch (error) {
        console.error("Error loading movies:", error);
    }
}


// โหลดหนังใน Watchlist "Favorite" โดยค่าเริ่มต้น
document.addEventListener('DOMContentLoaded', () => {
    loadMovies();
});



function deleteList(listName) {
    delete movieData[listName]; // ลบข้อมูลหนังของลิสต์นั้น
    const listElement = document.querySelector(`.list-name[data-list-name="${listName}"]`);
    listElement.remove(); // ลบลิสต์ออกจากหน้า
    currentList = null; // รีเซ็ตลิสต์ปัจจุบัน
    clearMovieList(); // ล้างหน้าจอหนัง
}

function switchList(listName) {
    currentList = listName;
    loadMovies(listName);
    alert(`Switched to list: ${listName}`);

    const movieList = document.getElementById('movie-list');
    movieList.innerHTML = `
        <div class="movie-item add-new" onclick="addMovie()">
            <div class="movie-image">+</div>
        </div>
    `;

    // แสดงหนังที่มีอยู่แล้วในลิสต์
    movieData[currentList].forEach(movie => {
        addMovieToGrid(movie);
    });
}

function displayMovies(movies) {
    const movieListContainer = document.getElementById("movie-list");
    movieListContainer.innerHTML = ""; // ล้างเนื้อหาเก่า

    movies.forEach(movie => {
        const movieItem = document.createElement("div");
        movieItem.classList.add("movie-item");

        // เพิ่มรูปภาพและชื่อหนัง
        movieItem.innerHTML = `
            <img src="${movie.movieId.Poster_Link}" alt="${movie.movieId.Series_Title}">
            <p class="movie-name">${movie.movieId.Series_Title}</p>
        `;

        movieListContainer.appendChild(movieItem);
    });
}

function addMovie() {
    if (!currentList) {
        alert("Please create or select a list first!");
        return;
    }

    const movieName = prompt("Enter movie name:");
    if (movieName) {
        movieData[currentList].push(movieName);
        addMovieToGrid(movieName);
    }
}

function addMovieToGrid(movieName) {
    const movieGrid = document.getElementById('movie-list');
    
    const newMovie = document.createElement('div');
    newMovie.classList.add('movie-item');

    const movieImage = document.createElement('div');
    movieImage.classList.add('movie-image');
    movieImage.textContent = 'รูปภาพ\n282 x 435';

    const movieNameDiv = document.createElement('div');
    movieNameDiv.classList.add('movie-name');
    movieNameDiv.textContent = movieName;

    newMovie.appendChild(movieImage);
    newMovie.appendChild(movieNameDiv);

    // เพิ่มการเลือกหนัง
    newMovie.addEventListener('click', function() {
        selectMovie(newMovie, movieName);
    });

    movieGrid.insertBefore(newMovie, movieGrid.lastChild);
}

function selectMovie(movieElement, movieName) {
    if (selectedMovie) {
        selectedMovie.classList.remove('selected'); // ลบสีที่เคยเลือก
    }
    selectedMovie = movieElement;
    selectedMovie.classList.add('selected'); // เพิ่มสีให้กับหนังที่ถูกเลือก
    alert(`Selected movie: ${movieName}`);
}

function deleteSelectedMovie() {
    if (selectedMovie) {
        const movieName = selectedMovie.querySelector('.movie-name').textContent;
        movieData[currentList] = movieData[currentList].filter(movie => movie !== movieName); // ลบหนังออกจากข้อมูล
        selectedMovie.remove(); // ลบหนังออกจากหน้าจอ
        selectedMovie = null; // รีเซ็ตการเลือก
    } else {
        alert("Please select a movie to delete.");
    }
}

function updateMovies() {
    alert(`Movies in "${currentList}" updated successfully!`);
}

function goBack() {
    alert("Exited the current list.");
    currentList = null; // รีเซ็ตลิสต์ปัจจุบัน
    clearMovieList(); // ล้างรายการหนัง
}

function clearMovieList() {
    const movieList = document.getElementById('movie-list');
    movieList.innerHTML = `
        <div class="movie-item add-new" onclick="addMovie()">
            <div class="movie-image">+</div>
        </div>
    `;
}

async function loadWatchlist() {
    const username = localStorage.getItem('username');
    if (!username) {
        alert("Please login first!");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5001/watchlist/${username}/Favorite`);
        const movies = await response.json();

        const movieList = document.getElementById('movie-list');
        movieList.innerHTML = ''; // ล้างข้อมูลเก่า

        movies.forEach(movie => {
            addMovieToGrid(movie);
        });
    } catch (error) {
        console.error("Error loading Watchlist:", error);
    }
}


document.addEventListener('DOMContentLoaded', loadWatchlist);

function switchList(listName) {
    currentList = listName;
    const movieList = document.getElementById('movie-list');
    movieList.innerHTML = '';

    if (movieData[currentList] && movieData[currentList].length > 0) {
        movieData[currentList].forEach(movie => {
            addMovieToGrid(movie);
        });
    } else {
        alert(`No movies in "${listName}" list.`);
    }
}

function addMovieToGrid(movie) {
    const movieList = document.getElementById('movie-list');
    const movieDiv = document.createElement('div');
    movieDiv.classList.add('movie-item');

    // ตรวจสอบว่า `Poster_Link` มีค่าหรือไม่
    const poster = movie.Poster_Link
        ? `<img src="${movie.Poster_Link}" alt="${movie.Series_Title}" />`
        : `<div class="movie-placeholder">No Image Available</div>`;

    movieDiv.innerHTML = `
        ${poster}
        <p class="movie-name">${movie.Series_Title}</p>
    `;

    movieList.appendChild(movieDiv);
}


async function addToWatchlist(movieId) {
    const username = localStorage.getItem('username');
    if (!username) {
        alert("Please login first!");
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
            alert(result.message);
            loadWatchlist(); // โหลด Watchlist ใหม่
        } else {
            alert(result.message || "Failed to add movie to Watchlist.");
        }
    } catch (error) {
        console.error("Error adding to Watchlist:", error);
    }
}


