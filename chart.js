// chart.js - แก้ไขฟังก์ชัน renderSavingChart
function renderSavingChart(goals) {
    const ctx = document.getElementById('savingChart').getContext('2d');
    
    // ถ้าไม่มีเป้าหมาย ให้แสดงกราฟว่าง
    if (!goals || goals.length === 0) {
        new Chart(ctx, {
            type: 'bar',
            data: { labels: [], datasets: [] },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: true } }
            }
        });
        return;
    }
    
    const goalNames = goals.map(goal => goal.name);
    const currentAmounts = goals.map(goal => goal.currentAmount);
    const targetAmounts = goals.map(goal => goal.targetAmount);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: goalNames,
            datasets: [
                {
                    label: 'ออมแล้ว',
                    data: currentAmounts,
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'เป้าหมาย',
                    data: targetAmounts,
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString() + ' บาท';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw.toLocaleString()} บาท`;
                        }
                    }
                }
            }
        }
    });
}

// แก้ไขฟังก์ชัน renderSavingPieChart
function renderSavingPieChart(goals) {
    const ctx = document.getElementById('savingPieChart').getContext('2d');
    
    // ถ้าไม่มีเป้าหมาย ให้แสดงกราฟว่าง
    if (!goals || goals.length === 0) {
        new Chart(ctx, {
            type: 'pie',
            data: { labels: [], datasets: [] },
            options: { responsive: true }
        });
        return;
    }
    
    const goalNames = goals.map(goal => goal.name);
    const currentAmounts = goals.map(goal => goal.currentAmount);
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: goalNames,
            datasets: [{
                data: currentAmounts,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const value = context.raw;
                            const percentage = Math.round((value / total) * 100);
                            return `${context.label}: ${value.toLocaleString()} บาท (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}