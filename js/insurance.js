const insuranceModule = {
    async render() {
        const container = document.getElementById('router-view');
        if (!container) return;

        container.innerHTML = `
            <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20px;">
                <h2 style="color: var(--primary-color);">شركات التأمين الطبي</h2>
                <button class="btn-primary" onclick="alert('نافذة إضافة شركة تأمين قيد الإنشاء')">إضافة شركة جديدة</button>
            </div>
            
            <div class="card" style="padding: 20px; overflow-x: auto;">
                <table class="data-table" style="width: 100%; border-collapse: collapse; text-align: right; background: white;">
                    <thead style="background-color: var(--border-color);">
                        <tr>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">رقم العقد</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">اسم الشركة</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">نسبة التغطية</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">تاريخ الانتهاء</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">الحالة</th>
                        </tr>
                    </thead>
                    <tbody id="insurance-tbody">
                        <tr><td colspan="5" style="text-align: center; padding: 20px;">جاري تحميل بيانات التأمين...</td></tr>
                    </tbody>
                </table>
            </div>
        `;

        await this.loadData();
    },

    async loadData() {
        try {
            const tbody = document.getElementById('insurance-tbody');
            const rawData = await dbService.getAll('Insurance'); 
            
            if (!rawData || rawData.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">لا توجد شركات تأمين مسجلة</td></tr>';
                return;
            }

            tbody.innerHTML = ''; 

            rawData.forEach((item, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.contractId || 'INS-' + (index + 10)}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;"><strong>${item.companyName || "-"}</strong></td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; color: #047857;">${item.coverage || "0"}%</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.expiryDate || "-"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.status || "ساري المفعول"}</td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error("خطأ في تحميل التأمين:", error);
        }
    }
};

window.insuranceModule = insuranceModule;
