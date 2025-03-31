class InteractiveDashboard {
    constructor() {
      this.widgets = [];
      this.layout = JSON.parse(localStorage.getItem('dashboardLayout')) || this.getDefaultLayout();
      this.initialize();
    }
  
    getDefaultLayout() {
      return {
        columns: 3,
        widgets: [
          { id: 'portfolio-summary', col: 1, row: 1, size: 'medium' },
          { id: 'saving-goals', col: 2, row: 1, size: 'medium' },
          { id: 'market-overview', col: 3, row: 1, size: 'medium' },
          { id: 'asset-allocation', col: 1, row: 2, size: 'large' },
          { id: 'recent-transactions', col: 3, row: 2, size: 'small' },
          { id: 'financial-news', col: 2, row: 3, size: 'medium' }
        ]
      };
    }
  
    initialize() {
      this.renderDashboard();
      this.setupDragAndDrop();
      this.loadWidgetData();
      this.setupEventListeners();
    }
  
    renderDashboard() {
      const container = document.getElementById('dashboard-container');
      container.innerHTML = '';
      
      // สร้าง Grid ตามจำนวนคอลัมน์
      container.className = `grid grid-cols-${this.layout.columns} gap-6`;
      
      // สร้าง Widgets ทั้งหมด
      this.layout.widgets.forEach(widgetConfig => {
        const widget = this.createWidget(widgetConfig);
        container.appendChild(widget);
      });
    }
  
    createWidget(config) {
      const widget = document.createElement('div');
      widget.id = `widget-${config.id}`;
      widget.className = `bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden ${this.getSizeClass(config.size)}`;
      widget.dataset.widgetId = config.id;
      widget.dataset.col = config.col;
      widget.dataset.row = config.row;
      
      // Widget Header
      const header = document.createElement('div');
      header.className = 'border-b border-gray-200 dark:border-gray-600 px-4 py-3 flex justify-between items-center';
      header.innerHTML = `
        <h3 class="font-medium">${this.getWidgetTitle(config.id)}</h3>
        <div class="flex space-x-2">
          <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 widget-settings" data-widget="${config.id}">
            <i class="fas fa-cog"></i>
          </button>
          <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 widget-close" data-widget="${config.id}">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `;
      
      // Widget Content
      const content = document.createElement('div');
      content.className = 'p-4 widget-content';
      content.id = `widget-content-${config.id}`;
      
      // Loading state
      content.innerHTML = `
        <div class="flex justify-center items-center h-32">
          <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      `;
      
      widget.appendChild(header);
      widget.appendChild(content);
      
      return widget;
    }
  
    getSizeClass(size) {
      const sizes = {
        small: 'col-span-1 row-span-1',
        medium: 'col-span-1 row-span-2',
        large: 'col-span-2 row-span-2'
      };
      return sizes[size] || sizes.medium;
    }
  
    getWidgetTitle(widgetId) {
      const titles = {
        'portfolio-summary': 'สรุปพอร์ตการลงทุน',
        'saving-goals': 'เป้าหมายการออม',
        'market-overview': 'ภาพรวมตลาด',
        'asset-allocation': 'การจัดสรรสินทรัพย์',
        'recent-transactions': 'รายการล่าสุด',
        'financial-news': 'ข่าวสารการเงิน'
      };
      return titles[widgetId] || widgetId;
    }
  
    async loadWidgetData() {
      // โหลดข้อมูลสำหรับแต่ละ Widget
      const loadingPromises = this.layout.widgets.map(async widgetConfig => {
        const contentDiv = document.getElementById(`widget-content-${widgetConfig.id}`);
        if (!contentDiv) return;
        
        try {
          let contentHtml = '';
          
          switch(widgetConfig.id) {
            case 'portfolio-summary':
              contentHtml = await this.loadPortfolioSummary();
              break;
            case 'saving-goals':
              contentHtml = await this.loadSavingGoals();
              break;
            case 'market-overview':
              contentHtml = await this.loadMarketOverview();
              break;
            case 'asset-allocation':
              contentHtml = await this.loadAssetAllocation();
              break;
            case 'recent-transactions':
              contentHtml = await this.loadRecentTransactions();
              break;
            case 'financial-news':
              contentHtml = await this.loadFinancialNews();
              break;
            default:
              contentHtml = '<p>Widget content not available</p>';
          }
          
          contentDiv.innerHTML = contentHtml;
          this.initializeWidgetInteractions(widgetConfig.id);
        } catch (error) {
          console.error(`Error loading widget ${widgetConfig.id}:`, error);
          contentDiv.innerHTML = `
            <div class="text-center py-8 text-red-500">
              <i class="fas fa-exclamation-triangle mr-2"></i>
              เกิดข้อผิดพลาดในการโหลดข้อมูล
            </div>
          `;
        }
      });
      
      await Promise.all(loadingPromises);
    }
  
    async loadPortfolioSummary() {
      const portfolio = JSON.parse(localStorage.getItem('investmentPortfolio')) || [];
      const savingGoals = JSON.parse(localStorage.getItem('savingGoals')) || [];
      
      // คำนวณมูลค่าพอร์ต
      let portfolioValue = 0;
      let portfolioGain = 0;
      
      if (portfolio.length > 0) {
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
        
        portfolioValue = portfolio.reduce((total, item) => {
          return total + (item.shares * (priceMap[item.symbol] || item.buyPrice));
        }, 0);
        
        portfolioGain = portfolio.reduce((total, item) => {
          return total + (item.shares * ((priceMap[item.symbol] || item.buyPrice) - item.buyPrice));
        }, 0);
      }
      
      // คำนวณการออม
      const totalSaved = savingGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
      const totalTarget = savingGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
      const savingProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
      
      return `
        <div class="space-y-4">
          <div class="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
            <h4 class="text-sm font-medium text-indigo-800 dark:text-indigo-200 mb-2">พอร์ตการลงทุน</h4>
            <p class="text-2xl font-bold">${portfolioValue.toLocaleString('th-TH')} THB</p>
            <p class="${portfolioGain >= 0 ? 'text-green-500' : 'text-red-500'}">
              ${portfolioGain >= 0 ? '+' : ''}${portfolioGain.toLocaleString('th-TH')} THB
            </p>
          </div>
          
          <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <h4 class="text-sm font-medium text-green-800 dark:text-green-200 mb-2">การออม</h4>
            <p class="text-2xl font-bold">${totalSaved.toLocaleString('th-TH')} THB</p>
            <div class="mt-2">
              <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div class="bg-green-500 h-2 rounded-full" style="width: ${savingProgress}%"></div>
              </div>
              <p class="text-xs text-right mt-1">${savingProgress.toFixed(1)}% ของเป้าหมาย</p>
            </div>
          </div>
          
          <button class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition">
            ดูรายละเอียดทั้งหมด
          </button>
        </div>
      `;
    }
  
    async loadMarketOverview() {
      const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=^SET.BK&token=${API_KEY}`);
      const setIndex = await response.json();
      
      const