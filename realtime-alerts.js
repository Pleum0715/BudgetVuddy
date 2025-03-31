class RealtimeAlerts {
    constructor() {
      this.alertSettings = JSON.parse(localStorage.getItem('alertSettings')) || {
        priceAlerts: [],
        portfolioAlerts: [
          { type: 'daily-loss', threshold: 5, active: true },
          { type: 'daily-gain', threshold: 5, active: true }
        ],
        newsAlerts: true
      };
      
      this.socket = null;
      this.initialize();
    }
  
    initialize() {
      this.loadUserPreferences();
      this.setupWebSocket();
      this.setupEventListeners();
      this.checkInitialAlerts();
    }
  
    loadUserPreferences() {
      // โหลดการตั้งค่าการแจ้งเตือนของผู้ใช้
      const savedSettings = localStorage.getItem('alertSettings');
      if (savedSettings) {
        this.alertSettings = JSON.parse(savedSettings);
      }
    }
  
    setupWebSocket() {
      // เชื่อมต่อ WebSocket สำหรับการแจ้งเตือนแบบเรียลไทม์
      this.socket = new WebSocket(`wss://ws.finnhub.io?token=${API_KEY}`);
      
      this.socket.onopen = () => {
        console.log('WebSocket connected');
        
        // Subscribe ถึงหุ้นใน Watchlist
        const watchlist = JSON.parse(localStorage.getItem('stockWatchlist')) || [];
        watchlist.forEach(symbol => {
          this.socket.send(JSON.stringify({ type: 'subscribe', symbol: `${symbol}.BK` }));
        });
      };
      
      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'trade') {
          data.data.forEach(trade => {
            this.checkPriceAlerts(trade.s, trade.p);
          });
        }
      };
      
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        // พยายามเชื่อมต่อใหม่หลังจาก 5 วินาที
        setTimeout(() => this.setupWebSocket(), 5000);
      };
    }
  
    checkPriceAlerts(symbol, price) {
      const plainSymbol = symbol.replace('.BK', '');
      this.alertSettings.priceAlerts.forEach(alert => {
        if (alert.symbol === plainSymbol) {
          if (alert.direction === 'above' && price >= alert.price) {
            this.triggerAlert(`${plainSymbol} ราคาขึ้นถึง ${price} แล้ว`, 'price');
          } else if (alert.direction === 'below' && price <= alert.price) {
            this.triggerAlert(`${plainSymbol} ราคาลงถึง ${price} แล้ว`, 'price');
          }
        }
      });
    }
  
    async checkPortfolioAlerts() {
      const portfolio = JSON.parse(localStorage.getItem('investmentPortfolio')) || [];
      if (portfolio.length === 0) return;
      
      // ดึงข้อมูลราคาปัจจุบัน
      const symbols = [...new Set(portfolio.map(item => item.symbol))];
      const pricePromises = symbols.map(symbol => 
        fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`)
          .then(res => res.json())
      );
      
      const prices = await Promise.all(pricePromises);
      const priceMap = {};
      symbols.forEach((symbol, index) => {
        priceMap[symbol] = prices[index].c;
      });
      
      // คำนวณมูลค่าพอร์ต
      const currentValue = portfolio.reduce((total, item) => {
        return total + (item.shares * (priceMap[item.symbol] || item.buyPrice));
      }, 0);
      
      const yesterdayValue = this.getYesterdayPortfolioValue();
      
      if (yesterdayValue) {
        const change = ((currentValue - yesterdayValue) / yesterdayValue) * 100;
        
        // ตรวจสอบการแจ้งเตือน
        this.alertSettings.portfolioAlerts.forEach(alert => {
          if (alert.active) {
            if (alert.type === 'daily-loss' && change <= -alert.threshold) {
              this.triggerAlert(`พอร์ตลง ${Math.abs(change).toFixed(1)}% วันนี้`, 'portfolio');
            } else if (alert.type === 'daily-gain' && change >= alert.threshold) {
              this.triggerAlert(`พอร์ตขึ้น ${change.toFixed(1)}% วันนี้`, 'portfolio');
            }
          }
        });
      }
      
      // บันทึกมูลค่าปัจจุบันสำหรับใช้ในวันถัดไป
      this.saveTodayPortfolioValue(currentValue);
    }
  
    getYesterdayPortfolioValue() {
      const snapshots = JSON.parse(localStorage.getItem('portfolioSnapshots')) || [];
      if (snapshots.length === 0) return null;
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      const yesterdaySnapshot = snapshots.find(snap => 
        snap.date.split('T')[0] === yesterdayStr
      );
      
      return yesterdaySnapshot ? yesterdaySnapshot.value : null;
    }
  
    saveTodayPortfolioValue(value) {
      const today = new Date().toISOString().split('T')[0];
      let dailyValues = JSON.parse(localStorage.getItem('portfolioDailyValues')) || {};
      
      dailyValues[today] = value;
      localStorage.setItem('portfolioDailyValues', JSON.stringify(dailyValues));
    }
  
    async checkNewsAlerts() {
      if (!this.alertSettings.newsAlerts) return;
      
      try {
        const response = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${API_KEY}`);
        const news = await response.json();
        
        const lastNotifiedId = localStorage.getItem('lastNotifiedNewsId');
        const latestNews = news[0];
        
        if (!lastNotifiedId || lastNotifiedId !== latestNews.id) {
          this.triggerAlert(`ข่าวสารล่าสุด: ${latestNews.headline}`, 'news', latestNews.url);
          localStorage.setItem('lastNotifiedNewsId', latestNews.id);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    }
  
    triggerAlert(message, type, url = null) {
      // สร้างการแจ้งเตือนบนหน้าเว็บ
      this.showWebAlert(message, type, url);
      
      // ส่งการแจ้งเตือนผ่าน Browser Notifications
      if (Notification.permission === 'granted') {
        this.showBrowserNotification(message, type);
      }
      
      // บันทึกประวัติการแจ้งเตือน
      this.logAlert(message, type);
    }
  
    showWebAlert(message, type, url) {
      const alertBar = document.getElementById('alert-bar');
      if (!alertBar) return;
      
      const alertTypeClasses = {
        price: 'bg-blue-100 border-blue-400 text-blue-700',
        portfolio: 'bg-indigo-100 border-indigo-400 text-indigo-700',
        news: 'bg-purple-100 border-purple-400 text-purple-700'
      };
      
      const alert = document.createElement('div');
      alert.className = `px-4 py-3 rounded border ${alertTypeClasses[type]} mb-2 flex justify-between items-center animate-fade-in`;
      
      alert.innerHTML = `
        <div class="flex items-center">
          <i class="fas ${
            type === 'price' ? 'fa-chart-line' : 
            type === 'portfolio' ? 'fa-wallet' : 
            'fa-newspaper'
          } mr-2"></i>
          <span>${message}</span>
        </div>
        ${url ? `<a href="${url}" target="_blank" class="text-sm underline ml-2">ดูรายละเอียด</a>` : ''}
        <button class="ml-4 text-gray-500 hover:text-gray-700 close-alert">
          <i class="fas fa-times"></i>
        </button>
      `;
      
      alert.querySelector('.close-alert').addEventListener('click', () => {
        alert.classList.add('animate-fade-out');
        setTimeout(() => alert.remove(), 300);
      });
      
      alertBar.prepend(alert);
      
      // อัตโนมัติปิดหลังจาก 10 วินาที
      setTimeout(() => {
        alert.classList.add('animate-fade-out');
        setTimeout(() => alert.remove(), 300);
      }, 10000);
    }
  
    showBrowserNotification(message, type) {
      const icon = {
        price: '/assets/icons/chart-line.png',
        portfolio: '/assets/icons/wallet.png',
        news: '/assets/icons/newspaper.png'
      }[type];
      
      const notification = new Notification('BudgetBuddy Alert', {
        body: message,
        icon: icon || '/assets/icons/notification.png'
      });
      
      notification.onclick = () => {
        window.focus();
      };
    }
  
    logAlert(message, type) {
      let alertsHistory = JSON.parse(localStorage.getItem('alertsHistory')) || [];
      
      alertsHistory.unshift({
        timestamp: new Date().toISOString(),
        message,
        type,
        read: false
      });
      
      // จำกัดประวัติไว้ที่ 100 รายการ
      if (alertsHistory.length > 100) {
        alertsHistory = alertsHistory.slice(0, 100);
      }
      
      localStorage.setItem('alertsHistory', JSON.stringify(alertsHistory));
      this.updateUnreadCount();
    }
  
    updateUnreadCount() {
      const alertsHistory = JSON.parse(localStorage.getItem('alertsHistory')) || [];
      const unreadCount = alertsHistory.filter(alert => !alert.read).length;
      
      const badge = document.getElementById('alerts-badge');
      if (badge) {
        badge.textContent = unreadCount > 0 ? unreadCount : '';
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
      }
    }
  
    setupEventListeners() {
      // ตั้งค่าปุ่มจัดการการแจ้งเตือน
      document.getElementById('manage-alerts').addEventListener('click', () => {
        this.showAlertSettings();
      });
      
      // ขออนุญาตแสดง Browser Notifications
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        document.getElementById('enable-notifications').addEventListener('click', () => {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              showNotification('เปิดการแจ้งเตือนเรียบร้อยแล้ว', 'success');
            }
          });
        });
      }
    }
  
    showAlertSettings() {
      const modal = new AlertSettingsModal(this.alertSettings);
      modal.onSave = (newSettings) => {
        this.alertSettings = newSettings;
        localStorage.setItem('alertSettings', JSON.stringify(newSettings));
        showNotification('บันทึกการตั้งค่าเรียบร้อย', 'success');
      };
      modal.show();
    }
  
    checkInitialAlerts() {
      // ตรวจสอบการแจ้งเตือนเมื่อเริ่มต้นแอป
      this.checkPortfolioAlerts();
      this.checkNewsAlerts();
      
      // ตรวจสอบทุก 5 นาที
      setInterval(() => {
        this.checkPortfolioAlerts();
        this.checkNewsAlerts();
      }, 5 * 60 * 1000);
    }
  }
  
  // เริ่มต้นระบบ
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('alert-bar')) {
      const alertsSystem = new RealtimeAlerts();
    }
  });