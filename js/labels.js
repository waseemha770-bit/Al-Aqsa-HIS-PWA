class LabelManager {
    constructor() {
        this.cache = {};
        this.defaultLabels = {
            'medical_city_name': 'مدينة الأقصى الطبية',
            'dashboard_title': 'لوحة التحكم',
            'patients': 'المرضى',
            'doctors': 'الأطباء',
            'settings': 'الإعدادات',
            'welcome_message': 'مرحباً بك في النظام',
            'toggle_theme': 'تبديل المظهر'
        };
    }

    async init() {
        const storedLabels = await dbService.getAll('Settings');
        
        if (storedLabels.length === 0) {
            // إدخال المسميات الافتراضية لأول مرة
            for (const [key, value] of Object.entries(this.defaultLabels)) {
                await dbService.save('Settings', { key, value, category: 'general' });
                this.cache[key] = value;
            }
        } else {
            storedLabels.forEach(label => {
                this.cache[label.key] = label.value;
            });
        }
        
        this.applyLabels();
    }

    applyLabels(container = document) {
        const elements = container.querySelectorAll('[data-label]');
        elements.forEach(el => {
            const key = el.getAttribute('data-label');
            if (this.cache[key]) {
                // إذا كان العنصر Input نغير الـ Placeholder
                if(el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = this.cache[key];
                } else {
                    el.textContent = this.cache[key];
                }
            }
        });
    }
}

const labelManager = new LabelManager();
