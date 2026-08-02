const patientsModule = {
    async render() {
        const container = document.getElementById('router-view');
        if (!container) return;

        container.innerHTML = `
            <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20px;">
                <h2 style="color: var(--primary-color);">شؤون المرضى والملف الطبي</h2>
                <button class="btn-primary" onclick="alert('سيتم برمجة نافذة الإضافة قريباً')">تسجيل مريض جديد</button>
            </div>
            
            <div class="card" style="padding: 20px; overflow-x: auto;">
                <table class="data-table" style="width: 100%; border-collapse: collapse; text-align: right; background: white;">
                    <thead style="background-color: var(--border-color);">
                        <tr>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">رقم الملف</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">اسم المريض</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">العمر</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">الجنس</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">رقم الهاتف</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="patients-tbody">
                        <tr><td colspan="6" style="text-align: center; padding: 20px;">جاري تحميل بيانات المرضى...</td></tr>
                    </tbody>
                </table>
            </div>
        `;

        await this.loadData();
    },

    async loadData() {
        try {
            const tbody = document.getElementById('patients-tbody');
            const rawData = await dbService.getAll('Patients'); 
            
            if (!rawData || rawData.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">لا يوجد مرضى مسجلين حالياً</td></tr>';
                return;
            }

            tbody.innerHTML = ''; 

            rawData.forEach((item, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.fileNumber || index + 1}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name || "-"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.age || "-"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.gender === 'male' ? 'ذكر' : (item.gender === 'female' ? 'أنثى' : '-')}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.phone || "-"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">
                        <button style="padding: 5px 10px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">عرض الملف</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error("خطأ في تحميل المرضى:", error);
        }
    }
};

window.patientsModule = patientsModule;
