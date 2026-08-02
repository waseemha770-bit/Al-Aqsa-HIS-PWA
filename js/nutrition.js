const nutritionModule = {
    async render() {
        const container = document.getElementById('router-view');
        if (!container) return;

        container.innerHTML = `
            <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20px;">
                <h2 style="color: var(--primary-color);">قسم التغذية والمطعم (المرضى المرقدين)</h2>
                <button class="btn-primary" onclick="alert('نافذة تحديد الوجبات قيد الإنشاء')">تخصيص وجبة مريض</button>
            </div>
            
            <div class="card" style="padding: 20px; overflow-x: auto;">
                <table class="data-table" style="width: 100%; border-collapse: collapse; text-align: right; background: white;">
                    <thead style="background-color: var(--border-color);">
                        <tr>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">رقم الغرفة/السرير</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">اسم المريض</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">نوع الوجبة (حمية)</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">ملاحظات الطبيب</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">الحالة</th>
                        </tr>
                    </thead>
                    <tbody id="nutrition-tbody">
                        <tr><td colspan="5" style="text-align: center; padding: 20px;">جاري تحميل قوائم التغذية...</td></tr>
                    </tbody>
                </table>
            </div>
        `;

        await this.loadData();
    },

    async loadData() {
        try {
            const tbody = document.getElementById('nutrition-tbody');
            const rawData = await dbService.getAll('Nutrition'); 
            
            if (!rawData || rawData.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">لا توجد وجبات مسجلة حالياً</td></tr>';
                return;
            }

            tbody.innerHTML = ''; 

            rawData.forEach((item) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold;">${item.roomBed || "-"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.patientName || "-"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; color: #b45309;">${item.dietType || "عادي"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.doctorNotes || "لا يوجد"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.status || "تم التقديم"}</td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error("خطأ في تحميل التغذية:", error);
        }
    }
};

window.nutritionModule = nutritionModule;
