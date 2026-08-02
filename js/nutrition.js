/**
 * Al-Aqsa Medical City - Nutrition & Meals Management Module
 * إدارة تكاليف وجبات المرضى والموظفين
 */
async function initNutritionModule() {
    const container = document.getElementById('router-view');
    if (!container) return;

    container.innerHTML = `
        <div class="page-header"><h1>إدارة التغذية والمطعم</h1></div>
        
        <div class="tabs-header">
            <button class="tab-btn active" onclick="switchNutriTab('records')">سجل الوجبات اليومي</button>
            <button class="tab-btn" onclick="switchNutriTab('reports')">التقارير وتكلفة الإعاشة</button>
        </div>

        <!-- تبويب سجل الوجبات -->
        <div id="tab-nutri-records" class="tab-content active">
            <div class="actions-bar">
                <button class="btn-primary" id="btn-add-meal">صرف وجبة جديدة</button>
            </div>
            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>التاريخ</th>
                            <th>المستفيد (النوع)</th>
                            <th>الاسم</th>
                            <th>نوع الوجبة</th>
                            <th>التكلفة ($)</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="nutri-table-body"></tbody>
                </table>
            </div>
        </div>

        <!-- تبويب التقارير المالية للتغذية -->
        <div id="tab-nutri-reports" class="tab-content">
            <div class="actions-bar" style="background:var(--surface-color); padding:20px; border-radius:8px; border:1px solid var(--border-color);">
                <div style="display:flex; gap:15px; align-items:flex-end; width:100%; flex-wrap: wrap;">
                    <div class="form-control" style="flex:1;"><label>من تاريخ:</label><input type="date" id="nutri-date-from"></div>
                    <div class="form-control" style="flex:1;"><label>إلى تاريخ:</label><input type="date" id="nutri-date-to"></div>
                    <button class="btn-primary" id="btn-calc-nutri" style="height: 42px;">استخراج تقرير التكلفة</button>
                </div>
            </div>
            
            <div class="dashboard-cards" style="margin-top: 20px;">
                <div class="stat-card">
                    <h3>إجمالي تكلفة وجبات المرضى</h3>
                    <div class="value" id="cost-patients" style="color: var(--secondary-color);">0.00 $</div>
                </div>
                <div class="stat-card">
                    <h3>إجمالي تكلفة وجبات الموظفين</h3>
                    <div class="value" id="cost-employees" style="color: var(--accent-color);">0.00 $</div>
                </div>
                <div class="stat-card" style="border-top-color: var(--danger-color);">
                    <h3>التكلفة الكلية للإعاشة</h3>
                    <div class="value" id="cost-total" style="color: var(--danger-color);">0.00 $</div>
                </div>
            </div>
        </div>

        <!-- نافذة صرف الوجبات -->
        <div id="nutri-modal" class="modal">
            <div class="modal-content">
                <span class="close-btn" id="close-nutri-modal">&times;</span>
                <h2 style="margin-bottom: 20px;">صرف وتسجيل وجبة</h2>
                <form id="nutri-form" class="form-grid">
                    <div class="form-control">
                        <label>تاريخ الصرف</label>
                        <input type="date" id="meal-date" required>
                    </div>
                    <div class="form-control">
                        <label>المستفيد</label>
                        <select id="meal-target-type" required>
                            <option value="مريض">مريض (Patient)</option>
                            <option value="موظف">موظف (Employee)</option>
                        </select>
                    </div>
                    <div class="form-control" style="grid-column: 1 / -1;">
                        <label>اسم الشخص المستفيد</label>
                        <select id="meal-target-name" required></select>
                    </div>
                    <div class="form-control">
                        <label>نوع الوجبة</label>
                        <select id="meal-type" required>
                            <option value="فطور">فطور</option>
                            <option value="غداء">غداء</option>
                            <option value="عشاء">عشاء</option>
                            <option value="وجبة خاصة (حمية)">وجبة خاصة (حمية)</option>
                            <option value="ضيافة">ضيافة</option>
                        </select>
                    </div>
                    <div class="form-control">
                        <label>التكلفة التقديرية (بالدولار)</label>
                        <input type="number" step="0.01" id="meal-cost" placeholder="مثال: 5.50" required>
                    </div>
                    <button type="submit" class="btn-primary" style="grid-column: 1 / -1; margin-top: 15px;">حفظ السجل</button>
                </form>
            </div>
        </div>
    `;

    // دالة التبديل بين التبويبات
    window.switchNutriTab = function(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        if(tab === 'records') {
            document.querySelector('.tabs-header button:nth-child(1)').classList.add('active');
            document.getElementById('tab-nutri-records').classList.add('active');
            loadNutritionRecords();
        } else {
            document.querySelector('.tabs-header button:nth-child(2)').classList.add('active');
            document.getElementById('tab-nutri-reports').classList.add('active');
        }
    };

    const modal = document.getElementById('nutri-modal');
    const form = document.getElementById('nutri-form');
    const typeSelect = document.getElementById('meal-target-type');
    const nameSelect = document.getElementById('meal-target-name');

    // تعبئة القائمة المنسدلة بالأسماء بناءً على النوع (مريض أم موظف)
    async function populateNames() {
        const type = typeSelect.value;
        let list = [];
        nameSelect.innerHTML = '<option value="">-- جاري التحميل --</option>';
        
        if (type === 'مريض') {
            list = await dbService.getAll('Patients') || [];
            nameSelect.innerHTML = '<option value="">اختر المريض...</option>';
        } else {
            list = await dbService.getAll('Employees') || [];
            const doctors = await dbService.getAll('Doctors') || [];
            list = list.concat(doctors); // دمج الموظفين والأطباء
            nameSelect.innerHTML = '<option value="">اختر الموظف/الطبيب...</option>';
        }

        list.forEach(person => {
            nameSelect.innerHTML += `<option value="${person.name}">${person.name}</option>`;
        });
    }

    typeSelect.addEventListener('change', populateNames);

    // تحميل وعرض السجلات
    async function loadNutritionRecords() {
        const records = await dbService.getAll('Nutrition') || [];
        const tbody = document.getElementById('nutri-table-body');
        tbody.innerHTML = '';
        
        // ترتيب تنازلي حسب التاريخ (الأحدث أولاً)
        records.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">لا توجد سجلات وجبات.</td></tr>';
            return;
        }

        records.forEach(r => {
            const cost = parseFloat(r.cost) || 0;
            tbody.innerHTML += `
                <tr>
                    <td>${r.date}</td>
                    <td><span style="background:${r.targetType==='مريض'?'#e0f2fe':'#fef3c7'}; padding:4px 8px; border-radius:4px; font-size:0.8rem;">${r.targetType}</span></td>
                    <td><strong>${r.targetName}</strong></td>
                    <td>${r.mealType}</td>
                    <td style="color:var(--danger-color); font-weight:bold;">${cost.toFixed(2)} $</td>
                    <td><button class="btn-sm btn-delete" onclick="deleteMeal(${r.id})">إلغاء</button></td>
                </tr>
            `;
        });
    }

    window.deleteMeal = async function(id) {
        if (confirm('هل أنت متأكد من حذف هذا السجل؟')) {
            await dbService.delete('Nutrition', id);
            loadNutritionRecords();
        }
    };

    // فتح النافذة
    document.getElementById('btn-add-meal').addEventListener('click', () => {
        form.reset();
        document.getElementById('meal-date').value = new Date().toISOString().split('T')[0];
        populateNames();
        modal.style.display = 'flex'; // لضمان التوسيط التام بفضل كود CSS الأخير
    });

    document.getElementById('close-nutri-modal').addEventListener('click', () => modal.style.display = 'none');

    // حفظ الوجبة
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            date: document.getElementById('meal-date').value,
            targetType: document.getElementById('meal-target-type').value,
            targetName: document.getElementById('meal-target-name').value,
            mealType: document.getElementById('meal-type').value,
            cost: document.getElementById('meal-cost').value
        };
        await dbService.save('Nutrition', data);
        modal.style.display = 'none';
        loadNutritionRecords();
    });

    // حساب التقارير
    document.getElementById('btn-calc-nutri').addEventListener('click', async () => {
        const from = document.getElementById('nutri-date-from').value;
        const to = document.getElementById('nutri-date-to').value;
        
        if (!from || !to) { alert('يرجى تحديد بداية ونهاية الفترة'); return; }

        const records = await dbService.getAll('Nutrition') || [];
        let costPatients = 0;
        let costEmps = 0;

        records.forEach(r => {
            if (r.date >= from && r.date <= to) {
                const amount = parseFloat(r.cost) || 0;
                if (r.targetType === 'مريض') {
                    costPatients += amount;
                } else {
                    costEmps += amount;
                }
            }
        });

        document.getElementById('cost-patients').textContent = costPatients.toFixed(2) + ' $';
        document.getElementById('cost-employees').textContent = costEmps.toFixed(2) + ' $';
        document.getElementById('cost-total').textContent = (costPatients + costEmps).toFixed(2) + ' $';
    });

    loadNutritionRecords();
}
