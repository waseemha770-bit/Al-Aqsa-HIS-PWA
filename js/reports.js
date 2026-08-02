/**
 * Al-Aqsa Medical City - Comprehensive Reports Module
 * نظام التقارير الشاملة من تاريخ إلى تاريخ مع فلترة متقدمة
 */
async function initReportsModule() {
    const container = document.getElementById('router-view');
    if (!container) return;

    container.innerHTML = `
        <div class="page-header"><h1>التقارير والإحصائيات الشاملة المتطورة</h1></div>
        
        <div class="actions-bar" style="background:var(--surface-color); padding:20px; border-radius:8px; border:1px solid var(--border-color); display: flex; flex-wrap: wrap; gap: 15px; align-items: flex-end;">
            <div class="form-control" style="flex: 2; min-width: 250px;">
                <label>نوع التقرير</label>
                <select id="report-type" required>
                    <option value="financial">التقرير المالي (الإيرادات والفواتير)</option>
                    <option value="admissions_out">تقرير حركات الدخول والخروج للعيادات والرقود</option>
                    <option value="operations">تقرير عدد العمليات الجراحية</option>
                    <option value="clinic_visits">تقرير عدد المرضى الوافدين للعيادات</option>
                    <option value="lab_tests">تقرير عدد الفحوصات المخبرية</option>
                    <option value="procedures">تقرير عدد الإجراءات الطبية</option>
                    <option value="nutrition">تقرير تكاليف الإعاشة والمطعم</option>
                </select>
            </div>
            <div class="form-control" style="flex: 1; min-width: 150px;">
                <label>من تاريخ</label>
                <input type="date" id="report-date-from" required>
            </div>
            <div class="form-control" style="flex: 1; min-width: 150px;">
                <label>إلى تاريخ</label>
                <input type="date" id="report-date-to" required>
            </div>
            <div style="width: 100%; display: flex; gap: 15px; flex-wrap: wrap; margin-top: 10px;">
                <div class="form-control" style="flex: 1; min-width: 150px;">
                    <label>تصفية بالمريض (اختياري)</label>
                    <select id="filter-patient"><option value="">الكل</option></select>
                </div>
                <div class="form-control" style="flex: 1; min-width: 150px;">
                    <label>تصفية بوحدة التأمين (اختياري)</label>
                    <select id="filter-insurance"><option value="">الكل</option></select>
                </div>
                <div class="form-control" style="flex: 1; min-width: 150px;">
                    <label>تصفية بالطبيب (اختياري)</label>
                    <select id="filter-doctor"><option value="">الكل</option></select>
                </div>
                <div class="form-control" style="flex: 1; min-width: 150px;">
                    <label>تصفية بالقسم (اختياري)</label>
                    <select id="filter-department"><option value="">الكل</option></select>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; width: 100%; justify-content: flex-end; margin-top: 10px;">
                <button class="btn-primary" id="btn-generate-report" style="height: 42px;">استخراج التقرير</button>
                <button class="btn-print" id="btn-print-report" style="height: 42px; display: none;">طباعة التقرير</button>
            </div>
        </div>

        <!-- حاوية عرض التقرير المولد -->
        <div id="report-result-container" style="margin-top:20px; display:none; background:var(--surface-color); padding:30px; border-radius:12px; border:1px solid var(--border-color); box-shadow:var(--shadow-md); overflow-x: auto;">
            <div id="printable-report">
                <!-- سيتم حقن الكود هنا بناءً على نوع التقرير -->
            </div>
        </div>
    `;

    // 1. إعداد التواريخ الافتراضية
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    document.getElementById('report-date-to').value = today.toISOString().split('T')[0];
    firstDay.setDate(firstDay.getDate() + 1);
    document.getElementById('report-date-from').value = firstDay.toISOString().split('T')[0];

    // 2. تعبئة قوائم التصفية
    async function populateFilters() {
        try {
            const patients = await dbService.getAll('Patients') || [];
            const pSelect = document.getElementById('filter-patient');
            patients.forEach(p => pSelect.innerHTML += `<option value="${p.id}">${p.name}</option>`);

            const insurances = await dbService.getAll('Insurance') || [];
            const iSelect = document.getElementById('filter-insurance');
            insurances.forEach(i => iSelect.innerHTML += `<option value="${i.companyName}">${i.companyName}</option>`);

            const doctors = await dbService.getAll('Doctors') || [];
            const dSelect = document.getElementById('filter-doctor');
            doctors.forEach(d => dSelect.innerHTML += `<option value="${d.name}">${d.name}</option>`);

            const depts = await dbService.getAll('Departments') || [];
            const deptSelect = document.getElementById('filter-department');
            depts.forEach(d => deptSelect.innerHTML += `<option value="${d.name}">${d.name}</option>`);
        } catch(e) {
            console.warn("Could not load filters", e);
        }
    }
    await populateFilters();

    // 3. دالة توليد التقرير
    document.getElementById('btn-generate-report').addEventListener('click', async () => {
        const type = document.getElementById('report-type').value;
        const fromDateStr = document.getElementById('report-date-from').value;
        const toDateStr = document.getElementById('report-date-to').value;
        
        const fPatientId = document.getElementById('filter-patient').value;
        const fInsurance = document.getElementById('filter-insurance').value;
        const fDoctor = document.getElementById('filter-doctor').value;
        const fDept = document.getElementById('filter-department').value;

        if (!fromDateStr || !toDateStr) {
            alert('الرجاء تحديد تاريخ البداية والنهاية');
            return;
        }

        const fromDate = new Date(fromDateStr);
        fromDate.setHours(0, 0, 0, 0);
        const toDate = new Date(toDateStr);
        toDate.setHours(23, 59, 59, 999);

        const container = document.getElementById('report-result-container');
        const printBtn = document.getElementById('btn-print-report');
        const printArea = document.getElementById('printable-report');

        container.style.display = 'block';
        printBtn.style.display = 'inline-flex';
        printArea.innerHTML = '<p style="text-align:center;">جاري جمع البيانات...</p>';

        let html = `
            <div style="text-align:center; border-bottom:2px solid var(--primary-color); padding-bottom:15px; margin-bottom:20px;">
                <h1 style="color:var(--primary-color); margin-bottom: 5px;">${document.getElementById('report-type').options[document.getElementById('report-type').selectedIndex].text}</h1>
                <p style="color:var(--text-muted); font-size: 1.1rem;">مدينة الأقصى الطبية</p>
                <p style="font-weight: bold; margin-top: 10px;">للفترة من: <span dir="ltr">${fromDateStr}</span> إلى <span dir="ltr">${toDateStr}</span></p>
            </div>
        `;

        // دالة مساعدة لجلب اسم المريض ومعلوماته (محاكاة الربط مع التأمين)
        const patientsCache = await dbService.getAll('Patients') || [];
        function getPatientInfo(id) {
            const p = patientsCache.find(x => x.id == id);
            return p ? { name: p.name, insurance: p.insuranceCompany || 'بدون تأمين' } : { name: 'مجهول', insurance: 'بدون تأمين' };
        }

        try {
            // --- التقرير المالي ---
            if (type === 'financial') {
                const invoices = await dbService.getAll('Invoices') || [];
                let totalAmount = 0;
                let rows = '';

                const filteredInvoices = invoices.filter(inv => {
                    const invDate = new Date(inv.date || new Date());
                    let pass = invDate >= fromDate && invDate <= toDate;
                    if(fPatientId && inv.patientId != fPatientId) pass = false;
                    // إضافة فلترة التأمين والطبيب إذا كانت الفاتورة تحفظها (هنا محاكاة بسيطة)
                    return pass;
                });

                filteredInvoices.forEach(inv => {
                    const amount = parseFloat(inv.paid) || parseFloat(inv.total) || 0;
                    totalAmount += amount;
                    rows += `
                        <tr>
                            <td style="padding:10px; border: 1px solid #ccc;">${inv.id || '---'}</td>
                            <td style="padding:10px; border: 1px solid #ccc;">${inv.date || '---'}</td>
                            <td style="padding:10px; border: 1px solid #ccc;">${inv.patientName || '---'}</td>
                            <td style="padding:10px; border: 1px solid #ccc;">${inv.type || 'عام'}</td>
                            <td style="padding:10px; border: 1px solid #ccc; font-weight:bold; color:var(--secondary-color);">${amount.toFixed(2)} $</td>
                        </tr>
                    `;
                });

                html += buildTableHTML(
                    ['رقم الفاتورة', 'التاريخ', 'اسم المريض', 'البيان', 'المبلغ'], 
                    rows, 'لا توجد إيرادات في هذه الفترة المطابقة للفلتر.'
                );
                html += `<div style="background: #f8fafc; padding: 15px; border: 1px solid #ccc; border-radius: 8px; text-align: left;"><h2 style="color: var(--primary-color);">إجمالي الإيرادات: ${totalAmount.toFixed(2)} $</h2></div>`;
            } 
            
            // --- 2. تقرير حركات الدخول والخروج (Admissions & Discharges) ---
            else if (type === 'admissions_out') {
                const admissions = await dbService.getAll('Admissions') || [];
                let count = 0;
                let rows = '';

                const filteredAdmissions = admissions.filter(adm => {
                    const entryDate = new Date(adm.entryTime);
                    const exitDate = adm.exitTime ? new Date(adm.exitTime) : null;
                    
                    // نعتبر السجل ضمن الفترة إذا كان الدخول أو الخروج تم خلالها
                    const inRange = (entryDate >= fromDate && entryDate <= toDate) || (exitDate && exitDate >= fromDate && exitDate <= toDate);
                    
                    let pass = inRange;
                    if(fPatientId && adm.patientId != fPatientId) pass = false;
                    if(fDoctor && adm.doctor !== fDoctor) pass = false;
                    if(fDept && adm.dept !== fDept) pass = false;
                    const pInfo = getPatientInfo(adm.patientId);
                    if(fInsurance && pInfo.insurance !== fInsurance) pass = false;

                    return pass;
                });

                filteredAdmissions.forEach(adm => {
                    count++;
                    const pInfo = getPatientInfo(adm.patientId);
                    rows += `
                        <tr>
                            <td style="padding:10px; border: 1px solid #ccc;">${pInfo.name}</td>
                            <td style="padding:10px; border: 1px solid #ccc;">${pInfo.insurance}</td>
                            <td style="padding:10px; border: 1px solid #ccc;">${adm.type}</td>
                            <td style="padding:10px; border: 1px solid #ccc;">${adm.dept}</td>
                            <td style="padding:10px; border: 1px solid #ccc;">${adm.doctor || '---'}</td>
                            <td style="padding:10px; border: 1px solid #ccc;" dir="ltr">${new Date(adm.entryTime).toLocaleString('ar-EG')}</td>
                            <td style="padding:10px; border: 1px solid #ccc;" dir="ltr">${adm.exitTime ? new Date(adm.exitTime).toLocaleString('ar-EG') : 'منوم حالياً'}</td>
                        </tr>
                    `;
                });

                html += buildTableHTML(
                    ['اسم المريض', 'وحدة التأمين', 'نوع الدخول', 'القسم', 'الطبيب', 'وقت الدخول', 'وقت الخروج'],
                    rows, 'لا توجد حركات دخول/خروج في هذه الفترة المطابقة للفلتر.'
                );
                html += `<div style="background: #f8fafc; padding: 15px; border: 1px solid #ccc; border-radius: 8px; text-align: left;"><h2 style="color: var(--primary-color);">إجمالي الحركات: ${count} حركة</h2></div>`;
            }

            // --- 1. تقرير عدد العمليات الجراحية ---
            else if (type === 'operations') {
                const admissions = await dbService.getAll('Admissions') || [];
                // نعتبر الدخول لـ "غرفة العمليات" كعملية (ويمكن استخدام جدول Operations مستقل إن وجد)
                let count = 0;
                let rows = '';

                const operations = admissions.filter(adm => {
                    if (adm.type !== 'غرفة العمليات') return false;
                    const entryDate = new Date(adm.entryTime);
                    let pass = entryDate >= fromDate && entryDate <= toDate;
                    if(fPatientId && adm.patientId != fPatientId) pass = false;
                    if(fDoctor && adm.doctor !== fDoctor) pass = false;
                    if(fDept && adm.dept !== fDept) pass = false;
                    const pInfo = getPatientInfo(adm.patientId);
                    if(fInsurance && pInfo.insurance !== fInsurance) pass = false;
                    return pass;
                });

                operations.forEach(adm => {
                    count++;
                    const pInfo = getPatientInfo(adm.patientId);
                    rows += `
                        <tr>
                            <td style="padding:10px; border: 1px solid #ccc;">${pInfo.name}</td>
                            <td style="padding:10px; border: 1px solid #ccc;">${pInfo.insurance}</td>
                            <td style="padding:10px; border: 1px solid #ccc;">${adm.dept}</td>
                            <td style="padding:10px; border: 1px solid #ccc;">${adm.doctor}</td>
                            <td style="padding:10px; border: 1px solid #ccc;" dir="ltr">${new Date(adm.entryTime).toLocaleDateString('ar-EG')}</td>
                        </tr>
                    `;
                });

                html += buildTableHTML(
                    ['اسم المريض', 'وحدة التأمين', 'القسم الجراحي', 'الجراح', 'تاريخ العملية'],
                    rows, 'لا توجد عمليات جراحية في هذه الفترة المطابقة للفلتر.'
                );
                html += `<div style="background: #f8fafc; padding: 15px; border: 1px solid #ccc; border-radius: 8px; text-align: left;"><h2 style="color: var(--primary-color);">إجمالي العمليات: ${count} عملية</h2></div>`;
            }

            // --- 3. تقرير الوافدين للعيادات ---
            else if (type === 'clinic_visits') {
                const admissions = await dbService.getAll('Admissions') || [];
                // نعتبر الدخول لـ "عيادة خارجية"
                let count = 0;
                let rows = '';

                const visits = admissions.filter(adm => {
                    if (adm.type !== 'عيادة خارجية') return false;
                    const entryDate = new Date(adm.entryTime);
                    let pass = entryDate >= fromDate && entryDate <= toDate;
                    if(fPatientId && adm.patientId != fPatientId) pass = false;
                    if(fDoctor && adm.doctor !== fDoctor) pass = false;
                    if(fDept && adm.dept !== fDept) pass = false;
                    const pInfo = getPatientInfo(adm.patientId);
                    if(fInsurance && pInfo.insurance !== fInsurance) pass = false;
                    return pass;
                });

                visits.forEach(adm => {
                    count++;
                    const pInfo = getPatientInfo(adm.patientId);
                    rows += `
                        <tr>
                            <td style="padding:10px; border: 1px solid #ccc;">${pInfo.name}</td>
                            <td style="padding:10px; border: 1px solid #ccc;">${pInfo.insurance}</td>
                            <td style="padding:10px; border: 1px solid #ccc;">${adm.dept}</td>
                            <td style="padding:10px; border: 1px solid #ccc;">${adm.doctor}</td>
                            <td style="padding:10px; border: 1px solid #ccc;" dir="ltr">${new Date(adm.entryTime).toLocaleDateString('ar-EG')}</td>
                        </tr>
                    `;
                });

                html += buildTableHTML(
                    ['اسم المريض', 'وحدة التأمين', 'العيادة', 'الطبيب', 'تاريخ الزيارة'],
                    rows, 'لا يوجد وافدون للعيادات في هذه الفترة المطابقة للفلتر.'
                );
                html += `<div style="background: #f8fafc; padding: 15px; border: 1px solid #ccc; border-radius: 8px; text-align: left;"><h2 style="color: var(--primary-color);">إجمالي زيارات العيادات: ${count} زيارة</h2></div>`;
            }

            // --- 4. تقرير الفحوصات المخبرية ---
            else if (type === 'lab_tests') {
                let labResults = [];
                try {
                    labResults = await dbService.getAll('LabResults') || [];
                } catch(e) {
                    console.warn("جدول LabResults غير مهيأ بعد", e);
                }
                
                let count = 0;
                let rows = '';

                const tests = labResults.filter(test => {
                    const tDate = new Date(test.date || test.timestamp);
                    let pass = tDate >= fromDate && tDate <= toDate;
                    if(fPatientId && test.patientId != fPatientId) pass = false;
                    if(fDoctor && test.doctor !== fDoctor) pass = false; // إذا كان الفحص مرتبط بطبيب
                    const pInfo = getPatientInfo(test.patientId);
                    if(fInsurance && pInfo.insurance !== fInsurance) pass = false;
                    return pass;
                });

                tests.forEach(test => {
                    count++;
                    const pInfo = getPatientInfo(test.patientId);
                    rows += `
                        <tr>
                            <td style="padding:10px; border: 1px solid #ccc;">${test.testName || 'فحص مخبري'}</td>
                            <td style="padding:10px; border: 1px solid #ccc;">${pInfo.name}</td>
                            <td style="padding:10px; border: 1px solid #ccc;">${pInfo.insurance}</td>
                            <td style="padding:10px; border: 1px solid #ccc;">${test.doctor || '---'}</td>
                            <td style="padding:10px; border: 1px solid #ccc;" dir="ltr">${new Date(test.date || test.timestamp).toLocaleDateString('ar-EG')}</td>
                        </tr>
                    `;
                });

                html += buildTableHTML(
                    ['نوع الفحص', 'اسم المريض', 'وحدة التأمين', 'الطبيب الطالب', 'التاريخ'],
                    rows, 'لا توجد فحوصات مخبرية مسجلة (أو الجدول فارغ).'
                );
                html += `<div style="background: #f8fafc; padding: 15px; border: 1px solid #ccc; border-radius: 8px; text-align: left;"><h2 style="color: var(--primary-color);">إجمالي الفحوصات: ${count} فحص</h2></div>`;
            }

            // --- 5. تقرير الإجراءات الطبية ---
            else if (type === 'procedures') {
                let procedures = [];
                try {
                    procedures = await dbService.getAll('Procedures') || []; // بافتراض وجود جدول Procedures
                } catch(e) {
                    console.warn("جدول Procedures غير مهيأ بعد", e);
                }
                
                let count = 0;
                let rows = '';

                const filteredProcedures = procedures.filter(proc => {
                    const pDate = new Date(proc.date);
                    let pass = pDate >= fromDate && pDate <= toDate;
                    if(fPatientId && proc.patientId != fPatientId) pass = false;
                    if(fDoctor && proc.doctor !== fDoctor) pass = false;
                    if(fDept && proc.dept !== fDept) pass = false;
                    const pInfo = getPatientInfo(proc.patientId);
                    if(fInsurance && pInfo.insurance !== fInsurance) pass = false;
                    return pass;
                });

                filteredProcedures.forEach(proc => {
                    count++;
                    const pInfo = getPatientInfo(proc.patientId);
                    rows += `
                        <tr>
                            <td style="padding:10px; border: 1px solid #ccc;">${proc.procName || 'إجراء طبي'}</td>
                            <td style="padding:10px; border: 1px solid #ccc;">${pInfo.name}</td>
                            <td style="padding:10px; border: 1px solid #ccc;">${pInfo.insurance}</td>
                            <td style="padding:10px; border: 1px solid #ccc;">${proc.dept || '---'}</td>
                            <td style="padding:10px; border: 1px solid #ccc;">${proc.doctor || '---'}</td>
                            <td style="padding:10px; border: 1px solid #ccc;" dir="ltr">${new Date(proc.date).toLocaleDateString('ar-EG')}</td>
                        </tr>
                    `;
                });

                html += buildTableHTML(
                    ['نوع الإجراء', 'اسم المريض', 'التأمين', 'القسم', 'الطبيب', 'التاريخ'],
                    rows, 'لا توجد إجراءات طبية مسجلة في هذه الفترة (أو الجدول فارغ/غير مبرمج بعد).'
                );
                html += `<div style="background: #f8fafc; padding: 15px; border: 1px solid #ccc; border-radius: 8px; text-align: left;"><h2 style="color: var(--primary-color);">إجمالي الإجراءات: ${count} إجراء</h2></div>`;
            }

            // --- تقرير التغذية ---
            else if (type === 'nutrition') {
                const records = await dbService.getAll('Nutrition') || [];
                let totalCost = 0;
                let rows = '';

                const filteredRecords = records.filter(r => {
                    const recDate = new Date(r.date);
                    return recDate >= fromDate && recDate <= toDate;
                });

                filteredRecords.forEach(r => {
                    const cost = parseFloat(r.cost) || 0;
                    totalCost += cost;
                    rows += `
                        <tr>
                            <td style="padding:10px; border: 1px solid #ccc;">${r.date}</td>
                            <td style="padding:10px; border: 1px solid #ccc;">${r.targetType}</td>
                            <td style="padding:10px; border: 1px solid #ccc;">${r.targetName}</td>
                            <td style="padding:10px; border: 1px solid #ccc;">${r.mealType}</td>
                            <td style="padding:10px; border: 1px solid #ccc; font-weight:bold; color:var(--danger-color);">${cost.toFixed(2)} $</td>
                        </tr>
                    `;
                });

                html += buildTableHTML(
                    ['التاريخ', 'المستفيد', 'الاسم', 'نوع الوجبة', 'التكلفة'],
                    rows, 'لا توجد سجلات إعاشة في هذه الفترة المطابقة للفلتر.'
                );
                html += `<div style="background: #fef2f2; padding: 15px; border: 1px solid #fecaca; border-radius: 8px; text-align: left;"><h2 style="color: var(--danger-color);">التكلفة الإجمالية للإعاشة: ${totalCost.toFixed(2)} $</h2></div>`;
            }

        } catch (error) {
             console.error("Error generating report", error);
             html += `<div style="color:red; text-align:center;">حدث خطأ أثناء استخراج البيانات.</div>`;
        }

        html += `
            <div style="margin-top:40px; text-align:left;">
                <p style="color:var(--text-muted); font-size:0.8rem;">تم استخراج التقرير بواسطة نظام مدينة الأقصى الطبية - بتاريخ: ${new Date().toLocaleString('ar-EG')}</p>
            </div>
        `;

        printArea.innerHTML = html;
    });

    // دالة مساعدة لرسم الجداول
    function buildTableHTML(headers, rows, emptyMsg) {
        let h = `<table style="width:100%; border-collapse:collapse; margin-bottom:20px; text-align:right;">
                    <tr style="background:#f1f5f9;">`;
        headers.forEach(head => h += `<th style="padding:10px; border: 1px solid #ccc;">${head}</th>`);
        h += `</tr>`;
        h += rows || `<tr><td colspan="${headers.length}" style="text-align:center; padding:15px;">${emptyMsg}</td></tr>`;
        h += `</table>`;
        return h;
    }

    // دالة الطباعة
    document.getElementById('btn-print-report').addEventListener('click', () => {
        const printContent = document.getElementById('printable-report').innerHTML;
        const originalContent = document.body.innerHTML;
        
        document.body.innerHTML = `
            <div style="padding:20px; font-family:'Cairo', sans-serif; direction:rtl;">
                ${printContent}
            </div>
            <!-- توقيع المبرمج في الطباعة أيضاً -->
            <footer style="text-align: center; padding: 10px; font-size: 0.8rem; color: #555; border-top: 1px solid #ccc; margin-top: 30px;">
                إعداد المهندس / وسيم همدان الإهنومي
            </footer>
        `;
        window.print();
        document.body.innerHTML = originalContent;
        location.reload(); 
    });
}
