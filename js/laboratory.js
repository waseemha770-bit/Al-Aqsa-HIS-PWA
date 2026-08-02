async function initLaboratoryModule() {
    const container = document.getElementById('router-view');
    if (!container) return;

    container.innerHTML = `
        <div class="page-header">
            <h1 data-label="laboratory">المختبر والتحاليل</h1>
        </div>
        <div class="actions-bar">
            <button class="btn-primary" id="btn-add-test" data-label="add_test">إضافة نتيجة تحليل</button>
            <input type="text" id="search-test" placeholder="بحث بنوع الفحص...">
        </div>
        <table class="data-table">
            <thead>
                <tr>
                    <th>اسم المريض</th>
                    <th>نوع الفحص</th>
                    <th>تاريخ الفحص</th>
                    <th>النتيجة</th>
                    <th>الإجراءات</th>
                </tr>
            </thead>
            <tbody id="lab-table-body"></tbody>
        </table>

        <!-- نافذة إضافة نتيجة -->
        <div id="test-modal" class="modal" style="display: none;">
            <div class="modal-content">
                <span class="close-btn" id="close-test-modal">&times;</span>
                <h2 id="test-modal-title">إدخال نتيجة مختبر</h2>
                <form id="test-form" class="form-grid">
                    <input type="hidden" id="t-id">
                    <div class="form-control">
                        <label>المريض</label>
                        <select id="t-patient" required>
                            <!-- سيتم حقن المرضى هنا -->
                        </select>
                    </div>
                    <div class="form-control">
                        <label>نوع الفحص</label>
                        <input type="text" id="t-name" placeholder="مثال: CBC, سكر دم..." required>
                    </div>
                    <div class="form-control">
                        <label>التاريخ</label>
                        <input type="date" id="t-date" required>
                    </div>
                    <div class="form-control" style="grid-column: 1 / -1;">
                        <label>نتيجة الفحص (وصف)</label>
                        <textarea id="t-result" rows="3" required style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;"></textarea>
                    </div>
                    <button type="submit" class="btn-primary" style="grid-column: 1 / -1; margin-top: 15px;">حفظ النتيجة</button>
                </form>
            </div>
        </div>
    `;

    labelManager.applyLabels(container);

    const tbody = document.getElementById('lab-table-body');
    const modal = document.getElementById('test-modal');
    const form = document.getElementById('test-form');
    const patientSelect = document.getElementById('t-patient');
    
    let testsList = [];
    let patientsList = [];

    // جلب قائمة المرضى لتعبئة القائمة المنسدلة
    async function populatePatientsMap() {
        patientsList = await dbService.getAll('Patients') || [];
        patientSelect.innerHTML = '<option value="" disabled selected>-- اختر المريض --</option>';
        patientsList.forEach(p => {
            patientSelect.innerHTML += `<option value="${p.id}">${p.name} (رقم: ${p.medicalNumber})</option>`;
        });
    }

    // جلب وعرض نتائج التحاليل
    async function loadTests(search = '') {
        testsList = await dbService.getAll('LabResults') || [];
        tbody.innerHTML = '';
        
        const filtered = testsList.filter(t => t.testName.toLowerCase().includes(search.toLowerCase()));

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">لا توجد نتائج تحاليل</td></tr>`;
            return;
        }

        filtered.forEach(test => {
            // البحث عن اسم المريض من الـ id
            const patient = patientsList.find(p => p.id === parseInt(test.patientId));
            const patientName = patient ? patient.name : 'مريض غير معروف';

            tbody.innerHTML += `
                <tr>
                    <td>${patientName}</td>
                    <td><span style="font-weight:bold; color:var(--primary-color);">${test.testName}</span></td>
                    <td>${test.date}</td>
                    <td>${test.result}</td>
                    <td>
                        <button class="btn-sm btn-edit" data-id="${test.id}">تعديل</button>
                        <button class="btn-sm btn-delete" data-id="${test.id}">حذف</button>
                    </td>
                </tr>
            `;
        });
    }

    // التهيئة الأساسية
    await populatePatientsMap();
    await loadTests();

    // الأحداث
    document.getElementById('btn-add-test').addEventListener('click', () => {
        form.reset();
        document.getElementById('t-id').value = '';
        document.getElementById('test-modal-title').textContent = 'إدخال نتيجة مختبر جديدة';
        // تعيين التاريخ التلقائي لليوم
        document.getElementById('t-date').valueAsDate = new Date();
        modal.style.display = 'flex';
    });

    document.getElementById('close-test-modal').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    document.getElementById('search-test').addEventListener('input', (e) => loadTests(e.target.value));

    // حفظ الفحص
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('t-id').value;
        const testData = {
            patientId: document.getElementById('t-patient').value,
            testName: document.getElementById('t-name').value,
            date: document.getElementById('t-date').value,
            result: document.getElementById('t-result').value
        };
        if (id) testData.id = parseInt(id);

        await dbService.save('LabResults', testData);
        modal.style.display = 'none';
        await loadTests();
    });

    // التعديل والحذف
    tbody.addEventListener('click', async (e) => {
        const id = parseInt(e.target.getAttribute('data-id'));
        if (e.target.classList.contains('btn-edit')) {
            const test = testsList.find(t => t.id === id);
            if (test) {
                document.getElementById('t-id').value = test.id;
                document.getElementById('t-patient').value = test.patientId;
                document.getElementById('t-name').value = test.testName;
                document.getElementById('t-date').value = test.date;
                document.getElementById('t-result').value = test.result;
                document.getElementById('test-modal-title').textContent = 'تعديل نتيجة المختبر';
                modal.style.display = 'flex';
            }
        } else if (e.target.classList.contains('btn-delete')) {
            if (confirm('هل أنت متأكد من حذف نتيجة التحليل؟')) {
                await dbService.delete('LabResults', id);
                await loadTests();
            }
        }
    });
}
