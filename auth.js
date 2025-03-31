// auth.js - พัฒนาให้สมบูรณ์
const API_URL = 'https://your-api-endpoint.com';

async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) throw new Error('Login failed');
        
        const data = await response.json();
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        
        return data.user;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

// ตรวจสอบการเข้าสู่ระบบและแสดงผล
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const loginBtn = document.getElementById('login-btn');
    
    if (user) {
        loginBtn.innerHTML = `<i class="fas fa-user me-2"></i>${user.name}`;
        loginBtn.href = "#";
        loginBtn.setAttribute('data-bs-toggle', 'dropdown');
        
        const dropdownMenu = document.createElement('div');
        dropdownMenu.className = 'dropdown-menu dropdown-menu-end';
        dropdownMenu.innerHTML = `
            <a class="dropdown-item" href="profile.html"><i class="fas fa-user-circle me-2"></i>โปรไฟล์</a>
            <a class="dropdown-item" href="#" id="logout-btn"><i class="fas fa-sign-out-alt me-2"></i>ออกจากระบบ</a>
        `;
        
        loginBtn.parentElement.appendChild(dropdownMenu);
        document.getElementById('logout-btn').addEventListener('click', logout);
    } else {
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>เข้าสู่ระบบ';
        loginBtn.href = "login.html";
        loginBtn.removeAttribute('data-bs-toggle');
    }
}

// ตรวจสอบการเข้าถึงหน้า
function protectRoute() {
    const publicPages = ['login.html', 'register.html', 'index.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (publicPages.includes(currentPage)) return;
    
    const token = localStorage.getItem('token');
    if (!token) window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    protectRoute();
});