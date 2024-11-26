// ฟังก์ชันสำหรับดึง MBTI ของผู้ใช้
async function fetchUserMBTI() {
    const username = localStorage.getItem('username'); // ดึง username จาก Local Storage
    const mbtiTypeElement = document.querySelector(".mbti-type");

    if (!username) {
        mbtiTypeElement.textContent = "No username found in storage";
        return;
    }

    try {
        const response = await fetch(`http://localhost:5001/api/mbti/${username}`, {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error("Failed to fetch MBTI");
        }

        const data = await response.json();
        mbtiTypeElement.textContent = data.mbti; // อัปเดต MBTI ใน HTML
    } catch (error) {
        console.error("Error fetching MBTI:", error);
        mbtiTypeElement.textContent = "Error fetching MBTI";
    }
}

// ฟังก์ชันสำหรับดึงคำแนะนำหนัง
async function fetchRecommendations() {
    const username = localStorage.getItem('username'); // ดึง username จาก Local Storage
    const movieGrid = document.querySelector(".movie-grid");

    if (!username) {
        movieGrid.innerHTML = "<p>No username found in storage</p>";
        return;
    }

    try {
        const response = await fetch("http://localhost:5001/recommend", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username }),
        });

        if (!response.ok) {
            throw new Error("Failed to fetch recommendations");
        }

        const data = await response.json();
        movieGrid.innerHTML = ""; // ล้างข้อมูลเก่า
        data.recommendations.forEach((movie) => {
            const movieCard = document.createElement("div");
            movieCard.className = "movie-card";
            movieCard.innerHTML = `
                <h3>${movie.movieName}</h3>
                <p>Average Score: ${movie.score}</p>
            `;
            movieGrid.appendChild(movieCard);
        });
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        movieGrid.innerHTML = `<p>Error loading recommendations</p>`;
    }
}

// ผูกฟังก์ชันกับปุ่ม Recommend
document.querySelector(".recommend-me").addEventListener("click", fetchRecommendations);

// เรียกฟังก์ชัน fetchUserMBTI เมื่อโหลดหน้าเสร็จ
window.onload = fetchUserMBTI;
