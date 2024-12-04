document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get("username");

    // เพิ่ม event listener สำหรับ data selector
    const dataSelector = document.getElementById('data-selector');
    dataSelector.addEventListener('change', (e) => updateDashboard(e.target.value));

    // ตรวจสอบ role ของผู้ใช้
    fetch(`/api/check-role?username=${username}`, {
        credentials: 'include'
     })
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
            const adminImage = document.querySelector(".admin-image");
            if (data.profileImage) {
                adminImage.innerHTML = `<img src="${data.profileImage}" alt="${data.username}" class="profile-image"/>`;
            } else {
                const initials = `${data.firstname?.[0] || ''}${data.lastname?.[0] || ''}` || data.username?.[0] || 'A';
                adminImage.innerHTML = `<div class="placeholder-image">${initials.toUpperCase()}</div>`;
            }
            document.querySelector("#admin-name").textContent = `${data.firstname} ${data.lastname}`;
            
            document.querySelector('.logout-btn').addEventListener('click', async () => {
                if (confirm('ต้องการออกจากระบบหรือไม่?')) {
                    try {
                        const response = await fetch('http://localhost:6001/logout', {
                            method: 'POST',
                            credentials: 'include'
                        });
                        if (response.ok) {
                            window.location.href = 'http://127.0.0.1:5500/page/login_page/index.html';
                        }
                    } catch (error) {
                        console.error('Logout error:', error);
                        alert('เกิดข้อผิดพลาดในการออกจากระบบ');
                    }
                }
            });
            
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
                            const userManagementContainer = document.querySelector('.user-management-content');
                            if (userManagementContainer) {
                                loadUserManagement(userManagementContainer);
                            }
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
        const response = await fetch('/api/search-stats', {
            credentials: 'include'
        });
        
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

 function addSearchFunctionality(users) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const tableBody = document.getElementById('userTableBody');
            const rows = tableBody.getElementsByTagName('tr');
            
            Array.from(rows).forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
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

function renderUserRow(user) {
    const profileImage = user.profileImage
        ? `<img src="${user.profileImage}" alt="Profile Image" class="user-image"/>`
        : `<div class="user-image-placeholder">No Image</div>`;
    
    return `
        <tr>
            <td>${profileImage}</td>
            <td>${user.username}</td>
            <td>${user.firstname} ${user.lastname}</td>
            <td>${user.email}</td>
            <td>${user.role === 1 ? "Admin" : "User"}</td>
            <td>${user.mbti_type || "N/A"}</td>
            <td>${user.banned ? "Banned" : "Active"}</td>
            <td>
                <button class="edit">Edit</button>
                <button class="ban">${user.banned ? "Unban" : "Ban"}</button>
            </td>
        </tr>
    `;
}

function loadUserManagement(container) {
    container.innerHTML = `
        <div class="p-6 max-w-6xl mx-auto bg-gray-900 rounded-lg shadow-md">
            <div class="mb-6 flex justify-between items-center">
                <h2 class="text-2xl font-bold text-white">จัดการผู้ใช้</h2>
                <div class="relative">
                    <input
                        type="text"
                        id="searchInput"
                        placeholder="ค้นหาผู้ใช้..."
                        class="pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <i class="fas fa-search"></i>
                    </span>
                </div>
            </div>
            <div class="overflow-x-auto">
                <table class="user-management-table w-full table-auto border-collapse border border-gray-700 text-left text-sm">
                    <thead class="bg-gray-800 text-white">
                        <tr>
                            <th class="border border-gray-700 px-4 py-2">รูปโปรไฟล์</th>
                            <th class="border border-gray-700 px-4 py-2">ชื่อผู้ใช้</th>
                            <th class="border border-gray-700 px-4 py-2">ชื่อ-นามสกุล</th>
                            <th class="border border-gray-700 px-4 py-2">อีเมล</th>
                            <th class="border border-gray-700 px-4 py-2">ตำแหน่ง</th>
                            <th class="border border-gray-700 px-4 py-2">MBTI</th>
                            <th class="border border-gray-700 px-4 py-2">สถานะ</th>
                            <th class="border border-gray-700 px-4 py-2">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody id="userTableBody" class="text-gray-300">
                    </tbody>
                </table>
            </div>
        </div>`;

    fetchUsers();
}


async function fetchAndRenderUsers() {
    try {
        const currentUsername = new URLSearchParams(window.location.search).get("username");
        const response = await fetch(`/api/admin/users?username=${currentUsername}`, {
            credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to fetch users');
        const users = await response.json();
        
        const usersGrid = document.getElementById('usersGrid');
        usersGrid.innerHTML = users.map(user => `
            <div class="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div class="flex items-center space-x-4">
                    <div class="relative group">
                        ${user.profileImage ? 
                            `<img src="${user.profileImage}" alt="${user.username}" class="w-12 h-12 rounded-full object-cover"/>` :
                            `<div class="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center">
                                <span class="text-white">${user.firstname?.[0] || user.username[0]}</span>
                            </div>`
                        }
                        <button 
                            onclick="handleImageUpload('${user._id}')"
                            class="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <span class="text-white text-sm">อัพโหลด</span>
                        </button>
                    </div>
                    <div class="flex-1">
                        <h3 class="text-lg font-semibold text-white">${user.firstname} ${user.lastname}</h3>
                        <p class="text-sm text-gray-400">${user.email}</p>
                        <div class="flex items-center mt-1 space-x-2">
                            <span class="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                                MBTI: ${user.mbti_type || 'ไม่ระบุ'}
                            </span>
                            ${user.banned ? 
                                `<span class="text-xs bg-red-900 text-red-200 px-2 py-1 rounded">ถูกระงับ</span>` : ''
                            }
                        </div>
                    </div>
                    <div class="flex flex-col space-y-2">
                        ${user.role === 1 ? 
                            `<span class="text-blue-500"><i class="fas fa-shield-alt"></i></span>` : ''
                        }
                        <button onclick="editUser('${user.username}')" class="p-1 hover:bg-gray-700 rounded">
                            <i class="fas fa-edit text-gray-400"></i>
                        </button>
                        <button onclick="handleBanUser('${user._id}')" class="p-1 hover:bg-gray-700 rounded">
                            <i class="fas fa-ban ${user.banned ? 'text-gray-400' : 'text-red-500'}"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredUsers = users.filter(user => 
                user.username?.toLowerCase().includes(searchTerm) ||
                user.email?.toLowerCase().includes(searchTerm) ||
                `${user.firstname} ${user.lastname}`.toLowerCase().includes(searchTerm)
            );
            renderUsers(filteredUsers);
        });
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('usersGrid').innerHTML = `
            <div class="text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูล: ${error.message}</div>
        `;
    }
}

// เพิ่มฟังก์ชันจัดการรูปภาพและการแบน
async function handleImageUpload(userId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);
        formData.append('userId', userId);

        try {
            const response = await fetch('/api/admin/user/upload-image', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) throw new Error('อัพโหลดรูปภาพไม่สำเร็จ');
            
            fetchAndRenderUsers(); // รีโหลดข้อมูลผู้ใช้
        } catch (error) {
            alert('เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ');
        }
    };
    input.click();
}

async function handleBanUser(userId) {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะเปลี่ยนสถานะการระงับผู้ใช้นี้?')) return;
    
    try {
        const response = await fetch(`/api/admin/user/ban/${userId}`, {
            method: 'POST',
            credentials: 'include'
        });
        
        if (!response.ok) throw new Error('ไม่สามารถเปลี่ยนสถานะการระงับผู้ใช้ได้');
        
        const result = await response.json();
        alert(result.message);
        fetchAndRenderUsers();
    } catch (error) {
        alert('เกิดข้อผิดพลาดในการเปลี่ยนสถานะการระงับผู้ใช้');
    }
}

// ทำให้ฟังก์ชันเป็น global
window.handleImageUpload = handleImageUpload;
window.handleBanUser = handleBanUser;

window.editUser = editUser;  // ทำให้ฟังก์ชัน editUser เป็น global
window.closeModal = closeModal;  // ทำให้ฟังก์ชัน closeModal เป็น global
async function fetchUsers() {
    try {
        const currentUsername = urlParams.get("username");
        const response = await fetch(`/api/admin/users?username=${currentUsername}`, {
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to fetch users');
        const users = await response.json();

        const tableBody = document.getElementById('userTableBody');
        tableBody.innerHTML = users.map(user => `
    <tr>
        <td class="text-center">
            <div class="relative inline-block group">
                ${user.profileImage ? 
                    `<img src="${user.profileImage}" alt="${user.username}" class="profile-image"/>` :
                    `<div class="placeholder-image">${user.firstname?.[0] || user.username[0]}</div>`
                }
            </div>
        </td>
        <td>${user.username || '-'}</td>
        <td>${user.firstname || ''} ${user.lastname || ''}</td>
        <td>${user.email || '-'}</td>
        <td>
            <span class="${user.role === 1 ? 'bg-blue-500' : 'bg-green-500'} text-white px-3 py-1 rounded-full text-sm font-medium">
                ${user.role === 1 ? 'แอดมิน' : 'ผู้ใช้'}
            </span>
        </td>
        <td>
            <span class="bg-purple-500 text-white px-3 py-1 rounded-full text-sm">
                ${user.mbti_type || 'ไม่ระบุ'}
            </span>
        </td>
        <td>
            ${user.banned ? 
                '<span class="bg-red-500 text-white px-3 py-1 rounded-full text-sm">ระงับการใช้งาน</span>' : 
                '<span class="bg-green-500 text-white px-3 py-1 rounded-full text-sm">ปกติ</span>'
            }
        </td>
        <td>
            <div class="flex gap-2">
                <button onclick="editUser('${user.username}')" 
                        class="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all flex items-center gap-1 shadow-md">
                    <i class="fas fa-edit"></i>
                    <span>แก้ไข</span>
                </button>
                <button onclick="handleBanUser('${user._id}')" 
                        class="px-3 py-1 ${user.banned ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white rounded-lg transition-all flex items-center gap-1 shadow-md">
                    <i class="fas ${user.banned ? 'fa-user-check' : 'fa-ban'}"></i>
                    <span>${user.banned ? 'ยกเลิกระงับ' : 'ระงับ'}</span>
                </button>
            </div>
        </td>
    </tr>
`).join('');

        addSearchFunctionality(users);
    } catch (error) {
        console.error('Error:', error);
        const tableBody = document.getElementById('userTableBody');
        tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-red-500 py-4">
            <i class="fas fa-exclamation-circle mr-2"></i>
            เกิดข้อผิดพลาดในการโหลดข้อมูล: ${error.message}
        </td></tr>`;
    }
}

async function handleBanUser(userId) {
    try {
        const response = await fetch(`/api/admin/ban/${userId}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            return alert(`❌ Failed to update user ban status: ${errorData.message}`);
        }

        const data = await response.json();
        alert(`✅ ${data.message}`);

        // รีโหลดข้อมูลผู้ใช้โดยไม่รีเฟรชหน้า
        fetchUsers();
    } catch (error) {
        console.error('Error updating user ban status:', error);
        alert('❌ An error occurred while updating the user ban status');
    }
}


function addSearchFunctionality(users) {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        const filteredUsers = users.filter(user =>
            user.username.toLowerCase().includes(query) ||
            user.firstname.toLowerCase().includes(query) ||
            user.lastname.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
        );
        const tableBody = document.getElementById('userTableBody');
        tableBody.innerHTML = filteredUsers.map(user => `
            <tr>
                <td class="text-center">
                    <div class="relative inline-block group">
                        ${user.profileImage ? 
                            `<img src="${user.profileImage}" alt="${user.username}" class="w-16 h-16 rounded-full object-cover shadow-lg"/>` :
                            `<div class="w-16 h-16 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center shadow-lg">
                                <span class="text-xl font-bold text-white uppercase">${user.firstname?.[0] || user.username[0]}</span>
                            </div>`}
                        <button onclick="handleImageUpload('${user._id}')" 
                                class="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-all transform hover:scale-110 shadow-md">
                            <i class="fas fa-camera text-white text-xs"></i>
                        </button>
                    </div>
                </td>
                <td>${user.username || '-'}</td>
                <td>${user.firstname || ''} ${user.lastname || ''}</td>
                <td>${user.email || '-'}</td>
                <td>
                    <span class="${user.role === 1 ? 'bg-blue-500' : 'bg-green-500'} text-white px-3 py-1 rounded-full text-sm font-medium">
                        ${user.role === 1 ? 'แอดมิน' : 'ผู้ใช้'}
                    </span>
                </td>
                <td>
                    <span class="bg-purple-500 text-white px-3 py-1 rounded-full text-sm">
                        ${user.mbti_type || 'ไม่ระบุ'}
                    </span>
                </td>
                <td>
                    ${user.banned ? 
                        '<span class="bg-red-500 text-white px-3 py-1 rounded-full text-sm">ระงับการใช้งาน</span>' : 
                        '<span class="bg-green-500 text-white px-3 py-1 rounded-full text-sm">ปกติ</span>'}
                </td>
                <td>
                    <div class="flex gap-2">
                        <button onclick="editUser('${user.username}')" 
                                class="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all flex items-center gap-1 shadow-md">
                            <i class="fas fa-edit"></i>
                            <span>แก้ไข</span>
                        </button>
                        <button onclick="handleBanUser('${user._id}')" 
                                class="px-3 py-1 ${user.banned ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white rounded-lg transition-all flex items-center gap-1 shadow-md">
                            <i class="fas ${user.banned ? 'fa-user-check' : 'fa-ban'}"></i>
                            <span>${user.banned ? 'ยกเลิกระงับ' : 'ระงับ'}</span>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    });
}


function editUser(username) {
    const mbtiTypes = [
        "INTJ", "INTP", "ENTJ", "ENTP",
        "INFJ", "INFP", "ENFJ", "ENFP",
        "ISTJ", "ISFJ", "ESTJ", "ESFJ",
        "ISTP", "ISFP", "ESTP", "ESFP"
    ];

    const currentUsername = urlParams.get("username");
    fetch(`http://localhost:6001/api/admin/users?username=${currentUsername}`, {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(users => {
        const userToEdit = users.find(u => u.username === username);
        if (!userToEdit) {
            throw new Error('User not found');
        }

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>แก้ไขข้อมูลผู้ใช้ - ${userToEdit.username}</h2>
                <form id="editUserForm">
                    <div class="form-group">
                        <label>ชื่อผู้ใช้:</label>
                        <input type="text" value="${userToEdit.username}" disabled class="disabled-input">
                    </div>
                    <div class="form-group">
                        <label>อีเมล:</label>
                        <input type="email" id="email" value="${userToEdit.email || ''}" class="form-input">
                    </div>
                    <div class="form-group">
                        <label>ชื่อ:</label>
                        <input type="text" id="firstname" value="${userToEdit.firstname || ''}" class="form-input">
                    </div>
                    <div class="form-group">
                        <label>นามสกุล:</label>
                        <input type="text" id="lastname" value="${userToEdit.lastname || ''}" class="form-input">
                    </div>
                    <div class="form-group">
                        <label>ตำแหน่ง:</label>
                        <select id="role" class="form-select">
                            <option value="0" ${userToEdit.role === 0 ? 'selected' : ''}>ผู้ใช้ทั่วไป</option>
                            <option value="1" ${userToEdit.role === 1 ? 'selected' : ''}>ผู้ดูแลระบบ</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>MBTI Type:</label>
                        <select id="mbti_type" class="form-select">
                            <option value="">เลือก MBTI</option>
                            ${mbtiTypes.map(type => `
                                <option value="${type}" ${userToEdit.mbti_type === type ? 'selected' : ''}>
                                    ${type}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="button-group">
                        <button type="button" class="cancel-btn" onclick="window.closeModal()">ยกเลิก</button>
                        <button type="submit" class="save-btn">บันทึก</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        const form = document.getElementById('editUserForm');
        form.onsubmit = async (e) => {
            e.preventDefault();
            const formData = {
                email: document.getElementById('email').value,
                firstname: document.getElementById('firstname').value,
                lastname: document.getElementById('lastname').value,
                role: document.getElementById('role').value,
                mbti_type: document.getElementById('mbti_type').value
            };

            try {
                const response = await fetch(`http://localhost:6001/api/admin/users/${username}?username=${currentUsername}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    alert('อัพเดทข้อมูลผู้ใช้สำเร็จ');
                    window.closeModal();
                    fetchUsers();
                } else {
                    const error = await response.json();
                    alert(`ไม่สามารถอัพเดทข้อมูลผู้ใช้: ${error.message}`);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('เกิดข้อผิดพลาดในการอัพเดทข้อมูลผู้ใช้');
            }
        };
    })
    .catch(error => {
        console.error('Error:', error);
        alert(`เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้: ${error.message}`);
    });
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

window.loadUserManagement = loadUserManagement;
window.editUser = editUser;
window.closeModal = closeModal;

document.getElementById('user-account-button').addEventListener('click', () => {
    document.querySelectorAll('.analytics-container').forEach(container => {
        container.style.display = 'none';
    });
    document.getElementById('user-management').style.display = 'block';
    const userManagementContainer = document.querySelector('.user-management-content');
    if (userManagementContainer) {
        loadUserManagement(userManagementContainer);
    }
});

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


document.getElementById('backToMainPage').addEventListener('click', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');
    
    try {
        // Check if session is still valid
        const response = await fetch('/api/check-role?username=' + username, {
            credentials: 'include'
        });
        
        if (response.ok) {
            window.location.href = `http://127.0.0.1:5500/page/main_page/mainpage.html?username=${username}`;
        } else {
            throw new Error('Session invalid');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Session expired. Please log in again.');
        window.location.href = 'http://127.0.0.1:5500/page/login_page/index.html';
    }
});
});