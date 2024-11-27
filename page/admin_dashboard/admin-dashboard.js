// admin-dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    const dataSelector = document.getElementById('data-selector');
    const dashboardContent = document.querySelector('.dashboard-content');

    dataSelector.addEventListener('change', (event) => {
        const selectedValue = event.target.value;

        if (selectedValue === 'dashboard') {
            dashboardContent.innerHTML = `
                <h2>DASHBOARD</h2>
                <p>Welcome to the admin dashboard. Select an option from the dropdown menu to view details.</p>
            `;
        } else if (selectedValue === 'user-management') {
            dashboardContent.innerHTML = `
                <h2>User Account Management</h2>
                <p>Manage user accounts here.</p>
            `;
        } else if (selectedValue === 'movie-management') {
            dashboardContent.innerHTML = `
                <h2>Movie Management</h2>
                <p>Manage movies here.</p>
            `;
        }
    });
});

