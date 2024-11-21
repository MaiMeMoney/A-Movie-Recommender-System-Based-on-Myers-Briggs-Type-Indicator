document.addEventListener('DOMContentLoaded', () => {
    const userTableBody = document.getElementById('userTableBody');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    let currentPage = 1;

    // Fetch and display users
    const fetchUsers = async (page = 1, searchQuery = '') => {
        try {
            const response = await fetch(`http://localhost:5001/api/users?page=${page}&search=${searchQuery}`);
            const data = await response.json();

            // Clear table
            userTableBody.innerHTML = '';

            // Populate table rows
            data.users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.userId}</td>
                    <td>${user.username}</td>
                    <td>${user.mbti || '-'}</td>
                    <td>${user.registerDate}</td>
                    <td>${user.moviesRated || 0}</td>
                    <td>${user.status}</td>
                    <td>
                        <button class="suspend-btn" data-id="${user.userId}">Suspend</button>
                        <button class="delete-btn" data-id="${user.userId}">Delete</button>
                    </td>
                `;
                userTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    // Search button click handler
    searchBtn.addEventListener('click', () => {
        const searchQuery = searchInput.value;
        fetchUsers(1, searchQuery);
    });

    // Next page button click handler
    nextPageBtn.addEventListener('click', () => {
        currentPage++;
        fetchUsers(currentPage);
    });

    // Logout button click handler
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/login.html';
    });

    // Initial fetch
    fetchUsers();
});
