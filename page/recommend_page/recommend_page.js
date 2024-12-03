// ฟังก์ชันสำหรับดึง MBTI ของผู้ใช้
async function loadUserMBTI() {
    const username = localStorage.getItem("username");
    const mbtiTypeElement = document.querySelector(".mbti-type");

    if (!username) {
        mbtiTypeElement.textContent = "No username found in storage";
        console.warn("No username found in localStorage");
        return;
    }

    try {
        console.log("Fetching MBTI for username:", username);
        const response = await fetch(`http://127.0.0.1:5001/api/user-mbti/${username}`);
        if (response.ok) {
            const { mbti } = await response.json();
            console.log("MBTI fetched successfully:", mbti);
            mbtiTypeElement.textContent = mbti || "Not Set";
        } else {
            console.error("Failed to fetch MBTI. Status:", response.status);
            mbtiTypeElement.textContent = "Error fetching MBTI";
        }
    } catch (error) {
        console.error("Error fetching MBTI:", error);
        mbtiTypeElement.textContent = "Error fetching MBTI";
    }
}


document.addEventListener("DOMContentLoaded", loadUserMBTI);

async function fetchRecommendations() {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("Token not found. Please log in again.");
        alert("Token not found. Please log in again.");
        window.location.href = "/page/login_page/index.html";
        return;
    }

    try {
        console.log("Fetching recommendations with token:", token);

        const response = await fetch("http://127.0.0.1:5001/recommend", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: localStorage.getItem("username") // ส่ง username ใน body
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch recommendations. Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Recommendations:", data);

        if (data.recommendations && data.recommendations.length > 0) {
            const movieGrid = document.querySelector(".movie-grid");
            movieGrid.innerHTML = "";

            data.recommendations.forEach((movie) => {
                const movieCard = document.createElement("div");
                movieCard.className = "movie-card";
            
                const rating = movie.predictedRating ? movie.predictedRating.toFixed(1) : "N/A";
            
                movieCard.innerHTML = `
                    <h3>${movie.movieName}</h3>
                    <p>Predicted Rating: ${rating}</p>
                `;
                movieGrid.appendChild(movieCard);
            });
            
        } else {
            alert("No recommendations available at the moment.");
        }
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        alert("Failed to fetch recommendations. Please try again later.");
    }
}

// ฟังก์ชันสำหรับปุ่ม CHANGE MBTI
function handleChangeMBTI() {
    window.location.href = "/page/mbti_selection/mbti_selection.html"; // พาผู้ใช้ไปหน้าเลือก MBTI
}

// ผูกฟังก์ชันกับปุ่ม CHANGE MBTI
document.querySelector(".change-mbti").addEventListener("click", handleChangeMBTI);


// ผูกฟังก์ชันกับปุ่ม Recommend
document.querySelector(".recommend-me").addEventListener("click", fetchRecommendations);

// เรียกฟังก์ชัน loadUserMBTI เมื่อโหลดหน้า
document.addEventListener("DOMContentLoaded", loadUserMBTI);

console.log("Recommendation Data:", data.recommendations);
