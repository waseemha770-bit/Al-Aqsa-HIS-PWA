const employeesModule = {
    async render() {
        const container = document.getElementById('router-view');
        if (!container) return;

        container.innerHTML = `
            <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20px; flex-wrap: wrap; gap: 10px;">
                <h2 style="color: var(--primary-color);">إدارة الموارد البشرية والكادر</h2>
                <div style="display: flex; gap: 10px;">
                    <button class="btn-secondary" style="background: #8b5cf6; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">لوحة الرواتب</button>
                    <button class="btn-primary" onclick="alert('نافذة إضافة موظف قيد الإنشاء')">إضافة موظف جديد</button>
                </div>
            </div>
            
            <div class="card" style="padding: 20px; overflow-x: auto;">
                <table class="data-table" style="width: 100%; border-collapse: collapse; text-align: right; background: white;">
                    <thead style="background-color: var(--border-color);">
                        <tr>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">الرقم الوظيفي</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">اسم الموظف</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">المسمى الوظيفي</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">القسم / الإدارة</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">تاريخ التعيين</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">حالة الدوام</th>
                        </tr>
                    </thead>
                    <tbody id="employees-tbody">
                        <tr><td colspan="6" style="text-align: center; padding: 20px;">جاري تحميل بيانات الكادر...</td></tr>
                    </tbody>
                </table>
            </div>
        `;

        await this.loadData();
    },

    async loadData() {
        try {
            const tbody = document.getElementById('employees-tbody');
            const rawData = await dbService.getAll('Employees'); 
            
            if (!rawData || rawData.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">لا يوجد موظفين مسجلين حالياً</td></tr>';
                return;
            }

            tbody.innerHTML = ''; 

            rawData.forEach((item, index) => {
                const tr = document.createElement('tr');
                const statusColor = item.status === 'إجازة' ? 'background: #fef08a; color: #a16207;' : 'background: #dcfce3; color: #166534;';
                
                tr.innerHTML = `
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.empId || 'EMP-' + (index + 1000)}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;"><strong>${item.name || "-"}</strong></td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.jobTitle || "-"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.department || "-"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.joinDate || "-"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">
                        <span style="padding: 4px 8px; border-radius: 4px; font-size: 0.9em; ${statusColor}">
                            ${item.status || "على رأس العمل"}
                        </span>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error("خطأ في تحميل الموظفين:", error);
        }
    }
};

window.employeesModule = employeesModule;
