const hr_servicesModule = {
    async render() {
        const container = document.getElementById('router-view');
        if (!container) return;

        container.innerHTML = `
            <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20px;">
                <h2 style="color: var(--primary-color);">الخدمات والمذكرات الداخلية</h2>
                <button class="btn-primary" onclick="alert('نافذة إنشاء مذكرة قيد الإنشاء')">إنشاء مذكرة / طلب جديد</button>
            </div>
            
            <div class="card" style="padding: 20px; overflow-x: auto;">
                <table class="data-table" style="width: 100%; border-collapse: collapse; text-align: right; background: white;">
                    <thead style="background-color: var(--border-color);">
                        <tr>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">رقم المذكرة</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">النوع</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">المرسل</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">القسم الموجه إليه</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">تاريخ الإنشاء</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">حالة الطلب</th>
                        </tr>
                    </thead>
                    <tbody id="memos-tbody">
                        <tr><td colspan="6" style="text-align: center; padding: 20px;">جاري تحميل المذكرات...</td></tr>
                    </tbody>
                </table>
            </div>
        `;

        await this.loadData();
    },

    async loadData() {
        try {
            const tbody = document.getElementById('memos-tbody');
            const rawData = await dbService.getAll('Memos'); 
            
            if (!rawData || rawData.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">صندوق المذكرات فارغ حالياً</td></tr>';
                return;
            }

            tbody.innerHTML = ''; 
            rawData.forEach((item, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.memoId || 'MEMO-' + (index + 1)}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;"><strong>${item.type || "طلب إجازة"}</strong></td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.sender || "-"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.department || "الموارد البشرية"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.date || "-"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;"><span style="color: #d97706;">قيد المراجعة</span></td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error("خطأ:", error);
        }
    }
};

window.hr_servicesModule = hr_servicesModule;
