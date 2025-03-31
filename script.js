// ในส่วนของระบบการออมเงิน
document.addEventListener('DOMContentLoaded', function() {
    // ระบบการออมเงิน
    if (document.getElementById('saving-list')) {
        renderSavingGoals();
        
        // ตั้งค่าปุ่มเพิ่มเป้าหมายการออม
        document.getElementById('add-saving-goal').addEventListener('click', function() {
            const goalName = document.getElementById('goal-name').value;
            const targetAmount = parseFloat(document.getElementById('target-amount').value);
            const currentAmount = parseFloat(document.getElementById('current-amount').value) || 0;
            
            if (!goalName || isNaN(targetAmount)) {
                alert('กรุณากรอกชื่อเป้าหมายและจำนวนเงินที่ต้องการออม');
                return;
            }
            
            addSavingGoal(goalName, targetAmount, currentAmount);
        });
    }
});

// ฟังก์ชันเพิ่มเป้าหมายการออม
function addSavingGoal(goalName, targetAmount, currentAmount = 0) {
    let savingGoals = JSON.parse(localStorage.getItem('savingGoals')) || [];
    
    const newGoal = {
        id: Date.now(),
        name: goalName,
        targetAmount: targetAmount,
        currentAmount: currentAmount,
        createdAt: new Date().toISOString()
    };
    
    savingGoals.push(newGoal);
    localStorage.setItem('savingGoals', JSON.stringify(savingGoals));
    renderSavingGoals();
    
    // รีเซ็ตฟอร์ม
    document.getElementById('goal-name').value = '';
    document.getElementById('target-amount').value = '';
    document.getElementById('current-amount').value = '';
}

// แสดงรายการเป้าหมายการออม
function renderSavingGoals() {
    const savingList = document.getElementById('saving-list');
    const savingGoals = JSON.parse(localStorage.getItem('savingGoals')) || [];
    
    if (savingGoals.length === 0) {
        savingList.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-piggy-bank fa-3x text-muted mb-3"></i>
                <p class="text-muted">ยังไม่มีเป้าหมายการออม</p>
                <button class="btn btn-outline-primary" onclick="showAddGoalModal()">
                    เพิ่มเป้าหมายแรกของคุณ
                </button>
            </div>
        `;
        return;
    }
    
    savingList.innerHTML = savingGoals.map(goal => {
        const progress = (goal.currentAmount / goal.targetAmount) * 100;
        
        return `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h5 class="card-title mb-0">${goal.name}</h5>
                        <div>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteGoal(${goal.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <p class="text-muted mb-2">เป้าหมาย: ${goal.targetAmount.toLocaleString()} บาท</p>
                    <div class="progress mb-2">
                        <div class="progress-bar" 
                             role="progressbar" 
                             style="width: ${progress}%;" 
                             aria-valuenow="${progress}" 
                             aria-valuemin="0" 
                             aria-valuemax="100"></div>
                    </div>
                    <div class="d-flex justify-content-between">
                        <small>ออมแล้ว: ${goal.currentAmount.toLocaleString()} บาท</small>
                        <small>${progress.toFixed(1)}%</small>
                    </div>
                    <div class="d-flex mt-3">
                        <input type="number" class="form-control form-control-sm me-2" 
                               id="add-amount-${goal.id}" placeholder="จำนวนเงินที่ต้องการเพิ่ม">
                        <button class="btn btn-sm btn-success" onclick="addToGoal(${goal.id})">
                            <i class="fas fa-plus"></i> เพิ่ม
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// เพิ่มเงินให้เป้าหมาย
function addToGoal(goalId) {
    const input = document.getElementById(`add-amount-${goalId}`);
    const amount = parseFloat(input.value);
    
    if (isNaN(amount) || amount <= 0) {
        alert('กรุณากรอกจำนวนเงินที่ต้องการเพิ่ม');
        return;
    }
    
    let savingGoals = JSON.parse(localStorage.getItem('savingGoals')) || [];
    savingGoals = savingGoals.map(goal => {
        if (goal.id === goalId) {
            return {
                ...goal,
                currentAmount: goal.currentAmount + amount
            };
        }
        return goal;
    });
    
    localStorage.setItem('savingGoals', JSON.stringify(savingGoals));
    renderSavingGoals();
    input.value = '';
}

// ลบเป้าหมาย
function deleteGoal(goalId) {
    if (confirm('คุณแน่ใจว่าต้องการลบเป้าหมายนี้?')) {
        let savingGoals = JSON.parse(localStorage.getItem('savingGoals')) || [];
        savingGoals = savingGoals.filter(goal => goal.id !== goalId);
        localStorage.setItem('savingGoals', JSON.stringify(savingGoals));
        renderSavingGoals();
    }
}