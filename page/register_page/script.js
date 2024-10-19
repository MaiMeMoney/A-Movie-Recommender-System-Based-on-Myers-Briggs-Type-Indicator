document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const firstname = document.getElementById('firstname').value;
    const lastname = document.getElementById('lastname').value;
    const email = document.getElementById('email').value;
    const confirmEmail = document.getElementById('confirmEmail').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (email !== confirmEmail) {
        alert("Emails do not match!");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:3000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, firstname, lastname, email, password })
        });

        const result = await response.text();

        if (response.ok) {
            alert(result);
            window.location.href = '../login_page/index.html';  // เปลี่ยนไปหน้า login
        } else {
            alert(result);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Failed to connect to the server');
    }
});