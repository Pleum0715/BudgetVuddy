// app.js - ระบบจัดการผู้ใช้ทั่วแอปพลิเคชัน

// ตรวจสอบสถานะการเข้าสู่ระบบ
function checkAuth() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    return !!userData;
}

// ตั้งค่าปุ่มออกจากระบบ
function setupLogout() {
    const logoutBtns = document.querySelectorAll('#logout-btn, #logout-btn-mobile');
    
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('userData');
            window.location.href = 'index.html';
        });
    });
}

// ตั้งค่าหน้าเว็บเมื่อโหลดเสร็จ
document.addEventListener('DOMContentLoaded', function() {
    // ตั้งค่าปุ่มออกจากระบบ
    setupLogout();
    
    // ตรวจสอบการเข้าสู่ระบบ
    if (!checkAuth() && !['index.html', 'login.html', 'register.html'].includes(window.location.pathname.split('/').pop())) {
        window.location.href = 'index.html';
    }
    
    // ตั้งค่าหน้าโปรไฟล์ (ถ้ามี)
    if (document.getElementById('profile-image')) {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (userData) {
            document.getElementById('profile-image').src = userData.profilePic || 'https://ui-avatars.com/api/?name=User&background=6366f1&color=fff';
            document.getElementById('nav-profile-pic').src = userData.profilePic || 'https://ui-avatars.com/api/?name=User&background=6366f1&color=fff';
        }
    }
});