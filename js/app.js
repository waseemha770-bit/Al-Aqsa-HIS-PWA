/**
 * Al-Aqsa Medical City Portal - Main Application File (Ultimate Edition)
 * المشغل النهائي للنظام، المسؤول عن التهيئة والتوجيه بين جميع الوحدات (SPA)
 */

document.addEventListener('DOMContentLoaded', async () => {
    const routerView = document.getElementById('router-view');
    const links = document.querySelectorAll('a[data-route]');
    
    // ==========================================
    // 1. مرحلة التهيئة (Initialization)
    // ==========================================
    try {
        console.log("جاري تهيئة نظام مدينة الأقصى الطبية...");
        
        await dbService.init();          // تهيئة قاعدة البيانات وإنشاء جميع الجداول
        await labelManager.init();       // تهيئة نظام المسميات الديناميكية
        await brandingManager.init();    // تهيئة الهوية البصرية والألوان

        console.log("تمت تهيئة النظام بنجاح.");
    } catch (error) {
        console.error("حدث خطأ حرج أثناء تهيئة النظام:", error);
        routerView.innerHTML = `
            <div style="color: #dc3545; padding: 30px; text-align: center; background: #f8d7da; border-radius: 8px; margin: 20px;">
                <h2>فشل في بدء تشغيل النظام!</h2>
                <p>يرجى التأكد من تفعيل IndexedDB في المتصفح.</p>
                <code>${error}</code>
            </div>`;
        return; 
    }

    // ==========================================
    // 2. إدارة الواجهة العامة والتفاعلات (UI Controls)
    // ==========================================
    
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => brandingManager.toggleTheme());
    }

    // تفعيل زر إخفاء/إظهار الشريط الجانبي (تحسباً لاستخدام النظام على أجهزة مختلفة مستقبلاً)
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
    }

    const toggleSidebarBtn = document.getElementById('toggle-sidebar');
    const sidebar = document.getElementById('sidebar');

    if (toggleSidebarBtn && sidebar) {
        const toggleMenu = () => {
            sidebar.classList.toggle('mobile-visible');
            overlay.classList.toggle('active');
        };

        toggleSidebarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        overlay.addEventListener('click', () => {
            sidebar.classList.remove('mobile-visible');
            overlay.classList.remove('active');
        });
    }

    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof authManager !== 'undefined' && authManager.logout) {
                authManager.logout();
            } else {
                alert('تم تسجيل الخروج.');
                location.reload();
            }
        });
    }

    // ==========================================
    // 3. نظام التوجيه (SPA Router)
    // ==========================================
    
    const routes = {
        'dashboard': `<div class="dashboard-cards"><p style="padding: 20px;">جاري تحميل لوحة التحكم العليا...</p></div>`,
        'appointments': `<p style="padding: 20px;">جاري تحميل نظام المواعيد...</p>`,
        'patients': `<div id="patients-module-container"><p style="padding: 20px;">جاري تحميل نظام شؤون المرضى والملف الطبي...</p></div>`,
        'doctors': `<p style="padding: 20px;">جاري تحميل نظام الأطباء...</p>`,
        'departments': `<p style="padding: 20px;">جاري تحميل نظام الأقسام...</p>`,
        'laboratory': `<p style="padding: 20px;">جاري تحميل نظام المختبر...</p>`,
        'pharmacy': `<p style="padding: 20px;">جاري تحميل نظام الصيدلية...</p>`,
        'invoices': `<p style="padding: 20px;">جاري تحميل نظام الفواتير...</p>`,
        'insurance': `<p style="padding: 20px;">جاري تحميل نظام التأمين...</p>`,
        'employees': `<p style="padding: 20px;">جاري تحميل نظام الموارد البشرية...</p>`,
        'hr_services': `<p style="padding: 20px;">جاري تحميل بوابة خدمات الموظفين والمذكرات...</p>`,
        'nutrition': `<p style="padding: 20px;">جاري تحميل نظام إدارة التغذية والمطعم...</p>`,
        'permissions': `<p style="padding: 20px;">جاري تحميل نظام المستخدمين والصلاحيات...</p>`,
        'reports': `<p style="padding: 20px;">جاري تحضير نظام التقارير والإحصائيات...</p>`,
        'settings': `<p style="padding: 20px;">جاري تحميل الإعدادات...</p>`
    };

    function navigateTo(route) {
        if (routes[route]) {
            // إخفاء القائمة في حال كانت مفتوحة عبر الزر
            if (sidebar && sidebar.classList.contains('mobile-visible')) {
                sidebar.classList.remove('mobile-visible');
                overlay.classList.remove('active');
            }

            // 1. حقن المحتوى الأساسي للواجهة
            routerView.innerHTML = routes[route];
            
            // 2. تحديث الرابط النشط في القائمة الجانبية
            links.forEach(link => link.classList.remove('active'));
            const activeLink = document.querySelector(`a[data-route="${route}"]`);
            if (activeLink) activeLink.classList.add('active');

            // 3. تشغيل الدوال البرمجية (Modules) الخاصة بالصفحة المختارة
            if (route === 'dashboard' && typeof initDashboardModule === 'function') {
                initDashboardModule();
            } else if (route === 'settings' && typeof initSettingsModule === 'function') {
                initSettingsModule();
            } else if (route === 'patients' && typeof initPatientsModule === 'function') {
                initPatientsModule();
            } else if (route === 'doctors' && typeof initDoctorsModule === 'function') {
                initDoctorsModule();
            } else if (route === 'departments' && typeof initDepartmentsModule === 'function') {
                initDepartmentsModule();
            } else if (route === 'appointments' && typeof initAppointmentsModule === 'function') {
                initAppointmentsModule();
            } else if (route === 'pharmacy' && typeof initPharmacyModule === 'function') {
                initPharmacyModule();
            } else if (route === 'laboratory' && typeof initLaboratoryModule === 'function') {
                initLaboratoryModule();
            } else if (route === 'invoices' && typeof initInvoicesModule === 'function') {
                initInvoicesModule();
            } else if (route === 'insurance' && typeof initInsuranceModule === 'function') {
                initInsuranceModule();
            } else if (route === 'employees' && typeof initEmployeesModule === 'function') {
                initEmployeesModule();
            } else if (route === 'hr_services' && typeof initHRServicesModule === 'function') {
                initHRServicesModule();
            } else if (route === 'nutrition' && typeof initNutritionModule === 'function') {
                initNutritionModule();
            } else if (route === 'permissions' && typeof initPermissionsModule === 'function') {
                initPermissionsModule();
            } else if (route === 'reports' && typeof initReportsModule === 'function') {
                initReportsModule();
            }
            
            // 4. تطبيق المسميات الديناميكية فوراً على الواجهة الجديدة
            if (typeof labelManager !== 'undefined') {
                setTimeout(() => labelManager.applyLabels(routerView), 50); 
            }

        } else {
            routerView.innerHTML = `
                <div style="text-align: center; padding: 100px;">
                    <h1 style="font-size: 4rem; color: var(--primary-color);">404</h1>
                    <h2>الصفحة غير موجودة.</h2>
                </div>
            `;
        }
    }

    // تفعيل التنقل عند النقر على القائمة
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); 
            const target = e.target.closest('a[data-route]');
            if (target) {
                const route = target.getAttribute('data-route');
                navigateTo(route);
            }
        });
    });

    // ==========================================
    // 4. تحميل الصفحة الافتراضية
    // ==========================================
    setTimeout(() => {
        navigateTo('dashboard');
    }, 150);
});
