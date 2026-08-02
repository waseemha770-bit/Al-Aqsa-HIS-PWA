document.addEventListener('DOMContentLoaded', () => {
    
    // ----------------------------------------------------
    // 1. أزرار التحكم (القائمة الجانبية والمظهر)
    // ----------------------------------------------------
    
    // زر فتح/إغلاق القائمة الجانبية
    const toggleBtn = document.getElementById('toggle-sidebar');
    const sidebar = document.getElementById('sidebar');
    if(toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active'); // للهواتف
            sidebar.classList.toggle('collapsed'); // للشاشات الكبيرة
        });
    }

    // زر الوضع الليلي/النهاري
    const themeBtn = document.getElementById('theme-toggle');
    if(themeBtn) {
        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            themeBtn.textContent = isDark ? '☀️' : '🌙';
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
        
        // استعادة المظهر المحفوظ مسبقاً
        if(localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-mode');
            themeBtn.textContent = '☀️';
        }
    }

    // زر تسجيل الخروج
    const logoutBtn = document.getElementById('btn-logout');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if(window.authManager) {
                window.authManager.logout();
            } else {
                sessionStorage.removeItem('loggedUser');
                location.reload();
            }
        });
    }

    // ----------------------------------------------------
    // 2. نظام التوجيه (SPA Router) - التنقل بين الصفحات
    // ----------------------------------------------------
    const links = document.querySelectorAll('#main-nav a[data-route]');
    const routerView = document.getElementById('router-view');

    function navigateTo(route) {
        // تحديد الرابط النشط في القائمة الجانبية
        links.forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`#main-nav a[data-route="${route}"]`);
        if(activeLink) activeLink.classList.add('active');

        // استدعاء الشاشة المطلوبة بناءً على الضغطة
        if (route === 'reports' && window.reportsModule) {
            window.reportsModule.render();
        } 
        else if (route === 'patients' && window.patientsModule) {
            window.patientsModule.render(); 
        } 
        else {
            // شاشة افتراضية للأقسام التي لم تبرمج بعد
            routerView.innerHTML = `
                <div style="padding: 30px; text-align: center; background: var(--surface-color); border-radius: 8px; margin: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                    <h2 style="color: var(--primary-color);">شاشة ${activeLink ? activeLink.innerText : route}</h2>
                    <p style="color: var(--text-muted); margin-top: 15px; font-size: 1.1rem;">
                        جاري العمل على بناء وبرمجة هذه الشاشة وسيتم تفعيلها قريباً بإذن الله...
                    </p>
                </div>
            `;
        }
        
        // إغلاق القائمة الجانبية تلقائياً في شاشات الهواتف بعد اختيار القسم
        if (window.innerWidth <= 768 && sidebar) {
            sidebar.classList.remove('active');
        }
    }

    // الاستماع لضغطات المستخدم على أزرار القائمة الجانبية
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const route = link.getAttribute('data-route');
            navigateTo(route);
        });
    });

    // تشغيل شاشة "لوحة التحكم" كشاشة افتراضية عند فتح النظام
    navigateTo('dashboard');
});
