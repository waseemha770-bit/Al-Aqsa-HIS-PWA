const CACHE_NAME = 'alaqsa-his-v6'; // تم تحديث الإصدار لإجبار المتصفح على التحديث

// نكتفي بالملفات الأساسية المضمونة لتجنب انهيار عملية التثبيت
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/app.js'
];

// عملية التثبيت (Install)
self.addEventListener('install', (event) => {
    self.skipWaiting(); // تفعيل التحديث فوراً دون انتظار
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Opened cache');
            return cache.addAll(ASSETS_TO_CACHE);
        }).catch(err => console.error('فشل في حفظ بعض الملفات، لكن النظام سيستمر:', err))
    );
});

// عملية التفعيل (Activate) وتنظيف الذاكرة القديمة
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
    self.clients.claim();
});

// استراتيجية: الشبكة أولاً، وإذا انقطع الإنترنت نستخدم الذاكرة المخبأة (Network First)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
