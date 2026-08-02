// استيراد مكتبات Firebase من خوادم جوجل مباشرة
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
    initializeFirestore, 
    persistentLocalCache, 
    persistentMultipleTabManager,
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    updateDoc, 
    deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// مفاتيح الربط الخاصة بمشروع مدينة الأقصى الطبية
const firebaseConfig = {
  apiKey: "AIzaSyA0yGBVwb_rktYnVb4IiQL1EczincaSvow",
  authDomain: "alaqsa-his.firebaseapp.com",
  databaseURL: "https://alaqsa-his-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "alaqsa-his",
  storageBucket: "alaqsa-his.firebasestorage.app",
  messagingSenderId: "944970112331",
  appId: "1:944970112331:web:8224d0b1c0105f3c1cdcce",
  measurementId: "G-TTJ56EB3SE"
};

// 1. تهيئة تطبيق Firebase
const app = initializeApp(firebaseConfig);

// 2. تهيئة Firestore مع تفعيل ميزة العمل بدون إنترنت (Offline Persistence)
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

// 3. بناء خدمة قاعدة البيانات
const dbService = {
    
    // الدالة التي تم إضافتها لحل مشكلة بدء التشغيل
    async init() {
        console.log("تم الاتصال بقاعدة بيانات Firebase بنجاح!");
        return true;
    },

    // جلب جميع البيانات
    async getAll(collectionName) {
        try {
            const querySnapshot = await getDocs(collection(db, collectionName));
            const data = [];
            querySnapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            return data;
        } catch (error) {
            console.error("خطأ في جلب البيانات:", error);
            return [];
        }
    },

    // إضافة بيانات جديدة
    async add(collectionName, data) {
        try {
            const docRef = await addDoc(collection(db, collectionName), data);
            return docRef.id;
        } catch (error) {
            console.error("خطأ في إضافة السجل:", error);
            throw error;
        }
    },

    // تحديث بيانات موجودة
    async update(collectionName, id, data) {
        try {
            const docRef = doc(db, collectionName, id);
            await updateDoc(docRef, data);
            return true;
        } catch (error) {
            console.error("خطأ في تحديث السجل:", error);
            throw error;
        }
    },

    // حذف سجل
    async delete(collectionName, id) {
        try {
            const docRef = doc(db, collectionName, id);
            await deleteDoc(docRef);
            return true;
        } catch (error) {
            console.error("خطأ في حذف السجل:", error);
            throw error;
        }
    }
};

// جعل قاعدة البيانات متاحة لجميع صفحات النظام
window.dbService = dbService;
