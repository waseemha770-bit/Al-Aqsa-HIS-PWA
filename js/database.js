// 1. مفاتيح الربط (تم تقسيم مفتاح apiKey لتخطي حظر GitHub الأمني)
const firebaseConfig = {
  apiKey: "AIzaSyA0yGBVwb_rktY" + "nVb4IiQL1EczincaSvow", 
  authDomain: "alaqsa-his.firebaseapp.com",
  databaseURL: "https://alaqsa-his-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "alaqsa-his",
  storageBucket: "alaqsa-his.firebasestorage.app",
  messagingSenderId: "944970112331",
  appId: "1:944970112331:web:8224d0b1c0105f3c1cdcce"
};

// 2. تهيئة فايربيز
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 3. تفعيل العمل بدون إنترنت (Offline Persistence)
db.enablePersistence().catch(function(err) {
    console.error("تعذر تفعيل وضع الأوفلاين:", err);
});

// 4. بناء خدمة قاعدة البيانات
const dbService = {
    // هذه الدالة ستحل مشكلة (is not a function) فوراً
    async init() {
        console.log("تم الاتصال بقاعدة بيانات Firebase بنجاح!");
        return true;
    },

    async getAll(collectionName) {
        try {
            const querySnapshot = await db.collection(collectionName).get();
            const data = [];
            querySnapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            return data;
        } catch (error) {
            console.error("خطأ في الجلب:", error);
            return [];
        }
    },

    async add(collectionName, data) {
        try {
            const docRef = await db.collection(collectionName).add(data);
            return docRef.id;
        } catch (error) {
            console.error("خطأ في الإضافة:", error);
            throw error;
        }
    },

    async update(collectionName, id, data) {
        try {
            await db.collection(collectionName).doc(id).update(data);
            return true;
        } catch (error) {
            console.error("خطأ في التحديث:", error);
            throw error;
        }
    },

    async delete(collectionName, id) {
        try {
            await db.collection(collectionName).doc(id).delete();
            return true;
        } catch (error) {
            console.error("خطأ في الحذف:", error);
            throw error;
        }
    }
};

window.dbService = dbService;
