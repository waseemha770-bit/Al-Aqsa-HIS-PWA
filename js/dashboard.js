const dashboardModule = {
    async render() {
        const container = document.getElementById('router-view');
        if (!container) return;
        
        container.innerHTML = `
            <div style="padding: 20px;">
                <h2 style="color: var(--primary-color); margin-bottom: 20px;">لوحة التحكم والإحصائيات</h2>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <!-- بطاقة المرضى -->
                    <div class="card" style="padding: 20px; text-align: center; border-top: 4px solid #3b82f6; background: white; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                        <h3 style="color: #666; font-size: 1.1rem;">إجمالي المرضى</h3>
                        <p style="font-size: 2.5rem; font-weight: bold; color: #3b82f6; margin: 10px 0;" id="stat-patients">
                            <span style="font-size: 1rem; color: #ccc;">جاري التحميل...</span>
                        </p>
                    </div>
                    
                    <!-- بطاقة الأطباء -->
                    <div class="card" style="padding: 20px; text-align: center; border-top: 4px solid #10b981; background: white; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                        <h3 style="color: #666; font-size: 1.1rem;">الكادر الطبي</h3>
                        <p style="font-size: 2.5rem; font-weight: bold; color: #10b981; margin: 10px 0;" id="stat-doctors">
                            <span style="font-size: 1rem; color: #ccc;">جاري التحميل...</span>
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        // تشغيل دالة جلب الأرقام من القاعدة
        await this.loadStats();
    },

    async loadStats() {
        try {
            // جلب البيانات من السحابة لعدّها
            const patients = await dbService.getAll('Patients');
            const doctors = await dbService.getAll('Doctors');
            
            // تحديث الأرقام في الواجهة
            const patientsEl = document.getElementById('stat-patients');
            const doctorsEl = document.getElementById('stat-doctors');
            
            if(patientsEl) patientsEl.innerText = patients.length;
            if(doctorsEl) doctorsEl.innerText = doctors.length;
            
        } catch (error) {
            console.error("خطأ في تحميل الإحصائيات:", error);
        }
    }
};

// تسجيل الكائن ليعمل مع نظام التوجيه
window.dashboardModule = dashboardModule;
