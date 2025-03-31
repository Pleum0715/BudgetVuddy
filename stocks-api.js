// เปลี่ยน API endpoint เป็น backend ของเรา
const API_BASE_URL = 'http://localhost:5000/api';

// หุ้นไทยหลักๆ ที่จะแสดง
const THAI_STOCKS = [
    { symbol: 'ADVANC.BK', name: 'แอดวานซ์ อินโฟร์ เซอร์วิส', market: 'SET50' },
    { symbol: 'AOT.BK', name: 'ท่าอากาศยานไทย', market: 'SET50' },
    { symbol: 'BDMS.BK', name: 'กรุงเทพดุสิตเวชการ', market: 'SET50' },
    { symbol: 'BEM.BK', name: 'ทางด่วนและรถไฟฟ้ากรุงเทพ', market: 'SET100' },
    { symbol: 'CPALL.BK', name: 'ซีพีออลล์', market: 'SET50' },
    { symbol: 'PTT.BK', name: 'ปตท.', market: 'SET50' },
    { symbol: 'SCB.BK', name: 'ไทยพาณิชย์', market: 'SET50' },
    { symbol: 'SCC.BK', name: 'ปูนซิเมนต์ไทย', market: 'SET50' },
    { symbol: 'KBANK.BK', name: 'กสิกรไทย', market: 'SET50' },
    { symbol: 'TRUE.BK', name: 'ทรู คอร์ปอเรชั่น', market: 'SET100' }
];

// ตัวแปรเก็บข้อมูล
let stockData = [];
let stockChart = null;
let currentSymbol = '';

// ดึงข้อมูลหุ้นจาก API
async function fetchStockData() {
    try {
        showLoadingState();
        
        const promises = THAI_STOCKS.map(async stock => {
            const [quote, profile] = await Promise.all([
                fetchData('quote', stock.symbol),
                fetchData('profile', stock.symbol)
            ]);
            
            return {
                ...stock,
                price: quote.c || 0,
                change: quote.c - quote.pc || 0,
                percentChange: ((quote.c - quote.pc) / quote.pc) * 100 || 0,
                open: quote.o || 0,
                high: quote.h || 0,
                low: quote.l || 0,
                previousClose: quote.pc || 0,
                companyInfo: profile || {}
            };
        });
        
        stockData = await Promise.all(promises);
        renderStockData(stockData);
    } catch (error) {
        showErrorState('ไม่สามารถโหลดข้อมูลหุ้นได้ในขณะนี้');
        console.error('Error fetching stock data:', error);
    }
}

// ฟังก์ชันช่วยสำหรับเรียก API
async function fetchData(endpoint, symbol) {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}?symbol=${symbol}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${endpoint} for ${symbol}:`, error);
        return {};
    }
}

// แสดงสถานะกำลังโหลด
function showLoadingState() {
    document.getElementById('stock-data').innerHTML = `
        <tr>
            <td colspan="6" class="px-6 py-8 text-center">
                <div class="inline-flex items-center">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>กำลังโหลดข้อมูลหุ้น...</span>
                </div>
            </td>
        </tr>
    `;
}

// แสดงสถานะข้อผิดพลาด
function showErrorState(message) {
    document.getElementById('stock-data').innerHTML = `
        <tr>
            <td colspan="6" class="px-6 py-8 text-center text-red-500">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                ${message}
            </td>
        </tr>
    `;
}

// ส่วนอื่นๆ ของโค้ดให้คงเดิม...