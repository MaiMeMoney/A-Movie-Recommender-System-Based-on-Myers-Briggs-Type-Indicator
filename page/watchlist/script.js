let currentList = null; // ไม่มีลิสต์เริ่มต้น
let movieData = {}; // เก็บข้อมูลหนังสำหรับแต่ละลิสต์
let selectedMovie = null; // หนังที่ถูกเลือกในลิสต์ปัจจุบัน

function createList() {
    const newListName = document.getElementById('new-list-name').value.trim();
    
    if (newListName) {
        const listContainer = document.getElementById('list-container');
        
        // ตรวจสอบว่าลิสต์ซ้ำหรือไม่
        const existingList = document.querySelector(`.list-name[data-list-name="${newListName}"]`);
        if (existingList) {
            alert("List already exists!");
            return;
        }

        // สร้าง div สำหรับลิสต์ใหม่
        const newList = document.createElement('div');
        newList.classList.add('list-name');
        newList.setAttribute('data-list-name', newListName);
        newList.textContent = newListName;

        // เพิ่มคลิกขวาเพื่อลบลิสต์
        newList.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            if (confirm(`Do you want to delete the list "${newListName}"?`)) {
                deleteList(newListName);
            }
        });

        // เพิ่มการเลือกดูหนังในลิสต์
        newList.addEventListener('click', function() {
            switchList(newListName);
        });

        listContainer.appendChild(newList);
        document.getElementById('new-list-name').value = ''; // รีเซ็ตช่องกรอกชื่อ
        
        // ตั้งค่าข้อมูลหนังให้ลิสต์ใหม่
        movieData[newListName] = [];
        switchList(newListName);
    } else {
        alert('Please enter a list name.');
    }
}

function deleteList(listName) {
    delete movieData[listName]; // ลบข้อมูลหนังของลิสต์นั้น
    const listElement = document.querySelector(`.list-name[data-list-name="${listName}"]`);
    listElement.remove(); // ลบลิสต์ออกจากหน้า
    currentList = null; // รีเซ็ตลิสต์ปัจจุบัน
    clearMovieList(); // ล้างหน้าจอหนัง
}

function switchList(listName) {
    currentList = listName;
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