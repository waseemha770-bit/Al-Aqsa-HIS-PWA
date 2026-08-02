/**
 * Al-Aqsa Medical City - Users Accounts & Permissions Module (Fixed & Optimized)
 */
async function initPermissionsModule() {
    const container = document.getElementById('router-view');
    if (!container) return;

    container.innerHTML = `
        <div class="page-header"><h1>إدارة حسابات المستخدمين والصلاحيات</h1></div>
        <div class="actions-bar">
            <button class="btn-primary" id="btn-add-user">إضافة مستخدم جديد</button>
        </div>
        
        <div class="data-table-wrapper">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>اسم المستخدم</th>
                        <th>القسم</th>
                        <th>كلمة المرور</th>
                        <th>الصلاحيات</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody id="users-table-body"></tbody>
            </table>
        </div>

        <div id="user-modal" class="modal">
            <div class="modal-content">
                <span class="close-btn" id="close-user-modal">&times;</span>
                <h2 id="user-modal-title" style="margin-bottom: 20px;">بيانات حساب المستخدم</h2>
                <form id="user-form" class="form-grid">
                    <input type="hidden" id="user-id">
                    
                    <div class="form-control">
                        <label>اسم المستخدم (الدخول)</label>
                        <input type="text" id="user-name" required autocomplete="off">
                    </div>
                    <div class="form-control">
                        <label>كلمة المرور</label>
                        <input type="text" id="user-password" required autocomplete="off">
                    </div>
                    <div class="form-control" style="grid-column: 1 / -1;">
                        <label>القسم</label>
                        <select id="user-department" required><option value="">-- اختر القسم --</option></select>
                    </div>

                    <div class="form-control" style="grid-column: 1 / -1;">
                        <label style="color: var(--primary-color); border-bottom: 1px solid var(--border-color); padding-bottom: 5px;">تحديد الشاشات المسموحة:</label>
                        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:15px; margin-top:10px; background: var(--bg-color); padding: 15px; border-radius: 8px;">
                            <label><input type="checkbox" value="dashboard" class="perm-chk"> لوحة التحكم</label>
                            <label><input type="checkbox" value="patients" class="perm-chk"> المرضى</label>
                            <label><input type="checkbox" value="doctors" class="perm-chk"> الأطباء</label>
                            <label><input type="checkbox" value="appointments" class="perm-chk"> المواعيد</label>
                            <label><input type="checkbox" value="departments" class="perm-chk"> الأقسام</label>
                            <label><input type="checkbox" value="laboratory" class="perm-chk"> المختبر</label>
                            <label><input type="checkbox" value="pharmacy" class="perm-chk"> الصيدلية</label>
                            <label><input type="checkbox" value="invoices" class="perm-chk"> الفواتير</label>
                            <label><input type="checkbox" value="insurance" class="perm-chk"> التأمين</label>
                            <label><input type="checkbox" value="employees" class="perm-chk"> الموارد البشرية</label>
                            <label><input type="checkbox" value="hr_services" class="perm-chk"> الخدمات</label>
                            <label><input type="checkbox" value="nutrition" class="perm-chk"> التغذية</label>
                            <label><input type="checkbox" value="permissions" class="perm-chk"> الصلاحيات</label>
                            <label><input type="checkbox" value="reports" class="perm-chk"> التقارير</label>
                            <label><input type="checkbox" value="settings" class="perm-chk"> الإعدادات</label>
                        </div>
                    </div>
                    <button type="submit" class="btn-primary" style="grid-column: 1 / -1; margin-top: 15px;">حفظ المستخدم</button>
                </form>
            </div>
        </div>
    `;

    const tbody = document.getElementById('users-table-body');
    const modal = document.getElementById('user-modal');
    const form = document.getElementById('user-form');
    let usersList = [];

    async function loadDepartmentsDropdown() {
        const departments = await dbService.getAll('Departments') || [];
        const deptSelect = document.getElementById('user-department');
        deptSelect.innerHTML = '<option value="">-- اختر القسم --</option>';
        if (departments.length === 0) deptSelect.innerHTML += `<option value="إدارة عامة">إدارة عامة (افتراضي)</option>`;
        departments.forEach(dept => deptSelect.innerHTML += `<option value="${dept.name}">${dept.name}</option>`);
    }

    async function loadUsers() {
        usersList = await dbService.getAll('Users') || [];
        tbody.innerHTML = '';
        if(usersList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">لا يوجد مستخدمين مسجلين.</td></tr>`;
            return;
        }
        usersList.forEach(user => {
            const moduleNames = Array.isArray(user.modules) ? user.modules.length : 0;
            tbody.innerHTML += `
                <tr>
                    <td><strong>${user.username}</strong></td>
                    <td><span style="background: var(--bg-color); padding: 4px 8px; border-radius: 4px;">${user.department || '---'}</span></td>
                    <td><span style="color: var(--text-muted);">••••••••</span></td>
                    <td>تم منحه ( ${moduleNames} ) شاشات</td>
                    <td>
                        <button class="btn-sm btn-edit" data-id="${user.id}">تعديل</button>
                        <button class="btn-sm btn-delete" data-id="${user.id}">حذف</button>
                    </td>
                </tr>
            `;
        });
    }

    await loadDepartmentsDropdown();
    await loadUsers();

    document.getElementById('btn-add-user').addEventListener('click', () => {
        form.reset();
        document.getElementById('user-id').value = '';
        document.getElementById('user-modal-title').textContent = 'إنشاء حساب مستخدم';
        document.querySelectorAll('.perm-chk').forEach(chk => chk.checked = false);
        modal.style.display = 'flex';
    });
    document.getElementById('close-user-modal').addEventListener('click', () => modal.style.display = 'none');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const idStr = document.getElementById('user-id').value;
            const selectedModules = [];
            document.querySelectorAll('.perm-chk:checked').forEach(chk => selectedModules.push(chk.value));

            if (selectedModules.length === 0) {
                alert('يجب منح المستخدم صلاحية لشاشة واحدة على الأقل!');
                return;
            }

            const userData = {
                username: document.getElementById('user-name').value.trim(),
                password: document.getElementById('user-password').value.trim(),
                department: document.getElementById('user-department').value,
                modules: selectedModules
            };
            
            // إصلاح المعرف (ID)
            if(idStr && idStr !== '') {
                userData.id = parseInt(idStr);
            }
            
            // التحقق من التكرار بشكل صحيح
            const existingUsers = await dbService.getAll('Users') || [];
            const isDuplicate = existingUsers.some(u => u.username === userData.username && u.id !== userData.id);
            
            if (isDuplicate) {
                alert('اسم المستخدم هذا مسجل مسبقاً!');
                return;
            }

            await dbService.save('Users', userData);
            modal.style.display = 'none';
            await loadUsers();
        } catch (error) {
            console.error(error);
            alert("حدث خطأ أثناء الحفظ");
        }
    });

    tbody.addEventListener('click', async (e) => {
        const id = parseInt(e.target.getAttribute('data-id'));
        if (e.target.classList.contains('btn-edit')) {
            const user = usersList.find(u => u.id === id);
            if (user) {
                document.getElementById('user-id').value = user.id;
                document.getElementById('user-name').value = user.username;
                document.getElementById('user-password').value = user.password;
                document.getElementById('user-department').value = user.department;
                
                document.querySelectorAll('.perm-chk').forEach(chk => {
                    chk.checked = Array.isArray(user.modules) && user.modules.includes(chk.value);
                });
                document.getElementById('user-modal-title').textContent = 'تعديل الصلاحيات';
                modal.style.display = 'flex';
            }
        } else if (e.target.classList.contains('btn-delete')) {
            if (confirm('تأكيد الحذف النهائي للمستخدم؟')) {
                await dbService.delete('Users', id);
                await loadUsers();
            }
        }
    });
}
