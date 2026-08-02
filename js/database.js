/**
 * Al-Aqsa Medical City Portal - Database Layer (IndexedDB - Final Version 6)
 * مسؤول عن إنشاء الجداول والتواصل المحلي مع قاعدة البيانات
 */

class MedicalDatabase {
    constructor() {
        this.dbName = 'AlAqsaDB';
        this.dbVersion = 6; // الإصدار السادس الشامل لكل جداول النظام
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                console.log("جاري ترقية هيكل قاعدة البيانات...");

                // جميع جداول النظام شاملة التحديثات الأخيرة
                const stores = [
                    'Settings', 'Branding', 'Users', 'Doctors', 'Employees',
                    'Patients', 'MedicalRecords', 'Insurance', 'Appointments',
                    'LabResults', 'Radiology', 'Medicines', 'Invoices',
                    'Departments', 'Leaves', 'Complaints', 'Memos', 'Permissions', 'Attendance',
                    'Nutrition', 'Admissions' 
                ];

                stores.forEach(store => {
                    if (!db.objectStoreNames.contains(store)) {
                        db.createObjectStore(store, { keyPath: 'id', autoIncrement: true });
                    }
                });
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onerror = (event) => reject(event.target.errorCode);
        });
    }

    async save(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAll(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async get(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async delete(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    async clearAll(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }
}

// تصدير كائن واحد للاستخدام العام في كامل النظام
const dbService = new MedicalDatabase();
