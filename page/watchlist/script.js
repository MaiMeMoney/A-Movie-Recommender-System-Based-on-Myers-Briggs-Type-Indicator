let movieData = {}; // เก็บข้อมูลหนังสำหรับแต่ละลิสต์
let selectedMovie = null; // หนังที่ถูกเลือกในลิสต์ปัจจุบัน
let currentList = 'Favorite'; // ค่าเริ่มต้น
let watchlists = { Favorite: [] }; // เก็บข้อมูล Watchlist


async function initializeWatchlist() {
    const username = localStorage.getItem("username");
    if (!username) {
        showToast("ไม่พบชื่อผู้ใช้ กรุณาเข้าสู่ระบบ", "error");
        return;
    }

    try {
        const response = await fetch('/watchlist/init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
        });

        if (response.ok) {
            console.log("Favorite Watchlist ถูกสร้างแล้ว");
        } else {
            console.error("ไม่สามารถสร้าง Favorite Watchlist ได้");
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
        showToast("กรุณากรอกชื่อรายการโปรดที่คุณต้องการก่อนสร้าง", "warning");
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
            showToast("สร้าง Watchlist สำเร็จ!", "success");
        } else {
            showToast(result.message || "ไม่สามารถสร้าง Watchlist ได้", "error");
        }
    } catch (error) {
        console.error("Error creating Watchlist:", error);
        showToast("เกิดข้อผิดพลาดในการสร้าง Watchlist", "error");
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
                    movieDiv.setAttribute('data-movie-id', movie._id); // เพิ่ม movieId ใน data attribute
                    movieDiv.innerHTML = `
                        <img src="${movie.Poster_Link || ''}" alt="${movie.Series_Title || 'No Title'}">
                        <p>${movie.Series_Title || 'No Title'}</p>
                    `;

                    // เพิ่ม Event Listener สำหรับคลิก
                    movieDiv.addEventListener('click', () => {
                        document.querySelectorAll('.movie-item.selected').forEach(item => {
                            item.classList.remove('selected');
                        });
                        movieDiv.classList.add('selected');
                        selectedMovie = movie; // อัปเดต selectedMovie
                    });

                    // เพิ่ม Event Listener สำหรับดับเบิ้ลคลิก
                    movieDiv.addEventListener('dblclick', () => {
                        const movieId = movieDiv.getAttribute('data-movie-id');
                        if (movieId) {
                            window.location.href = `/page/movie-details/movie-details.html?movieId=${movieId}`;
                        } else {
                            console.error("Movie ID not found for this movie.");
                            showToast("ไม่พบ Movie ID สำหรับหนังนี้", "error");
                        }
                    });

                    movieList.appendChild(movieDiv);
                });
            } else {
                showToast(`ไม่มีหนังใน "${listName}"`, "info");
            }
        })
        .catch(error => {
            console.error("Error loading movies:", error);
            showToast("เกิดข้อผิดพลาดในการโหลดหนัง", "error");
        });
}


// โหลดหนังใน Watchlist "Favorite" โดยค่าเริ่มต้น
document.addEventListener('DOMContentLoaded', () => {
    initializeWatchlist(); // สร้าง Favorite Watchlist ถ้ายังไม่มี
    initializeRightClickDelete(); // เพิ่มคลิกขวาสำหรับลบลิสต์
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
            showToast(`ไม่มีหนังในลิสต์ "${listName}"`, "error");
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
    showToast(`สลับไปยังลิสต์: ${listName}`, "success");
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
        showToast("กรุณาสร้างหรือเลือก Watchlist ก่อน!", "error");
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
        showToast("กรุณาเลือกหนังที่ต้องการลบ", "error");
        return;
    }

    const currentList = getCurrentList(); // ดึงชื่อ Watchlist ปัจจุบัน
    if (!currentList) {
        showToast("กรุณาเลือก Watchlist ก่อน", "error");
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:5001/watchlist/delete-movie', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: localStorage.getItem('username') || 'default_user', // ใช้ username จาก Local Storage
                listName: currentList,
                movieId: selectedMovie._id, // ใช้ `_id` แทน Movie_ID
            }),
        });

        const result = await response.json();
        if (response.ok) {
            showToast(result.message || "ลบหนังสำเร็จ", "success");
            loadMovies(currentList); // โหลดหนังใหม่ในลิสต์
            selectedMovie = null; // รีเซ็ตหนังที่เลือก
        } else {
            showToast(result.message || "ไม่สามารถลบหนังได้", "error");
        }
    } catch (error) {
        console.error("Error deleting movie:", error);
        showToast("เกิดข้อผิดพลาดระหว่างการลบหนัง", "error");
    }
}

function updateMovies() {
    openMovieSelectionModal(); // เปิด Modal เมื่อกด Update
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
        showToast("กรุณาเข้าสู่ระบบก่อน!", "error");
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


// ฟังก์ชันดึง Movie ID จาก URL
function getMovieIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('movieId');
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
        showToast(`ไม่มีหนังในลิสต์ "${listName}"`, "error");
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
        showToast("กรุณาเข้าสู่ระบบก่อน!", "error");
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
            showToast(result.message || "เพิ่มหนังใน Watchlist สำเร็จ", "success");
            loadWatchlist(); // โหลด Watchlist ใหม่
        } else {
            showToast(result.message || "ไม่สามารถเพิ่มหนังได้", "error");
        }
    } catch (error) {
        console.error("Error adding to Watchlist:", error);
        showToast("เกิดข้อผิดพลาดระหว่างการเพิ่มหนัง", "error");
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
            showToast(result.message, "success");
            loadMovies('Favorite'); // โหลดหนังใหม่ใน Favorite
        } else {
            showToast(result.message || "Failed to add movie to Watchlist.", "error");
        }
    } catch (error) {
        console.error("Error adding to Favorite Watchlist:", error);
        showToast("Error occurred while adding to Favorite Watchlist.", "error");
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

// เปิด Modal และโหลดหนังทั้งหมด
async function openMovieSelectionModal() {
    const modal = document.getElementById('movie-selection-modal');
    const container = document.getElementById('movie-scroll-container');
    container.innerHTML = ''; // Clear previous movies

    try {
        const response = await fetch('http://127.0.0.1:5001/movies_list/all');
        const movies = await response.json();

        movies.forEach(movie => {
            const movieDiv = document.createElement('div');
            movieDiv.className = 'movie-item';
            movieDiv.setAttribute('data-category', movie.Genre?.toLowerCase() || 'unknown');
            movieDiv.setAttribute('data-actors', `${movie.Star1}, ${movie.Star2}, ${movie.Star3}, ${movie.Star4}`);

            movieDiv.innerHTML = `
                <img src="${movie.Poster_Link || 'placeholder.jpg'}" alt="${movie.Series_Title}" />
                <p>${movie.Series_Title}</p>
            `;
            movieDiv.onclick = () => addMovieToCurrentList(movie._id, movie.Series_Title);
            container.appendChild(movieDiv);
        });

        modal.style.display = 'flex'; // Show modal
    } catch (error) {
        console.error("Error fetching movies:", error);
    }
}

// ปิด Modal
function closeModal() {
    const modal = document.getElementById('movie-selection-modal');
    modal.style.display = 'none';
}

// เพิ่มหนังในลิสต์ปัจจุบัน
async function addMovieToCurrentList(movieId, movieName) {
    if (!currentList) {
        showToast("กรุณาเลือก Watchlist ก่อน!", "error");
        return;
    }

    const username = localStorage.getItem("username") || "default_user";

    try {
        const response = await fetch('http://127.0.0.1:5001/watchlist/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, listName: currentList, movieId }),
        });

        if (response.ok) {
            showToast(`เพิ่มหนัง "${movieName}" สำเร็จในลิสต์ "${currentList}"`, "success");
            loadMovies(currentList); // โหลดหนังในลิสต์
            closeModal(); // ปิด Modal
        } else {
            const result = await response.json();
            showToast(result.message || "ไม่สามารถเพิ่มหนังได้", "error");
        }
    } catch (error) {
        console.error("Error adding movie:", error);
        showToast("เกิดข้อผิดพลาดระหว่างการเพิ่มหนัง", "error");
    }
}

function filterByCategory() {
    const selectedCategory = document.getElementById('category-filter').value.toLowerCase();
    const movieItems = document.querySelectorAll('.movie-item');

    movieItems.forEach(item => {
        const category = item.getAttribute('data-category') || '';
        if (selectedCategory === 'all' || category.includes(selectedCategory)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function searchMovies() {
    const searchTerm = document.getElementById('movie-search').value.toLowerCase();
    const movieItems = document.querySelectorAll('.movie-item');

    movieItems.forEach(item => {
        const title = item.querySelector('p').textContent.toLowerCase();
        const actors = item.getAttribute('data-actors')?.toLowerCase() || '';

        if (title.includes(searchTerm) || actors.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

movies.forEach(movie => {
    const movieDiv = document.createElement('div');
    movieDiv.className = 'movie-item';
    movieDiv.setAttribute('data-category', movie.Genre?.toLowerCase() || 'unknown');
    movieDiv.setAttribute('data-actors', `${movie.Star1}, ${movie.Star2}, ${movie.Star3}, ${movie.Star4}`);

    movieDiv.innerHTML = `
        <img src="${movie.Poster_Link || 'placeholder.jpg'}" alt="${movie.Series_Title}" />
        <p>${movie.Series_Title}</p>
    `;
    movieDiv.onclick = () => addMovieToCurrentList(movie._id, movie.Series_Title);
    container.appendChild(movieDiv);
});

function initializeRightClickDelete() {
    const listContainer = document.getElementById("list-container");

    listContainer.addEventListener("contextmenu", (event) => {
        event.preventDefault();

        const target = event.target;
        if (target.classList.contains("list-item")) {
            const listName = target.textContent;

            if (listName === "Favorite") {
                showToast("ไม่สามารถลบ Favorite ได้", "error");
                return;
            }

            if (confirm(`คุณต้องการลบ Watchlist "${listName}" หรือไม่?`)) {
                deleteWatchlist(listName, target);
            }
        }
    });
}

async function deleteWatchlist(listName, listElement) {
    const username = localStorage.getItem("username") || "default_user";

    try {
        const response = await fetch(`http://127.0.0.1:5001/watchlist/delete/${listName}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username }), // ส่ง username ใน body
        });

        if (response.ok) {
            listElement.remove();
            showToast(`ลบ Watchlist "${listName}" สำเร็จ`, "success");
        } else {
            const result = await response.json();
            showToast(result.message || "ไม่สามารถลบ Watchlist ได้", "error");
        }
    } catch (error) {
        console.error("Error deleting Watchlist:", error);
        showToast("เกิดข้อผิดพลาดระหว่างการลบ Watchlist", "error");
    }
}

function showToast(message, type) {
    // ลบ toast เดิมถ้ามีอยู่
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    // สร้าง toast ใหม่
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    // เพิ่ม toast ใน body
    document.body.appendChild(toast);

    // ตั้ง timeout เพื่อซ่อน toast
    setTimeout(() => {
        toast.classList.add("hide");
        toast.addEventListener("transitionend", () => {
            if (toast.parentNode) {
                toast.remove(); // ลบ toast ออกจาก DOM
            }
        });
    }, 3000); // Toast จะแสดงผล 3 วินาที
}

