/**
 * Al-Aqsa Medical City - Branding & Identity Manager
 * مسؤول عن تطبيق الهوية المحفوظة في قاعدة البيانات
 */
const brandingManager = {
    async init() {
        try {
            await this.applyIdentity();
        } catch (e) {
            console.warn("Branding system waiting for DB initialization...");
        }
    },

    async applyIdentity() {
        const brandingInfo = await dbService.get('Branding', 'main_identity');
        if (!brandingInfo) return; 

        // 1. تغيير اسم المستشفى
        if (brandingInfo.appName) {
            document.title = brandingInfo.appName;
            const titleElements = document.querySelectorAll('[data-label="medical_city_name"]');
            titleElements.forEach(el => {
                if (el.tagName === 'TITLE') el.innerText = brandingInfo.appName;
                else el.textContent = brandingInfo.appName;
            });
        }

        // 2. تغيير الشعار (Logo) في القائمة الجانبية وفي نافذة الدخول
        if (brandingInfo.logoBase64) {
            const logoEl = document.getElementById('hospital-logo');
            const loginLogoEl = document.getElementById('login-logo'); // تم إضافة استهداف صورة الدخول
            
            if (logoEl) logoEl.src = brandingInfo.logoBase64;
            if (loginLogoEl) loginLogoEl.src = brandingInfo.logoBase64;
        }

        // 3. تغيير أيقونة المتصفح (Favicon)
        if (brandingInfo.faviconBase64) {
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.href = brandingInfo.faviconBase64;
        }
    },

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }
};

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
}
