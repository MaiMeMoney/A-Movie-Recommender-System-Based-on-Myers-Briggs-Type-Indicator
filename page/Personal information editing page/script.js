let cropper;  // ตัวแปรสำหรับ Cropper.js

// ฟังก์ชันแสดงภาพที่อัปโหลด
function previewImage(event) {
    const file = event.target.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgElement = document.getElementById('profileImage');
            imgElement.src = e.target.result;
            imgElement.style.display = 'block';

            // เริ่มต้นการครอปรูปภาพ
            if (cropper) {
                cropper.destroy();  // ลบ cropper เดิมถ้ามี
            }

            cropper = new Cropper(imgElement, {
                aspectRatio: 1,  // อัตราส่วน 1:1
                viewMode: 1,
                scalable: true,
                zoomable: true,
                movable: true,
                cropBoxResizable: true,
            });

            document.getElementById('cropButton').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// ฟังก์ชันครอปรูปภาพ
async function cropImage() {
    if (!cropper) return;

    const croppedCanvas = cropper.getCroppedCanvas({
        width: 300,
        height: 300,
    });

    // แปลง canvas เป็น Blob
    croppedCanvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append('image', blob, 'cropped-image.jpg');  // ระบุชื่อไฟล์และ extension
        formData.append('username', localStorage.getItem('username'));

        try {
            const response = await fetch('http://127.0.0.1:3000/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                
                // อัปเดต src ของรูปภาพโดยตรงเพื่อแสดงภาพที่อัปโหลดใหม่
                const profileImage = document.getElementById('profileImage');
                profileImage.src = result.imageUrl + `?timestamp=${new Date().getTime()}`; // เพิ่ม timestamp เพื่อบังคับให้โหลดรูปใหม่
                alert('✅ Image uploaded and cropped successfully!');
            } else {
                const errorText = await response.text();
                alert(`❌ Failed to upload cropped image: ${errorText}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Error uploading cropped image');
        }
    }, 'image/jpeg');  // ตั้งค่า MIME type เป็น jpeg
}

// ฟังก์ชันสำหรับปุ่ม Logout
document.getElementById('logoutButton').addEventListener('click', function () {
    localStorage.removeItem('username');  // ลบข้อมูล username จาก localStorage
    window.location.href = '/page/login_page/index.html';  // เปลี่ยนไปยังหน้าล็อกอิน
});
//ฟังก์ชันเพื่อดึงข้อมูล mbti_type
async function loadUserMBTI() {
    const username = localStorage.getItem('username');
    if (!username) {
        alert('You are not logged in!');
        return;
    }

    try {
        const response = await fetch(`http://127.0.0.1:5001/api/user-mbti/${username}`);
        if (response.ok) {
            const { mbti } = await response.json();
            const mbtiDisplay = document.getElementById('currentMbti');
            mbtiDisplay.querySelector('span').textContent = mbti || 'Not Set';
        } else {
            console.error('Failed to fetch MBTI');
        }
    } catch (error) {
        console.error('Error fetching MBTI:', error);
    }
}

// เรียกฟังก์ชันนี้ใน `DOMContentLoaded`
document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    loadUserMBTI();
});


// ฟังก์ชันแสดง Toast Notification
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 4000);  // แสดง Toast เป็นเวลา 4 วินาที
}

async function loadUserProfile() {
    const username = localStorage.getItem('username');

    if (!username) {
        alert('You are not logged in!');
        window.location.href = '/page/login_page/index.html';
        return;
    }

    try {
        // ดึงข้อมูลผู้ใช้จากเซิร์ฟเวอร์
        const response = await fetch(`http://127.0.0.1:3000/user/${username}`);
        const userData = await response.json();

        if (response.ok) {
            document.getElementById('username').value = userData.username || '';
            document.getElementById('email').value = userData.email || '';
            document.getElementById('firstName').value = userData.firstname || '';
            document.getElementById('lastName').value = userData.lastname || '';
            document.getElementById('profileName').textContent = `${userData.firstname || ''} ${userData.lastname || ''}`;

            const profileImage = document.getElementById('profileImage');
            profileImage.src = userData.profileImage || 'https://www.gravatar.com/avatar/?d=mp&f=y';
        } else {
            console.error('Failed to fetch user data:', userData.message);
        }

        // ดึง MBTI จาก collection mbti_list
        const mbtiResponse = await fetch(`http://127.0.0.1:5001/api/user-mbti/${username}`);
        const mbtiData = await mbtiResponse.json();

        if (mbtiResponse.ok) {
            document.getElementById('currentMbti').querySelector('span').textContent = mbtiData.mbti || 'Not Set';
        } else {
            console.error('Failed to fetch MBTI:', mbtiData.message);
            document.getElementById('currentMbti').querySelector('span').textContent = 'Not Set';
        }
    } catch (error) {
        console.error('Error:', error);
    }
}


// เรียกใช้ฟังก์ชันนี้เมื่อโหลดหน้าโปรไฟล์
document.addEventListener('DOMContentLoaded', loadUserProfile);

// ฟังก์ชันอัปเดตโปรไฟล์
async function updateProfile(event) {
    event.preventDefault();

    const username = localStorage.getItem('username'); // ตรวจสอบว่าได้ค่าจาก localStorage หรือไม่
    const email = document.getElementById('email').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // ตรวจสอบว่ารหัสผ่านและการยืนยันรหัสผ่านตรงกันหรือไม่
    if (password && password !== confirmPassword) {
        alert('❌ Passwords do not match!');
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:3000/update-profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, firstName, lastName, password })
        });

        const result = await response.text();

        if (response.ok) {
            alert('✅ Profile updated successfully!');
            document.getElementById('password').value = '';
            document.getElementById('confirmPassword').value = ''; // ล้างข้อมูลในฟิลด์รหัสผ่านหลังอัปเดต

            // โหลดข้อมูลผู้ใช้ใหม่เพื่อรีเฟรชหน้าโปรไฟล์ทันที
            await loadUserProfile();
        } else {
            alert(`❌ Failed to update profile: ${result}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error updating profile');
    }
}

// เพิ่ม event listener ให้กับปุ่ม "Update"
document.getElementById('profileForm').addEventListener('submit', updateProfile);

// ฟังก์ชันยกเลิกการอัปเดต
function cancelUpdate() {
    if (confirm('Are you sure you want to cancel?')) {
        document.getElementById('profileForm').reset();
    }
}

//ฟังก์ชันเปลี่ยน MBTI
document.getElementById('changeMbtiButton').addEventListener('click', function () {
    window.location.href = '/page/mbti_selection/mbti_selection.html';
});

// Toast Notification สำหรับ Error
function showErrorToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.backgroundColor = '#e63946';
    toast.style.color = '#fff';
    toast.style.padding = '10px';
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.borderRadius = '5px';
    toast.style.zIndex = '1000';
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 4000);
}

// ตัวอย่างการใช้งาน showErrorToast
try {
    // code
} catch (error) {
    showErrorToast('❌ Error occurred!');
}

// ฟังก์ชันดึงข้อมูลผู้ใช้เมื่อโหลดหน้า
document.addEventListener('DOMContentLoaded', async function() {
    const username = localStorage.getItem('username');

    if (!username) {
        alert('You are not logged in!');
        window.location.href = '/page/login_page/index.html';
        return;
    }

    try {
        const response = await fetch(`http://127.0.0.1:3000/user/${username}`);
        const userData = await response.json();

        if (response.ok) {
            document.getElementById('username').value = userData.username || '';
            document.getElementById('email').value = userData.email || '';
            document.getElementById('firstName').value = userData.firstname || '';
            document.getElementById('lastName').value = userData.lastname || '';
            document.getElementById('profileName').textContent = `${userData.firstname || ''} ${userData.lastname || ''}`;

            // ตรวจสอบว่ามีรูปภาพหรือไม่ ถ้าไม่มีให้ใช้รูปเริ่มต้น
            const profileImage = document.getElementById('profileImage');
            if (userData.profileImage && userData.profileImage.trim() !== "") {
                profileImage.src = userData.profileImage;
            } else {
                profileImage.src = 'https://www.gravatar.com/avatar/?d=mp&f=y'; // รูปพื้นฐาน
            }
        } else {
            console.error('Failed to fetch user data:', userData.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
    
});