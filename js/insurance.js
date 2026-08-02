/**
 * Al-Aqsa Medical City - Insurance Companies Module
 */
async function initInsuranceModule() {
    const container = document.getElementById('router-view');
    if (!container) return;

    container.innerHTML = `
        <div class="page-header"><h1 data-label="insurance">شركات التأمين الصحي</h1></div>
        <div class="actions-bar">
            <button class="btn-primary" id="btn-add-insurance">إضافة شركة تأمين</button>
            <input type="text" id="search-insurance" placeholder="بحث باسم الشركة...">
        </div>
        <table class="data-table">
            <thead>
                <tr>
                    <th>اسم الشركة</th>
                    <th>رقم التواصل</th>
                    <th>نسبة التغطية (%)</th>
                    <th>الحالة</th>
                    <th>الإجراءات</th>
                </tr>
            </thead>
            <tbody id="insurance-table-body"></tbody>
        </table>

        <div id="insurance-modal" class="modal">
            <div class="modal-content">
                <span class="close-btn" id="close-insurance-modal">&times;</span>
                <h2 id="insurance-modal-title">بيانات شركة التأمين</h2>
                <form id="insurance-form" class="form-grid">
                    <input type="hidden" id="ins-id">
                    <div class="form-control">
                        <label>اسم شركة التأمين</label><input type="text" id="ins-name" required>
                    </div>
                    <div class="form-control">
                        <label>نسبة التغطية الأساسية (%)</label><input type="number" id="ins-coverage" min="0" max="100" required>
                    </div>
                    <div class="form-control">
                        <label>رقم التواصل</label><input type="text" id="ins-phone" required>
                    </div>
                    <div class="form-control">
                        <label>حالة التعاقد</label>
                        <select id="ins-status"><option value="فعال">فعال</option><option value="موقوف">موقوف</option></select>
                    </div>
                    <button type="submit" class="btn-primary" style="grid-column: 1 / -1; margin-top: 15px;">حفظ الشركة</button>
                </form>
            </div>
        </div>
    `;

    labelManager.applyLabels(container);
    const tbody = document.getElementById('insurance-table-body');
    const modal = document.getElementById('insurance-modal');
    const form = document.getElementById('insurance-form');
    let insuranceList = [];

    async function loadInsurance() {
        insuranceList = await dbService.getAll('Insurance') || [];
        tbody.innerHTML = '';
        insuranceList.forEach(ins => {
            const statusStyle = ins.status === 'فعال' ? 'color: green; font-weight:bold;' : 'color: red; font-weight:bold;';
            tbody.innerHTML += `
                <tr>
                    <td><strong>${ins.name}</strong></td>
                    <td dir="ltr" style="text-align: right;">${ins.phone}</td>
                    <td>${ins.coverage}%</td>
                    <td style="${statusStyle}">${ins.status}</td>
                    <td>
                        <button class="btn-sm btn-edit" data-id="${ins.id}">تعديل</button>
                        <button class="btn-sm btn-delete" data-id="${ins.id}">حذف</button>
                    </td>
                </tr>
            `;
        });
    }

    await loadInsurance();

    document.getElementById('btn-add-insurance').addEventListener('click', () => { form.reset(); document.getElementById('ins-id').value = ''; modal.style.display = 'flex'; });
    document.getElementById('close-insurance-modal').addEventListener('click', () => modal.style.display = 'none');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('ins-id').value;
        const insData = { name: document.getElementById('ins-name').value, coverage: document.getElementById('ins-coverage').value, phone: document.getElementById('ins-phone').value, status: document.getElementById('ins-status').value };
        if (id) insData.id = parseInt(id);
        await dbService.save('Insurance', insData);
        modal.style.display = 'none'; await loadInsurance();
    });

    tbody.addEventListener('click', async (e) => {
        const id = parseInt(e.target.getAttribute('data-id'));
        if (e.target.classList.contains('btn-delete')) { if(confirm('حذف الشركة؟')) { await dbService.delete('Insurance', id); loadInsurance(); } }
    });
}
