const reportsModule = {
    async render() {
        const container = document.getElementById('router-view');
        if (!container) return;

        container.innerHTML = `
            <div class="page-header" style="padding: 20px;">
                <h2 style="color: var(--primary-color);">التقارير الشاملة وتصدير البيانات</h2>
                <p style="color: #666; margin-top: 10px;">استخراج تقارير المستشفى بصيغة Excel لمراجعتها أو طباعتها.</p>
            </div>
            
            <div style="padding: 20px; display: flex; flex-wrap: wrap; gap: 15px;">
                <div class="card" style="padding: 20px; flex: 1; min-width: 250px; text-align: center; background: white; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <h3 style="margin-bottom: 15px;">تقرير المرضى</h3>
                    <button class="btn-primary" onclick="alert('جاري تفعيل مكتبة التصدير...')" style="width: 100%; background: #10b981;">تصدير إلى Excel 📊</button>
                </div>

                <div class="card" style="padding: 20px; flex: 1; min-width: 250px; text-align: center; background: white; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <h3 style="margin-bottom: 15px;">التقرير المالي والفواتير</h3>
                    <button class="btn-primary" onclick="alert('جاري تفعيل مكتبة التصدير...')" style="width: 100%; background: #3b82f6;">تصدير إلى Excel 📊</button>
                </div>

                <div class="card" style="padding: 20px; flex: 1; min-width: 250px; text-align: center; background: white; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <h3 style="margin-bottom: 15px;">تقرير جرد الصيدلية</h3>
                    <button class="btn-primary" onclick="alert('جاري تفعيل مكتبة التصدير...')" style="width: 100%; background: #8b5cf6;">تصدير إلى Excel 📊</button>
                </div>
            </div>
        `;
    }
};

window.reportsModule = reportsModule;
