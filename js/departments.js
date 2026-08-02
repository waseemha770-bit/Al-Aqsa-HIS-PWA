/**
 * Al-Aqsa Medical City - Departments Management Module
 */
async function initDepartmentsModule() {
    const container = document.getElementById('router-view');
    if (!container) return;

    container.innerHTML = `
        <div class="page-header"><h1>إدارة الأقسام الطبية والإدارية</h1></div>
        <div class="actions-bar">
            <button class="btn-primary" id="btn-add-dept">إضافة قسم جديد</button>
            <input type="text" id="search-dept" placeholder="بحث باسم القسم...">
        </div>
        <div class="data-table-wrapper">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>اسم القسم</th>
                        <th>نوع القسم</th>
                        <th>رئيس القسم / المسؤول</th>
                        <th>الحالة</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody id="dept-table-body"></tbody>
            </table>
        </div>

        <div id="dept-modal" class="modal">
            <div class="modal-content">
                <span class="close-btn" id="close-dept-modal">&times;</span>
                <h2 id="dept-modal-title" style="margin-bottom: 20px;">بيانات القسم</h2>
                <form id="dept-form" class="form-grid">
                    <input type="hidden" id="dept-id">
                    <div class="form-control">
                        <label>اسم القسم (مثل: قسم الجراحة)</label>
                        <input type="text" id="dept-name" required>
                    </div>
                    <div class="form-control">
                        <label>نوع القسم</label>
                        <select id="dept-type">
                            <option value="طبي">طبي</option>
                            <option value="إداري">إداري</option>
                            <option value="خدمات مساندة">خدمات مساندة</option>
                        </select>
                    </div>
                    <div class="form-control">
                        <label>رئيس أو مشرف القسم</label>
                        <input type="text" id="dept-supervisor" required>
                    </div>
                    <div class="form-control">
                        <label>الحالة</label>
                        <select id="dept-status">
                            <option value="نشط">نشط</option>
                            <option value="متوقف">متوقف</option>
                        </select>
                    </div>
                    <button type="submit" class="btn-primary" style="grid-column: 1 / -1; margin-top: 15px;">حفظ القسم</button>
                </form>
            </div>
        </div>
    `;

    const tbody = document.getElementById('dept-table-body');
    const modal = document.getElementById('dept-modal');
    const form = document.getElementById('dept-form');
    let deptList = [];

    async function loadDepartments() {
        deptList = await dbService.getAll('Departments') || [];
        tbody.innerHTML = '';
        if (deptList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">لا توجد أقسام مسجلة. اضغط على "إضافة قسم جديد".</td></tr>`;
            return;
        }
        deptList.forEach(dept => {
            tbody.innerHTML += `
                <tr>
                    <td><strong>${dept.name}</strong></td>
                    <td>${dept.type}</td>
                    <td>${dept.supervisor}</td>
                    <td><span style="color:${dept.status === 'نشط' ? 'green' : 'red'}; font-weight:bold;">${dept.status}</span></td>
                    <td>
                        <button class="btn-sm btn-edit" data-id="${dept.id}">تعديل</button>
                        <button class="btn-sm btn-delete" data-id="${dept.id}">حذف</button>
                    </td>
                </tr>
            `;
        });
    }

    await loadDepartments();

    document.getElementById('btn-add-dept').addEventListener('click', () => {
        form.reset();
        document.getElementById('dept-id').value = '';
        document.getElementById('dept-modal-title').textContent = 'إضافة قسم جديد';
        modal.style.display = 'flex';
    });

    document.getElementById('close-dept-modal').addEventListener('click', () => modal.style.display = 'none');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('dept-id').value;
        const deptData = {
            name: document.getElementById('dept-name').value,
            type: document.getElementById('dept-type').value,
            supervisor: document.getElementById('dept-supervisor').value,
            status: document.getElementById('dept-status').value
        };
        if (id) deptData.id = parseInt(id);
        await dbService.save('Departments', deptData);
        modal.style.display = 'none';
        await loadDepartments();
    });

    tbody.addEventListener('click', async (e) => {
        const id = parseInt(e.target.getAttribute('data-id'));
        if (e.target.classList.contains('btn-edit')) {
            const dept = deptList.find(d => d.id === id);
            if (dept) {
                document.getElementById('dept-id').value = dept.id;
                document.getElementById('dept-name').value = dept.name;
                document.getElementById('dept-type').value = dept.type;
                document.getElementById('dept-supervisor').value = dept.supervisor;
                document.getElementById('dept-status').value = dept.status;
                document.getElementById('dept-modal-title').textContent = 'تعديل بيانات القسم';
                modal.style.display = 'flex';
            }
        } else if (e.target.classList.contains('btn-delete')) {
            if (confirm('هل أنت متأكد من حذف هذا القسم؟')) {
                await dbService.delete('Departments', id);
                await loadDepartments();
            }
        }
    });
}
