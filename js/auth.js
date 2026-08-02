/**
 * Al-Aqsa Medical City - Authentication & Permissions Module
 * تم التحديث: إضافة شاشة ترحيب (Splash Screen) جذابة قبل الدخول للحفاظ على السرية والفخامة
 */
const authManager = {
    async init() {
        // 1. الإخفاء الإجباري للواجهة الرئيسية كطبقة حماية إضافية
        const appContainer = document.getElementById('app-container');
        if (appContainer) appContainer.style.display = 'none';

        const currentUser = sessionStorage.getItem('loggedUser');
        if (!currentUser) {
            this.showLoginScreen();
        } else {
            this.applyPermissions(JSON.parse(currentUser));
        }
    },

    showLoginScreen() {
        let overlay = document.getElementById('login-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'login-overlay';
            
            // تصميم نافذة الدخول وشاشة الترحيب مع حركات CSS المدمجة (Animations)
            overlay.innerHTML = `
                <style>
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    @keyframes pulse { 
                        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4); } 
                        70% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(37, 99, 235, 0); } 
                        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); } 
                    }
                    .fade-out { opacity: 0; pointer-events: none; }
                    .fade-in { opacity: 1 !important; pointer-events: auto; }
                </style>

                <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: var(--bg-color); display: flex; justify-content: center; align-items: center; z-index: 99999; padding: 20px; overflow-y: auto; flex-direction: column;">
                    
                    <!-- 1. شاشة الترحيب والتحميل (Splash Screen) -->
                    <div id="splash-screen" style="text-align: center; transition: opacity 0.6s ease-in-out; display: flex; flex-direction: column; align-items: center;">
                        <img id="splash-logo" src="assets/images/default-logo.png" 
                             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMjU2M2ViIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTEyIDJ2MjBNMiAxMmgyMCIvPjwvc3ZnPg=='" 
                             style="max-width: 120px; height: auto; margin-bottom: 30px; border-radius: 50%; border: 3px solid var(--border-color); padding: 5px; background: white; animation: pulse 2s infinite;">
                        
                        <h2 style="color: var(--primary-color); font-size: 1.8rem; margin-bottom: 12px; font-weight: 800;">مرحبا بكم في بوابة مدينة الأقصى الطبية</h2>
                        <p style="color: var(--text-muted); font-size: 1.1rem; margin-bottom: 30px;">جاري تهيئة بيئة العمل الآمنة...</p>
                        
                        <div style="width: 45px; height: 45px; border: 4px solid var(--border-color); border-top: 4px solid var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                    </div>

                    <!-- 2. نافذة تسجيل الدخول الفعلية (مخفية في البداية) -->
                    <div id="login-box-container" style="display: none; opacity: 0; transition: opacity 0.8s ease-in-out; width: 100%; max-width: 420px; position: absolute;">
                        <div class="login-box" style="background: var(--surface-color); padding: 35px 30px; border-radius: var(--border-radius-lg); box-shadow: var(--shadow-lg); text-align: center; border: 1px solid var(--border-color);">
                            <div class="login-header">
                                <img id="login-logo" src="assets/images/default-logo.png" 
                                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMjU2M2ViIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTEyIDJ2MjBNMiAxMmgyMCIvPjwvc3ZnPg=='" 
                                     alt="شعار المؤسسة" 
                                     style="max-width: 80px; height: auto; margin-bottom: 10px; border-radius: 50%; border: 2px solid var(--border-color); box-shadow: var(--shadow-sm); background: white; padding: 5px;">
                                <h3 data-label="medical_city_name" style="margin-bottom: 20px; color: var(--primary-color);">مدينة الأقصى الطبية</h3>
                            </div>
                            <form id="login-form">
                                <div class="form-control" style="text-align: right; margin-bottom: 15px;">
                                    <label style="font-weight: bold; font-size: 0.95rem;">اسم المستخدم</label>
                                    <input type="text" id="login-username" required style="width: 100%; padding: 12px; margin-top: 5px; border: 1px solid var(--border-color); border-radius: 6px;">
                                </div>
                                <div class="form-control" style="text-align: right; margin-bottom: 25px;">
                                    <label style="font-weight: bold; font-size: 0.95rem;">كلمة المرور</label>
                                    <input type="password" id="login-password" required style="width: 100%; padding: 12px; margin-top: 5px; border: 1px solid var(--border-color); border-radius: 6px;">
                                </div>
                                <button type="submit" class="btn-primary" style="width: 100%; padding: 12px; font-size: 1.1rem; justify-content: center;">تسجيل الدخول</button>
                            </form>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            // تطبيق الشعار المخصص (إن وجد) على نافذة الدخول وشاشة الترحيب
            setTimeout(async () => {
                if(typeof dbService !== 'undefined') {
                    const brandingInfo = await dbService.get('Branding', 'main_identity');
                    if (brandingInfo && brandingInfo.logoBase64) {
                        const sLogo = document.getElementById('splash-logo');
                        const lLogo = document.getElementById('login-logo');
                        if (sLogo) sLogo.src = brandingInfo.logoBase64;
                        if (lLogo) lLogo.src = brandingInfo.logoBase64;
                    }
                }
            }, 100);

            // منطق الانتقال السلس من شاشة الترحيب إلى شاشة الدخول بعد 2.5 ثانية
            setTimeout(() => {
                const splash = document.getElementById('splash-screen');
                const loginBox = document.getElementById('login-box-container');
                
                if (splash && loginBox) {
                    splash.classList.add('fade-out'); // إخفاء الترحيب
                    
                    setTimeout(() => {
                        splash.style.display = 'none';
                        loginBox.style.display = 'block'; // تفعيل عنصر تسجيل الدخول
                        
                        // استخدام setTimeout إضافي صغير لضمان تفعيل متصفح الويب لحركة الظهور (Fade in)
                        setTimeout(() => {
                            loginBox.classList.add('fade-in');
                        }, 50);
                    }, 600); // الانتظار حتى تنتهي حركة الاختفاء
                }
            }, 2500); // مدة عرض شاشة الترحيب (2.5 ثانية)

            // عملية التحقق من بيانات الدخول
            document.getElementById('login-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const user = document.getElementById('login-username').value;
                const pass = document.getElementById('login-password').value;

                const usersDB = await dbService.getAll('Users') || [];
                const validUser = usersDB.find(u => u.username === user && u.password === pass);

                // حساب الطوارئ
                if (usersDB.length === 0 && user === 'admin' && pass === 'admin') {
                     const adminUser = { 
                         username: 'مدير النظام', 
                         department: 'الإدارة العليا', 
                         modules: ['dashboard','patients','doctors','appointments','departments','laboratory','pharmacy','invoices','insurance','employees','hr_services','nutrition','permissions','reports','settings'] 
                     };
                     sessionStorage.setItem('loggedUser', JSON.stringify(adminUser));
                     overlay.style.display = 'none';
                     this.applyPermissions(adminUser);
                     return;
                }

                if (validUser) {
                    sessionStorage.setItem('loggedUser', JSON.stringify(validUser));
                    overlay.style.display = 'none';
                    this.applyPermissions(validUser);
                    
                    const dashLink = document.querySelector('a[data-route="dashboard"]');
                    if (dashLink) dashLink.click();
                } else {
                    alert('عذراً، اسم المستخدم أو كلمة المرور غير صحيحة!');
                }
            });
        } else {
            overlay.style.display = 'block';
        }
    },

    applyPermissions(user) {
         // 2. إظهار الواجهة الرئيسية للبرنامج فقط بعد نجاح تسجيل الدخول
         const appContainer = document.getElementById('app-container');
         if (appContainer) appContainer.style.display = 'flex';

         // تطبيق الصلاحيات وإخفاء الشاشات غير المصرح بها
         const links = document.querySelectorAll('#main-nav ul li a[data-route]');
         links.forEach(link => {
             const route = link.getAttribute('data-route');
             if (user.modules && user.modules.includes(route)) {
                 link.parentElement.style.display = 'block';
             } else {
                 link.parentElement.style.display = 'none';
             }
         });
         
         const logoutBtn = document.getElementById('btn-logout');
         if(logoutBtn) logoutBtn.parentElement.style.display = 'block';
         
         const welcomeMsg = document.querySelector('[data-label="welcome_message"]');
         if(welcomeMsg) {
             welcomeMsg.textContent = `مرحباً بك، ${user.username} (${user.department || 'إدارة'})`;
         }
    },

    logout() {
        sessionStorage.removeItem('loggedUser');
        location.reload();
    }
};

// تشغيل النظام فوراً لإخفاء الواجهة وعرض الدخول قبل أي شيء آخر
authManager.init();
