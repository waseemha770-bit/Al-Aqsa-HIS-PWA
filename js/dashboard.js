/**
 * Al-Aqsa Medical City - Executive Director Dashboard Module
 * لوحة التحكم الشاملة مرتبطة ببيانات المشروع الفعلية
 */
async function initDashboardModule() {
    const routerView = document.getElementById('router-view');
    if (!routerView) return;

    // جلب البيانات من كافة جداول النظام
    const patients = await dbService.getAll('Patients') || [];
    const doctors = await dbService.getAll('Doctors') || [];
    const departments = await dbService.getAll('Departments') || [];
    const appointments = await dbService.getAll('Appointments') || [];
    const invoices = await dbService.getAll('Invoices') || [];
    const insurance = await dbService.getAll('Insurance') || [];
    const employees = await dbService.getAll('Employees') || [];
    const leaves = await dbService.getAll('Leaves') || [];
    const memos = await dbService.getAll('Memos') || [];

    // 1. حساب إجمالي الإيرادات وإيرادات الأشهر للرسم البياني
    let totalRevenue = 0;
    const currentYear = new Date().getFullYear();
    const monthlyData = new Array(12).fill(0); // مصفوفة من 12 شهر تبدأ بـ 0

    invoices.forEach(inv => {
        const amount = parseFloat(inv.paid) || parseFloat(inv.total) || 0;
        totalRevenue += amount;
        
        // حساب إيرادات كل شهر على حدة للرسم البياني
        if (inv.date) {
            const invDate = new Date(inv.date);
            if (invDate.getFullYear() === currentYear) {
                monthlyData[invDate.getMonth()] += amount;
            }
        }
    });

    // 2. حصر الطلبات والبنود المعلقة
    const pendingLeaves = leaves.filter(l => l.status === 'قيد المراجعة').length;
    const pendingMemos = memos.filter(m => m.status === 'معلقة').length;

    // بناء واجهة لوحة المدير الشاملة
    routerView.innerHTML = `
        <div class="page-header">
            <h1 data-label="dashboard_title">لوحة تحكم الإدارة العليا</h1>
        </div>

        <div class="dashboard-cards">
            <div class="stat-card"><h3>المرضى المسجلين</h3><div class="value">${patients.length}</div></div>
            <div class="stat-card"><h3>الكوادر الطبية</h3><div class="value">${doctors.length}</div></div>
            <div class="stat-card"><h3 style="color:var(--primary-color);">الأقسام والعيادات</h3><div class="value">${departments.length}</div></div>
            <div class="stat-card"><h3>المواعيد النشطة</h3><div class="value">${appointments.length}</div></div>
            <div class="stat-card"><h3 style="color:var(--secondary-color);">إجمالي الإيرادات</h3><div class="value" style="color:var(--secondary-color);">${totalRevenue.toFixed(2)} $</div></div>
            <div class="stat-card"><h3>شركات التأمين</h3><div class="value">${insurance.length}</div></div>
            <div class="stat-card" style="border-top-color: var(--accent-color);"><h3>إجازات بانتظار الاعتماد</h3><div class="value" style="color: var(--accent-color);">${pendingLeaves}</div></div>
            <div class="stat-card" style="border-top-color: var(--danger-color);"><h3>مذكرات معلقة</h3><div class="value" style="color: var(--danger-color);">${pendingMemos}</div></div>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-top: 24px;">
            <div style="background: var(--surface-color); padding: 24px; border-radius: var(--border-radius-lg); border: 1px solid var(--border-color); box-shadow: var(--shadow-md);">
                <h3 style="margin-bottom: 20px; font-size: 1.2rem; color: var(--text-main);">الأداء المالي لعام ${currentYear}</h3>
                <div class="chart-container" style="display: flex; justify-content: center; overflow-x: auto;">
                    <canvas id="executiveChart" width="700" height="280" style="max-width: 100%; height: auto;"></canvas>
                </div>
            </div>

            <div style="background: var(--surface-color); padding: 24px; border-radius: var(--border-radius-lg); border: 1px solid var(--border-color); box-shadow: var(--shadow-md); display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <h3 style="margin-bottom: 15px; font-size: 1.2rem; color: var(--text-main);">تنبيهات الإدارة</h3>
                    <ul style="list-style: none; display: flex; flex-direction: column; gap: 12px;">
                        <li style="padding: 12px; background: var(--bg-color); border-radius: var(--border-radius-sm); font-size: 0.9rem; border-right: 4px solid var(--accent-color);">
                            ⚠️ طلبات إجازات تنتظر قرارك: <strong>${pendingLeaves}</strong>
                        </li>
                        <li style="padding: 12px; background: var(--bg-color); border-radius: var(--border-radius-sm); font-size: 0.9rem; border-right: 4px solid var(--danger-color);">
                            📋 مذكرات مرفوعة للاعتماد: <strong>${pendingMemos}</strong>
                        </li>
                        <li style="padding: 12px; background: var(--bg-color); border-radius: var(--border-radius-sm); font-size: 0.9rem; border-right: 4px solid var(--primary-color);">
                            🏥 إجمالي الكوادر العاملة: <strong>${employees.length + doctors.length}</strong>
                        </li>
                    </ul>
                </div>
                <div style="margin-top: 20px;">
                    <button class="btn-primary" style="width: 100%; justify-content: center;" onclick="document.querySelector('a[data-route=\\'hr_services\\']').click()">بوابة الاعتمادات</button>
                </div>
            </div>
        </div>
    `;

    // رسم المخطط بناءً على البيانات الفعلية
    const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    drawExecutiveChart('executiveChart', monthNames, monthlyData);
}

function drawExecutiveChart(canvasId, labels, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width, height = canvas.height;
    const padding = 40;
    
    // إيجاد أعلى قيمة في البيانات لضبط ارتفاع الأعمدة (إذا كانت 0 نضع قيمة افتراضية لتجنب قسمة على 0)
    const maxDataValue = Math.max(...data) > 0 ? Math.max(...data) : 1000;
    const barWidth = (width - padding * 2) / data.length - 15;

    ctx.clearRect(0, 0, width, height);

    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.stroke();

    const rootStyles = getComputedStyle(document.documentElement);
    const primaryColor = rootStyles.getPropertyValue('--primary-color').trim() || '#2563eb';
    const textColor = rootStyles.getPropertyValue('--text-main').trim() || '#1e293b';

    for (let i = 0; i < data.length; i++) {
        const barHeight = (data[i] / maxDataValue) * (height - padding * 2 - 30); 
        const x = padding + 10 + i * (barWidth + 15);
        const y = height - padding - barHeight;

        ctx.fillStyle = primaryColor;
        ctx.fillRect(x, y, barWidth, barHeight);
        ctx.fillStyle = textColor;
        ctx.font = 'bold 11px Cairo, sans-serif';
        ctx.textAlign = 'center';
        // إخفاء الصفر إذا لم يكن هناك إيراد لترتيب الشكل
        if(data[i] > 0) {
            ctx.fillText(data[i].toFixed(0) + '$', x + barWidth / 2, y - 8);
        }
        ctx.fillText(labels[i], x + barWidth / 2, height - padding + 20);
    }
}
