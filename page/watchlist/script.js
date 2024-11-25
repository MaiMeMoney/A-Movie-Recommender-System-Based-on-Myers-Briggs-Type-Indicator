let movieData = {}; // เก็บข้อมูลหนังสำหรับแต่ละลิสต์
let selectedMovie = null; // หนังที่ถูกเลือกในลิสต์ปัจจุบัน
let currentList = 'Favorite'; // ค่าเริ่มต้น
let watchlists = { Favorite: [] }; // เก็บข้อมูล Watchlist


async function initializeWatchlist() {
    const username = localStorage.getItem("username");
    if (!username) {
        alert("Username not found! Please log in.");
        return;
    }

    try {
        const response = await fetch('/watchlist/init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
        });

        if (response.ok) {
            console.log("Favorite Watchlist initialized.");
        } else {
            console.error("Failed to initialize Favorite Watchlist.");
        }
    } catch (error) {
        console.error("Error initializing Favorite Watchlist:", error);
    }
}


// สร้าง Watchlist ใหม่แบบ Dynamic
async function createList() {
    const listName = document.getElementById('new-list-name').value.trim();
    const username = localStorage.getItem("username") || "default_user";

    if (!listName) {
        alert("Please enter a list name.");
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:5001/watchlist/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, listName }),
        });

        const result = await response.json();
        if (response.ok) {
            // เพิ่มลิสต์ใหม่ใน Sidebar
            addWatchlistToSidebar(listName);
            alert("Watchlist created successfully!");
        } else {
            alert(result.message || "Failed to create Watchlist.");
        }
    } catch (error) {
        console.error("Error creating Watchlist:", error);
    }
}

function addWatchlistToSidebar(listName) {
    const listContainer = document.getElementById("list-container");

    const newListItem = document.createElement("button");
    newListItem.className = "list-item";
    newListItem.textContent = listName;
    newListItem.onclick = () => switchList(listName);

    // เพิ่มลิสต์ใหม่ถัดจาก Favorite
    const favoriteButton = listContainer.querySelector(".favorite-button");
    listContainer.insertBefore(newListItem, favoriteButton.nextSibling);
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

function loadMovies(listName = 'Favorite') {
    const username = localStorage.getItem("username") || "default_user";

    fetch(`http://127.0.0.1:5001/watchlist/${username}/${listName}`)
        .then(response => response.json())
        .then(movies => {
            const movieList = document.getElementById("movie-list");
            movieList.innerHTML = '';

            if (movies.length > 0) {
                movies.forEach(movie => {
                    const movieDiv = document.createElement("div");
                    movieDiv.className = "movie-item";
                    movieDiv.innerHTML = `
                        <img src="${movie.Poster_Link || ''}" alt="${movie.Series_Title || 'No Title'}">
                        <p>${movie.Series_Title || 'No Title'}</p>
                    `;
                    // เพิ่ม event listener เพื่อเลือกหนัง
                    movieDiv.addEventListener('click', () => {
                        // ลบการเลือกทั้งหมดก่อนหน้า
                        document.querySelectorAll('.movie-item.selected').forEach(item => {
                            item.classList.remove('selected');
                        });
                        // เพิ่ม class 'selected' ให้หนังที่ถูกเลือก
                        movieDiv.classList.add('selected');
                        selectedMovie = movie; // เก็บข้อมูลหนังที่ถูกเลือก
                    });
                    movieList.appendChild(movieDiv);
                });
            } else {
                alert(`No movies in "${listName}" list.`);
            }
        })
        .catch(error => console.error("Error loading movies:", error));
}



// โหลดหนังใน Watchlist "Favorite" โดยค่าเริ่มต้น
document.addEventListener('DOMContentLoaded', () => {
    initializeWatchlist(); // สร้าง Favorite Watchlist ถ้ายังไม่มี
    loadWatchlists(); // โหลด Watchlist ทั้งหมด
    loadMovies('Favorite'); // โหลดหนังใน Favorite
});

async function loadWatchlists() {
    const username = localStorage.getItem("username") || "default_user";
    try {
        const response = await fetch(`http://127.0.0.1:5001/watchlist/all/${username}`);
        const watchlists = await response.json();
        const listContainer = document.getElementById("list-container");

        // ลบลิสต์เก่าทั้งหมดก่อนโหลดใหม่
        listContainer.innerHTML = '';

        // เพิ่มลิสต์ใหม่
        watchlists.forEach(list => {
            const button = document.createElement('button');
            button.className = 'list-item';
            button.textContent = list.listName;
            button.onclick = () => {
                setCurrentList(list.listName);
                loadMovies(list.listName);
            };
            listContainer.appendChild(button);
        });
    } catch (error) {
        console.error("Error loading Watchlists:", error);
    }
}



document.addEventListener('DOMContentLoaded', () => {
    loadWatchlists(); // โหลด Watchlist ทั้งหมด
    loadMovies('Favorite'); // โหลดหนังใน Favorite
});

async function loadWatchlist(listName) {
    const username = localStorage.getItem("username") || "default_user";

    try {
        const response = await fetch(`http://127.0.0.1:5001/watchlist/${username}/${listName}`);
        const movies = await response.json();

        const movieList = document.getElementById('movie-list');
        movieList.innerHTML = ''; // เคลียร์รายการเก่า

        if (movies.length === 0) {
            alert(`No movies in "${listName}" list.`);
            return;
        }

        movies.forEach(movie => {
            const movieItem = document.createElement('div');
            movieItem.className = 'movie-item';
            movieItem.innerHTML = `
                <img src="${movie.Poster_Link}" alt="${movie.Series_Title}">
                <div class="movie-name">${movie.Series_Title}</div>
            `;
            movieList.appendChild(movieItem);
        });
    } catch (error) {
        console.error("Error loading Watchlist:", error);
    }
}

window.onload = () => {
    const username = localStorage.getItem('username') || 'default_user';
    loadWatchlists(username); // โหลดลิสต์ทั้งหมดของผู้ใช้
    setCurrentList('Favorite'); // ตั้งค่าเริ่มต้นให้เป็น Favorite
    loadMovies('Favorite'); // โหลดหนังในลิสต์ Favorite
};

function addWatchlistToSidebar(listName) {
    const listContainer = document.getElementById("list-container");

    // ตรวจสอบว่า Watchlist นี้มีอยู่แล้วหรือไม่
    if (listContainer.querySelector(`button[data-name="${listName}"]`)) return;

    const newListItem = document.createElement("button");
    newListItem.className = "list-item";
    newListItem.textContent = listName;
    newListItem.setAttribute("data-name", listName);
    newListItem.onclick = () => switchList(listName);

    listContainer.appendChild(newListItem);
}

function deleteList(listName) {
    delete movieData[listName]; // ลบข้อมูลหนังของลิสต์นั้น
    const listElement = document.querySelector(`.list-name[data-list-name="${listName}"]`);
    listElement.remove(); // ลบลิสต์ออกจากหน้า
    currentList = null; // รีเซ็ตลิสต์ปัจจุบัน
    clearMovieList(); // ล้างหน้าจอหนัง
}

function switchList(listName) {
    currentList = listName; // ตั้ง Watchlist ปัจจุบัน
    loadMovies(listName); // โหลดหนังใน Watchlist
    alert(`Switched to list: ${listName}`);
}


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

function addMovieToGrid(movie) {
    const movieList = document.getElementById('movie-list');
    const movieDiv = document.createElement('div');
    movieDiv.classList.add('movie-item');

    const poster = movie.Poster_Link
        ? `<img src="${movie.Poster_Link}" alt="${movie.Series_Title}" />`
        : `<div class="movie-placeholder">No Image Available</div>`;

    movieDiv.innerHTML = `
        ${poster}
        <p class="movie-name">${movie.Series_Title}</p>
    `;

    // เพิ่มฟังก์ชันคลิกเพื่อเลือกหนัง
    movieDiv.addEventListener('click', () => {
        // ยกเลิกการเลือกหนังอื่น
        document.querySelectorAll('.movie-item.selected').forEach(item => {
            item.classList.remove('selected');
        });
        // เลือกหนังปัจจุบัน
        movieDiv.classList.add('selected');
        selectedMovie = movie; // อัปเดตหนังที่ถูกเลือก
    });

    movieList.appendChild(movieDiv);
}

// ฟังก์ชันสำหรับการเลือกหนัง
function selectMovie(movieId, element) {
    const selectedMovie = document.querySelector(".movie-item.selected");
    if (selectedMovie) {
        selectedMovie.classList.remove("selected");
    }
    element.classList.add("selected");
}

function renderMovies(movies) {
    const movieListContainer = document.getElementById("movie-list");
    movieListContainer.innerHTML = ""; // Clear existing movies

    movies.forEach((movie) => {
        const movieItem = document.createElement("div");
        movieItem.classList.add("movie-item");
        movieItem.setAttribute("data-movie-id", movie._id); // Assign movieId
        movieItem.onclick = () => selectMovie(movie._id, movieItem);

        movieItem.innerHTML = `
            <img src="${movie.Poster_Link}" alt="Movie Poster">
            <p>${movie.Series_Title}</p>
        `;
        movieListContainer.appendChild(movieItem);
    });
}


async function deleteSelectedMovie() {
    if (!selectedMovie) {
        alert("Please select a movie to delete.");
        return;
    }

    const currentList = getCurrentList(); // ดึงชื่อ Watchlist ปัจจุบัน
    if (!currentList) {
        alert("Please select a list.");
        return;
    }

    try {
        console.log("Deleting Movie:", selectedMovie); // Debugging: แสดงข้อมูลหนังที่เลือก
        const response = await fetch('http://127.0.0.1:5001/watchlist/delete-movie', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: localStorage.getItem('username') || 'default_user', // ดึง username
                listName: currentList,
                movieId: selectedMovie.Movie_ID, // ใช้ Movie_ID ของหนังที่เลือก
            }),
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message || "Movie deleted successfully.");
            loadMovies(currentList); // โหลดหนังใหม่ในลิสต์
            selectedMovie = null; // รีเซ็ตค่า selectedMovie
        } else {
            alert(result.message || "Failed to delete movie.");
        }
    } catch (error) {
        console.error("Error deleting movie:", error);
        alert("An error occurred while deleting the movie.");
    }
}

async function updateMovies() {
    if (!selectedMovie) {
        alert("กรุณาเลือกหนังก่อนทำการแก้ไข");
        return;
    }

    const movieId = selectedMovie.Movie_ID; // ID ของหนังที่ถูกเลือก
    const newTitle = prompt("กรุณาใส่ชื่อใหม่ของหนัง:", selectedMovie.Series_Title);

    if (!newTitle) return;

    try {
        const response = await fetch(`http://127.0.0.1:5001/movie/update`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ movieId, newTitle }),
        });

        if (response.ok) {
            alert("แก้ไขหนังสำเร็จ!");
            loadMovies(currentList); // โหลดหนังใหม่ในลิสต์
        } else {
            alert("ไม่สามารถแก้ไขหนังได้");
        }
    } catch (error) {
        console.error("Error updating movie:", error);
    }
}


function goBack() {
    window.location.href = "../main_page/mainpage.html"; // กลับไปหน้าหลัก
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

async function addToFavorite(movieId) {
    const username = localStorage.getItem("username") || "default_user";

    try {
        const response = await fetch('http://127.0.0.1:5001/watchlist/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, movieId }),
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            loadMovies('Favorite'); // โหลดหนังใหม่ใน Favorite
        } else {
            alert(result.message || "Failed to add movie to Watchlist.");
        }
    } catch (error) {
        console.error("Error adding to Favorite Watchlist:", error);
    }
}

function getCurrentList() {
    const selectedList = localStorage.getItem('currentList'); // ดึงชื่อ Watchlist ที่เลือกจาก Local Storage
    return selectedList;
}

// ตั้งค่าชื่อ Watchlist ที่เลือกเมื่อคลิกปุ่ม
function setCurrentList(listName) {
    currentList = listName;
    console.log(`Current list set to: ${currentList}`);
}

function getCurrentList() {
    return currentList || null;
}

function updateMovies() {
    const selectedList = getCurrentList();
    if (!selectedList) return alert("Please select a list.");
    alert(`Update movies in ${selectedList}`);
}

function deleteSelectedMovie() {
    const selectedList = getCurrentList();
    if (!selectedList) return alert("Please select a list.");
    alert(`Delete selected movie from ${selectedList}`);
}

