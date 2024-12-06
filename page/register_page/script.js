document.addEventListener('DOMContentLoaded', function() {
    // การตั้งค่า Slide
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    let currentIndex = 0;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            dots[i].classList.remove('active');
        });

        slides[index].classList.add('active');
        dots[index].classList.add('active');
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % slides.length;
        showSlide(currentIndex);
    }

    function currentSlide(index) {
        currentIndex = index;
        showSlide(currentIndex);
    }

    setInterval(nextSlide, 5000); // เปลี่ยนภาพทุกๆ 5 วินาที

    // การตรวจสอบฟอร์ม
    const inputFields = document.querySelectorAll('#registerForm input[required]');

    inputFields.forEach(input => {
        // ตรวจสอบเมื่อผู้ใช้คลิกออกจากช่อง
        input.addEventListener('blur', function() {
            if (input.value.trim() === '') {
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        });

        // ลบ class error ทันทีเมื่อผู้ใช้พิมพ์ในช่อง
        input.addEventListener('input', function() {
            if (input.value.trim() !== '') {
                input.classList.remove('error');
            }
        });
    });
});

// ฟังก์ชันสำหรับการส่งฟอร์ม
document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const fields = ['username', 'firstname', 'lastname', 'email', 'confirmEmail', 'password', 'confirmPassword'];
    let missingFields = [];
    let hasError = false;

    fields.forEach(field => {
        const input = document.getElementById(field);
        if (input.value.trim() === '') {
            input.classList.add('error'); // เพิ่มคลาส error เพื่อเปลี่ยนสีขอบเป็นสีแดง
            missingFields.push(input.placeholder);
            hasError = true;
        } else {
            input.classList.remove('error'); // ลบคลาส error ถ้ามีการกรอกข้อมูลแล้ว
        }
    });

    if (hasError) {
        showToast(`กรุณากรอกข้อมูลในช่องต่อไปนี้:\n${missingFields.join(', ')}`, "error");
        return;
    }

    const username = document.getElementById('username').value;
    const firstname = document.getElementById('firstname').value;
    const lastname = document.getElementById('lastname').value;
    const email = document.getElementById('email').value;
    const confirmEmail = document.getElementById('confirmEmail').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (email !== confirmEmail) {
        showToast("อีเมลไม่ตรงกัน ❌", "error");
        return;
    }

    if (password !== confirmPassword) {
        showToast("รหัสผ่านไม่ตรงกัน ❌", "error");
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
            showToast(result, "success");
            setTimeout(() => {
                window.location.href = '../login_page/index.html';  // เปลี่ยนไปหน้า login
            }, 3000);
        } else {
            showToast(result, "error");
        }
    } catch (error) {
        console.error('Error:', error);
        showToast("❌ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้", "error");
    }
});

// ฟังก์ชันสำหรับแสดง Toast Notification
function showToast(message, type) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast';  // รีเซ็ตคลาส
    if (type === "error") {
        toast.classList.add('toast-error');  // เพิ่มคลาสสำหรับข้อผิดพลาด
    }
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 4000);
}