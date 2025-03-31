// ระบบแจ้งเตือนการเงิน
function setupNotifications() {
    // ตรวจสอบการแจ้งเตือนเป็นระยะ
    setInterval(checkNotifications, 60000); // ทุก 1 นาที
    
    // ตรวจสอบทันทีเมื่อโหลดหน้า
    checkNotifications();
}

// ตรวจสอบการแจ้งเตือน
function checkNotifications() {
    // ตรวจสอบเป้าหมายการออม
    checkSavingGoals();
    
    // ตรวจสอบการลงทุน
    checkInvestments();
    
    // ตรวจสอบข่าวสารการเงิน
    checkFinancialNews();
}

// ตรวจสอบเป้าหมายการออม
function checkSavingGoals() {
    const savingGoals = JSON.parse(localStorage.getItem('savingGoals')) || [];
    const now = new Date();
    
    savingGoals.forEach(goal => {
        // แจ้งเตือนเมื่อใกล้ถึงวัน deadline
        if (goal.targetDate) {
            const targetDate = new Date(goal.targetDate);
            const daysLeft = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));
            
            if (daysLeft === 7) {
                showNotification('warning', 
                    `เหลืออีก 7 วันก่อนถึงวันครบกำหนดเป้าหมาย "${goal.name}"`);
            }
        }
        
        // แจ้งเตือนเมื่อใกล้ถึงเป้าหมาย (80%)
        const progress = (goal.currentAmount / goal.targetAmount) * 100;
        if (progress >= 80 && progress < 100) {
            showNotification('info',
                `เป้าหมาย "${goal.name}" ความคืบหน้า ${Math.floor(progress)}%`);
        }
    });
}

// ตรวจสอบการลงทุน
function checkInvestments() {
    const investments = JSON.parse(localStorage.getItem('investments')) || [];
    
    investments.forEach(investment => {
        // ตรวจสอบการเปลี่ยนแปลงของพอร์ตการลงทุน
        // (ในระบบจริงควรเชื่อมต่อกับ API การลงทุน)
    });
}

// ตรวจสอบข่าวสารการเงิน
async function checkFinancialNews() {
    try {
        const response = await fetch('https://finnhub.io/api/v1/news?category=general&token=${API_KEY}');
        const news = await response.json();
        
        // บันทึกข่าวล่าสุด
        const lastNotifiedNews = localStorage.getItem('lastNotifiedNews');
        const latestNews = news[0];
        
        if (!lastNotifiedNews || lastNotifiedNews !== latestNews.id) {
            showNotification('news',
                `ข่าวสารการเงินล่าสุด: ${latestNews.headline}`,
                latestNews.url);
            
            localStorage.setItem('lastNotifiedNews', latestNews.id);
        }
    } catch (error) {
        console.error('Error fetching financial news:', error);
    }
}

// แสดงการแจ้งเตือน
function showNotification(type, message, url = null) {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 max-w-xs w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden border-l-4 ${
        type === 'warning' ? 'border-yellow-500' : 
        type === 'info' ? 'border-blue-500' :
        type === 'news' ? 'border-purple-500' : 'border-green-500'
    } animate-slide-in z-50`;
    
    notification.innerHTML = `
        <div class="p-4">
            <div class="flex items-start">
                <div class="flex-shrink-0 pt-0.5">
                    <i class="fas ${
                        type === 'warning' ? 'fa-exclamation-triangle text-yellow-500' : 
                        type === 'info' ? 'fa-info-circle text-blue-500' :
                        type === 'news' ? 'fa-newspaper text-purple-500' : 'fa-check-circle text-green-500'
                    }"></i>
                </div>
                <div class="ml-3 w-0 flex-1">
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                        ${message}
                    </p>
                    ${url ? `
                    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <a href="${url}" target="_blank" class="text-indigo-600 dark:text-indigo-400 hover:underline">
                            อ่านเพิ่มเติม
                        </a>
                    </p>
                    ` : ''}
                </div>
                <div class="ml-4 flex-shrink-0 flex">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                            class="bg-white dark:bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // ปิดอัตโนมัติหลังจาก 10 วินาที (ยกเว้นแจ้งเตือนสำคัญ)
    if (type !== 'warning') {
        setTimeout(() => {
            notification.classList.add('animate-slide-out');
            setTimeout(() => notification.remove(), 300);
        }, 10000);
    }
}

// เริ่มต้นระบบ
document.addEventListener('DOMContentLoaded', setupNotifications);