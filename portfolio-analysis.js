class PortfolioAnalyzer {
    constructor() {
      this.portfolio = JSON.parse(localStorage.getItem('investmentPortfolio')) || [];
      this.marketData = {};
      this.riskProfile = JSON.parse(localStorage.getItem('userRiskProfile')) || {
        level: 'medium',
        tolerance: 5,
        investmentHorizon: 5
      };
    }
  
    async initialize() {
      await this.loadMarketData();
      this.analyzePortfolio();
      this.setupEventListeners();
    }
  
    async loadMarketData() {
      try {
        // ดึงข้อมูลตลาดล่าสุดจาก API
        const symbols = [...new Set(this.portfolio.map(item => item.symbol))];
        const promises = symbols.map(symbol => 
          fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`)
            .then(res => res.json())
        );
        
        const results = await Promise.all(promises);
        
        symbols.forEach((symbol, index) => {
          this.marketData[symbol] = results[index];
        });
        
      } catch (error) {
        console.error("Error loading market data:", error);
        throw new Error("ไม่สามารถโหลดข้อมูลตลาดได้");
      }
    }
  
    analyzePortfolio() {
      // คำนวณมูลค่าพอร์ตปัจจุบัน
      this.currentValue = this.portfolio.reduce((total, item) => {
        return total + (item.shares * (this.marketData[item.symbol]?.c || item.buyPrice));
      }, 0);
  
      // คำนวณผลตอบแทน
      this.totalInvested = this.portfolio.reduce((total, item) => {
        return total + (item.shares * item.buyPrice);
      }, 0);
      
      this.totalGain = this.currentValue - this.totalInvested;
      this.percentageGain = (this.totalGain / this.totalInvested) * 100;
  
      // วิเคราะห์การกระจายความเสี่ยง
      this.analyzeDiversification();
      
      // วิเคราะห์ความสัมพันธ์ของสินทรัพย์
      this.analyzeCorrelations();
      
      // สร้างคำแนะนำ
      this.generateRecommendations();
      
      // อัปเดต UI
      this.updateDashboard();
    }
  
    analyzeDiversification() {
      // วิเคราะห์การกระจายตัวตาม Sector
      this.sectorAllocation = this.portfolio.reduce((acc, item) => {
        const sector = item.sector || 'อื่นๆ';
        const value = item.shares * (this.marketData[item.symbol]?.c || item.buyPrice);
        acc[sector] = (acc[sector] || 0) + value;
        return acc;
      }, {});
  
      // วิเคราะห์การกระจายตัวตามประเภทสินทรัพย์
      this.assetAllocation = this.portfolio.reduce((acc, item) => {
        const assetType = item.assetType || 'หุ้น';
        const value = item.shares * (this.marketData[item.symbol]?.c || item.buyPrice);
        acc[assetType] = (acc[assetType] || 0) + value;
        return acc;
      }, {});
    }
  
    async analyzeCorrelations() {
      // ใช้ API ในการวิเคราะห์ความสัมพันธ์ระหว่างสินทรัพย์
      try {
        const symbols = this.portfolio.map(item => item.symbol);
        if (symbols.length < 2) return;
        
        const correlationPromises = [];
        for (let i = 0; i < symbols.length; i++) {
          for (let j = i + 1; j < symbols.length; j++) {
            correlationPromises.push(
              this.fetchCorrelation(symbols[i], symbols[j])
            );
          }
        }
        
        this.correlationResults = await Promise.all(correlationPromises);
      } catch (error) {
        console.error("Error analyzing correlations:", error);
      }
    }
  
    async fetchCorrelation(symbol1, symbol2) {
      // ตัวอย่างการคำนวณความสัมพันธ์ (ในระบบจริงควรใช้ API เฉพาะ)
      const res = await fetch(`https://finnhub.io/api/v1/stock/correlation?symbol1=${symbol1}&symbol2=${symbol2}&token=${API_KEY}`);
      const data = await res.json();
      return {
        pair: `${symbol1}-${symbol2}`,
        coefficient: data.coefficient || 0
      };
    }
  
    generateRecommendations() {
      this.recommendations = [];
      
      // ตรวจสอบการกระจายความเสี่ยง
      const sectors = Object.keys(this.sectorAllocation);
      if (sectors.length < 3) {
        this.recommendations.push({
          type: 'diversification',
          priority: 'high',
          message: 'พอร์ตของคุณมีความเสี่ยงสูงเนื่องจากกระจุกตัวใน sector น้อยเกินไป',
          suggestion: 'ควรเพิ่มการลงทุนใน sector อื่นๆ'
        });
      }
      
      // ตรวจสอบความสัมพันธ์ที่สูงเกินไป
      if (this.correlationResults) {
        const highCorrelations = this.correlationResults.filter(r => Math.abs(r.coefficient) > 0.7);
        if (highCorrelations.length > 0) {
          this.recommendations.push({
            type: 'correlation',
            priority: 'medium',
            message: `พบหุ้นที่มีความเคลื่อนไหวใกล้เคียงกัน ${highCorrelations.length} คู่`,
            suggestion: 'พิจารณาลดน้ำหนักหรือเพิ่มสินทรัพย์ประเภทอื่น'
          });
        }
      }
      
      // ตรวจสอบความเหมาะสมกับโปรไฟล์ความเสี่ยง
      const highRiskAssets = this.portfolio.filter(item => item.riskLevel === 'high')
        .reduce((sum, item) => sum + (item.shares * (this.marketData[item.symbol]?.c || item.buyPrice)), 0);
      
      const highRiskPercentage = (highRiskAssets / this.currentValue) * 100;
      
      if (this.riskProfile.level === 'low' && highRiskPercentage > 20) {
        this.recommendations.push({
          type: 'risk',
          priority: 'high',
          message: `พอร์ตของคุณมีความเสี่ยงสูงเกินไป (${highRiskPercentage.toFixed(1)}% ในสินทรัพย์เสี่ยงสูง)`,
          suggestion: 'ควรลดน้ำหนักสินทรัพย์เสี่ยงสูงให้เหลือไม่เกิน 20%'
        });
      }
    }
  
    updateDashboard() {
      // อัปเดตข้อมูลบน UI
      document.getElementById('portfolio-value').textContent = this.currentValue.toLocaleString('th-TH', {
        style: 'currency',
        currency: 'THB'
      });
      
      document.getElementById('portfolio-gain').textContent = `${this.totalGain >= 0 ? '+' : ''}${this.totalGain.toLocaleString('th-TH')} THB (${this.percentageGain.toFixed(2)}%)`;
      document.getElementById('portfolio-gain').className = this.totalGain >= 0 ? 'text-green-500' : 'text-red-500';
      
      // สร้างกราฟการกระจาย Sector
      this.renderSectorChart();
      
      // แสดงคำแนะนำ
      this.displayRecommendations();
    }
  
    renderSectorChart() {
      const ctx = document.getElementById('sector-chart').getContext('2d');
      
      if (this.sectorChart) {
        this.sectorChart.destroy();
      }
      
      const sectors = Object.keys(this.sectorAllocation);
      const data = sectors.map(sector => this.sectorAllocation[sector]);
      
      this.sectorChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: sectors,
          datasets: [{
            data: data,
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
                  return `${label}: ${value.toLocaleString()} THB (${percentage}%)`;
                }
              }
            }
          },
          cutout: '60%'
        }
      });
    }
  
    displayRecommendations() {
      const container = document.getElementById('recommendations-container');
      container.innerHTML = '';
      
      if (this.recommendations.length === 0) {
        container.innerHTML = `
          <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div class="flex items-center">
              <i class="fas fa-check-circle text-green-500 mr-2"></i>
              <span class="font-medium">พอร์ตการลงทุนของคุณมีความสมดุลดี</span>
            </div>
          </div>
        `;
        return;
      }
      
      // เรียงลำดับความสำคัญ
      const sortedRecs = this.recommendations.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
      
      sortedRecs.forEach(rec => {
        const priorityColors = {
          high: 'red',
          medium: 'yellow',
          low: 'blue'
        };
        
        const color = priorityColors[rec.priority];
        
        const element = document.createElement('div');
        element.className = `p-4 mb-3 bg-${color}-50 dark:bg-${color}-900/20 rounded-lg border border-${color}-200 dark:border-${color}-800`;
        element.innerHTML = `
          <div class="flex justify-between items-start">
            <div>
              <div class="flex items-center mb-1">
                <i class="fas fa-exclamation-triangle text-${color}-500 mr-2"></i>
                <span class="font-medium">${rec.message}</span>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-300 ml-5">${rec.suggestion}</p>
            </div>
            <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <i class="fas fa-times"></i>
            </button>
          </div>
        `;
        
        container.appendChild(element);
      });
    }
  
    setupEventListeners() {
      document.getElementById('rebalance-btn').addEventListener('click', () => {
        this.showRebalanceSuggestions();
      });
      
      document.getElementById('save-portfolio').addEventListener('click', () => {
        this.savePortfolioSnapshot();
      });
    }
  
    showRebalanceSuggestions() {
      // วิเคราะห์และแสดงคำแนะนำการปรับสมดุลพอร์ต
      const suggestions = this.generateRebalanceSuggestions();
      
      // แสดงใน Modal
      const modal = new RebalanceModal(suggestions);
      modal.show();
    }
  
    generateRebalanceSuggestions() {
      // ตัวอย่างคำแนะนำการปรับสมดุล
      const suggestions = [];
      
      // ตรวจสอบ Sector ที่มีน้ำหนักมากเกินไป
      const targetSectorWeight = 100 / Object.keys(this.sectorAllocation).length;
      const tolerance = 15; // ±15%
      
      Object.entries(this.sectorAllocation).forEach(([sector, value]) => {
        const currentWeight = (value / this.currentValue) * 100;
        if (Math.abs(currentWeight - targetSectorWeight) > tolerance) {
          const action = currentWeight > targetSectorWeight ? 'ลด' : 'เพิ่ม';
          const amount = Math.abs(currentWeight - targetSectorWeight).toFixed(1);
          
          suggestions.push({
            action,
            symbol: sector,
            amount: `${amount}%`,
            current: `${currentWeight.toFixed(1)}%`,
            target: `${targetSectorWeight.toFixed(1)}%`,
            type: 'sector'
          });
        }
      });
      
      return suggestions;
    }
  
    savePortfolioSnapshot() {
      const snapshot = {
        date: new Date().toISOString(),
        value: this.currentValue,
        composition: {
          sectors: this.sectorAllocation,
          assets: this.assetAllocation
        },
        performance: {
          gain: this.totalGain,
          percentage: this.percentageGain
        }
      };
      
      let snapshots = JSON.parse(localStorage.getItem('portfolioSnapshots')) || [];
      snapshots.push(snapshot);
      localStorage.setItem('portfolioSnapshots', JSON.stringify(snapshots));
      
      showNotification('บันทึกภาพพอร์ตเรียบร้อยแล้ว', 'success');
    }
  }
  
  // Helper function
  function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg text-white ${
      type === 'success' ? 'bg-green-500' : 
      type === 'error' ? 'bg-red-500' : 
      'bg-blue-500'
    } flex items-center animate-slide-in z-50`;
    
    notification.innerHTML = `
      <i class="fas ${
        type === 'success' ? 'fa-check-circle' : 
        type === 'error' ? 'fa-exclamation-circle' : 
        'fa-info-circle'
      } mr-2"></i>
      <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('animate-slide-out');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
  // เริ่มต้นระบบเมื่อหน้าเว็บโหลดเสร็จ
  document.addEventListener('DOMContentLoaded', () => {
    const analyzer = new PortfolioAnalyzer();
    analyzer.initialize();
  });