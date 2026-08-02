/**
 * Al-Aqsa Medical City - Human Resources (HR) Module
 * إدارة الموظفين، الأقسام، المسميات الوظيفية، والرواتب
 */

async function initEmployeesModule() {
    const container = document.getElementById('router-view');
    if (!container) return;

    // 1. بناء واجهة المستخدم
    container.innerHTML = `
        <div class="page-header">
            <h1 data-label="employees">الموارد البشرية وشؤون الموظفين</h1>
        </div>
        
        <div class="actions-bar">
            <button class="btn-primary" id="btn-add-employee" data-label="add_employee">إضافة موظف جديد</button>
            <div style="display: flex; gap: 10px;">
                <select id="filter-dept" style="padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
                    <option value="">جميع الأقسام</option>
                    <option value="الإدارة">الإدارة</option>
                    <option value="التمريض">التمريض</option>
                    <option value="الاستقبال">الاستقبال</option>
                    <option value="تقنية المعلومات">تقنية المعلومات</option>
                    <option value="النظافة والصيانة">النظافة والصيانة</option>
                    <option value="الأمن">الأمن</option>
                </select>
                <input type="text" id="search-employee" placeholder="بحث باسم الموظف أو الوظيفة...">
            </div>
        </div>

        <table class="data-table">
            <thead>
                <tr>
                    <th>اسم الموظف</th>
                    <th>القسم</th>
                    <th>المسمى الوظيفي</th>
                    <th>رقم الهاتف</th>
                    <th>تاريخ التعيين</th>
                    <th>الراتب الأساسي</th>
                    <th>الإجراءات</th>
                </tr>
            </thead>
            <tbody id="employees-table-body"></tbody>
        </table>

        <!-- نافذة إضافة/تعديل موظف -->
        <div id="employee-modal" class="modal" style="display: none;">
            <div class="modal-content">
                <span class="close-btn" id="close-employee-modal">&times;</span>
                <h2 id="employee-modal-title">بيانات الموظف</h2>
                <form id="employee-form" class="form-grid">
                    <input type="hidden" id="emp-id">
                    
                    <div class="form-control">
                        <label>اسم الموظف الكامل</label>
                        <input type="text" id="emp-name" required>
                    </div>
                    
                    <div class="form-control">
                        <label>القسم</label>
                        <select id="emp-dept" required>
                            <option value="الإدارة">الإدارة</option>
                            <option value="التمريض">التمريض</option>
                            <option value="الاستقبال">الاستقبال</option>
                            <option value="تقنية المعلومات">تقنية المعلومات</option>
                            <option value="النظافة والصيانة">النظافة والصيانة</option>
                            <option value="الأمن">الأمن</option>
                        </select>
                    </div>
                    
                    <div class="form-control">
                        <label>المسمى الوظيفي</label>
                        <input type="text" id="emp-title" placeholder="مثال: ممرض، محاسب، حارس أمن..." required>
                    </div>
                    
                    <div class="form-control">
                        <label>رقم الهاتف</label>
                        <input type="text" id="emp-phone" required>
                    </div>

                    <div class="form-control">
                        <label>الراتب الأساسي ($)</label>
                        <input type="number" id="emp-salary" min="0" required>
                    </div>

                    <div class="form-control">
                        <label>تاريخ التعيين</label>
                        <input type="date" id="emp-date" required>
                    </div>

                    <button type="submit" class="btn-primary" style="grid-column: 1 / -1; margin-top: 15px;">حفظ بيانات الموظف</button>
                </form>
            </div>
        </div>
    `;

    // تطبيق المسميات الديناميكية
    labelManager.applyLabels(container);

    const tbody = document.getElementById('employees-table-body');
    const modal = document.getElementById('employee-modal');
    const form = document.getElementById('employee-form');
    let employeesList = [];

    // ==========================================
    // 2. جلب وعرض البيانات (CRUD)
    // ==========================================

    async function loadEmployees() {
        employeesList = await dbService.getAll('Employees') || [];
        
        // تطبيق الفلاتر
        const searchTerm = document.getElementById('search-employee').value.toLowerCase();
        const filterDept = document.getElementById('filter-dept').value;

        tbody.innerHTML = '';
        
        const filtered = employeesList.filter(emp => {
            const matchSearch = emp.name.toLowerCase().includes(searchTerm) || emp.jobTitle.toLowerCase().includes(searchTerm);
            const matchDept = filterDept ? (emp.department === filterDept) : true;
            return matchSearch && matchDept;
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">لا يوجد موظفين يطابقون شروط البحث</td></tr>`;
            return;
        }

        filtered.forEach(emp => {
            // تلوين القسم لتمييزه بصرياً
            let deptColor = 'var(--text-color)';
            if (emp.department === 'التمريض') deptColor = '#17a2b8';
            if (emp.department === 'الإدارة') deptColor = '#6f42c1';
            
            tbody.innerHTML += `
                <tr>
                    <td><strong>${emp.name}</strong></td>
                    <td style="color: ${deptColor}; font-weight: bold;">${emp.department}</td>
                    <td>${emp.jobTitle}</td>
                    <td>${emp.phone}</td>
                    <td>${emp.hireDate}</td>
                    <td>${emp.salary} $</td>
                    <td>
                        <button class="btn-sm btn-edit" data-id="${emp.id}">تعديل</button>
                        <button class="btn-sm btn-delete" data-id="${emp.id}">حذف</button>
                    </td>
                </tr>
            `;
        });
    }

    // التهيئة الأساسية
    await loadEmployees();

    // ==========================================
    // 3. الأحداث (Events)
    // ==========================================

    document.getElementById('btn-add-employee').addEventListener('click', () => {
        form.reset();
        document.getElementById('emp-id').value = '';
        document.getElementById('emp-date').valueAsDate = new Date(); // اليوم الافتراضي
        document.getElementById('employee-modal-title').textContent = 'إضافة موظف جديد';
        modal.style.display = 'flex';
    });

    document.getElementById('close-employee-modal').addEventListener('click', () => modal.style.display = 'none');
    
    // أحداث الفلترة والبحث الفوري
    document.getElementById('search-employee').addEventListener('input', loadEmployees);
    document.getElementById('filter-dept').addEventListener('change', loadEmployees);

    // حفظ أو تحديث الموظف
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('emp-id').value;
        const empData = {
            name: document.getElementById('emp-name').value,
            department: document.getElementById('emp-dept').value,
            jobTitle: document.getElementById('emp-title').value,
            phone: document.getElementById('emp-phone').value,
            salary: document.getElementById('emp-salary').value,
            hireDate: document.getElementById('emp-date').value
        };

        if (id) empData.id = parseInt(id);

        await dbService.save('Employees', empData);
        modal.style.display = 'none';
        await loadEmployees();
    });

    // أحداث الجدول (تعديل وحذف)
    tbody.addEventListener('click', async (e) => {
        const id = parseInt(e.target.getAttribute('data-id'));
        
        if (e.target.classList.contains('btn-edit')) {
            const emp = employeesList.find(e => e.id === id);
            if (emp) {
                document.getElementById('emp-id').value = emp.id;
                document.getElementById('emp-name').value = emp.name;
                document.getElementById('emp-dept').value = emp.department;
                document.getElementById('emp-title').value = emp.jobTitle;
                document.getElementById('emp-phone').value = emp.phone;
                document.getElementById('emp-salary').value = emp.salary;
                document.getElementById('emp-date').value = emp.hireDate;
                
                document.getElementById('employee-modal-title').textContent = 'تعديل بيانات الموظف';
                modal.style.display = 'flex';
            }
        } 
        else if (e.target.classList.contains('btn-delete')) {
            if (confirm('هل أنت متأكد من حذف هذا الموظف نهائياً؟')) {
                await dbService.delete('Employees', id);
                await loadEmployees();
            }
        }
    });
}
