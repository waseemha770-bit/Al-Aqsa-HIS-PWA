async function initDoctorsModule() {
    // تحديث المحتوى داخل المسار (Route) في app.js
    const container = document.getElementById('router-view'); 
    
    container.innerHTML = `
        <div class="page-header">
            <h1 data-label="doctors">الأطباء</h1>
        </div>
        <div class="actions-bar">
            <button class="btn-primary" id="btn-add-doctor">إضافة طبيب</button>
            <input type="text" id="search-doctor" placeholder="بحث باسم الطبيب أو التخصص...">
        </div>
        <table class="data-table">
            <thead>
                <tr>
                    <th>اسم الطبيب</th>
                    <th>التخصص</th>
                    <th>رقم الهاتف</th>
                    <th>الإجراءات</th>
                </tr>
            </thead>
            <tbody id="doctors-table-body"></tbody>
        </table>

        <!-- نافذة إضافة طبيب -->
        <div id="doctor-modal" class="modal" style="display: none;">
            <div class="modal-content">
                <span class="close-btn" id="close-doctor-modal">&times;</span>
                <h2>بيانات الطبيب</h2>
                <form id="doctor-form" class="form-grid">
                    <input type="hidden" id="d-id">
                    <div class="form-control">
                        <label>اسم الطبيب</label>
                        <input type="text" id="d-name" required>
                    </div>
                    <div class="form-control">
                        <label>التخصص</label>
                        <input type="text" id="d-specialty" required>
                    </div>
                    <div class="form-control">
                        <label>رقم الهاتف</label>
                        <input type="text" id="d-phone" required>
                    </div>
                    <button type="submit" class="btn-primary" style="grid-column: 1 / -1; margin-top: 15px;">حفظ</button>
                </form>
            </div>
        </div>
    `;

    labelManager.applyLabels(container);

    // المنطق البرمجي (CRUD)
    const tbody = document.getElementById('doctors-table-body');
    const modal = document.getElementById('doctor-modal');
    let doctorsList = [];

    // تأكد من وجود جدول الأطباء، وإلا سيتم إنشاؤه في النسخة القادمة، 
    // ملاحظة: تأكد من إضافة if (!db.objectStoreNames.contains('Doctors')) { db.createObjectStore('Doctors', { keyPath: 'id', autoIncrement: true }); } في database.js
    
    async function loadDoctors(search = '') {
        doctorsList = await dbService.getAll('Doctors') || [];
        tbody.innerHTML = '';
        const filtered = doctorsList.filter(d => d.name.includes(search) || d.specialty.includes(search));
        
        filtered.forEach(doc => {
            tbody.innerHTML += `
                <tr>
                    <td>${doc.name}</td>
                    <td>${doc.specialty}</td>
                    <td>${doc.phone}</td>
                    <td>
                        <button class="btn-sm btn-delete" data-id="${doc.id}">حذف</button>
                    </td>
                </tr>
            `;
        });
    }

    await loadDoctors();

    document.getElementById('btn-add-doctor').addEventListener('click', () => {
        document.getElementById('doctor-form').reset();
        document.getElementById('d-id').value = '';
        modal.style.display = 'flex';
    });

    document.getElementById('close-doctor-modal').addEventListener('click', () => modal.style.display = 'none');
    document.getElementById('search-doctor').addEventListener('input', (e) => loadDoctors(e.target.value));

    document.getElementById('doctor-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await dbService.save('Doctors', {
            name: document.getElementById('d-name').value,
            specialty: document.getElementById('d-specialty').value,
            phone: document.getElementById('d-phone').value
        });
        modal.style.display = 'none';
        await loadDoctors();
    });

    tbody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('btn-delete')) {
            if(confirm('حذف الطبيب؟')) {
                const id = parseInt(e.target.getAttribute('data-id'));
                const tx = dbService.db.transaction(['Doctors'], 'readwrite');
                tx.objectStore('Doctors').delete(id);
                tx.oncomplete = () => loadDoctors();
            }
        }
    });
}
