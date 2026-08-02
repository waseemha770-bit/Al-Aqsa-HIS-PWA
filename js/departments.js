const departmentsModule = {
    async render() {
        const container = document.getElementById('router-view');
        if (!container) return;

        container.innerHTML = `
            <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20px;">
                <h2 style="color: var(--primary-color);">الأقسام والعيادات</h2>
                <button class="btn-primary" onclick="alert('سيتم تفعيل إضافة الأقسام قريباً')">إضافة قسم جديد</button>
            </div>
            
            <div class="card" style="padding: 20px; overflow-x: auto;">
                <table class="data-table" style="width: 100%; border-collapse: collapse; text-align: right; background: white;">
                    <thead style="background-color: var(--border-color);">
                        <tr>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">رقم القسم</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">اسم القسم / العيادة</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">رئيس القسم</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">عدد الغرف المتوفرة</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">حالة العمل</th>
                        </tr>
                    </thead>
                    <tbody id="departments-tbody">
                        <tr><td colspan="5" style="text-align: center; padding: 20px;">جاري تحميل الأقسام...</td></tr>
                    </tbody>
                </table>
            </div>
        `;

        await this.loadData();
    },

    async loadData() {
        try {
            const tbody = document.getElementById('departments-tbody');
            const rawData = await dbService.getAll('Departments'); 
            
            if (!rawData || rawData.length === 0) {
                // عرض بيانات افتراضية توضيحية إذا كانت السحابة فارغة
                tbody.innerHTML = `
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #eee;">1</td>
                        <td style="padding: 12px; border-bottom: 1px solid #eee;">عيادة الباطنية</td>
                        <td style="padding: 12px; border-bottom: 1px solid #eee;">د. أحمد</td>
                        <td style="padding: 12px; border-bottom: 1px solid #eee;">3</td>
                        <td style="padding: 12px; border-bottom: 1px solid #eee;"><span style="color: green;">مفتوح</span></td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = ''; 

            rawData.forEach((item, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${index + 1}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;"><strong>${item.name || "-"}</strong></td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.headOfDept || "-"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.roomsCount || "-"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.status || "نشط"}</td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error("خطأ في تحميل الأقسام:", error);
        }
    }
};

window.departmentsModule = departmentsModule;
