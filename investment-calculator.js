// ฟังก์ชันจัดรูปแบบเงิน
function formatCurrency(value) {
    return value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') + ' บาท';
}

// คำนวณดอกเบี้ยทบต้น
function calculateCompoundInterest() {
    try {
        const initialAmount = parseFloat(document.getElementById('initial-amount').value) || 0;
        const monthlyAdd = parseFloat(document.getElementById('monthly-add').value) || 0;
        const years = parseFloat(document.getElementById('years').value) || 0;
        const returnRate = parseFloat(document.getElementById('return-rate').value) / 100 || 0;
        const compoundFreq = parseInt(document.getElementById('compound-freq').value) || 1;
        const inflationRate = parseFloat(document.getElementById('inflation-rate').value) / 100 || 0;
        
        const periods = years * compoundFreq;
        const ratePerPeriod = returnRate / compoundFreq;
        const monthlyRate = returnRate / 12;
        
        // คำนวณมูลค่าในอนาคต
        let futureValue = initialAmount * Math.pow(1 + ratePerPeriod, periods);
        
        // เพิ่มเงินรายเดือน
        if (monthlyAdd > 0) {
            futureValue += monthlyAdd * 12 * ((Math.pow(1 + ratePerPeriod, years) - 1) / ratePerPeriod);
        }
        
        // คำนวณมูลค่าปัจจุบัน (คิดเงินเฟ้อ)
        const presentValue = futureValue / Math.pow(1 + inflationRate, years);
        
        // แสดงผลลัพธ์
        document.getElementById('future-value').textContent = formatCurrency(futureValue);
        document.getElementById('present-value').textContent = formatCurrency(presentValue);
        document.getElementById('compound-results').style.display = 'block';
        
        // สร้างกราฟ
        renderCompoundChart(initialAmount, monthlyAdd, years, returnRate, compoundFreq);
    } catch (error) {
        console.error('Error in calculateCompoundInterest:', error);
        alert('เกิดข้อผิดพลาดในการคำนวณดอกเบี้ยทบต้น');
    }
}

// คำนวณแผนเกษียณ
function calculateRetirement() {
    try {
        const currentAge = parseInt(document.getElementById('current-age').value) || 0;
        const retireAge = parseInt(document.getElementById('retire-age').value) || 0;
        const currentSavings = parseFloat(document.getElementById('current-savings').value) || 0;
        const monthlySave = parseFloat(document.getElementById('monthly-save').value) || 0;
        const returnRate = parseFloat(document.getElementById('retire-return-rate').value) / 100 || 0;
        const inflationRate = parseFloat(document.getElementById('retire-inflation-rate').value) / 100 || 0;
        const yearlySpend = parseFloat(document.getElementById('yearly-spend').value) || 0;
        
        const yearsToSave = retireAge - currentAge;
        
        // คำนวณเงินออมเมื่อเกษียณ
        let retirementSavings = currentSavings * Math.pow(1 + returnRate, yearsToSave);
        retirementSavings += monthlySave * 12 * ((Math.pow(1 + returnRate, yearsToSave) - 1) / returnRate);
        
        // คำนวณเงินที่ต้องการเมื่อเกษียณ (คิดเงินเฟ้อ)
        const yearsAfterRetire = 100 - retireAge; // สมมติอายุ 100 ปี
        const requiredSavings = yearlySpend * ((1 - Math.pow(1 + inflationRate, yearsAfterRetire)) / -inflationRate);
        
        // แสดงผลลัพธ์
        document.getElementById('retirement-savings').textContent = formatCurrency(retirementSavings);
        document.getElementById('required-savings').textContent = formatCurrency(requiredSavings);
        
        const difference = retirementSavings - requiredSavings;
        const resultElement = document.getElementById('retirement-result');
        
        if (difference >= 0) {
            resultElement.innerHTML = `<span class="text-success">คุณพร้อมเกษียณแล้ว! มีเงินเกินความต้องการ ${formatCurrency(difference)}</span>`;
        } else {
            resultElement.innerHTML = `<span class="text-danger">คุณยังขาดเงิน ${formatCurrency(Math.abs(difference))} ในการเกษียณ</span>`;
        }
        
        document.getElementById('retirement-results').style.display = 'block';
    } catch (error) {
        console.error('Error in calculateRetirement:', error);
        alert('เกิดข้อผิดพลาดในการคำนวณแผนเกษียณ');
    }
}

// คำนวณการลงทุนแบบ SIP
function calculateSIP() {
    try {
        const sipAmount = parseFloat(document.getElementById('sip-amount').value) || 0;
        const sipYears = parseFloat(document.getElementById('sip-years').value) || 0;
        const sipReturnRate = parseFloat(document.getElementById('sip-return-rate').value) / 100 || 0;
        
        const months = sipYears * 12;
        const monthlyRate = sipReturnRate / 12;
        
        // คำนวณมูลค่าในอนาคตของ SIP
        const futureValue = sipAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
        const totalInvested = sipAmount * months;
        const estimatedGain = futureValue - totalInvested;
        
        // แสดงผลลัพธ์
        document.getElementById('sip-future-value').textContent = formatCurrency(futureValue);
        document.getElementById('sip-total-invested').textContent = formatCurrency(totalInvested);
        document.getElementById('sip-estimated-gain').textContent = formatCurrency(estimatedGain);
        document.getElementById('sip-results').style.display = 'block';
        
        // สร้างกราฟ SIP
        renderSIPChart(sipAmount, sipYears, sipReturnRate);
    } catch (error) {
        console.error('Error in calculateSIP:', error);
        alert('เกิดข้อผิดพลาดในการคำนวณการลงทุนแบบ SIP');
    }
}

// สร้างกราฟดอกเบี้ยทบต้น
function renderCompoundChart(initialAmount, monthlyAdd, years, returnRate, compoundFreq) {
    const ctx = document.getElementById('compound-chart').getContext('2d');
    
    // ลบกราฟเก่าถ้ามี
    if (window.compoundChart) {
        window.compoundChart.destroy();
    }
    
    const labels = [];
    const data = [];
    let currentValue = initialAmount;
    
    for (let i = 0; i <= years; i++) {
        labels.push(`ปีที่ ${i}`);
        
        if (i > 0) {
            // คำนวณดอกเบี้ยทบต้น
            for (let j = 0; j < compoundFreq; j++) {
                currentValue *= (1 + (returnRate / compoundFreq));
            }
            
            // เพิ่มเงินรายเดือน
            currentValue += monthlyAdd * 12;
        }
        
        data.push(currentValue);
    }
    
    window.compoundChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'มูลค่าการลงทุน',
                data: data,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `มูลค่า: ${formatCurrency(context.raw)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

// สร้างกราฟ SIP
function renderSIPChart(amount, years, returnRate) {
    const ctx = document.getElementById('sip-chart').getContext('2d');
    
    // ลบกราฟเก่าถ้ามี
    if (window.sipChart) {
        window.sipChart.destroy();
    }
    
    const labels = [];
    const data = [];
    let totalInvested = 0;
    let currentValue = 0;
    const monthlyRate = returnRate / 12;
    
    for (let i = 0; i <= years * 12; i++) {
        if (i % 12 === 0) {
            labels.push(`ปีที่ ${i / 12}`);
        } else if (i === years * 12) {
            labels.push(`ปีที่ ${years}`);
        } else {
            labels.push('');
        }
        
        if (i > 0) {
            totalInvested += amount;
            currentValue = (currentValue + amount) * (1 + monthlyRate);
        }
        
        data.push(currentValue);
    }
    
    window.sipChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'มูลค่าการลงทุน',
                data: data,
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `มูลค่า: ${formatCurrency(context.raw)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

// ตั้งค่า Event Listeners เมื่อ DOM โหลดเสร็จ
document.addEventListener('DOMContentLoaded', function() {
    // ตั้งค่าปุ่มคำนวณดอกเบี้ยทบต้น
    const compoundBtn = document.getElementById('calculate-compound');
    if (compoundBtn) {
        compoundBtn.addEventListener('click', calculateCompoundInterest);
    }
    
    // ตั้งค่าปุ่มคำนวณแผนเกษียณ
    const retirementBtn = document.getElementById('calculate-retirement');
    if (retirementBtn) {
        retirementBtn.addEventListener('click', calculateRetirement);
    }
    
    // ตั้งค่าปุ่มคำนวณ SIP
    const sipBtn = document.getElementById('calculate-sip');
    if (sipBtn) {
        sipBtn.addEventListener('click', calculateSIP);
    }
    
    console.log('Event listeners have been set up successfully');
});