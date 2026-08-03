const patientsModule = {
    async render() {
        const container = document.getElementById('router-view');
        if (!container) return;

        // 1. تصميم الواجهة (الجدول + النافذة المنبثقة المخفية)
        container.innerHTML = `
            <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20px;">
                <h2 style="color: var(--primary-color);">شؤون المرضى والملف الطبي</h2>
                <!-- زر فتح نافذة الإضافة -->
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

            <!-- 2. النافذة المنبثقة للإضافة (Modal) - مخفية افتراضياً -->
            <div id="add-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; direction: rtl;">
                <div style="background: white; padding: 30px; border-radius: 8px; width: 90%; max-width: 500px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                    <h3 style="margin-bottom: 20px; color: var(--primary-color); border-bottom: 1px solid #eee; padding-bottom: 10px;">تسجيل مريض جديد</h3>
                    
                    <form id="add-form">
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">اسم المريض الرباعي</label>
                            <input type="text" id="input-name" required style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
                        </div>
                        
                        <div style="display: flex; gap: 15px; margin-bottom: 15px;">
                            <div style="flex: 1;">
                                <label style="display: block; margin-bottom: 5px; font-weight: bold;">العمر</label>
                                <input type="number" id="input-age" required style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
                            </div>
                            <div style="flex: 1;">
                                <label style="display: block; margin-bottom: 5px; font-weight: bold;">الجنس</label>
                                <select id="input-gender" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
                                    <option value="ذكر">ذكر</option>
                                    <option value="أنثى">أنثى</option>
                                </select>
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 25px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">رقم الهاتف</label>
                            <input type="tel" id="input-phone" required style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
                        </div>
                        
                        <div style="display: flex; gap: 10px; justify-content: flex-end;">
                            <button type="button" id="btn-close-modal" style="padding: 10px 20px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; cursor: pointer;">إلغاء</button>
                            <button type="submit" id="btn-save" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">حفظ البيانات</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // تفعيل الأحداث وجلب البيانات
        this.setupEvents();
        await this.loadData();
    },

    setupEvents() {
        const modal = document.getElementById('add-modal');
        const openBtn = document.getElementById('btn-open-modal');
        const closeBtn = document.getElementById('btn-close-modal');
        const form = document.getElementById('add-form');
        const saveBtn = document.getElementById('btn-save');

        // أمر فتح النافذة
        openBtn.addEventListener('click', () => {
            form.reset(); // تفريغ الحقول القديمة
            modal.style.display = 'flex';
        });

        // أمر إغلاق النافذة
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // أمر إرسال البيانات لقاعدة Firebase
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); // منع إعادة تحميل الصفحة
            
            // تحويل الزر لوضع التحميل لمنع الضغط المتكرر
            saveBtn.innerText = 'جاري الحفظ...';
            saveBtn.disabled = true;

            // 1. تجميع البيانات من الحقول
            const newPatientData = {
                fileNumber: Math.floor(Math.random() * 10000) + 1000, // توليد رقم ملف عشوائي
                name: document.getElementById('input-name').value,
                age: document.getElementById('input-age').value,
                gender: document.getElementById('input-gender').value,
                phone: document.getElementById('input-phone').value,
                date: new Date().toLocaleDateString('ar-EG') // تاريخ اليوم
            };

            try {
                // 2. إرسالها للسحابة باستخدام ملف database.js
                await dbService.add('Patients', newPatientData);
                
                // 3. إخفاء النافذة وتحديث الجدول فوراً
                modal.style.display = 'none';
                await this.loadData();
                
            } catch (error) {
                console.error("خطأ أثناء الإضافة:", error);
                alert("حدث خطأ في الاتصال بقاعدة البيانات!");
            } finally {
                // إعادة الزر لشكله الطبيعي
                saveBtn.innerText = 'حفظ البيانات';
                saveBtn.disabled = false;
            }
        });
    },

    async loadData() {
        try {
            const tbody = document.getElementById('patients-tbody');
            // جلب البيانات من السحابة
            const rawData = await dbService.getAll('Patients'); 
            
            if (!rawData || rawData.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">لا يوجد مرضى مسجلين حالياً</td></tr>';
                return;
            }

            tbody.innerHTML = ''; 

            rawData.forEach((item) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="padding: 12px; border-bottom: 1px solid #eee;"><strong>${item.fileNumber || "-"}</strong></td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name || "-"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.age || "-"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.gender || "-"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.phone || "-"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; color: #666;">${item.date || "-"}</td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error("خطأ في تحميل المرضى:", error);
        }
    }
};

window.patientsModule = patientsModule;
