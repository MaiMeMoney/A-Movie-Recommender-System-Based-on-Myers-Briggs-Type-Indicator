const jwt = require('jsonwebtoken');

document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username'); // ดึงชื่อผู้ใช้จาก Local Storage

    if (username) {
        const userInfoElement = document.getElementById('logged-in-user').querySelector('span');
        userInfoElement.textContent = username; // แสดงชื่อผู้ใช้ในหน้า
    } else {
        // ถ้าไม่มีข้อมูลใน Local Storage ให้เปลี่ยนเส้นทางไปหน้า Login
        window.location.href = '/login.html';
    }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    // ลบข้อมูลการเข้าสู่ระบบ
    localStorage.removeItem('token'); // หากคุณใช้ Token
    localStorage.removeItem('username'); // หากเก็บชื่อผู้ใช้ไว้

    // เปลี่ยนเส้นทางไปยังหน้า Login
    window.location.href = '../login_page/index.html'; // ปรับเป็น URL ของหน้า Login
});

document.querySelector('[data-action="logout"]').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = '../login_page/index.html';
});



app.get('/admin/verify', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; // แยก Token ออกจาก Header

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try {
        const decoded = jwt.verify(token, 'your_secret_key'); // ใช้คีย์ลับเดียวกับตอนสร้าง Token
        if (decoded.role === 'admin') {
            return res.status(200).json({ message: 'Authorized' });
        } else {
            return res.status(403).json({ message: 'Forbidden: You are not an admin' });
        }
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }


});
