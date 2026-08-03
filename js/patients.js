const patientsModule = {
    async render() {
        const container = document.getElementById('router-view');
        if (!container) return;

        // 1. تصميم الواجهة والنافذة المنبثقة
        container.innerHTML = `
            <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20px;">
                <h2 style="color: var(--primary-color);">شؤون المرضى والملف الطبي</h2>
                <button id="btn-open-modal" class="btn-primary">تسجيل مريض جديد</button>
            </div>
            
            <div class="card" style="padding: 20px; overflow-x: auto;">
                <table class="data-table" style="width: 100%; border-collapse: collapse; text-align: right; background: white;">
                    <thead style="background-color: var(--border-color);">
                        <tr>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">رقم الملف</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">اسم المريض</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">العمر</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">الجنس</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">رقم الهاتف</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">تاريخ التسجيل</th>
                        </tr>
                    </thead>
                    <tbody id="patients-tbody">
                        <tr><td colspan="6" style="text-align: center; padding: 20px;">جاري تحميل بيانات المرضى...</td></tr>
                    </tbody>
                </table>
            </div>

            <!-- 2. النافذة المنبثقة للإضافة (Modal) -->
            <div id="add-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 1000; justify-content: center; align-items: center; direction: rtl; backdrop-filter: blur(3px);">
                <div id="modal-content" style="background: white; padding: 25px; border-radius: 10px; width: 90%; max-width: 500px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); position: relative;">
                    
                    <!-- ترويسة النافذة مع زر الإغلاق X -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">
                        <h3 style="margin: 0; color: var(--primary-color); font-size: 1.3rem;">تسجيل مريض جديد</h3>
                        <button type="button" id="btn-close-x" style="background: transparent; border: none; font-size: 1.8rem; color: #ef4444; cursor: pointer; line-height: 1;">&times;</button>
                    </div>
                    
                    <form id="add-form">
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #334155;">اسم المريض الرباعي</label>
                            <input type="text" id="input-name" required style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 1rem;">
                        </div>
                        
                        <div style="display: flex; gap: 15px; margin-bottom: 15px;">
                            <div style="flex: 1;">
                                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #334155;">العمر</label>
                                <input type="number" id="input-age" required style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 1rem;">
                            </div>
                            <div style="flex: 1;">
                                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #334155;">الجنس</label>
                                <select id="input-gender" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 1rem;">
                                    <option value="ذكر">ذكر</option>
                                    <option value="أنثى">أنثى</option>
                                </select>
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 25px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #334155;">رقم الهاتف</label>
                            <input type="tel" id="input-phone" required style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 1rem;">
                        </div>
                        
                        <div style="display: flex; gap: 10px; justify-content: flex-end; border-top: 2px solid #f1f5f9; padding-top: 15px;">
                            <button type="button" id="btn-close-modal" style="padding: 10px 20px; background: #f8fafc; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; cursor: pointer; font-weight: bold;">إلغاء</button>
                            <button type="submit" id="btn-save" style="padding: 10px 25px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">حفظ البيانات</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        this.setupEvents();
        await this.loadData();
    },

    setupEvents() {
        const modal = document.getElementById('add-modal');
        const modalContent = document.getElementById('modal-content');
        const openBtn = document.getElementById('btn-open-modal');
        const closeXBtn = document.getElementById('btn-close-x');
        const closeBtn = document.getElementById('btn-close-modal');
        const form = document.getElementById('add-form');
        const saveBtn = document.getElementById('btn-save');

        // دالة لإغلاق النافذة
        const closeModal = () => {
            modal.style.display = 'none';
            form.reset();
        };

        // أوامر الفتح والإغلاق
        openBtn.addEventListener('click', () => { modal.style.display = 'flex'; });
        closeXBtn.addEventListener('click', closeModal);
        closeBtn.addEventListener('click', closeModal);

        // الإغلاق عند الضغط خارج النافذة
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // أمر إرسال البيانات
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            
            saveBtn.innerText = 'جاري الحفظ...';
            saveBtn.disabled = true;

            const newPatientData = {
                fileNumber: Math.floor(Math.random() * 10000) + 1000, 
                name: document.getElementById('input-name').value,
                age: document.getElementById('input-age').value,
                gender: document.getElementById('input-gender').value,
                phone: document.getElementById('input-phone').value,
                date: new Date().toLocaleDateString('ar-EG') 
            };

            try {
                // إرسال البيانات للسحابة
                await dbService.add('Patients', newPatientData);
                
                // تحديث الواجهة
                closeModal();
                await this.loadData();
                alert("تم تسجيل المريض بنجاح!");
                
            } catch (error) {
                console.error("خطأ أثناء الإضافة:", error);
                // رسالة توضح سبب الخطأ الفعلي
                alert("فشل الحفظ! يرجى التأكد من صلاحيات قاعدة البيانات (Firebase Rules) أو الاتصال بالإنترنت.");
            } finally {
                saveBtn.innerText = 'حفظ البيانات';
                saveBtn.disabled = false;
            }
        });
    },

    async loadData() {
        try {
            const tbody = document.getElementById('patients-tbody');
            const rawData = await dbService.getAll('Patients'); 
            
            if (!rawData || rawData.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #64748b;">لا يوجد مرضى مسجلين حالياً</td></tr>';
                return;
            }

            tbody.innerHTML = ''; 
            rawData.forEach((item) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="padding: 12px; border-bottom: 1px solid #f1f5f9;"><strong>${item.fileNumber || "-"}</strong></td>
                    <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: bold;">${item.name || "-"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #f1f5f9;">${item.age || "-"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #f1f5f9;">${item.gender || "-"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #f1f5f9;" dir="ltr">${item.phone || "-"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; color: #64748b;">${item.date || "-"}</td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error("خطأ في تحميل المرضى:", error);
        }
    }
};

window.patientsModule = patientsModule;
