const permissionsModule = {
    async render() {
        const container = document.getElementById('router-view');
        if (!container) return;

        container.innerHTML = `
            <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20px;">
                <h2 style="color: var(--primary-color);">حسابات المستخدمين والصلاحيات</h2>
                <button class="btn-primary" onclick="alert('نافذة إضافة مستخدم قيد الإنشاء')">إضافة مستخدم جديد</button>
            </div>
            
            <div class="card" style="padding: 20px; overflow-x: auto;">
                <table class="data-table" style="width: 100%; border-collapse: collapse; text-align: right; background: white;">
                    <thead style="background-color: var(--border-color);">
                        <tr>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">اسم المستخدم</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">البريد الإلكتروني</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">الدور (الصلاحية)</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">حالة الحساب</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="permissions-tbody">
                        <tr><td colspan="5" style="text-align: center; padding: 20px;">جاري تحميل المستخدمين...</td></tr>
                    </tbody>
                </table>
            </div>
        `;

        await this.loadData();
    },

    async loadData() {
        try {
            const tbody = document.getElementById('permissions-tbody');
            const rawData = await dbService.getAll('Users'); 
            
            if (!rawData || rawData.length === 0) {
                // مستخدم افتراضي
                tbody.innerHTML = `
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #eee;"><strong>مدير النظام (أنت)</strong></td>
                        <td style="padding: 12px; border-bottom: 1px solid #eee;">admin@alaqsa.com</td>
                        <td style="padding: 12px; border-bottom: 1px solid #eee; color: #8b5cf6; font-weight: bold;">مدير عام (Admin)</td>
                        <td style="padding: 12px; border-bottom: 1px solid #eee;"><span style="color: green;">نشط</span></td>
                        <td style="padding: 12px; border-bottom: 1px solid #eee;">-</td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = ''; 
            rawData.forEach((item) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name || "-"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.email || "-"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.role || "مستخدم"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.status || "نشط"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">
                        <button style="padding: 4px 8px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">إيقاف</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error("خطأ:", error);
        }
    }
};

window.permissionsModule = permissionsModule;
