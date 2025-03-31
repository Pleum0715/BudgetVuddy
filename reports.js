// ระบบรายงานการเงิน
function setupFinancialReports() {
    if (!document.getElementById('report-section')) return;
    
    // ตั้งค่าปุ่มสร้างรายงาน
    document.getElementById('generate-report').addEventListener('click', generateReport);
    
    // โหลดข้อมูลเริ่มต้น
    loadReportData();
}

// โหลดข้อมูลรายงาน
function loadReportData() {
    const reports = JSON.parse(localStorage.getItem('financialReports')) || [];
    
    if (reports.length > 0) {
        renderReportList(reports);
    } else {
        document.getElementById('report-list').innerHTML = `
            <div class="text-center py-12 text-gray-500">
                <i class="fas fa-file-alt text-4xl mb-4"></i>
                <p>คุณยังไม่มีรายงานที่บันทึกไว้</p>
            </div>
        `;
    }
}

// แสดงรายการรายงาน
function renderReportList(reports) {
    const report