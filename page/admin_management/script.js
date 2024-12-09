let selectedMovieId = null; // ใช้เก็บ movieId ที่เลือก

// ฟังก์ชัน fetchMovies สำหรับดึงข้อมูลหนังจาก API
async function fetchMovies() {
    try {
        const response = await fetch('http://localhost:5001/movies_list/all');
        const movies = await response.json();
        const rightContent = document.querySelector('.right-content');
        rightContent.innerHTML = '';  // ล้างเนื้อหาเดิม

        if (movies.length > 0) {
            movies.forEach(movie => {
                const moviePoster = document.createElement('div');
                moviePoster.classList.add('movie-poster');
                moviePoster.setAttribute('data-movie-id', movie._id);  // เก็บ movieId ใน attribute
                moviePoster.innerHTML = `
                    <img src="${movie.Poster_Link}" alt="${movie.Series_Title}">
                    <div class="movie-title">${movie.Series_Title}</div>
                `;
                rightContent.appendChild(moviePoster);
            });
        } else {
            rightContent.innerHTML = '<p>No movies found.</p>';
        }
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}

// เรียกใช้ฟังก์ชันนี้เมื่อหน้าโหลด
document.addEventListener('DOMContentLoaded', fetchMovies);

// ดักจับปุ่ม Add Movie
const addMovieButton = document.getElementById('add-movie-button');
const addMovieModal = document.getElementById('addMovieModal');
const closeModal = document.getElementById('close-modal');
const addMovieForm = document.getElementById('add-movie-form');

// เปิด Modal เมื่อคลิกที่ปุ่ม Add Movie
addMovieButton.addEventListener('click', () => {
    addMovieModal.style.display = 'block';  // แสดง Modal
});

// ปิด Modal เมื่อคลิกที่ปุ่มปิด (X)
closeModal.addEventListener('click', () => {
    addMovieModal.style.display = 'none';  // ซ่อน Modal
});

// ปิด Modal เมื่อคลิกที่นอก Modal
window.addEventListener('click', (event) => {
    if (event.target === addMovieModal) {
        addMovieModal.style.display = 'none';
    }
});

// ฟังก์ชันเพิ่มหนังใหม่
addMovieForm.addEventListener('submit', async (event) => {
    event.preventDefault();  // ป้องกันการรีเฟรชหน้า

    // รับค่าจากฟอร์ม
    const posterLink = document.getElementById('poster-link').value;
    const seriesTitle = document.getElementById('series-title').value;
    const releasedYear = document.getElementById('released-year').value;

    // const certificate = document.getElementById('certificate').value;
    const runtime = document.getElementById('runtime').value;


    const imdbRating = parseFloat(document.getElementById('imdb-rating').value); // รับค่าทศนิยม
    const genre = document.getElementById('genre').value;
    const overview = document.getElementById('overview').value;
    const metaScore = document.getElementById('meta-score').value;
    const director = document.getElementById('director').value;
    const star1 = document.getElementById('star1').value;
    // const star2 = document.getElementById('star2').value;
    // const star3 = document.getElementById('star3').value;
    // const star4 = document.getElementById('star4').value;
    const gross = document.getElementById('gross').value;
    const linkMovies = document.getElementById('link-movies').value;

    // ตรวจสอบว่าค่าบางตัวที่จำเป็นถูกกรอกหรือไม่
    if (!posterLink || !seriesTitle || !releasedYear || isNaN(imdbRating) || !genre || !overview) {
        alert('Please fill out all fields!');
        return;
    }

    // ข้อมูลที่จะส่งไปยัง API
    const movieData = {
        posterLink,
        seriesTitle,
        releasedYear,
        certificate,
        runtime,
        imdbRating,
        genre,
        overview,
        metaScore,
        director,
        star1,
        gross,
        linkMovies
    };

    // ส่งข้อมูลไปยัง API
    try {
        const response = await fetch('http://localhost:5001/api/add-movie', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(movieData),
        });

        const result = await response.json();
        if (response.ok) {
            alert('Movie added successfully!');
            fetchMovies(); // อัปเดตหน้าใหม่หลังจากเพิ่มหนังเสร็จ
            addMovieModal.style.display = 'none';  // ซ่อน Modal
        } else {
            alert(result.message || 'Failed to add movie');
        }
    } catch (error) {
        console.error('Error adding movie:', error);
        alert('Error adding movie');
    }
});

// เมื่อคลิกที่โปสเตอร์หนัง
document.querySelector('.right-content').addEventListener('click', (event) => {
    const moviePoster = event.target.closest('.movie-poster');
    
    // หากมีการเลือกโปสเตอร์หนัง
    if (moviePoster) {
        // ถ้ามีการเลือกโปสเตอร์แล้ว
        if (selectedMovieId === moviePoster.getAttribute('data-movie-id')) {
            // ถ้าเลือกโปสเตอร์เดียวกันอีกครั้ง ให้ยกเลิกการเลือก
            selectedMovieId = null;
            moviePoster.classList.remove('selected');  // ลบ class selected
        } else {
            // เลือกโปสเตอร์ใหม่
            selectedMovieId = moviePoster.getAttribute('data-movie-id');
            // เพิ่ม class selected ให้กับโปสเตอร์ที่เลือก
            document.querySelectorAll('.movie-poster').forEach(poster => {
                poster.classList.remove('selected');  // ลบ class selected จากโปสเตอร์ทุกตัว
            });
            moviePoster.classList.add('selected');  // เพิ่ม class selected ให้กับโปสเตอร์ที่ถูกเลือก
        }
    }
});

// ฟังก์ชันเปิด Modal สำหรับ Update
const updateMovieModal = document.getElementById('updateMovieModal');
const closeUpdateModal = document.getElementById('close-update-modal');
const updateMovieForm = document.getElementById('update-movie-form');

// เมื่อคลิกที่ปุ่ม Update
const updateMovieButton = document.getElementById('update-movie-button');
updateMovieButton.addEventListener('click', () => {
    if (!selectedMovieId) {
        // ใช้ showToastNotification แทน showNotification
        showToastNotification('Please select a movie to update', 'error'); // แจ้งเตือนเป็น error
        return;
    }
    openUpdateModal(selectedMovieId); // เปิด Modal สำหรับการอัปเดต
});

// ฟังก์ชันเปิด Modal สำหรับการอัปเดต
function openUpdateModal(movieId) {
    fetch(`http://localhost:5001/movies_list/movies/${movieId}`)
        .then(response => response.json())
        .then(movie => {
            document.getElementById('update-poster-link').value = movie.Poster_Link;
            document.getElementById('update-series-title').value = movie.Series_Title;
            document.getElementById('update-released-year').value = movie.Released_Year;

            // document.getElementById('update-certificate').value = movie.Certificate;
            document.getElementById('update-runtime').value = movie.Runtime;


            document.getElementById('update-imdb-rating').value = movie.IMDB_Rating;
            document.getElementById('update-genre').value = movie.Genre;
            document.getElementById('update-overview').value = movie.Overview;
            document.getElementById('update-meta-score').value = movie.Meta_score;
            document.getElementById('update-director').value = movie.Director;
            document.getElementById('update-star1').value = movie.Star1;
            // document.getElementById('update-star2').value = movie.Star2;
            // document.getElementById('update-star3').value = movie.Star3;
            // document.getElementById('update-star4').value = movie.Star4;
            document.getElementById('update-gross').value = movie.Gross;
            document.getElementById('update-link-movies').value = movie.link_movies;
        })
        .catch(error => console.error('Error fetching movie:', error));

    updateMovieModal.style.display = 'block';  // เปิด Modal
}

// ปิด Modal เมื่อคลิกปุ่ม Close
closeUpdateModal.onclick = function() {
    updateMovieModal.style.display = 'none'; // ซ่อน Modal
}

// ปิด Modal เมื่อคลิกนอก Modal
window.onclick = function(event) {
    if (event.target === updateMovieModal) {
        updateMovieModal.style.display = 'none'; // ซ่อน Modal
    }
}

// ฟังก์ชันสำหรับอัปเดตหนัง
updateMovieForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const updatedMovieData = {
        posterLink: document.getElementById('update-poster-link').value,
        seriesTitle: document.getElementById('update-series-title').value,
        releasedYear: document.getElementById('update-released-year').value,
        // certificate: document.getElementById('update-certificate').value,
        runtime: document.getElementById('update-runtime').value,
        imdbRating: parseFloat(document.getElementById('update-imdb-rating').value),
        genre: document.getElementById('update-genre').value,
        overview: document.getElementById('update-overview').value,
        metaScore: document.getElementById('update-meta-score').value,
        director: document.getElementById('update-director').value,
        star1: document.getElementById('update-star1').value,
        // star2: document.getElementById('update-star2').value,
        // star3: document.getElementById('update-star3').value,
        // star4: document.getElementById('update-star4').value,
        gross: document.getElementById('update-gross').value,
        linkMovies: document.getElementById('update-link-movies').value
    };

    fetch(`http://localhost:5001/api/update-movie/${selectedMovieId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedMovieData)
    })
    .then(response => response.json())
    .then(result => {
        alert(result.message);
        updateMovieModal.style.display = 'none';  // ปิด Modal
        fetchMovies(); // รีเฟรชหนังที่แสดง
    })
    .catch(error => {
        console.error('Error updating movie:', error);
    });
});



document.querySelector('.right-content').addEventListener('click', (event) => {
    const moviePoster = event.target.closest('.movie-poster');
    if (moviePoster) {
        selectedMovieId = moviePoster.getAttribute('data-movie-id');  // เก็บ movieId
    }
});

// ฟังก์ชันเปิด Modal สำหรับการยืนยันการลบ
const deleteMovieModal = document.getElementById('deleteMovieModal');
const closeDeleteModal = document.getElementById('close-delete-modal');
const cancelDeleteButton = document.getElementById('cancel-delete-button');
const confirmDeleteButton = document.getElementById('confirm-delete-button');

// เมื่อคลิกที่ปุ่ม Delete
const deleteMovieButton = document.getElementById('delete-movie-button');
deleteMovieButton.addEventListener('click', () => {
    // เปิด Modal เพื่อยืนยันการลบ
    deleteMovieModal.style.display = 'block';
});

// ฟังก์ชันยืนยันการลบ
confirmDeleteButton.addEventListener('click', async () => {
    if (!selectedMovieId) {
        alert('Please select a movie to delete.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:5001/api/delete-movie/${selectedMovieId}`, {
            method: 'DELETE'
        });
        const result = await response.json();

        if (response.ok) {
            alert(result.message); // แสดงข้อความเมื่อลบหนังสำเร็จ
            fetchMovies(); // รีเฟรชหนังที่แสดง
            deleteMovieModal.style.display = 'none'; // ซ่อน Modal
        } else {
            alert(result.message || 'Failed to delete movie');
        }
    } catch (error) {
        console.error('Error deleting movie:', error);
        alert('Error deleting movie');
    }
});

// ฟังก์ชันสำหรับการปิด Modal
function hideModal() {
    deleteMovieModal.style.display = 'none';
}

// เมื่อคลิกที่ปุ่ม Cancel
cancelDeleteButton.addEventListener('click', hideModal);

// เมื่อคลิกที่ปุ่มปิด (X)
closeDeleteModal.addEventListener('click', hideModal);

// ปิด Modal เมื่อคลิกภายนอก Modal
window.addEventListener('click', function(event) {
    if (event.target === deleteMovieModal) {
        hideModal();
    }
});


// ฟังก์ชันค้นหาหนังจากคำค้นหาของผู้ใช้
async function searchMovies(query) {
    const category = 'title'; // กำหนดให้ค้นหาจากชื่อเรื่อง (สามารถเปลี่ยนเป็น genre หรือ actor ได้)
    
    // ส่งคำค้นหาไปยัง API
    try {
        const response = await fetch(`http://localhost:5001/api/search?category=${category}&query=${query}`);
        const movies = await response.json();

        const rightContent = document.querySelector('.right-content');
        rightContent.innerHTML = '';  // ล้างผลการค้นหาก่อนหน้า

        if (movies.length > 0) {
            movies.forEach(movie => {
                const moviePoster = document.createElement('div');
                moviePoster.classList.add('movie-poster');
                moviePoster.setAttribute('data-movie-id', movie._id);  // เก็บ movieId ใน attribute
                moviePoster.innerHTML = `
                    <img src="${movie.Poster_Link}" alt="${movie.Series_Title}">
                    <div class="movie-title">${movie.Series_Title}</div>
                `;
                rightContent.appendChild(moviePoster);
            });
        } else {
            rightContent.innerHTML = '<p>No movies found.</p>';
        }
    } catch (error) {
        console.error('Error searching movies:', error);
    }
}

// เพิ่ม event listener สำหรับช่องค้นหาหนัง
document.getElementById('search-button').addEventListener('click', () => {
    const searchInput = document.getElementById('search-input').value;
    if (searchInput) {
        searchMovies(searchInput); // เรียกฟังก์ชันค้นหา
    } else {
        fetchMovies(); // ถ้าคำค้นหาเป็นค่าว่าง ให้แสดงหนังทั้งหมด
    }
});

document.getElementById('search-button').addEventListener('click', function() {
    const searchTerm = document.getElementById('search-input').value.trim();
    
    if (searchTerm) {
        // ส่งคำค้นหาไปที่ backend โดยใช้ fetch API
        fetch(`/api/search-movies?query=${encodeURIComponent(searchTerm)}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // แสดงผลลัพธ์ที่ได้รับ
                    displayMovies(data.movies);
                } else {
                    alert('ไม่พบหนังตามคำค้นหา');
                }
            })
            .catch(error => console.error('Error:', error));
    } else {
        alert('กรุณากรอกคำค้นหา');
    }
});

// ฟังก์ชันในการแสดงผลลัพธ์หนัง
function displayMovies(movies) {
    const rightContent = document.querySelector('.right-content');
    rightContent.innerHTML = ''; // ล้างผลลัพธ์เดิม

    movies.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.classList.add('movie-poster');
        movieElement.innerHTML = `
            <img src="${movie.poster}" alt="${movie.title}" />
            <h3>${movie.title}</h3>
        `;
        rightContent.appendChild(movieElement);
    });
}

// เปิด Modal เมื่อคลิกที่ปุ่ม Create Movie List
const createGenreButton = document.getElementById('create-genre-button');
const createGenreModal = document.getElementById('createGenreModal');
const closeCreateGenreModal = document.getElementById('close-create-genre');
const createGenreForm = document.getElementById('create-genre-form');
const genreListContainer = document.querySelector('.genre-list ul');

// เปิด Modal เมื่อคลิกที่ปุ่ม Create Movie List
createGenreButton.addEventListener('click', () => {
    createGenreModal.style.display = 'block';
});

// ปิด Modal เมื่อคลิกที่ปุ่ม Close
closeCreateGenreModal.addEventListener('click', () => {
    createGenreModal.style.display = 'none';
});

// ปิด Modal เมื่อคลิกนอก Modal
window.addEventListener('click', (event) => {
    if (event.target === createGenreModal) {
        createGenreModal.style.display = 'none';
    }
});

// ฟังก์ชันสร้าง Movie List ใหม่
createGenreForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const genreName = document.getElementById('genre-name').value.trim();

    if (genreName) {
        // เพิ่ม genre ที่สร้างขึ้นใหม่ใน sidebar
        const genreItem = document.createElement('li');
        genreItem.textContent = genreName;
        genreItem.classList.add('genre-item'); // เพิ่ม class
        genreItem.style.color = "#FF5733"; // ตั้งสีที่ต้องการ เช่น สีส้ม
        genreItem.addEventListener('click', () => showMoviesByGenre(genreName));
        genreListContainer.appendChild(genreItem);

        // ซ่อน Modal
        createGenreModal.style.display = 'none';

        // ล้างฟอร์ม
        document.getElementById('genre-name').value = '';
    }
});



// ฟังก์ชันแสดงหนังตาม genre ที่เลือก
async function showMoviesByGenre(genre) {
    try {
        const response = await fetch(`http://localhost:5001/api/search?category=genre&query=${genre}`);
        const movies = await response.json();
        const rightContent = document.querySelector('.right-content');
        rightContent.innerHTML = '';  // ล้างเนื้อหาหนังก่อน

        if (movies.length > 0) {
            movies.forEach(movie => {
                const moviePoster = document.createElement('div');
                moviePoster.classList.add('movie-poster');
                moviePoster.setAttribute('data-movie-id', movie._id);  // เก็บ movieId ใน attribute
                moviePoster.innerHTML = `
                    <img src="${movie.Poster_Link}" alt="${movie.Series_Title}">
                    <div class="movie-title">${movie.Series_Title}</div>
                `;
                rightContent.appendChild(moviePoster);
            });
        } else {
            rightContent.innerHTML = '<p>No movies found in this genre.</p>';
        }
    } catch (error) {
        console.error('Error fetching movies by genre:', error);
    }
}

// ฟังก์ชันสำหรับการแสดง Notification
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    
    // กำหนดข้อความใน Notification
    notification.textContent = message;
    
    // กำหนดประเภทของ Notification (สีเขียวสำหรับสำเร็จ, สีแดงสำหรับข้อผิดพลาด)
    notification.className = `notification show ${type}`;
    
    // ซ่อน Notification หลังจาก 3 วินาที
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// ตัวอย่างการใช้
// เรียกใช้งานเมื่อการเพิ่มหนังสำเร็จ
function addMovieSuccess() {
    showNotification('Add movie!', 'success');
}

// เรียกใช้งานเมื่อการอัปเดตหนังสำเร็จ
function updateMovieSuccess() {
    showNotification('Movie update!', 'success');
}

// เรียกใช้งานเมื่อการลบหนังสำเร็จ
function deleteMovieSuccess() {
    showNotification('Deleted the movie!', 'success');
}

// ตัวอย่างการใช้ในกรณีที่เกิดข้อผิดพลาด
function addMovieError() {
    showNotification('An error occurred while adding the movie.!', 'error');
}

// ตัวอย่างการเพิ่มหนังใหม่
function addMovie(movieData) {
    fetch('/api/add-movie', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(movieData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            addMovieSuccess();  // แสดง notification เมื่อเพิ่มหนังสำเร็จ
        } else {
            addMovieError();  // แสดง notification เมื่อเกิดข้อผิดพลาด
        }
    })
    .catch(error => {
        console.error('Error adding movie:', error);
        addMovieError();  // แสดง notification เมื่อเกิดข้อผิดพลาด
    });
}

// ตัวอย่างการอัปเดตหนัง
function updateMovie(movieId, updatedData) {
    fetch(`/api/update-movie/${movieId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateMovieSuccess();  // แสดง notification เมื่ออัปเดตหนังสำเร็จ
        } else {
            showNotification('เกิดข้อผิดพลาดในการอัปเดตหนัง!', 'error');
        }
    })
    .catch(error => {
        console.error('Error updating movie:', error);
        showNotification('เกิดข้อผิดพลาดในการอัปเดตหนัง!', 'error');
    });
}

// ตัวอย่างการลบหนัง
function deleteMovie(movieId) {
    fetch(`/api/delete-movie/${movieId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            deleteMovieSuccess();  // แสดง notification เมื่อลบหนังสำเร็จ
        } else {
            showNotification('เกิดข้อผิดพลาดในการลบหนัง!', 'error');
        }
    })
    .catch(error => {
        console.error('Error deleting movie:', error);
        showNotification('เกิดข้อผิดพลาดในการลบหนัง!', 'error');
    });
}

// ฟังก์ชันการแสดง Toast Notification
function showToastNotification(message, type = 'success') {
    const toast = document.getElementById('toast-notification');
    const toastMessage = document.getElementById('toast-message');

    // กำหนดข้อความการแจ้งเตือน
    toastMessage.textContent = message;

    // กำหนดประเภทของการแจ้งเตือน (error, success)
    if (type === 'error') {
        toast.classList.add('error');
    } else {
        toast.classList.remove('error');
        toast.classList.add('success');
    }

    // แสดงการแจ้งเตือน
    toast.classList.add('show');

    // ซ่อนการแจ้งเตือนหลังจาก 3 วินาที
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

document.getElementById('add-movie-form').addEventListener('submit', (event) => {
    event.preventDefault();

    // ตัวอย่างการเพิ่มหนังสำเร็จ
    showToastNotification('Add movie!', 'success');
    document.getElementById('addMovieModal').style.display = 'none';
});

document.getElementById('update-movie-form').addEventListener('submit', (event) => {
    event.preventDefault();

    // ตัวอย่างการอัปเดตหนังสำเร็จ
    showToastNotification('Movie update!', 'success');
    document.getElementById('updateMovieModal').style.display = 'none';
});

// เมื่อเพิ่ม genre ใหม่
createGenreForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const genreName = document.getElementById('genre-name').value.trim();

    if (genreName) {
        // เพิ่ม genre ที่สร้างขึ้นใหม่ใน sidebar
        const genreItem = document.createElement('li');
        genreItem.textContent = genreName;
        genreItem.classList.add('genre-item');
        genreItem.addEventListener('click', () => showMoviesByGenre(genreName));
        genreListContainer.appendChild(genreItem);
        
        // เก็บ genre ใน localStorage
        const genreList = JSON.parse(localStorage.getItem('genreList')) || []; // ดึงข้อมูล genre เก่ามา (ถ้ามี)
        genreList.push(genreName); // เพิ่ม genre ใหม่เข้าไป
        localStorage.setItem('genreList', JSON.stringify(genreList)); // บันทึก genre ใหม่กลับไปใน localStorage

        console.log("Saved genres:", genreList); // ตรวจสอบข้อมูลที่เก็บใน localStorage
        
        // ซ่อน Modal
        createGenreModal.style.display = 'none';

        // ล้างฟอร์ม
        document.getElementById('genre-name').value = '';
    }
});

// ฟังก์ชันโหลด genre จาก localStorage เมื่อหน้าเว็บโหลด
document.addEventListener('DOMContentLoaded', () => {
    const genreList = JSON.parse(localStorage.getItem('genreList')) || []; // ดึงข้อมูล genre จาก localStorage
    console.log("Loaded genres:", genreList);  // ตรวจสอบว่า genreList มีข้อมูลหรือไม่

    // หากมี genre ใน localStorage ให้เพิ่มลงใน DOM
    genreList.forEach(genreName => {
        const genreItem = document.createElement('li');
        genreItem.textContent = genreName;
        genreItem.classList.add('genre-item');
        genreItem.addEventListener('click', () => showMoviesByGenre(genreName)); // เมื่อคลิกจะเรียกฟังก์ชันแสดงหนังตาม genre
        genreListContainer.appendChild(genreItem);
    });
});

// ค้นหาปุ่มและองค์ประกอบที่เกี่ยวข้อง
const hintIcon = document.getElementById('hint-icon');
const hint = document.getElementById('hint');

// เพิ่ม event listener ให้กับปุ่ม
hintIcon.addEventListener('click', () => {
    // สลับการแสดงผลของ hint
    if (hint.style.display === 'block') {
        hint.style.display = 'none';  // ซ่อน hint
    } else {
        hint.style.display = 'block';  // แสดง hint
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const genreItems = document.querySelectorAll(".genre-list li");
    const rightContent = document.getElementById("right-content");

    // Add event listeners to all genre items
    genreItems.forEach(item => {
        item.addEventListener("click", async () => {
            const genre = item.getAttribute("data-genre"); // ดึง genre ที่คลิก
            const movies = await fetchMoviesByGenre(genre); // เรียก API

            // Clear the right content area
            rightContent.innerHTML = "";

            // Render movies in the right content area
            if (movies.length > 0) {
                movies.forEach(movie => {
                    const movieCard = document.createElement("div");
                    movieCard.className = "movie-poster";

                    movieCard.innerHTML = `
                        <img src="${movie.poster || 'placeholder.jpg'}" alt="${movie.title}">
                        <div class="movie-title">${movie.title}</div>
                    `;
                    rightContent.appendChild(movieCard);
                });
            } else {
                rightContent.innerHTML = `<p>No movies found for "${genre}"</p>`;
            }
        });
    });
});

// ฟังก์ชันสำหรับดึงหนังตาม Genre
async function fetchMoviesByGenre(genre) {
    try {
        const response = await fetch(`http://localhost:5001/api/movies/${genre}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const movies = await response.json();
        const rightContent = document.querySelector('.right-content');
        rightContent.innerHTML = ''; // ล้างเนื้อหาเดิมก่อน

        if (movies.length > 0) {
            movies.forEach(movie => {
                const moviePoster = document.createElement('div');
                moviePoster.classList.add('movie-poster');
                moviePoster.setAttribute('data-movie-id', movie._id);
                moviePoster.innerHTML = `
                    <img src="${movie.Poster_Link}" alt="${movie.Series_Title}">
                    <div class="movie-title">${movie.Series_Title}</div>
                `;
                rightContent.appendChild(moviePoster);
            });

            // เพิ่ม Event Listener สำหรับโปสเตอร์ที่โหลดใหม่
            addPosterSelectionEvent();
        } else {
            rightContent.innerHTML = '<p>No movies found for this genre.</p>';
        }
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}


// Add click event to movie posters for selection
function addMovieSelectionEvent() {
    const moviePosters = document.querySelectorAll('.movie-poster');
    moviePosters.forEach(poster => {
        poster.addEventListener('click', () => {
            // ลบคลาส selected จากโปสเตอร์ทั้งหมด
            document.querySelectorAll('.movie-poster').forEach(item => item.classList.remove('selected'));

            // เพิ่มคลาส selected ให้กับโปสเตอร์ที่ถูกคลิก
            poster.classList.add('selected');
        });
    });
}

// Call this function after rendering movies
function renderMovies(movies) {
    const rightContent = document.getElementById('right-content');
    rightContent.innerHTML = '';

    if (movies.length === 0) {
        rightContent.innerHTML = '<p>No movies found for this genre.</p>';
        return;
    }

    movies.forEach(movie => {
        const moviePoster = document.createElement('div');
        moviePoster.className = 'movie-poster';
        moviePoster.setAttribute('data-id', movie._id); // เก็บ ID ของหนัง
        moviePoster.innerHTML = `
            <img src="${movie.Poster_Link}" alt="${movie.Series_Title}">
            <h3>${movie.Series_Title}</h3>
        `;
        rightContent.appendChild(moviePoster);
    });

    // Add selection event to newly rendered movie posters
    addMovieSelectionEvent();
}

// Event Listener สำหรับ Genre List
document.querySelectorAll('.genre-list li').forEach(genreItem => {
    genreItem.addEventListener('click', () => {
        // ลบคลาส active จาก genre อื่น
        document.querySelectorAll('.genre-list li').forEach(item => item.classList.remove('active'));
        genreItem.classList.add('active');

        const genre = genreItem.textContent.trim(); // อ่าน genre ที่เลือก
        fetchMoviesByGenre(genre); // โหลดหนังตาม genre
    });
});



function getSelectedMovie() {
    const selectedPoster = document.querySelector('.movie-poster.selected');
    if (!selectedPoster) {
        alert('Please select a movie first.');
        return null;
    }

    const movieId = selectedPoster.getAttribute('data-id');
    return movieId;
}

function addPosterSelectionEvent() {
    const posters = document.querySelectorAll('.movie-poster');
    posters.forEach(poster => {
        poster.addEventListener('click', () => {
            // ลบคลาส selected จากโปสเตอร์ทั้งหมด
            document.querySelectorAll('.movie-poster').forEach(p => p.classList.remove('selected'));

            // เพิ่มคลาส selected ให้กับโปสเตอร์ที่ถูกคลิก
            poster.classList.add('selected');
            const selectedMovieId = poster.getAttribute('data-movie-id'); // เก็บ movieId
            console.log('Selected Movie ID:', selectedMovieId); // Log เพื่อดีบัก
        });
    });
}
























