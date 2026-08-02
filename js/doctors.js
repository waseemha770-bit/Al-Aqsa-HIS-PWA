const doctorsModule = {
    async render() {
        const container = document.getElementById('router-view');
        if (!container) return;

        container.innerHTML = `
            <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20px;">
                <h2 style="color: var(--primary-color);">إدارة الأطباء</h2>
                <button class="btn-primary" onclick="alert('سيتم برمجة نافذة الإضافة قريباً')">إضافة طبيب جديد</button>
            </div>
            
            <div class="card" style="padding: 20px; overflow-x: auto;">
                <table class="data-table" style="width: 100%; border-collapse: collapse; text-align: right; background: white;">
                    <thead style="background-color: var(--border-color);">
                        <tr>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">الرقم</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">اسم الطبيب</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">التخصص</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">رقم الهاتف</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">العيادة</th>
                        </tr>
                    </thead>
                    <tbody id="doctors-tbody">
                        <tr><td colspan="5" style="text-align: center; padding: 20px;">جاري تحميل البيانات من السحابة...</td></tr>
                    </tbody>
                </table>
            </div>
        `;

        await this.loadData();
    },

    async loadData() {
        try {
            const tbody = document.getElementById('doctors-tbody');
            // اسم الجدول في Firebase هو Doctors
            const rawData = await dbService.getAll('Doctors'); 
            
            if (!rawData || rawData.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">لا يوجد أطباء مسجلين حالياً</td></tr>';
                return;
            }

            tbody.innerHTML = ''; 

            rawData.forEach((item, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${index + 1}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name || "-"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.specialty || "-"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.phone || "-"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.department || "-"}</td>
                `;
                tbody.appendChild(tr);
            });

        } catch (error) {
            console.error("خطأ في تحميل الأطباء:", error);
            const tbody = document.getElementById('doctors-tbody');
            if(tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">حدث خطأ في الاتصال</td></tr>';
        }
    }
};

window.doctorsModule = doctorsModule;
