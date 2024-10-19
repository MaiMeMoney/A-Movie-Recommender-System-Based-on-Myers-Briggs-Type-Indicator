const bcrypt = require('bcrypt');

// การแฮชรหัสผ่าน 'password123'
bcrypt.hash('password123', 10, (err, hash) => {
    if (err) {
        console.error('Error hashing password:', err);
    } else {
        console.log('Hashed password:', hash);
    }
});