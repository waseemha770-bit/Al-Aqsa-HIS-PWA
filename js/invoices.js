const invoicesModule = {
    async render() {
        const container = document.getElementById('router-view');
        if (!container) return;

        container.innerHTML = `
            <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20px;">
                <h2 style="color: var(--primary-color);">الفواتير والحسابات</h2>
                <button class="btn-primary" onclick="alert('نافذة إنشاء فاتورة قيد الإنشاء')">إنشاء سند قبض</button>
            </div>
            
            <div class="card" style="padding: 20px; overflow-x: auto;">
                <table class="data-table" style="width: 100%; border-collapse: collapse; text-align: right; background: white;">
                    <thead style="background-color: var(--border-color);">
                        <tr>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">رقم الفاتورة</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">اسم المريض</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">البيان (نوع الخدمة)</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">المبلغ الإجمالي</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">طريقة الدفع</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">التاريخ</th>
                        </tr>
                    </thead>
                    <tbody id="invoices-tbody">
                        <tr><td colspan="6" style="text-align: center; padding: 20px;">جاري تحميل الفواتير...</td></tr>
                    </tbody>
                </table>
            </div>
        `;

        await this.loadData();
    },

    async loadData() {
        try {
            const tbody = document.getElementById('invoices-tbody');
            const rawData = await dbService.getAll('Invoices'); 
            
            if (!rawData || rawData.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">لا توجد حركات مالية مسجلة</td></tr>';
                return;
            }

            tbody.innerHTML = ''; 

            rawData.forEach((item, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.invoiceId || 'INV-' + (index + 500)}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.patientName || "-"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.description || "-"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; color: #047857;">${item.amount || "0"} ريال</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.paymentMethod || "نقداً"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.date || "-"}</td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error("خطأ في تحميل الفواتير:", error);
        }
    }
};

window.invoicesModule = invoicesModule;
