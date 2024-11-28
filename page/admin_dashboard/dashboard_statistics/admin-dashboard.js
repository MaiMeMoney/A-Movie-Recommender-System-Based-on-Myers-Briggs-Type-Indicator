document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get("username");

    // เพิ่ม event listener สำหรับ data selector
    const dataSelector = document.getElementById('data-selector');
    dataSelector.addEventListener('change', (e) => updateDashboard(e.target.value));

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
                window.location.href = "/";
            } else {
                // แสดงข้อมูลแอดมิน
                document.querySelector(".admin-image").innerHTML = `<img src="${data.profileImage}" alt="Admin Image">`;
                document.querySelector("#admin-name").textContent = `${data.firstname} ${data.lastname}`;
                
                // โหลดข้อมูลครั้งแรก
                loadMBTIStats();
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("You are not logged in!");
            window.location.href = "/";
        });

    // ฟังก์ชันอัปเดท Dashboard
    async function updateDashboard(view) {
        // ซ่อนทุก container ก่อน
        document.querySelectorAll('.analytics-container').forEach(container => {
            container.style.display = 'none';
        });

        try {
            switch(view) {
                case 'mbti':
                    document.getElementById('mbti-stats').style.display = 'block';
                    await loadMBTIStats();
                    break;
                case 'movies':
                    document.getElementById('movie-analytics').style.display = 'block';
                    await loadMovieAnalytics();
                    break;
                    case 'search':
                        document.getElementById('search-analytics').style.display = 'block';
                        await loadSearchAnalytics();
                        break;
                    case 'popular-movies':
                        document.getElementById('popular-movies').style.display = 'block';
                        await loadPopularMovies();
                        break;
                case 'user-management':
                    document.getElementById('user-management').style.display = 'block';
                    // โค้ดสำหรับ user management (ถ้ามี)
                    break;
            }
        } catch (error) {
            console.error('Error updating dashboard:', error);
            alert('Error updating dashboard. Please try again.');
        }
    }

    async function loadMBTIStats() {
        try {
            const response = await fetch("/api/mbti-stats");
            if (!response.ok) {
                throw new Error("Failed to fetch MBTI stats.");
            }
            const mbtiStats = await response.json();
            const mbtiLabels = Object.keys(mbtiStats);
            const mbtiCounts = Object.values(mbtiStats);

            // ลบกราฟเก่าถ้ามี
            const oldChart = Chart.getChart("mbti-chart");
            if (oldChart) {
                oldChart.destroy();
            }

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
                            text: "MBTI Distribution",
                            color: "#fff"
                        }
                    },
                    scales: {
                        x: { 
                            ticks: { color: "#fff" },
                            grid: { color: "rgba(255, 255, 255, 0.1)" }
                        },
                        y: { 
                            beginAtZero: true,
                            ticks: { color: "#fff" },
                            grid: { color: "rgba(255, 255, 255, 0.1)" }
                        }
                    }
                }
            });
        } catch (error) {
            console.error("Error fetching MBTI stats:", error);
            alert("Error loading MBTI statistics. Please try again.");
        }
    }

// ปรับปรุงฟังก์ชัน loadMovieAnalytics
async function loadMovieAnalytics() {
    try {
        console.log('เริ่มโหลดข้อมูลการวิเคราะห์ภาพยนตร์...');
        const username = urlParams.get("username");
        const response = await fetch(`/api/analytics/dashboard?username=${username}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${data.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'}`);
        }

        const data = await response.json();

        // ลบกราฟเก่า
        ['topRatedChart', 'watchlistChart'].forEach(chartId => {
            const oldChart = Chart.getChart(chartId);
            if (oldChart) {
                oldChart.destroy();
            }
        });

        if (data.topRatedMovies && data.topRatedMovies.length > 0) {
            const topRatedCtx = document.getElementById('topRatedChart').getContext('2d');
            new Chart(topRatedCtx, {
                type: 'bar',
                data: {
                    labels: data.topRatedMovies.map(m => m.title || m.movieName),
                    datasets: [{
                        label: 'คะแนนเฉลี่ย',
                        data: data.topRatedMovies.map(m => m.averageRating),
                        backgroundColor: "rgba(54, 162, 235, 0.5)",
                        borderColor: "rgba(54, 162, 235, 1)",
                        borderWidth: 1,
                        borderRadius: 5
                    }, {
                        label: 'จำนวนผู้ให้คะแนน',
                        data: data.topRatedMovies.map(m => m.totalRatings),
                        backgroundColor: "rgba(255, 159, 64, 0.5)",
                        borderColor: "rgba(255, 159, 64, 1)",
                        borderWidth: 1,
                        borderRadius: 5
                    }]
                },
                options: {
                    indexAxis: 'y',  // แสดงแนวนอน
                    responsive: true,
                    scales: {
                        x: {
                            beginAtZero: true,
                            grid: { color: "rgba(255, 255, 255, 0.1)" },
                            ticks: { color: "#fff" }
                        },
                        y: {
                            grid: { display: false },
                            ticks: { color: "#fff" }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: { color: "#fff" }
                        },
                        title: {
                            display: true,
                            text: 'อันดับภาพยนตร์ที่ได้รับคะแนนสูงสุด',
                            color: "#fff",
                            font: { size: 16 }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.dataset.label;
                                    const value = context.raw;
                                    if (label === 'คะแนนเฉลี่ย') {
                                        return `${label}: ${value.toFixed(2)} คะแนน`;
                                    }
                                    return `${label}: ${value} คน`;
                                }
                            }
                        }
                    }
                }
            });
        }

        if (data.popularWatchlistMovies && data.popularWatchlistMovies.length > 0) {
            const watchlistCtx = document.getElementById('watchlistChart').getContext('2d');
            const total = data.popularWatchlistMovies.reduce((sum, movie) => sum + movie.count, 0);
            
            new Chart(watchlistCtx, {
                type: 'doughnut',
                data: {
                    labels: data.popularWatchlistMovies.map(w => w.movieTitle),
                    datasets: [{
                        data: data.popularWatchlistMovies.map(w => w.count),
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.8)',
                            'rgba(54, 162, 235, 0.8)',
                            'rgba(255, 206, 86, 0.8)',
                            'rgba(75, 192, 192, 0.8)',
                            'rgba(153, 102, 255, 0.8)',
                            'rgba(255, 159, 64, 0.8)',
                            'rgba(255, 99, 132, 0.8)',
                            'rgba(54, 162, 235, 0.8)',
                            'rgba(255, 206, 86, 0.8)',
                            'rgba(75, 192, 192, 0.8)'
                        ],
                        borderColor: '#fff',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    cutout: '60%',
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                color: "#fff",
                                font: { size: 12 }
                            }
                        },
                        title: {
                            display: true,
                            text: 'ภาพยนตร์ยอดนิยมใน Watchlist',
                            color: "#fff",
                            font: { size: 16 }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const value = context.raw;
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${context.label}: ${value} ครั้ง (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('ข้อผิดพลาด:', error);
        alert(`เกิดข้อผิดพลาดในการโหลดข้อมูล: ${error.message}`);
    }
}

async function loadSearchAnalytics() {
    try {
        const response = await fetch('http://localhost:5001/api/search-stats');
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch search analytics.');
        }

        const searchStats = await response.json();

        if (!searchStats || searchStats.length === 0) {
            throw new Error("ยังไม่มีข้อมูลการค้นหา");
        }

        const labels = searchStats.map(stat => stat._id);
        const counts = searchStats.map(stat => stat.count);

        const ctx = document.getElementById('searchQueryChart').getContext('2d');
        const oldChart = Chart.getChart("searchQueryChart");
        if (oldChart) oldChart.destroy();

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'จำนวนการค้นหา',
                    data: counts,
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2,
                    borderRadius: 5
                }]
            },
            options: {
                indexAxis: 'y',  // แสดงแนวนอน
                responsive: true,
                scales: {
                    x: { 
                        ticks: { color: '#fff' },
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        title: {
                            display: true,
                            text: 'จำนวนครั้งที่ค้นหา',
                            color: '#fff',
                            font: { size: 14 }
                        }
                    },
                    y: { 
                        ticks: { color: '#fff', font: { size: 12 } },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: '#fff', font: { size: 14 } }
                    },
                    title: {
                        display: true,
                        text: 'คำค้นหายอดนิยม',
                        color: '#fff',
                        font: { size: 16, weight: 'bold' }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `ค้นหา ${context.raw} ครั้ง`;
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error loading search analytics:', error);
        alert('ไม่สามารถโหลดข้อมูลการค้นหาได้');
    }
}

async function loadPopularMovies() {
    try {
        console.log('Loading popular movies...');
        const response = await fetch('/api/popular-movies');
        if (!response.ok) {
            throw new Error('Failed to fetch popular movies');
        }

        const popularMovies = await response.json();
        
        if (!popularMovies || popularMovies.length === 0) {
            document.getElementById('popularMoviesChart').innerHTML = 'No popular movies data available';
            return;
        }

        const ctx = document.getElementById('popularMoviesChart').getContext('2d');
        const oldChart = Chart.getChart("popularMoviesChart");
        if (oldChart) {
            oldChart.destroy();
        }

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: popularMovies.map(movie => movie.Series_Title || movie.movieTitle),
                datasets: [{
                    label: 'จำนวนการเข้าชม',
                    data: popularMovies.map(movie => movie.viewCount || 0),
                    backgroundColor: 'rgba(75, 192, 192, 0.7)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        ticks: {
                            color: '#fff',
                            maxRotation: 45,
                            minRotation: 45,
                            font: {
                                size: 10
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#fff'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#fff',
                            font: {
                                size: 12
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'หนังยอดนิยม',
                        color: '#fff',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error loading popular movies:', error);
        document.getElementById('popularMoviesChart').innerHTML = 'Failed to load popular movies data';
    }
}

// เพิ่มฟังก์ชันสำหรับปรับขนาดกราฟอัตโนมัติ
function resizeCharts() {
    const charts = document.querySelectorAll('.chart-container canvas');
    charts.forEach(chart => {
        const container = chart.parentElement;
        chart.style.height = `${container.offsetHeight - 50}px`; // ลบ padding
    });
}

// เรียกใช้ฟังก์ชันเมื่อหน้าจอมีการเปลี่ยนขนาด
window.addEventListener('resize', resizeCharts);


    // Event Listeners for Back and Logout buttons
    document.getElementById('backToMainPage').addEventListener('click', async () => {
        const username = localStorage.getItem('username');
        if (!username) {
            alert('Session expired. Please log in again.');
            window.location.href = 'http://127.0.0.1:5500/page/login_page/index.html';
            return;
        }
        window.location.href = `http://127.0.0.1:5500/page/main_page/mainpage.html?username=${username}`;
    });

    document.getElementById('logout-btn').addEventListener('click', async () => {
        try {
            const response = await fetch('/logout', { method: 'POST' });
            if (response.ok) {
                localStorage.removeItem('username');
                alert("You have been logged out.");
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