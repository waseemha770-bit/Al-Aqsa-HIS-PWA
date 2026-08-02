async function initPharmacyModule() {
    const container = document.getElementById('router-view');
    if (!container) return;

    // بناء الواجهة الخاصة بالصيدلية
    container.innerHTML = `
        <div class="page-header">
            <h1 data-label="pharmacy">الصيدلية وإدارة الأدوية</h1>
        </div>
        <div class="actions-bar">
            <button class="btn-primary" id="btn-add-medicine" data-label="add_medicine">إضافة دواء جديد</button>
            <input type="text" id="search-medicine" placeholder="بحث باسم الدواء...">
        </div>
        <table class="data-table">
            <thead>
                <tr>
                    <th data-label="medicine_name">اسم الدواء</th>
                    <th data-label="quantity">الكمية المتوفرة</th>
                    <th data-label="expiry_date">تاريخ الانتهاء</th>
                    <th data-label="status">الحالة</th>
                    <th data-label="actions">الإجراءات</th>
                </tr>
            </thead>
            <tbody id="pharmacy-table-body"></tbody>
        </table>

        <!-- نافذة إضافة/تعديل دواء -->
        <div id="medicine-modal" class="modal" style="display: none;">
            <div class="modal-content">
                <span class="close-btn" id="close-medicine-modal">&times;</span>
                <h2 id="medicine-modal-title">بيانات الدواء</h2>
                <form id="medicine-form" class="form-grid">
                    <input type="hidden" id="m-id">
                    <div class="form-control">
                        <label>اسم الدواء</label>
                        <input type="text" id="m-name" required>
                    </div>
                    <div class="form-control">
                        <label>الكمية</label>
                        <input type="number" id="m-qty" required min="0">
                    </div>
                    <div class="form-control">
                        <label>تاريخ الانتهاء</label>
                        <input type="date" id="m-expiry" required>
                    </div>
                    <button type="submit" class="btn-primary" style="grid-column: 1 / -1; margin-top: 15px;">حفظ في المخزون</button>
                </form>
            </div>
        </div>
    `;

    labelManager.applyLabels(container);

    const tbody = document.getElementById('pharmacy-table-body');
    const modal = document.getElementById('medicine-modal');
    const form = document.getElementById('medicine-form');
    let medicinesList = [];

    // دالة عرض الأدوية مع فحص الحالة
    async function loadMedicines(search = '') {
        medicinesList = await dbService.getAll('Medicines') || [];
        tbody.innerHTML = '';
        
        const filtered = medicinesList.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));
        
        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">لا توجد أدوية في المخزون</td></tr>`;
            return;
        }

        const today = new Date();

        filtered.forEach(med => {
            const expDate = new Date(med.expiryDate);
            let status = '<span style="color: green; font-weight: bold;">متاح</span>';
            let rowStyle = '';

            // فحص تاريخ الانتهاء والكمية
            if (expDate < today) {
                status = '<span style="color: red; font-weight: bold;">منتهي الصلاحية!</span>';
                rowStyle = 'background-color: #ffe6e6;';
            } else if (parseInt(med.quantity) < 10) {
                status = '<span style="color: #ff9800; font-weight: bold;">كمية منخفضة</span>';
            }

            tbody.innerHTML += `
                <tr style="${rowStyle}">
                    <td>${med.name}</td>
                    <td>${med.quantity}</td>
                    <td>${med.expiryDate}</td>
                    <td>${status}</td>
                    <td>
                        <button class="btn-sm btn-edit" data-id="${med.id}">تعديل</button>
                        <button class="btn-sm btn-delete" data-id="${med.id}">حذف</button>
                    </td>
                </tr>
            `;
        });
    }

    await loadMedicines();

    // الأحداث (Events)
    document.getElementById('btn-add-medicine').addEventListener('click', () => {
        form.reset();
        document.getElementById('m-id').value = '';
        document.getElementById('medicine-modal-title').textContent = 'إضافة دواء جديد';
        modal.style.display = 'flex';
    });

    document.getElementById('close-medicine-modal').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    document.getElementById('search-medicine').addEventListener('input', (e) => loadMedicines(e.target.value));

    // حفظ الدواء
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('m-id').value;
        const medData = {
            name: document.getElementById('m-name').value,
            quantity: document.getElementById('m-qty').value,
            expiryDate: document.getElementById('m-expiry').value
        };
        if (id) medData.id = parseInt(id);

        await dbService.save('Medicines', medData);
        modal.style.display = 'none';
        await loadMedicines();
    });

    // التعديل والحذف
    tbody.addEventListener('click', async (e) => {
        const id = parseInt(e.target.getAttribute('data-id'));
        if (e.target.classList.contains('btn-edit')) {
            const med = medicinesList.find(m => m.id === id);
            if (med) {
                document.getElementById('m-id').value = med.id;
                document.getElementById('m-name').value = med.name;
                document.getElementById('m-qty').value = med.quantity;
                document.getElementById('m-expiry').value = med.expiryDate;
                document.getElementById('medicine-modal-title').textContent = 'تعديل بيانات الدواء';
                modal.style.display = 'flex';
            }
        } else if (e.target.classList.contains('btn-delete')) {
            if (confirm('هل أنت متأكد من حذف هذا الدواء نهائياً؟')) {
                await dbService.delete('Medicines', id);
                await loadMedicines();
            }
        }
    });
}
