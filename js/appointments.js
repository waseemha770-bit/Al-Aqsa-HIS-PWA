/**
 * Al-Aqsa Medical City - Appointments Module
 * إدارة المواعيد، ربط المرضى بالأطباء، وتتبع حالة الموعد
 */

async function initAppointmentsModule() {
    const container = document.getElementById('router-view');
    if (!container) return;

    // 1. بناء واجهة المستخدم
    container.innerHTML = `
        <div class="page-header">
            <h1 data-label="appointments">نظام المواعيد والحجوزات</h1>
        </div>
        
        <div class="actions-bar">
            <button class="btn-primary" id="btn-add-appointment" data-label="add_appointment">حجز موعد جديد</button>
            <div style="display: flex; gap: 10px;">
                <input type="date" id="filter-date" title="تصفية حسب التاريخ">
                <input type="text" id="search-appointment" placeholder="بحث باسم المريض أو الطبيب...">
            </div>
        </div>

        <table class="data-table">
            <thead>
                <tr>
                    <th>رقم الموعد</th>
                    <th>اسم المريض</th>
                    <th>الطبيب المعالج</th>
                    <th>وقت وتاريخ الموعد</th>
                    <th>الحالة</th>
                    <th>الإجراءات</th>
                </tr>
            </thead>
            <tbody id="appointments-table-body"></tbody>
        </table>

        <!-- نافذة إضافة/تعديل موعد -->
        <div id="appointment-modal" class="modal" style="display: none;">
            <div class="modal-content">
                <span class="close-btn" id="close-appointment-modal">&times;</span>
                <h2 id="appointment-modal-title">حجز موعد جديد</h2>
                <form id="appointment-form" class="form-grid">
                    <input type="hidden" id="apt-id">
                    
                    <div class="form-control">
                        <label>المريض</label>
                        <select id="apt-patient" required></select>
                    </div>
                    
                    <div class="form-control">
                        <label>الطبيب المعالج (العيادة)</label>
                        <select id="apt-doctor" required></select>
                    </div>
                    
                    <div class="form-control">
                        <label>تاريخ ووقت الموعد</label>
                        <input type="datetime-local" id="apt-datetime" required>
                    </div>

                    <div class="form-control">
                        <label>حالة الموعد</label>
                        <select id="apt-status">
                            <option value="جديد">جديد (قيد الانتظار)</option>
                            <option value="مؤكد">مؤكد</option>
                            <option value="مكتمل">مكتمل</option>
                            <option value="ملغي">ملغي</option>
                        </select>
                    </div>

                    <button type="submit" class="btn-primary" style="grid-column: 1 / -1; margin-top: 15px;">حفظ الموعد</button>
                </form>
            </div>
        </div>
    `;

    // تطبيق المسميات الديناميكية
    labelManager.applyLabels(container);

    const tbody = document.getElementById('appointments-table-body');
    const modal = document.getElementById('appointment-modal');
    const form = document.getElementById('appointment-form');
    
    // قوائم الربط
    const patientSelect = document.getElementById('apt-patient');
    const doctorSelect = document.getElementById('apt-doctor');

    let appointmentsList = [];
    let patientsList = [];
    let doctorsList = [];

    // ==========================================
    // 2. الدوال المساعدة لجلب البيانات
    // ==========================================

    async function populateDropdowns() {
        // جلب المرضى
        patientsList = await dbService.getAll('Patients') || [];
        patientSelect.innerHTML = '<option value="" disabled selected>-- اختر المريض --</option>';
        patientsList.forEach(p => {
            patientSelect.innerHTML += `<option value="${p.id}">${p.name} (رقم: ${p.medicalNumber})</option>`;
        });

        // جلب الأطباء
        doctorsList = await dbService.getAll('Doctors') || [];
        doctorSelect.innerHTML = '<option value="" disabled selected>-- اختر الطبيب --</option>';
        doctorsList.forEach(d => {
            doctorSelect.innerHTML += `<option value="${d.id}">د. ${d.name} (${d.specialty})</option>`;
        });
    }

    // دالة لتنسيق حالة الموعد بألوان مختلفة
    function getStatusBadge(status) {
        let bgColor = '#6c757d'; // Default (gray)
        if (status === 'جديد') bgColor = '#007bff'; // Blue
        if (status === 'مؤكد') bgColor = '#28a745'; // Green
        if (status === 'ملغي') bgColor = '#dc3545'; // Red
        if (status === 'مكتمل') bgColor = '#343a40'; // Dark Gray

        return `<span style="background-color: ${bgColor}; color: white; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold;">${status}</span>`;
    }

    // ==========================================
    // 3. جلب وعرض البيانات (CRUD)
    // ==========================================

    async function loadAppointments() {
        appointmentsList = await dbService.getAll('Appointments') || [];
        
        // تطبيق الفلاتر (البحث النصي وفلتر التاريخ)
        const searchTerm = document.getElementById('search-appointment').value.toLowerCase();
        const filterDate = document.getElementById('filter-date').value;

        tbody.innerHTML = '';
        
        const filtered = appointmentsList.filter(apt => {
            const patient = patientsList.find(p => p.id === parseInt(apt.patientId));
            const doctor = doctorsList.find(d => d.id === parseInt(apt.doctorId));
            
            const pName = patient ? patient.name.toLowerCase() : '';
            const dName = doctor ? doctor.name.toLowerCase() : '';
            
            const matchSearch = pName.includes(searchTerm) || dName.includes(searchTerm);
            
            // استخراج تاريخ اليوم فقط من حقل datetime-local
            const aptDateOnly = apt.date.split('T')[0];
            const matchDate = filterDate ? (aptDateOnly === filterDate) : true;

            return matchSearch && matchDate;
        });

        // ترتيب المواعيد من الأحدث للأقدم
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">لا توجد مواعيد تطابق البحث</td></tr>`;
            return;
        }

        filtered.forEach(apt => {
            const patient = patientsList.find(p => p.id === parseInt(apt.patientId));
            const doctor = doctorsList.find(d => d.id === parseInt(apt.doctorId));
            
            const patientName = patient ? patient.name : '<span style="color:red">مريض محذوف</span>';
            const doctorName = doctor ? `د. ${doctor.name}` : '<span style="color:red">طبيب محذوف</span>';
            
            // تنسيق التاريخ والوقت ليظهر بشكل جميل
            const dateObj = new Date(apt.date);
            const formattedDateTime = dateObj.toLocaleDateString('ar-EG') + ' - ' + dateObj.toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'});

            tbody.innerHTML += `
                <tr>
                    <td>#${apt.id}</td>
                    <td><strong>${patientName}</strong></td>
                    <td>${doctorName}</td>
                    <td dir="ltr" style="text-align: right;">${formattedDateTime}</td>
                    <td>${getStatusBadge(apt.status)}</td>
                    <td>
                        <button class="btn-sm btn-edit" data-id="${apt.id}">تعديل</button>
                        <button class="btn-sm btn-delete" data-id="${apt.id}">حذف</button>
                    </td>
                </tr>
            `;
        });
    }

    // التهيئة الأساسية
    await populateDropdowns();
    await loadAppointments();

    // ==========================================
    // 4. الأحداث (Events)
    // ==========================================

    // زر إضافة موعد جديد
    document.getElementById('btn-add-appointment').addEventListener('click', () => {
        if(patientsList.length === 0 || doctorsList.length === 0) {
            alert("تنبيه: يجب إضافة طبيب ومريض واحد على الأقل في النظام لتتمكن من حجز موعد.");
            return;
        }
        form.reset();
        document.getElementById('apt-id').value = '';
        document.getElementById('appointment-modal-title').textContent = 'حجز موعد جديد';
        modal.style.display = 'flex';
    });

    document.getElementById('close-appointment-modal').addEventListener('click', () => modal.style.display = 'none');
    
    // أحداث الفلترة والبحث
    document.getElementById('search-appointment').addEventListener('input', loadAppointments);
    document.getElementById('filter-date').addEventListener('change', loadAppointments);

    // حفظ الموعد (إضافة أو تعديل)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('apt-id').value;
        const aptData = {
            patientId: document.getElementById('apt-patient').value,
            doctorId: document.getElementById('apt-doctor').value,
            date: document.getElementById('apt-datetime').value,
            status: document.getElementById('apt-status').value
        };

        if (id) aptData.id = parseInt(id);

        await dbService.save('Appointments', aptData);
        modal.style.display = 'none';
        await loadAppointments();
    });

    // أحداث الجدول (تعديل وحذف)
    tbody.addEventListener('click', async (e) => {
        const id = parseInt(e.target.getAttribute('data-id'));
        
        if (e.target.classList.contains('btn-edit')) {
            const apt = appointmentsList.find(a => a.id === id);
            if (apt) {
                document.getElementById('apt-id').value = apt.id;
                document.getElementById('apt-patient').value = apt.patientId;
                document.getElementById('apt-doctor').value = apt.doctorId;
                document.getElementById('apt-datetime').value = apt.date;
                document.getElementById('apt-status').value = apt.status;
                
                document.getElementById('appointment-modal-title').textContent = 'تعديل بيانات الموعد';
                modal.style.display = 'flex';
            }
        } 
        else if (e.target.classList.contains('btn-delete')) {
            if (confirm('هل أنت متأكد من حذف هذا الموعد نهائياً؟')) {
                await dbService.delete('Appointments', id);
                await loadAppointments();
            }
        }
    });
}
