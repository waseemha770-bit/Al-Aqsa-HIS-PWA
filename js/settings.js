const settingsModule = {
    async render() {
        const container = document.getElementById('router-view');
        if (!container) return;

        container.innerHTML = `
            <div class="page-header" style="padding: 20px;">
                <h2 style="color: var(--primary-color);">إعدادات النظام</h2>
            </div>
            
            <div style="padding: 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                <!-- إعدادات المستشفى -->
                <div class="card" style="padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px;">بيانات المنشأة الطبية</h3>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px;">اسم المستشفى</label>
                        <input type="text" value="مدينة الأقصى الطبية" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px;">رقم الهاتف (للطوارئ)</label>
                        <input type="text" placeholder="أدخل رقم الهاتف" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                    </div>
                    <button class="btn-primary" style="width: 100%;" onclick="alert('تم حفظ الإعدادات بنجاح')">حفظ التغييرات</button>
                </div>

                <!-- النسخ الاحتياطي والصيانة -->
                <div class="card" style="padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px;">قاعدة البيانات والنسخ الاحتياطي</h3>
                    <p style="color: #666; font-size: 0.9em; margin-bottom: 20px;">النظام متصل حالياً بخوادم Firebase السحابية. يتم الحفظ تلقائياً.</p>
                    
                    <button class="btn-secondary" style="width: 100%; margin-bottom: 10px; background: #10b981; color: white; border: none; padding: 10px; border-radius: 4px; cursor: pointer;">
                        تصدير نسخة احتياطية (JSON)
                    </button>
                    <button class="btn-secondary" style="width: 100%; background: #ef4444; color: white; border: none; padding: 10px; border-radius: 4px; cursor: pointer;">
                        مسح الذاكرة المؤقتة (Clear Cache)
                    </button>
                </div>
            </div>
        `;
    }
};

window.settingsModule = settingsModule;
