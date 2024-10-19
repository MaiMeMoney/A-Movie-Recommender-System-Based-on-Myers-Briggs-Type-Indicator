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

    croppedCanvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append('image', blob);
        formData.append('username', localStorage.getItem('username'));

        try {
            const response = await fetch('http://127.0.0.1:3000/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                document.getElementById('profileImage').src = result.imageUrl;
                alert('✅ Image uploaded and cropped successfully!');
            } else {
                alert('❌ Failed to upload cropped image');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Error uploading cropped image');
        }
    }, 'image/jpeg');
}

// ฟังก์ชันยกเลิกการอัปเดต
function cancelUpdate() {
    if (confirm('Are you sure you want to cancel?')) {
        document.getElementById('profileForm').reset();
    }
}

// ฟังก์ชันย้อนกลับ
function goBack() {
    window.history.back();
}

// ดึงข้อมูลผู้ใช้เมื่อโหลดหน้า
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
            document.getElementById('username').value = userData.username;
            document.getElementById('email').value = userData.email;
            document.getElementById('firstName').value = userData.firstname;
            document.getElementById('lastName').value = userData.lastname;
            document.getElementById('profileName').textContent = `${userData.firstname} ${userData.lastname}`;

            if (userData.profileImage) {
                document.getElementById('profileImage').src = userData.profileImage;
            }
        } else {
            console.error('Failed to fetch user data:', userData.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
});