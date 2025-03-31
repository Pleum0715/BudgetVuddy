// เครื่องมือวิเคราะห์การลงทุน
function setupInvestmentAnalysis() {
    if (!document.getElementById('investment-analysis')) return;
    
    // โหลดข้อมูลพอร์ตการลงทุน
    const portfolio = JSON.parse(localStorage.getItem('investmentPortfolio')) || [];
    
    // แสดงผลวิเคราะห์
    renderAnalysis(portfolio);
    
    // ตั้งค่าปุ่มวิเคราะห์
    document.getElementById('analyze-btn').addEventListener('click', analyzePortfolio);
}

// แสดงผลวิเคราะห์
function renderAnalysis(portfolio) {
    if (portfolio.length === 0) {
        document.getElementById('analysis-result').innerHTML = `
            <div class="text-center py-12 text-gray-500">
                <i class="fas fa-chart-pie text-4xl mb-4"></i>
                <p>คุณยังไม่มีพอร์ตการลงทุน</p>
                <button onclick="location.href='investment.html'" 
                        class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                    เริ่มต้นลงทุน
                </button>
            </div>
        `;
        return;
    }
    
    // คำนวณข้อมูลพอร์ต
    const totalValue = portfolio.reduce((sum, item) => sum + (item.shares * item.currentPrice), 0);
    const totalGain = portfolio.reduce((sum, item) => sum + (item.shares * (item.currentPrice - item.buyPrice)), 0);
    const gainPercentage = (totalGain / (totalValue - totalGain)) * 100;
    
    // แบ่งตามประเภทการลงทุน
    const byType = portfolio.reduce((groups, item) => {
        const type = item.type || 'อื่นๆ';
        if (!groups[type]) groups[type] = 0;
        groups[type] += item.shares * item.currentPrice;
        return groups;
    }, {});
    
    // แบ่งตามความเสี่ยง
    const byRisk = portfolio.reduce((groups, item) => {
        const risk = item.risk || 'medium';
        if (!groups[risk]) groups[risk] = 0;
        groups[risk] += item.shares * item.currentPrice;
        return groups;
    }, {});
    
    // สร้าง HTML
    document.getElementById('analysis-result').innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-white dark:bg-gray-700 p-6 rounded-lg shadow">
                <h3 class="font-medium text-gray-500 dark:text-gray-300 mb-2">มูลค่าพอร์ตทั้งหมด</h3>
                <p class="text-2xl font-semibold">${totalValue.toLocaleString()} บาท</p>
            </div>
            <div class="bg-white dark:bg-gray-700 p-6 rounded-lg shadow">
                <h3 class="font-medium text-gray-500 dark:text-gray-300 mb-2">กำไร/ขาดทุน</h3>
                <p class="text-2xl font-semibold ${totalGain >= 0 ? 'text-green-500' : 'text-red-500'}">
                    ${totalGain >= 0 ? '+' : ''}${totalGain.toLocaleString()} บาท
                    <span class="text-sm">(${gainPercentage.toFixed(2)}%)</span>
                </p>
            </div>
            <div class="bg-white dark:bg-gray-700 p-6 rounded-lg shadow">
                <h3 class="font-medium text-gray-500 dark:text-gray-300 mb-2">ความหลากหลาย</h3>
                <p class="text-2xl font-semibold">${Object.keys(byType).length} ประเภท</p>
            </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-white dark:bg-gray-700 p-6 rounded-lg shadow">
                <h3 class="font-medium mb-4">สัดส่วนประเภทการลงทุน</h3>
                <canvas id="portfolio-type-chart" height="250"></canvas>
            </div>
            <div class="bg-white dark:bg-gray-700 p-6 rounded-lg shadow">
                <h3 class="font-medium mb-4">สัดส่วนความเสี่ยง</h3>
                <canvas id="portfolio-risk-chart" height="250"></canvas>
            </div>
        </div>
        
        <div class="mt-8 bg-white dark:bg-gray-700 p-6 rounded-lg shadow">
            <h3 class="font-medium mb-4">คำแนะนำการลงทุน</h3>
            <div id="investment-advice" class="prose dark:prose-invert max-w-none">
                <div class="animate-pulse flex space-x-4">
                    <div class="flex-1 space-y-4 py-1">
                        <div class="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                        <div class="space-y-2">
                            <div class="h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                            <div class="h-4 bg-gray-200 dark:bg-gray-600 rounded w-5/6"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // สร้างกราฟ
    renderPortfolioCharts(byType, byRisk);
    
    // สร้างคำแนะนำ
    generateAdvice(portfolio, totalValue, totalGain);
}

// สร้างกราฟพอร์ตการลงทุน
function renderPortfolioCharts(byType, byRisk) {
    // กราฟประเภทการลงทุน
    const typeCtx = document.getElementById('portfolio-type-chart').getContext('2d');
    new Chart(typeCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(byType),
            datasets: [{
                data: Object.values(byType),
                backgroundColor: [
                    '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', 
                    '#F97316', '#F59E0B', '#10B981', '#14B8A6'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 12,
                        padding: 16,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value.toLocaleString()} บาท (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '70%'
        }
    });
    
    // กราฟความเสี่ยง
    const riskCtx = document.getElementById('portfolio-risk-chart').getContext('2d');
    new Chart(riskCtx, {
        type: 'pie',
        data: {
            labels: Object.keys(byRisk).map(risk => {
                return {
                    'high': 'ความเสี่ยงสูง',
                    'medium': 'ความเสี่ยงปานกลาง',
                    'low': 'ความเสี่ยงต่ำ'
                }[risk] || risk;
            }),
            datasets: [{
                data: Object.values(byRisk),
                backgroundColor: [
                    '#F43F5E', '#F97316', '#10B981'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value.toLocaleString()} บาท (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// สร้างคำแนะนำการลงทุน
function generateAdvice(portfolio, totalValue, totalGain) {
    const adviceElement = document.getElementById('investment-advice');
    
    // วิเคราะห์พอร์ต
    const typeCount = Object.keys(portfolio.reduce((types, item) => {
        types[item.type] = true;
        return types;
    }, {})).length;
    
    const riskDistribution = portfolio.reduce((risks, item) => {
        risks[item.risk] = (risks[item.risk] || 0) + (item.shares * item.currentPrice);
        return risks;
    }, {});
    
    const highRiskPercent = (riskDistribution.high || 0) / totalValue * 100;
    const mediumRiskPercent = (riskDistribution.medium || 0) / totalValue * 100;
    const lowRiskPercent = (riskDistribution.low || 0) / totalValue * 100;
    
    // สร้างคำแนะนำ
    let advice = '';
    
    // คำแนะนำทั่วไป
    advice += `<h4>ภาพรวมพอร์ตการลงทุน</h4>`;
    advice += `<p>พอร์ตการลงทุนของคุณมีมูลค่ารวม <strong>${totalValue.toLocaleString()} บาท</strong> `;
    advice += `ประกอบด้วยการลงทุน <strong>${typeCount} ประเภท</strong> `;
    advice += `และมีผลตอบแทนรวม <strong class="${totalGain >= 0 ? 'text-green-500' : 'text-red-500'}">${totalGain >= 0 ? '+' : ''}${totalGain.toLocaleString()} บาท (${((totalGain/(totalValue-totalGain))*100}%)</strong></p>`;
    
    // คำแนะนำเกี่ยวกับความหลากหลาย
    if (typeCount < 3) {
        advice += `<div class="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 p-4 my-4">
            <h4 class="font-medium text-yellow-800 dark:text-yellow-200">คำแนะนำ: เพิ่มความหลากหลาย</h4>
            <p class="text-yellow-700 dark:text-yellow-300">พอร์ตการลงทุนของคุณมีความหลากหลายต่ำ (มีเพียง ${typeCount} ประเภท) 
            การกระจายการลงทุนไปยังสินทรัพย์หลายประเภทจะช่วยลดความเสี่ยงโดยรวม</p>
        </div>`;
    } else {
        advice += `<div class="bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 p-4 my-4">
            <p class="text-green-700 dark:text-green-300">พอร์ตการลงทุนของคุณมีความหลากหลายดี (${typeCount} ประเภท) 
            ซึ่งช่วยลดความเสี่ยงจากการลงทุนในสินทรัพย์ประเภทเดียว</p>
        </div>`;
    }
    
    // คำแนะนำเกี่ยวกับความเสี่ยง
    if (highRiskPercent > 50) {
        advice += `<div class="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 my-4">
            <h4 class="font-medium text-red-800 dark:text-red-200">คำแนะนำ: ลดความเสี่ยง</h4>
            <p class="text-red-700 dark:text-red-300">พอร์ตการลงทุนของคุณมีความเสี่ยงสูง (${highRiskPercent.toFixed(1)}% ของพอร์ต) 
            คุณอาจต้องการพิจารณาลดการลงทุนที่มีความเสี่ยงสูงและเพิ่มการลงทุนที่มีความเสี่ยงต่ำเพื่อความสมดุล</p>
        </div>`;
    } else if (lowRiskPercent > 70) {
        advice += `<div class="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 p-4 my-4">
            <h4 class="font-medium text-blue-800 dark:text-blue-200">คำแนะนำ: เพิ่มผลตอบแทน</h4>
            <p class="text-blue-700 dark:text-blue-300">พอร์ตการลงทุนของคุณมีความเสี่ยงต่ำมาก (${lowRiskPercent.toFixed(1)}% ของพอร์ต) 
            ซึ่งอาจทำให้ผลตอบแทนโดยรวมต่ำ คุณอาจต้องการพิจารณาเพิ่มการลงทุนที่มีความเสี่ยงปานกลางเพื่อเพิ่มผลตอบแทน</p>
        </div>`;
    }
    
    // คำแนะนำตามผลตอบแทน
    if (totalGain < 0) {
        advice += `<div class="bg-purple-50 dark:bg-purple-900/30 border-l-4 border-purple-500 p-4 my-4">
            <h4 class="font-medium text-purple-800 dark:text-purple-200">คำแนะนำ: ประเมินการขาดทุน</h4>
            <p class="text-purple-700 dark:text-purple-300">พอร์ตการลงทุนของคุณกำลังขาดทุน 
            คุณอาจต้องการทบทวนการลงทุนที่ขาดทุนอย่างต่อเนื่องและพิจารณากำหนดจุดตัดขาดทุน (Stop Loss)</p>
        </div>`;
    }
    
    adviceElement.innerHTML = advice;
}

// วิเคราะห์พอร์ตการลงทุน
function analyzePortfolio() {
    const analysisType = document.getElementById('analysis-type').value;
    const timeframe = document.getElementById('timeframe').value;
    
    // แสดง loading state
    const adviceElement = document.getElementById('investment-advice');
    adviceElement.innerHTML = `
        <div class="animate-pulse flex space-x-4">
            <div class="flex-1 space-y-4 py-1">
                <div class="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                <div class="space-y-2">
                    <div class="h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                    <div class="h-4 bg-gray-200 dark:bg-gray-600 rounded w-5/6"></div>
                </div>
            </div>
        </div>
    `;
    
    // จำลองการวิเคราะห์ (ในระบบจริงควรเชื่อมต่อกับ API)
    setTimeout(() => {
        generateAdvice(
            JSON.parse(localStorage.getItem('investmentPortfolio')) || [],
            analysisType,
            timeframe
        );
    }, 1500);
}

// เริ่มต้นระบบ
document.addEventListener('DOMContentLoaded', setupInvestmentAnalysis);