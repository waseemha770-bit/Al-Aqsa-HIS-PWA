const laboratoryModule = {
    async render() {
        const container = document.getElementById('router-view');
        if (!container) return;

        container.innerHTML = `
            <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20px;">
                <h2 style="color: var(--primary-color);">قسم المختبر والتحاليل</h2>
                <button class="btn-primary" onclick="alert('نافذة طلب تحليل قيد الإنشاء')">طلب تحليل جديد</button>
            </div>
            
            <div class="card" style="padding: 20px; overflow-x: auto;">
                <table class="data-table" style="width: 100%; border-collapse: collapse; text-align: right; background: white;">
                    <thead style="background-color: var(--border-color);">
                        <tr>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">رقم الطلب</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">اسم المريض</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">نوع التحليل</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">الطبيب الطالب</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">حالة النتيجة</th>
                        </tr>
                    </thead>
                    <tbody id="laboratory-tbody">
                        <tr><td colspan="5" style="text-align: center; padding: 20px;">جاري تحميل الفحوصات...</td></tr>
                    </tbody>
                </table>
            </div>
        `;

        await this.loadData();
    },

    async loadData() {
        try {
            const tbody = document.getElementById('laboratory-tbody');
            const rawData = await dbService.getAll('Laboratory'); 
            
            if (!rawData || rawData.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">لا توجد طلبات تحاليل حالياً</td></tr>';
                return;
            }

            tbody.innerHTML = ''; 

            rawData.forEach((item, index) => {
                const tr = document.createElement('tr');
                const statusColor = item.status === 'جاهز' ? 'background: #dcfce3; color: #166534;' : 'background: #fee2e2; color: #991b1b;';
                
                tr.innerHTML = `
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.testId || 'LAB-' + (index + 200)}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;"><strong>${item.patientName || "-"}</strong></td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.testType || "-"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.doctorName || "-"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">
                        <span style="padding: 4px 8px; border-radius: 4px; font-size: 0.9em; ${statusColor}">
                            ${item.status || "قيد العمل"}
                        </span>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error("خطأ في تحميل المختبر:", error);
        }
    }
};

window.laboratoryModule = laboratoryModule;
