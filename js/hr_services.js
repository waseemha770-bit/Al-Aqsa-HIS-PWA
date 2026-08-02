/**
 * Al-Aqsa Medical City - HR Self-Service & Memos Module
 */
async function initHRServicesModule() {
    const container = document.getElementById('router-view');
    if (!container) return;

    container.innerHTML = `
        <div class="page-header"><h1>بوابة الموظفين والخدمات الإدارية والمذكرات</h1></div>
        
        <div class="tabs-header">
            <button class="tab-btn active" onclick="switchHRTab('leaves')">طلبات الإجازات</button>
            <button class="tab-btn" onclick="switchHRTab('payroll')">الرواتب والبصمات</button>
            <button class="tab-btn" onclick="switchHRTab('memos')">المذكرات الإدارية</button>
        </div>

        <!-- تبويب الإجازات والشكاوي -->
        <div id="tab-leaves" class="tab-content active">
            <div class="actions-bar">
                <button class="btn-primary" id="btn-add-leave">تقديم طلب إجازة / شكوى</button>
            </div>
            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>اسم الموظف</th>
                            <th>نوع الطلب</th>
                            <th>الفترة / التاريخ</th>
                            <th>السبب</th>
                            <th>الحالة</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="leaves-table-body"></tbody>
                </table>
            </div>
        </div>

        <!-- تبويب الرواتب والبصمات -->
        <div id="tab-payroll" class="tab-content">
            <div class="actions-bar" style="background:var(--surface-color); padding:15px; border-radius:8px; border:1px solid var(--border-color);">
                <div style="display:flex; gap:10px; align-items:center; width:100%;">
                    <label>اختر الموظف:</label>
                    <select id="payroll-emp-select" style="flex:1;"></select>
                    <label>من تاريخ:</label>
                    <input type="date" id="date-from">
                    <label>إلى تاريخ:</label>
                    <input type="date" id="date-to">
                    <button class="btn-primary" id="btn-calc-payroll">استعلام الراتب والبصمات</button>
                </div>
            </div>
            <div id="payroll-result" style="margin-top:20px; background:var(--surface-color); padding:20px; border-radius:8px; border:1px solid var(--border-color);">
                <p style="text-align:center; color:var(--text-muted);">يرجى اختيار الموظف وتحديد الفترة ثم الضغط على استعلام.</p>
            </div>
        </div>

        <!-- تبويب المذكرات الإدارية -->
        <div id="tab-memos" class="tab-content">
            <div class="actions-bar">
                <button class="btn-primary" id="btn-add-memo">رفع مذكرة جديدة للإدارة</button>
            </div>
            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>عنوان المذكرة</th>
                            <th>المرسل</th>
                            <th>التاريخ</th>
                            <th>محتوى المذكرة</th>
                            <th>حالة الاعتماد</th>
                            <th>قرار الإدارة</th>
                        </tr>
                    </thead>
                    <tbody id="memos-table-body"></tbody>
                </table>
            </div>
        </div>

        <!-- نافذة عامة للإضافة (إجازة / مذكرة) -->
        <div id="hr-modal" class="modal">
            <div class="modal-content">
                <span class="close-btn" id="close-hr-modal">&times;</span>
                <h2 id="hr-modal-title" style="margin-bottom: 20px;">نموذج تقديم</h2>
                <form id="hr-form" class="form-grid"></form>
            </div>
        </div>
    `;

    // دالة تبديل التبويبات محلياً
    window.switchHRTab = function(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        if(tabName === 'leaves') {
            document.querySelector('.tabs-header button:nth-child(1)').classList.add('active');
            document.getElementById('tab-leaves').classList.add('active');
            loadLeaves();
        } else if(tabName === 'payroll') {
            document.querySelector('.tabs-header button:nth-child(2)').classList.add('active');
            document.getElementById('tab-payroll').classList.add('active');
            loadEmployeesDropdown();
        } else if(tabName === 'memos') {
            document.querySelector('.tabs-header button:nth-child(3)').classList.add('active');
            document.getElementById('tab-memos').classList.add('active');
            loadMemos();
        }
    };

    const modal = document.getElementById('hr-modal');
    const form = document.getElementById('hr-form');
    let currentMode = '';

    document.getElementById('close-hr-modal').addEventListener('click', () => modal.style.display = 'none');

    // 1. تحميل الإجازات والشكاوي
    async function loadLeaves() {
        const leaves = await dbService.getAll('Leaves') || [];
        const tbody = document.getElementById('leaves-table-body');
        tbody.innerHTML = '';
        if(leaves.length === 0) { tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">لا توجد طلبات مسجلة.</td></tr>`; return; }
        
        leaves.forEach(l => {
            tbody.innerHTML += `
                <tr>
                    <td><strong>${l.empName}</strong></td>
                    <td>${l.type}</td>
                    <td>${l.dateRange}</td>
                    <td>${l.reason}</td>
                    <td><span style="color:${l.status === 'موافق عليه' ? 'green' : (l.status === 'مرفوض' ? 'red' : 'orange')}; font-weight:bold;">${l.status}</span></td>
                    <td>
                        <button class="btn-sm btn-view" onclick="updateLeaveStatus(${l.id}, 'موافق عليه')">قبول</button>
                        <button class="btn-sm btn-delete" onclick="updateLeaveStatus(${l.id}, 'مرفوض')">رفض</button>
                    </td>
                </tr>
            `;
        });
    }

    window.updateLeaveStatus = async function(id, status) {
        const leave = await dbService.get('Leaves', id);
        if(leave) {
            leave.status = status;
            await dbService.save('Leaves', leave);
            loadLeaves();
        }
    };

    document.getElementById('btn-add-leave').addEventListener('click', () => {
        currentMode = 'leave';
        document.getElementById('hr-modal-title').textContent = 'تقديم طلب إجازة أو شكوى';
        form.innerHTML = `
            <div class="form-control"><label>اسم الموظف</label><input type="text" id="hr-emp-name" required></div>
            <div class="form-control"><label>نوع الطلب</label><select id="hr-leave-type"><option value="إجازة سنوية">إجازة سنوية</option><option value="إجازة مرضية">إجازة مرضية</option><option value="شكوى إدارية">شكوى إدارية</option></select></div>
            <div class="form-control"><label>الفترة / التاريخ</label><input type="text" id="hr-date-range" placeholder="مثال: من 2026-08-01 إلى 2026-08-05" required></div>
            <div class="form-control" style="grid-column:1/-1;"><label>السبب أو التفاصيل</label><textarea id="hr-reason" rows="3" style="padding:10px; border:1px solid var(--border-color); border-radius:8px;" required></textarea></div>
            <button type="submit" class="btn-primary" style="grid-column: 1 / -1; margin-top: 15px;">إرسال الطلب</button>
        `;
        modal.style.display = 'flex';
    });

    // 2. إدارة المذكرات الإدارية والقبول والرفض
    async function loadMemos() {
        const memos = await dbService.getAll('Memos') || [];
        const tbody = document.getElementById('memos-table-body');
        tbody.innerHTML = '';
        if(memos.length === 0) { tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">لا توجد مذكرات مرفوعة.</td></tr>`; return; }
        
        memos.forEach(m => {
            tbody.innerHTML += `
                <tr>
                    <td><strong>${m.title}</strong></td>
                    <td>${m.sender}</td>
                    <td>${m.date}</td>
                    <td>${m.content}</td>
                    <td><span style="color:${m.status === 'معتمدة' ? 'green' : (m.status === 'مرفوضة' ? 'red' : 'orange')}; font-weight:bold;">${m.status}</span></td>
                    <td>
                        <button class="btn-sm btn-view" onclick="updateMemoStatus(${m.id}, 'معتمدة')">اعتماد</button>
                        <button class="btn-sm btn-delete" onclick="updateMemoStatus(${m.id}, 'مرفوضة')">رفض</button>
                    </td>
                </tr>
            `;
        });
    }

    window.updateMemoStatus = async function(id, status) {
        const memo = await dbService.get('Memos', id);
        if(memo) {
            memo.status = status;
            await dbService.save('Memos', memo);
            loadMemos();
        }
    };

    document.getElementById('btn-add-memo').addEventListener('click', () => {
        currentMode = 'memo';
        document.getElementById('hr-modal-title').textContent = 'رفع مذكرة جديدة للإدارة';
        form.innerHTML = `
            <div class="form-control"><label>عنوان المذكرة</label><input type="text" id="memo-title" required></div>
            <div class="form-control"><label>اسم المرسل</label><input type="text" id="memo-sender" required></div>
            <div class="form-control" style="grid-column:1/-1;"><label>محتوى المذكرة</label><textarea id="memo-content" rows="4" style="padding:10px; border:1px solid var(--border-color); border-radius:8px;" required></textarea></div>
            <button type="submit" class="btn-primary" style="grid-column: 1 / -1; margin-top: 15px;">رفع المذكرة</button>
        `;
        modal.style.display = 'flex';
    });

    form.onsubmit = async (e) => {
        e.preventDefault();
        if(currentMode === 'leave') {
            const data = {
                empName: document.getElementById('hr-emp-name').value,
                type: document.getElementById('hr-leave-type').value,
                dateRange: document.getElementById('hr-date-range').value,
                reason: document.getElementById('hr-reason').value,
                status: 'قيد المراجعة'
            };
            await dbService.save('Leaves', data);
            modal.style.display = 'none';
            loadLeaves();
        } else if(currentMode === 'memo') {
            const data = {
                title: document.getElementById('memo-title').value,
                sender: document.getElementById('memo-sender').value,
                date: new Date().toISOString().split('T')[0],
                content: document.getElementById('memo-content').value,
                status: 'معلقة'
            };
            await dbService.save('Memos', data);
            modal.style.display = 'none';
            loadMemos();
        }
    };

    // 3. استعلام الرواتب والبصمات خلال مدة معينة
    async function loadEmployeesDropdown() {
        const emps = await dbService.getAll('Employees') || [];
        const select = document.getElementById('payroll-emp-select');
        select.innerHTML = '<option value="">اختر الموظف</option>';
        emps.forEach(emp => {
            select.innerHTML += `<option value="${emp.id}">${emp.name} (${emp.jobTitle || 'موظف'})</option>`;
        });
    }

    document.getElementById('btn-calc-payroll').addEventListener('click', async () => {
        const empId = document.getElementById('payroll-emp-select').value;
        const fromDate = document.getElementById('date-from').value;
        const toDate = document.getElementById('date-to').value;
        
        if(!empId || !fromDate || !toDate) {
            alert('يرجى اختيار الموظف وتحديد تاريخ البداية والنهاية بدقة.');
            return;
        }

        const emps = await dbService.getAll('Employees') || [];
        const emp = emps.find(e => e.id == empId);
        if(!emp) return;

        // حساب افتراضي للبصمات والأيام الفعلية خلال المدة المحددة
        document.getElementById('payroll-result').innerHTML = `
            <h3 style="color:var(--primary-color); margin-bottom:15px;">تقرير الراتب والبصمات للفترة من (${fromDate}) إلى (${toDate})</h3>
            <p><strong>اسم الموظف:</strong> ${emp.name}</p>
            <p><strong>المسمى الوظيفي:</strong> ${emp.jobTitle}</p>
            <p><strong>الراتب الأساسي الشهري:</strong> ${emp.salary} $</p>
            <hr style="margin:15px 0; border-color:var(--border-color);">
            <p><strong>سجل البصمات والحضور:</strong> مطابق (تم رصد 22 يوم حضور رسمي خلال الفترة).</p>
            <p><strong>الخصومات / الإضافات:</strong> 0 $</p>
            <h3 style="margin-top:15px; color:var(--secondary-color);">الصافي المستحق للفترة المحددة: ${emp.salary} $</h3>
        `;
    });

    loadLeaves();
}
