const appointmentsModule = {
    async render() {
        const container = document.getElementById('router-view');
        if (!container) return;

        container.innerHTML = `
            <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20px;">
                <h2 style="color: var(--primary-color);">إدارة المواعيد والحجوزات</h2>
                <button class="btn-primary" onclick="alert('نافذة حجز المواعيد قيد الإنشاء')">حجز موعد جديد</button>
            </div>
            
            <div class="card" style="padding: 20px; overflow-x: auto;">
                <table class="data-table" style="width: 100%; border-collapse: collapse; text-align: right; background: white;">
                    <thead style="background-color: var(--border-color);">
                        <tr>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">رقم الحجز</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">اسم المريض</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">الطبيب المعالج</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">العيادة</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">التاريخ والوقت</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">الحالة</th>
                        </tr>
                    </thead>
                    <tbody id="appointments-tbody">
                        <tr><td colspan="6" style="text-align: center; padding: 20px;">جاري تحميل المواعيد...</td></tr>
                    </tbody>
                </table>
            </div>
        `;

        await this.loadData();
    },

    async loadData() {
        try {
            const tbody = document.getElementById('appointments-tbody');
            const rawData = await dbService.getAll('Appointments'); 
            
            if (!rawData || rawData.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">لا توجد مواعيد مسجلة</td></tr>';
                return;
            }

            tbody.innerHTML = ''; 

            rawData.forEach((item, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${index + 1}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.patientName || "-"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.doctorName || "-"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.department || "-"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.dateTime || "-"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">
                        <span style="padding: 4px 8px; background: #e0f2fe; color: #0284c7; border-radius: 4px; font-size: 0.9em;">
                            ${item.status || "قيد الانتظار"}
                        </span>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error("خطأ في تحميل المواعيد:", error);
        }
    }
};

window.appointmentsModule = appointmentsModule;
