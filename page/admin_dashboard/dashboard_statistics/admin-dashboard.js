document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get("username");

    // ตรวจสอบ role ของผู้ใช้
    fetch(`/api/check-role?username=${username}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch user role.");
            }
            return response.json();
        })
        .then(data => {
            if (data.role !== 1) {
                alert("Access Denied: Admins Only");
                window.location.href = "/"; // Redirect ถ้าไม่ใช่ Admin
            } else {
                // แสดงข้อมูลแอดมินใน Sidebar
                document.querySelector(".admin-image").innerHTML = `<img src="${data.profileImage}" alt="Admin Image">`;
                document.querySelector("#admin-name").textContent = `${data.firstname} ${data.lastname}`;

                // ดึงข้อมูลสถิติ MBTI
                fetch("/api/mbti-stats")
                    .then(response => {
                        if (!response.ok) {
                            throw new Error("Failed to fetch MBTI stats.");
                        }
                        return response.json();
                    })
                    .then(mbtiStats => {
                        const mbtiLabels = Object.keys(mbtiStats); // รายชื่อ MBTI
                        const mbtiCounts = Object.values(mbtiStats); // จำนวนผู้ใช้แต่ละ MBTI

                        // แสดงกราฟ MBTI ด้วย Chart.js
                        const ctx = document.getElementById("mbti-chart").getContext("2d");
                        new Chart(ctx, {
                            type: "bar",
                            data: {
                                labels: mbtiLabels,
                                datasets: [{
                                    label: "จำนวนผู้ใช้",
                                    data: mbtiCounts,
                                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                                    borderColor: "rgba(75, 192, 192, 1)",
                                    borderWidth: 1
                                }]
                            },
                            options: {
                                responsive: true,
                                plugins: {
                                    legend: { display: false },
                                    tooltip: { enabled: true },
                                    title: {
                                        display: true,
                                        text: "MBTI Distribution"
                                    }
                                },
                                scales: {
                                    x: {
                                        ticks: {
                                            color: "#fff"
                                        }
                                    },
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            color: "#fff"
                                        }
                                    }
                                }
                            }
                        });
                    })
                    .catch(error => {
                        console.error("Error fetching MBTI stats:", error);
                        alert("Error loading MBTI statistics. Please try again.");
                    });
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("You are not logged in!");
            window.location.href = "/";
        });

    // ปุ่มกลับไปยังหน้า Main Page
    document.getElementById('backToMainPage').addEventListener('click', async () => {
        const username = localStorage.getItem('username');
    
        if (!username) {
            alert('Session expired. Please log in again.');
            window.location.href = 'http://127.0.0.1:5500/page/login_page/index.html'; // ใช้เซิร์ฟเวอร์หลัก
            return;
        }
    
        window.location.href = `http://127.0.0.1:5500/page/main_page/mainpage.html?username=${username}`;
    });
    
    document.getElementById('logout-btn').addEventListener('click', async () => {
        try {
            const response = await fetch('/logout', { method: 'POST' });
            if (response.ok) {
                localStorage.removeItem('username'); // ลบ username ใน localStorage
                alert("You have been logged out.");
                // ย้อนกลับไปที่ login page ในพอร์ต 5500
                window.location.href = 'http://127.0.0.1:5500/page/login_page/index.html';
            } else {
                throw new Error('Failed to logout');
            }
        } catch (error) {
            console.error("Error during logout:", error);
            alert("An error occurred while logging out.");
        }
    });
    
});
