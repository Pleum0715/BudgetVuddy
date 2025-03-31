// profile.js - ระบบจัดการโปรไฟล์ผู้ใช้

// เริ่มต้นเมื่อหน้าเว็บโหลดเสร็จ
document.addEventListener('DOMContentLoaded', function() {
    // โหลดข้อมูลผู้ใช้
    loadUserData();
    
    // ตั้งค่าการเปลี่ยนแท็บ
    setupProfileTabs();
    
    // ตั้งค่าการอัพโหลดรูปโปรไฟล์
    setupProfileImageUpload();
    
    // ตั้งค่าฟอร์มข้อมูลส่วนตัว
    setupProfileForm();
    
    // ตั้งค่าฟอร์มเป้าหมายการเงิน
    setupGoalsForm();
    
    // ตั้งค่าฟอร์มเปลี่ยนรหัสผ่าน
    setupPasswordForm();
    
    // ตั้งค่าปุ่มลบบัญชี
    setupDeleteAccount();
    
    // ตั้งค่าการแจ้งเตือน
    setupNotificationSettings();
});

// โหลดข้อมูลผู้ใช้จาก localStorage หรือ API
function loadUserData() {
    // ตัวอย่างข้อมูลผู้ใช้ (ในระบบจริงควรดึงจาก API หรือ localStorage)
    const userData = {
        firstName: 'สมชาย',
        lastName: 'ตัวอย่าง',
        email: 'user@example.com',
        phone: '0812345678',
        bio: 'ฉันชอบการจัดการการเงินและการลงทุน',
        profilePic: 'https://ui-avatars.com/api/?name=สมชาย+ตัวอย่าง&background=6366f1&color=fff',
        goals: [
            { name: 'เป้าหมายการออม', target: 50000, current: 32500, type: 'saving' },
            { name: 'เป้าหมายการลงทุน', target: 100000, current: 40000, type: 'investment' }
        ],
        notifications: {
            email: false,
            goals: true,
            news: false
        }
    };
    
    // แสดงข้อมูลผู้ใช้
    displayUserData(userData);
    
    // เก็บข้อมูลใน localStorage (สำหรับตัวอย่าง)
    localStorage.setItem('userData', JSON.stringify(userData));
}

// แสดงข้อมูลผู้ใช้ในหน้าเว็บ
function displayUserData(userData) {
    // แสดงรูปโปรไฟล์
    document.getElementById('profile-image').src = userData.profilePic;
    document.getElementById('nav-profile-pic').src = userData.profilePic;
    
    // แสดงชื่อและอีเมล
    document.getElementById('display-name').textContent = `${userData.firstName} ${userData.lastName}`;
    document.getElementById('display-email').textContent = userData.email;
    
    // เติมฟอร์มข้อมูลส่วนตัว
    document.getElementById('firstname').value = userData.firstName;
    document.getElementById('lastname').value = userData.lastName;
    document.getElementById('email').value = userData.email;
    document.getElementById('phone').value = userData.phone;
    document.getElementById('bio').value = userData.bio;
    
    // แสดงเป้าหมายการเงิน
    renderFinancialGoals(userData.goals);
    
    // ตั้งค่าการแจ้งเตือน
    document.getElementById('toggle-email').checked = userData.notifications.email;
    document.getElementById('toggle-goals').checked = userData.notifications.goals;
    document.getElementById('toggle-news').checked = userData.notifications.news;
}

// ตั้งค่าการเปลี่ยนแท็บโปรไฟล์
function setupProfileTabs() {
    const tabs = document.querySelectorAll('.profile-tab');
    const contents = document.querySelectorAll('.profile-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // ลบ active class จากแท็บทั้งหมด
            tabs.forEach(t => t.classList.remove(
                'text-indigo-600', 'dark:text-indigo-400', 
                'border-indigo-600', 'dark:border-indigo-400'
            ));
            
            // เพิ่ม active class ให้แท็บที่เลือก
            this.classList.add(
                'text-indigo-600', 'dark:text-indigo-400', 
                'border-indigo-600', 'dark:border-indigo-400'
            );
            
            // ซ่อนเนื้อหาทั้งหมด
            contents.forEach(content => content.classList.add('hidden'));
            
            // แสดงเนื้อหาที่เลือก
            const tabId = this.dataset.tab;
            document.getElementById(tabId).classList.remove('hidden');
        });
    });
}

// ตั้งค่าการอัพโหลดรูปโปรไฟล์
function setupProfileImageUpload() {
    const profilePicInput = document.getElementById('profile-pic-input');
    
    profilePicInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            
            reader.onload = function(event) {
                const imgUrl = event.target.result;
                document.getElementById('profile-image').src = imgUrl;
                document.getElementById('nav-profile-pic').src = imgUrl;
                
                // อัปเดตข้อมูลผู้ใช้ (ในระบบจริงควรส่งไปยัง API)
                const userData = JSON.parse(localStorage.getItem('userData') || '{}');
                userData.profilePic = imgUrl;
                localStorage.setItem('userData', JSON.stringify(userData));
                
                showNotification('อัพเดตรูปโปรไฟล์เรียบร้อยแล้ว', 'success');
            };
            
            reader.readAsDataURL(file);
        }
    });
}

// ตั้งค่าฟอร์มข้อมูลส่วนตัว
function setupProfileForm() {
    const form = document.getElementById('profile-form');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // เก็บค่าจากฟอร์ม
        const userData = {
            firstName: document.getElementById('firstname').value,
            lastName: document.getElementById('lastname').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            bio: document.getElementById('bio').value,
            // เก็บข้อมูลอื่นๆ ที่มีอยู่
            ...JSON.parse(localStorage.getItem('userData') || '{}')
        };
        
        // อัปเดตข้อมูล (ในระบบจริงควรส่งไปยัง API)
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // อัปเดตการแสดงผล
        displayUserData(userData);
        
        showNotification('บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว', 'success');
    });
}

// ตั้งค่าฟอร์มเป้าหมายการเงิน
function setupGoalsForm() {
    const form = document.getElementById('goals-form');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const goalName = document.getElementById('goal-name').value;
        const goalType = document.getElementById('goal-type').value;
        const goalAmount = parseFloat(document.getElementById('goal-amount').value);
        const goalDate = document.getElementById('goal-date').value;
        
        if (!goalName || !goalAmount) {
            showNotification('กรุณากรอกชื่อเป้าหมายและจำนวนเงิน', 'error');
            return;
        }
        
        // สร้างเป้าหมายใหม่
        const newGoal = {
            name: goalName,
            type: goalType,
            target: goalAmount,
            current: 0,
            targetDate: goalDate
        };
        
        // เพิ่มเป้าหมาย (ในระบบจริงควรส่งไปยัง API)
        const userData = JSON.parse(localStorage.getItem('userData') || { goals: [] };
        userData.goals = userData.goals || [];
        userData.goals.push(newGoal);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // อัปเดตการแสดงผล
        renderFinancialGoals(userData.goals);
        
        // รีเซ็ตฟอร์ม
        form.reset();
        
        showNotification('เพิ่มเป้าหมายการเงินเรียบร้อยแล้ว', 'success');
    });
}

// แสดงเป้าหมายการเงิน
function renderFinancialGoals(goals) {
    const goalsContainer = document.querySelector('#financial-goals .grid');
    
    if (!goals || goals.length === 0) {
        goalsContainer.innerHTML = `
            <div class="md:col-span-2 text-center py-8 text-gray-500 dark:text-gray-400">
                <i class="fas fa-bullseye text-3xl mb-2"></i>
                <p>คุณยังไม่มีเป้าหมายการเงิน</p>
            </div>
        `;
        return;
    }
    
    // แสดงเป้าหมายทั้งหมด
    goalsContainer.innerHTML = goals.map(goal => {
        const progress = (goal.current / goal.target) * 100;
        
        return `
            <div class="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                <div class="flex justify-between items-center mb-2">
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white">${goal.name}</h3>
                    <span class="text-sm font-medium text-indigo-600 dark:text-indigo-400">${Math.round(progress)}%</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                    <div class="bg-indigo-600 h-2.5 rounded-full" style="width: ${progress}%"></div>
                </div>
                <div class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>฿${goal.current.toLocaleString()} จาก ฿${goal.target.toLocaleString()}</span>
                </div>
                <div class="mt-2 text-xs text-gray-400">
                    <i class="fas fa-calendar-alt mr-1"></i>
                    ${goal.targetDate ? `วันที่เป้าหมาย: ${new Date(goal.targetDate).toLocaleDateString('th-TH')}` : 'ไม่มีกำหนดวันที่'}
                </div>
                <button onclick="deleteGoal('${goal.name}')" class="mt-2 text-red-500 hover:text-red-700 text-sm">
                    <i class="fas fa-trash mr-1"></i> ลบ
                </button>
            </div>
        `;
    }).join('');
}

// ตั้งค่าฟอร์มเปลี่ยนรหัสผ่าน
function setupPasswordForm() {
    const form = document.getElementById('password-form');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (!currentPassword || !newPassword || !confirmPassword) {
            showNotification('กรุณากรอกรหัสผ่านทั้งหมด', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showNotification('รหัสผ่านใหม่ไม่ตรงกัน', 'error');
            return;
        }
        
        // ในระบบจริงควรตรวจสอบรหัสผ่านปัจจุบันกับ API
        // และส่งรหัสผ่านใหม่ไปยัง API
        
        showNotification('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว', 'success');
        form.reset();
    });
}

// ตั้งค่าปุ่มลบบัญชี
function setupDeleteAccount() {
    const deleteBtn = document.getElementById('delete-account');
    
    deleteBtn.addEventListener('click', function() {
        if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีผู้ใช้? การกระทำนี้ไม่สามารถยกเลิกได้')) {
            // ในระบบจริงควรส่งคำขอลบไปยัง API
            localStorage.removeItem('userData');
            showNotification('ลบบัญชีผู้ใช้เรียบร้อยแล้ว', 'success');
            
            // เปลี่ยนหน้าไปที่หน้าแรกหลังจากลบ
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    });
}

// ตั้งค่าการแจ้งเตือน
function setupNotificationSettings() {
    const saveBtn = document.getElementById('save-notifications');
    
    saveBtn.addEventListener('click', function() {
        const userData = JSON.parse(localStorage.getItem('userData') || {};
        
        userData.notifications = {
            email: document.getElementById('toggle-email').checked,
            goals: document.getElementById('toggle-goals').checked,
            news: document.getElementById('toggle-news').checked
        };
        
        localStorage.setItem('userData', JSON.stringify(userData));
        showNotification('บันทึกการตั้งค่าการแจ้งเตือนเรียบร้อยแล้ว', 'success');
    });
}

// แสดงการแจ้งเตือน
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-md shadow-lg text-white ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${
                type === 'success' ? 'fa-check-circle' : 
                type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'
            } mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // ลบการแจ้งเตือนหลังจาก 3 วินาที
    setTimeout(() => {
        notification.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// ฟังก์ชันลบเป้าหมาย (เรียกจาก HTML)
window.deleteGoal = function(goalName) {
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบเป้าหมาย "${goalName}"?`)) {
        const userData = JSON.parse(localStorage.getItem('userData') || {});
        userData.goals = userData.goals.filter(goal => goal.name !== goalName);
        localStorage.setItem('userData', JSON.stringify(userData));
        renderFinancialGoals(userData.goals);
        showNotification('ลบเป้าหมายเรียบร้อยแล้ว', 'success');
    }
};