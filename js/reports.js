// كائن صفحة التقارير الشاملة
const reportsModule = {
    // 1. رسم الواجهة (تحتوي على أزرار التصدير والاستيراد)
    async render() {
        const container = document.getElementById('router-view');
        if (!container) return;

        container.innerHTML = `
            <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20px; flex-wrap: wrap; gap: 10px;">
                <h2 style="color: var(--primary-color);">التقارير الشاملة</h2>
                
                <div style="display: flex; gap: 10px;">
                    <!-- زر الاستيراد -->
                    <button id="btn-import-reports-excel" class="btn-secondary" style="display: flex; align-items: center; gap: 8px; background-color: #10b981; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        استيراد البيانات
                    </button>
                    <!-- مدخل الملف المخفي -->
                    <input type="file" id="file-import-reports-excel" accept=".xlsx, .xls" style="display: none;">

                    <!-- زر التصدير -->
                    <button id="btn-export-reports-excel" class="btn-primary" style="display: flex; align-items: center; gap: 8px;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="8" y1="13" x2="16" y2="13"></line>
                            <line x1="8" y1="17" x2="16" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                        تصدير لإكسل
                    </button>
                </div>
            </div>
            
            <!-- جدول عرض البيانات -->
            <div class="card" style="padding: 20px; overflow-x: auto;">
                <table class="data-table" style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background-color: var(--border-color);">
                        <tr>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">الرقم</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">اسم المريض</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">رقم الهاتف</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">العمر</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">الجنس</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">تاريخ التسجيل</th>
                        </tr>
                    </thead>
                    <tbody id="reports-tbody">
                        <tr><td colspan="6" style="text-align: center; padding: 20px;">جاري تحميل البيانات...</td></tr>
                    </tbody>
                </table>
            </div>
        `;

        await this.loadData();
    },

    // 2. جلب البيانات وعرضها
    async loadData() {
        try {
            const tbody = document.getElementById('reports-tbody');
            const rawData = await dbService.getAll('Patients');
            
            if (!rawData || rawData.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">لا توجد بيانات لعرضها في التقرير حالياً</td></tr>';
                return;
            }

            tbody.innerHTML = ''; 

            rawData.forEach((item, index) => {
                const tr = document.createElement('tr');
                const genderStr = item.gender === 'male' ? 'ذكر' : (item.gender === 'female' ? 'أنثى' : '-');
                
                tr.innerHTML = `
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${index + 1}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name || item.fullName || "غير محدد"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.phone || "-"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.age || "-"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${genderStr}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.date || item.createdAt || "-"}</td>
                `;
                tbody.appendChild(tr);
            });

        } catch (error) {
            console.error("خطأ في تحميل التقارير:", error);
        }
    }
};

window.reportsModule = reportsModule;

// =========================================================================
// 3. مستمع الأحداث (للتصدير والاستيراد) يعمل بنظام التفويض (Event Delegation)
// =========================================================================
document.addEventListener('click', async function(event) {
    
    // ----------- أ. عملية التصدير (Export) -----------
    if (event.target && (event.target.id === 'btn-export-reports-excel' || event.target.closest('#btn-export-reports-excel'))) {
        event.preventDefault();
        try {
            const rawData = await dbService.getAll('Patients'); 
            if (!rawData || rawData.length === 0) {
                alert('لا توجد بيانات لتصديرها!');
                return;
            }

            const formattedData = rawData.map((item, index) => {
                return {
                    "الرقم": index + 1,
                    "اسم المريض": item.name || item.fullName || "",
                    "رقم الهاتف": item.phone || "",
                    "العمر": item.age || "",
                    "الجنس": item.gender === 'male' ? 'ذكر' : (item.gender === 'female' ? 'أنثى' : ''),
                    "تاريخ التسجيل": item.date || item.createdAt || ""
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(formattedData);
            const wscols = [{wch: 8}, {wch: 25}, {wch: 15}, {wch: 10}, {wch: 10}, {wch: 15}];
            worksheet['!cols'] = wscols;

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "البيانات");
            
            const today = new Date();
            const fileName = `Exported_Data_${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}.xlsx`;
            XLSX.writeFile(workbook, fileName);
            
        } catch (error) {
            console.error("خطأ التصدير:", error);
            alert("حدث خطأ أثناء التصدير.");
        }
    }

    // ----------- ب. تشغيل نافذة الاستيراد (Import) -----------
    if (event.target && (event.target.id === 'btn-import-reports-excel' || event.target.closest('#btn-import-reports-excel'))) {
        event.preventDefault();
        const fileInput = document.getElementById('file-import-reports-excel');
        if (fileInput) fileInput.click();
    }
});

// ----------- ج. معالجة ملف الإكسل المرفوع (Read File & Save to DB) -----------
document.addEventListener('change', function(event) {
    if (event.target && event.target.id === 'file-import-reports-excel') {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                
                // تحويل الورقة إلى بيانات
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                
                if(jsonData.length === 0) {
                    alert('ملف الإكسل فارغ!');
                    return;
                }

                // حفظ البيانات في قاعدة البيانات
                let successCount = 0;
                for(let item of jsonData) {
                    // ترجمة الأسماء العربية من الإكسل إلى إنجليزية لقاعدة البيانات
                    const dbItem = {
                        name: item["اسم المريض"] || item["الاسم"] || "بدون اسم",
                        phone: item["رقم الهاتف"] || item["الهاتف"] || "",
                        age: item["العمر"] || "",
                        gender: (item["الجنس"] === 'ذكر') ? 'male' : 'female',
                        date: item["تاريخ التسجيل"] || item["التاريخ"] || new Date().toISOString().split('T')[0]
                    };
                    
                    await dbService.add('Patients', dbItem);
                    successCount++;
                }
                
                alert(`تم استيراد ${successCount} سجل بنجاح!`);
                
                // تحديث الجدول فوراً ليرى المستخدم البيانات الجديدة
                if(window.reportsModule) {
                    window.reportsModule.loadData();
                }
                
                event.target.value = ''; // مسح الملف للتمكن من رفع غيره
                
            } catch (error) {
                console.error("خطأ الاستيراد:", error);
                alert("حدث خطأ في قراءة ملف الإكسل. تأكد من أن الملف غير تالف.");
            }
        };
        reader.readAsArrayBuffer(file);
    }
});
