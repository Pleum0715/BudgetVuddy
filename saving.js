// ฟังก์ชันจัดการการเพิ่มเป้าหมายใหม่
function handleAddSavingGoal(e) {
    e.preventDefault();
    
    const goalName = document.getElementById('goal-name').value;
    const targetAmount = parseFloat(document.getElementById('target-amount').value);
    const targetDate = document.getElementById('target-date').value;
    const initialAmount = parseFloat(document.getElementById('initial-amount').value) || 0;
    
    if (!goalName || !targetAmount || !targetDate) {
        showAlert('กรุณากรอกข้อมูลให้ครบทุกช่อง', 'danger');
        return;
    }
    
    const newGoal = {
        id: Date.now().toString(),
        name: goalName,
        targetAmount: targetAmount,
        currentAmount: initialAmount,
        targetDate: targetDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    try {
        // บันทึกลง localStorage
        const goals = JSON.parse(localStorage.getItem('savingGoals')) || [];
        goals.push(newGoal);
        localStorage.setItem('savingGoals', JSON.stringify(goals));
        
        // รีเซ็ตฟอร์ม
        document.getElementById('add-saving-goal-form').reset();
        showAlert('เพิ่มเป้าหมายใหม่เรียบร้อยแล้ว!', 'success');
        
        // โหลดเป้าหมายใหม่
        loadSavingGoals();
    } catch (error) {
        console.error('Error saving goal:', error);
        showAlert('เกิดข้อผิดพลาดในการบันทึกเป้าหมาย', 'danger');
    }
}

// ฟังก์ชันโหลดและแสดงเป้าหมายการออม
function loadSavingGoals() {
    const goalsContainer = document.getElementById('saving-goals-container');
    if (!goalsContainer) return;
    
    const goals = JSON.parse(localStorage.getItem('savingGoals')) || [];
    
    if (goals.length === 0) {
        goalsContainer.innerHTML = `
            <div class="col-12">
                <div class="text-center py-5">
                    <div class="mb-4">
                        <i class="fas fa-piggy-bank text-5xl text-muted"></i>
                    </div>
                    <h4 class="h5 text-muted mb-2">คุณยังไม่มีเป้าหมายการออม</h4>
                    <p class="text-muted">เริ่มต้นโดยการเพิ่มเป้าหมายด้านบน</p>
                </div>
            </div>
        `;
        return;
    }
    
    goalsContainer.innerHTML = goals.map(goal => {
        const progressPercent = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
        const daysLeft = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
        const remainingAmount = goal.targetAmount - goal.currentAmount;
        
        return `
            <div class="col-md-6 col-lg-4">
                <div class="card mb-3">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h5 class="card-title">${goal.name}</h5>
                                <div class="d-flex align-items-center text-muted small">
                                    <i class="fas fa-calendar-day me-1"></i>
                                    <span>${new Date(goal.targetDate).toLocaleDateString('th-TH')}</span>
                                    <span class="mx-2">•</span>
                                    <i class="fas fa-clock me-1"></i>
                                    <span>${daysLeft} วัน</span>
                                </div>
                            </div>
                            <button class="btn btn-sm btn-outline-danger delete-goal" data-id="${goal.id}" title="ลบเป้าหมาย">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                        
                        <div class="mb-3">
                            <div class="d-flex justify-content-between mb-1 small">
                                <span>ความคืบหน้า</span>
                                <span>${progressPercent.toFixed(1)}%</span>
                            </div>
                            <div class="progress">
                                <div class="progress-bar bg-success" 
                                     role="progressbar" 
                                     style="width: ${progressPercent}%" 
                                     aria-valuenow="${goal.currentAmount}" 
                                     aria-valuemin="0" 
                                     aria-valuemax="${goal.targetAmount}">
                                </div>
                            </div>
                        </div>
                        
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <div class="text-success fw-bold">${goal.currentAmount.toLocaleString('th-TH')} ฿</div>
                                <div class="text-muted small">ออมแล้ว</div>
                            </div>
                            <div class="text-center">
                                <div class="fw-bold">${remainingAmount.toLocaleString('th-TH')} ฿</div>
                                <div class="text-muted small">เหลืออีก</div>
                            </div>
                            <div>
                                <div class="text-primary fw-bold">${goal.targetAmount.toLocaleString('th-TH')} ฿</div>
                                <div class="text-muted small">เป้าหมาย</div>
                            </div>
                        </div>
                        
                        <div class="d-grid gap-2">
                            <button class="btn btn-outline-primary add-money" data-id="${goal.id}">
                                <i class="fas fa-plus-circle me-1"></i> เพิ่มเงิน
                            </button>
                            <button class="btn btn-outline-secondary edit-goal" data-id="${goal.id}">
                                <i class="fas fa-edit me-1"></i> แก้ไข
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // เพิ่ม Event Listeners สำหรับปุ่มต่างๆ
    document.querySelectorAll('.delete-goal').forEach(btn => {
        btn.addEventListener('click', handleDeleteGoal);
    });
    
    document.querySelectorAll('.add-money').forEach(btn => {
        btn.addEventListener('click', handleAddMoney);
    });
    
    document.querySelectorAll('.edit-goal').forEach(btn => {
        btn.addEventListener('click', handleEditGoal);
    });
    
    // อัปเดตกราฟการออม
    updateSavingCharts();
}

// ฟังก์ชันแสดง Alert
function showAlert(message, type) {
    const alertTypes = {
        success: {
            icon: 'check-circle',
            bg: 'bg-success',
            text: 'text-white'
        },
        danger: {
            icon: 'exclamation-triangle',
            bg: 'bg-danger',
            text: 'text-white'
        }
    };
    
    const alertConfig = alertTypes[type] || alertTypes.success;
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${alertConfig.bg} ${alertConfig.text} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        <i class="fas fa-${alertConfig.icon} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    const container = document.getElementById('alerts-container') || document.body;
    container.prepend(alertDiv);
    
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 150);
    }, 3000);
}

// ฟังก์ชันอื่นๆ ที่จำเป็น
function handleDeleteGoal(e) {
    const goalId = e.currentTarget.getAttribute('data-id');
    if (!confirm('คุณแน่ใจว่าต้องการลบเป้าหมายนี้?')) return;
    
    const goals = JSON.parse(localStorage.getItem('savingGoals')) || [];
    const updatedGoals = goals.filter(goal => goal.id !== goalId);
    
    localStorage.setItem('savingGoals', JSON.stringify(updatedGoals));
    showAlert('ลบเป้าหมายเรียบร้อยแล้ว', 'success');
    loadSavingGoals();
}

function handleAddMoney(e) {
    const goalId = e.currentTarget.getAttribute('data-id');
    const amount = prompt('กรุณากรอกจำนวนเงินที่ต้องการเพิ่ม (บาท):');
    
    if (!amount || isNaN(amount)) return;
    
    const goals = JSON.parse(localStorage.getItem('savingGoals')) || [];
    const updatedGoals = goals.map(goal => {
        if (goal.id === goalId) {
            return {
                ...goal,
                currentAmount: goal.currentAmount + parseFloat(amount),
                updatedAt: new Date().toISOString()
            };
        }
        return goal;
    });
    
    localStorage.setItem('savingGoals', JSON.stringify(updatedGoals));
    showAlert('เพิ่มเงินเรียบร้อยแล้ว', 'success');
    loadSavingGoals();
}

function handleEditGoal(e) {
    const goalId = e.currentTarget.getAttribute('data-id');
    const goals = JSON.parse(localStorage.getItem('savingGoals')) || [];
    const goal = goals.find(g => g.id === goalId);
    
    if (!goal) return;
    
    // เติมข้อมูลลงในฟอร์ม
    document.getElementById('goal-name').value = goal.name;
    document.getElementById('target-amount').value = goal.targetAmount;
    document.getElementById('target-date').value = goal.targetDate.split('T')[0];
    document.getElementById('initial-amount').value = goal.currentAmount;
    
    // ลบเป้าหมายเดิม
    const updatedGoals = goals.filter(g => g.id !== goalId);
    localStorage.setItem('savingGoals', JSON.stringify(updatedGoals));
    
    // เลื่อนไปยังฟอร์ม
    document.getElementById('goal-name').focus();
}

function updateSavingCharts() {
    const goals = JSON.parse(localStorage.getItem('savingGoals')) || [];
    
    if (typeof renderSavingChart === 'function') {
        renderSavingChart(goals);
    }
    
    if (typeof renderSavingPieChart === 'function') {
        renderSavingPieChart(goals);
    }
}