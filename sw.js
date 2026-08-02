const CACHE_NAME = 'alaqsa-his-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/style.css',
    './js/database.js',
    './js/labels.js',
    './js/branding.js',
    './js/auth.js',
    './js/dashboard.js',
    './js/settings.js',
    './js/patients.js',
    './js/doctors.js',
    './js/departments.js',
    './js/appointments.js',
    './js/pharmacy.js',
    './js/laboratory.js',
    './js/invoices.js',
    './js/insurance.js',
    './js/employees.js',
    './js/hr_services.js',
    './js/permissions.js',
    './js/nutrition.js',
    './js/reports.js',
    './js/app.js',
    'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];

// تثبيت الـ Service Worker وحفظ الملفات
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// تفعيل وتحديث الكاش القديم
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// جلب الملفات (أولاً من الكاش، وإذا لم توجد من الإنترنت)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
