document.getElementById('profileForm').addEventListener('submit', function (e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Check if passwords match
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    // Perform the update (You can add your backend API request here)
    alert('Profile updated successfully!');
});

function cancelUpdate() {
    // Reset form fields or redirect
    if (confirm('Are you sure you want to cancel?')) {
        document.getElementById('profileForm').reset();
    }
}