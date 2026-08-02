/**
 * Al-Aqsa Medical City - Patients, Admissions & EMR Module
 * إدارة شؤون المرضى، حركات الدخول والخروج، والملف الطبي الشامل
 */
async function initPatientsModule() {
    const container = document.getElementById('router-view');
    if (!container) return;

    container.innerHTML = `
        <div class="page-header"><h1>شؤون المرضى والملف الطبي</h1></div>
        
        <div class="tabs-header">
            <button class="tab-btn active" onclick="switchPatientTab('list')">قائمة المرضى والتسجيل</button>
            <button class="tab-btn" onclick="switchPatientTab('admissions')">حركات الدخول والخروج (رقود/عمليات)</button>
            <button class="tab-btn" onclick="switchPatientTab('emr')">الملف الطبي الشامل (EMR)</button>
        </div>

        <!-- 1. تبويب قائمة المرضى -->
        <div id="tab-patient-list" class="tab-content active">
            <div class="actions-bar">
                <button class="btn-primary" id="btn-add-patient">تسجيل مريض جديد</button>
                <input type="text" id="search-patient" placeholder="بحث باسم المريض أو رقم الهاتف...">
            </div>
            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>رقم الملف</th>
                            <th>اسم المريض</th>
                            <th>العمر / الجنس</th>
                            <th>رقم الهاتف</th>
                            <th>فصيلة الدم</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="patients-table-body"></tbody>
                </table>
            </div>
        </div>

        <!-- 2. تبويب حركات الدخول والخروج -->
        <div id="tab-patient-admissions" class="tab-content">
            <div class="actions-bar">
                <button class="btn-primary" id="btn-add-admission" style="background-color: var(--secondary-color);">تسجيل دخول (تنويم / عيادة / عمليات)</button>
            </div>
            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>اسم المريض</th>
                            <th>نوع الدخول</th>
                            <th>القسم / الغرفة</th>
                            <th>وقت الدخول</th>
                            <th>وقت الخروج</th>
                            <th>الحالة</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="admissions-table-body"></tbody>
                </table>
            </div>
        </div>

        <!-- 3. تبويب الملف الطبي الشامل (EMR) -->
        <div id="tab-patient-emr" class="tab-content">
            <div class="actions-bar" style="background:var(--surface-color); padding:20px; border-radius:8px; border:1px solid var(--border-color);">
                <div style="display:flex; gap:15px; align-items:center; width:100%;">
                    <label style="font-weight:bold;">اختر المريض لاستعراض ملفه:</label>
                    <select id="emr-patient-select" style="flex:1;"></select>
                    <button class="btn-primary" id="btn-view-emr">عرض الملف الشامل</button>
                    <button class="btn-print" id="btn-print-emr" style="display:none; padding:10px; border-radius:8px; border:1px solid #ccc; cursor:pointer; background:#f1f5f9;">طباعة الملف</button>
                </div>
            </div>
            
            <div id="emr-result-container" style="margin-top:20px; display:none; background:var(--surface-color); padding:30px; border-radius:12px; border:1px solid var(--border-color); box-shadow:var(--shadow-md);">
                <!-- سيتم حقن الملف الطبي هنا -->
            </div>
        </div>

        <!-- نافذة تسجيل المريض -->
        <div id="patient-modal" class="modal">
            <div class="modal-content">
                <span class="close-btn" id="close-patient-modal">&times;</span>
                <h2 id="patient-modal-title" style="margin-bottom: 20px;">تسجيل مريض جديد</h2>
                <form id="patient-form" class="form-grid">
                    <input type="hidden" id="pat-id">
                    <div class="form-control"><label>اسم المريض الرباعي</label><input type="text" id="pat-name" required></div>
                    <div class="form-control"><label>العمر</label><input type="number" id="pat-age" required></div>
                    <div class="form-control"><label>الجنس</label><select id="pat-gender"><option value="ذكر">ذكر</option><option value="أنثى">أنثى</option></select></div>
                    <div class="form-control"><label>رقم الهاتف</label><input type="text" id="pat-phone" required></div>
                    <div class="form-control"><label>فصيلة الدم</label><select id="pat-blood"><option value="غير معروف">غير معروف</option><option value="O+">O+</option><option value="O-">O-</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="AB+">AB+</option><option value="AB-">AB-</option></select></div>
                    <div class="form-control" style="grid-column: 1 / -1;"><label>التاريخ المرضي المزمن (إن وجد)</label><input type="text" id="pat-history" placeholder="مثال: سكري، ضغط، ربو..."></div>
                    <button type="submit" class="btn-primary" style="grid-column: 1 / -1; margin-top: 15px;">حفظ بيانات المريض</button>
                </form>
            </div>
        </div>

        <!-- نافذة تسجيل الدخول (Admissions) -->
        <div id="admission-modal" class="modal">
            <div class="modal-content">
                <span class="close-btn" id="close-admission-modal">&times;</span>
                <h2 style="margin-bottom: 20px;">تسجيل حركة دخول جديدة</h2>
                <form id="admission-form" class="form-grid">
                    <div class="form-control" style="grid-column: 1 / -1;"><label>اسم المريض</label><select id="adm-patient" required></select></div>
                    <div class="form-control"><label>نوع الدخول</label><select id="adm-type" required><option value="عيادة خارجية">عيادة خارجية (مراجعة)</option><option value="قسم الرقود (تنويم)">قسم الرقود (تنويم)</option><option value="غرفة العمليات">غرفة العمليات</option><option value="طوارئ">طوارئ</option></select></div>
                    <div class="form-control"><label>القسم / التخصص</label><select id="adm-dept" required></select></div>
                    <div class="form-control"><label>رقم الغرفة / السرير (للرُقود)</label><input type="text" id="adm-room" placeholder="مثال: غرفة 102 - سرير 3"></div>
                    <div class="form-control"><label>الطبيب المعالج / الجراح</label><select id="adm-doctor" required></select></div>
                    <button type="submit" class="btn-primary" style="grid-column: 1 / -1; margin-top: 15px;">تأكيد الدخول</button>
                </form>
            </div>
        </div>
    `;

    // دالة تبديل التبويبات
    window.switchPatientTab = function(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        if(tab === 'list') {
            document.querySelector('.tabs-header button:nth-child(1)').classList.add('active');
            document.getElementById('tab-patient-list').classList.add('active');
            loadPatients();
        } else if(tab === 'admissions') {
            document.querySelector('.tabs-header button:nth-child(2)').classList.add('active');
            document.getElementById('tab-patient-admissions').classList.add('active');
            loadAdmissions();
        } else if(tab === 'emr') {
            document.querySelector('.tabs-header button:nth-child(3)').classList.add('active');
            document.getElementById('tab-patient-emr').classList.add('active');
            populateEMRPatients();
        }
    };

    // ==========================================
    // 1. إدارة المرضى (Patients)
    // ==========================================
    const patModal = document.getElementById('patient-modal');
    const patForm = document.getElementById('patient-form');

    async function loadPatients() {
        const patients = await dbService.getAll('Patients') || [];
        const tbody = document.getElementById('patients-table-body');
        tbody.innerHTML = '';
        if(patients.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">لا يوجد مرضى مسجلين حالياً.</td></tr>`;
            return;
        }
        patients.forEach(p => {
            tbody.innerHTML += `
                <tr>
                    <td><strong>MED-${p.id.toString().padStart(4, '0')}</strong></td>
                    <td>${p.name}</td>
                    <td>${p.age} سنة / ${p.gender}</td>
                    <td>${p.phone}</td>
                    <td><span style="color:var(--danger-color); font-weight:bold;">${p.blood}</span></td>
                    <td>
                        <button class="btn-sm btn-edit" onclick="editPatient(${p.id})">تعديل</button>
                    </td>
                </tr>
            `;
        });
    }

    document.getElementById('btn-add-patient').addEventListener('click', () => {
        patForm.reset();
        document.getElementById('pat-id').value = '';
        patModal.style.display = 'flex';
    });
    document.getElementById('close-patient-modal').addEventListener('click', () => patModal.style.display = 'none');

    patForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('pat-id').value;
        const data = {
            name: document.getElementById('pat-name').value,
            age: document.getElementById('pat-age').value,
            gender: document.getElementById('pat-gender').value,
            phone: document.getElementById('pat-phone').value,
            blood: document.getElementById('pat-blood').value,
            history: document.getElementById('pat-history').value
        };
        if(id) data.id = parseInt(id);
        await dbService.save('Patients', data);
        patModal.style.display = 'none';
        loadPatients();
    });

    window.editPatient = async function(id) {
        const pat = await dbService.get('Patients', id);
        if(pat) {
            document.getElementById('pat-id').value = pat.id;
            document.getElementById('pat-name').value = pat.name;
            document.getElementById('pat-age').value = pat.age;
            document.getElementById('pat-gender').value = pat.gender;
            document.getElementById('pat-phone').value = pat.phone;
            document.getElementById('pat-blood').value = pat.blood;
            document.getElementById('pat-history').value = pat.history || '';
            patModal.style.display = 'flex';
        }
    };

    // ==========================================
    // 2. إدارة الدخول والخروج (Admissions)
    // ==========================================
    const admModal = document.getElementById('admission-modal');
    const admForm = document.getElementById('admission-form');

    async function populateAdmissionDropdowns() {
        const patients = await dbService.getAll('Patients') || [];
        const depts = await dbService.getAll('Departments') || [];
        const doctors = await dbService.getAll('Doctors') || [];
        
        const pSelect = document.getElementById('adm-patient');
        const dSelect = document.getElementById('adm-dept');
        const docSelect = document.getElementById('adm-doctor');
        
        pSelect.innerHTML = '<option value="">-- اختر المريض --</option>';
        patients.forEach(p => pSelect.innerHTML += `<option value="${p.id}">${p.name} (ملف: ${p.id})</option>`);
        
        dSelect.innerHTML = '<option value="">-- اختر القسم --</option>';
        depts.filter(d => d.type !== 'إداري').forEach(d => dSelect.innerHTML += `<option value="${d.name}">${d.name}</option>`);
        
        docSelect.innerHTML = '<option value="">-- اختر الطبيب --</option>';
        doctors.forEach(d => docSelect.innerHTML += `<option value="${d.name}">${d.name} (${d.specialty})</option>`);
    }

    async function loadAdmissions() {
        const admissions = await dbService.getAll('Admissions') || [];
        const patients = await dbService.getAll('Patients') || [];
        const tbody = document.getElementById('admissions-table-body');
        tbody.innerHTML = '';
        
        // ترتيب: المنومين حالياً في الأعلى، ثم المغادرين
        admissions.sort((a, b) => (a.status === 'مغادر' ? 1 : -1));

        if(admissions.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">لا توجد حركات دخول مسجلة.</td></tr>`;
            return;
        }

        admissions.forEach(adm => {
            const pat = patients.find(p => p.id == adm.patientId);
            const patName = pat ? pat.name : 'مريض غير معروف';
            const isDischarged = adm.status === 'مغادر';
            const statusColor = isDischarged ? 'gray' : (adm.type === 'غرفة العمليات' ? 'var(--danger-color)' : 'var(--secondary-color)');
            
            tbody.innerHTML += `
                <tr style="opacity: ${isDischarged ? '0.7' : '1'}; background: ${isDischarged ? '#f8fafc' : 'transparent'};">
                    <td><strong>${patName}</strong></td>
                    <td>${adm.type}</td>
                    <td>${adm.dept} <br><small style="color:var(--text-muted);">${adm.room || 'بلا'}</small></td>
                    <td dir="ltr" style="text-align:right;">${new Date(adm.entryTime).toLocaleString('ar-EG')}</td>
                    <td dir="ltr" style="text-align:right;">${adm.exitTime ? new Date(adm.exitTime).toLocaleString('ar-EG') : '---'}</td>
                    <td><span style="background:${statusColor}; color:white; padding:4px 8px; border-radius:4px; font-size:0.8rem;">${adm.status}</span></td>
                    <td>
                        ${!isDischarged ? `<button class="btn-sm btn-delete" onclick="checkoutAdmission(${adm.id})">تسجيل خروج</button>` : 'تم الخروج'}
                    </td>
                </tr>
            `;
        });
    }

    document.getElementById('btn-add-admission').addEventListener('click', async () => {
        admForm.reset();
        await populateAdmissionDropdowns();
        admModal.style.display = 'flex';
    });
    document.getElementById('close-admission-modal').addEventListener('click', () => admModal.style.display = 'none');

    admForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            patientId: document.getElementById('adm-patient').value,
            type: document.getElementById('adm-type').value,
            dept: document.getElementById('adm-dept').value,
            room: document.getElementById('adm-room').value,
            doctor: document.getElementById('adm-doctor').value,
            entryTime: new Date().toISOString(),
            exitTime: null,
            status: 'منوّم / قيد العلاج'
        };
        await dbService.save('Admissions', data);
        admModal.style.display = 'none';
        loadAdmissions();
    });

    window.checkoutAdmission = async function(id) {
        if(confirm('هل أنت متأكد من تسجيل خروج المريض من هذا القسم/العيادة؟')) {
            const adm = await dbService.get('Admissions', id);
            if(adm) {
                adm.exitTime = new Date().toISOString();
                adm.status = 'مغادر';
                await dbService.save('Admissions', adm);
                loadAdmissions();
            }
        }
    };

    // ==========================================
    // 3. الملف الطبي الشامل (EMR)
    // ==========================================
    async function populateEMRPatients() {
        const patients = await dbService.getAll('Patients') || [];
        const select = document.getElementById('emr-patient-select');
        select.innerHTML = '<option value="">-- ابحث عن المريض --</option>';
        patients.forEach(p => select.innerHTML += `<option value="${p.id}">${p.name} (رقم الملف: ${p.id})</option>`);
    }

    document.getElementById('btn-view-emr').addEventListener('click', async () => {
        const patId = document.getElementById('emr-patient-select').value;
        if(!patId) { alert('الرجاء اختيار المريض أولاً.'); return; }

        const patient = await dbService.get('Patients', parseInt(patId));
        if(!patient) return;

        // جلب جميع البيانات المرتبطة بالمريض من مختلف الجداول
        const allAdmissions = await dbService.getAll('Admissions') || [];
        const patAdmissions = allAdmissions.filter(a => a.patientId == patId);

        const container = document.getElementById('emr-result-container');
        container.style.display = 'block';
        document.getElementById('btn-print-emr').style.display = 'block';

        // بناء تقرير الملف الطبي
        let html = `
            <div id="printable-emr">
                <div style="text-align:center; border-bottom:2px solid var(--primary-color); padding-bottom:15px; margin-bottom:20px;">
                    <h1 style="color:var(--primary-color);">الملف الطبي الإلكتروني (EMR)</h1>
                    <p style="color:var(--text-muted);">مدينة الأقصى الطبية</p>
                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; background:var(--bg-color); padding:20px; border-radius:8px; margin-bottom:25px; border:1px solid var(--border-color);">
                    <div><span style="color:var(--text-muted);">اسم المريض:</span> <strong>${patient.name}</strong></div>
                    <div><span style="color:var(--text-muted);">رقم الملف (MRN):</span> <strong>MED-${patient.id.toString().padStart(4, '0')}</strong></div>
                    <div><span style="color:var(--text-muted);">العمر والجنس:</span> <strong>${patient.age} سنة / ${patient.gender}</strong></div>
                    <div><span style="color:var(--text-muted);">فصيلة الدم:</span> <strong style="color:var(--danger-color);">${patient.blood}</strong></div>
                    <div style="grid-column: 1/-1;"><span style="color:var(--text-muted);">التاريخ المرضي المزمن:</span> <strong>${patient.history || 'لا يوجد أمراض مزمنة مسجلة'}</strong></div>
                </div>

                <h3 style="color:var(--primary-color); border-bottom:1px solid #ccc; padding-bottom:5px; margin-bottom:15px;">سجل الزيارات والعمليات (التنويم)</h3>
                <table style="width:100%; border-collapse:collapse; margin-bottom:25px; text-align:right;">
                    <tr style="background:#f1f5f9; border-bottom:2px solid #ccc;">
                        <th style="padding:10px;">نوع الزيارة</th>
                        <th style="padding:10px;">القسم/الغرفة</th>
                        <th style="padding:10px;">الطبيب</th>
                        <th style="padding:10px;">الدخول</th>
                        <th style="padding:10px;">الخروج</th>
                    </tr>
        `;

        if(patAdmissions.length === 0) {
            html += `<tr><td colspan="5" style="padding:10px; text-align:center; color:gray;">لا يوجد سجل دخول أو رقود مسبق للمريض.</td></tr>`;
        } else {
            patAdmissions.sort((a, b) => new Date(b.entryTime) - new Date(a.entryTime)).forEach(adm => {
                html += `
                    <tr style="border-bottom:1px solid #eee;">
                        <td style="padding:10px;">${adm.type}</td>
                        <td style="padding:10px;">${adm.dept} <br><small>${adm.room || ''}</small></td>
                        <td style="padding:10px;">${adm.doctor}</td>
                        <td style="padding:10px;" dir="ltr">${new Date(adm.entryTime).toLocaleDateString('ar-EG')}</td>
                        <td style="padding:10px;" dir="ltr">${adm.exitTime ? new Date(adm.exitTime).toLocaleDateString('ar-EG') : 'حتى الآن'}</td>
                    </tr>
                `;
            });
        }
        html += `</table>`;

        // يمكنك لاحقاً جلب بيانات المختبر والأشعة بنفس الطريقة هنا إن وجدت
        html += `
                <h3 style="color:var(--primary-color); border-bottom:1px solid #ccc; padding-bottom:5px; margin-bottom:15px;">نتائج المختبر والأشعة (سجل مختصر)</h3>
                <p style="color:gray; text-align:center; padding:10px; background:#f9f9f9; border-radius:6px;">
                    لم يتم تسجيل نتائج مخبرية أو أشعة حديثة في هذا الملف. 
                    (سيتم الربط التلقائي مع نظام المختبر بمجرد إدخال النتائج).
                </p>
                
                <div style="margin-top:40px; text-align:left;">
                    <p style="color:var(--text-muted); font-size:0.8rem;">طُبع بواسطة نظام مدينة الأقصى الطبية - بتاريخ: ${new Date().toLocaleString('ar-EG')}</p>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    });

    // طباعة الملف الطبي
    document.getElementById('btn-print-emr').addEventListener('click', () => {
        const printContent = document.getElementById('printable-emr').innerHTML;
        const originalContent = document.body.innerHTML;
        
        document.body.innerHTML = `
            <div style="padding:20px; font-family:'Cairo', sans-serif; direction:rtl;">
                ${printContent}
            </div>
        `;
        window.print();
        document.body.innerHTML = originalContent;
        location.reload(); // إعادة تحميل خفيفة لضمان عودة الـ SPA لحالته
    });

    // تحميل البيانات الأولية
    loadPatients();
}
